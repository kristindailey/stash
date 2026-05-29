"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { changePassword } from "@/actions/profile";

export function ChangePasswordSection() {
	const [open, setOpen] = React.useState(false);
	const [currentPassword, setCurrentPassword] = React.useState("");
	const [newPassword, setNewPassword] = React.useState("");
	const [confirmPassword, setConfirmPassword] = React.useState("");
	const [error, setError] = React.useState<string | null>(null);
	const [success, setSuccess] = React.useState(false);
	const [pending, setPending] = React.useState(false);

	function reset() {
		setCurrentPassword("");
		setNewPassword("");
		setConfirmPassword("");
		setError(null);
	}

	async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError(null);
		setSuccess(false);

		if (newPassword.length < 8) {
			setError("Password must be at least 8 characters");
			return;
		}
		if (newPassword !== confirmPassword) {
			setError("Passwords do not match");
			return;
		}

		setPending(true);
		const result = await changePassword({
			currentPassword,
			newPassword,
			confirmPassword,
		});
		setPending(false);

		if (!result.success) {
			setError(result.error ?? "Could not change password");
			return;
		}

		setSuccess(true);
		reset();
		setOpen(false);
	}

	return (
		<div className="rounded-lg border bg-card p-4">
			<div className="flex items-center justify-between gap-4">
				<div className="min-w-0">
					<h3 className="text-sm font-medium">Password</h3>
					<p className="text-xs text-muted-foreground">
						Update your account password.
					</p>
				</div>
				{!open && (
					<Button
						type="button"
						variant="outline"
						onClick={() => {
							setOpen(true);
							setSuccess(false);
						}}
					>
						Change password
					</Button>
				)}
			</div>

			{success && (
				<p className="mt-3 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-500">
					Password updated.
				</p>
			)}

			{open && (
				<form onSubmit={onSubmit} className="mt-4 space-y-3">
					<div className="space-y-1.5">
						<label
							htmlFor="currentPassword"
							className="text-sm font-medium"
						>
							Current password
						</label>
						<Input
							id="currentPassword"
							type="password"
							autoComplete="current-password"
							value={currentPassword}
							onChange={(e) => setCurrentPassword(e.target.value)}
							required
							disabled={pending}
						/>
					</div>
					<div className="space-y-1.5">
						<label htmlFor="newPassword" className="text-sm font-medium">
							New password
						</label>
						<Input
							id="newPassword"
							type="password"
							autoComplete="new-password"
							value={newPassword}
							onChange={(e) => setNewPassword(e.target.value)}
							required
							minLength={8}
							disabled={pending}
						/>
					</div>
					<div className="space-y-1.5">
						<label
							htmlFor="confirmNewPassword"
							className="text-sm font-medium"
						>
							Confirm new password
						</label>
						<Input
							id="confirmNewPassword"
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

					<div className="flex items-center gap-2">
						<Button type="submit" disabled={pending}>
							{pending ? "Saving…" : "Save"}
						</Button>
						<Button
							type="button"
							variant="ghost"
							disabled={pending}
							onClick={() => {
								setOpen(false);
								reset();
							}}
						>
							Cancel
						</Button>
					</div>
				</form>
			)}
		</div>
	);
}
