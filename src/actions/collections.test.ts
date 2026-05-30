import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/auth", () => ({
	auth: vi.fn(),
}));

vi.mock("@/lib/db/collections", () => ({
	createCollection: vi.fn(),
	updateCollection: vi.fn(),
	toggleCollectionFavorite: vi.fn(),
	deleteCollection: vi.fn(),
}));

vi.mock("@/lib/billing", () => ({
	checkCollectionQuota: vi.fn(),
}));

import { auth } from "@/auth";
import { checkCollectionQuota } from "@/lib/billing";
import {
	createCollection as createCollectionQuery,
	deleteCollection as deleteCollectionQuery,
	toggleCollectionFavorite as toggleCollectionFavoriteQuery,
	updateCollection as updateCollectionQuery,
} from "@/lib/db/collections";
import {
	createCollection,
	deleteCollection,
	toggleCollectionFavorite,
	updateCollection,
} from "./collections";

const authMock = vi.mocked(auth);
const checkCollectionQuotaMock = vi.mocked(checkCollectionQuota);
const createCollectionQueryMock = vi.mocked(createCollectionQuery);
const updateCollectionQueryMock = vi.mocked(updateCollectionQuery);
const toggleCollectionFavoriteQueryMock = vi.mocked(
	toggleCollectionFavoriteQuery,
);
const deleteCollectionQueryMock = vi.mocked(deleteCollectionQuery);

const fakeCollection = {
	id: "col_1",
	name: "React Patterns",
	description: null,
};

describe("createCollection action", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		authMock.mockResolvedValue({ user: { id: "user_1" } } as never);
		checkCollectionQuotaMock.mockResolvedValue(null);
		createCollectionQueryMock.mockResolvedValue(fakeCollection);
	});

	it("returns the quota error when the collection limit is reached", async () => {
		checkCollectionQuotaMock.mockResolvedValue(
			"Free plan is limited to 3 collections.",
		);
		const result = await createCollection({ name: "React" });
		expect(result).toEqual({
			success: false,
			error: "Free plan is limited to 3 collections.",
		});
		expect(createCollectionQueryMock).not.toHaveBeenCalled();
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

describe("updateCollection action", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		authMock.mockResolvedValue({ user: { id: "user_1" } } as never);
		updateCollectionQueryMock.mockResolvedValue(fakeCollection);
	});

	it("rejects when not authenticated", async () => {
		authMock.mockResolvedValue(null as never);
		const result = await updateCollection("col_1", { name: "React" });
		expect(result).toEqual({ success: false, error: "Not authenticated" });
		expect(updateCollectionQueryMock).not.toHaveBeenCalled();
	});

	it("rejects an empty collection id", async () => {
		const result = await updateCollection("", { name: "React" });
		expect(result).toEqual({ success: false, error: "Invalid collection id" });
		expect(updateCollectionQueryMock).not.toHaveBeenCalled();
	});

	it("rejects an empty name", async () => {
		const result = await updateCollection("col_1", { name: "   " });
		expect(result.success).toBe(false);
		if (!result.success) expect(result.error).toBe("Name is required");
		expect(updateCollectionQueryMock).not.toHaveBeenCalled();
	});

	it("trims input and forwards it to the query", async () => {
		await updateCollection("col_1", {
			name: "  React Patterns  ",
			description: "  notes  ",
		});
		expect(updateCollectionQueryMock).toHaveBeenCalledWith("col_1", "user_1", {
			name: "React Patterns",
			description: "notes",
		});
	});

	it("returns not found when the query returns null", async () => {
		updateCollectionQueryMock.mockResolvedValue(null);
		const result = await updateCollection("col_1", { name: "React" });
		expect(result).toEqual({ success: false, error: "Collection not found" });
	});

	it("returns the updated collection on success", async () => {
		const result = await updateCollection("col_1", { name: "React" });
		expect(result.success).toBe(true);
		if (result.success) expect(result.data).toBe(fakeCollection);
	});
});

describe("toggleCollectionFavorite action", () => {
	const favorited = { ...fakeCollection, isFavorite: true };

	beforeEach(() => {
		vi.clearAllMocks();
		authMock.mockResolvedValue({ user: { id: "user_1" } } as never);
		toggleCollectionFavoriteQueryMock.mockResolvedValue(favorited);
	});

	it("rejects when not authenticated", async () => {
		authMock.mockResolvedValue(null as never);
		const result = await toggleCollectionFavorite("col_1");
		expect(result).toEqual({ success: false, error: "Not authenticated" });
		expect(toggleCollectionFavoriteQueryMock).not.toHaveBeenCalled();
	});

	it("rejects an empty collection id", async () => {
		const result = await toggleCollectionFavorite("");
		expect(result).toEqual({ success: false, error: "Invalid collection id" });
		expect(toggleCollectionFavoriteQueryMock).not.toHaveBeenCalled();
	});

	it("returns not found when the query returns null", async () => {
		toggleCollectionFavoriteQueryMock.mockResolvedValue(null);
		const result = await toggleCollectionFavorite("col_1");
		expect(result).toEqual({ success: false, error: "Collection not found" });
	});

	it("returns the toggled state on success", async () => {
		const result = await toggleCollectionFavorite("col_1");
		expect(toggleCollectionFavoriteQueryMock).toHaveBeenCalledWith(
			"col_1",
			"user_1",
		);
		expect(result.success).toBe(true);
		if (result.success) expect(result.data).toBe(favorited);
	});
});

describe("deleteCollection action", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		authMock.mockResolvedValue({ user: { id: "user_1" } } as never);
		deleteCollectionQueryMock.mockResolvedValue(true);
	});

	it("rejects when not authenticated", async () => {
		authMock.mockResolvedValue(null as never);
		const result = await deleteCollection("col_1");
		expect(result).toEqual({ success: false, error: "Not authenticated" });
		expect(deleteCollectionQueryMock).not.toHaveBeenCalled();
	});

	it("rejects an empty collection id", async () => {
		const result = await deleteCollection("");
		expect(result).toEqual({ success: false, error: "Invalid collection id" });
		expect(deleteCollectionQueryMock).not.toHaveBeenCalled();
	});

	it("returns not found when the query returns false", async () => {
		deleteCollectionQueryMock.mockResolvedValue(false);
		const result = await deleteCollection("col_1");
		expect(result).toEqual({ success: false, error: "Collection not found" });
	});

	it("returns the deleted id on success", async () => {
		const result = await deleteCollection("col_1");
		expect(deleteCollectionQueryMock).toHaveBeenCalledWith("col_1", "user_1");
		expect(result.success).toBe(true);
		if (result.success) expect(result.data).toEqual({ id: "col_1" });
	});
});
