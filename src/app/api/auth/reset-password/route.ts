import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { consumePasswordResetToken } from "@/lib/verification-token";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

export async function POST(request: Request) {
	const rl = await checkRateLimit("resetPassword", `ip:${getClientIp(request)}`);
	if (!rl.success) return rateLimitResponse(rl);

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
	}

	if (!body || typeof body !== "object") {
		return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
	}

	const { token, password, confirmPassword } = body as Record<string, unknown>;

	if (typeof token !== "string" || token.length === 0) {
		return NextResponse.json({ error: "Reset token is required" }, { status: 400 });
	}
	if (typeof password !== "string" || password.length < 8) {
		return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
	}
	if (password !== confirmPassword) {
		return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
	}

	const result = await consumePasswordResetToken(token);
	if (!result.ok) {
		const error = result.reason === "expired"
			? "This reset link has expired. Please request a new one."
			: "This reset link is invalid or has already been used.";
		return NextResponse.json({ error, reason: result.reason }, { status: 400 });
	}

	const hashed = await bcrypt.hash(password, 12);
	try {
		await prisma.user.update({
			where: { email: result.email },
			data: { password: hashed },
		});
	} catch (err) {
		console.error("[reset-password] failed to update password", err);
		return NextResponse.json({ error: "Could not reset password. Please try again." }, { status: 500 });
	}

	return NextResponse.json({ success: true });
}
