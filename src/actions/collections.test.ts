import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/auth", () => ({
	auth: vi.fn(),
}));

vi.mock("@/lib/db/collections", () => ({
	createCollection: vi.fn(),
}));

import { auth } from "@/auth";
import { createCollection as createCollectionQuery } from "@/lib/db/collections";
import { createCollection } from "./collections";

const authMock = vi.mocked(auth);
const createCollectionQueryMock = vi.mocked(createCollectionQuery);

const fakeCollection = {
	id: "col_1",
	name: "React Patterns",
	description: null,
};

describe("createCollection action", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		authMock.mockResolvedValue({ user: { id: "user_1" } } as never);
		createCollectionQueryMock.mockResolvedValue(fakeCollection);
	});

	it("rejects when not authenticated", async () => {
		authMock.mockResolvedValue(null as never);
		const result = await createCollection({ name: "React" });
		expect(result).toEqual({ success: false, error: "Not authenticated" });
		expect(createCollectionQueryMock).not.toHaveBeenCalled();
	});

	it("rejects an empty name", async () => {
		const result = await createCollection({ name: "   " });
		expect(result.success).toBe(false);
		if (!result.success) expect(result.error).toBe("Name is required");
		expect(createCollectionQueryMock).not.toHaveBeenCalled();
	});

	it("trims the name and treats an empty description as null", async () => {
		await createCollection({ name: "  React Patterns  ", description: "   " });
		expect(createCollectionQueryMock).toHaveBeenCalledWith("user_1", {
			name: "React Patterns",
			description: null,
		});
	});

	it("trims and passes through a description", async () => {
		await createCollection({ name: "React", description: "  My notes  " });
		expect(createCollectionQueryMock).toHaveBeenCalledWith("user_1", {
			name: "React",
			description: "My notes",
		});
	});

	it("defaults description to null when omitted", async () => {
		await createCollection({ name: "React" });
		expect(createCollectionQueryMock).toHaveBeenCalledWith("user_1", {
			name: "React",
			description: null,
		});
	});

	it("returns the created collection on success", async () => {
		const result = await createCollection({ name: "React Patterns" });
		expect(result.success).toBe(true);
		if (result.success) expect(result.data).toBe(fakeCollection);
	});
});
