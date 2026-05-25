import {
	FolderOpen,
	Layers,
	Star,
	type LucideIcon,
} from "lucide-react";
import {
	mockCollections,
	mockItemTypeCounts,
	mockItems,
} from "@/lib/mock-data";

export function StatsCards() {
	const totalItems = mockItemTypeCounts.all;
	const totalCollections = mockCollections.length;
	const favoriteItems = mockItems.filter((i) => i.isFavorite).length;
	const favoriteCollections = mockCollections.filter((c) => c.isFavorite).length;

	return (
		<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
			<StatCard label="Total Items" value={totalItems} icon={Layers} />
			<StatCard
				label="Collections"
				value={totalCollections}
				icon={FolderOpen}
			/>
			<StatCard
				label="Favorite Items"
				value={favoriteItems}
				icon={Star}
				iconColor="#f59e0b"
				iconFill
			/>
			<StatCard
				label="Favorite Collections"
				value={favoriteCollections}
				icon={Star}
				iconColor="#f59e0b"
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
