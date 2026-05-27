"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
	ChevronDown,
	FolderOpen,
	Star,
	type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ITEM_TYPE_ICONS } from "@/lib/constants/item-types";
import type { SidebarCollection } from "@/lib/db/collections";
import type { SidebarItemType } from "@/lib/db/items";
import { SidebarUser } from "./SidebarUser";
import { useSidebar } from "./sidebar-context";

const PRO_TYPE_NAMES = new Set(["file", "image"]);

type SidebarProps = {
	itemTypes: SidebarItemType[];
	totalItemCount: number;
	collections: SidebarCollection[];
	user: {
		name: string | null;
		email: string | null;
		image: string | null;
	} | null;
};

export function Sidebar({
	itemTypes,
	totalItemCount,
	collections,
	user,
}: SidebarProps) {
	const { open, setOpen } = useSidebar();
	const pathname = usePathname();
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
							active={pathname === "/items"}
						/>
						{itemTypes.map((type) => {
							const Icon = ITEM_TYPE_ICONS[type.name] ?? FolderOpen;
							return (
								<SidebarLink
									key={type.id}
									href={type.route}
									icon={Icon}
									iconColor={type.color}
									label={type.label}
									count={type.count}
									pro={PRO_TYPE_NAMES.has(type.name)}
									active={pathname === type.route}
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
									active={pathname === `/collections/${collection.id}`}
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
										active={pathname === `/collections/${collection.id}`}
									/>
								))}
								<Link
									href="/collections"
									className={cn(
										"flex h-8 items-center gap-2.5 rounded-md px-2 text-sm transition-colors",
										pathname === "/collections"
											? "bg-sidebar-accent text-sidebar-accent-foreground"
											: "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
									)}
								>
									<span className="flex-1 truncate">View all collections</span>
								</Link>
							</>
						)}
					</Section>
				</div>

				<div className="border-t p-3">
					<SidebarUser user={user} />
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
	pro,
}: {
	href: string;
	icon: LucideIcon;
	iconColor?: string;
	iconFill?: boolean;
	label: string;
	count?: number;
	active?: boolean;
	pro?: boolean;
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
			{pro && (
				<Badge
					variant="secondary"
					className="h-4 px-1.5 text-[10px] font-semibold tracking-wide text-sidebar-foreground/70"
				>
					PRO
				</Badge>
			)}
			{typeof count === "number" && (
				<span className="w-5 text-right text-xs text-sidebar-foreground/50">
					{count}
				</span>
			)}
		</Link>
	);
}

