import Link from "next/link";
import { ForgotPasswordForm } from "./forgot-password-form";

export default function ForgotPasswordPage() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
			<div className="w-full max-w-sm space-y-6">
				<div className="space-y-2 text-center">
					<h1 className="text-2xl font-semibold tracking-tight">Forgot your password?</h1>
					<p className="text-sm text-muted-foreground">
						Enter your email and we&apos;ll send you a link to reset it.
					</p>
				</div>
				<ForgotPasswordForm />
				<p className="text-center text-sm text-muted-foreground">
					Remembered it?{" "}
					<Link
						href="/login"
						className="font-medium text-foreground underline-offset-4 hover:underline"
					>
						Back to sign in
					</Link>
				</p>
			</div>
		</div>
	);
}
