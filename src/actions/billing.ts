"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

export type ActionResult<T> =
	| { success: true; data: T }
	| { success: false; error: string };

function getPriceId(plan: "monthly" | "yearly"): string | undefined {
	return plan === "monthly"
		? process.env.STRIPE_PRICE_ID_MONTHLY
		: process.env.STRIPE_PRICE_ID_YEARLY;
}

function getBaseUrl(): string | null {
	return process.env.AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? null;
}

export async function createCheckoutSession(
	plan: "monthly" | "yearly",
): Promise<ActionResult<{ url: string }>> {
	const session = await auth();
	if (!session?.user?.id || !session.user.email) {
		return { success: false, error: "Not authenticated" };
	}

	const price = getPriceId(plan);
	if (!price) return { success: false, error: "Plan not configured" };

	const baseUrl = getBaseUrl();
	if (!baseUrl) return { success: false, error: "App URL not configured" };

	const stripe = getStripe();

	const user = await prisma.user.findUnique({
		where: { id: session.user.id },
		select: { stripeCustomerId: true, isPro: true },
	});
	if (user?.isPro) return { success: false, error: "Already subscribed" };

	let customerId = user?.stripeCustomerId ?? undefined;
	if (!customerId) {
		const customer = await stripe.customers.create({
			email: session.user.email,
			metadata: { userId: session.user.id },
		});
		customerId = customer.id;
		await prisma.user.update({
			where: { id: session.user.id },
			data: { stripeCustomerId: customerId },
		});
	}

	const checkout = await stripe.checkout.sessions.create({
		mode: "subscription",
		customer: customerId,
		line_items: [{ price, quantity: 1 }],
		success_url: `${baseUrl}/settings?checkout=success`,
		cancel_url: `${baseUrl}/settings?checkout=cancelled`,
		client_reference_id: session.user.id,
		allow_promotion_codes: true,
	});

	if (!checkout.url) {
		return { success: false, error: "Could not start checkout" };
	}
	return { success: true, data: { url: checkout.url } };
}

export async function createBillingPortalSession(): Promise<
	ActionResult<{ url: string }>
> {
	const session = await auth();
	if (!session?.user?.id) {
		return { success: false, error: "Not authenticated" };
	}

	const baseUrl = getBaseUrl();
	if (!baseUrl) return { success: false, error: "App URL not configured" };

	const stripe = getStripe();

	const user = await prisma.user.findUnique({
		where: { id: session.user.id },
		select: { stripeCustomerId: true },
	});
	if (!user?.stripeCustomerId) {
		return { success: false, error: "No billing account found" };
	}

	const portal = await stripe.billingPortal.sessions.create({
		customer: user.stripeCustomerId,
		return_url: `${baseUrl}/settings`,
	});
	return { success: true, data: { url: portal.url } };
}
