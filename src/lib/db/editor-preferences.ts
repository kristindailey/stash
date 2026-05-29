import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
	DEFAULT_EDITOR_PREFERENCES,
	normalizeEditorPreferences,
	type EditorPreferences,
} from "@/lib/constants/editor-preferences";

export async function getEditorPreferences(): Promise<EditorPreferences> {
	const session = await auth();
	if (!session?.user?.id) return { ...DEFAULT_EDITOR_PREFERENCES };

	const user = await prisma.user.findUnique({
		where: { id: session.user.id },
		select: { editorPreferences: true },
	});

	return normalizeEditorPreferences(user?.editorPreferences);
}
