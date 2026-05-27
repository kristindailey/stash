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
import {
	CREATABLE_TYPES,
	ITEM_TYPE_COLORS,
	ITEM_TYPE_ICONS,
	ITEM_TYPE_LABELS,
	type CreatableType,
} from "@/lib/constants/item-types";
import { cn } from "@/lib/utils";
import { createItem } from "@/actions/items";

const CONTENT_TYPES = new Set<CreatableType>(["snippet", "prompt", "command", "note"]);
const LANGUAGE_TYPES = new Set<CreatableType>(["snippet", "command"]);

export function NewItemDialog() {
	const router = useRouter();
	const [open, setOpen] = React.useState(false);
	const [type, setType] = React.useState<CreatableType>("snippet");
	const [title, setTitle] = React.useState("");
	const [description, setDescription] = React.useState("");
	const [content, setContent] = React.useState("");
	const [language, setLanguage] = React.useState("");
	const [url, setUrl] = React.useState("");
	const [tagsInput, setTagsInput] = React.useState("");
	const [saving, setSaving] = React.useState(false);

	const reset = React.useCallback(() => {
		setType("snippet");
		setTitle("");
		setDescription("");
		setContent("");
		setLanguage("");
		setUrl("");
		setTagsInput("");
		setSaving(false);
	}, []);

	const handleOpenChange = (next: boolean) => {
		if (saving) return;
		setOpen(next);
		if (!next) reset();
	};

	const showContent = CONTENT_TYPES.has(type);
	const showLanguage = LANGUAGE_TYPES.has(type);
	const showUrl = type === "link";

	const trimmedTitle = title.trim();
	const trimmedUrl = url.trim();
	const canSave =
		trimmedTitle.length > 0 &&
		(!showUrl || trimmedUrl.length > 0) &&
		!saving;

	const handleSave = async () => {
		setSaving(true);
		const tags = tagsInput
			.split(",")
			.map((tag) => tag.trim())
			.filter((tag) => tag.length > 0);

		const result = await createItem({
			type,
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
							<Textarea
								value={content}
								onChange={(e) => setContent(e.target.value)}
								placeholder="Content"
								rows={6}
								className="font-mono text-xs"
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
