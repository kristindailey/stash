"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type ResendButtonProps = {
	email?: string;
	label?: string;
};

export function ResendButton({ email, label = "Resend verification email" }: ResendButtonProps) {
	const [pending, setPending] = React.useState(false);

	async function onClick() {
		if (!email) {
			toast.error("Please return to sign in and enter your email.");
			return;
		}
		setPending(true);
		try {
			await fetch("/api/auth/resend-verification", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email }),
			});
			toast.success(
				"If an unverified account exists for that email, a new verification link is on its way.",
				{ id: "resend-verification", duration: 6000 }
			);
		} catch {
			toast.error("Couldn't send verification email. Please try again.");
		} finally {
			setPending(false);
		}
	}

	return (
		<Button
			type="button"
			variant="outline"
			size="lg"
			className="w-full"
			disabled={pending}
			onClick={onClick}
		>
			{pending ? "Sending…" : label}
		</Button>
	);
}
