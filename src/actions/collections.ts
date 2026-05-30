"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { checkCollectionQuota } from "@/lib/billing";
import {
	createCollection as createCollectionQuery,
	deleteCollection as deleteCollectionQuery,
	toggleCollectionFavorite as toggleCollectionFavoriteQuery,
	updateCollection as updateCollectionQuery,
	type CollectionFavoriteState,
	type CreatedCollection,
} from "@/lib/db/collections";

export type ActionResult<T> =
	| { success: true; data: T }
	| { success: false; error: string };

const nullableTrimmedString = z
	.string()
	.transform((value) => value.trim())
	.transform((value) => (value.length === 0 ? null : value))
	.nullable();

const createCollectionSchema = z.object({
	name: z
		.string()
		.transform((value) => value.trim())
		.refine((value) => value.length > 0, { message: "Name is required" }),
	description: nullableTrimmedString.optional().default(null),
});

export type CreateCollectionInput = z.input<typeof createCollectionSchema>;

export async function createCollection(
	input: CreateCollectionInput,
): Promise<ActionResult<CreatedCollection>> {
	const session = await auth();
	if (!session?.user?.id) {
		return { success: false, error: "Not authenticated" };
	}

	const parsed = createCollectionSchema.safeParse(input);
	if (!parsed.success) {
		const firstIssue = parsed.error.issues[0];
		return {
			success: false,
			error: firstIssue?.message ?? "Invalid input",
		};
	}

	const quotaError = await checkCollectionQuota(session.user.id);
	if (quotaError) {
		return { success: false, error: quotaError };
	}

	const created = await createCollectionQuery(session.user.id, parsed.data);

	return { success: true, data: created };
}

const updateCollectionSchema = createCollectionSchema;

export type UpdateCollectionInput = z.input<typeof updateCollectionSchema>;

export async function updateCollection(
	collectionId: string,
	input: UpdateCollectionInput,
): Promise<ActionResult<CreatedCollection>> {
	const session = await auth();
	if (!session?.user?.id) {
		return { success: false, error: "Not authenticated" };
	}

	if (typeof collectionId !== "string" || collectionId.length === 0) {
		return { success: false, error: "Invalid collection id" };
	}

	const parsed = updateCollectionSchema.safeParse(input);
	if (!parsed.success) {
		const firstIssue = parsed.error.issues[0];
		return {
			success: false,
			error: firstIssue?.message ?? "Invalid input",
		};
	}

	const updated = await updateCollectionQuery(
		collectionId,
		session.user.id,
		parsed.data,
	);
	if (!updated) {
		return { success: false, error: "Collection not found" };
	}

	return { success: true, data: updated };
}

export async function toggleCollectionFavorite(
	collectionId: string,
): Promise<ActionResult<CollectionFavoriteState>> {
	const session = await auth();
	if (!session?.user?.id) {
		return { success: false, error: "Not authenticated" };
	}

	if (typeof collectionId !== "string" || collectionId.length === 0) {
		return { success: false, error: "Invalid collection id" };
	}

	const updated = await toggleCollectionFavoriteQuery(
		collectionId,
		session.user.id,
	);
	if (!updated) {
		return { success: false, error: "Collection not found" };
	}

	return { success: true, data: updated };
}

export async function deleteCollection(
	collectionId: string,
): Promise<ActionResult<{ id: string }>> {
	const session = await auth();
	if (!session?.user?.id) {
		return { success: false, error: "Not authenticated" };
	}

	if (typeof collectionId !== "string" || collectionId.length === 0) {
		return { success: false, error: "Invalid collection id" };
	}

	const deleted = await deleteCollectionQuery(collectionId, session.user.id);
	if (!deleted) {
		return { success: false, error: "Collection not found" };
	}

	return { success: true, data: { id: collectionId } };
}
