import Link from "next/link";
import { FolderOpen, Star } from "lucide-react";
import {
	ITEM_TYPE_COLORS,
	ITEM_TYPE_ICONS,
	ITEM_TYPE_LABELS,
} from "@/lib/constants/item-types";
import type { DashboardCollection } from "@/lib/db/collections";

export function CollectionCard({
	collection,
}: {
	collection: DashboardCollection;
}) {
	const Icon = collection.isFavorite ? Star : FolderOpen;
	const borderColor = collection.dominantType
		? ITEM_TYPE_COLORS[collection.dominantType]
		: undefined;

	return (
		<Link
			href={`/collections/${collection.id}`}
			className="flex flex-col gap-3 rounded-lg border border-l-4 bg-card p-4 transition-colors hover:bg-accent"
			style={borderColor ? { borderLeftColor: borderColor } : undefined}
		>
			<div className="flex items-center gap-2">
				<Icon
					className="size-4 shrink-0"
					style={collection.isFavorite ? { color: "#f59e0b" } : undefined}
					fill={collection.isFavorite ? "currentColor" : "none"}
				/>
				<h3 className="truncate font-semibold">{collection.name}</h3>
			</div>
			{collection.description ? (
				<p className="line-clamp-2 text-sm text-muted-foreground">
					{collection.description}
				</p>
			) : null}
			<div className="mt-auto flex items-center justify-between gap-2">
				<div className="flex items-center gap-1.5">
					{collection.typeCounts.map(({ name, count }) => {
						const TypeIcon = ITEM_TYPE_ICONS[name];
						const color = ITEM_TYPE_COLORS[name];
						if (!TypeIcon || !color) return null;
						return (
							<span
								key={name}
								title={`${count} ${ITEM_TYPE_LABELS[name] ?? name}${count === 1 ? "" : "s"}`}
								className="inline-flex size-5 items-center justify-center rounded-sm"
								style={{
									color,
									backgroundColor: `${color}1f`,
								}}
							>
								<TypeIcon className="size-3" />
							</span>
						);
					})}
				</div>
				<p className="text-xs text-muted-foreground">
					{collection.itemCount}{" "}
					{collection.itemCount === 1 ? "item" : "items"}
				</p>
			</div>
		</Link>
	);
}
