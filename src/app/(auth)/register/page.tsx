import Link from "next/link";
import { RegisterForm } from "./register-form";

export default function RegisterPage() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
			<div className="w-full max-w-sm space-y-6">
				<div className="space-y-2 text-center">
					<h1 className="text-2xl font-semibold tracking-tight">
						Create your account
					</h1>
					<p className="text-sm text-muted-foreground">
						Start stashing your developer knowledge
					</p>
				</div>
				<RegisterForm />
				<p className="text-center text-sm text-muted-foreground">
					Already have an account?{" "}
					<Link
						href="/login"
						className="font-medium text-foreground underline-offset-4 hover:underline"
					>
						Sign in
					</Link>
				</p>
			</div>
		</div>
	);
}
