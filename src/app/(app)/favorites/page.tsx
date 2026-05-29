import { redirect } from "next/navigation";
import { Star } from "lucide-react";
import { auth } from "@/auth";
import { FavoritesList } from "@/components/favorites/FavoritesList";
import { getFavorites } from "@/lib/db/favorites";

export const dynamic = "force-dynamic";

export default async function FavoritesPage() {
	const session = await auth();
	if (!session?.user?.id) redirect("/login");

	const { items, collections } = await getFavorites(session.user.id);
	const totalCount = items.length + collections.length;

	return (
		<div className="flex flex-col gap-6">
			<header className="flex items-center gap-3">
				<Star className="size-6 shrink-0 text-amber-500" fill="currentColor" />
				<h1 className="text-2xl font-semibold">Favorites</h1>
				<span className="text-sm text-muted-foreground">{totalCount}</span>
			</header>

			{totalCount === 0 ? (
				<p className="text-sm text-muted-foreground">
					No favorites yet. Star an item or collection to see it here.
				</p>
			) : (
				<FavoritesList items={items} collections={collections} />
			)}
		</div>
	);
}
