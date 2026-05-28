import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { buildTypeCounts } from "@/lib/db/type-counts";

export type ProfileUser = {
	id: string;
	name: string | null;
	email: string;
	image: string | null;
	createdAt: Date;
	hasPassword: boolean;
};

export type ProfileTypeBreakdown = {
	name: string;
	count: number;
};

export type ProfileStats = {
	totalItems: number;
	totalCollections: number;
	byType: ProfileTypeBreakdown[];
};

export type ProfileData = {
	user: ProfileUser;
	stats: ProfileStats;
};

const TYPE_ORDER = [
	"snippet",
	"prompt",
	"command",
	"note",
	"link",
	"file",
	"image",
];

export async function getProfile(): Promise<ProfileData | null> {
	const session = await auth();
	if (!session?.user?.id) return null;
	const userId = session.user.id;

	const [user, totalItems, totalCollections, itemTypes, counts] =
		await Promise.all([
			prisma.user.findUnique({
				where: { id: userId },
				select: {
					id: true,
					name: true,
					email: true,
					image: true,
					createdAt: true,
					password: true,
				},
			}),
			prisma.item.count({ where: { userId } }),
			prisma.collection.count({ where: { userId } }),
			prisma.itemType.findMany({
				where: { OR: [{ isSystem: true }, { userId }] },
				select: { id: true, name: true },
			}),
			prisma.item.groupBy({
				by: ["itemTypeId"],
				where: { userId },
				_count: { _all: true },
			}),
		]);

	if (!user) return null;

	const byType = buildTypeCounts(
		itemTypes,
		counts,
		TYPE_ORDER,
		(t, count): ProfileTypeBreakdown => ({ name: t.name, count }),
	);

	return {
		user: {
			id: user.id,
			name: user.name,
			email: user.email,
			image: user.image,
			createdAt: user.createdAt,
			hasPassword: !!user.password,
		},
		stats: {
			totalItems,
			totalCollections,
			byType,
		},
	};
}
