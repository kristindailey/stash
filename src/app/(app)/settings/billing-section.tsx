"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CTA_PRIMARY_CLASS } from "@/lib/constants/marketing";
import {
	createBillingPortalSession,
	createCheckoutSession,
} from "@/actions/billing";
import {
	FREE_COLLECTION_LIMIT,
	FREE_ITEM_LIMIT,
} from "@/lib/constants/limits";

type Plan = "monthly" | "yearly";

export function BillingSection({
	isPro,
	itemCount,
	collectionCount,
}: {
	isPro: boolean;
	itemCount: number;
	collectionCount: number;
}) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [plan, setPlan] = React.useState<Plan>("yearly");
	const [pending, setPending] = React.useState(false);

	const checkout = searchParams.get("checkout");
	const handledCheckout = React.useRef(false);

	React.useEffect(() => {
		if (!checkout || handledCheckout.current) return;
		handledCheckout.current = true;

		if (checkout === "success") {
			toast.success("Welcome to Pro! Your subscription is active.");
			router.refresh();
		} else if (checkout === "cancelled") {
			toast.info("Checkout cancelled.");
		}

		router.replace("/settings");
	}, [checkout, router]);

	async function onUpgrade() {
		setPending(true);
		const result = await createCheckoutSession(plan);
		if (!result.success) {
			setPending(false);
			toast.error(result.error);
			return;
		}
		window.location.href = result.data.url;
	}

	async function onManage() {
		setPending(true);
		const result = await createBillingPortalSession();
		if (!result.success) {
			setPending(false);
			toast.error(result.error);
			return;
		}
		window.location.href = result.data.url;
	}

	if (isPro) {
		return (
			<div className="rounded-lg border bg-card p-6">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div className="min-w-0 space-y-1.5">
						<div className="flex items-center gap-2 pb-3">
							<span className="text-sm font-medium text-muted-foreground">
								Current plan:
							</span>
							<Badge className="border-transparent bg-violet-500 text-white">
								Pro
							</Badge>
						</div>
						<h3 className="flex items-center gap-2 text-base font-semibold">
							<Crown className="size-4 text-violet-500" />
							Stash Pro
						</h3>
						<p className="text-sm text-muted-foreground">
							You have an active Pro subscription.
						</p>
					</div>
					<Button
						type="button"
						variant="outline"
						onClick={onManage}
						disabled={pending}
					>
						{pending ? "Opening…" : "Manage subscription"}
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="rounded-lg border bg-card p-6">
			<div className="flex flex-col gap-6">
				<div className="min-w-0 space-y-1.5">
					<div className="flex items-center gap-2 pb-1">
						<span className="text-sm font-medium text-muted-foreground">
							Current plan:
						</span>
						<Badge className="border-transparent bg-blue-500 text-white">
							Free
						</Badge>
					</div>
					<p className="text-sm text-muted-foreground pb-3">
						You&apos;re currently using {itemCount}/{FREE_ITEM_LIMIT}{" "}
						items and {collectionCount}/{FREE_COLLECTION_LIMIT}{" "}
						collections.
					</p>
					<h3 className="text-base font-semibold pb-1">Upgrade to Pro</h3>
					<p className="text-sm text-muted-foreground">
						Unlock unlimited items, file uploads, AI features, and more.
					</p>
				</div>

				<div className="inline-flex w-fit gap-1 rounded-full border border-border bg-card/40 p-1">
					<PlanOption
						active={plan === "monthly"}
						onClick={() => setPlan("monthly")}
						label="$8 / month"
					/>
					<PlanOption
						active={plan === "yearly"}
						onClick={() => setPlan("yearly")}
						label="$72 / year"
						hint="Save 25%"
					/>
				</div>

				<Button
					type="button"
					size="lg"
					onClick={onUpgrade}
					disabled={pending}
					className={cn("w-fit px-6", CTA_PRIMARY_CLASS)}
				>
					{pending ? "Redirecting…" : "Upgrade to Pro"}
				</Button>
			</div>
		</div>
	);
}

function PlanOption({
	active,
	onClick,
	label,
	hint,
}: {
	active: boolean;
	onClick: () => void;
	label: string;
	hint?: string;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				"inline-flex items-center gap-1.5 rounded-full px-4.5 py-1.5 text-sm font-semibold text-muted-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
				active && "bg-blue-500 text-white",
			)}
		>
			{label}
			{hint && (
				<span
					className={cn(
						"rounded-full px-1.5 py-0.5 text-[0.7rem] font-bold",
						active
							? "bg-white/20 text-white"
							: "bg-emerald-500/20 text-emerald-400",
					)}
				>
					{hint}
				</span>
			)}
		</button>
	);
}
