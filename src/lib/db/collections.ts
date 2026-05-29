import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

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

export async function getSidebarCollections(
	userId: string,
): Promise<SidebarCollection[]> {
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

export type CollectionOption = {
	id: string;
	name: string;
};

export async function getCollectionOptions(
	userId: string,
): Promise<CollectionOption[]> {
	return prisma.collection.findMany({
		where: { userId },
		orderBy: { name: "asc" },
		select: { id: true, name: true },
	});
}

export async function filterOwnedCollectionIds(
	userId: string,
	ids: string[],
): Promise<string[]> {
	if (ids.length === 0) return [];

	const owned = await prisma.collection.findMany({
		where: { userId, id: { in: ids } },
		select: { id: true },
	});

	return owned.map((c) => c.id);
}

export type CreatedCollection = {
	id: string;
	name: string;
	description: string | null;
};

export type CreateCollectionData = {
	name: string;
	description: string | null;
};

export async function createCollection(
	userId: string,
	data: CreateCollectionData,
): Promise<CreatedCollection> {
	const created = await prisma.collection.create({
		data: {
			name: data.name,
			description: data.description,
			user: { connect: { id: userId } },
		},
		select: { id: true, name: true, description: true },
	});

	return created;
}

export type UpdateCollectionData = {
	name: string;
	description: string | null;
};

export async function updateCollection(
	id: string,
	userId: string,
	data: UpdateCollectionData,
): Promise<CreatedCollection | null> {
	try {
		const updated = await prisma.collection.update({
			where: { id, userId },
			data: { name: data.name, description: data.description },
			select: { id: true, name: true, description: true },
		});

		return updated;
	} catch (err) {
		if (
			err instanceof Prisma.PrismaClientKnownRequestError &&
			err.code === "P2025"
		) {
			return null;
		}
		throw err;
	}
}

export type CollectionFavoriteState = CreatedCollection & {
	isFavorite: boolean;
};

export async function toggleCollectionFavorite(
	id: string,
	userId: string,
): Promise<CollectionFavoriteState | null> {
	const existing = await prisma.collection.findFirst({
		where: { id, userId },
		select: { isFavorite: true, updatedAt: true },
	});
	if (!existing) return null;

	const updated = await prisma.collection.update({
		where: { id },
		data: { isFavorite: !existing.isFavorite, updatedAt: existing.updatedAt },
		select: { id: true, name: true, description: true, isFavorite: true },
	});

	return updated;
}

export async function deleteCollection(
	id: string,
	userId: string,
): Promise<boolean> {
	const existing = await prisma.collection.findFirst({
		where: { id, userId },
		select: { id: true },
	});
	if (!existing) return false;

	await prisma.collection.delete({ where: { id } });

	return true;
}

type CollectionRow = {
	id: string;
	name: string;
	description: string | null;
	isFavorite: boolean;
	updatedAt: Date;
	_count: { items: number };
};

async function withTypeCounts(
	collections: CollectionRow[],
): Promise<DashboardCollection[]> {
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

const dashboardCollectionSelect = {
	id: true,
	name: true,
	description: true,
	isFavorite: true,
	updatedAt: true,
	_count: { select: { items: true } },
} as const;

export async function getRecentCollections(
	userId: string,
	limit = 6,
): Promise<DashboardCollection[]> {
	const collections = await prisma.collection.findMany({
		where: { userId },
		orderBy: { updatedAt: "desc" },
		take: limit,
		select: dashboardCollectionSelect,
	});

	return withTypeCounts(collections);
}

export async function getAllCollections(
	userId: string,
): Promise<DashboardCollection[]> {
	const collections = await prisma.collection.findMany({
		where: { userId },
		orderBy: { updatedAt: "desc" },
		select: dashboardCollectionSelect,
	});

	return withTypeCounts(collections);
}
