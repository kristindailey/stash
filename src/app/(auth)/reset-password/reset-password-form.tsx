"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ResetPasswordFormProps = {
	token: string;
};

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
	const router = useRouter();
	const [password, setPassword] = React.useState("");
	const [confirmPassword, setConfirmPassword] = React.useState("");
	const [error, setError] = React.useState<string | null>(null);
	const [pending, setPending] = React.useState(false);
	const [tokenInvalid, setTokenInvalid] = React.useState(false);

	async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError(null);

		if (password.length < 8) {
			setError("Password must be at least 8 characters");
			return;
		}
		if (password !== confirmPassword) {
			setError("Passwords do not match");
			return;
		}

		setPending(true);
		try {
			const response = await fetch("/api/auth/reset-password", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ token, password, confirmPassword }),
			});
			const data = (await response.json().catch(() => ({}))) as {
				error?: string;
				reason?: string;
				success?: boolean;
			};

			if (!response.ok || !data.success) {
				if (data.reason === "expired" || data.reason === "not_found") {
					setTokenInvalid(true);
				}
				setError(data.error ?? "Could not reset password. Please try again.");
				return;
			}

			router.push("/login?reset=1");
		} catch {
			setError("Something went wrong. Please try again.");
		} finally {
			setPending(false);
		}
	}

	if (tokenInvalid) {
		return (
			<div className="space-y-4 text-center">
				<div className="space-y-2 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-4">
					<p className="text-sm font-medium text-destructive">{error}</p>
				</div>
				<Button asChild size="lg" className="w-full">
					<Link href="/forgot-password">Request a new link</Link>
				</Button>
			</div>
		);
	}

	return (
		<form onSubmit={onSubmit} className="space-y-3">
			<div className="space-y-1.5">
				<label htmlFor="password" className="text-sm font-medium">
					New password
				</label>
				<Input
					id="password"
					type="password"
					autoComplete="new-password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					required
					disabled={pending}
				/>
			</div>
			<div className="space-y-1.5">
				<label htmlFor="confirmPassword" className="text-sm font-medium">
					Confirm password
				</label>
				<Input
					id="confirmPassword"
					type="password"
					autoComplete="new-password"
					value={confirmPassword}
					onChange={(e) => setConfirmPassword(e.target.value)}
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
				{pending ? "Saving…" : "Reset password"}
			</Button>
		</form>
	);
}
