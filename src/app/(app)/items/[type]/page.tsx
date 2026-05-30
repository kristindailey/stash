import { notFound, redirect } from "next/navigation";
import { FolderOpen } from "lucide-react";
import { auth } from "@/auth";
import { FileRow } from "@/components/items/FileRow";
import { ImageCard } from "@/components/items/ImageCard";
import { ItemCard } from "@/components/items/ItemCard";
import { ProTypeUpgrade } from "@/components/items/ProTypeUpgrade";
import { Pagination } from "@/components/shared/Pagination";
import {
	ITEM_TYPE_COLORS,
	ITEM_TYPE_ICONS,
	ITEM_TYPE_LABELS,
} from "@/lib/constants/item-types";
import { PRO_ONLY_TYPES } from "@/lib/constants/limits";
import { ITEMS_PER_PAGE } from "@/lib/constants/pagination";
import { getItemsByType, getPinnedItemsByType } from "@/lib/db/dashboard";
import type { DashboardItem } from "@/lib/db/items";
import { parsePage } from "@/lib/pagination";
import { capitalize } from "@/lib/utils";

function ItemsGrid({
	items,
	singular,
}: {
	items: DashboardItem[];
	singular: string;
}) {
	if (singular === "file") {
		return (
			<div className="flex flex-col gap-2">
				{items.map((item) => (
					<FileRow key={item.id} item={item} />
				))}
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
			{items.map((item) =>
				singular === "image" ? (
					<ImageCard key={item.id} item={item} />
				) : (
					<ItemCard key={item.id} item={item} />
				),
			)}
		</div>
	);
}

export const dynamic = "force-dynamic";

export default async function ItemsByTypePage({
	params,
	searchParams,
}: PageProps<"/items/[type]">) {
	const { type } = await params;
	if (!type.endsWith("s")) notFound();

	const session = await auth();
	if (!session?.user?.id) redirect("/login");

	const page = parsePage((await searchParams).page);
	const singular = type.slice(0, -1);

	if (PRO_ONLY_TYPES.has(singular) && !session.user.isPro) {
		const Icon = ITEM_TYPE_ICONS[singular] ?? FolderOpen;
		const color = ITEM_TYPE_COLORS[singular] ?? "#6b7280";
		const label = `${ITEM_TYPE_LABELS[singular] ?? capitalize(singular)}s`;
		return <ProTypeUpgrade label={label} Icon={Icon} color={color} />;
	}

	const [result, pinnedItems] = await Promise.all([
		getItemsByType(session.user.id, singular, page),
		getPinnedItemsByType(session.user.id, singular),
	]);
	if (result === null || pinnedItems === null) notFound();

	const { items, totalCount } = result;
	const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));
	const typeTotal = totalCount + pinnedItems.length;

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
					{typeTotal} {typeTotal === 1 ? "item" : "items"}
				</span>
			</header>

			<section className="flex flex-col gap-3">
				<h2 className="text-lg font-semibold">Pinned</h2>
				{pinnedItems.length === 0 ? (
					<p className="text-sm text-muted-foreground">
						No pinned {pluralLabel.toLowerCase()} yet.
					</p>
				) : (
					<ItemsGrid items={pinnedItems} singular={singular} />
				)}
			</section>

			<section className="flex flex-col gap-3">
				<h2 className="text-lg font-semibold">All {pluralLabel.toLowerCase()}</h2>
				{totalCount === 0 ? (
					<p className="text-sm text-muted-foreground">
						No {pluralLabel.toLowerCase()} yet.
					</p>
				) : (
					<ItemsGrid items={items} singular={singular} />
				)}

				<Pagination
					basePath={`/items/${type}`}
					currentPage={page}
					totalPages={totalPages}
				/>
			</section>
		</div>
	);
}
