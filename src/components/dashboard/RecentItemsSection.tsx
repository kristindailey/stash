import Link from "next/link";
import { FolderOpen } from "lucide-react";
import {
	ITEM_TYPE_COLORS,
	ITEM_TYPE_ICONS,
	ITEM_TYPE_LABELS,
} from "@/lib/constants/item-types";
import { getRecentItems, type DashboardItem } from "@/lib/db/items";
import { formatRelativeTime } from "@/lib/format-time";

export async function RecentItemsSection() {
	const recent = await getRecentItems(10);

	return (
		<section>
			<h2 className="mb-4 text-lg font-semibold">Recent Items</h2>
			{recent.length === 0 ? (
				<p className="text-sm text-muted-foreground">No items yet.</p>
			) : (
				<ul className="flex flex-col gap-2">
					{recent.map((item) => (
						<RecentItemRow key={item.id} item={item} />
					))}
				</ul>
			)}
		</section>
	);
}

function RecentItemRow({ item }: { item: DashboardItem }) {
	const Icon = ITEM_TYPE_ICONS[item.type] ?? FolderOpen;
	const color = ITEM_TYPE_COLORS[item.type] ?? "#6b7280";
	const typeLabel = ITEM_TYPE_LABELS[item.type] ?? item.type;

	return (
		<li>
			<Link
				href={`/items/${item.type}s/${item.id}`}
				className="flex items-center gap-3 rounded-lg border border-l-4 bg-card px-4 py-3 transition-colors hover:bg-accent"
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
			</Link>
		</li>
	);
}
