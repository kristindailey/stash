import { auth } from "@/auth";
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
	const [session, itemTypes, collections] = await Promise.all([
		auth(),
		getSidebarItemTypes(),
		getSidebarCollections(),
	]);

	const sessionUser = session?.user
		? {
				name: session.user.name ?? null,
				email: session.user.email ?? null,
				image: session.user.image ?? null,
		  }
		: null;

	return (
		<SidebarProvider>
			<div className="flex h-screen flex-col">
				<TopBar />
				<div className="relative flex flex-1 overflow-hidden">
					<Sidebar
						itemTypes={itemTypes.types}
						totalItemCount={itemTypes.totalCount}
						collections={collections}
						user={sessionUser}
					/>
					<main className="flex-1 overflow-y-auto p-6">{children}</main>
				</div>
			</div>
		</SidebarProvider>
	);
}
