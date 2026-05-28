"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { DrawerBody } from "./DrawerBody";
import { DrawerEdit } from "./DrawerEdit";
import { DrawerSkeleton } from "./DrawerSkeleton";
import { useItemDetail, normalizeItemDates } from "@/hooks/useItemDetail";
import { deleteItem, toggleFavorite, togglePin } from "@/actions/items";
import { useItemDrawer } from "./item-drawer-context";

export function ItemDrawer() {
	const router = useRouter();
	const { openItemId, close } = useItemDrawer();
	const { item, setItem, loading, error } = useItemDetail(openItemId);
	const [mode, setMode] = React.useState<"view" | "edit">("view");
	const [deleting, setDeleting] = React.useState(false);
	const [togglingFavorite, setTogglingFavorite] = React.useState(false);
	const [togglingPin, setTogglingPin] = React.useState(false);
	const [modeFor, setModeFor] = React.useState<string | null>(openItemId);

	if (openItemId !== modeFor) {
		setModeFor(openItemId);
		setMode("view");
	}

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

		setItem(normalizeItemDates(result.data));
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

		setItem(normalizeItemDates(result.data));
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
