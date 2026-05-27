"use client";

import * as React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface MarkdownEditorProps {
	value: string;
	onChange?: (value: string) => void;
	readOnly?: boolean;
	minHeight?: number;
	maxHeight?: number;
	placeholder?: string;
	className?: string;
}

const DEFAULT_MIN_HEIGHT = 140;
const DEFAULT_MAX_HEIGHT = 400;

export function MarkdownEditor({
	value,
	onChange,
	readOnly = false,
	minHeight = DEFAULT_MIN_HEIGHT,
	maxHeight = DEFAULT_MAX_HEIGHT,
	placeholder,
	className,
}: MarkdownEditorProps) {
	const [tab, setTab] = React.useState<"write" | "preview">(
		readOnly ? "preview" : "write",
	);
	const [copied, setCopied] = React.useState(false);
	const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);

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

	const autoSize = React.useCallback(() => {
		const el = textareaRef.current;
		if (!el) return;
		el.style.height = "auto";
		const next = Math.min(maxHeight, Math.max(minHeight, el.scrollHeight));
		el.style.height = `${next}px`;
	}, [maxHeight, minHeight]);

	React.useEffect(() => {
		if (tab === "write") autoSize();
	}, [tab, value, autoSize]);

	return (
		<div
			className={cn(
				"overflow-hidden rounded-lg border border-white/10 bg-[#1a1a1a] shadow-sm",
				className,
			)}
		>
			<div className="flex items-center justify-between border-b border-white/10 bg-[#252525] px-3 py-2">
				<div className="flex items-center gap-1">
					{!readOnly && (
						<TabButton
							active={tab === "write"}
							onClick={() => setTab("write")}
						>
							Write
						</TabButton>
					)}
					<TabButton
						active={tab === "preview"}
						onClick={() => setTab("preview")}
					>
						Preview
					</TabButton>
				</div>
				<button
					type="button"
					onClick={handleCopy}
					aria-label={copied ? "Copied" : "Copy markdown"}
					className="flex items-center gap-1 rounded p-1 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
				>
					{copied ? (
						<Check className="size-3.5" />
					) : (
						<Copy className="size-3.5" />
					)}
				</button>
			</div>

			{tab === "write" ? (
				<textarea
					ref={textareaRef}
					value={value}
					onChange={(e) => onChange?.(e.target.value)}
					placeholder={placeholder}
					spellCheck
					className="block w-full resize-none border-0 bg-[#1a1a1a] px-3 py-2.5 text-sm text-zinc-100 outline-none placeholder:text-white/30"
					style={{ minHeight, maxHeight }}
				/>
			) : (
				<div
					className="markdown-preview overflow-y-auto px-4 py-3 text-sm text-zinc-100"
					style={{ minHeight, maxHeight }}
				>
					{value.trim() ? (
						<ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
					) : (
						<p className="text-white/30">Nothing to preview yet.</p>
					)}
				</div>
			)}
		</div>
	);
}

function TabButton({
	active,
	onClick,
	children,
}: {
	active: boolean;
	onClick: () => void;
	children: React.ReactNode;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				"rounded px-2 py-0.5 text-xs font-medium transition-colors",
				active
					? "bg-white/10 text-white"
					: "text-white/50 hover:bg-white/5 hover:text-white/80",
			)}
		>
			{children}
		</button>
	);
}
