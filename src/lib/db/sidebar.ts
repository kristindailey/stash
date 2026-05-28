import { prisma } from "@/lib/prisma";
import { buildTypeCounts } from "@/lib/db/type-counts";
import { capitalize } from "@/lib/utils";

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

	const totalCount = counts.reduce((sum, c) => sum + c._count._all, 0);

	const types = buildTypeCounts(
		itemTypes,
		counts,
		SYSTEM_TYPE_ORDER,
		(t, count): SidebarItemType => ({
			id: t.id,
			name: t.name,
			label: `${capitalize(t.name)}s`,
			icon: t.icon,
			color: t.color,
			count,
			route: `/items/${t.name}s`,
		}),
	);

	return { totalCount, types };
}
