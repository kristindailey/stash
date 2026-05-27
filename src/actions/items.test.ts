import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/auth", () => ({
	auth: vi.fn(),
}));

vi.mock("@/lib/db/get-user-id", () => ({
	getDemoUserId: vi.fn(),
}));

vi.mock("@/lib/db/items", () => ({
	updateItem: vi.fn(),
	deleteItem: vi.fn(),
}));

import { auth } from "@/auth";
import { getDemoUserId } from "@/lib/db/get-user-id";
import {
	deleteItem as deleteItemQuery,
	updateItem as updateItemQuery,
} from "@/lib/db/items";
import { deleteItem, updateItem } from "./items";

const authMock = vi.mocked(auth);
const getDemoUserIdMock = vi.mocked(getDemoUserId);
const updateItemQueryMock = vi.mocked(updateItemQuery);
const deleteItemQueryMock = vi.mocked(deleteItemQuery);

const fakeItem = {
	id: "item_1",
	title: "Updated",
	description: null,
	type: "snippet",
	contentType: "TEXT" as const,
	content: "code",
	url: null,
	fileName: null,
	fileSize: null,
	language: "ts",
	tags: ["react"],
	isFavorite: false,
	isPinned: false,
	updatedAt: new Date("2026-05-27T00:00:00Z"),
	createdAt: new Date("2026-05-26T00:00:00Z"),
	collections: [],
};

describe("updateItem action", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		authMock.mockResolvedValue({ user: { id: "user_1" } } as never);
		getDemoUserIdMock.mockResolvedValue("user_1");
		updateItemQueryMock.mockResolvedValue(fakeItem);
	});

	it("rejects when not authenticated", async () => {
		authMock.mockResolvedValue(null);
		const result = await updateItem("item_1", { title: "Hi" });
		expect(result).toEqual({ success: false, error: "Not authenticated" });
		expect(updateItemQueryMock).not.toHaveBeenCalled();
	});

	it("rejects an empty title", async () => {
		const result = await updateItem("item_1", { title: "   " });
		expect(result.success).toBe(false);
		if (!result.success) expect(result.error).toBe("Title is required");
		expect(updateItemQueryMock).not.toHaveBeenCalled();
	});

	it("rejects an invalid URL", async () => {
		const result = await updateItem("item_1", {
			title: "Link",
			url: "not-a-url",
		});
		expect(result.success).toBe(false);
		expect(updateItemQueryMock).not.toHaveBeenCalled();
	});

	it("treats an empty URL as null", async () => {
		await updateItem("item_1", { title: "Link", url: "" });
		expect(updateItemQueryMock).toHaveBeenCalledWith(
			"item_1",
			"user_1",
			expect.objectContaining({ url: null }),
		);
	});

	it("trims, deduplicates, and drops empty tags", async () => {
		await updateItem("item_1", {
			title: "Snippet",
			tags: ["  react ", "react", "", "  ", "next"],
		});
		expect(updateItemQueryMock).toHaveBeenCalledWith(
			"item_1",
			"user_1",
			expect.objectContaining({ tags: ["react", "next"] }),
		);
	});

	it("returns not-found when item does not belong to user", async () => {
		updateItemQueryMock.mockResolvedValue(null);
		const result = await updateItem("item_1", { title: "Hi" });
		expect(result).toEqual({ success: false, error: "Item not found" });
	});

	it("returns the updated item on success", async () => {
		const result = await updateItem("item_1", {
			title: "Updated",
			content: "code",
			language: "ts",
			tags: ["react"],
		});
		expect(result.success).toBe(true);
		if (result.success) expect(result.data).toBe(fakeItem);
	});
});

describe("deleteItem action", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		authMock.mockResolvedValue({ user: { id: "user_1" } } as never);
		getDemoUserIdMock.mockResolvedValue("user_1");
		deleteItemQueryMock.mockResolvedValue(true);
	});

	it("rejects when not authenticated", async () => {
		authMock.mockResolvedValue(null as never);
		const result = await deleteItem("item_1");
		expect(result).toEqual({ success: false, error: "Not authenticated" });
		expect(deleteItemQueryMock).not.toHaveBeenCalled();
	});

	it("rejects an empty item id", async () => {
		const result = await deleteItem("");
		expect(result).toEqual({ success: false, error: "Invalid item id" });
		expect(deleteItemQueryMock).not.toHaveBeenCalled();
	});

	it("returns not-found when item does not belong to user", async () => {
		deleteItemQueryMock.mockResolvedValue(false);
		const result = await deleteItem("item_1");
		expect(result).toEqual({ success: false, error: "Item not found" });
	});

	it("returns the deleted item id on success", async () => {
		const result = await deleteItem("item_1");
		expect(deleteItemQueryMock).toHaveBeenCalledWith("item_1", "user_1");
		expect(result).toEqual({ success: true, data: { id: "item_1" } });
	});
});
