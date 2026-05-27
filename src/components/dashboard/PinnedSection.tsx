import { ItemCard } from "@/components/items/ItemCard";
import { getPinnedItems } from "@/lib/db/items";

export async function PinnedSection() {
	const pinned = await getPinnedItems();

	if (pinned.length === 0) return null;

	return (
		<section>
			<h2 className="mb-4 text-lg font-semibold">Pinned</h2>
			<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
				{pinned.map((item) => (
					<ItemCard key={item.id} item={item} />
				))}
			</div>
		</section>
	);
}
