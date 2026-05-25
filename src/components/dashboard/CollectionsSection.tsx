import Link from "next/link";
import { FolderOpen, Star } from "lucide-react";
import {
	ITEM_TYPE_COLORS,
	ITEM_TYPE_ICONS,
	ITEM_TYPE_LABELS,
} from "@/lib/constants/item-types";
import {
	getRecentCollections,
	type DashboardCollection,
} from "@/lib/db/collections";

export async function CollectionsSection() {
	const collections = await getRecentCollections(6);

	return (
		<section>
			<div className="mb-4 flex items-center justify-between">
				<h2 className="text-lg font-semibold">Collections</h2>
				<Link
					href="/collections"
					className="text-sm text-muted-foreground hover:text-foreground"
				>
					View All
				</Link>
			</div>
			{collections.length === 0 ? (
				<p className="text-sm text-muted-foreground">No collections yet.</p>
			) : (
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{collections.map((collection) => (
						<CollectionCard key={collection.id} collection={collection} />
					))}
				</div>
			)}
		</section>
	);
}

function CollectionCard({ collection }: { collection: DashboardCollection }) {
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
						if (!TypeIcon) return null;
						return (
							<span
								key={name}
								title={`${count} ${ITEM_TYPE_LABELS[name] ?? name}${count === 1 ? "" : "s"}`}
								className="inline-flex size-5 items-center justify-center rounded-sm"
								style={{
									color: ITEM_TYPE_COLORS[name],
									backgroundColor: `${ITEM_TYPE_COLORS[name]}1f`,
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
