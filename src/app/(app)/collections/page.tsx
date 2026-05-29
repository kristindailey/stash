import { redirect } from "next/navigation";
import { FolderOpen } from "lucide-react";
import { auth } from "@/auth";
import { CollectionCard } from "@/components/collections/CollectionCard";
import { Pagination } from "@/components/shared/Pagination";
import { COLLECTIONS_PER_PAGE } from "@/lib/constants/pagination";
import { getPaginatedCollections } from "@/lib/db/collections";
import { parsePage } from "@/lib/pagination";

export const dynamic = "force-dynamic";

export default async function CollectionsPage({
	searchParams,
}: PageProps<"/collections">) {
	const session = await auth();
	if (!session?.user?.id) redirect("/login");

	const page = parsePage((await searchParams).page);
	const { collections, totalCount } = await getPaginatedCollections(
		session.user.id,
		page,
	);
	const totalPages = Math.max(1, Math.ceil(totalCount / COLLECTIONS_PER_PAGE));

	return (
		<div className="flex flex-col gap-6">
			<header className="flex items-center gap-3">
				<FolderOpen className="size-6 shrink-0 text-muted-foreground" />
				<h1 className="text-2xl font-semibold">Collections</h1>
				<span className="text-sm text-muted-foreground">
					{totalCount} {totalCount === 1 ? "collection" : "collections"}
				</span>
			</header>

			{totalCount === 0 ? (
				<p className="text-sm text-muted-foreground">No collections yet.</p>
			) : (
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{collections.map((collection) => (
						<CollectionCard key={collection.id} collection={collection} />
					))}
				</div>
			)}

			<Pagination
				basePath="/collections"
				currentPage={page}
				totalPages={totalPages}
			/>
		</div>
	);
}
