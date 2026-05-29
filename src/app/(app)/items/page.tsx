import { redirect } from "next/navigation";
import { FolderOpen } from "lucide-react";
import { auth } from "@/auth";
import { ItemCard } from "@/components/items/ItemCard";
import { Pagination } from "@/components/shared/Pagination";
import { ITEMS_PER_PAGE } from "@/lib/constants/pagination";
import { getPaginatedItems } from "@/lib/db/dashboard";
import { parsePage } from "@/lib/pagination";

export const dynamic = "force-dynamic";

export default async function AllItemsPage({
	searchParams,
}: PageProps<"/items">) {
	const session = await auth();
	if (!session?.user?.id) redirect("/login");

	const page = parsePage((await searchParams).page);
	const { items, totalCount } = await getPaginatedItems(session.user.id, page);
	const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));

	return (
		<div className="flex flex-col gap-6">
			<header className="flex items-center gap-3">
				<FolderOpen className="size-6 shrink-0 text-muted-foreground" />
				<h1 className="text-2xl font-semibold">All Items</h1>
				<span className="text-sm text-muted-foreground">
					{totalCount} {totalCount === 1 ? "item" : "items"}
				</span>
			</header>

			{totalCount === 0 ? (
				<p className="text-sm text-muted-foreground">No items yet.</p>
			) : (
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
					{items.map((item) => (
						<ItemCard key={item.id} item={item} />
					))}
				</div>
			)}

			<Pagination basePath="/items" currentPage={page} totalPages={totalPages} />
		</div>
	);
}
