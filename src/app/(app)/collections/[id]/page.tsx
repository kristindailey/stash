import { notFound, redirect } from "next/navigation";
import { FolderOpen, Star } from "lucide-react";
import { auth } from "@/auth";
import { CollectionDetailActions } from "@/components/collections/CollectionDetailActions";
import { FileRow } from "@/components/items/FileRow";
import { ImageCard } from "@/components/items/ImageCard";
import { ItemCard } from "@/components/items/ItemCard";
import { Pagination } from "@/components/shared/Pagination";
import { ITEMS_PER_PAGE } from "@/lib/constants/pagination";
import { getCollectionWithItems } from "@/lib/db/dashboard";
import { parsePage } from "@/lib/pagination";

export const dynamic = "force-dynamic";

export default async function CollectionDetailPage({
	params,
	searchParams,
}: PageProps<"/collections/[id]">) {
	const { id } = await params;

	const session = await auth();
	if (!session?.user?.id) redirect("/login");

	const page = parsePage((await searchParams).page);
	const collection = await getCollectionWithItems(session.user.id, id, page);
	if (!collection) notFound();

	const { items, totalItems } = collection;
	const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
	const Icon = collection.isFavorite ? Star : FolderOpen;

	const images = items.filter((item) => item.type === "image");
	const files = items.filter((item) => item.type === "file");
	const otherItems = items.filter(
		(item) => item.type !== "image" && item.type !== "file",
	);

	return (
		<div className="flex flex-col gap-6">
			<header className="flex flex-col gap-2">
				<div className="flex items-center gap-3">
					<Icon
						className="size-6 shrink-0"
						style={collection.isFavorite ? { color: "#f59e0b" } : undefined}
						fill={collection.isFavorite ? "currentColor" : "none"}
					/>
					<h1 className="text-2xl font-semibold">{collection.name}</h1>
					<span className="text-sm text-muted-foreground">
						{totalItems} {totalItems === 1 ? "item" : "items"}
					</span>
					<div className="ml-auto">
						<CollectionDetailActions collection={collection} />
					</div>
				</div>
				{collection.description && (
					<p className="text-sm text-muted-foreground">
						{collection.description}
					</p>
				)}
			</header>

			{totalItems === 0 ? (
				<p className="text-sm text-muted-foreground">
					This collection is empty.
				</p>
			) : (
				<>
					{otherItems.length > 0 && (
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
							{otherItems.map((item) => (
								<ItemCard key={item.id} item={item} />
							))}
						</div>
					)}

					{images.length > 0 && (
						<section className="flex flex-col gap-4">
							<h2 className="text-lg font-semibold">Images</h2>
							<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
								{images.map((item) => (
									<ImageCard key={item.id} item={item} />
								))}
							</div>
						</section>
					)}

					{files.length > 0 && (
						<section className="flex flex-col gap-4">
							<h2 className="text-lg font-semibold">Files</h2>
							<div className="flex flex-col gap-2">
								{files.map((item) => (
									<FileRow key={item.id} item={item} />
								))}
							</div>
						</section>
					)}
				</>
			)}

			<Pagination
				basePath={`/collections/${id}`}
				currentPage={page}
				totalPages={totalPages}
			/>
		</div>
	);
}
