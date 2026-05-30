"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import {
	Dialog,
	DialogBody,
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
import { LanguageSelect } from "./LanguageSelect";
import { CollectionSelect } from "./CollectionSelect";
import { FileUpload, type UploadedFile } from "./FileUpload";
import { SuggestTags } from "./SuggestTags";
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

const PRO_ONLY_TYPES = new Set<CreatableType>(["file", "image"]);

export function NewItemDialog({ isPro }: { isPro: boolean }) {
	const router = useRouter();
	const rawDefaultType = useCurrentItemType();
	const proLocked = !isPro;
	const defaultType =
		proLocked && PRO_ONLY_TYPES.has(rawDefaultType) ? "snippet" : rawDefaultType;
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
			if (result.error.includes("Upgrade to Pro")) {
				toast.error(result.error, {
					action: {
						label: "Upgrade",
						onClick: () => router.push("/settings"),
					},
				});
			} else {
				toast.error(result.error);
			}
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
				<Button size="lg" aria-label="New Item">
					<Plus />
					<span className="hidden md:inline">New Item</span>
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-xl">
				<DialogHeader>
					<DialogTitle>New item</DialogTitle>
					<DialogDescription>
						Add a new item to your stash.
					</DialogDescription>
				</DialogHeader>

				<DialogBody className="flex flex-col gap-4">
					<Field label="Type">
						<div className="flex flex-wrap gap-2">
							{CREATABLE_TYPES.map((t) => {
								const Icon = ITEM_TYPE_ICONS[t];
								const color = ITEM_TYPE_COLORS[t] ?? "#6b7280";
								const active = type === t;
								const locked = proLocked && PRO_ONLY_TYPES.has(t);
								return (
									<button
										key={t}
										type="button"
										onClick={() => setType(t)}
										disabled={locked}
										title={locked ? "Pro feature" : undefined}
										className={cn(
											"flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
											active
												? "border-foreground bg-muted text-foreground"
												: "border-border text-muted-foreground hover:text-foreground",
											locked && "cursor-not-allowed opacity-50 hover:text-muted-foreground",
										)}
									>
										{Icon ? <Icon className="size-3.5" style={{ color }} /> : null}
										{ITEM_TYPE_LABELS[t] ?? t}
										{locked && (
											<span className="text-[9px] font-semibold tracking-wide text-sidebar-foreground/70">
												PRO
											</span>
										)}
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

					{showLanguage && (
						<Field label="Language">
							<LanguageSelect value={language} onChange={setLanguage} />
						</Field>
					)}

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
						{isPro && (
							<SuggestTags
								title={title}
								content={content}
								existingTags={parseTags(tagsInput)}
								onAdd={(tag) =>
									setTagsInput((prev) => {
										const tags = parseTags(prev);
										if (tags.includes(tag)) return prev;
										return [...tags, tag].join(", ");
									})
								}
							/>
						)}
					</Field>

					<Field label="Collections">
						<CollectionSelect
							options={collectionOptions}
							selected={collectionIds}
							onChange={setCollectionIds}
							loading={collectionsLoading}
						/>
					</Field>
				</DialogBody>

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
