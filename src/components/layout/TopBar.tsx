"use client";

import Link from "next/link";
import { Code, Crown, PanelLeft, Search } from "lucide-react";
import { NewItemDialog } from "@/components/items/NewItemDialog";
import { NewCollectionDialog } from "@/components/collections/NewCollectionDialog";
import { useCommandPalette } from "@/components/search/command-palette-context";
import { Button } from "@/components/ui/button";
import { useSidebar } from "./sidebar-context";

export function TopBar({ isPro }: { isPro: boolean }) {
	const { toggle } = useSidebar();
	const { openPalette } = useCommandPalette();
	return (
		<header className="flex h-16 shrink-0 items-center border-b">
			<div className="flex h-full shrink-0 items-center gap-2.5 border-r px-4 md:w-64 md:px-5">
				<Link
					href="/dashboard"
					aria-label="Go to dashboard"
					className="flex items-center gap-2.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
				>
					<div className="flex size-8 items-center justify-center rounded-lg bg-foreground text-background">
						<Code className="size-4" />
					</div>
					<span className="hidden text-lg font-semibold tracking-tight sm:inline">
						DevStash
					</span>
				</Link>
				<button
					type="button"
					onClick={toggle}
					aria-label="Toggle sidebar"
					className="ml-auto flex size-9 items-center justify-center rounded-md text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
				>
					<PanelLeft className="size-4" />
				</button>
			</div>

			<div className="flex flex-1 justify-center px-3 md:px-6">
				<button
					type="button"
					onClick={openPalette}
					aria-label="Search"
					className="relative hidden h-9 w-full max-w-xl items-center rounded-md border bg-transparent pr-16 pl-9 text-left text-sm text-muted-foreground outline-none hover:bg-accent/40 focus-visible:ring-2 focus-visible:ring-ring md:flex"
				>
					<Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
					<span className="whitespace-nowrap">Search items, collections, tags…</span>
					<kbd className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 rounded border bg-muted px-1.5 py-0.5 font-sans text-[11px] font-medium">
						⌘ K
					</kbd>
				</button>
				<button
					type="button"
					onClick={openPalette}
					aria-label="Search"
					className="ml-auto flex size-9 items-center justify-center rounded-md border bg-transparent text-muted-foreground outline-none hover:bg-accent/40 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring md:hidden"
				>
					<Search className="size-4" />
				</button>
			</div>

			<div className="flex shrink-0 items-center gap-2 px-3 md:px-5">
				{!isPro && (
					<Button asChild variant="outline" size="lg" aria-label="Upgrade">
						<Link href="/upgrade">
							<Crown className="size-4" />
							<span className="hidden sm:inline">Upgrade</span>
						</Link>
					</Button>
				)}
				<NewCollectionDialog />
				<NewItemDialog isPro={isPro} />
			</div>
		</header>
	);
}
