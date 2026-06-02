import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { formatRetryAfter } from "@/lib/format-retry-after";

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = url && token ? new Redis({ url, token }) : null;

type WindowUnit = "s" | "m" | "h" | "d";
const UNIT_SECONDS: Record<WindowUnit, number> = { s: 1, m: 60, h: 3600, d: 86400 };

function parseWindowSeconds(window: `${number} ${WindowUnit}`): number {
	const [value, unit] = window.split(" ") as [string, WindowUnit];
	return Number(value) * UNIT_SECONDS[unit];
}

type LimiterConfig = {
	limiter: Ratelimit | null;
	windowSeconds: number;
};

function buildLimiter(limit: number, window: `${number} ${WindowUnit}`, prefix: string): LimiterConfig {
	const windowSeconds = parseWindowSeconds(window);
	if (!redis) return { limiter: null, windowSeconds };
	return {
		limiter: new Ratelimit({
			redis,
			limiter: Ratelimit.slidingWindow(limit, window),
			analytics: false,
			prefix: `stash:rl:${prefix}`,
		}),
		windowSeconds,
	};
}

const limiters = {
	login: buildLimiter(5, "15 m", "login"),
	register: buildLimiter(3, "1 h", "register"),
	forgotPassword: buildLimiter(3, "1 h", "forgot-password"),
	resetPassword: buildLimiter(5, "15 m", "reset-password"),
	resendVerification: buildLimiter(3, "15 m", "resend-verification"),
	aiRequest: buildLimiter(20, "1 h", "ai-request"),
} as const;

export type RateLimitName = keyof typeof limiters;

export type RateLimitResult = {
	success: boolean;
	limit: number;
	remaining: number;
	reset: number;
	retryAfterSeconds: number;
	windowSeconds: number;
};

export function getClientIp(request: Request): string {
	const forwarded = request.headers.get("x-forwarded-for");
	if (forwarded) {
		const first = forwarded.split(",")[0]?.trim();
		if (first) return first;
	}
	const realIp = request.headers.get("x-real-ip");
	if (realIp) return realIp.trim();
	return "unknown";
}

export async function checkRateLimit(name: RateLimitName, key: string): Promise<RateLimitResult> {
	const { limiter, windowSeconds } = limiters[name];
	if (!limiter) {
		return { success: true, limit: 0, remaining: 0, reset: 0, retryAfterSeconds: 0, windowSeconds };
	}
	try {
		const result = await limiter.limit(key);
		const retryAfterSeconds = result.success
			? 0
			: Math.max(1, Math.ceil((result.reset - Date.now()) / 1000));
		return {
			success: result.success,
			limit: result.limit,
			remaining: result.remaining,
			reset: result.reset,
			retryAfterSeconds,
			windowSeconds,
		};
	} catch (err) {
		console.error(`[rate-limit] ${name} check failed, failing open`, err);
		return { success: true, limit: 0, remaining: 0, reset: 0, retryAfterSeconds: 0, windowSeconds };
	}
}

export async function checkAiRateLimit(userId: string): Promise<RateLimitResult> {
	return checkRateLimit("aiRequest", `user:${userId}`);
}

export function rateLimitResponse(result: RateLimitResult): Response {
	const message = `Too many attempts. Please try again in ${formatRetryAfter(result.windowSeconds)}.`;
	return new Response(JSON.stringify({ error: message }), {
		status: 429,
		headers: {
			"Content-Type": "application/json",
			"Retry-After": String(result.retryAfterSeconds),
		},
	});
}
