"use client";

import Link from "next/link";
import { useState } from "react";
import { Check } from "lucide-react";
import { Reveal } from "@/components/marketing/Reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CTA_PRIMARY_CLASS, PRICING_PLANS } from "@/lib/constants/marketing";
import { cn } from "@/lib/utils";

export function PricingSection() {
	const [yearly, setYearly] = useState(false);

	return (
		<section id="pricing" className="mx-auto max-w-[1180px] px-6 py-20">
			<Reveal className="mx-auto mb-12 max-w-[640px] text-center">
				<h2 className="text-[clamp(1.8rem,4vw,2.5rem)] font-extrabold tracking-tight">
					Simple, honest pricing
				</h2>
				<p className="mt-3 text-lg text-muted-foreground">
					Start free. Upgrade when you outgrow it.
				</p>
				<div className="mt-6 inline-flex gap-1 rounded-full border border-border bg-card/40 p-1">
					<button
						type="button"
						onClick={() => setYearly(false)}
						className={cn(
							"rounded-full px-4.5 py-1.5 text-sm font-semibold text-muted-foreground transition-colors",
							!yearly && "bg-blue-500 text-white"
						)}
					>
						Monthly
					</button>
					<button
						type="button"
						onClick={() => setYearly(true)}
						className={cn(
							"inline-flex items-center gap-1.5 rounded-full px-4.5 py-1.5 text-sm font-semibold text-muted-foreground transition-colors",
							yearly && "bg-blue-500 text-white"
						)}
					>
						Yearly
						<span
							className={cn(
								"rounded-full px-1.5 py-0.5 text-[0.7rem] font-bold",
								yearly
									? "bg-white/20 text-white"
									: "bg-emerald-500/20 text-emerald-400"
							)}
						>
							Save 25%
						</span>
					</button>
				</div>
			</Reveal>

			<div className="mx-auto grid max-w-[780px] grid-cols-1 justify-center gap-6 md:grid-cols-2">
				{PRICING_PLANS.map((plan) => {
					const amount =
						yearly && plan.priceYearly ? plan.priceYearly : plan.priceMonthly;
					const period =
						yearly && plan.periodYearly ? plan.periodYearly : plan.pricePeriod;
					return (
						<Reveal key={plan.name}>
							<div
								className={cn(
									"relative flex h-full flex-col rounded-[14px] border bg-card p-8",
									plan.featured
										? "border-blue-500 shadow-[0_0_0_1px_var(--color-blue-500),0_18px_44px_rgba(59,130,246,0.22)]"
										: "border-border/60"
								)}
							>
								{plan.featured && (
									<Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-400 to-blue-500 text-white uppercase">
										Most Popular
									</Badge>
								)}
								<h3 className="text-xl font-bold">{plan.name}</h3>
								<div className="my-4 flex items-baseline gap-2">
									<span className="text-[2.8rem] font-extrabold tracking-tight">
										{amount}
									</span>
									<span className="text-sm text-muted-foreground/70">{period}</span>
								</div>
								<ul className="mb-7 flex flex-1 flex-col gap-3">
									{plan.features.map((f) => (
										<li key={f} className="flex items-start gap-2 text-muted-foreground">
											<Check className="mt-1 size-4 shrink-0 text-blue-500" strokeWidth={3} />
											<span className="text-[0.95rem]">{f}</span>
										</li>
									))}
								</ul>
								<Button
									asChild
									size="lg"
									variant={plan.featured ? "default" : "outline"}
									className={cn("h-11 w-full", plan.featured && CTA_PRIMARY_CLASS)}
								>
									<Link href="/register">{plan.cta}</Link>
								</Button>
							</div>
						</Reveal>
					);
				})}
			</div>
		</section>
	);
}
