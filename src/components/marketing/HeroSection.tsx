import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ChaosVisual } from "@/components/marketing/ChaosVisual";
import { DashboardPreview } from "@/components/marketing/DashboardPreview";
import { Reveal } from "@/components/marketing/Reveal";
import { Button } from "@/components/ui/button";
import { CTA_PRIMARY_CLASS } from "@/lib/constants/marketing";
import { cn } from "@/lib/utils";

export function HeroSection() {
	return (
		<header id="top" className="mx-auto max-w-[1180px] px-6 pt-36 pb-16">
			<Reveal className="text-center">
				<h1 className="text-[clamp(2.4rem,6vw,4rem)] leading-[1.08] font-extrabold tracking-tight">
					Stop Losing Your{" "}
					<span className="block bg-gradient-to-r from-brand-yellow to-brand-lime bg-clip-text text-transparent">
						Developer Knowledge
					</span>
				</h1>
				<p className="mx-auto mt-6 max-w-[640px] text-lg text-muted-foreground">
					Snippets, prompts, commands and more live scattered
					across a dozen tools. Stash brings them into one fast, searchable,
					AI-enhanced hub.
				</p>
				<div className="mt-8 flex flex-wrap justify-center gap-3">
					<Button
						asChild
						size="lg"
						className={cn("h-11 px-6 text-base", CTA_PRIMARY_CLASS)}
					>
						<Link href="/register">Get Started Free</Link>
					</Button>
					<Button
						asChild
						variant="outline"
						size="lg"
						className="h-11 px-6 text-base hover:border-brand-yellow/60"
					>
						<a href="#features">See Features</a>
					</Button>
				</div>
			</Reveal>

			<Reveal className="mt-18">
				<div className="grid grid-cols-1 items-center gap-6 md:grid-cols-[1fr_auto_1fr]">
					<ChaosVisual />
					<div
						aria-hidden="true"
						className="animate-arrow-pulse flex size-14 rotate-90 items-center justify-center justify-self-center rounded-full bg-gradient-to-br from-brand-yellow to-brand-lime text-neutral-900 md:rotate-0"
					>
						<ArrowRight className="size-8" strokeWidth={2.5} />
					</div>
					<DashboardPreview />
				</div>
			</Reveal>
		</header>
	);
}
