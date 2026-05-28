import { redirect } from "next/navigation";
import { FolderOpen } from "lucide-react";
import { auth } from "@/auth";
import { ItemCard } from "@/components/items/ItemCard";
import { getAllItems } from "@/lib/db/items";

export const dynamic = "force-dynamic";

export default async function AllItemsPage() {
	const session = await auth();
	if (!session?.user?.id) redirect("/login");

	const items = await getAllItems(session.user.id);

	return (
		<div className="flex flex-col gap-6">
			<header className="flex items-center gap-3">
				<FolderOpen className="size-6 shrink-0 text-muted-foreground" />
				<h1 className="text-2xl font-semibold">All Items</h1>
				<span className="text-sm text-muted-foreground">
					{items.length} {items.length === 1 ? "item" : "items"}
				</span>
			</header>

			{items.length === 0 ? (
				<p className="text-sm text-muted-foreground">No items yet.</p>
			) : (
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
					{items.map((item) => (
						<ItemCard key={item.id} item={item} />
					))}
				</div>
			)}
		</div>
	);
}
