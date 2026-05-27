import { describe, expect, it } from "vitest";
import { buildObjectKey } from "./r2";

describe("buildObjectKey", () => {
	it("includes the user id, a timestamp, and the file extension", () => {
		const key = buildObjectKey("user_abc", "photo.PNG");
		expect(key).toMatch(/^users\/user_abc\/\d+-[0-9a-f]{24}\.png$/);
	});

	it("omits the extension dot when the filename has none", () => {
		const key = buildObjectKey("user_abc", "README");
		expect(key).toMatch(/^users\/user_abc\/\d+-[0-9a-f]{24}$/);
	});

	it("produces a new key on each call", () => {
		const a = buildObjectKey("user_abc", "x.pdf");
		const b = buildObjectKey("user_abc", "x.pdf");
		expect(a).not.toBe(b);
	});
});
