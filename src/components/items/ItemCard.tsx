"use client";

import { FolderOpen } from "lucide-react";
import {
	DEFAULT_TYPE_COLOR,
	ITEM_TYPE_COLORS,
	ITEM_TYPE_ICONS,
} from "@/lib/constants/item-types";
import type { DashboardItem } from "@/lib/db/items";
import { formatRelativeTime } from "@/lib/format-time";
import { CopyButton, getCopyText } from "./CopyButton";
import { ItemStatusBadges } from "./ItemStatusBadges";
import { useItemDrawer } from "./item-drawer-context";

function copyLabelFor(type: string): string {
	if (type === "link") return "link";
	return type;
}

export function ItemCard({ item }: { item: DashboardItem }) {
	const { openItem } = useItemDrawer();
	const Icon = ITEM_TYPE_ICONS[item.type] ?? FolderOpen;
	const color = ITEM_TYPE_COLORS[item.type] ?? DEFAULT_TYPE_COLOR;
	const copyText = getCopyText(item);

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
			className="group flex cursor-pointer flex-col gap-3 rounded-lg border border-l-4 bg-card p-4 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
			style={{ borderLeftColor: color }}
		>
			<div className="flex items-start justify-between gap-2">
				<div className="flex min-w-0 items-center gap-2">
					<Icon className="size-4 shrink-0" style={{ color }} />
					<h3 className="truncate font-semibold" style={{ color }}>
						{item.title}
					</h3>
				</div>
				<div className="flex shrink-0 items-center gap-1.5 text-muted-foreground">
					{copyText && (
						<CopyButton text={copyText} label={copyLabelFor(item.type)} />
					)}
					<ItemStatusBadges
						isPinned={item.isPinned}
						isFavorite={item.isFavorite}
					/>
				</div>
			</div>

			{item.description && (
				<p className="line-clamp-2 text-sm text-muted-foreground">
					{item.description}
				</p>
			)}

			{item.tags.length > 0 && (
				<div className="flex flex-wrap gap-1.5">
					{item.tags.map((tag) => (
						<span
							key={tag}
							className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
						>
							{tag}
						</span>
					))}
				</div>
			)}

			<div className="flex items-center justify-between text-xs text-muted-foreground">
				<span>{formatRelativeTime(item.updatedAt)}</span>
				{item.language && <span>{item.language}</span>}
			</div>
		</div>
	);
}
