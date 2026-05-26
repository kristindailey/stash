import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ResendButton } from "./resend-button";

type VerifyEmailPageProps = {
	searchParams: Promise<{
		email?: string;
		error?: string;
	}>;
};

const ERROR_COPY: Record<string, { title: string; body: string }> = {
	expired: {
		title: "Link expired",
		body: "That verification link has expired. Request a new one below.",
	},
	invalid: {
		title: "Invalid link",
		body: "That verification link is invalid or has already been used.",
	},
	missing: {
		title: "Missing token",
		body: "The verification link was missing required information.",
	},
};

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
	const { email, error } = await searchParams;
	const errorCopy = error ? ERROR_COPY[error] : null;

	return (
		<div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
			<div className="w-full max-w-sm space-y-6 text-center">
				<div className="space-y-2">
					<h1 className="text-2xl font-semibold tracking-tight">
						{errorCopy ? errorCopy.title : "Check your email"}
					</h1>
					<p className="text-sm text-muted-foreground">
						{errorCopy ? (
							errorCopy.body
						) : (
							<>
								We sent a verification link to{" "}
								<span className="font-medium text-foreground">
									{email ?? "your email address"}
								</span>
								. Click the link in that email to verify your account.
							</>
						)}
					</p>
				</div>

				<div className="space-y-3">
					<ResendButton email={email} />
					<Button asChild variant="ghost" size="lg" className="w-full">
						<Link href="/login">Back to sign in</Link>
					</Button>
				</div>

				<p className="text-xs text-muted-foreground">
					Wrong email?{" "}
					<Link
						href="/register"
						className="font-medium text-foreground underline-offset-4 hover:underline"
					>
						Create a new account
					</Link>
				</p>
			</div>
		</div>
	);
}
