"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
	createBillingPortalSession,
	createCheckoutSession,
} from "@/actions/billing";

type Plan = "monthly" | "yearly";

export function BillingSection({ isPro }: { isPro: boolean }) {
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
			<div className="rounded-lg border bg-card p-4">
				<div className="flex items-center justify-between gap-4">
					<div className="min-w-0">
						<h3 className="flex items-center gap-1.5 text-sm font-medium">
							<Sparkles className="size-4 text-violet-500" />
							DevStash Pro
						</h3>
						<p className="text-xs text-muted-foreground">
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
		<div className="rounded-lg border bg-card p-4">
			<div className="flex flex-col gap-4">
				<div className="min-w-0">
					<h3 className="text-sm font-medium">Upgrade to Pro</h3>
					<p className="text-xs text-muted-foreground">
						Unlimited items and collections, file &amp; image uploads, and
						more.
					</p>
				</div>

				<div className="inline-flex w-fit rounded-md border p-0.5">
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
					onClick={onUpgrade}
					disabled={pending}
					className="w-fit"
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
				"flex items-center gap-1.5 rounded px-3 py-1.5 text-sm font-medium transition-colors",
				active
					? "bg-foreground text-background"
					: "text-muted-foreground hover:text-foreground",
			)}
		>
			{label}
			{hint && (
				<span
					className={cn(
						"text-[10px] font-semibold",
						active ? "text-background/70" : "text-emerald-500",
					)}
				>
					{hint}
				</span>
			)}
		</button>
	);
}
