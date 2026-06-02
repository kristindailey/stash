import Link from "next/link";
import { Reveal } from "@/components/marketing/Reveal";
import { Button } from "@/components/ui/button";
import { CTA_PRIMARY_CLASS } from "@/lib/constants/marketing";
import { cn } from "@/lib/utils";

export function CTASection() {
	return (
		<section className="mx-auto max-w-[1180px] px-6 py-20">
			<Reveal>
				<div className="mx-auto rounded-[22px] border border-border bg-[radial-gradient(70%_120%_at_50%_0%,rgba(99,102,241,0.22),transparent_70%)] bg-card px-8 py-16 text-center">
					<h2 className="text-[clamp(1.8rem,4vw,2.6rem)] font-extrabold tracking-tight">
						Ready to Stash Your Knowledge?
					</h2>
					<p className="mx-auto mt-4 mb-8 max-w-[480px] text-muted-foreground">
						Join developers who&apos;ve stopped digging through chat histories and
						random folders.
					</p>
					<Button
						asChild
						size="lg"
						className={cn("h-11 px-6 text-base", CTA_PRIMARY_CLASS)}
					>
						<Link href="/register">Get Started Free</Link>
					</Button>
				</div>
			</Reveal>
		</section>
	);
}
