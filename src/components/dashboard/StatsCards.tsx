import {
	FolderOpen,
	Layers,
	Star,
	type LucideIcon,
} from "lucide-react";
import { getDashboardStats } from "@/lib/db/dashboard";

export async function StatsCards({ userId }: { userId: string }) {
	const stats = await getDashboardStats(userId);

	return (
		<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
			<StatCard label="Total Items" value={stats.totalItems} icon={Layers} />
			<StatCard
				label="Collections"
				value={stats.totalCollections}
				icon={FolderOpen}
			/>
			<StatCard
				label="Favorite Items"
				value={stats.favoriteItems}
				icon={Star}
				iconColor="var(--brand-yellow)"
				iconFill
			/>
			<StatCard
				label="Favorite Collections"
				value={stats.favoriteCollections}
				icon={Star}
				iconColor="var(--brand-yellow)"
				iconFill
			/>
		</div>
	);
}

function StatCard({
	label,
	value,
	icon: Icon,
	iconColor,
	iconFill,
}: {
	label: string;
	value: number;
	icon: LucideIcon;
	iconColor?: string;
	iconFill?: boolean;
}) {
	return (
		<div className="rounded-lg border bg-card p-4">
			<div className="flex items-center justify-between">
				<span className="text-sm text-muted-foreground">{label}</span>
				<Icon
					className="size-4 text-muted-foreground"
					style={iconColor ? { color: iconColor } : undefined}
					fill={iconFill ? "currentColor" : "none"}
				/>
			</div>
			<p className="mt-2 text-2xl font-semibold">{value}</p>
		</div>
	);
}
