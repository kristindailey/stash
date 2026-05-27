"use client";

import Link from "next/link";
import { Code, FolderPlus, PanelLeft, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSidebar } from "./sidebar-context";

export function TopBar() {
	const { toggle } = useSidebar();
	return (
		<header className="flex h-16 shrink-0 items-center border-b">
			<div className="flex h-full shrink-0 items-center gap-2.5 border-r px-5 md:w-64">
				<Link
					href="/dashboard"
					aria-label="Go to dashboard"
					className="flex items-center gap-2.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
				>
					<div className="flex size-8 items-center justify-center rounded-lg bg-foreground text-background">
						<Code className="size-4" />
					</div>
					<span className="text-lg font-semibold tracking-tight">DevStash</span>
				</Link>
				<button
					type="button"
					onClick={toggle}
					aria-label="Toggle sidebar"
					className="ml-auto flex h-7 w-5 items-center justify-end rounded-md text-muted-foreground hover:text-foreground"
				>
					<PanelLeft className="size-4" />
				</button>
			</div>

			<div className="flex flex-1 justify-center px-6">
				<div className="relative w-full max-w-xl">
					<Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						placeholder="Search items, collections, tags…"
						aria-label="Search"
						className="h-9 pr-16 pl-9"
					/>
					<kbd className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 rounded border bg-muted px-1.5 py-0.5 font-sans text-[11px] font-medium text-muted-foreground">
						⌘ K
					</kbd>
				</div>
			</div>

			<div className="flex shrink-0 items-center gap-2 px-5">
				<Button variant="outline" size="lg">
					<FolderPlus />
					New Collection
				</Button>
				<Button size="lg">
					<Plus />
					New Item
				</Button>
			</div>
		</header>
	);
}
