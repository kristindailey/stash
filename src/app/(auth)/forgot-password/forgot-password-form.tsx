"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ForgotPasswordForm() {
	const [email, setEmail] = React.useState("");
	const [error, setError] = React.useState<string | null>(null);
	const [pending, setPending] = React.useState(false);
	const [submitted, setSubmitted] = React.useState(false);

	async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError(null);

		if (!EMAIL_REGEX.test(email)) {
			setError("Please enter a valid email address");
			return;
		}

		setPending(true);
		try {
			await fetch("/api/auth/forgot-password", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email }),
			});
			setSubmitted(true);
		} catch {
			setError("Something went wrong. Please try again.");
		} finally {
			setPending(false);
		}
	}

	if (submitted) {
		return (
			<div className="space-y-3 rounded-md border border-border bg-muted/30 px-4 py-4 text-center">
				<p className="text-sm font-medium">Check your email</p>
				<p className="text-sm text-muted-foreground">
					If an account exists for{" "}
					<span className="font-medium text-foreground">{email}</span>, a reset link is on its way. The link expires in 1 hour.
				</p>
			</div>
		);
	}

	return (
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

			{error && (
				<p
					role="alert"
					className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
				>
					{error}
				</p>
			)}

			<Button type="submit" size="lg" className="w-full" disabled={pending}>
				{pending ? "Sending…" : "Send reset link"}
			</Button>
		</form>
	);
}
