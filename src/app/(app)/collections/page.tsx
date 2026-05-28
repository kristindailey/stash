import { redirect } from "next/navigation";
import { FolderOpen } from "lucide-react";
import { auth } from "@/auth";
import { CollectionCard } from "@/components/collections/CollectionCard";
import { getAllCollections } from "@/lib/db/collections";

export const dynamic = "force-dynamic";

export default async function CollectionsPage() {
	const session = await auth();
	if (!session?.user?.id) redirect("/login");

	const collections = await getAllCollections(session.user.id);

	return (
		<div className="flex flex-col gap-6">
			<header className="flex items-center gap-3">
				<FolderOpen className="size-6 shrink-0 text-muted-foreground" />
				<h1 className="text-2xl font-semibold">Collections</h1>
				<span className="text-sm text-muted-foreground">
					{collections.length}{" "}
					{collections.length === 1 ? "collection" : "collections"}
				</span>
			</header>

			{collections.length === 0 ? (
				<p className="text-sm text-muted-foreground">No collections yet.</p>
			) : (
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{collections.map((collection) => (
						<CollectionCard key={collection.id} collection={collection} />
					))}
				</div>
			)}
		</div>
	);
}
