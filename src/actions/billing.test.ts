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

import Stripe from "stripe";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import {
	createBillingPortalSession,
	createCheckoutSession,
} from "./billing";

const authMock = vi.mocked(auth);
const userFindUniqueMock = vi.mocked(prisma.user.findUnique);
const userUpdateMock = vi.mocked(prisma.user.update);
const getStripeMock = vi.mocked(getStripe);

const customersCreate = vi.fn();
const customersRetrieve = vi.fn();
const checkoutCreate = vi.fn();
const portalCreate = vi.fn();

function resourceMissing() {
	return new Stripe.errors.StripeInvalidRequestError({
		type: "invalid_request_error",
		code: "resource_missing",
		message: "No such customer",
	});
}

function stubStripe() {
	getStripeMock.mockReturnValue({
		customers: { create: customersCreate, retrieve: customersRetrieve },
		checkout: { sessions: { create: checkoutCreate } },
		billingPortal: { sessions: { create: portalCreate } },
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
	customersRetrieve.mockResolvedValue({ id: "cus_existing", deleted: false });
	portalCreate.mockResolvedValue({ url: "https://portal.test/session" });
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

	it("recreates the customer when the stored id is missing in Stripe", async () => {
		signedIn();
		userFindUniqueMock.mockResolvedValue({
			stripeCustomerId: "cus_stale",
			isPro: false,
		} as never);
		customersRetrieve.mockRejectedValue(resourceMissing());

		const result = await createCheckoutSession("monthly");

		expect(customersCreate).toHaveBeenCalledWith({
			email: "u@example.com",
			metadata: { userId: "user_1" },
		});
		expect(userUpdateMock).toHaveBeenCalledWith({
			where: { id: "user_1" },
			data: { stripeCustomerId: "cus_new" },
		});
		expect(checkoutCreate).toHaveBeenCalledWith(
			expect.objectContaining({ customer: "cus_new" }),
		);
		expect(result.success).toBe(true);
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

describe("createBillingPortalSession", () => {
	it("rejects when the user has no stored customer", async () => {
		signedIn();
		userFindUniqueMock.mockResolvedValue({
			stripeCustomerId: null,
		} as never);

		const result = await createBillingPortalSession();

		expect(result).toEqual({
			success: false,
			error: "No billing account found",
		});
		expect(portalCreate).not.toHaveBeenCalled();
	});

	it("rejects when the stored customer is missing in Stripe", async () => {
		signedIn();
		userFindUniqueMock.mockResolvedValue({
			stripeCustomerId: "cus_stale",
		} as never);
		customersRetrieve.mockRejectedValue(resourceMissing());

		const result = await createBillingPortalSession();

		expect(result).toEqual({
			success: false,
			error: "No billing account found",
		});
		expect(portalCreate).not.toHaveBeenCalled();
	});

	it("opens the portal for a valid customer", async () => {
		signedIn();
		userFindUniqueMock.mockResolvedValue({
			stripeCustomerId: "cus_existing",
		} as never);

		const result = await createBillingPortalSession();

		expect(portalCreate).toHaveBeenCalledWith({
			customer: "cus_existing",
			return_url: "https://app.test/settings",
		});
		expect(result).toEqual({
			success: true,
			data: { url: "https://portal.test/session" },
		});
	});
});
