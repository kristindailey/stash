import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ResetPasswordForm } from "./reset-password-form";

type ResetPasswordPageProps = {
	searchParams: Promise<{
		token?: string;
	}>;
};

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
	const { token } = await searchParams;

	if (!token) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
				<div className="w-full max-w-sm space-y-6 text-center">
					<div className="space-y-2">
						<h1 className="text-2xl font-semibold tracking-tight">Missing token</h1>
						<p className="text-sm text-muted-foreground">
							This reset link is missing required information. Request a new one to continue.
						</p>
					</div>
					<Button asChild size="lg" className="w-full">
						<Link href="/forgot-password">Request a new link</Link>
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
			<div className="w-full max-w-sm space-y-6">
				<div className="space-y-2 text-center">
					<h1 className="text-2xl font-semibold tracking-tight">Choose a new password</h1>
					<p className="text-sm text-muted-foreground">
						Enter a new password for your Stash account.
					</p>
				</div>
				<ResetPasswordForm token={token} />
			</div>
		</div>
	);
}
