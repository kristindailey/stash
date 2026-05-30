import { prisma } from "@/lib/prisma";
import {
	FREE_COLLECTION_LIMIT,
	FREE_ITEM_LIMIT,
	PRO_ONLY_TYPES,
} from "@/lib/constants/limits";

export type UserPlan = { isPro: boolean };

export async function getUserPlan(userId: string): Promise<UserPlan> {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: { isPro: true },
	});
	return { isPro: user?.isPro ?? false };
}

export type UserUsage = { itemCount: number; collectionCount: number };

export async function getUserUsage(userId: string): Promise<UserUsage> {
	const [itemCount, collectionCount] = await Promise.all([
		prisma.item.count({ where: { userId } }),
		prisma.collection.count({ where: { userId } }),
	]);
	return { itemCount, collectionCount };
}

export async function checkItemQuota(userId: string): Promise<string | null> {
	const { isPro } = await getUserPlan(userId);
	if (isPro) return null;

	const count = await prisma.item.count({ where: { userId } });
	if (count >= FREE_ITEM_LIMIT) {
		return `Free plan is limited to ${FREE_ITEM_LIMIT} items. Upgrade to Pro for unlimited items.`;
	}

	return null;
}

export async function checkCollectionQuota(
	userId: string,
): Promise<string | null> {
	const { isPro } = await getUserPlan(userId);
	if (isPro) return null;

	const count = await prisma.collection.count({ where: { userId } });
	if (count >= FREE_COLLECTION_LIMIT) {
		return `Free plan is limited to ${FREE_COLLECTION_LIMIT} collections. Upgrade to Pro for unlimited collections.`;
	}

	return null;
}

export async function checkProType(
	userId: string,
	type: string,
): Promise<string | null> {
	if (!PRO_ONLY_TYPES.has(type)) return null;

	const { isPro } = await getUserPlan(userId);
	if (isPro) return null;

	return `${type === "image" ? "Images" : "Files"} are a Pro feature. Upgrade to Pro to use them.`;
}
