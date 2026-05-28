type TypeCount = { itemTypeId: string; _count: { _all: number } };

export function buildTypeCounts<T extends { id: string; name: string }, R extends { name: string }>(
	itemTypes: T[],
	counts: TypeCount[],
	order: string[],
	map: (type: T, count: number) => R,
): R[] {
	const countMap = new Map(counts.map((c) => [c.itemTypeId, c._count._all]));
	const orderIndex = (name: string) => {
		const i = order.indexOf(name);
		return i === -1 ? order.length : i;
	};

	return itemTypes
		.map((t) => map(t, countMap.get(t.id) ?? 0))
		.sort(
			(a, b) =>
				orderIndex(a.name) - orderIndex(b.name) || a.name.localeCompare(b.name),
		);
}