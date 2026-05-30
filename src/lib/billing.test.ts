import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
	prisma: {
		user: { findUnique: vi.fn() },
		item: { count: vi.fn() },
		collection: { count: vi.fn() },
	},
}));

import { prisma } from "@/lib/prisma";
import {
	checkCollectionQuota,
	checkItemQuota,
	checkProType,
	getUserPlan,
} from "./billing";

const userFindUniqueMock = vi.mocked(prisma.user.findUnique);
const itemCountMock = vi.mocked(prisma.item.count);
const collectionCountMock = vi.mocked(prisma.collection.count);

function setPlan(isPro: boolean) {
	userFindUniqueMock.mockResolvedValue({ isPro } as never);
}

beforeEach(() => {
	vi.clearAllMocks();
	setPlan(false);
	itemCountMock.mockResolvedValue(0 as never);
	collectionCountMock.mockResolvedValue(0 as never);
});

describe("getUserPlan", () => {
	it("returns the user's isPro flag", async () => {
		setPlan(true);
		expect(await getUserPlan("user_1")).toEqual({ isPro: true });
	});

	it("returns { isPro: false } when the user is missing", async () => {
		userFindUniqueMock.mockResolvedValue(null as never);
		expect(await getUserPlan("user_1")).toEqual({ isPro: false });
	});
});

describe("checkItemQuota", () => {
	it("returns null for a Pro user at the limit", async () => {
		setPlan(true);
		itemCountMock.mockResolvedValue(100 as never);
		expect(await checkItemQuota("user_1")).toBeNull();
		expect(itemCountMock).not.toHaveBeenCalled();
	});

	it("returns null for a free user under the limit", async () => {
		itemCountMock.mockResolvedValue(49 as never);
		expect(await checkItemQuota("user_1")).toBeNull();
	});

	it("returns an error for a free user at the limit", async () => {
		itemCountMock.mockResolvedValue(50 as never);
		expect(await checkItemQuota("user_1")).toMatch(/50 items/);
	});

	it("returns an error for a free user over the limit", async () => {
		itemCountMock.mockResolvedValue(51 as never);
		expect(await checkItemQuota("user_1")).toMatch(/50 items/);
	});
});

describe("checkCollectionQuota", () => {
	it("returns null for a Pro user at the limit", async () => {
		setPlan(true);
		collectionCountMock.mockResolvedValue(10 as never);
		expect(await checkCollectionQuota("user_1")).toBeNull();
		expect(collectionCountMock).not.toHaveBeenCalled();
	});

	it("returns null for a free user under the limit", async () => {
		collectionCountMock.mockResolvedValue(2 as never);
		expect(await checkCollectionQuota("user_1")).toBeNull();
	});

	it("returns an error for a free user at the limit", async () => {
		collectionCountMock.mockResolvedValue(3 as never);
		expect(await checkCollectionQuota("user_1")).toMatch(/3 collections/);
	});
});

describe("checkProType", () => {
	it("returns null for a non-Pro-only type", async () => {
		expect(await checkProType("user_1", "snippet")).toBeNull();
		expect(userFindUniqueMock).not.toHaveBeenCalled();
	});

	it("returns null for a Pro user on a Pro-only type", async () => {
		setPlan(true);
		expect(await checkProType("user_1", "file")).toBeNull();
	});

	it("returns an error for a free user on file", async () => {
		expect(await checkProType("user_1", "file")).toMatch(/Pro feature/);
	});

	it("returns an error for a free user on image", async () => {
		expect(await checkProType("user_1", "image")).toMatch(/Pro feature/);
	});
});
