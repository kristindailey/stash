import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import { buildResetPasswordUrl, createPasswordResetToken } from "@/lib/verification-token";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getBaseUrl(request: Request) {
	if (process.env.AUTH_URL) return process.env.AUTH_URL;
	if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
	return new URL(request.url).origin;
}

export async function POST(request: Request) {
	const rl = await checkRateLimit("forgotPassword", `ip:${getClientIp(request)}`);
	if (!rl.success) return rateLimitResponse(rl);

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return NextResponse.json({ ok: true });
	}
	const { email } = (body ?? {}) as Record<string, unknown>;
	if (typeof email !== "string" || !EMAIL_REGEX.test(email)) {
		return NextResponse.json({ ok: true });
	}

	const normalizedEmail = email.trim().toLowerCase();
	const user = await prisma.user.findUnique({
		where: { email: normalizedEmail },
		select: { email: true, name: true, password: true },
	});

	if (user && user.password) {
		try {
			const token = await createPasswordResetToken(user.email);
			const resetUrl = buildResetPasswordUrl(getBaseUrl(request), token);
			await sendPasswordResetEmail({ to: user.email, name: user.name, resetUrl });
		} catch (err) {
			console.error("[forgot-password] failed to send email", err);
		}
	}

	return NextResponse.json({ ok: true });
}
