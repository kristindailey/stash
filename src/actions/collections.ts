"use server";

import { z } from "zod";
import { auth } from "@/auth";
import {
	createCollection as createCollectionQuery,
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

	const created = await createCollectionQuery(session.user.id, parsed.data);

	return { success: true, data: created };
}
