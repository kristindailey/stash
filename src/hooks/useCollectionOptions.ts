import * as React from "react";
import type { CollectionOption } from "@/lib/db/collections";

export function useCollectionOptions(enabled: boolean) {
	const [options, setOptions] = React.useState<CollectionOption[]>([]);
	const [loading, setLoading] = React.useState(false);

	React.useEffect(() => {
		if (!enabled) return;

		const controller = new AbortController();

		async function load() {
			setLoading(true);
			try {
				const res = await fetch("/api/collections", {
					signal: controller.signal,
				});
				if (!res.ok) throw new Error(`Request failed: ${res.status}`);
				const data = (await res.json()) as {
					collections: CollectionOption[];
				};
				setOptions(data.collections);
			} catch (err) {
				if ((err as Error).name === "AbortError") return;
			} finally {
				setLoading(false);
			}
		}

		load();

		return () => controller.abort();
	}, [enabled]);

	return { options, loading };
}
