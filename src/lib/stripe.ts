import Stripe from "stripe";

const secretKey = process.env.STRIPE_SECRET_KEY;

export const stripe = secretKey
	? new Stripe(secretKey, { apiVersion: "2026-05-27.dahlia" })
	: null;

export function isStripeEnabled() {
	return stripe !== null;
}

export function getStripe(): Stripe {
	if (!stripe) {
		throw new Error("STRIPE_SECRET_KEY is not set");
	}
	return stripe;
}
