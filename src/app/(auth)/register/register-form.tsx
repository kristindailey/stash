"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EMAIL_REGEX } from "@/lib/constants/auth";

export function RegisterForm() {
	const router = useRouter();
	const [name, setName] = React.useState("");
	const [email, setEmail] = React.useState("");
	const [password, setPassword] = React.useState("");
	const [confirmPassword, setConfirmPassword] = React.useState("");
	const [error, setError] = React.useState<string | null>(null);
	const [pending, setPending] = React.useState(false);

	async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError(null);

		if (name.trim().length < 1) {
			setError("Name is required");
			return;
		}
		if (!EMAIL_REGEX.test(email)) {
			setError("Please enter a valid email address");
			return;
		}
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
			const res = await fetch("/api/auth/register", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name, email, password, confirmPassword }),
			});
			const data = (await res.json().catch(() => null)) as
				| { error?: string; verificationRequired?: boolean }
				| null;

			if (!res.ok) {
				setError(data?.error ?? "Failed to create account");
				setPending(false);
				return;
			}

			if (data?.verificationRequired === false) {
				router.push("/login?registered=1");
				return;
			}

			router.push(`/verify-email?email=${encodeURIComponent(email.trim().toLowerCase())}`);
		} catch {
			setError("Network error. Please try again.");
			setPending(false);
		}
	}

	return (
		<form onSubmit={onSubmit} className="space-y-3">
			<div className="space-y-1.5">
				<label htmlFor="name" className="text-sm font-medium">
					Name
				</label>
				<Input
					id="name"
					type="text"
					autoComplete="name"
					value={name}
					onChange={(e) => setName(e.target.value)}
					required
					disabled={pending}
				/>
			</div>
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
				<label htmlFor="password" className="text-sm font-medium">
					Password
				</label>
				<Input
					id="password"
					type="password"
					autoComplete="new-password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					required
					minLength={8}
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
					minLength={8}
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
				{pending ? "Creating account…" : "Create account"}
			</Button>
		</form>
	);
}
