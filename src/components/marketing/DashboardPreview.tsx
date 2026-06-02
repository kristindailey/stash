import {
	MARKETING_TYPE_COLORS,
	PREVIEW_COLLECTIONS,
	PREVIEW_RECENT,
	PREVIEW_TYPES,
} from "@/lib/constants/marketing";
import { cn } from "@/lib/utils";

export function DashboardPreview() {
	return (
		<div>
			<span className="mb-3 block text-left text-xs font-semibold tracking-wide text-muted-foreground/70 uppercase">
				...with Stash
			</span>
			<div className="flex h-[360px] flex-col overflow-hidden rounded-[14px] border border-border bg-card/40 shadow-2xl">
				<div className="flex items-center gap-2.5 border-b border-border/60 bg-background px-3 py-2">
					<span className="flex gap-1.5">
						<i className="size-2 rounded-full bg-border" />
						<i className="size-2 rounded-full bg-border" />
						<i className="size-2 rounded-full bg-border" />
					</span>
					<span className="h-3 flex-1 rounded-md border border-border/60 bg-card" />
					<span className="size-4 rounded-full bg-gradient-to-br from-blue-400 to-blue-500" />
				</div>

				<div className="grid min-h-0 flex-1 grid-cols-[104px_1fr]">
					<div className="flex flex-col gap-2.5 border-r border-border/60 bg-background px-2.5 py-3.5">
						<div className="mb-1 h-3.5 w-[70%] rounded bg-gradient-to-r from-blue-400 to-blue-500" />
						<div className="flex flex-col gap-2">
							{PREVIEW_TYPES.map((t) => (
								<span
									key={t.typeKey}
									className={cn(
										"flex items-center gap-1.5 text-[0.6rem] text-muted-foreground",
										t.active && "font-semibold text-foreground"
									)}
								>
									<span
										className="size-2 shrink-0 rounded-full"
										style={{ backgroundColor: MARKETING_TYPE_COLORS[t.typeKey] }}
									/>
									{t.label}
								</span>
							))}
						</div>
						<span className="my-1 h-px bg-border/60" />
						<span className="h-2.5 w-3/5 rounded bg-border" />
						<span className="h-2.5 w-3/5 rounded bg-border" />
					</div>

					<div className="overflow-hidden p-3.5">
						<div>
							<span className="mb-2 block text-[0.58rem] font-bold tracking-wider text-muted-foreground/70 uppercase">
								Collections
							</span>
							<div className="grid grid-cols-3 gap-2">
								{PREVIEW_COLLECTIONS.map((c) => (
									<div
										key={c.name}
										className="rounded-lg border border-l-[3px] border-border/60 bg-card px-2 py-1.5"
										style={{ borderLeftColor: MARKETING_TYPE_COLORS[c.typeKey] }}
									>
										<span className="block truncate text-[0.56rem] font-semibold text-foreground">
											{c.name}
										</span>
										<span className="mt-1.5 block h-[5px] w-3/5 rounded bg-border" />
									</div>
								))}
							</div>
						</div>

						<div className="mt-3.5">
							<span className="mb-2 block text-[0.58rem] font-bold tracking-wider text-muted-foreground/70 uppercase">
								Recent Items
							</span>
							<div className="flex flex-col gap-1.5">
								{PREVIEW_RECENT.map((r) => (
									<div
										key={r.title}
										className="flex items-center gap-2 rounded-lg border border-border/60 bg-card px-2 py-1.5"
									>
										<span
											className="size-2 shrink-0 rounded-full"
											style={{ backgroundColor: MARKETING_TYPE_COLORS[r.typeKey] }}
										/>
										<span className="truncate text-[0.58rem] text-foreground">
											{r.title}
										</span>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
