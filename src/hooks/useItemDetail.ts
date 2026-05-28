import * as React from "react";
import type { ItemDetail } from "@/lib/db/items";

type SerializedItem = Omit<ItemDetail, "updatedAt" | "createdAt"> & {
	updatedAt: string | Date;
	createdAt: string | Date;
};

export function normalizeItemDates(item: SerializedItem): ItemDetail {
	return {
		...item,
		updatedAt: new Date(item.updatedAt),
		createdAt: new Date(item.createdAt),
	};
}

export function useItemDetail(openItemId: string | null) {
	const [item, setItem] = React.useState<ItemDetail | null>(null);
	const [loading, setLoading] = React.useState(false);
	const [error, setError] = React.useState<string | null>(null);
	const [fetchedFor, setFetchedFor] = React.useState<string | null>(null);

	if (openItemId !== fetchedFor) {
		setFetchedFor(openItemId);
		setItem(null);
		setError(null);
		setLoading(openItemId !== null);
	}

	React.useEffect(() => {
		if (!openItemId) return;

		const controller = new AbortController();

		fetch(`/api/items/${openItemId}`, { signal: controller.signal })
			.then(async (res) => {
				if (!res.ok) throw new Error(`Request failed: ${res.status}`);
				const data = (await res.json()) as { item: SerializedItem };
				setItem(normalizeItemDates(data.item));
			})
			.catch((err) => {
				if (err.name === "AbortError") return;
				setError("Could not load item.");
			})
			.finally(() => setLoading(false));

		return () => controller.abort();
	}, [openItemId]);

	return { item, setItem, loading, error };
}
