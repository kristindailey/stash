import { prisma } from "@/lib/prisma";
import { itemInclude, toDashboardItem, type DashboardItem } from "@/lib/db/items";
import {
	DASHBOARD_RECENT_ITEMS_LIMIT,
	ITEMS_PER_PAGE,
} from "@/lib/constants/pagination";

export type DashboardItemStats = {
	totalItems: number;
	totalCollections: number;
	favoriteItems: number;
	favoriteCollections: number;
};

export async function getPinnedItems(userId: string): Promise<DashboardItem[]> {
	const items = await prisma.item.findMany({
		where: { userId, isPinned: true },
		orderBy: { updatedAt: "desc" },
		include: itemInclude,
	});

	return items.map(toDashboardItem);
}

export type PaginatedItems = {
	items: DashboardItem[];
	totalCount: number;
};

export async function getItemsByType(
	userId: string,
	typeName: string,
	page = 1,
	perPage = ITEMS_PER_PAGE,
): Promise<PaginatedItems | null> {
	const itemType = await prisma.itemType.findFirst({
		where: { name: typeName, OR: [{ isSystem: true }, { userId }] },
		select: { id: true },
	});
	if (!itemType) return null;

	const where = { userId, itemTypeId: itemType.id };
	const [items, totalCount] = await Promise.all([
		prisma.item.findMany({
			where,
			orderBy: { updatedAt: "desc" },
			skip: (page - 1) * perPage,
			take: perPage,
			include: itemInclude,
		}),
		prisma.item.count({ where }),
	]);

	return { items: items.map(toDashboardItem), totalCount };
}

export type CollectionWithItems = {
	id: string;
	name: string;
	description: string | null;
	isFavorite: boolean;
	items: DashboardItem[];
	totalItems: number;
};

export async function getCollectionWithItems(
	userId: string,
	collectionId: string,
	page = 1,
	perPage = ITEMS_PER_PAGE,
): Promise<CollectionWithItems | null> {
	const collection = await prisma.collection.findFirst({
		where: { id: collectionId, userId },
		select: {
			id: true,
			name: true,
			description: true,
			isFavorite: true,
		},
	});
	if (!collection) return null;

	const [links, totalItems] = await Promise.all([
		prisma.itemCollection.findMany({
			where: { collectionId },
			orderBy: { item: { updatedAt: "desc" } },
			skip: (page - 1) * perPage,
			take: perPage,
			select: { item: { include: itemInclude } },
		}),
		prisma.itemCollection.count({ where: { collectionId } }),
	]);

	return {
		id: collection.id,
		name: collection.name,
		description: collection.description,
		isFavorite: collection.isFavorite,
		items: links.map((link) => toDashboardItem(link.item)),
		totalItems,
	};
}

export async function getAllItems(userId: string): Promise<DashboardItem[]> {
	const items = await prisma.item.findMany({
		where: { userId },
		orderBy: { updatedAt: "desc" },
		include: itemInclude,
	});

	return items.map(toDashboardItem);
}

export async function getPaginatedItems(
	userId: string,
	page = 1,
	perPage = ITEMS_PER_PAGE,
): Promise<PaginatedItems> {
	const where = { userId };
	const [items, totalCount] = await Promise.all([
		prisma.item.findMany({
			where,
			orderBy: { updatedAt: "desc" },
			skip: (page - 1) * perPage,
			take: perPage,
			include: itemInclude,
		}),
		prisma.item.count({ where }),
	]);

	return { items: items.map(toDashboardItem), totalCount };
}

export async function getRecentItems(
	userId: string,
	limit = DASHBOARD_RECENT_ITEMS_LIMIT,
): Promise<DashboardItem[]> {
	const items = await prisma.item.findMany({
		where: { userId },
		orderBy: { updatedAt: "desc" },
		take: limit,
		include: itemInclude,
	});

	return items.map(toDashboardItem);
}

export async function getDashboardStats(
	userId: string,
): Promise<DashboardItemStats> {
	const [totalItems, totalCollections, favoriteItems, favoriteCollections] =
		await Promise.all([
			prisma.item.count({ where: { userId } }),
			prisma.collection.count({ where: { userId } }),
			prisma.item.count({ where: { userId, isFavorite: true } }),
			prisma.collection.count({ where: { userId, isFavorite: true } }),
		]);

	return {
		totalItems,
		totalCollections,
		favoriteItems,
		favoriteCollections,
	};
}
