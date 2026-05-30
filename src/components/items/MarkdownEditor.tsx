"use client";

import * as React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Check, Copy, Crown, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { optimizePrompt } from "@/actions/ai";

interface MarkdownEditorProps {
	value: string;
	onChange?: (value: string) => void;
	readOnly?: boolean;
	minHeight?: number;
	maxHeight?: number;
	placeholder?: string;
	className?: string;
	optimize?: {
		isPro: boolean;
		title?: string;
		onUse: (optimized: string) => void;
	};
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
	optimize,
}: MarkdownEditorProps) {
	const [tab, setTab] = React.useState<"write" | "preview">(
		readOnly ? "preview" : "write",
	);
	const [copied, setCopied] = React.useState(false);
	const [optimized, setOptimized] = React.useState<string | null>(null);
	const [optimizing, setOptimizing] = React.useState(false);
	const [view, setView] = React.useState<"original" | "optimized">("original");
	const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);

	const showOptimized = optimized !== null && view === "optimized";
	const displayValue = showOptimized ? optimized : value;

	const handleCopy = React.useCallback(async () => {
		if (!displayValue) return;
		try {
			await navigator.clipboard.writeText(displayValue);
			setCopied(true);
			window.setTimeout(() => setCopied(false), 1500);
		} catch {
			// ignore
		}
	}, [displayValue]);

	const handleOptimize = React.useCallback(async () => {
		if (!optimize || optimizing) return;
		setOptimizing(true);
		const result = await optimizePrompt({ title: optimize.title, content: value });
		setOptimizing(false);

		if (!result.success) {
			if (result.error.includes("Upgrade to Pro")) {
				toast.error(result.error, {
					action: {
						label: "Upgrade",
						onClick: () => {
							window.location.href = "/upgrade";
						},
					},
				});
			} else {
				toast.error(result.error);
			}
			return;
		}

		setOptimized(result.data.optimized);
		setView("optimized");
	}, [optimize, optimizing, value]);

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
					{optimized !== null ? (
						<>
							<TabButton
								active={view === "original"}
								onClick={() => setView("original")}
							>
								Original
							</TabButton>
							<TabButton
								active={view === "optimized"}
								onClick={() => setView("optimized")}
							>
								Optimized
							</TabButton>
						</>
					) : (
						<>
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
						</>
					)}
				</div>
				<div className="flex items-center gap-2 text-xs text-white/60">
					{optimize && optimized === null ? (
						<button
							type="button"
							onClick={handleOptimize}
							disabled={optimizing || value.trim().length === 0}
							title={
								optimize.isPro
									? undefined
									: "AI features require Pro subscription"
							}
							aria-label="Optimize prompt"
							className="flex items-center gap-1 rounded px-1.5 py-1 text-white/60 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
						>
							{optimizing ? (
								<Loader2 className="size-3.5 animate-spin" />
							) : optimize.isPro ? (
								<Sparkles className="size-3.5" />
							) : (
								<Crown className="size-3.5" />
							)}
							<span>{optimizing ? "Optimizing…" : "Optimize"}</span>
						</button>
					) : null}
					{optimize && optimized !== null ? (
						<button
							type="button"
							onClick={() => optimize.onUse(optimized)}
							className="flex items-center gap-1 rounded px-1.5 py-1 font-medium text-emerald-400 transition-colors hover:bg-white/10 hover:text-emerald-300"
						>
							<Check className="size-3.5" />
							<span>Use optimized</span>
						</button>
					) : null}
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
			</div>

			{optimized !== null || tab === "preview" ? (
				<div
					className="markdown-preview overflow-y-auto px-4 py-3 text-sm text-zinc-100"
					style={{ minHeight, maxHeight }}
				>
					{displayValue.trim() ? (
						<ReactMarkdown remarkPlugins={[remarkGfm]}>
							{displayValue}
						</ReactMarkdown>
					) : (
						<p className="text-white/30">Nothing to preview yet.</p>
					)}
				</div>
			) : (
				<textarea
					ref={textareaRef}
					value={value}
					onChange={(e) => onChange?.(e.target.value)}
					placeholder={placeholder}
					spellCheck
					className="block w-full resize-none border-0 bg-[#1a1a1a] px-3 py-2.5 text-sm text-zinc-100 outline-none placeholder:text-white/30"
					style={{ minHeight, maxHeight }}
				/>
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
