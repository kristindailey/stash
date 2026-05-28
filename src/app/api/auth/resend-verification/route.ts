import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isEmailVerificationEnabled, sendVerificationEmail } from "@/lib/email";
import { buildVerifyUrl, createVerificationToken } from "@/lib/verification-token";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";
import { getBaseUrl } from "@/lib/get-base-url";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
	if (!isEmailVerificationEnabled()) {
		return NextResponse.json({ ok: true });
	}

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

	const rl = await checkRateLimit(
		"resendVerification",
		`ip:${getClientIp(request)}:email:${normalizedEmail}`
	);
	if (!rl.success) return rateLimitResponse(rl);
	const user = await prisma.user.findUnique({
		where: { email: normalizedEmail },
		select: { email: true, name: true, emailVerified: true },
	});

	if (user && !user.emailVerified) {
		try {
			const token = await createVerificationToken(user.email);
			const verifyUrl = buildVerifyUrl(getBaseUrl(request), token);
			await sendVerificationEmail({ to: user.email, name: user.name, verifyUrl });
		} catch (err) {
			console.error("[resend-verification] failed to send email", err);
		}
	}

	return NextResponse.json({ ok: true });
}
