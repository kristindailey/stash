import { prisma } from "@/lib/prisma";

const DEMO_USER_EMAIL = "demo@devstash.io";

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
	const user = await prisma.user.findUnique({
		where: { email: DEMO_USER_EMAIL },
		select: { id: true },
	});

	if (!user) return [];

	const collections = await prisma.collection.findMany({
		where: { userId: user.id },
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
	const user = await prisma.user.findUnique({
		where: { email: DEMO_USER_EMAIL },
		select: { id: true },
	});

	if (!user) return [];

	const collections = await prisma.collection.findMany({
		where: { userId: user.id },
		orderBy: { updatedAt: "desc" },
		take: limit,
		include: {
			items: {
				include: {
					item: {
						select: {
							itemType: { select: { name: true } },
						},
					},
				},
			},
		},
	});

	return collections.map((collection) => {
		const counts = new Map<string, number>();
		for (const link of collection.items) {
			const name = link.item.itemType.name;
			counts.set(name, (counts.get(name) ?? 0) + 1);
		}

		const typeCounts: CollectionTypeCount[] = [...counts.entries()]
			.map(([name, count]) => ({ name, count }))
			.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

		return {
			id: collection.id,
			name: collection.name,
			description: collection.description,
			isFavorite: collection.isFavorite,
			itemCount: collection.items.length,
			typeCounts,
			dominantType: typeCounts[0]?.name ?? null,
			updatedAt: collection.updatedAt,
		};
	});
}
