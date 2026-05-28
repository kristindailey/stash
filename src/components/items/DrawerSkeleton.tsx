import {
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";

export function DrawerSkeleton({ error }: { error: string | null }) {
	return (
		<div className="flex flex-col gap-4 p-4">
			<SheetHeader className="p-0">
				<SheetTitle className="sr-only">Loading item</SheetTitle>
				<SheetDescription className="sr-only">
					Fetching item details
				</SheetDescription>
			</SheetHeader>
			{error ? (
				<p className="text-sm text-destructive">{error}</p>
			) : (
				<>
					<div className="h-6 w-2/3 animate-pulse rounded bg-muted" />
					<div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
					<div className="mt-2 h-9 w-full animate-pulse rounded bg-muted" />
					<div className="mt-4 h-24 w-full animate-pulse rounded bg-muted" />
				</>
			)}
		</div>
	);
}
