import { Sidebar } from "@/components/layout/Sidebar";
import { SidebarProvider } from "@/components/layout/sidebar-context";
import { TopBar } from "@/components/layout/TopBar";

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<SidebarProvider>
			<div className="flex h-screen flex-col">
				<TopBar />
				<div className="relative flex flex-1 overflow-hidden">
					<Sidebar />
					<main className="flex-1 overflow-y-auto p-6">{children}</main>
				</div>
			</div>
		</SidebarProvider>
	);
}
