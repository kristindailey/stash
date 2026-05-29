import { Trash2Icon } from "lucide-react";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogMedia,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function DeleteCollectionDialog({
	open,
	onOpenChange,
	name,
	deleting,
	onConfirm,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	name: string;
	deleting: boolean;
	onConfirm: () => void;
}) {
	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent size="sm">
				<AlertDialogHeader>
					<AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20">
						<Trash2Icon />
					</AlertDialogMedia>
					<AlertDialogTitle>Delete this collection?</AlertDialogTitle>
					<AlertDialogDescription>
						<span className="font-medium text-foreground">{name}</span> will be permanently deleted. This cannot be undone.
						<span className="mt-2 block">
							Items in this collection will not be deleted.
						</span>
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
					<AlertDialogAction
						variant="destructive"
						onClick={(e) => {
							e.preventDefault();
							onConfirm();
						}}
						disabled={deleting}
					>
						{deleting ? "Deleting…" : "Delete"}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
