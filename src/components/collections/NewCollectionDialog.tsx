"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FolderPlus } from "lucide-react";
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
import { createCollection } from "@/actions/collections";

export function NewCollectionDialog() {
	const router = useRouter();
	const [open, setOpen] = React.useState(false);
	const [name, setName] = React.useState("");
	const [description, setDescription] = React.useState("");
	const [saving, setSaving] = React.useState(false);

	const reset = React.useCallback(() => {
		setName("");
		setDescription("");
		setSaving(false);
	}, []);

	const handleOpenChange = (next: boolean) => {
		if (saving) return;
		setOpen(next);
		if (!next) reset();
	};

	const trimmedName = name.trim();
	const canSave = trimmedName.length > 0 && !saving;

	const handleSave = async () => {
		setSaving(true);

		const result = await createCollection({ name, description });

		setSaving(false);

		if (!result.success) {
			toast.error(result.error);
			return;
		}

		toast.success("Collection created");
		setOpen(false);
		reset();
		router.refresh();
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				<Button variant="outline" size="lg" aria-label="New Collection">
					<FolderPlus />
					<span className="hidden md:inline">New Collection</span>
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-xl">
				<DialogHeader>
					<DialogTitle>New collection</DialogTitle>
					<DialogDescription>
						Create a collection to organize your items.
					</DialogDescription>
				</DialogHeader>

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
