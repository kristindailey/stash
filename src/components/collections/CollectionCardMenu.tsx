"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MoreHorizontal, Pencil, Star, Trash2 } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { EditCollectionDialog } from "@/components/collections/EditCollectionDialog";
import { DeleteCollectionDialog } from "@/components/collections/DeleteCollectionDialog";
import {
	deleteCollection,
	toggleCollectionFavorite,
} from "@/actions/collections";
import type { DashboardCollection } from "@/lib/db/collections";

export function CollectionCardMenu({
	collection,
}: {
	collection: DashboardCollection;
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

		toast.success(result.data.isFavorite ? "Added to favorites" : "Removed from favorites");
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
		setDeleting(false);
		router.refresh();
	};

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						size="icon-sm"
						aria-label="Collection actions"
						onClick={(e) => e.stopPropagation()}
					>
						<MoreHorizontal />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent>
					<DropdownMenuItem
						onSelect={() => setEditOpen(true)}
					>
						<Pencil />
						Edit
					</DropdownMenuItem>
					<DropdownMenuItem
						onSelect={(e) => {
							e.preventDefault();
							handleFavorite();
						}}
					>
						<Star
							style={collection.isFavorite ? { color: "#fcd757" } : undefined}
							fill={collection.isFavorite ? "currentColor" : "none"}
						/>
						{collection.isFavorite ? "Unfavorite" : "Favorite"}
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						variant="destructive"
						onSelect={() => setDeleteOpen(true)}
					>
						<Trash2 />
						Delete
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

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
