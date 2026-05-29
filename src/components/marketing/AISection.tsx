import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import { Reveal } from "@/components/marketing/Reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	AI_CHECKLIST,
	AI_TAGS,
	CTA_PRIMARY_CLASS,
} from "@/lib/constants/marketing";
import { cn } from "@/lib/utils";

export function AISection() {
	return (
		<section id="ai" className="mx-auto max-w-[1180px] px-6 py-20">
			<div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
				<Reveal>
					<Badge
						variant="outline"
						className="mb-4 border-amber-500/30 bg-amber-500/15 text-amber-400 uppercase"
					>
						Pro Feature
					</Badge>
					<h2 className="text-left text-[clamp(1.8rem,4vw,2.5rem)] font-extrabold tracking-tight">
						Let AI do the busywork
					</h2>
					<p className="mt-3 text-lg text-muted-foreground">
						DevStash understands what you save and enriches it automatically, so
						your library stays organized without the manual labor.
					</p>
					<ul className="my-7 flex flex-col gap-3">
						{AI_CHECKLIST.map((item) => (
							<li key={item} className="flex items-start gap-2 text-muted-foreground">
								<Check className="mt-1 size-4 shrink-0 text-blue-500" strokeWidth={3} />
								<span className="text-[0.95rem]">{item}</span>
							</li>
						))}
					</ul>
					<Button asChild size="lg" className={cn("px-5", CTA_PRIMARY_CLASS)}>
						<Link href="/register">Unlock Pro</Link>
					</Button>
				</Reveal>

				<Reveal>
					<div className="overflow-hidden rounded-[14px] border border-border bg-[#0d1017] font-mono shadow-2xl">
						<div className="flex items-center gap-2 border-b border-border/60 bg-[#11151d] px-4 py-2.5">
							<span className="size-3 rounded-full bg-[#ff5f56]" />
							<span className="size-3 rounded-full bg-[#ffbd2e]" />
							<span className="size-3 rounded-full bg-[#27c93f]" />
							<span className="ml-2 text-[0.8rem] text-muted-foreground/70">
								useDebounce.ts
							</span>
						</div>
						<pre
							className="overflow-x-auto px-5 py-5 text-[0.82rem] leading-[1.7] text-[#c5ccd6]"
							role="img"
							aria-label="Code example: a useDebounce React hook"
						>
							<code aria-hidden="true">
								<span className="text-purple-400">import</span>
								{" { useState, useEffect } "}
								<span className="text-purple-400">from</span>{" "}
								<span className="text-emerald-400">{"'react'"}</span>;{"\n\n"}
								<span className="text-purple-400">export function</span>{" "}
								<span className="text-blue-400">useDebounce</span>
								{"<T>(value: T, delay: "}
								<span className="text-amber-400">number</span>
								{") {\n  "}
								<span className="text-purple-400">const</span>
								{" [debounced, setDebounced] = "}
								<span className="text-blue-400">useState</span>
								{"(value);\n\n  "}
								<span className="text-blue-400">useEffect</span>
								{"(() => {\n    "}
								<span className="text-purple-400">const</span>
								{" id = "}
								<span className="text-blue-400">setTimeout</span>
								{"(() => "}
								<span className="text-blue-400">setDebounced</span>
								{"(value), delay);\n    "}
								<span className="text-purple-400">return</span>
								{" () => "}
								<span className="text-blue-400">clearTimeout</span>
								{"(id);\n  }, [value, delay]);\n\n  "}
								<span className="text-purple-400">return</span>
								{" debounced;\n}"}
							</code>
						</pre>
						<div className="border-t border-border/60 px-5 pt-4 pb-5">
							<span className="mb-3 flex items-center gap-1.5 text-[0.78rem] font-semibold text-amber-400">
								<Sparkles className="size-3.5" strokeWidth={2} />
								AI Generated Tags
							</span>
							<div className="flex flex-wrap gap-2">
								{AI_TAGS.map((tag, i) => (
									<span
										key={tag}
										style={{ animationDelay: `${i * 80}ms` }}
										className="animate-in fade-in slide-in-from-bottom-1 fill-mode-both rounded-full border border-blue-500/30 bg-blue-500/15 px-2.5 py-1 text-[0.78rem] text-blue-400 duration-500"
									>
										{tag}
									</span>
								))}
							</div>
						</div>
					</div>
				</Reveal>
			</div>
		</section>
	);
}
