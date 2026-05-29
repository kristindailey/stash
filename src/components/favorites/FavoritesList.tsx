"use client";

import Link from "next/link";
import { FolderOpen } from "lucide-react";
import {
	ITEM_TYPE_COLORS,
	ITEM_TYPE_ICONS,
	ITEM_TYPE_LABELS,
} from "@/lib/constants/item-types";
import type { DashboardItem } from "@/lib/db/items";
import type { FavoriteCollection } from "@/lib/db/favorites";
import { formatRelativeTime } from "@/lib/format-time";
import { capitalize } from "@/lib/utils";
import { useItemDrawer } from "@/components/items/item-drawer-context";

const rowClass =
	"group flex cursor-pointer flex-col gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:flex-row sm:items-center sm:gap-4 sm:px-4";

function ItemRow({ item }: { item: DashboardItem }) {
	const { openItem } = useItemDrawer();
	const Icon = ITEM_TYPE_ICONS[item.type] ?? FolderOpen;
	const color = ITEM_TYPE_COLORS[item.type] ?? "#6b7280";
	const label = ITEM_TYPE_LABELS[item.type] ?? capitalize(item.type);

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
			className={rowClass}
		>
			<div className="flex min-w-0 flex-1 items-center gap-3">
				<Icon className="size-6 shrink-0" style={{ color }} />
				<p className="min-w-0 flex-1 truncate text-sm font-medium">
					{item.title}
				</p>
			</div>

			<div className="flex items-center justify-between gap-4 text-xs text-muted-foreground sm:justify-end">
				<span className="w-20 shrink-0 sm:text-right">{label}</span>
				<span className="w-28 shrink-0 sm:text-right">
					{formatRelativeTime(item.updatedAt)}
				</span>
			</div>
		</div>
	);
}

function CollectionRow({ collection }: { collection: FavoriteCollection }) {
	return (
		<Link href={`/collections/${collection.id}`} className={rowClass}>
			<div className="flex min-w-0 flex-1 items-center gap-3">
				<FolderOpen className="size-6 shrink-0 text-muted-foreground" />
				<p className="min-w-0 flex-1 truncate text-sm font-medium">
					{collection.name}
				</p>
			</div>

			<div className="flex items-center justify-between gap-4 text-xs text-muted-foreground sm:justify-end">
				<span className="w-20 shrink-0 sm:text-right">
					{collection.itemCount} {collection.itemCount === 1 ? "item" : "items"}
				</span>
				<span className="w-28 shrink-0 sm:text-right">
					{formatRelativeTime(collection.updatedAt)}
				</span>
			</div>
		</Link>
	);
}

export function FavoritesList({
	items,
	collections,
}: {
	items: DashboardItem[];
	collections: FavoriteCollection[];
}) {
	return (
		<>
			{items.length > 0 && (
				<section className="flex flex-col gap-4">
					<h2 className="text-lg font-semibold">Items</h2>
					<div className="flex flex-col gap-2">
						{items.map((item) => (
							<ItemRow key={item.id} item={item} />
						))}
					</div>
				</section>
			)}

			{collections.length > 0 && (
				<section className="flex flex-col gap-4">
					<h2 className="text-lg font-semibold">Collections</h2>
					<div className="flex flex-col gap-2">
						{collections.map((collection) => (
							<CollectionRow key={collection.id} collection={collection} />
						))}
					</div>
				</section>
			)}
		</>
	);
}
