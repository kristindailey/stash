"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { getDemoUserId } from "@/lib/db/get-user-id";
import {
	createItem as createItemQuery,
	deleteItem as deleteItemQuery,
	updateItem as updateItemQuery,
	type ItemDetail,
} from "@/lib/db/items";

export const CREATABLE_TYPES = [
	"snippet",
	"prompt",
	"command",
	"note",
	"link",
] as const;

export type CreatableType = (typeof CREATABLE_TYPES)[number];

export type ActionResult<T> =
	| { success: true; data: T }
	| { success: false; error: string };

const nullableTrimmedString = z
	.string()
	.transform((value) => value.trim())
	.transform((value) => (value.length === 0 ? null : value))
	.nullable();

const itemFieldsShape = {
	title: z
		.string()
		.transform((value) => value.trim())
		.refine((value) => value.length > 0, { message: "Title is required" }),
	description: nullableTrimmedString.optional().default(null),
	content: nullableTrimmedString.optional().default(null),
	url: z
		.union([z.string().url({ message: "Invalid URL" }), z.literal("")])
		.transform((value) => (value === "" ? null : value))
		.nullable()
		.optional()
		.default(null),
	language: nullableTrimmedString.optional().default(null),
	tags: z
		.array(z.string())
		.transform((tags) =>
			Array.from(
				new Set(tags.map((tag) => tag.trim()).filter((tag) => tag.length > 0)),
			),
		)
		.optional()
		.default([]),
};

const updateItemSchema = z.object(itemFieldsShape);

export type UpdateItemInput = z.input<typeof updateItemSchema>;

const createItemSchema = z
	.object({ type: z.enum(CREATABLE_TYPES), ...itemFieldsShape })
	.refine((data) => data.type !== "link" || data.url !== null, {
		message: "URL is required for links",
		path: ["url"],
	});

export type CreateItemInput = z.input<typeof createItemSchema>;

export async function updateItem(
	itemId: string,
	input: UpdateItemInput,
): Promise<ActionResult<ItemDetail>> {
	const session = await auth();
	if (!session?.user?.id) {
		return { success: false, error: "Not authenticated" };
	}

	if (typeof itemId !== "string" || itemId.length === 0) {
		return { success: false, error: "Invalid item id" };
	}

	const parsed = updateItemSchema.safeParse(input);
	if (!parsed.success) {
		const firstIssue = parsed.error.issues[0];
		return {
			success: false,
			error: firstIssue?.message ?? "Invalid input",
		};
	}

	const userId = await getDemoUserId();
	if (!userId) {
		return { success: false, error: "Item not found" };
	}

	const updated = await updateItemQuery(itemId, userId, parsed.data);
	if (!updated) {
		return { success: false, error: "Item not found" };
	}

	return { success: true, data: updated };
}

export async function createItem(
	input: CreateItemInput,
): Promise<ActionResult<ItemDetail>> {
	const session = await auth();
	if (!session?.user?.id) {
		return { success: false, error: "Not authenticated" };
	}

	const parsed = createItemSchema.safeParse(input);
	if (!parsed.success) {
		const firstIssue = parsed.error.issues[0];
		return {
			success: false,
			error: firstIssue?.message ?? "Invalid input",
		};
	}

	const userId = await getDemoUserId();
	if (!userId) {
		return { success: false, error: "Could not create item" };
	}

	const { type, ...rest } = parsed.data;
	const data = {
		type,
		title: rest.title,
		description: rest.description,
		content: type === "link" ? null : rest.content,
		url: type === "link" ? rest.url : null,
		language: type === "snippet" || type === "command" ? rest.language : null,
		tags: rest.tags,
	};

	const created = await createItemQuery(userId, data);
	if (!created) {
		return { success: false, error: "Could not create item" };
	}

	return { success: true, data: created };
}

export async function deleteItem(
	itemId: string,
): Promise<ActionResult<{ id: string }>> {
	const session = await auth();
	if (!session?.user?.id) {
		return { success: false, error: "Not authenticated" };
	}

	if (typeof itemId !== "string" || itemId.length === 0) {
		return { success: false, error: "Invalid item id" };
	}

	const userId = await getDemoUserId();
	if (!userId) {
		return { success: false, error: "Item not found" };
	}

	const deleted = await deleteItemQuery(itemId, userId);
	if (!deleted) {
		return { success: false, error: "Item not found" };
	}

	return { success: true, data: { id: itemId } };
}
