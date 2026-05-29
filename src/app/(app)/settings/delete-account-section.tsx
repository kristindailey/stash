"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { deleteAccount } from "@/actions/profile";

export function DeleteAccountSection({ email }: { email: string }) {
	const router = useRouter();
	const [open, setOpen] = React.useState(false);
	const [confirmEmail, setConfirmEmail] = React.useState("");
	const [error, setError] = React.useState<string | null>(null);
	const [pending, setPending] = React.useState(false);

	async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError(null);

		if (confirmEmail.trim().toLowerCase() !== email.toLowerCase()) {
			setError("Email confirmation does not match");
			return;
		}

		setPending(true);
		const result = await deleteAccount({ confirmEmail });

		if (!result.success) {
			setPending(false);
			setError(result.error ?? "Could not delete account");
			return;
		}

		router.push("/login");
		router.refresh();
	}

	return (
		<div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
			<div className="flex items-center justify-between gap-4">
				<div className="min-w-0">
					<h3 className="text-sm font-medium text-destructive">
						Delete account
					</h3>
					<p className="text-xs text-muted-foreground">
						Permanently delete your account and all data. This cannot be undone.
					</p>
				</div>
				{!open && (
					<Button
						type="button"
						variant="destructive"
						onClick={() => setOpen(true)}
					>
						Delete account
					</Button>
				)}
			</div>

			{open && (
				<form onSubmit={onSubmit} className="mt-4 space-y-3">
					<div className="space-y-1.5">
						<label htmlFor="confirmEmail" className="text-sm font-medium">
							Type{" "}
							<span className="font-mono text-foreground">{email}</span> to
							confirm
						</label>
						<Input
							id="confirmEmail"
							type="email"
							autoComplete="off"
							value={confirmEmail}
							onChange={(e) => setConfirmEmail(e.target.value)}
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

					<div className="flex items-center gap-2">
						<Button type="submit" variant="destructive" disabled={pending}>
							{pending ? "Deleting…" : "Permanently delete account"}
						</Button>
						<Button
							type="button"
							variant="ghost"
							disabled={pending}
							onClick={() => {
								setOpen(false);
								setConfirmEmail("");
								setError(null);
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
