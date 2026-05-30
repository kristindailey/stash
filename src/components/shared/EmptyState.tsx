export function EmptyState({ message }: { message: string }) {
	return (
		<div className="flex items-center justify-center rounded-xl border border-dashed bg-muted/40 py-20 text-center">
			<p className="text-sm text-muted-foreground">{message}</p>
		</div>
	);
}
