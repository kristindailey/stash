import { prisma } from "@/lib/prisma";

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
