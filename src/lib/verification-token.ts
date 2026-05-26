import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";

const TOKEN_TTL_MS = 1000 * 60 * 60 * 24;
const PASSWORD_RESET_TTL_MS = 1000 * 60 * 60;
const PASSWORD_RESET_PREFIX = "password-reset:";

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
	if (record.identifier.startsWith(PASSWORD_RESET_PREFIX)) {
		return { ok: false, reason: "not_found" };
	}
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

export async function createPasswordResetToken(email: string) {
	const identifier = `${PASSWORD_RESET_PREFIX}${email.trim().toLowerCase()}`;
	await prisma.verificationToken.deleteMany({ where: { identifier } });
	const token = randomBytes(32).toString("hex");
	const expires = new Date(Date.now() + PASSWORD_RESET_TTL_MS);
	await prisma.verificationToken.create({ data: { identifier, token, expires } });
	return token;
}

export type ConsumePasswordResetResult =
	| { ok: true; email: string }
	| { ok: false; reason: "not_found" | "expired" };

export async function consumePasswordResetToken(token: string): Promise<ConsumePasswordResetResult> {
	const record = await prisma.verificationToken.findUnique({ where: { token } });
	if (!record || !record.identifier.startsWith(PASSWORD_RESET_PREFIX)) {
		return { ok: false, reason: "not_found" };
	}
	if (record.expires.getTime() < Date.now()) {
		await prisma.verificationToken.delete({ where: { token } }).catch(() => null);
		return { ok: false, reason: "expired" };
	}
	await prisma.verificationToken.delete({ where: { token } });
	return { ok: true, email: record.identifier.slice(PASSWORD_RESET_PREFIX.length) };
}

export function buildResetPasswordUrl(baseUrl: string, token: string) {
	const url = new URL("/reset-password", baseUrl);
	url.searchParams.set("token", token);
	return url.toString();
}
