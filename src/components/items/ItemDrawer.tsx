"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
	Copy,
	Download,
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CodeEditor } from "./CodeEditor";
import { MarkdownEditor } from "./MarkdownEditor";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
	ITEM_TYPE_COLORS,
	ITEM_TYPE_ICONS,
	ITEM_TYPE_LABELS,
} from "@/lib/constants/item-types";
import { formatRelativeTime } from "@/lib/format-time";
import type { ItemDetail } from "@/lib/db/items";
import { deleteItem, toggleFavorite, togglePin, updateItem } from "@/actions/items";
import { useItemDrawer } from "./item-drawer-context";

const CONTENT_TYPES = new Set(["snippet", "prompt", "command", "note"]);
const LANGUAGE_TYPES = new Set(["snippet", "command"]);
const MARKDOWN_TYPES = new Set(["note", "prompt"]);
const URL_TYPES = new Set(["link"]);

export function ItemDrawer() {
	const router = useRouter();
	const { openItemId, close } = useItemDrawer();
	const [item, setItem] = React.useState<ItemDetail | null>(null);
	const [loading, setLoading] = React.useState(false);
	const [error, setError] = React.useState<string | null>(null);
	const [mode, setMode] = React.useState<"view" | "edit">("view");
	const [deleting, setDeleting] = React.useState(false);
	const [togglingFavorite, setTogglingFavorite] = React.useState(false);
	const [togglingPin, setTogglingPin] = React.useState(false);

	const handleToggleFavorite = async () => {
		if (!item || togglingFavorite) return;
		const previous = item;
		setItem({ ...item, isFavorite: !item.isFavorite });
		setTogglingFavorite(true);
		const result = await toggleFavorite(item.id);
		setTogglingFavorite(false);

		if (!result.success) {
			setItem(previous);
			toast.error(result.error);
			return;
		}

		setItem({
			...result.data,
			updatedAt: new Date(result.data.updatedAt),
			createdAt: new Date(result.data.createdAt),
		});
		router.refresh();
	};

	const handleTogglePin = async () => {
		if (!item || togglingPin) return;
		const previous = item;
		setItem({ ...item, isPinned: !item.isPinned });
		setTogglingPin(true);
		const result = await togglePin(item.id);
		setTogglingPin(false);

		if (!result.success) {
			setItem(previous);
			toast.error(result.error);
			return;
		}

		setItem({
			...result.data,
			updatedAt: new Date(result.data.updatedAt),
			createdAt: new Date(result.data.createdAt),
		});
		router.refresh();
	};

	const handleDelete = async () => {
		if (!item) return;
		setDeleting(true);
		const result = await deleteItem(item.id);
		setDeleting(false);

		if (!result.success) {
			toast.error(result.error);
			return;
		}

		toast.success("Item deleted");
		close();
		router.refresh();
	};

	React.useEffect(() => {
		if (!openItemId) return;

		const controller = new AbortController();
		setLoading(true);
		setError(null);
		setItem(null);
		setMode("view");

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
				) : mode === "edit" ? (
					<DrawerEdit
						item={item}
						onCancel={() => setMode("view")}
						onSaved={(updated) => {
							setItem(updated);
							setMode("view");
						}}
					/>
				) : (
					<DrawerBody
						item={item}
						onEdit={() => setMode("edit")}
						onDelete={handleDelete}
						deleting={deleting}
						onToggleFavorite={handleToggleFavorite}
						onTogglePin={handleTogglePin}
						togglingFavorite={togglingFavorite}
						togglingPin={togglingPin}
					/>
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

function DrawerBody({
	item,
	onEdit,
	onDelete,
	deleting,
	onToggleFavorite,
	onTogglePin,
	togglingFavorite,
	togglingPin,
}: {
	item: ItemDetail;
	onEdit: () => void;
	onDelete: () => void;
	deleting: boolean;
	onToggleFavorite: () => void;
	onTogglePin: () => void;
	togglingFavorite: boolean;
	togglingPin: boolean;
}) {
	const [confirmOpen, setConfirmOpen] = React.useState(false);
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
				<Button
					variant="outline"
					size="sm"
					onClick={onToggleFavorite}
					disabled={togglingFavorite}
				>
					<Star
						style={item.isFavorite ? { color: "#f59e0b" } : undefined}
						fill={item.isFavorite ? "currentColor" : "none"}
					/>
					{item.isFavorite ? "Favorited" : "Favorite"}
				</Button>
				<Button
					variant="outline"
					size="sm"
					onClick={onTogglePin}
					disabled={togglingPin}
				>
					<Pin fill={item.isPinned ? "currentColor" : "none"} />
					{item.isPinned ? "Pinned" : "Pin"}
				</Button>
				<Button variant="outline" size="sm" onClick={onEdit}>
					<Pencil />
				</Button>
				<Button
					variant="destructive"
					size="sm"
					className="ml-auto"
					onClick={() => setConfirmOpen(true)}
					disabled={deleting}
				>
					<Trash2 />
				</Button>
				<AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Delete this item?</AlertDialogTitle>
							<AlertDialogDescription>
								&ldquo;{item.title}&rdquo; will be permanently deleted. This
								cannot be undone.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
							<AlertDialogAction
								onClick={(e) => {
									e.preventDefault();
									onDelete();
								}}
								disabled={deleting}
								className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
							>
								{deleting ? "Deleting…" : "Delete"}
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</div>

			<div className="flex-1 overflow-y-auto">
				{item.description && (
					<Section title="Description">
						<p className="text-sm text-muted-foreground">{item.description}</p>
					</Section>
				)}

				{item.content && (
					<Section title="Content">
						{LANGUAGE_TYPES.has(item.type) ? (
							<CodeEditor
								value={item.content}
								language={item.language ?? undefined}
								readOnly
							/>
						) : MARKDOWN_TYPES.has(item.type) ? (
							<MarkdownEditor value={item.content} readOnly />
						) : (
							<pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs">
								<code>{item.content}</code>
							</pre>
						)}
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

				{item.contentType === "FILE" && item.fileName && (
					<Section title={item.type === "image" ? "Image" : "File"}>
						{item.type === "image" && item.fileUrl && (
							/* eslint-disable-next-line @next/next/no-img-element */
							<img
								src={item.fileUrl}
								alt={item.fileName}
								className="mb-3 max-h-80 w-full rounded-md border object-contain"
							/>
						)}
						<div className="flex items-center justify-between gap-3 rounded-md border bg-muted/30 p-3">
							<div className="min-w-0">
								<p className="truncate text-sm font-medium">{item.fileName}</p>
								{item.fileSize ? (
									<p className="text-xs text-muted-foreground">
										{formatBytes(item.fileSize)}
									</p>
								) : null}
							</div>
							<Button asChild variant="outline" size="sm">
								<a
									href={`/api/items/${item.id}/download`}
									download={item.fileName}
								>
									<Download />
									Download
								</a>
							</Button>
						</div>
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

function DrawerEdit({
	item,
	onCancel,
	onSaved,
}: {
	item: ItemDetail;
	onCancel: () => void;
	onSaved: (updated: ItemDetail) => void;
}) {
	const router = useRouter();
	const Icon = ITEM_TYPE_ICONS[item.type] ?? FolderOpen;
	const color = ITEM_TYPE_COLORS[item.type] ?? "#6b7280";
	const typeLabel = ITEM_TYPE_LABELS[item.type] ?? item.type;

	const showContent = CONTENT_TYPES.has(item.type);
	const showLanguage = LANGUAGE_TYPES.has(item.type);
	const showUrl = URL_TYPES.has(item.type);

	const [title, setTitle] = React.useState(item.title);
	const [description, setDescription] = React.useState(item.description ?? "");
	const [content, setContent] = React.useState(item.content ?? "");
	const [language, setLanguage] = React.useState(item.language ?? "");
	const [url, setUrl] = React.useState(item.url ?? "");
	const [tagsInput, setTagsInput] = React.useState(item.tags.join(", "));
	const [saving, setSaving] = React.useState(false);

	const trimmedTitle = title.trim();
	const canSave = trimmedTitle.length > 0 && !saving;

	const handleSave = async () => {
		setSaving(true);
		const tags = tagsInput
			.split(",")
			.map((tag) => tag.trim())
			.filter((tag) => tag.length > 0);

		const result = await updateItem(item.id, {
			title,
			description,
			content: showContent ? content : null,
			language: showLanguage ? language : null,
			url: showUrl ? url : null,
			tags,
		});

		setSaving(false);

		if (!result.success) {
			toast.error(result.error);
			return;
		}

		toast.success("Item updated");
		onSaved({
			...result.data,
			updatedAt: new Date(result.data.updatedAt),
			createdAt: new Date(result.data.createdAt),
		});
		router.refresh();
	};

	return (
		<div className="flex h-full flex-col overflow-hidden">
			<SheetHeader className="gap-2 border-b p-4">
				<div className="flex items-center gap-2 pr-8">
					<Icon className="size-5 shrink-0" style={{ color }} />
					<SheetTitle className="truncate text-lg font-semibold">
						Edit {typeLabel}
					</SheetTitle>
				</div>
				<SheetDescription>
					Updated {formatRelativeTime(item.updatedAt)}
				</SheetDescription>
			</SheetHeader>

			<div className="flex items-center gap-2 border-b p-3">
				<Button
					size="sm"
					onClick={handleSave}
					disabled={!canSave}
				>
					{saving ? "Saving…" : "Save"}
				</Button>
				<Button
					variant="outline"
					size="sm"
					onClick={onCancel}
					disabled={saving}
				>
					Cancel
				</Button>
			</div>

			<div className="flex-1 overflow-y-auto">
				<Section title="Title">
					<Input
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						placeholder="Title"
						aria-invalid={trimmedTitle.length === 0}
					/>
				</Section>

				<Section title="Description">
					<Textarea
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						placeholder="Optional description"
						rows={3}
					/>
				</Section>

				{showContent && (
					<Section title="Content">
						{showLanguage ? (
							<CodeEditor
								value={content}
								onChange={setContent}
								language={language || undefined}
							/>
						) : MARKDOWN_TYPES.has(item.type) ? (
							<MarkdownEditor
								value={content}
								onChange={setContent}
								placeholder="Write markdown…"
							/>
						) : (
							<Textarea
								value={content}
								onChange={(e) => setContent(e.target.value)}
								placeholder="Content"
								rows={8}
								className="font-mono text-xs"
							/>
						)}
					</Section>
				)}

				{showLanguage && (
					<Section title="Language">
						<Input
							value={language}
							onChange={(e) => setLanguage(e.target.value)}
							placeholder="e.g. typescript"
						/>
					</Section>
				)}

				{showUrl && (
					<Section title="URL">
						<Input
							value={url}
							onChange={(e) => setUrl(e.target.value)}
							placeholder="https://…"
							inputMode="url"
						/>
					</Section>
				)}

				<Section title="Tags">
					<Input
						value={tagsInput}
						onChange={(e) => setTagsInput(e.target.value)}
						placeholder="comma, separated, tags"
					/>
				</Section>
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
