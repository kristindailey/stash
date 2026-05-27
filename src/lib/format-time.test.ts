import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { formatRelativeTime } from "./format-time";

describe("formatRelativeTime", () => {
	const NOW = new Date("2026-05-27T12:00:00.000Z");

	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(NOW);
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("returns 'just now' for under a minute", () => {
		expect(formatRelativeTime(new Date(NOW.getTime() - 30 * 1000))).toBe("just now");
	});

	it("returns minutes with correct pluralization", () => {
		expect(formatRelativeTime(new Date(NOW.getTime() - 60 * 1000))).toBe("1 minute ago");
		expect(formatRelativeTime(new Date(NOW.getTime() - 5 * 60 * 1000))).toBe("5 minutes ago");
	});

	it("returns hours with correct pluralization", () => {
		expect(formatRelativeTime(new Date(NOW.getTime() - 60 * 60 * 1000))).toBe("1 hour ago");
		expect(formatRelativeTime(new Date(NOW.getTime() - 3 * 60 * 60 * 1000))).toBe("3 hours ago");
	});

	it("returns days, months, and years", () => {
		expect(formatRelativeTime(new Date(NOW.getTime() - 24 * 60 * 60 * 1000))).toBe("1 day ago");
		expect(formatRelativeTime(new Date(NOW.getTime() - 45 * 24 * 60 * 60 * 1000))).toBe("1 month ago");
		expect(formatRelativeTime(new Date(NOW.getTime() - 400 * 24 * 60 * 60 * 1000))).toBe("1 year ago");
	});

	it("clamps future dates to 'just now'", () => {
		expect(formatRelativeTime(new Date(NOW.getTime() + 60 * 1000))).toBe("just now");
	});

	it("accepts an ISO string", () => {
		expect(formatRelativeTime(new Date(NOW.getTime() - 60 * 1000).toISOString())).toBe("1 minute ago");
	});
});
