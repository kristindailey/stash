import { redirect } from "next/navigation";
import { getProfile } from "@/lib/db/profile";
import { BillingSection } from "./billing-section";
import { ChangePasswordSection } from "./change-password-section";
import { DeleteAccountSection } from "./delete-account-section";
import { EditorPreferencesSection } from "./editor-preferences-section";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
	const profile = await getProfile();
	if (!profile) redirect("/login?callbackUrl=/settings");

	const { user } = profile;

	return (
		<div className="mx-auto flex max-w-3xl flex-col gap-8">
			<header>
				<h1 className="text-2xl font-semibold">Settings</h1>
				<p className="text-sm text-muted-foreground">
					Manage your account and security.
				</p>
			</header>

			<section>
				<h2 className="mb-3 text-lg font-semibold">Billing</h2>
				<BillingSection isPro={user.isPro} />
			</section>

			<EditorPreferencesSection />

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
