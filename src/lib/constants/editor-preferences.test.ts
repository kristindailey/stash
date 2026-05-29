import { describe, expect, it } from "vitest";
import {
	DEFAULT_EDITOR_PREFERENCES,
	normalizeEditorPreferences,
} from "./editor-preferences";

describe("normalizeEditorPreferences", () => {
	it("returns defaults for non-object input", () => {
		expect(normalizeEditorPreferences(null)).toEqual(DEFAULT_EDITOR_PREFERENCES);
		expect(normalizeEditorPreferences(undefined)).toEqual(
			DEFAULT_EDITOR_PREFERENCES,
		);
		expect(normalizeEditorPreferences("nope")).toEqual(
			DEFAULT_EDITOR_PREFERENCES,
		);
		expect(normalizeEditorPreferences(42)).toEqual(DEFAULT_EDITOR_PREFERENCES);
	});

	it("returns a fresh copy, not the shared default object", () => {
		const result = normalizeEditorPreferences(null);
		expect(result).not.toBe(DEFAULT_EDITOR_PREFERENCES);
	});

	it("passes through a fully valid object", () => {
		const valid = {
			fontSize: 16,
			tabSize: 4,
			wordWrap: false,
			minimap: true,
			theme: "monokai",
		};
		expect(normalizeEditorPreferences(valid)).toEqual(valid);
	});

	it("falls back per-field for invalid values", () => {
		const result = normalizeEditorPreferences({
			fontSize: 99,
			tabSize: 3,
			wordWrap: "yes",
			minimap: 1,
			theme: "solarized",
		});
		expect(result).toEqual(DEFAULT_EDITOR_PREFERENCES);
	});

	it("keeps valid fields while replacing invalid ones", () => {
		const result = normalizeEditorPreferences({
			fontSize: 18,
			tabSize: 7,
			wordWrap: false,
			minimap: true,
			theme: "github-dark",
		});
		expect(result).toEqual({
			fontSize: 18,
			tabSize: DEFAULT_EDITOR_PREFERENCES.tabSize,
			wordWrap: false,
			minimap: true,
			theme: "github-dark",
		});
	});

	it("ignores extra keys", () => {
		const result = normalizeEditorPreferences({
			fontSize: 12,
			tabSize: 2,
			wordWrap: true,
			minimap: false,
			theme: "vs-dark",
			somethingElse: "drop me",
		});
		expect(result).toEqual(DEFAULT_EDITOR_PREFERENCES);
		expect(result).not.toHaveProperty("somethingElse");
	});
});
