"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditCollectionDialog } from "@/components/collections/EditCollectionDialog";
import { DeleteCollectionDialog } from "@/components/collections/DeleteCollectionDialog";
import {
	deleteCollection,
	toggleCollectionFavorite,
} from "@/actions/collections";

export function CollectionDetailActions({
	collection,
}: {
	collection: {
		id: string;
		name: string;
		description: string | null;
		isFavorite: boolean;
	};
}) {
	const router = useRouter();
	const [editOpen, setEditOpen] = React.useState(false);
	const [deleteOpen, setDeleteOpen] = React.useState(false);
	const [deleting, setDeleting] = React.useState(false);
	const [favoriting, setFavoriting] = React.useState(false);

	const handleFavorite = async () => {
		if (favoriting) return;
		setFavoriting(true);

		const result = await toggleCollectionFavorite(collection.id);

		setFavoriting(false);

		if (!result.success) {
			toast.error(result.error);
			return;
		}

		toast.success(
			result.data.isFavorite
				? "Added to favorites"
				: "Removed from favorites",
		);
		router.refresh();
	};

	const handleDelete = async () => {
		setDeleting(true);

		const result = await deleteCollection(collection.id);

		if (!result.success) {
			setDeleting(false);
			toast.error(result.error);
			return;
		}

		toast.success("Collection deleted");
		setDeleteOpen(false);
		router.replace("/collections");
	};

	return (
		<>
			<div className="flex items-center gap-2">
				<Button
					variant="outline"
					size="sm"
					onClick={handleFavorite}
					disabled={favoriting}
				>
					<Star
						style={collection.isFavorite ? { color: "#fcd757" } : undefined}
						fill={collection.isFavorite ? "currentColor" : "none"}
					/>
				</Button>
				<Button
					variant="outline"
					size="sm"
					aria-label="Edit collection"
					onClick={() => setEditOpen(true)}
				>
					<Pencil />
				</Button>
				<Button
					variant="destructive"
					size="sm"
					aria-label="Delete collection"
					onClick={() => setDeleteOpen(true)}
				>
					<Trash2 />
				</Button>
			</div>

			<EditCollectionDialog
				open={editOpen}
				onOpenChange={setEditOpen}
				collection={collection}
			/>
			<DeleteCollectionDialog
				open={deleteOpen}
				onOpenChange={setDeleteOpen}
				name={collection.name}
				deleting={deleting}
				onConfirm={handleDelete}
			/>
		</>
	);
}
