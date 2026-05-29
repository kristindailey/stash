import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
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
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Delete this collection?</AlertDialogTitle>
					<AlertDialogDescription>
						&ldquo;{name}&rdquo; will be permanently deleted. This cannot be undone. Note: Items in this collection will not be deleted.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
					<AlertDialogAction
						onClick={(e) => {
							e.preventDefault();
							onConfirm();
						}}
						disabled={deleting}
						className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
					>
						{deleting ? "Deleting…" : "Delete"}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
