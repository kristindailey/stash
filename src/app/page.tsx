import type { Metadata } from "next";
import { AISection } from "@/components/marketing/AISection";
import { CTASection } from "@/components/marketing/CTASection";
import { FeaturesSection } from "@/components/marketing/FeaturesSection";
import { HeroSection } from "@/components/marketing/HeroSection";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { PricingSection } from "@/components/marketing/PricingSection";

export const metadata: Metadata = {
	title: "DevStash — Stop Losing Your Developer Knowledge",
	description:
		"DevStash is one fast, searchable, AI-enhanced hub for your code snippets, AI prompts, commands, notes, files, and links.",
};

export default function Home() {
	return (
		<div className="marketing text-foreground">
			<div
				aria-hidden="true"
				className="pointer-events-none fixed inset-0 -z-10 bg-[#0a0c10] bg-[radial-gradient(60%_50%_at_15%_0%,rgba(99,102,241,0.14),transparent_70%),radial-gradient(50%_45%_at_90%_10%,rgba(236,72,153,0.1),transparent_70%)]"
			/>
			<MarketingNav />
			<main>
				<HeroSection />
				<FeaturesSection />
				<AISection />
				<PricingSection />
				<CTASection />
			</main>
			<MarketingFooter />
		</div>
	);
}
