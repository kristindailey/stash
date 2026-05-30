import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/auth", () => ({
	auth: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
	prisma: {
		user: { findUnique: vi.fn(), update: vi.fn() },
	},
}));

vi.mock("@/lib/stripe", () => ({
	getStripe: vi.fn(),
}));

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { createCheckoutSession } from "./billing";

const authMock = vi.mocked(auth);
const userFindUniqueMock = vi.mocked(prisma.user.findUnique);
const userUpdateMock = vi.mocked(prisma.user.update);
const getStripeMock = vi.mocked(getStripe);

const customersCreate = vi.fn();
const checkoutCreate = vi.fn();

function stubStripe() {
	getStripeMock.mockReturnValue({
		customers: { create: customersCreate },
		checkout: { sessions: { create: checkoutCreate } },
	} as never);
}

function signedIn() {
	authMock.mockResolvedValue({
		user: { id: "user_1", email: "u@example.com", isPro: false },
	} as never);
}

beforeEach(() => {
	vi.clearAllMocks();
	process.env.AUTH_URL = "https://app.test";
	process.env.STRIPE_PRICE_ID_MONTHLY = "price_monthly";
	process.env.STRIPE_PRICE_ID_YEARLY = "price_yearly";
	stubStripe();
	checkoutCreate.mockResolvedValue({ url: "https://checkout.test/session" });
	customersCreate.mockResolvedValue({ id: "cus_new" });
});

afterEach(() => {
	delete process.env.AUTH_URL;
	delete process.env.STRIPE_PRICE_ID_MONTHLY;
	delete process.env.STRIPE_PRICE_ID_YEARLY;
});

describe("createCheckoutSession", () => {
	it("rejects when not authenticated", async () => {
		authMock.mockResolvedValue(null as never);
		const result = await createCheckoutSession("monthly");
		expect(result).toEqual({ success: false, error: "Not authenticated" });
		expect(getStripeMock).not.toHaveBeenCalled();
	});

	it("rejects when the user is already Pro", async () => {
		signedIn();
		userFindUniqueMock.mockResolvedValue({
			stripeCustomerId: "cus_1",
			isPro: true,
		} as never);

		const result = await createCheckoutSession("monthly");
		expect(result).toEqual({ success: false, error: "Already subscribed" });
		expect(checkoutCreate).not.toHaveBeenCalled();
	});

	it("rejects when the plan price is not configured", async () => {
		delete process.env.STRIPE_PRICE_ID_MONTHLY;
		signedIn();

		const result = await createCheckoutSession("monthly");
		expect(result).toEqual({ success: false, error: "Plan not configured" });
	});

	it("reuses an existing stripeCustomerId", async () => {
		signedIn();
		userFindUniqueMock.mockResolvedValue({
			stripeCustomerId: "cus_existing",
			isPro: false,
		} as never);

		const result = await createCheckoutSession("monthly");

		expect(customersCreate).not.toHaveBeenCalled();
		expect(userUpdateMock).not.toHaveBeenCalled();
		expect(checkoutCreate).toHaveBeenCalledWith(
			expect.objectContaining({
				customer: "cus_existing",
				client_reference_id: "user_1",
				line_items: [{ price: "price_monthly", quantity: 1 }],
				success_url: "https://app.test/settings?checkout=success",
			}),
		);
		expect(result).toEqual({
			success: true,
			data: { url: "https://checkout.test/session" },
		});
	});

	it("creates a customer when none exists and stores the id", async () => {
		signedIn();
		userFindUniqueMock.mockResolvedValue({
			stripeCustomerId: null,
			isPro: false,
		} as never);

		const result = await createCheckoutSession("yearly");

		expect(customersCreate).toHaveBeenCalledWith({
			email: "u@example.com",
			metadata: { userId: "user_1" },
		});
		expect(userUpdateMock).toHaveBeenCalledWith({
			where: { id: "user_1" },
			data: { stripeCustomerId: "cus_new" },
		});
		expect(checkoutCreate).toHaveBeenCalledWith(
			expect.objectContaining({
				customer: "cus_new",
				line_items: [{ price: "price_yearly", quantity: 1 }],
			}),
		);
		expect(result.success).toBe(true);
	});
});
