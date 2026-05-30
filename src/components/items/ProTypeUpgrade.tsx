import { Sparkles, type LucideIcon } from "lucide-react";
import { BillingSection } from "@/app/(app)/settings/billing-section";

export function ProTypeUpgrade({
	label,
	Icon,
	color,
}: {
	label: string;
	Icon: LucideIcon;
	color: string;
}) {
	return (
		<div className="flex flex-1 items-center justify-center py-12">
			<div className="flex w-full max-w-md flex-col items-center gap-6 rounded-xl border border-violet-500/30 bg-violet-500/5 p-8 text-center">
				<div
					className="flex size-14 items-center justify-center rounded-full"
					style={{ backgroundColor: `${color}1a` }}
				>
					<Icon className="size-7" style={{ color }} />
				</div>

				<div className="flex flex-col gap-2">
					<span className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-violet-500">
						<Sparkles className="size-3.5" />
						Pro feature
					</span>
					<h1 className="text-2xl font-semibold">{label} are a Pro feature</h1>
					<p className="text-sm text-muted-foreground">
						Upgrade to DevStash Pro to store {label.toLowerCase()} and unlock
						unlimited items, collections, and AI features.
					</p>
				</div>

				<div className="w-full text-left">
					<BillingSection isPro={false} />
				</div>
			</div>
		</div>
	);
}
