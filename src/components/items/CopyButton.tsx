"use client";

import { Check, Copy } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { DashboardItem } from "@/lib/db/items";
import { cn } from "@/lib/utils";

export function getCopyText(item: DashboardItem): string | null {
	if (item.contentType === "FILE") return null;
	if (item.contentType === "URL") return item.url;
	return item.content;
}

type CopyButtonProps = {
	text: string;
	label?: string;
	className?: string;
};

export function CopyButton({ text, label = "content", className }: CopyButtonProps) {
	const [copied, setCopied] = React.useState(false);

	const handleCopy = async (e: React.MouseEvent<HTMLButtonElement>) => {
		e.stopPropagation();
		e.preventDefault();
		if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
			toast.error("Clipboard not available");
			return;
		}
		try {
			await navigator.clipboard.writeText(text);
			setCopied(true);
			toast.success(`Copied ${label}`);
			window.setTimeout(() => setCopied(false), 1500);
		} catch {
			toast.error("Failed to copy");
		}
	};

	return (
		<Button
			type="button"
			variant="ghost"
			size="icon-xs"
			aria-label={`Copy ${label}`}
			onClick={handleCopy}
			className={cn("text-muted-foreground hover:text-foreground", className)}
		>
			{copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
		</Button>
	);
}
