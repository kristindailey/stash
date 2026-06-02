"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createCheckoutSession } from "@/actions/billing";
import { CTA_PRIMARY_CLASS, PRICING_PLANS } from "@/lib/constants/marketing";
import { cn } from "@/lib/utils";

export function UpgradePlans() {
	const [yearly, setYearly] = React.useState(true);
	const [pending, setPending] = React.useState(false);

	async function onUpgrade() {
		setPending(true);
		const result = await createCheckoutSession(yearly ? "yearly" : "monthly");
		if (!result.success) {
			setPending(false);
			toast.error(result.error);
			return;
		}
		window.location.href = result.data.url;
	}

	return (
		<div className="flex flex-col items-center gap-10">
			<div className="inline-flex gap-1 rounded-full border border-border bg-card/40 p-1">
				<button
					type="button"
					onClick={() => setYearly(false)}
					className={cn(
						"rounded-full px-4.5 py-1.5 text-sm font-semibold text-muted-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
						!yearly && "bg-brand-yellow text-neutral-900",
					)}
				>
					Monthly
				</button>
				<button
					type="button"
					onClick={() => setYearly(true)}
					className={cn(
						"inline-flex items-center gap-1.5 rounded-full px-4.5 py-1.5 text-sm font-semibold text-muted-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
						yearly && "bg-brand-yellow text-neutral-900",
					)}
				>
					Yearly
					<span className="rounded-full bg-brand-stone px-1.5 py-0.5 text-[0.7rem] font-bold text-white">
						Save 25%
					</span>
				</button>
			</div>

			<div className="grid w-full max-w-[780px] grid-cols-1 gap-6 md:grid-cols-2">
				{PRICING_PLANS.map((plan) => {
					const amount =
						yearly && plan.priceYearly ? plan.priceYearly : plan.priceMonthly;
					const period =
						yearly && plan.periodYearly ? plan.periodYearly : plan.pricePeriod;
					return (
						<div
							key={plan.name}
							className={cn(
								"relative flex h-full flex-col rounded-[14px] border bg-card p-8",
								plan.featured
									? "border-brand-yellow shadow-[0_0_0_1px_var(--color-brand-yellow),0_18px_44px_rgba(252,215,87,0.22)]"
									: "border-border/60",
							)}
						>
							{plan.featured && (
								<Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-brand-yellow to-brand-lime text-neutral-900 uppercase">
									Most Popular
								</Badge>
							)}
							<h3 className="text-xl font-bold">{plan.name}</h3>
							<div className="my-4 flex items-baseline gap-2">
								<span className="text-[2.8rem] font-extrabold tracking-tight">
									{amount}
								</span>
								<span className="text-sm text-muted-foreground/70">
									{period}
								</span>
							</div>
							<ul className="mb-7 flex flex-1 flex-col gap-3">
								{plan.features.map((f) => (
									<li
										key={f}
										className="flex items-start gap-2 text-muted-foreground"
									>
										<Check
											className="mt-1 size-4 shrink-0 text-brand-coral"
											strokeWidth={3}
										/>
										<span className="text-[0.95rem]">{f}</span>
									</li>
								))}
							</ul>
							{plan.featured ? (
								<Button
									type="button"
									size="lg"
									onClick={onUpgrade}
									disabled={pending}
									className={cn("h-11 w-full", CTA_PRIMARY_CLASS)}
								>
									{pending ? "Redirecting…" : plan.cta}
								</Button>
							) : (
								<Button
									type="button"
									size="lg"
									variant="outline"
									disabled
									className="h-11 w-full"
								>
									Current plan
								</Button>
							)}
						</div>
					);
				})}
			</div>

			<p className="text-center text-xs text-muted-foreground">
				Secure checkout powered by Stripe. Cancel anytime.
			</p>
		</div>
	);
}
