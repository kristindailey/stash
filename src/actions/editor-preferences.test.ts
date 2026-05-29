import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/auth", () => ({
	auth: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
	prisma: {
		user: {
			update: vi.fn(),
		},
	},
}));

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { updateEditorPreferences } from "./editor-preferences";

const authMock = vi.mocked(auth);
const updateMock = vi.mocked(prisma.user.update);

const validPrefs = {
	fontSize: 16,
	tabSize: 4,
	wordWrap: false,
	minimap: true,
	theme: "monokai",
};

describe("updateEditorPreferences action", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		authMock.mockResolvedValue({ user: { id: "user_1" } } as never);
		updateMock.mockResolvedValue({} as never);
	});

	it("rejects when not authenticated", async () => {
		authMock.mockResolvedValue(null as never);
		const result = await updateEditorPreferences(validPrefs);
		expect(result).toEqual({ success: false, error: "Not authenticated" });
		expect(updateMock).not.toHaveBeenCalled();
	});

	it("rejects an invalid font size", async () => {
		const result = await updateEditorPreferences({ ...validPrefs, fontSize: 99 });
		expect(result.success).toBe(false);
		if (!result.success) expect(result.error).toBe("Invalid font size");
		expect(updateMock).not.toHaveBeenCalled();
	});

	it("rejects an invalid tab size", async () => {
		const result = await updateEditorPreferences({ ...validPrefs, tabSize: 3 });
		expect(result.success).toBe(false);
		if (!result.success) expect(result.error).toBe("Invalid tab size");
		expect(updateMock).not.toHaveBeenCalled();
	});

	it("rejects an unknown theme", async () => {
		const result = await updateEditorPreferences({
			...validPrefs,
			theme: "solarized",
		});
		expect(result.success).toBe(false);
		expect(updateMock).not.toHaveBeenCalled();
	});

	it("rejects a non-boolean toggle", async () => {
		const result = await updateEditorPreferences({
			...validPrefs,
			wordWrap: "yes",
		});
		expect(result.success).toBe(false);
		expect(updateMock).not.toHaveBeenCalled();
	});

	it("persists valid preferences scoped to the user", async () => {
		const result = await updateEditorPreferences(validPrefs);
		expect(updateMock).toHaveBeenCalledWith({
			where: { id: "user_1" },
			data: { editorPreferences: validPrefs },
		});
		expect(result.success).toBe(true);
		if (result.success) expect(result.data).toEqual(validPrefs);
	});
});
