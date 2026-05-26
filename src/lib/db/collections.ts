import { prisma } from "@/lib/prisma";
import { getDemoUserId } from "@/lib/db/get-user-id";

export type CollectionTypeCount = {
	name: string;
	count: number;
};

export type DashboardCollection = {
	id: string;
	name: string;
	description: string | null;
	isFavorite: boolean;
	itemCount: number;
	typeCounts: CollectionTypeCount[];
	dominantType: string | null;
	updatedAt: Date;
};

export type SidebarCollection = {
	id: string;
	name: string;
	isFavorite: boolean;
	itemCount: number;
	updatedAt: Date;
};

export async function getSidebarCollections(): Promise<SidebarCollection[]> {
	const userId = await getDemoUserId();
	if (!userId) return [];

	const collections = await prisma.collection.findMany({
		where: { userId },
		orderBy: { updatedAt: "desc" },
		select: {
			id: true,
			name: true,
			isFavorite: true,
			updatedAt: true,
			_count: { select: { items: true } },
		},
	});

	return collections.map((c) => ({
		id: c.id,
		name: c.name,
		isFavorite: c.isFavorite,
		itemCount: c._count.items,
		updatedAt: c.updatedAt,
	}));
}

export async function getRecentCollections(
	limit = 6,
): Promise<DashboardCollection[]> {
	const userId = await getDemoUserId();
	if (!userId) return [];

	const collections = await prisma.collection.findMany({
		where: { userId },
		orderBy: { updatedAt: "desc" },
		take: limit,
		select: {
			id: true,
			name: true,
			description: true,
			isFavorite: true,
			updatedAt: true,
			_count: { select: { items: true } },
		},
	});

	if (collections.length === 0) return [];

	const collectionIds = collections.map((c) => c.id);
	const links = await prisma.itemCollection.findMany({
		where: { collectionId: { in: collectionIds } },
		select: {
			collectionId: true,
			item: { select: { itemType: { select: { name: true } } } },
		},
	});

	const countsByCollection = new Map<string, Map<string, number>>();
	for (const link of links) {
		const typeName = link.item.itemType.name;
		let typeMap = countsByCollection.get(link.collectionId);
		if (!typeMap) {
			typeMap = new Map();
			countsByCollection.set(link.collectionId, typeMap);
		}
		typeMap.set(typeName, (typeMap.get(typeName) ?? 0) + 1);
	}

	return collections.map((collection) => {
		const counts = countsByCollection.get(collection.id) ?? new Map();
		const typeCounts: CollectionTypeCount[] = [...counts.entries()]
			.map(([name, count]) => ({ name, count: count as number }))
			.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

		return {
			id: collection.id,
			name: collection.name,
			description: collection.description,
			isFavorite: collection.isFavorite,
			itemCount: collection._count.items,
			typeCounts,
			dominantType: typeCounts[0]?.name ?? null,
			updatedAt: collection.updatedAt,
		};
	});
}
