import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getUserUsage } from "@/lib/billing";
import {
	FREE_COLLECTION_LIMIT,
	FREE_ITEM_LIMIT,
} from "@/lib/constants/limits";
import { UpgradePlans } from "./upgrade-plans";

export const dynamic = "force-dynamic";

export default async function UpgradePage() {
	const session = await auth();
	if (!session?.user?.id) redirect("/login?callbackUrl=/upgrade");
	if (session.user.isPro) redirect("/settings");

	const { itemCount, collectionCount } = await getUserUsage(session.user.id);

	return (
		<div className="mx-auto flex max-w-3xl flex-col gap-8">
			<header className="text-center">
				<h1 className="text-2xl font-semibold">Upgrade to Stash Pro</h1>
				<p className="mt-2 text-sm text-muted-foreground">
					Unlock unlimited items, file uploads, AI features, and more.
				</p>
				<hr className="mx-auto my-3 max-w-xs border-border" />
				<p className="text-sm text-muted-foreground">
					You&apos;re currently using {itemCount}/{FREE_ITEM_LIMIT} items
					and {collectionCount}/{FREE_COLLECTION_LIMIT} collections.
				</p>
			</header>

			<UpgradePlans />
		</div>
	);
}
