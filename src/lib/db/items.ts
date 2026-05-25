import { prisma } from "@/lib/prisma";

const DEMO_USER_EMAIL = "demo@devstash.io";

export type DashboardItem = {
	id: string;
	title: string;
	description: string | null;
	type: string;
	contentType: "TEXT" | "FILE" | "URL";
	content: string | null;
	url: string | null;
	fileName: string | null;
	fileSize: number | null;
	language: string | null;
	tags: string[];
	isFavorite: boolean;
	isPinned: boolean;
	updatedAt: Date;
};

export type DashboardItemStats = {
	totalItems: number;
	totalCollections: number;
	favoriteItems: number;
	favoriteCollections: number;
};

async function getDemoUserId(): Promise<string | null> {
	const user = await prisma.user.findUnique({
		where: { email: DEMO_USER_EMAIL },
		select: { id: true },
	});
	return user?.id ?? null;
}

const itemInclude = {
	itemType: { select: { name: true } },
	tags: { select: { name: true } },
} as const;

type ItemWithRelations = {
	id: string;
	title: string;
	description: string | null;
	contentType: "TEXT" | "FILE" | "URL";
	content: string | null;
	url: string | null;
	fileName: string | null;
	fileSize: number | null;
	language: string | null;
	isFavorite: boolean;
	isPinned: boolean;
	updatedAt: Date;
	itemType: { name: string };
	tags: { name: string }[];
};

function toDashboardItem(item: ItemWithRelations): DashboardItem {
	return {
		id: item.id,
		title: item.title,
		description: item.description,
		type: item.itemType.name,
		contentType: item.contentType,
		content: item.content,
		url: item.url,
		fileName: item.fileName,
		fileSize: item.fileSize,
		language: item.language,
		tags: item.tags.map((tag) => tag.name),
		isFavorite: item.isFavorite,
		isPinned: item.isPinned,
		updatedAt: item.updatedAt,
	};
}

export async function getPinnedItems(): Promise<DashboardItem[]> {
	const userId = await getDemoUserId();
	if (!userId) return [];

	const items = await prisma.item.findMany({
		where: { userId, isPinned: true },
		orderBy: { updatedAt: "desc" },
		include: itemInclude,
	});

	return items.map(toDashboardItem);
}

export async function getRecentItems(limit = 10): Promise<DashboardItem[]> {
	const userId = await getDemoUserId();
	if (!userId) return [];

	const items = await prisma.item.findMany({
		where: { userId },
		orderBy: { updatedAt: "desc" },
		take: limit,
		include: itemInclude,
	});

	return items.map(toDashboardItem);
}

export async function getDashboardStats(): Promise<DashboardItemStats> {
	const userId = await getDemoUserId();
	if (!userId) {
		return {
			totalItems: 0,
			totalCollections: 0,
			favoriteItems: 0,
			favoriteCollections: 0,
		};
	}

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
