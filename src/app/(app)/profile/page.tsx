import { redirect } from "next/navigation";
import { FolderOpen, Layers } from "lucide-react";
import { UserAvatar } from "@/components/shared/UserAvatar";
import {
	ITEM_TYPE_COLORS,
	ITEM_TYPE_ICONS,
	ITEM_TYPE_LABELS,
} from "@/lib/constants/item-types";
import { getProfile } from "@/lib/db/profile";
import { ChangePasswordSection } from "./change-password-section";
import { DeleteAccountSection } from "./delete-account-section";

export const dynamic = "force-dynamic";

const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
	year: "numeric",
	month: "long",
	day: "numeric",
});

export default async function ProfilePage() {
	const profile = await getProfile();
	if (!profile) redirect("/login?callbackUrl=/profile");

	const { user, stats } = profile;

	return (
		<div className="mx-auto flex max-w-3xl flex-col gap-8">
			<header className="flex items-center gap-4">
				<UserAvatar
					name={user.name}
					email={user.email}
					image={user.image}
					className="size-16 text-lg"
				/>
				<div className="min-w-0">
					<h1 className="truncate text-2xl font-semibold">
						{user.name ?? user.email}
					</h1>
					<p className="truncate text-sm text-muted-foreground">{user.email}</p>
					<p className="text-xs text-muted-foreground">
						Joined {DATE_FORMATTER.format(user.createdAt)}
					</p>
				</div>
			</header>

			<section>
				<h2 className="mb-3 text-lg font-semibold">Stats</h2>
				<div className="grid grid-cols-2 gap-4">
					<StatCard label="Total Items" value={stats.totalItems} icon="items" />
					<StatCard
						label="Collections"
						value={stats.totalCollections}
						icon="collections"
					/>
				</div>
				<div className="mt-4 rounded-lg border bg-card">
					<div className="border-b px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
						By Item Type
					</div>
					<ul className="divide-y">
						{stats.byType.map((row) => {
							const Icon = ITEM_TYPE_ICONS[row.name] ?? Layers;
							const color = ITEM_TYPE_COLORS[row.name] ?? "#6b7280";
							const label = ITEM_TYPE_LABELS[row.name] ?? row.name;
							return (
								<li
									key={row.name}
									className="flex items-center gap-3 px-4 py-2.5"
								>
									<Icon className="size-4 shrink-0" style={{ color }} />
									<span className="flex-1 text-sm">{label}</span>
									<span className="text-sm font-medium text-muted-foreground">
										{row.count}
									</span>
								</li>
							);
						})}
					</ul>
				</div>
			</section>

			<section>
				<h2 className="mb-3 text-lg font-semibold">Account</h2>
				<div className="flex flex-col gap-4">
					{user.hasPassword && <ChangePasswordSection />}
					<DeleteAccountSection email={user.email} />
				</div>
			</section>
		</div>
	);
}

function StatCard({
	label,
	value,
	icon,
}: {
	label: string;
	value: number;
	icon: "items" | "collections";
}) {
	const Icon = icon === "items" ? Layers : FolderOpen;
	return (
		<div className="rounded-lg border bg-card p-4">
			<div className="flex items-center justify-between">
				<span className="text-sm text-muted-foreground">{label}</span>
				<Icon className="size-4 text-muted-foreground" />
			</div>
			<p className="mt-2 text-2xl font-semibold">{value}</p>
		</div>
	);
}
