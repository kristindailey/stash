import {
	MARKETING_FEATURES,
	MARKETING_TYPE_COLORS,
} from "@/lib/constants/marketing";
import { Reveal } from "@/components/marketing/Reveal";

export function FeaturesSection() {
	return (
		<section
			id="features"
			className="border-y border-border/60 bg-card/30"
		>
			<div className="mx-auto max-w-[1180px] px-6 py-20">
				<Reveal className="mx-auto mb-12 max-w-[640px] text-center">
					<h2 className="text-[clamp(1.8rem,4vw,2.5rem)] font-extrabold tracking-tight">
						Everything in one place
					</h2>
					<p className="mt-3 text-lg text-muted-foreground">
						Capture any type of developer knowledge and find it again in seconds.
					</p>
				</Reveal>

				<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
					{MARKETING_FEATURES.map((f, i) => {
						const color = MARKETING_TYPE_COLORS[f.typeKey];
						const Icon = f.icon;
						return (
							<Reveal key={f.title} delay={i * 60}>
								<article
									style={{ "--c": color } as React.CSSProperties}
									className="group h-full rounded-[14px] border border-border/60 bg-card p-6 transition-all duration-200 hover:-translate-y-1 hover:border-(--c) hover:shadow-xl"
								>
									<span
										className="mb-4 inline-flex size-12 items-center justify-center rounded-xl border"
										style={{
											color,
											backgroundColor: `color-mix(in srgb, ${color} 16%, transparent)`,
											borderColor: `color-mix(in srgb, ${color} 30%, transparent)`,
										}}
									>
										<Icon className="size-[22px]" strokeWidth={2} />
									</span>
									<h3 className="mb-1 text-lg font-bold">{f.title}</h3>
									<p className="text-sm text-muted-foreground">{f.desc}</p>
								</article>
							</Reveal>
						);
					})}
				</div>
			</div>
		</section>
	);
}
