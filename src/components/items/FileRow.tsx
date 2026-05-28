"use client";

import { createElement } from "react";
import {
	Download,
	File,
	FileArchive,
	FileAudio,
	FileCode,
	FileImage,
	FileJson,
	FileSpreadsheet,
	FileText,
	FileVideo,
	Pin,
	Star,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DashboardItem } from "@/lib/db/items";
import { formatBytes } from "@/lib/constants/file-upload";
import { formatRelativeTime } from "@/lib/format-time";
import { useItemDrawer } from "./item-drawer-context";

const EXT_ICONS: Record<string, LucideIcon> = {
	pdf: FileText,
	doc: FileText,
	docx: FileText,
	txt: FileText,
	md: FileText,
	rtf: FileText,
	xls: FileSpreadsheet,
	xlsx: FileSpreadsheet,
	csv: FileSpreadsheet,
	tsv: FileSpreadsheet,
	zip: FileArchive,
	rar: FileArchive,
	tar: FileArchive,
	gz: FileArchive,
	"7z": FileArchive,
	json: FileJson,
	jpg: FileImage,
	jpeg: FileImage,
	png: FileImage,
	gif: FileImage,
	webp: FileImage,
	svg: FileImage,
	mp4: FileVideo,
	mov: FileVideo,
	avi: FileVideo,
	mkv: FileVideo,
	webm: FileVideo,
	mp3: FileAudio,
	wav: FileAudio,
	ogg: FileAudio,
	flac: FileAudio,
	js: FileCode,
	jsx: FileCode,
	ts: FileCode,
	tsx: FileCode,
	py: FileCode,
	rb: FileCode,
	go: FileCode,
	rs: FileCode,
	java: FileCode,
	c: FileCode,
	cpp: FileCode,
	h: FileCode,
	css: FileCode,
	scss: FileCode,
	html: FileCode,
	sh: FileCode,
	yml: FileCode,
	yaml: FileCode,
	toml: FileCode,
	xml: FileCode,
};

function iconForFileName(fileName: string | null): LucideIcon {
	if (!fileName) return File;
	const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
	return EXT_ICONS[ext] ?? File;
}

export function FileRow({ item }: { item: DashboardItem }) {
	const { openItem } = useItemDrawer();
	const displayName = item.fileName ?? item.title;

	const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			openItem(item.id);
		}
	};

	return (
		<div
			role="button"
			tabIndex={0}
			onClick={() => openItem(item.id)}
			onKeyDown={handleKeyDown}
			className="group flex cursor-pointer flex-col gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:flex-row sm:items-center sm:gap-4 sm:px-4"
		>
			<div className="flex min-w-0 flex-1 items-center gap-3">
				{createElement(iconForFileName(item.fileName), {
					className: "size-6 shrink-0 text-muted-foreground",
				})}
				<div className="min-w-0 flex-1">
					<p className="truncate text-sm font-medium">{displayName}</p>
					{item.title !== displayName && (
						<p className="truncate text-xs text-muted-foreground">
							{item.title}
						</p>
					)}
				</div>
				{(item.isPinned || item.isFavorite) && (
					<div className="flex shrink-0 items-center gap-1.5 text-muted-foreground">
						{item.isPinned && <Pin className="size-3.5" fill="currentColor" />}
						{item.isFavorite && (
							<Star
								className="size-3.5"
								style={{ color: "#f59e0b" }}
								fill="currentColor"
							/>
						)}
					</div>
				)}
			</div>

			<div className="flex items-center justify-between gap-4 text-xs text-muted-foreground sm:justify-end">
				<span className="w-20 shrink-0 sm:text-right">
					{formatBytes(item.fileSize)}
				</span>
				<span className="w-28 shrink-0 sm:text-right">
					{formatRelativeTime(item.updatedAt)}
				</span>
				<Button asChild variant="ghost" size="sm">
					<a
						href={`/api/items/${item.id}/download`}
						download={item.fileName ?? undefined}
						onClick={(e) => e.stopPropagation()}
						aria-label={`Download ${displayName}`}
					>
						<Download />
					</a>
				</Button>
			</div>
		</div>
	);
}
