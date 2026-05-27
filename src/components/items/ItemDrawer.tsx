"use client";

import * as React from "react";
import {
	Copy,
	FolderOpen,
	Pencil,
	Pin,
	Star,
	Trash2,
} from "lucide-react";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
	ITEM_TYPE_COLORS,
	ITEM_TYPE_ICONS,
	ITEM_TYPE_LABELS,
} from "@/lib/constants/item-types";
import { formatRelativeTime } from "@/lib/format-time";
import type { ItemDetail } from "@/lib/db/items";
import { useItemDrawer } from "./item-drawer-context";

export function ItemDrawer() {
	const { openItemId, close } = useItemDrawer();
	const [item, setItem] = React.useState<ItemDetail | null>(null);
	const [loading, setLoading] = React.useState(false);
	const [error, setError] = React.useState<string | null>(null);

	React.useEffect(() => {
		if (!openItemId) return;

		const controller = new AbortController();
		setLoading(true);
		setError(null);
		setItem(null);

		fetch(`/api/items/${openItemId}`, { signal: controller.signal })
			.then(async (res) => {
				if (!res.ok) throw new Error(`Request failed: ${res.status}`);
				const data = (await res.json()) as { item: ItemDetail };
				setItem({
					...data.item,
					updatedAt: new Date(data.item.updatedAt),
					createdAt: new Date(data.item.createdAt),
				});
			})
			.catch((err) => {
				if (err.name === "AbortError") return;
				setError("Could not load item.");
			})
			.finally(() => setLoading(false));

		return () => controller.abort();
	}, [openItemId]);

	return (
		<Sheet
			open={openItemId !== null}
			onOpenChange={(open) => {
				if (!open) close();
			}}
		>
			<SheetContent className="w-full p-0 sm:max-w-md">
				{loading || !item ? (
					<DrawerSkeleton error={error} />
				) : (
					<DrawerBody item={item} />
				)}
			</SheetContent>
		</Sheet>
	);
}

function DrawerSkeleton({ error }: { error: string | null }) {
	return (
		<div className="flex flex-col gap-4 p-4">
			<SheetHeader className="p-0">
				<SheetTitle className="sr-only">Loading item</SheetTitle>
				<SheetDescription className="sr-only">
					Fetching item details
				</SheetDescription>
			</SheetHeader>
			{error ? (
				<p className="text-sm text-destructive">{error}</p>
			) : (
				<>
					<div className="h-6 w-2/3 animate-pulse rounded bg-muted" />
					<div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
					<div className="mt-2 h-9 w-full animate-pulse rounded bg-muted" />
					<div className="mt-4 h-24 w-full animate-pulse rounded bg-muted" />
				</>
			)}
		</div>
	);
}

function DrawerBody({ item }: { item: ItemDetail }) {
	const Icon = ITEM_TYPE_ICONS[item.type] ?? FolderOpen;
	const color = ITEM_TYPE_COLORS[item.type] ?? "#6b7280";
	const typeLabel = ITEM_TYPE_LABELS[item.type] ?? item.type;

	const copyContent = React.useCallback(() => {
		const text = item.content ?? item.url ?? "";
		if (text) navigator.clipboard.writeText(text);
	}, [item]);

	return (
		<div className="flex h-full flex-col overflow-hidden">
			<SheetHeader className="gap-2 border-b p-4">
				<div className="flex items-center gap-2 pr-8">
					<Icon className="size-5 shrink-0" style={{ color }} />
					<SheetTitle className="truncate text-lg font-semibold">
						{item.title}
					</SheetTitle>
				</div>
				<SheetDescription>
					{typeLabel} • Updated {formatRelativeTime(item.updatedAt)}
				</SheetDescription>
			</SheetHeader>

			<div className="flex items-center gap-2 border-b p-3">
				<Button variant="outline" size="sm" onClick={copyContent}>
					<Copy />
					Copy
				</Button>
				<Button variant="outline" size="sm">
					<Star
						style={item.isFavorite ? { color: "#f59e0b" } : undefined}
						fill={item.isFavorite ? "currentColor" : "none"}
					/>
					{item.isFavorite ? "Favorited" : "Favorite"}
				</Button>
				<Button variant="outline" size="sm">
					<Pin fill={item.isPinned ? "currentColor" : "none"} />
					{item.isPinned ? "Pinned" : "Pin"}
				</Button>
				<Button variant="outline" size="sm">
					<Pencil />
				</Button>
				<Button variant="destructive" size="sm" className="ml-auto">
					<Trash2 />
				</Button>
			</div>

			<div className="flex-1 overflow-y-auto">
				{item.description && (
					<Section title="Description">
						<p className="text-sm text-muted-foreground">{item.description}</p>
					</Section>
				)}

				{item.content && (
					<Section
						title="Content"
						action={
							item.language ? (
								<span className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
									{item.language}
								</span>
							) : null
						}
					>
						<pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs">
							<code>{item.content}</code>
						</pre>
					</Section>
				)}

				{item.url && (
					<Section title="URL">
						<a
							href={item.url}
							target="_blank"
							rel="noopener noreferrer"
							className="text-sm text-primary underline-offset-4 hover:underline"
						>
							{item.url}
						</a>
					</Section>
				)}

				{item.fileName && (
					<Section title="File">
						<p className="text-sm text-muted-foreground">
							{item.fileName}
							{item.fileSize ? ` • ${formatBytes(item.fileSize)}` : ""}
						</p>
					</Section>
				)}

				{item.tags.length > 0 && (
					<Section title="Tags">
						<div className="flex flex-wrap gap-1.5">
							{item.tags.map((tag) => (
								<span
									key={tag}
									className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
								>
									{tag}
								</span>
							))}
						</div>
					</Section>
				)}

				{item.collections.length > 0 && (
					<Section title="Collections">
						<ul className="flex flex-col gap-1.5">
							{item.collections.map((c) => (
								<li
									key={c.id}
									className="flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-sm"
								>
									<FolderOpen className="size-4 text-muted-foreground" />
									<span className="truncate">{c.name}</span>
								</li>
							))}
						</ul>
					</Section>
				)}
			</div>
		</div>
	);
}

function Section({
	title,
	action,
	children,
}: {
	title: string;
	action?: React.ReactNode;
	children: React.ReactNode;
}) {
	return (
		<section className="border-b p-4 last:border-b-0">
			<div className="mb-2 flex items-center justify-between">
				<h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
					{title}
				</h3>
				{action}
			</div>
			{children}
		</section>
	);
}

function formatBytes(bytes: number) {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
