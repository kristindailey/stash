import { notFound, redirect } from "next/navigation";
import { FolderOpen } from "lucide-react";
import { auth } from "@/auth";
import { FileRow } from "@/components/items/FileRow";
import { ImageCard } from "@/components/items/ImageCard";
import { ItemCard } from "@/components/items/ItemCard";
import { Pagination } from "@/components/shared/Pagination";
import {
	ITEM_TYPE_COLORS,
	ITEM_TYPE_ICONS,
	ITEM_TYPE_LABELS,
} from "@/lib/constants/item-types";
import { ITEMS_PER_PAGE } from "@/lib/constants/pagination";
import { getItemsByType } from "@/lib/db/dashboard";
import { parsePage } from "@/lib/pagination";
import { capitalize } from "@/lib/utils";

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
	const result = await getItemsByType(session.user.id, singular, page);
	if (result === null) notFound();

	const { items, totalCount } = result;
	const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));

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
					{totalCount} {totalCount === 1 ? "item" : "items"}
				</span>
			</header>

			{totalCount === 0 ? (
				<p className="text-sm text-muted-foreground">
					No {pluralLabel.toLowerCase()} yet.
				</p>
			) : singular === "file" ? (
				<div className="flex flex-col gap-2">
					{items.map((item) => (
						<FileRow key={item.id} item={item} />
					))}
				</div>
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

			<Pagination
				basePath={`/items/${type}`}
				currentPage={page}
				totalPages={totalPages}
			/>
		</div>
	);
}
