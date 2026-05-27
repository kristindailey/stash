"use client";

import { FolderOpen } from "lucide-react";
import {
	ITEM_TYPE_COLORS,
	ITEM_TYPE_ICONS,
	ITEM_TYPE_LABELS,
} from "@/lib/constants/item-types";
import type { DashboardItem } from "@/lib/db/items";
import { formatRelativeTime } from "@/lib/format-time";
import { useItemDrawer } from "@/components/items/item-drawer-context";

export function RecentItemRow({ item }: { item: DashboardItem }) {
	const { openItem } = useItemDrawer();
	const Icon = ITEM_TYPE_ICONS[item.type] ?? FolderOpen;
	const color = ITEM_TYPE_COLORS[item.type] ?? "#6b7280";
	const typeLabel = ITEM_TYPE_LABELS[item.type] ?? item.type;

	return (
		<li>
			<button
				type="button"
				onClick={() => openItem(item.id)}
				className="flex w-full items-center gap-3 rounded-lg border border-l-4 bg-card px-4 py-3 text-left transition-colors hover:bg-accent"
				style={{ borderLeftColor: color }}
			>
				<Icon className="size-4 shrink-0" style={{ color }} />
				<div className="min-w-0 flex-1">
					<p className="truncate text-sm font-medium">{item.title}</p>
					{item.description && (
						<p className="truncate text-xs text-muted-foreground">
							{item.description}
						</p>
					)}
				</div>
				<span className="hidden shrink-0 text-xs text-muted-foreground sm:inline">
					{typeLabel}
				</span>
				<span className="w-24 shrink-0 text-right text-xs text-muted-foreground">
					{formatRelativeTime(item.updatedAt)}
				</span>
			</button>
		</li>
	);
}
