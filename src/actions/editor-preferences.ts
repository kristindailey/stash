"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
	EDITOR_THEMES,
	FONT_SIZE_OPTIONS,
	TAB_SIZE_OPTIONS,
	type EditorPreferences,
} from "@/lib/constants/editor-preferences";

export type ActionResult<T> =
	| { success: true; data: T }
	| { success: false; error: string };

const editorPreferencesSchema = z.object({
	fontSize: z
		.number()
		.refine((v) => FONT_SIZE_OPTIONS.includes(v as never), {
			message: "Invalid font size",
		}),
	tabSize: z.number().refine((v) => TAB_SIZE_OPTIONS.includes(v as never), {
		message: "Invalid tab size",
	}),
	wordWrap: z.boolean(),
	minimap: z.boolean(),
	theme: z.enum(EDITOR_THEMES),
});

export async function updateEditorPreferences(
	input: unknown,
): Promise<ActionResult<EditorPreferences>> {
	const session = await auth();
	if (!session?.user?.id) {
		return { success: false, error: "Not authenticated" };
	}

	const parsed = editorPreferencesSchema.safeParse(input);
	if (!parsed.success) {
		return {
			success: false,
			error: parsed.error.issues[0]?.message ?? "Invalid preferences",
		};
	}

	await prisma.user.update({
		where: { id: session.user.id },
		data: { editorPreferences: parsed.data },
	});

	return { success: true, data: parsed.data };
}
