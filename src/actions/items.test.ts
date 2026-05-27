import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/auth", () => ({
	auth: vi.fn(),
}));

vi.mock("@/lib/db/get-user-id", () => ({
	getDemoUserId: vi.fn(),
}));

vi.mock("@/lib/db/items", () => ({
	createItem: vi.fn(),
	updateItem: vi.fn(),
	deleteItem: vi.fn(),
}));

import { auth } from "@/auth";
import { getDemoUserId } from "@/lib/db/get-user-id";
import {
	createItem as createItemQuery,
	deleteItem as deleteItemQuery,
	updateItem as updateItemQuery,
} from "@/lib/db/items";
import { createItem, deleteItem, updateItem } from "./items";

const authMock = vi.mocked(auth);
const getDemoUserIdMock = vi.mocked(getDemoUserId);
const createItemQueryMock = vi.mocked(createItemQuery);
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
	fileUrl: null,
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

describe("createItem action", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		authMock.mockResolvedValue({ user: { id: "user_1" } } as never);
		getDemoUserIdMock.mockResolvedValue("user_1");
		createItemQueryMock.mockResolvedValue(fakeItem);
	});

	it("rejects when not authenticated", async () => {
		authMock.mockResolvedValue(null as never);
		const result = await createItem({ type: "snippet", title: "Hi" });
		expect(result).toEqual({ success: false, error: "Not authenticated" });
		expect(createItemQueryMock).not.toHaveBeenCalled();
	});

	it("rejects an empty title", async () => {
		const result = await createItem({ type: "snippet", title: "   " });
		expect(result.success).toBe(false);
		if (!result.success) expect(result.error).toBe("Title is required");
		expect(createItemQueryMock).not.toHaveBeenCalled();
	});

	it("rejects an unknown type", async () => {
		const result = await createItem({
			// @ts-expect-error - testing invalid type rejection
			type: "bogus",
			title: "Hi",
		});
		expect(result.success).toBe(false);
		expect(createItemQueryMock).not.toHaveBeenCalled();
	});

	it("requires a URL when type is link", async () => {
		const result = await createItem({ type: "link", title: "Docs" });
		expect(result.success).toBe(false);
		if (!result.success) expect(result.error).toBe("URL is required for links");
		expect(createItemQueryMock).not.toHaveBeenCalled();
	});

	it("rejects an invalid URL", async () => {
		const result = await createItem({
			type: "link",
			title: "Docs",
			url: "not-a-url",
		});
		expect(result.success).toBe(false);
		expect(createItemQueryMock).not.toHaveBeenCalled();
	});

	it("strips content and language for link type", async () => {
		await createItem({
			type: "link",
			title: "Docs",
			url: "https://example.com",
			content: "ignored",
			language: "ignored",
		});
		expect(createItemQueryMock).toHaveBeenCalledWith(
			"user_1",
			expect.objectContaining({
				type: "link",
				url: "https://example.com",
				content: null,
				language: null,
			}),
		);
	});

	it("strips language for prompt and note types", async () => {
		await createItem({
			type: "prompt",
			title: "Prompt",
			content: "do the thing",
			language: "ignored",
		});
		expect(createItemQueryMock).toHaveBeenCalledWith(
			"user_1",
			expect.objectContaining({
				type: "prompt",
				content: "do the thing",
				language: null,
				url: null,
			}),
		);
	});

	it("keeps content and language for snippet", async () => {
		await createItem({
			type: "snippet",
			title: "useAuth",
			content: "export function useAuth() {}",
			language: "ts",
		});
		expect(createItemQueryMock).toHaveBeenCalledWith(
			"user_1",
			expect.objectContaining({
				type: "snippet",
				content: "export function useAuth() {}",
				language: "ts",
			}),
		);
	});

	it("trims, deduplicates, and drops empty tags", async () => {
		await createItem({
			type: "snippet",
			title: "Snippet",
			tags: ["  react ", "react", "", "  ", "next"],
		});
		expect(createItemQueryMock).toHaveBeenCalledWith(
			"user_1",
			expect.objectContaining({ tags: ["react", "next"] }),
		);
	});

	it("returns an error when the lib query fails", async () => {
		createItemQueryMock.mockResolvedValue(null);
		const result = await createItem({ type: "snippet", title: "Hi" });
		expect(result).toEqual({ success: false, error: "Could not create item" });
	});

	it("returns the created item on success", async () => {
		const result = await createItem({ type: "snippet", title: "Hi" });
		expect(result.success).toBe(true);
		if (result.success) expect(result.data).toBe(fakeItem);
	});

	it("requires a fileUrl for file type", async () => {
		const result = await createItem({ type: "file", title: "Doc" });
		expect(result.success).toBe(false);
		if (!result.success) expect(result.error).toBe("File upload is required");
		expect(createItemQueryMock).not.toHaveBeenCalled();
	});

	it("requires a fileUrl for image type", async () => {
		const result = await createItem({ type: "image", title: "Pic" });
		expect(result.success).toBe(false);
		if (!result.success) expect(result.error).toBe("File upload is required");
		expect(createItemQueryMock).not.toHaveBeenCalled();
	});

	it("passes upload fields through and strips content/url for file type", async () => {
		await createItem({
			type: "file",
			title: "Doc",
			content: "ignored",
			url: "https://example.com",
			fileUrl: "https://cdn.example.com/key.pdf",
			fileName: "notes.pdf",
			fileSize: 1234,
		});
		expect(createItemQueryMock).toHaveBeenCalledWith(
			"user_1",
			expect.objectContaining({
				type: "file",
				content: null,
				url: null,
				fileUrl: "https://cdn.example.com/key.pdf",
				fileName: "notes.pdf",
				fileSize: 1234,
			}),
		);
	});

	it("strips upload fields when type does not support files", async () => {
		await createItem({
			type: "snippet",
			title: "Snip",
			fileUrl: "https://cdn.example.com/key.pdf",
			fileName: "notes.pdf",
			fileSize: 1234,
		});
		expect(createItemQueryMock).toHaveBeenCalledWith(
			"user_1",
			expect.objectContaining({
				type: "snippet",
				fileUrl: null,
				fileName: null,
				fileSize: null,
			}),
		);
	});
});

describe("updateItem action", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		authMock.mockResolvedValue({ user: { id: "user_1" } } as never);
		getDemoUserIdMock.mockResolvedValue("user_1");
		updateItemQueryMock.mockResolvedValue(fakeItem);
	});

	it("rejects when not authenticated", async () => {
		authMock.mockResolvedValue(null as never);
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
