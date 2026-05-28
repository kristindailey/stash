import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
	prisma: {
		collection: { findMany: vi.fn() },
		itemCollection: { findMany: vi.fn() },
	},
}));

import { prisma } from "@/lib/prisma";
import { getAllCollections } from "./collections";

const collectionFindManyMock = vi.mocked(prisma.collection.findMany);
const itemCollectionFindManyMock = vi.mocked(prisma.itemCollection.findMany);

const updatedAt = new Date("2026-05-01T00:00:00Z");

describe("getAllCollections", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns an empty array and skips the link query when there are no collections", async () => {
		collectionFindManyMock.mockResolvedValue([] as never);

		const result = await getAllCollections("user_1");

		expect(result).toEqual([]);
		expect(itemCollectionFindManyMock).not.toHaveBeenCalled();
	});

	it("aggregates type counts, sorts by count then name, and picks the dominant type", async () => {
		collectionFindManyMock.mockResolvedValue([
			{
				id: "c1",
				name: "Mixed",
				description: "stuff",
				isFavorite: false,
				updatedAt,
				_count: { items: 4 },
			},
		] as never);
		itemCollectionFindManyMock.mockResolvedValue([
			{ collectionId: "c1", item: { itemType: { name: "snippet" } } },
			{ collectionId: "c1", item: { itemType: { name: "snippet" } } },
			{ collectionId: "c1", item: { itemType: { name: "link" } } },
			{ collectionId: "c1", item: { itemType: { name: "command" } } },
		] as never);

		const [collection] = await getAllCollections("user_1");

		expect(collection.itemCount).toBe(4);
		expect(collection.dominantType).toBe("snippet");
		expect(collection.typeCounts).toEqual([
			{ name: "snippet", count: 2 },
			{ name: "command", count: 1 },
			{ name: "link", count: 1 },
		]);
	});

	it("leaves type counts empty and dominant type null for a collection with no items", async () => {
		collectionFindManyMock.mockResolvedValue([
			{
				id: "c1",
				name: "Empty",
				description: null,
				isFavorite: true,
				updatedAt,
				_count: { items: 0 },
			},
		] as never);
		itemCollectionFindManyMock.mockResolvedValue([] as never);

		const [collection] = await getAllCollections("user_1");

		expect(collection.typeCounts).toEqual([]);
		expect(collection.dominantType).toBeNull();
		expect(collection.isFavorite).toBe(true);
	});
});
