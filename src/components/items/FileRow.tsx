"use client";

import { createElement } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DashboardItem } from "@/lib/db/items";
import { formatBytes } from "@/lib/constants/file-upload";
import { iconForFileName } from "@/lib/constants/file-icons";
import { formatRelativeTime } from "@/lib/format-time";
import { ItemStatusBadges } from "./ItemStatusBadges";
import { useItemDrawer } from "./item-drawer-context";

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
						<ItemStatusBadges
							isPinned={item.isPinned}
							isFavorite={item.isFavorite}
						/>
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
