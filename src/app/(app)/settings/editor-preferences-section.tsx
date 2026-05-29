"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useEditorPreferences } from "@/components/editor/editor-preferences-context";
import {
	EDITOR_THEMES,
	EDITOR_THEME_LABELS,
	FONT_SIZE_OPTIONS,
	TAB_SIZE_OPTIONS,
	type EditorTheme,
} from "@/lib/constants/editor-preferences";

export function EditorPreferencesSection() {
	const { preferences, saving, update } = useEditorPreferences();

	return (
		<section>
			<h2 className="mb-3 text-lg font-semibold">Editor</h2>
			<div className="flex flex-col gap-6 rounded-lg border bg-card p-6">
				<div className="flex items-center justify-between gap-4">
					<div className="min-w-0">
						<Label htmlFor="editor-font-size">Font size</Label>
						<p className="text-xs text-muted-foreground">
							Size of code in the editor.
						</p>
					</div>
					<Select
						value={String(preferences.fontSize)}
						onValueChange={(v) => update({ fontSize: Number(v) })}
						disabled={saving}
					>
						<SelectTrigger id="editor-font-size" className="w-28">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{FONT_SIZE_OPTIONS.map((size) => (
								<SelectItem key={size} value={String(size)}>
									{size}px
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="flex items-center justify-between gap-4">
					<div className="min-w-0">
						<Label htmlFor="editor-tab-size">Tab size</Label>
						<p className="text-xs text-muted-foreground">
							Number of spaces per indentation level.
						</p>
					</div>
					<Select
						value={String(preferences.tabSize)}
						onValueChange={(v) => update({ tabSize: Number(v) })}
						disabled={saving}
					>
						<SelectTrigger id="editor-tab-size" className="w-28">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{TAB_SIZE_OPTIONS.map((size) => (
								<SelectItem key={size} value={String(size)}>
									{size} spaces
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="flex items-center justify-between gap-4">
					<div className="min-w-0">
						<Label htmlFor="editor-theme">Theme</Label>
						<p className="text-xs text-muted-foreground">
							Color scheme for the editor.
						</p>
					</div>
					<Select
						value={preferences.theme}
						onValueChange={(v) => update({ theme: v as EditorTheme })}
						disabled={saving}
					>
						<SelectTrigger id="editor-theme" className="w-40">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{EDITOR_THEMES.map((theme) => (
								<SelectItem key={theme} value={theme}>
									{EDITOR_THEME_LABELS[theme]}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="flex items-center justify-between gap-4">
					<div className="min-w-0">
						<Label htmlFor="editor-word-wrap">Word wrap</Label>
						<p className="text-xs text-muted-foreground">
							Wrap long lines instead of scrolling horizontally.
						</p>
					</div>
					<Switch
						id="editor-word-wrap"
						checked={preferences.wordWrap}
						onCheckedChange={(checked) => update({ wordWrap: checked })}
						disabled={saving}
					/>
				</div>

				<div className="flex items-center justify-between gap-4">
					<div className="min-w-0">
						<Label htmlFor="editor-minimap">Minimap</Label>
						<p className="text-xs text-muted-foreground">
							Show the code overview on the right edge.
						</p>
					</div>
					<Switch
						id="editor-minimap"
						checked={preferences.minimap}
						onCheckedChange={(checked) => update({ minimap: checked })}
						disabled={saving}
					/>
				</div>
			</div>
		</section>
	);
}
