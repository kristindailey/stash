import Link from "next/link";
import { FolderOpen, Star } from "lucide-react";
import {
	ITEM_TYPE_COLORS,
	ITEM_TYPE_ICONS,
	ITEM_TYPE_LABELS,
} from "@/lib/constants/item-types";
import { CollectionCardMenu } from "@/components/collections/CollectionCardMenu";
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
		<div
			className="relative flex flex-col gap-3 rounded-lg border border-l-4 bg-card p-4 transition-colors hover:bg-accent"
			style={borderColor ? { borderLeftColor: borderColor } : undefined}
		>
			<Link
				href={`/collections/${collection.id}`}
				className="absolute inset-0 rounded-lg"
				aria-label={`Open ${collection.name}`}
			/>
			<div className="flex items-center gap-2">
				<Icon
					className="pointer-events-none size-4 shrink-0"
					style={collection.isFavorite ? { color: "#fcd757" } : undefined}
					fill={collection.isFavorite ? "currentColor" : "none"}
				/>
				<h3 className="pointer-events-none truncate font-semibold">
					{collection.name}
				</h3>
				<div className="relative z-10 ml-auto">
					<CollectionCardMenu collection={collection} />
				</div>
			</div>
			{collection.description ? (
				<p className="pointer-events-none line-clamp-2 text-sm text-muted-foreground">
					{collection.description}
				</p>
			) : null}
			<div className="pointer-events-none mt-auto flex items-center justify-between gap-2">
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
		</div>
	);
}
