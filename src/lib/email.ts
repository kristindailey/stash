import { Resend } from "resend";

const resendClient = new Resend(process.env.RESEND_API_KEY);

const EMAIL_FROM = process.env.EMAIL_FROM ?? "DevStash <onboarding@resend.dev>";

export function isEmailVerificationEnabled() {
	return process.env.EMAIL_VERIFICATION_ENABLED === "true";
}

export async function sendVerificationEmail(params: {
	to: string;
	name: string | null;
	verifyUrl: string;
}) {
	const { to, name, verifyUrl } = params;
	const greeting = name ? `Hi ${name},` : "Hi,";
	const html = `
		<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; color: #111;">
			<h1 style="font-size: 20px; margin: 0 0 16px;">Verify your DevStash email</h1>
			<p style="margin: 0 0 12px;">${greeting}</p>
			<p style="margin: 0 0 16px;">Click the button below to verify your email address. This link expires in 24 hours.</p>
			<p style="margin: 0 0 24px;">
				<a href="${verifyUrl}" style="display: inline-block; background: #111; color: #fff; padding: 10px 16px; border-radius: 6px; text-decoration: none; font-weight: 500;">Verify email</a>
			</p>
			<p style="margin: 0 0 8px; font-size: 13px; color: #555;">Or copy and paste this URL into your browser:</p>
			<p style="margin: 0; font-size: 13px; word-break: break-all; color: #555;">${verifyUrl}</p>
			<p style="margin: 24px 0 0; font-size: 12px; color: #888;">If you didn't create an account, you can safely ignore this email.</p>
		</div>
	`;
	const text = `${greeting}\n\nVerify your DevStash email by opening this link (expires in 24 hours):\n${verifyUrl}\n\nIf you didn't create an account, you can ignore this email.`;
	const { error } = await resendClient.emails.send({
		from: EMAIL_FROM,
		to,
		subject: "Verify your DevStash email",
		html,
		text,
	});
	if (error) {
		throw new Error(`Failed to send verification email: ${error.message}`);
	}
}

export async function sendAccountExistsEmail(params: {
	to: string;
	name: string | null;
	loginUrl: string;
	forgotUrl: string;
}) {
	const { to, name, loginUrl, forgotUrl } = params;
	const greeting = name ? `Hi ${name},` : "Hi,";
	const html = `
		<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; color: #111;">
			<h1 style="font-size: 20px; margin: 0 0 16px;">Someone tried to sign up with your email</h1>
			<p style="margin: 0 0 12px;">${greeting}</p>
			<p style="margin: 0 0 16px;">A DevStash account already exists for this email address. If this was you, sign in instead:</p>
			<p style="margin: 0 0 16px;">
				<a href="${loginUrl}" style="display: inline-block; background: #111; color: #fff; padding: 10px 16px; border-radius: 6px; text-decoration: none; font-weight: 500;">Sign in</a>
			</p>
			<p style="margin: 0 0 16px; font-size: 13px; color: #555;">Forgot your password? <a href="${forgotUrl}" style="color: #111;">Reset it here</a>.</p>
			<p style="margin: 24px 0 0; font-size: 12px; color: #888;">If this wasn't you, you can safely ignore this email — no changes have been made to your account.</p>
		</div>
	`;
	const text = `${greeting}\n\nA DevStash account already exists for this email. If this was you, sign in: ${loginUrl}\n\nForgot your password? Reset it: ${forgotUrl}\n\nIf this wasn't you, ignore this email — your account is unchanged.`;
	const { error } = await resendClient.emails.send({
		from: EMAIL_FROM,
		to,
		subject: "Someone tried to sign up with your DevStash email",
		html,
		text,
	});
	if (error) {
		throw new Error(`Failed to send account-exists email: ${error.message}`);
	}
}

export async function sendPasswordResetEmail(params: {
	to: string;
	name: string | null;
	resetUrl: string;
}) {
	const { to, name, resetUrl } = params;
	const greeting = name ? `Hi ${name},` : "Hi,";
	const html = `
		<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; color: #111;">
			<h1 style="font-size: 20px; margin: 0 0 16px;">Reset your DevStash password</h1>
			<p style="margin: 0 0 12px;">${greeting}</p>
			<p style="margin: 0 0 16px;">We received a request to reset your password. Click the button below to choose a new one. This link expires in 1 hour.</p>
			<p style="margin: 0 0 24px;">
				<a href="${resetUrl}" style="display: inline-block; background: #111; color: #fff; padding: 10px 16px; border-radius: 6px; text-decoration: none; font-weight: 500;">Reset password</a>
			</p>
			<p style="margin: 0 0 8px; font-size: 13px; color: #555;">Or copy and paste this URL into your browser:</p>
			<p style="margin: 0; font-size: 13px; word-break: break-all; color: #555;">${resetUrl}</p>
			<p style="margin: 24px 0 0; font-size: 12px; color: #888;">If you didn't request a password reset, you can safely ignore this email — your password won't change.</p>
		</div>
	`;
	const text = `${greeting}\n\nReset your DevStash password by opening this link (expires in 1 hour):\n${resetUrl}\n\nIf you didn't request a reset, you can ignore this email.`;
	const { error } = await resendClient.emails.send({
		from: EMAIL_FROM,
		to,
		subject: "Reset your DevStash password",
		html,
		text,
	});
	if (error) {
		throw new Error(`Failed to send password reset email: ${error.message}`);
	}
}
