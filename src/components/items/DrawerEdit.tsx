"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FolderOpen } from "lucide-react";
import {
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ItemContentField } from "./ItemContentField";
import { LanguageSelect } from "./LanguageSelect";
import { CollectionSelect } from "./CollectionSelect";
import { DrawerSection } from "./DrawerSection";
import {
	CONTENT_TYPES,
	ITEM_TYPE_COLORS,
	ITEM_TYPE_ICONS,
	ITEM_TYPE_LABELS,
	LANGUAGE_TYPES,
	URL_TYPES,
} from "@/lib/constants/item-types";
import { parseTags } from "@/lib/utils";
import { useCollectionOptions } from "@/hooks/useCollectionOptions";
import { formatRelativeTime } from "@/lib/format-time";
import { normalizeItemDates } from "@/hooks/useItemDetail";
import type { ItemDetail } from "@/lib/db/items";
import { updateItem } from "@/actions/items";

export function DrawerEdit({
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
	const [collectionIds, setCollectionIds] = React.useState<string[]>(
		item.collections.map((c) => c.id),
	);
	const [saving, setSaving] = React.useState(false);

	const { options: collectionOptions, loading: collectionsLoading } =
		useCollectionOptions(true);

	const trimmedTitle = title.trim();
	const canSave = trimmedTitle.length > 0 && !saving;

	const handleSave = async () => {
		setSaving(true);

		const result = await updateItem(item.id, {
			title,
			description,
			content: showContent ? content : null,
			language: showLanguage ? language : null,
			url: showUrl ? url : null,
			tags: parseTags(tagsInput),
			collectionIds,
		});

		setSaving(false);

		if (!result.success) {
			toast.error(result.error);
			return;
		}

		toast.success("Item updated");
		onSaved(normalizeItemDates(result.data));
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
				<Button size="sm" onClick={handleSave} disabled={!canSave}>
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
				<DrawerSection title="Title">
					<Input
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						placeholder="Title"
						aria-invalid={trimmedTitle.length === 0}
					/>
				</DrawerSection>

				<DrawerSection title="Description">
					<Textarea
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						placeholder="Optional description"
						rows={3}
					/>
				</DrawerSection>

				{showLanguage && (
					<DrawerSection title="Language">
						<LanguageSelect value={language} onChange={setLanguage} />
					</DrawerSection>
				)}

				{showContent && (
					<DrawerSection title="Content">
						<ItemContentField
							type={item.type}
							value={content}
							onChange={setContent}
							language={language}
							rows={8}
						/>
					</DrawerSection>
				)}

				{showUrl && (
					<DrawerSection title="URL">
						<Input
							value={url}
							onChange={(e) => setUrl(e.target.value)}
							placeholder="https://…"
							inputMode="url"
						/>
					</DrawerSection>
				)}

				<DrawerSection title="Tags">
					<Input
						value={tagsInput}
						onChange={(e) => setTagsInput(e.target.value)}
						placeholder="comma, separated, tags"
					/>
				</DrawerSection>

				<DrawerSection title="Collections">
					<CollectionSelect
						options={collectionOptions}
						selected={collectionIds}
						onChange={setCollectionIds}
						loading={collectionsLoading}
					/>
				</DrawerSection>
			</div>
		</div>
	);
}
