import { describe, expect, it } from "vitest";
import { getPageRange, parsePage } from "./pagination";

describe("parsePage", () => {
	it("returns the parsed page for a valid string", () => {
		expect(parsePage("3")).toBe(3);
	});

	it("uses the first value when given an array", () => {
		expect(parsePage(["2", "5"])).toBe(2);
	});

	it("defaults to 1 for undefined", () => {
		expect(parsePage(undefined)).toBe(1);
	});

	it("defaults to 1 for non-numeric, zero, negative, or fractional values", () => {
		expect(parsePage("abc")).toBe(1);
		expect(parsePage("0")).toBe(1);
		expect(parsePage("-4")).toBe(1);
		expect(parsePage("1.5")).toBe(1);
	});
});

describe("getPageRange", () => {
	it("returns a single page when total is 1 or less", () => {
		expect(getPageRange(1, 1)).toEqual([1]);
		expect(getPageRange(1, 0)).toEqual([1]);
	});

	it("lists every page without ellipsis when the range is small", () => {
		expect(getPageRange(2, 4)).toEqual([1, 2, 3, 4]);
	});

	it("inserts an ellipsis at the end when near the start", () => {
		expect(getPageRange(1, 10)).toEqual([1, 2, 3, 4, 5, "ellipsis", 10]);
	});

	it("inserts an ellipsis at the start when near the end", () => {
		expect(getPageRange(10, 10)).toEqual([
			1,
			"ellipsis",
			6,
			7,
			8,
			9,
			10,
		]);
	});

	it("inserts ellipses on both sides when in the middle", () => {
		expect(getPageRange(5, 10)).toEqual([1, "ellipsis", 4, 5, 6, "ellipsis", 10]);
	});

	it("always emits a constant slot count once past the threshold", () => {
		for (let page = 1; page <= 12; page++) {
			expect(getPageRange(page, 12)).toHaveLength(7);
		}
	});
});
