import { CollectionsSection } from "@/components/dashboard/CollectionsSection";
import { PinnedSection } from "@/components/dashboard/PinnedSection";
import { RecentItemsSection } from "@/components/dashboard/RecentItemsSection";
import { StatsCards } from "@/components/dashboard/StatsCards";

export default function DashboardPage() {
	return (
		<div className="flex flex-col gap-8">
			<StatsCards />
			<CollectionsSection />
			<PinnedSection />
			<RecentItemsSection />
		</div>
	);
}
