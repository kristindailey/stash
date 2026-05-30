import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: Request) {
	if (!webhookSecret) {
		return NextResponse.json(
			{ error: "Webhook not configured" },
			{ status: 500 },
		);
	}

	const stripe = getStripe();
	const signature = request.headers.get("stripe-signature");
	if (!signature) {
		return NextResponse.json({ error: "Missing signature" }, { status: 400 });
	}

	const rawBody = await request.text();

	let event: Stripe.Event;
	try {
		event = await stripe.webhooks.constructEventAsync(
			rawBody,
			signature,
			webhookSecret,
		);
	} catch (err) {
		console.error("[stripe webhook] signature verification failed", err);
		return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
	}

	try {
		switch (event.type) {
			case "checkout.session.completed": {
				const cs = event.data.object as Stripe.Checkout.Session;
				if (cs.mode !== "subscription") break;
				const sub = await stripe.subscriptions.retrieve(
					cs.subscription as string,
				);
				await syncSubscription(
					cs.customer as string,
					sub,
					cs.client_reference_id,
				);
				break;
			}
			case "customer.subscription.created":
			case "customer.subscription.updated":
			case "customer.subscription.deleted": {
				const sub = event.data.object as Stripe.Subscription;
				await syncSubscription(sub.customer as string, sub, null);
				break;
			}
			default:
				break;
		}
	} catch (err) {
		console.error(`[stripe webhook] handler error for ${event.type}`, err);
		return NextResponse.json({ error: "Handler failed" }, { status: 500 });
	}

	return NextResponse.json({ received: true });
}

async function syncSubscription(
	customerId: string,
	sub: Stripe.Subscription,
	clientReferenceId: string | null,
) {
	const active = sub.status === "active" || sub.status === "trialing";

	let user = await prisma.user.findUnique({
		where: { stripeCustomerId: customerId },
		select: { id: true },
	});
	if (!user && clientReferenceId) {
		user = await prisma.user.findUnique({
			where: { id: clientReferenceId },
			select: { id: true },
		});
		if (user) {
			await prisma.user.update({
				where: { id: user.id },
				data: { stripeCustomerId: customerId },
			});
		}
	}
	if (!user) {
		console.warn("[stripe webhook] no user for customer", customerId);
		return;
	}

	await prisma.user.update({
		where: { id: user.id },
		data: {
			isPro: active,
			stripeSubscriptionId: active ? sub.id : null,
		},
	});
}
