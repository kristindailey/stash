"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Brand } from "@/components/marketing/Brand";
import { Button } from "@/components/ui/button";
import { CTA_PRIMARY_CLASS } from "@/lib/constants/marketing";
import { cn } from "@/lib/utils";

export function MarketingNav() {
	const [scrolled, setScrolled] = useState(false);

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 16);
		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	return (
		<nav
			className={cn(
				"fixed inset-x-0 top-0 z-50 border-b border-transparent transition-colors duration-300",
				scrolled && "border-border/60 bg-background/80 backdrop-blur-md"
			)}
		>
			<div className="mx-auto flex max-w-[1180px] items-center justify-between gap-6 px-6 py-3.5">
				<Brand href="/" />
				<div className="ml-auto hidden gap-6 text-sm text-muted-foreground sm:flex">
					<a href="#features" className="transition-colors hover:text-foreground">
						Features
					</a>
					<a href="#pricing" className="transition-colors hover:text-foreground">
						Pricing
					</a>
				</div>
				<div className="flex items-center gap-2">
					<Button asChild variant="ghost" size="lg" className="px-4">
						<Link href="/login">Sign In</Link>
					</Button>
					<Button asChild size="lg" className={cn("px-4", CTA_PRIMARY_CLASS)}>
						<Link href="/register">Get Started</Link>
					</Button>
				</div>
			</div>
		</nav>
	);
}
