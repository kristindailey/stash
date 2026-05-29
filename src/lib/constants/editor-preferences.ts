export const EDITOR_THEMES = ["vs-dark", "monokai", "github-dark"] as const;

export type EditorTheme = (typeof EDITOR_THEMES)[number];

export type EditorPreferences = {
	fontSize: number;
	tabSize: number;
	wordWrap: boolean;
	minimap: boolean;
	theme: EditorTheme;
};

export const FONT_SIZE_OPTIONS = [11, 12, 13, 14, 16, 18] as const;
export const TAB_SIZE_OPTIONS = [2, 4, 8] as const;

export const EDITOR_THEME_LABELS: Record<EditorTheme, string> = {
	"vs-dark": "VS Dark",
	monokai: "Monokai",
	"github-dark": "GitHub Dark",
};

export const DEFAULT_EDITOR_PREFERENCES: EditorPreferences = {
	fontSize: 12,
	tabSize: 2,
	wordWrap: true,
	minimap: false,
	theme: "vs-dark",
};

export function normalizeEditorPreferences(value: unknown): EditorPreferences {
	if (typeof value !== "object" || value === null) {
		return { ...DEFAULT_EDITOR_PREFERENCES };
	}

	const raw = value as Record<string, unknown>;
	const fontSize = raw.fontSize;
	const tabSize = raw.tabSize;
	const wordWrap = raw.wordWrap;
	const minimap = raw.minimap;
	const theme = raw.theme;

	return {
		fontSize: FONT_SIZE_OPTIONS.includes(fontSize as never)
			? (fontSize as number)
			: DEFAULT_EDITOR_PREFERENCES.fontSize,
		tabSize: TAB_SIZE_OPTIONS.includes(tabSize as never)
			? (tabSize as number)
			: DEFAULT_EDITOR_PREFERENCES.tabSize,
		wordWrap:
			typeof wordWrap === "boolean"
				? wordWrap
				: DEFAULT_EDITOR_PREFERENCES.wordWrap,
		minimap:
			typeof minimap === "boolean"
				? minimap
				: DEFAULT_EDITOR_PREFERENCES.minimap,
		theme: EDITOR_THEMES.includes(theme as never)
			? (theme as EditorTheme)
			: DEFAULT_EDITOR_PREFERENCES.theme,
	};
}
