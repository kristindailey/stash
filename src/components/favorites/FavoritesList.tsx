"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FolderOpen, Star } from "lucide-react";
import {
	CREATABLE_TYPES,
	ITEM_TYPE_COLORS,
	ITEM_TYPE_ICONS,
	ITEM_TYPE_LABELS,
} from "@/lib/constants/item-types";
import type { DashboardItem } from "@/lib/db/items";
import type { FavoriteCollection } from "@/lib/db/favorites";
import { formatRelativeTime } from "@/lib/format-time";
import { capitalize } from "@/lib/utils";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useItemDrawer } from "@/components/items/item-drawer-context";
import { EmptyState } from "@/components/shared/EmptyState";

type SortKey = "date" | "name" | "type";

const SORT_LABELS: Record<SortKey, string> = {
	date: "Newest first",
	name: "Name (A–Z)",
	type: "Type",
};

function typeOrder(type: string) {
	const index = CREATABLE_TYPES.indexOf(type as (typeof CREATABLE_TYPES)[number]);
	return index === -1 ? CREATABLE_TYPES.length : index;
}

function sortItems(items: DashboardItem[], sort: SortKey) {
	const sorted = [...items];
	if (sort === "name") {
		sorted.sort((a, b) => a.title.localeCompare(b.title));
	} else if (sort === "date") {
		sorted.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
	} else {
		sorted.sort(
			(a, b) => typeOrder(a.type) - typeOrder(b.type) || a.title.localeCompare(b.title),
		);
	}
	return sorted;
}

function sortCollections(collections: FavoriteCollection[], sort: SortKey) {
	const sorted = [...collections];
	if (sort === "name") {
		sorted.sort((a, b) => a.name.localeCompare(b.name));
	} else if (sort === "date") {
		sorted.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
	}
	return sorted;
}

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
	const [sort, setSort] = useState<SortKey>("date");

	const sortedItems = useMemo(() => sortItems(items, sort), [items, sort]);
	const sortedCollections = useMemo(
		() => sortCollections(collections, sort),
		[collections, sort],
	);

	const totalCount = items.length + collections.length;

	return (
		<>
			<header className="flex items-center gap-3">
				<Star className="size-6 shrink-0 text-brand-yellow" fill="currentColor" />
				<h1 className="text-2xl font-semibold">Favorites</h1>
				<span className="text-sm text-muted-foreground">{totalCount}</span>
				{totalCount > 0 && (
					<div className="ml-auto flex items-center gap-2">
						<span className="text-sm text-muted-foreground">Sort by</span>
						<Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
							<SelectTrigger className="w-40">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
									<SelectItem key={key} value={key}>
										{SORT_LABELS[key]}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				)}
			</header>

			{totalCount === 0 && (
				<EmptyState message="No favorites yet. Star an item or collection to see it here." />
			)}

			{sortedItems.length > 0 && (
				<section className="flex flex-col gap-4">
					<h2 className="text-lg font-semibold">Items</h2>
					<div className="flex flex-col gap-2">
						{sortedItems.map((item) => (
							<ItemRow key={item.id} item={item} />
						))}
					</div>
				</section>
			)}

			{sortedCollections.length > 0 && (
				<section className="flex flex-col gap-4">
					<h2 className="text-lg font-semibold">Collections</h2>
					<div className="flex flex-col gap-2">
						{sortedCollections.map((collection) => (
							<CollectionRow key={collection.id} collection={collection} />
						))}
					</div>
				</section>
			)}
		</>
	);
}
