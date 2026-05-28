"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ItemContentField } from "./ItemContentField";
import { CollectionSelect } from "./CollectionSelect";
import { FileUpload, type UploadedFile } from "./FileUpload";
import {
	CONTENT_TYPES,
	CREATABLE_TYPES,
	FILE_TYPES,
	ITEM_TYPE_COLORS,
	ITEM_TYPE_ICONS,
	ITEM_TYPE_LABELS,
	LANGUAGE_TYPES,
	type CreatableType,
} from "@/lib/constants/item-types";
import { cn, parseTags } from "@/lib/utils";
import { useCurrentItemType } from "@/hooks/useCurrentItemType";
import { useCollectionOptions } from "@/hooks/useCollectionOptions";
import { createItem } from "@/actions/items";

export function NewItemDialog() {
	const router = useRouter();
	const defaultType = useCurrentItemType();
	const [open, setOpen] = React.useState(false);
	const [type, setType] = React.useState<CreatableType>(defaultType);
	const [title, setTitle] = React.useState("");
	const [description, setDescription] = React.useState("");
	const [content, setContent] = React.useState("");
	const [language, setLanguage] = React.useState("");
	const [url, setUrl] = React.useState("");
	const [tagsInput, setTagsInput] = React.useState("");
	const [collectionIds, setCollectionIds] = React.useState<string[]>([]);
	const [uploaded, setUploaded] = React.useState<UploadedFile | null>(null);
	const [saving, setSaving] = React.useState(false);

	const { options: collectionOptions, loading: collectionsLoading } =
		useCollectionOptions(open);

	const reset = React.useCallback(() => {
		setType(defaultType);
		setTitle("");
		setDescription("");
		setContent("");
		setLanguage("");
		setUrl("");
		setTagsInput("");
		setCollectionIds([]);
		setUploaded(null);
		setSaving(false);
	}, [defaultType]);

	const [lastDefaultType, setLastDefaultType] = React.useState(defaultType);
	if (defaultType !== lastDefaultType) {
		setLastDefaultType(defaultType);
		if (!open) setType(defaultType);
	}

	const handleOpenChange = (next: boolean) => {
		if (saving) return;
		setOpen(next);
		if (!next) reset();
	};

	const showContent = CONTENT_TYPES.has(type);
	const showLanguage = LANGUAGE_TYPES.has(type);
	const showUrl = type === "link";
	const showUpload = FILE_TYPES.has(type);

	const trimmedTitle = title.trim();
	const trimmedUrl = url.trim();
	const canSave =
		trimmedTitle.length > 0 &&
		(!showUrl || trimmedUrl.length > 0) &&
		(!showUpload || uploaded !== null) &&
		!saving;

	const handleSave = async () => {
		setSaving(true);
		const tags = parseTags(tagsInput);

		const result = await createItem({
			type,
			title,
			description,
			content: showContent ? content : null,
			language: showLanguage ? language : null,
			url: showUrl ? url : null,
			fileUrl: showUpload ? uploaded?.url ?? null : null,
			fileName: showUpload ? uploaded?.fileName ?? null : null,
			fileSize: showUpload ? uploaded?.fileSize ?? null : null,
			tags,
			collectionIds,
		});

		setSaving(false);

		if (!result.success) {
			toast.error(result.error);
			return;
		}

		toast.success("Item created");
		setOpen(false);
		reset();
		router.refresh();
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				<Button size="lg">
					<Plus />
					New Item
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-xl">
				<DialogHeader>
					<DialogTitle>New item</DialogTitle>
					<DialogDescription>
						Add a new item to your stash.
					</DialogDescription>
				</DialogHeader>

				<div className="flex flex-col gap-4">
					<Field label="Type">
						<div className="flex flex-wrap gap-2">
							{CREATABLE_TYPES.map((t) => {
								const Icon = ITEM_TYPE_ICONS[t];
								const color = ITEM_TYPE_COLORS[t] ?? "#6b7280";
								const active = type === t;
								return (
									<button
										key={t}
										type="button"
										onClick={() => setType(t)}
										className={cn(
											"flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
											active
												? "border-foreground bg-muted text-foreground"
												: "border-border text-muted-foreground hover:text-foreground",
										)}
									>
										{Icon ? <Icon className="size-3.5" style={{ color }} /> : null}
										{ITEM_TYPE_LABELS[t] ?? t}
									</button>
								);
							})}
						</div>
					</Field>

					<Field label="Title">
						<Input
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							placeholder="Title"
							aria-invalid={trimmedTitle.length === 0}
							autoFocus
						/>
					</Field>

					<Field label="Description">
						<Textarea
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder="Optional description"
							rows={2}
						/>
					</Field>

					{showContent && (
						<Field label="Content">
							<ItemContentField
								type={type}
								value={content}
								onChange={setContent}
								language={language}
								rows={6}
							/>
						</Field>
					)}

					{showUpload && (
						<Field label={type === "image" ? "Image" : "File"}>
							<FileUpload
								kind={type === "image" ? "image" : "file"}
								value={uploaded}
								onChange={setUploaded}
							/>
						</Field>
					)}

					{showLanguage && (
						<Field label="Language">
							<Input
								value={language}
								onChange={(e) => setLanguage(e.target.value)}
								placeholder="e.g. typescript"
							/>
						</Field>
					)}

					{showUrl && (
						<Field label="URL">
							<Input
								value={url}
								onChange={(e) => setUrl(e.target.value)}
								placeholder="https://…"
								inputMode="url"
								aria-invalid={trimmedUrl.length === 0}
							/>
						</Field>
					)}

					<Field label="Tags">
						<Input
							value={tagsInput}
							onChange={(e) => setTagsInput(e.target.value)}
							placeholder="comma, separated, tags"
						/>
					</Field>

					<Field label="Collections">
						<CollectionSelect
							options={collectionOptions}
							selected={collectionIds}
							onChange={setCollectionIds}
							loading={collectionsLoading}
						/>
					</Field>
				</div>

				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline" disabled={saving}>
							Cancel
						</Button>
					</DialogClose>
					<Button onClick={handleSave} disabled={!canSave}>
						{saving ? "Creating…" : "Create"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

function Field({
	label,
	children,
}: {
	label: string;
	children: React.ReactNode;
}) {
	return (
		<div className="flex flex-col gap-1.5">
			<label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
				{label}
			</label>
			{children}
		</div>
	);
}
