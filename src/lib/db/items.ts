import { prisma } from "@/lib/prisma";
import { deleteFromR2, keyFromPublicUrl } from "@/lib/r2";

export type DashboardItem = {
	id: string;
	title: string;
	description: string | null;
	type: string;
	contentType: "TEXT" | "FILE" | "URL";
	content: string | null;
	url: string | null;
	fileUrl: string | null;
	fileName: string | null;
	fileSize: number | null;
	language: string | null;
	tags: string[];
	isFavorite: boolean;
	isPinned: boolean;
	updatedAt: Date;
};

export type ItemDetail = DashboardItem & {
	createdAt: Date;
	collections: { id: string; name: string }[];
};

export type DashboardItemStats = {
	totalItems: number;
	totalCollections: number;
	favoriteItems: number;
	favoriteCollections: number;
};

export type SidebarItemType = {
	id: string;
	name: string;
	label: string;
	icon: string;
	color: string;
	count: number;
	route: string;
};

export type SidebarItemTypes = {
	totalCount: number;
	types: SidebarItemType[];
};

const SYSTEM_TYPE_ORDER = [
	"snippet",
	"prompt",
	"command",
	"note",
	"file",
	"image",
	"link",
];

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
	fileUrl: string | null;
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
		fileUrl: item.fileUrl,
		fileName: item.fileName,
		fileSize: item.fileSize,
		language: item.language,
		tags: item.tags.map((tag) => tag.name),
		isFavorite: item.isFavorite,
		isPinned: item.isPinned,
		updatedAt: item.updatedAt,
	};
}

const itemDetailInclude = {
	itemType: { select: { name: true } },
	tags: { select: { name: true } },
	collections: {
		select: { collection: { select: { id: true, name: true } } },
	},
} as const;

type ItemWithDetail = ItemWithRelations & {
	createdAt: Date;
	collections: { collection: { id: string; name: string } }[];
};

function toItemDetail(item: ItemWithDetail): ItemDetail {
	return {
		...toDashboardItem(item),
		createdAt: item.createdAt,
		collections: item.collections.map((c) => c.collection),
	};
}

export async function getItemById(
	id: string,
	userId: string,
): Promise<ItemDetail | null> {
	const item = await prisma.item.findFirst({
		where: { id, userId },
		include: itemDetailInclude,
	});
	if (!item) return null;

	return toItemDetail(item);
}

export type UpdateItemData = {
	title: string;
	description: string | null;
	content: string | null;
	url: string | null;
	language: string | null;
	tags: string[];
};

export async function updateItem(
	id: string,
	userId: string,
	data: UpdateItemData,
): Promise<ItemDetail | null> {
	const existing = await prisma.item.findFirst({
		where: { id, userId },
		select: { id: true },
	});
	if (!existing) return null;

	const updated = await prisma.item.update({
		where: { id },
		data: {
			title: data.title,
			description: data.description,
			content: data.content,
			url: data.url,
			language: data.language,
			tags: {
				set: [],
				connectOrCreate: data.tags.map((name) => ({
					where: { name },
					create: { name },
				})),
			},
		},
		include: itemDetailInclude,
	});

	return toItemDetail(updated);
}

export type CreateItemData = {
	title: string;
	type: string;
	description: string | null;
	content: string | null;
	url: string | null;
	language: string | null;
	tags: string[];
	fileUrl?: string | null;
	fileName?: string | null;
	fileSize?: number | null;
};

export async function createItem(
	userId: string,
	data: CreateItemData,
): Promise<ItemDetail | null> {
	const itemType = await prisma.itemType.findFirst({
		where: { name: data.type, OR: [{ isSystem: true }, { userId }] },
		select: { id: true },
	});
	if (!itemType) return null;

	const contentType =
		data.type === "link" ? "URL" : data.type === "file" || data.type === "image" ? "FILE" : "TEXT";

	const created = await prisma.item.create({
		data: {
			title: data.title,
			description: data.description,
			content: data.content,
			url: data.url,
			language: data.language,
			fileUrl: data.fileUrl ?? null,
			fileName: data.fileName ?? null,
			fileSize: data.fileSize ?? null,
			contentType,
			user: { connect: { id: userId } },
			itemType: { connect: { id: itemType.id } },
			tags: {
				connectOrCreate: data.tags.map((name) => ({
					where: { name },
					create: { name },
				})),
			},
		},
		include: itemDetailInclude,
	});

	return toItemDetail(created);
}

export async function toggleItemFavorite(
	id: string,
	userId: string,
): Promise<ItemDetail | null> {
	const existing = await prisma.item.findFirst({
		where: { id, userId },
		select: { isFavorite: true, updatedAt: true },
	});
	if (!existing) return null;

	const updated = await prisma.item.update({
		where: { id },
		data: { isFavorite: !existing.isFavorite, updatedAt: existing.updatedAt },
		include: itemDetailInclude,
	});

	return toItemDetail(updated);
}

export async function toggleItemPinned(
	id: string,
	userId: string,
): Promise<ItemDetail | null> {
	const existing = await prisma.item.findFirst({
		where: { id, userId },
		select: { isPinned: true, updatedAt: true },
	});
	if (!existing) return null;

	const updated = await prisma.item.update({
		where: { id },
		data: { isPinned: !existing.isPinned, updatedAt: existing.updatedAt },
		include: itemDetailInclude,
	});

	return toItemDetail(updated);
}

export async function deleteItem(id: string, userId: string): Promise<boolean> {
	const existing = await prisma.item.findFirst({
		where: { id, userId },
		select: { id: true, fileUrl: true },
	});
	if (!existing) return false;

	await prisma.item.delete({ where: { id } });

	if (existing.fileUrl) {
		const key = keyFromPublicUrl(existing.fileUrl);
		if (key) {
			try {
				await deleteFromR2(key);
			} catch (err) {
				console.error("R2 delete failed for key", key, err);
			}
		}
	}

	return true;
}

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

export async function getSidebarItemTypes(
	userId: string,
): Promise<SidebarItemTypes> {
	const [itemTypes, counts] = await Promise.all([
		prisma.itemType.findMany({
			where: { OR: [{ isSystem: true }, { userId }] },
			select: { id: true, name: true, icon: true, color: true },
		}),
		prisma.item.groupBy({
			by: ["itemTypeId"],
			where: { userId },
			_count: { _all: true },
		}),
	]);

	const countMap = new Map(counts.map((c) => [c.itemTypeId, c._count._all]));
	const totalCount = counts.reduce((sum, c) => sum + c._count._all, 0);

	const orderIndex = (name: string) => {
		const i = SYSTEM_TYPE_ORDER.indexOf(name);
		return i === -1 ? SYSTEM_TYPE_ORDER.length : i;
	};

	const types: SidebarItemType[] = itemTypes
		.map((t) => ({
			id: t.id,
			name: t.name,
			label: `${t.name.charAt(0).toUpperCase()}${t.name.slice(1)}s`,
			icon: t.icon,
			color: t.color,
			count: countMap.get(t.id) ?? 0,
			route: `/items/${t.name}s`,
		}))
		.sort(
			(a, b) =>
				orderIndex(a.name) - orderIndex(b.name) || a.name.localeCompare(b.name),
		);

	return { totalCount, types };
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
