import { FolderOpen, Pin, Star } from "lucide-react";
import {
	ITEM_TYPE_COLORS,
	ITEM_TYPE_ICONS,
} from "@/lib/constants/item-types";
import { getPinnedItems, type DashboardItem } from "@/lib/db/items";
import { formatRelativeTime } from "@/lib/format-time";

export async function PinnedSection() {
	const pinned = await getPinnedItems();

	if (pinned.length === 0) return null;

	return (
		<section>
			<h2 className="mb-4 text-lg font-semibold">Pinned</h2>
			<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
				{pinned.map((item) => (
					<PinnedItemCard key={item.id} item={item} />
				))}
			</div>
		</section>
	);
}

function PinnedItemCard({ item }: { item: DashboardItem }) {
	const Icon = ITEM_TYPE_ICONS[item.type] ?? FolderOpen;
	const color = ITEM_TYPE_COLORS[item.type] ?? "#6b7280";

	return (
		<div
			className="flex flex-col gap-3 rounded-lg border border-l-4 bg-card p-4"
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
					<Pin className="size-3.5" fill="currentColor" />
					{item.isFavorite && (
						<Star
							className="size-3.5"
							style={{ color: "#f59e0b" }}
							fill="currentColor"
						/>
					)}
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
