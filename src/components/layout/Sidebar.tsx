"use client";

import * as React from "react";
import Link from "next/link";
import {
	ChevronDown,
	Code,
	File,
	FolderOpen,
	Image as ImageIcon,
	Link as LinkIcon,
	Settings,
	Sparkles,
	Star,
	StickyNote,
	Terminal,
	type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { mockUser } from "@/lib/mock-data";
import type { SidebarCollection } from "@/lib/db/collections";
import type { SidebarItemType } from "@/lib/db/items";
import { useSidebar } from "./sidebar-context";

const TYPE_ICONS: Record<string, LucideIcon> = {
	Code,
	Sparkles,
	Terminal,
	StickyNote,
	File,
	Image: ImageIcon,
	Link: LinkIcon,
};

type SidebarProps = {
	itemTypes: SidebarItemType[];
	totalItemCount: number;
	collections: SidebarCollection[];
};

export function Sidebar({
	itemTypes,
	totalItemCount,
	collections,
}: SidebarProps) {
	const { open, setOpen } = useSidebar();
	const [favoritesOpen, setFavoritesOpen] = React.useState(true);
	const [collectionsOpen, setCollectionsOpen] = React.useState(true);

	const favoriteCollections = collections.filter((c) => c.isFavorite);
	const otherCollections = collections.filter((c) => !c.isFavorite);

	return (
		<>
			{open && (
				<button
					type="button"
					aria-label="Close sidebar"
					onClick={() => setOpen(false)}
					className="fixed inset-0 top-16 z-40 bg-black/50 md:hidden"
				/>
			)}
			<aside
				data-state={open ? "open" : "closed"}
				className={cn(
					"flex w-64 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground",
					"fixed top-16 bottom-0 left-0 z-40 transition-transform duration-200 md:static md:top-auto md:bottom-auto",
					open
						? "translate-x-0"
						: "-translate-x-full md:w-0 md:translate-x-0 md:overflow-hidden md:border-r-0"
				)}
			>
				<div className="flex flex-1 flex-col gap-5 overflow-y-auto px-3 py-4">
					<Section title="Types">
						<SidebarLink
							href="/items"
							icon={FolderOpen}
							label="All Items"
							count={totalItemCount}
							active
						/>
						{itemTypes.map((type) => {
							const Icon = TYPE_ICONS[type.icon] ?? FolderOpen;
							return (
								<SidebarLink
									key={type.id}
									href={type.route}
									icon={Icon}
									iconColor={type.color}
									label={type.label}
									count={type.count}
								/>
							);
						})}
					</Section>

					<Section
						title="Favorites"
						action={
							<SectionToggle
								open={favoritesOpen}
								onClick={() => setFavoritesOpen((o) => !o)}
								label="favorites"
							/>
						}
					>
						{favoritesOpen &&
							favoriteCollections.map((collection) => (
								<SidebarLink
									key={collection.id}
									href={`/collections/${collection.id}`}
									icon={Star}
									iconColor="#f59e0b"
									iconFill
									label={collection.name}
									count={collection.itemCount}
								/>
							))}
					</Section>

					<Section
						title="Collections"
						action={
							<SectionToggle
								open={collectionsOpen}
								onClick={() => setCollectionsOpen((o) => !o)}
								label="collections"
							/>
						}
					>
						{collectionsOpen && (
							<>
								{otherCollections.map((collection) => (
									<SidebarLink
										key={collection.id}
										href={`/collections/${collection.id}`}
										icon={FolderOpen}
										label={collection.name}
										count={collection.itemCount}
									/>
								))}
								<Link
									href="/collections"
									className="flex h-8 items-center gap-2.5 rounded-md px-2 text-sm text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
								>
									<span className="flex-1 truncate">View all collections</span>
								</Link>
							</>
						)}
					</Section>
				</div>

				<div className="border-t p-3">
					<div className="flex items-center gap-3 rounded-md px-2 py-1.5">
						<UserAvatar name={mockUser.name} />
						<div className="min-w-0 flex-1">
							<p className="truncate text-sm font-medium">{mockUser.name}</p>
							<p className="truncate text-xs text-sidebar-foreground/60">
								{mockUser.plan}
							</p>
						</div>
						<button
							type="button"
							aria-label="Settings"
							className="rounded p-1 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
						>
							<Settings className="size-4" />
						</button>
					</div>
				</div>
			</aside>
		</>
	);
}

function Section({
	title,
	action,
	children,
}: {
	title: string;
	action?: React.ReactNode;
	children: React.ReactNode;
}) {
	return (
		<div className="flex flex-col gap-0.5">
			<div className="flex items-center justify-between px-2 pb-1">
				<span className="text-xs font-medium text-sidebar-foreground/60">
					{title}
				</span>
				{action}
			</div>
			{children}
		</div>
	);
}

function SectionToggle({
	open,
	onClick,
	label,
}: {
	open: boolean;
	onClick: () => void;
	label: string;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			aria-label={open ? `Collapse ${label}` : `Expand ${label}`}
			className="flex h-5 w-5 items-center justify-end rounded text-sidebar-foreground/60 hover:text-sidebar-foreground"
		>
			<ChevronDown
				className={cn(
					"size-3.5 transition-transform",
					open ? "" : "-rotate-90"
				)}
			/>
		</button>
	);
}

function SidebarLink({
	href,
	icon: Icon,
	iconColor,
	iconFill,
	label,
	count,
	active,
}: {
	href: string;
	icon: LucideIcon;
	iconColor?: string;
	iconFill?: boolean;
	label: string;
	count?: number;
	active?: boolean;
}) {
	return (
		<Link
			href={href}
			className={cn(
				"flex h-8 items-center gap-2.5 rounded-md px-2 text-sm transition-colors",
				active
					? "bg-sidebar-accent text-sidebar-accent-foreground"
					: "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
			)}
		>
			<Icon
				className="size-4 shrink-0"
				style={iconColor ? { color: iconColor } : undefined}
				fill={iconFill ? "currentColor" : "none"}
			/>
			<span className="flex-1 truncate">{label}</span>
			{typeof count === "number" && (
				<span className="w-5 text-right text-xs text-sidebar-foreground/50">
					{count}
				</span>
			)}
		</Link>
	);
}

function UserAvatar({ name }: { name: string }) {
	const initial = name.charAt(0).toUpperCase();
	return (
		<div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#8b5cf6] text-sm font-medium text-white">
			{initial}
		</div>
	);
}
