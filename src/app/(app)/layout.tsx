import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Sidebar } from "@/components/layout/Sidebar";
import { SidebarProvider } from "@/components/layout/sidebar-context";
import { TopBar } from "@/components/layout/TopBar";
import { ItemDrawer } from "@/components/items/ItemDrawer";
import { ItemDrawerProvider } from "@/components/items/item-drawer-context";
import { CommandPalette } from "@/components/search/CommandPalette";
import { CommandPaletteProvider } from "@/components/search/command-palette-context";
import { getSidebarCollections } from "@/lib/db/collections";
import { getSidebarItemTypes } from "@/lib/db/sidebar";
import { getSearchData } from "@/lib/db/search";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await auth();
	if (!session?.user?.id) redirect("/login");

	const [itemTypes, collections, searchData] = await Promise.all([
		getSidebarItemTypes(session.user.id),
		getSidebarCollections(session.user.id),
		getSearchData(session.user.id),
	]);

	const sessionUser = {
		name: session.user.name ?? null,
		email: session.user.email ?? null,
		image: session.user.image ?? null,
	};

	return (
		<SidebarProvider>
			<ItemDrawerProvider>
				<CommandPaletteProvider>
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
					<ItemDrawer />
					<CommandPalette data={searchData} />
				</CommandPaletteProvider>
			</ItemDrawerProvider>
		</SidebarProvider>
	);
}
