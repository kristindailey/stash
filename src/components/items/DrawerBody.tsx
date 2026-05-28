"use client";

import * as React from "react";
import {
	Download,
	FolderOpen,
	Pencil,
	Pin,
	Star,
	Trash2,
	type LucideIcon,
} from "lucide-react";
import {
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { CodeEditor } from "./CodeEditor";
import { MarkdownEditor } from "./MarkdownEditor";
import { DeleteItemDialog } from "./DeleteItemDialog";
import { DrawerSection } from "./DrawerSection";
import {
	ITEM_TYPE_COLORS,
	ITEM_TYPE_ICONS,
	ITEM_TYPE_LABELS,
	LANGUAGE_TYPES,
	MARKDOWN_TYPES,
} from "@/lib/constants/item-types";
import { formatBytes } from "@/lib/constants/file-upload";
import { formatRelativeTime } from "@/lib/format-time";
import type { ItemDetail } from "@/lib/db/items";

export function DrawerBody({
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
				<ToggleButton
					icon={Star}
					active={item.isFavorite}
					activeLabel="Favorited"
					inactiveLabel="Favorite"
					activeColor="#f59e0b"
					onClick={onToggleFavorite}
					disabled={togglingFavorite}
				/>
				<ToggleButton
					icon={Pin}
					active={item.isPinned}
					activeLabel="Pinned"
					inactiveLabel="Pin"
					onClick={onTogglePin}
					disabled={togglingPin}
				/>
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
				<DeleteItemDialog
					open={confirmOpen}
					onOpenChange={setConfirmOpen}
					title={item.title}
					deleting={deleting}
					onConfirm={onDelete}
				/>
			</div>

			<div className="flex-1 overflow-y-auto">
				{item.description && (
					<DrawerSection title="Description">
						<p className="text-sm text-muted-foreground">{item.description}</p>
					</DrawerSection>
				)}

				{item.content && (
					<DrawerSection title="Content">
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
					</DrawerSection>
				)}

				{item.url && (
					<DrawerSection title="URL">
						<a
							href={item.url}
							target="_blank"
							rel="noopener noreferrer"
							className="text-sm text-primary underline-offset-4 hover:underline"
						>
							{item.url}
						</a>
					</DrawerSection>
				)}

				{item.contentType === "FILE" && item.fileName && (
					<DrawerSection title={item.type === "image" ? "Image" : "File"}>
						{item.type === "image" && (
							/* eslint-disable-next-line @next/next/no-img-element */
							<img
								src={`/api/items/${item.id}/download`}
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
					</DrawerSection>
				)}

				{item.tags.length > 0 && (
					<DrawerSection title="Tags">
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
					</DrawerSection>
				)}

				{item.collections.length > 0 && (
					<DrawerSection title="Collections">
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
					</DrawerSection>
				)}
			</div>
		</div>
	);
}

function ToggleButton({
	icon: Icon,
	active,
	activeLabel,
	inactiveLabel,
	activeColor,
	onClick,
	disabled,
}: {
	icon: LucideIcon;
	active: boolean;
	activeLabel: string;
	inactiveLabel: string;
	activeColor?: string;
	onClick: () => void;
	disabled: boolean;
}) {
	return (
		<Button variant="outline" size="sm" onClick={onClick} disabled={disabled}>
			<Icon
				style={active && activeColor ? { color: activeColor } : undefined}
				fill={active ? "currentColor" : "none"}
			/>
			{active ? activeLabel : inactiveLabel}
		</Button>
	);
}
