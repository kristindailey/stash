import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";

const TOKEN_TTL_MS = 1000 * 60 * 60 * 24;

export async function createVerificationToken(email: string) {
	const identifier = email.trim().toLowerCase();
	await prisma.verificationToken.deleteMany({ where: { identifier } });
	const token = randomBytes(32).toString("hex");
	const expires = new Date(Date.now() + TOKEN_TTL_MS);
	await prisma.verificationToken.create({ data: { identifier, token, expires } });
	return token;
}

export type ConsumeResult =
	| { ok: true; identifier: string }
	| { ok: false; reason: "not_found" | "expired" };

export async function consumeVerificationToken(token: string): Promise<ConsumeResult> {
	const record = await prisma.verificationToken.findUnique({ where: { token } });
	if (!record) return { ok: false, reason: "not_found" };
	if (record.expires.getTime() < Date.now()) {
		await prisma.verificationToken.delete({ where: { token } }).catch(() => null);
		return { ok: false, reason: "expired" };
	}
	await prisma.verificationToken.delete({ where: { token } });
	return { ok: true, identifier: record.identifier };
}

export function buildVerifyUrl(baseUrl: string, token: string) {
	const url = new URL("/api/auth/verify-email", baseUrl);
	url.searchParams.set("token", token);
	return url.toString();
}
