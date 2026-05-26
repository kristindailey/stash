"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { LogOut, Settings } from "lucide-react";
import { DropdownMenu } from "radix-ui";
import { UserAvatar } from "@/components/shared/UserAvatar";

type SidebarUser = {
	name: string | null;
	email: string | null;
	image: string | null;
};

export function SidebarUser({ user }: { user: SidebarUser | null }) {
	const displayName = user?.name ?? user?.email ?? "Guest";

	return (
		<div className="flex items-center gap-3 rounded-md px-2 py-1.5">
			<DropdownMenu.Root>
				<DropdownMenu.Trigger asChild>
					<button
						type="button"
						aria-label="Account menu"
						className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
					>
						<UserAvatar
							name={user?.name}
							image={user?.image}
							email={user?.email}
						/>
					</button>
				</DropdownMenu.Trigger>
				<DropdownMenu.Portal>
					<DropdownMenu.Content
						side="top"
						align="start"
						sideOffset={8}
						className="z-50 min-w-44 rounded-md border bg-popover p-1 text-popover-foreground shadow-md outline-none"
					>
						{user && (
							<>
								<div className="px-2 py-1.5 text-xs text-muted-foreground">
									<p className="truncate font-medium text-foreground">
										{displayName}
									</p>
									{user.email && (
										<p className="truncate">{user.email}</p>
									)}
								</div>
								<DropdownMenu.Separator className="my-1 h-px bg-border" />
							</>
						)}
						<DropdownMenu.Item asChild>
							<button
								type="button"
								onClick={() => signOut({ callbackUrl: "/login" })}
								className="flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground"
							>
								<LogOut className="size-4" />
								Sign out
							</button>
						</DropdownMenu.Item>
					</DropdownMenu.Content>
				</DropdownMenu.Portal>
			</DropdownMenu.Root>

			<div className="min-w-0 flex-1">
				<p className="truncate text-sm font-medium">{displayName}</p>
				{user?.email && (
					<p className="truncate text-xs text-sidebar-foreground/60">
						{user.email}
					</p>
				)}
			</div>

			<Link
				href="/profile"
				aria-label="Profile"
				className="rounded p-1 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
			>
				<Settings className="size-4" />
			</Link>
		</div>
	);
}
