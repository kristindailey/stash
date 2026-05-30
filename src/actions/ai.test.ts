import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/auth", () => ({
	auth: vi.fn(),
}));

vi.mock("@/lib/billing", () => ({
	requireProForAI: vi.fn(),
}));

vi.mock("@/lib/rate-limit", () => ({
	checkAiRateLimit: vi.fn(),
}));

vi.mock("@/lib/openai", () => ({
	AI_MODEL: "gpt-5-nano",
	openai: { responses: { create: vi.fn() } },
}));

import { auth } from "@/auth";
import { requireProForAI } from "@/lib/billing";
import { checkAiRateLimit } from "@/lib/rate-limit";
import { openai } from "@/lib/openai";
import { generateAutoTags } from "./ai";

const authMock = vi.mocked(auth);
const requireProMock = vi.mocked(requireProForAI);
const rateLimitMock = vi.mocked(checkAiRateLimit);
const createMock = vi.mocked(openai!.responses.create);

function signedIn() {
	authMock.mockResolvedValue({ user: { id: "user_1" } } as never);
}

function rateLimitOk() {
	rateLimitMock.mockResolvedValue({ success: true } as never);
}

function aiReturns(output: string) {
	createMock.mockResolvedValue({ output_text: output } as never);
}

beforeEach(() => {
	vi.clearAllMocks();
	signedIn();
	requireProMock.mockResolvedValue(null);
	rateLimitOk();
});

describe("generateAutoTags", () => {
	it("rejects when not authenticated", async () => {
		authMock.mockResolvedValue(null as never);
		const result = await generateAutoTags({ title: "x", content: "y" });
		expect(result).toEqual({ success: false, error: "Not authenticated" });
		expect(createMock).not.toHaveBeenCalled();
	});

	it("rejects free users with the Pro upgrade message", async () => {
		requireProMock.mockResolvedValue(
			"AI features are a Pro feature. Upgrade to Pro to use them.",
		);
		const result = await generateAutoTags({ title: "x", content: "y" });
		expect(result).toEqual({
			success: false,
			error: "AI features are a Pro feature. Upgrade to Pro to use them.",
		});
		expect(createMock).not.toHaveBeenCalled();
	});

	it("rejects when rate limited", async () => {
		rateLimitMock.mockResolvedValue({ success: false } as never);
		const result = await generateAutoTags({ title: "x", content: "y" });
		expect(result).toEqual({
			success: false,
			error: "Too many AI requests. Please try again shortly.",
		});
		expect(createMock).not.toHaveBeenCalled();
	});

	it("rejects when there is no title or content", async () => {
		const result = await generateAutoTags({ title: "  ", content: "" });
		expect(result).toEqual({
			success: false,
			error: "Add a title or content to suggest tags.",
		});
		expect(createMock).not.toHaveBeenCalled();
	});

	it("parses the {\"tags\": [...]} object shape", async () => {
		aiReturns('{"tags": ["React", "Hooks"]}');
		const result = await generateAutoTags({ title: "useAuth", content: "x" });
		expect(result).toEqual({ success: true, data: { tags: ["react", "hooks"] } });
	});

	it("parses a bare array shape and lowercases", async () => {
		aiReturns('["TypeScript", "Zod"]');
		const result = await generateAutoTags({ title: "schema", content: "x" });
		expect(result).toEqual({
			success: true,
			data: { tags: ["typescript", "zod"] },
		});
	});

	it("dedupes and caps at 5 tags", async () => {
		aiReturns('{"tags": ["a", "a", "b", "c", "d", "e", "f"]}');
		const result = await generateAutoTags({ title: "t", content: "x" });
		expect(result).toEqual({
			success: true,
			data: { tags: ["a", "b", "c", "d", "e"] },
		});
	});

	it("truncates the item source to 2000 chars before calling the API", async () => {
		aiReturns('{"tags": ["x"]}');
		await generateAutoTags({ title: "", content: "a".repeat(5000) });
		const callArg = createMock.mock.calls[0]![0] as { input: string };
		const prefix = "Suggest tags as JSON for this developer item:\n\n";
		expect(callArg.input.startsWith(prefix)).toBe(true);
		expect(callArg.input.slice(prefix.length).length).toBe(2000);
	});

	it("includes the word 'json' in the input (required by json_object format)", async () => {
		aiReturns('{"tags": ["x"]}');
		await generateAutoTags({ title: "t", content: "x" });
		const callArg = createMock.mock.calls[0]![0] as { input: string };
		expect(callArg.input.toLowerCase()).toContain("json");
	});

	it("returns an error when the model returns no usable tags", async () => {
		aiReturns('{"tags": []}');
		const result = await generateAutoTags({ title: "t", content: "x" });
		expect(result).toEqual({
			success: false,
			error: "Could not generate tags. Please try again.",
		});
	});

	it("returns an error when the model output is not valid JSON", async () => {
		aiReturns("not json");
		const result = await generateAutoTags({ title: "t", content: "x" });
		expect(result.success).toBe(false);
	});

	it("returns a generic error when the API call throws", async () => {
		createMock.mockRejectedValue(new Error("boom"));
		const result = await generateAutoTags({ title: "t", content: "x" });
		expect(result).toEqual({
			success: false,
			error: "Could not generate tags. Please try again.",
		});
	});
});
