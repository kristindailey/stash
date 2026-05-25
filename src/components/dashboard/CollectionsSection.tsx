import Link from "next/link";
import { FolderOpen, Star } from "lucide-react";
import { mockCollections } from "@/lib/mock-data";

export function CollectionsSection() {
	const recent = [...mockCollections]
		.sort(
			(a, b) =>
				new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
		)
		.slice(0, 6);

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
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{recent.map((collection) => (
					<CollectionCard key={collection.id} collection={collection} />
				))}
			</div>
		</section>
	);
}

function CollectionCard({
	collection,
}: {
	collection: (typeof mockCollections)[number];
}) {
	const Icon = collection.isFavorite ? Star : FolderOpen;
	return (
		<Link
			href={`/collections/${collection.id}`}
			className="flex flex-col gap-3 rounded-lg border bg-card p-4 transition-colors hover:bg-accent"
		>
			<div className="flex items-center gap-2">
				<Icon
					className="size-4 shrink-0"
					style={
						collection.isFavorite ? { color: "#f59e0b" } : undefined
					}
					fill={collection.isFavorite ? "currentColor" : "none"}
				/>
				<h3 className="truncate font-semibold">{collection.name}</h3>
			</div>
			<p className="line-clamp-2 text-sm text-muted-foreground">
				{collection.description}
			</p>
			<p className="text-xs text-muted-foreground">
				{collection.itemCount} items
			</p>
		</Link>
	);
}
