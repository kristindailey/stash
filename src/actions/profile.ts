"use server";

import bcrypt from "bcryptjs";
import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";

export type ActionResult = {
	success: boolean;
	error?: string;
};

export async function changePassword(input: {
	currentPassword: string;
	newPassword: string;
	confirmPassword: string;
}): Promise<ActionResult> {
	const session = await auth();
	if (!session?.user?.id) {
		return { success: false, error: "Not authenticated" };
	}

	const { currentPassword, newPassword, confirmPassword } = input;

	if (typeof newPassword !== "string" || newPassword.length < 8) {
		return { success: false, error: "Password must be at least 8 characters" };
	}
	if (newPassword.length > 128) {
		return { success: false, error: "Password must be 128 characters or fewer" };
	}
	if (newPassword !== confirmPassword) {
		return { success: false, error: "Passwords do not match" };
	}
	if (typeof currentPassword !== "string" || currentPassword.length === 0) {
		return { success: false, error: "Current password is required" };
	}

	const user = await prisma.user.findUnique({
		where: { id: session.user.id },
		select: { password: true },
	});

	if (!user?.password) {
		return {
			success: false,
			error: "Password change is not available for this account",
		};
	}

	const valid = await bcrypt.compare(currentPassword, user.password);
	if (!valid) {
		return { success: false, error: "Current password is incorrect" };
	}

	const hashed = await bcrypt.hash(newPassword, 12);
	await prisma.user.update({
		where: { id: session.user.id },
		data: { password: hashed },
	});

	return { success: true };
}

export async function deleteAccount(input: {
	confirmEmail: string;
}): Promise<ActionResult> {
	const session = await auth();
	if (!session?.user?.id || !session.user.email) {
		return { success: false, error: "Not authenticated" };
	}

	const normalized = input.confirmEmail.trim().toLowerCase();
	if (normalized !== session.user.email.toLowerCase()) {
		return {
			success: false,
			error: "Email confirmation does not match",
		};
	}

	await prisma.user.delete({ where: { id: session.user.id } });
	await signOut({ redirect: false });
	return { success: true };
}
