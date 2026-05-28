"use client";

import { Image as ImageIcon } from "lucide-react";
import type { DashboardItem } from "@/lib/db/items";
import { formatRelativeTime } from "@/lib/format-time";
import { ItemStatusBadges } from "./ItemStatusBadges";
import { useItemDrawer } from "./item-drawer-context";

export function ImageCard({ item }: { item: DashboardItem }) {
	const { openItem } = useItemDrawer();

	return (
		<button
			type="button"
			onClick={() => openItem(item.id)}
			className="group flex flex-col overflow-hidden rounded-lg border bg-card text-left transition-colors hover:bg-accent"
		>
			<div className="relative aspect-video w-full overflow-hidden bg-muted">
				{item.fileName ? (
					/* eslint-disable-next-line @next/next/no-img-element */
					<img
						src={`/api/items/${item.id}/download`}
						alt={item.title}
						className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
					/>
				) : (
					<div className="flex size-full items-center justify-center text-muted-foreground">
						<ImageIcon className="size-8" />
					</div>
				)}
				{(item.isPinned || item.isFavorite) && (
					<div className="absolute right-2 top-2 flex items-center gap-1.5 rounded-md bg-background/80 px-1.5 py-1 text-muted-foreground backdrop-blur-sm">
						<ItemStatusBadges
							isPinned={item.isPinned}
							isFavorite={item.isFavorite}
						/>
					</div>
				)}
			</div>

			<div className="flex items-center justify-between gap-2 p-3">
				<h3 className="truncate text-sm font-medium">{item.title}</h3>
				<span className="shrink-0 text-xs text-muted-foreground">
					{formatRelativeTime(item.updatedAt)}
				</span>
			</div>
		</button>
	);
}
