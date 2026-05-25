import { Sidebar } from "@/components/layout/Sidebar";
import { SidebarProvider } from "@/components/layout/sidebar-context";
import { TopBar } from "@/components/layout/TopBar";
import { getSidebarCollections } from "@/lib/db/collections";
import { getSidebarItemTypes } from "@/lib/db/items";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const [itemTypes, collections] = await Promise.all([
		getSidebarItemTypes(),
		getSidebarCollections(),
	]);

	return (
		<SidebarProvider>
			<div className="flex h-screen flex-col">
				<TopBar />
				<div className="relative flex flex-1 overflow-hidden">
					<Sidebar
						itemTypes={itemTypes.types}
						totalItemCount={itemTypes.totalCount}
						collections={collections}
					/>
					<main className="flex-1 overflow-y-auto p-6">{children}</main>
				</div>
			</div>
		</SidebarProvider>
	);
}
