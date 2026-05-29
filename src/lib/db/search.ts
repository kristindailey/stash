import { getAllItems } from "@/lib/db/dashboard";
import { getAllCollections } from "@/lib/db/collections";
import type { DashboardItem } from "@/lib/db/items";

const PREVIEW_LENGTH = 100;

export type SearchItem = {
	id: string;
	title: string;
	type: string;
	preview: string | null;
};

export type SearchCollection = {
	id: string;
	name: string;
	itemCount: number;
};

export type SearchData = {
	items: SearchItem[];
	collections: SearchCollection[];
};

function previewFor(item: DashboardItem): string | null {
	const source = item.content ?? item.url ?? item.fileName ?? item.description;
	if (!source) return null;
	const trimmed = source.trim();
	return trimmed.length > PREVIEW_LENGTH
		? `${trimmed.slice(0, PREVIEW_LENGTH)}…`
		: trimmed;
}

export async function getSearchData(userId: string): Promise<SearchData> {
	const [items, collections] = await Promise.all([
		getAllItems(userId),
		getAllCollections(userId),
	]);

	return {
		items: items.map((item) => ({
			id: item.id,
			title: item.title,
			type: item.type,
			preview: previewFor(item),
		})),
		collections: collections.map((collection) => ({
			id: collection.id,
			name: collection.name,
			itemCount: collection.itemCount,
		})),
	};
}
