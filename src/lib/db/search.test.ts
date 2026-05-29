import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db/dashboard", () => ({
	getAllItems: vi.fn(),
}));
vi.mock("@/lib/db/collections", () => ({
	getAllCollections: vi.fn(),
}));

import { getAllItems } from "@/lib/db/dashboard";
import { getAllCollections } from "@/lib/db/collections";
import { getSearchData } from "./search";

const getAllItemsMock = vi.mocked(getAllItems);
const getAllCollectionsMock = vi.mocked(getAllCollections);

const updatedAt = new Date("2026-05-01T00:00:00Z");

function makeItem(overrides: Record<string, unknown> = {}) {
	return {
		id: "i1",
		title: "Item",
		description: null,
		type: "snippet",
		contentType: "TEXT",
		content: null,
		url: null,
		fileUrl: null,
		fileName: null,
		fileSize: null,
		language: null,
		tags: [],
		isFavorite: false,
		isPinned: false,
		updatedAt,
		...overrides,
	};
}

describe("getSearchData", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		getAllItemsMock.mockResolvedValue([] as never);
		getAllCollectionsMock.mockResolvedValue([] as never);
	});

	it("returns empty groups when there are no items or collections", async () => {
		const result = await getSearchData("user_1");

		expect(result).toEqual({ items: [], collections: [] });
		expect(getAllItemsMock).toHaveBeenCalledWith("user_1");
		expect(getAllCollectionsMock).toHaveBeenCalledWith("user_1");
	});

	it("maps items to the lean search shape", async () => {
		getAllItemsMock.mockResolvedValue([
			makeItem({ id: "i1", title: "useAuth", type: "snippet", content: "code" }),
		] as never);

		const { items } = await getSearchData("user_1");

		expect(items).toEqual([
			{ id: "i1", title: "useAuth", type: "snippet", preview: "code" },
		]);
	});

	it("maps collections to id, name, and itemCount", async () => {
		getAllCollectionsMock.mockResolvedValue([
			{ id: "c1", name: "React", itemCount: 3 },
		] as never);

		const { collections } = await getSearchData("user_1");

		expect(collections).toEqual([{ id: "c1", name: "React", itemCount: 3 }]);
	});

	it("builds the preview from content, then url, fileName, description", async () => {
		getAllItemsMock.mockResolvedValue([
			makeItem({ id: "a", content: "from-content", url: "u", description: "d" }),
			makeItem({ id: "b", url: "from-url", fileName: "f", description: "d" }),
			makeItem({ id: "c", fileName: "from-file", description: "d" }),
			makeItem({ id: "d", description: "from-description" }),
		] as never);

		const previews = (await getSearchData("user_1")).items.map((i) => i.preview);

		expect(previews).toEqual([
			"from-content",
			"from-url",
			"from-file",
			"from-description",
		]);
	});

	it("returns a null preview when no source fields are present", async () => {
		getAllItemsMock.mockResolvedValue([makeItem({ id: "i1" })] as never);

		const { items } = await getSearchData("user_1");

		expect(items[0].preview).toBeNull();
	});

	it("trims whitespace and truncates long previews to 100 chars with an ellipsis", async () => {
		const long = `  ${"x".repeat(150)}  `;
		getAllItemsMock.mockResolvedValue([
			makeItem({ id: "i1", content: long }),
		] as never);

		const { items } = await getSearchData("user_1");
		const preview = items[0].preview ?? "";

		expect(preview.endsWith("…")).toBe(true);
		expect(preview).toBe(`${"x".repeat(100)}…`);
	});
});
