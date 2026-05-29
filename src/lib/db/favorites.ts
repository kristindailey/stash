import { prisma } from "@/lib/prisma";
import { itemInclude, toDashboardItem, type DashboardItem } from "@/lib/db/items";

export type FavoriteCollection = {
	id: string;
	name: string;
	itemCount: number;
	updatedAt: Date;
};

export type Favorites = {
	items: DashboardItem[];
	collections: FavoriteCollection[];
};

export async function getFavorites(userId: string): Promise<Favorites> {
	const [items, collections] = await Promise.all([
		prisma.item.findMany({
			where: { userId, isFavorite: true },
			orderBy: { updatedAt: "desc" },
			include: itemInclude,
		}),
		prisma.collection.findMany({
			where: { userId, isFavorite: true },
			orderBy: { updatedAt: "desc" },
			select: {
				id: true,
				name: true,
				updatedAt: true,
				_count: { select: { items: true } },
			},
		}),
	]);

	return {
		items: items.map(toDashboardItem),
		collections: collections.map((c) => ({
			id: c.id,
			name: c.name,
			itemCount: c._count.items,
			updatedAt: c.updatedAt,
		})),
	};
}
