import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { FavoritesList } from "@/components/favorites/FavoritesList";
import { getFavorites } from "@/lib/db/favorites";

export const dynamic = "force-dynamic";

export default async function FavoritesPage() {
	const session = await auth();
	if (!session?.user?.id) redirect("/login");

	const { items, collections } = await getFavorites(session.user.id);

	return (
		<div className="flex flex-col gap-6">
			<FavoritesList items={items} collections={collections} />
		</div>
	);
}
