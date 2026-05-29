export function parsePage(value: string | string[] | undefined): number {
	const raw = Array.isArray(value) ? value[0] : value;
	const n = Number(raw);
	return Number.isInteger(n) && n >= 1 ? n : 1;
}

const MAX_SLOTS = 7;

export function getPageRange(
	current: number,
	total: number,
): (number | "ellipsis")[] {
	if (total <= 1) return [1];
	if (total <= MAX_SLOTS) {
		return Array.from({ length: total }, (_, i) => i + 1);
	}

	if (current <= 4) {
		return [1, 2, 3, 4, 5, "ellipsis", total];
	}
	if (current >= total - 3) {
		return [
			1,
			"ellipsis",
			total - 4,
			total - 3,
			total - 2,
			total - 1,
			total,
		];
	}
	return [1, "ellipsis", current - 1, current, current + 1, "ellipsis", total];
}
