import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VerifiedPage() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
			<div className="w-full max-w-sm space-y-6 text-center">
				<div className="flex justify-center">
					<div className="rounded-full bg-emerald-500/10 p-3 text-emerald-500">
						<CheckCircle2 className="size-8" />
					</div>
				</div>
				<div className="space-y-2">
					<h1 className="text-2xl font-semibold tracking-tight">Email verified</h1>
					<p className="text-sm text-muted-foreground">
						Your email address has been verified. You can now sign in to your Stash account.
					</p>
				</div>
				<Button asChild size="lg" className="w-full">
					<Link href="/login">Sign in to your account</Link>
				</Button>
			</div>
		</div>
	);
}
