import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/auth", () => ({
	auth: vi.fn(),
	signOut: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
	prisma: {
		user: {
			findUnique: vi.fn(),
			update: vi.fn(),
			delete: vi.fn(),
		},
	},
}));

vi.mock("bcryptjs", () => ({
	default: {
		compare: vi.fn(),
		hash: vi.fn(),
	},
}));

import bcrypt from "bcryptjs";
import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { changePassword, deleteAccount } from "./profile";

const authMock = vi.mocked(auth);
const signOutMock = vi.mocked(signOut);
const findUniqueMock = vi.mocked(prisma.user.findUnique);
const updateMock = vi.mocked(prisma.user.update);
const deleteMock = vi.mocked(prisma.user.delete);
const compareMock = vi.mocked(bcrypt.compare);
const hashMock = vi.mocked(bcrypt.hash);

const validInput = {
	currentPassword: "oldpassword",
	newPassword: "newpassword",
	confirmPassword: "newpassword",
};

describe("changePassword action", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		authMock.mockResolvedValue({ user: { id: "user_1" } } as never);
		findUniqueMock.mockResolvedValue({ password: "hashed_old" } as never);
		updateMock.mockResolvedValue({} as never);
		compareMock.mockResolvedValue(true as never);
		hashMock.mockResolvedValue("hashed_new" as never);
	});

	it("rejects when not authenticated", async () => {
		authMock.mockResolvedValue(null as never);
		const result = await changePassword(validInput);
		expect(result).toEqual({ success: false, error: "Not authenticated" });
		expect(updateMock).not.toHaveBeenCalled();
	});

	it("rejects a new password shorter than 8 characters", async () => {
		const result = await changePassword({
			...validInput,
			newPassword: "short",
			confirmPassword: "short",
		});
		expect(result).toEqual({
			success: false,
			error: "Password must be at least 8 characters",
		});
		expect(updateMock).not.toHaveBeenCalled();
	});

	it("rejects a new password longer than 128 characters", async () => {
		const long = "a".repeat(129);
		const result = await changePassword({
			...validInput,
			newPassword: long,
			confirmPassword: long,
		});
		expect(result).toEqual({
			success: false,
			error: "Password must be 128 characters or fewer",
		});
		expect(updateMock).not.toHaveBeenCalled();
	});

	it("rejects when new password and confirmation differ", async () => {
		const result = await changePassword({
			...validInput,
			confirmPassword: "different",
		});
		expect(result).toEqual({
			success: false,
			error: "Passwords do not match",
		});
		expect(updateMock).not.toHaveBeenCalled();
	});

	it("rejects an empty current password", async () => {
		const result = await changePassword({ ...validInput, currentPassword: "" });
		expect(result).toEqual({
			success: false,
			error: "Current password is required",
		});
		expect(updateMock).not.toHaveBeenCalled();
	});

	it("rejects accounts without a password (OAuth-only)", async () => {
		findUniqueMock.mockResolvedValue({ password: null } as never);
		const result = await changePassword(validInput);
		expect(result).toEqual({
			success: false,
			error: "Password change is not available for this account",
		});
		expect(updateMock).not.toHaveBeenCalled();
	});

	it("rejects an incorrect current password", async () => {
		compareMock.mockResolvedValue(false as never);
		const result = await changePassword(validInput);
		expect(result).toEqual({
			success: false,
			error: "Current password is incorrect",
		});
		expect(updateMock).not.toHaveBeenCalled();
	});

	it("hashes and persists a valid new password scoped to the user", async () => {
		const result = await changePassword(validInput);
		expect(compareMock).toHaveBeenCalledWith("oldpassword", "hashed_old");
		expect(hashMock).toHaveBeenCalledWith("newpassword", 12);
		expect(updateMock).toHaveBeenCalledWith({
			where: { id: "user_1" },
			data: { password: "hashed_new" },
		});
		expect(result).toEqual({ success: true });
	});
});

describe("deleteAccount action", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		authMock.mockResolvedValue({
			user: { id: "user_1", email: "user@example.com" },
		} as never);
		deleteMock.mockResolvedValue({} as never);
		signOutMock.mockResolvedValue(undefined as never);
	});

	it("rejects when not authenticated", async () => {
		authMock.mockResolvedValue(null as never);
		const result = await deleteAccount({ confirmEmail: "user@example.com" });
		expect(result).toEqual({ success: false, error: "Not authenticated" });
		expect(deleteMock).not.toHaveBeenCalled();
	});

	it("rejects when the session has no email", async () => {
		authMock.mockResolvedValue({ user: { id: "user_1" } } as never);
		const result = await deleteAccount({ confirmEmail: "user@example.com" });
		expect(result).toEqual({ success: false, error: "Not authenticated" });
		expect(deleteMock).not.toHaveBeenCalled();
	});

	it("rejects when the confirmation email does not match", async () => {
		const result = await deleteAccount({ confirmEmail: "other@example.com" });
		expect(result).toEqual({
			success: false,
			error: "Email confirmation does not match",
		});
		expect(deleteMock).not.toHaveBeenCalled();
	});

	it("matches the confirmation email case-insensitively and trimmed", async () => {
		const result = await deleteAccount({
			confirmEmail: "  USER@example.com  ",
		});
		expect(deleteMock).toHaveBeenCalledWith({ where: { id: "user_1" } });
		expect(result).toEqual({ success: true });
	});

	it("deletes the user and signs out on a valid confirmation", async () => {
		const result = await deleteAccount({ confirmEmail: "user@example.com" });
		expect(deleteMock).toHaveBeenCalledWith({ where: { id: "user_1" } });
		expect(signOutMock).toHaveBeenCalledWith({ redirect: false });
		expect(result).toEqual({ success: true });
	});
});
