import Link from "next/link";
import { LoginForm } from "./login-form";

type LoginPageProps = {
	searchParams: Promise<{
		callbackUrl?: string;
		error?: string;
		registered?: string;
	}>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
	const { callbackUrl, error, registered } = await searchParams;
	return (
		<div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
			<div className="w-full max-w-sm space-y-6">
				<div className="space-y-2 text-center">
					<h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
					<p className="text-sm text-muted-foreground">
						Sign in to your DevStash account
					</p>
				</div>
				<LoginForm
					callbackUrl={callbackUrl}
					initialError={error}
					justRegistered={registered === "1"}
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
