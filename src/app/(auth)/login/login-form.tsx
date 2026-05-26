"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GithubIcon } from "@/components/shared/GithubIcon";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ERROR_MESSAGES: Record<string, string> = {
	CredentialsSignin: "Invalid email or password",
	OAuthAccountNotLinked:
		"This email is already linked to another sign-in method.",
};

type LoginFormProps = {
	callbackUrl?: string;
	initialError?: string;
	verificationEnabled?: boolean;
};

export function LoginForm({ callbackUrl, initialError, verificationEnabled = false }: LoginFormProps) {
	const router = useRouter();
	const [email, setEmail] = React.useState("");
	const [password, setPassword] = React.useState("");
	const [error, setError] = React.useState<string | null>(
		initialError ? ERROR_MESSAGES[initialError] ?? "Sign in failed" : null
	);
	const [pending, setPending] = React.useState(false);
	const [showResend, setShowResend] = React.useState(false);

	async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError(null);

		if (!EMAIL_REGEX.test(email)) {
			setError("Please enter a valid email address");
			return;
		}
		if (!password) {
			setError("Password is required");
			return;
		}

		setPending(true);
		const result = await signIn("credentials", {
			email,
			password,
			redirect: false,
		});
		setPending(false);

		if (!result || result.error) {
			setError(
				result?.error
					? ERROR_MESSAGES[result.error] ?? "Invalid email or password"
					: "Sign in failed"
			);
			setShowResend(true);
			return;
		}

		router.push(callbackUrl ?? "/dashboard");
		router.refresh();
	}

	return (
		<div className="space-y-4">
			<Button
				type="button"
				variant="outline"
				size="lg"
				className="w-full"
				disabled={pending}
				onClick={() =>
					signIn("github", { callbackUrl: callbackUrl ?? "/dashboard" })
				}
			>
				<GithubIcon />
				Sign in with GitHub
			</Button>

			<div className="relative">
				<div className="absolute inset-0 flex items-center">
					<span className="w-full border-t" />
				</div>
				<div className="relative flex justify-center text-xs uppercase">
					<span className="bg-background px-2 text-muted-foreground">
						Or continue with
					</span>
				</div>
			</div>

			<form onSubmit={onSubmit} className="space-y-3">
				<div className="space-y-1.5">
					<label htmlFor="email" className="text-sm font-medium">
						Email
					</label>
					<Input
						id="email"
						type="email"
						autoComplete="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
						disabled={pending}
					/>
				</div>
				<div className="space-y-1.5">
					<div className="flex items-center justify-between">
						<label htmlFor="password" className="text-sm font-medium">
							Password
						</label>
						<Link
							href="/forgot-password"
							className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
						>
							Forgot password?
						</Link>
					</div>
					<Input
						id="password"
						type="password"
						autoComplete="current-password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
						disabled={pending}
					/>
				</div>

				{error && (
					<p
						role="alert"
						className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
					>
						{error}
					</p>
				)}

				<Button type="submit" size="lg" className="w-full" disabled={pending}>
					{pending ? "Signing in…" : "Sign in"}
				</Button>

				{showResend && verificationEnabled && (
					<p className="text-center text-xs text-muted-foreground">
						Haven&apos;t verified your email?{" "}
						<Link
							href={`/verify-email${email ? `?email=${encodeURIComponent(email)}` : ""}`}
							className="font-medium text-foreground underline-offset-4 hover:underline"
						>
							Resend verification email
						</Link>
					</p>
				)}
			</form>
		</div>
	);
}
