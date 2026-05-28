import { prisma } from "@/lib/prisma";
import { itemInclude, toDashboardItem, type DashboardItem } from "@/lib/db/items";

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

export async function getItemsByType(
	userId: string,
	typeName: string,
): Promise<DashboardItem[] | null> {
	const itemType = await prisma.itemType.findFirst({
		where: { name: typeName, OR: [{ isSystem: true }, { userId }] },
		select: { id: true },
	});
	if (!itemType) return null;

	const items = await prisma.item.findMany({
		where: { userId, itemTypeId: itemType.id },
		orderBy: { updatedAt: "desc" },
		include: itemInclude,
	});

	return items.map(toDashboardItem);
}

export async function getAllItems(userId: string): Promise<DashboardItem[]> {
	const items = await prisma.item.findMany({
		where: { userId },
		orderBy: { updatedAt: "desc" },
		include: itemInclude,
	});

	return items.map(toDashboardItem);
}

export async function getRecentItems(
	userId: string,
	limit = 10,
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
