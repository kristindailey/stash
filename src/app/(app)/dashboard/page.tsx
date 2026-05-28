import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { CollectionsSection } from "@/components/dashboard/CollectionsSection";
import { PinnedSection } from "@/components/dashboard/PinnedSection";
import { RecentItemsSection } from "@/components/dashboard/RecentItemsSection";
import { StatsCards } from "@/components/dashboard/StatsCards";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
	const session = await auth();
	if (!session?.user?.id) redirect("/login");
	const userId = session.user.id;

	return (
		<div className="flex flex-col gap-8">
			<StatsCards userId={userId} />
			<CollectionsSection userId={userId} />
			<PinnedSection userId={userId} />
			<RecentItemsSection userId={userId} />
		</div>
	);
}
