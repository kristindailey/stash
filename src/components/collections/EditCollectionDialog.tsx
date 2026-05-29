"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { updateCollection } from "@/actions/collections";

type Collection = { id: string; name: string; description: string | null };

export function EditCollectionDialog({
	open,
	onOpenChange,
	collection,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	collection: Collection;
}) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-xl">
				<DialogHeader>
					<DialogTitle>Edit collection</DialogTitle>
					<DialogDescription>
						Update the collection name and description.
					</DialogDescription>
				</DialogHeader>
				<EditCollectionForm
					collection={collection}
					onClose={() => onOpenChange(false)}
				/>
			</DialogContent>
		</Dialog>
	);
}

function EditCollectionForm({
	collection,
	onClose,
}: {
	collection: Collection;
	onClose: () => void;
}) {
	const router = useRouter();
	const [name, setName] = React.useState(collection.name);
	const [description, setDescription] = React.useState(
		collection.description ?? "",
	);
	const [saving, setSaving] = React.useState(false);

	const trimmedName = name.trim();
	const canSave = trimmedName.length > 0 && !saving;

	const handleSave = async () => {
		setSaving(true);

		const result = await updateCollection(collection.id, { name, description });

		setSaving(false);

		if (!result.success) {
			toast.error(result.error);
			return;
		}

		toast.success("Collection updated");
		onClose();
		router.refresh();
	};

	return (
		<>
			<div className="flex flex-col gap-4">
				<Field label="Name">
					<Input
						value={name}
						onChange={(e) => setName(e.target.value)}
						placeholder="Name"
						aria-invalid={trimmedName.length === 0}
						autoFocus
					/>
				</Field>

				<Field label="Description">
					<Textarea
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						placeholder="Optional description"
						rows={3}
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
					{saving ? "Saving…" : "Save"}
				</Button>
			</DialogFooter>
		</>
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
