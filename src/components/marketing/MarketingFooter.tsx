import Link from "next/link";
import { Brand } from "@/components/marketing/Brand";
import { FOOTER_COLUMNS } from "@/lib/constants/marketing";

export function MarketingFooter() {
	const year = new Date().getFullYear();

	return (
		<footer className="border-t border-border/60 bg-card/30">
			<div className="mx-auto grid max-w-[1180px] grid-cols-1 gap-10 px-6 pt-14 pb-10 md:grid-cols-[1.5fr_2fr]">
				<div>
					<Brand href="/" />
					<p className="mt-4 max-w-[260px] text-sm text-muted-foreground/70">
						The place to stash all your developer knowledge.
					</p>
				</div>
				<div className="flex gap-12 sm:justify-end">
					{FOOTER_COLUMNS.map((col) => (
						<div key={col.heading}>
							<h4 className="mb-4 text-sm font-bold">{col.heading}</h4>
							{col.links.map((link) => (
								<Link
									key={link.label}
									href={link.href}
									className="block py-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
								>
									{link.label}
								</Link>
							))}
						</div>
					))}
				</div>
			</div>
			<div className="mx-auto max-w-[1180px] border-t border-border/60 px-6 py-6 text-sm text-muted-foreground/70">
				<span>&copy; {year} Stash. All rights reserved.</span>
			</div>
		</footer>
	);
}
