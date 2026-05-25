import Link from "next/link";
import { FolderOpen } from "lucide-react";
import { mockItems } from "@/lib/mock-data";
import {
	ITEM_TYPE_COLORS,
	ITEM_TYPE_ICONS,
	ITEM_TYPE_LABELS,
} from "@/lib/constants/item-types";
import { formatRelativeTime } from "@/lib/format-time";

export function RecentItemsSection() {
	const recent = [...mockItems]
		.sort(
			(a, b) =>
				new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
		)
		.slice(0, 10);

	return (
		<section>
			<h2 className="mb-4 text-lg font-semibold">Recent Items</h2>
			<div className="overflow-hidden rounded-lg border bg-card">
				<ul className="divide-y">
					{recent.map((item) => (
						<RecentItemRow key={item.id} item={item} />
					))}
				</ul>
			</div>
		</section>
	);
}

function RecentItemRow({ item }: { item: (typeof mockItems)[number] }) {
	const Icon = ITEM_TYPE_ICONS[item.type] ?? FolderOpen;
	const color = ITEM_TYPE_COLORS[item.type] ?? "#6b7280";
	const typeLabel = ITEM_TYPE_LABELS[item.type] ?? item.type;

	return (
		<li>
			<Link
				href={`/items/${item.type}s/${item.id}`}
				className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-accent"
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
