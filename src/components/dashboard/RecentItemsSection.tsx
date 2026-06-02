import { EmptyState } from "@/components/shared/EmptyState";
import { DASHBOARD_RECENT_ITEMS_LIMIT } from "@/lib/constants/pagination";
import { getRecentItems } from "@/lib/db/dashboard";
import { RecentItemRow } from "./RecentItemRow";

export async function RecentItemsSection({ userId }: { userId: string }) {
	const recent = await getRecentItems(userId, DASHBOARD_RECENT_ITEMS_LIMIT);

	return (
		<section>
			<h2 className="mb-4 text-lg font-semibold">Recent Items</h2>
			{recent.length === 0 ? (
				<EmptyState message="No items yet. Create your first one!" />
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
