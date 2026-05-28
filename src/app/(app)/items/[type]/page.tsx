import { notFound } from "next/navigation";
import { FolderOpen } from "lucide-react";
import { ImageCard } from "@/components/items/ImageCard";
import { ItemCard } from "@/components/items/ItemCard";
import {
	ITEM_TYPE_COLORS,
	ITEM_TYPE_ICONS,
	ITEM_TYPE_LABELS,
} from "@/lib/constants/item-types";
import { getItemsByType } from "@/lib/db/items";

export const dynamic = "force-dynamic";

export default async function ItemsByTypePage({
	params,
}: PageProps<"/items/[type]">) {
	const { type } = await params;
	if (!type.endsWith("s")) notFound();

	const singular = type.slice(0, -1);
	const items = await getItemsByType(singular);
	if (items === null) notFound();

	const Icon = ITEM_TYPE_ICONS[singular] ?? FolderOpen;
	const color = ITEM_TYPE_COLORS[singular] ?? "#6b7280";
	const label = ITEM_TYPE_LABELS[singular] ?? capitalize(singular);
	const pluralLabel = `${label}s`;

	return (
		<div className="flex flex-col gap-6">
			<header className="flex items-center gap-3">
				<Icon className="size-6 shrink-0" style={{ color }} />
				<h1 className="text-2xl font-semibold">{pluralLabel}</h1>
				<span className="text-sm text-muted-foreground">
					{items.length} {items.length === 1 ? "item" : "items"}
				</span>
			</header>

			{items.length === 0 ? (
				<p className="text-sm text-muted-foreground">
					No {pluralLabel.toLowerCase()} yet.
				</p>
			) : (
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
					{items.map((item) =>
						singular === "image" ? (
							<ImageCard key={item.id} item={item} />
						) : (
							<ItemCard key={item.id} item={item} />
						),
					)}
				</div>
			)}
		</div>
	);
}

function capitalize(s: string) {
	return s.charAt(0).toUpperCase() + s.slice(1);
}
