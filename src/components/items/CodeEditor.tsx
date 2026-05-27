"use client";

import * as React from "react";
import Editor, { type OnMount } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface CodeEditorProps {
	value: string;
	onChange?: (value: string) => void;
	language?: string;
	readOnly?: boolean;
	minHeight?: number;
	maxHeight?: number;
	className?: string;
}

const DEFAULT_MIN_HEIGHT = 140;
const DEFAULT_MAX_HEIGHT = 400;
const THEME_NAME = "devstash-dark";

export function CodeEditor({
	value,
	onChange,
	language,
	readOnly = false,
	minHeight = DEFAULT_MIN_HEIGHT,
	maxHeight = DEFAULT_MAX_HEIGHT,
	className,
}: CodeEditorProps) {
	const editorRef = React.useRef<editor.IStandaloneCodeEditor | null>(null);
	const [height, setHeight] = React.useState(minHeight);
	const [copied, setCopied] = React.useState(false);
	const [ready, setReady] = React.useState(false);

	const lang = normalizeLanguage(language);

	const updateHeight = React.useCallback(() => {
		const ed = editorRef.current;
		if (!ed) return;
		const contentHeight = ed.getContentHeight();
		const next = Math.min(maxHeight, Math.max(minHeight, contentHeight));
		setHeight(next);
		ed.layout();
	}, [maxHeight, minHeight]);

	const handleMount: OnMount = (ed, monaco) => {
		editorRef.current = ed;

		monaco.editor.defineTheme(THEME_NAME, {
			base: "vs-dark",
			inherit: true,
			rules: [],
			colors: {
				"editor.background": "#1a1a1a",
				"editor.foreground": "#e4e4e7",
				"editorLineNumber.foreground": "#52525b",
				"editorLineNumber.activeForeground": "#a1a1aa",
				"editor.lineHighlightBackground": "#27272a55",
				"editor.selectionBackground": "#3f3f4670",
				"editorCursor.foreground": "#e4e4e7",
				"scrollbarSlider.background": "#52525b66",
				"scrollbarSlider.hoverBackground": "#71717a99",
				"scrollbarSlider.activeBackground": "#a1a1aacc",
				"editorWidget.background": "#1a1a1a",
				"editorWidget.border": "#27272a",
			},
		});
		monaco.editor.setTheme(THEME_NAME);

		ed.onDidContentSizeChange(updateHeight);
		updateHeight();
		setReady(true);
	};

	const handleCopy = React.useCallback(async () => {
		if (!value) return;
		try {
			await navigator.clipboard.writeText(value);
			setCopied(true);
			window.setTimeout(() => setCopied(false), 1500);
		} catch {
			// ignore
		}
	}, [value]);

	return (
		<div
			className={cn(
				"overflow-hidden rounded-lg border border-white/10 bg-[#1a1a1a] shadow-sm",
				className,
			)}
		>
			<div className="flex items-center justify-between border-b border-white/10 bg-[#252525] px-3 py-2">
				<div className="flex items-center gap-1.5">
					<span className="size-3 rounded-full bg-[#ff5f57]" />
					<span className="size-3 rounded-full bg-[#febc2e]" />
					<span className="size-3 rounded-full bg-[#28c840]" />
				</div>
				<div className="flex items-center gap-2 text-xs text-white/60">
					{lang && lang !== "plaintext" ? (
						<span className="font-mono uppercase tracking-wide">{lang}</span>
					) : null}
					<button
						type="button"
						onClick={handleCopy}
						aria-label={copied ? "Copied" : "Copy code"}
						className="flex items-center gap-1 rounded p-1 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
					>
						{copied ? (
							<Check className="size-3.5" />
						) : (
							<Copy className="size-3.5" />
						)}
					</button>
				</div>
			</div>

			<div style={{ height }}>
				<Editor
					height="100%"
					value={value}
					language={lang}
					theme={ready ? THEME_NAME : "vs-dark"}
					onChange={(next) => onChange?.(next ?? "")}
					onMount={handleMount}
					loading={
						<div className="flex h-full items-center justify-center text-xs text-white/40">
							Loading editor…
						</div>
					}
					options={{
						readOnly,
						domReadOnly: readOnly,
						fontSize: 12,
						lineHeight: 18,
						fontFamily:
							"var(--font-mono), ui-monospace, SFMono-Regular, Menlo, monospace",
						minimap: { enabled: false },
						scrollBeyondLastLine: false,
						automaticLayout: true,
						wordWrap: "on",
						lineNumbers: "on",
						lineNumbersMinChars: 3,
						glyphMargin: false,
						folding: false,
						renderLineHighlight: readOnly ? "none" : "line",
						overviewRulerLanes: 0,
						overviewRulerBorder: false,
						hideCursorInOverviewRuler: true,
						padding: { top: 10, bottom: 10 },
						scrollbar: {
							verticalScrollbarSize: 8,
							horizontalScrollbarSize: 8,
							alwaysConsumeMouseWheel: false,
						},
						guides: { indentation: false },
					}}
				/>
			</div>
		</div>
	);
}

function normalizeLanguage(lang?: string | null): string {
	if (!lang) return "plaintext";
	const trimmed = lang.trim().toLowerCase();
	if (!trimmed) return "plaintext";
	const aliases: Record<string, string> = {
		js: "javascript",
		ts: "typescript",
		jsx: "javascript",
		tsx: "typescript",
		sh: "shell",
		bash: "shell",
		zsh: "shell",
		yml: "yaml",
		py: "python",
		rb: "ruby",
		md: "markdown",
	};
	return aliases[trimmed] ?? trimmed;
}
