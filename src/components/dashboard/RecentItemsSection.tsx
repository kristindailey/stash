import { getRecentItems } from "@/lib/db/items";
import { RecentItemRow } from "./RecentItemRow";

export async function RecentItemsSection({ userId }: { userId: string }) {
	const recent = await getRecentItems(userId, 10);

	return (
		<section>
			<h2 className="mb-4 text-lg font-semibold">Recent Items</h2>
			{recent.length === 0 ? (
				<p className="text-sm text-muted-foreground">No items yet.</p>
			) : (
				<ul className="flex flex-col gap-2">
					{recent.map((item) => (
						<RecentItemRow key={item.id} item={item} />
					))}
				</ul>
			)}
		</section>
	);
}
