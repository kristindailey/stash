import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { consumeVerificationToken } from "@/lib/verification-token";

export async function GET(request: Request) {
	const url = new URL(request.url);
	const token = url.searchParams.get("token");

	if (!token) {
		return NextResponse.redirect(new URL("/verify-email?error=missing", url.origin));
	}

	const result = await consumeVerificationToken(token);
	if (!result.ok) {
		const code = result.reason === "expired" ? "expired" : "invalid";
		return NextResponse.redirect(new URL(`/verify-email?error=${code}`, url.origin));
	}

	await prisma.user.update({
		where: { email: result.identifier },
		data: { emailVerified: new Date() },
	}).catch((err) => {
		console.error("[verify-email] failed to mark verified", err);
	});

	return NextResponse.redirect(new URL("/verify-email/verified", url.origin));
}
