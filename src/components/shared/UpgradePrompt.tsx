import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function UpgradePrompt({
	message = "This is a Pro feature.",
	className,
}: {
	message?: string;
	className?: string;
}) {
	return (
		<div
			className={cn(
				"flex items-center gap-3 rounded-lg border border-violet-500/30 bg-violet-500/10 p-3",
				className,
			)}
		>
			<Sparkles className="size-4 shrink-0 text-violet-500" />
			<p className="flex-1 text-sm text-muted-foreground">{message}</p>
			<Button asChild size="sm">
				<Link href="/settings">Upgrade to Pro</Link>
			</Button>
		</div>
	);
}
