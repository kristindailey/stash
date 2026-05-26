import Link from "next/link";
import { isEmailVerificationEnabled } from "@/lib/email";
import { LoginForm } from "./login-form";

type LoginPageProps = {
	searchParams: Promise<{
		callbackUrl?: string;
		error?: string;
		reset?: string;
	}>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
	const { callbackUrl, error, reset } = await searchParams;
	return (
		<div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
			<div className="w-full max-w-sm space-y-6">
				<div className="space-y-2 text-center">
					<h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
					<p className="text-sm text-muted-foreground">
						Sign in to your DevStash account
					</p>
				</div>
				{reset === "1" && (
					<p className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-center text-sm text-emerald-500">
						Your password has been reset. Sign in with your new password.
					</p>
				)}
				<LoginForm
					callbackUrl={callbackUrl}
					initialError={error}
					verificationEnabled={isEmailVerificationEnabled()}
				/>
				<p className="text-center text-sm text-muted-foreground">
					Don&apos;t have an account?{" "}
					<Link
						href="/register"
						className="font-medium text-foreground underline-offset-4 hover:underline"
					>
						Sign up
					</Link>
				</p>
			</div>
		</div>
	);
}
