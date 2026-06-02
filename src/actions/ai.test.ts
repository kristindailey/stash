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
import {
	explainCode,
	generateAutoTags,
	generateDescription,
	optimizePrompt,
	summarizeNote,
} from "./ai";

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

describe("generateDescription", () => {
	it("rejects when not authenticated", async () => {
		authMock.mockResolvedValue(null as never);
		const result = await generateDescription({ title: "x", content: "y" });
		expect(result).toEqual({ success: false, error: "Not authenticated" });
		expect(createMock).not.toHaveBeenCalled();
	});

	it("rejects free users with the Pro upgrade message", async () => {
		requireProMock.mockResolvedValue(
			"AI features are a Pro feature. Upgrade to Pro to use them.",
		);
		const result = await generateDescription({ title: "x", content: "y" });
		expect(result).toEqual({
			success: false,
			error: "AI features are a Pro feature. Upgrade to Pro to use them.",
		});
		expect(createMock).not.toHaveBeenCalled();
	});

	it("rejects when rate limited", async () => {
		rateLimitMock.mockResolvedValue({ success: false } as never);
		const result = await generateDescription({ title: "x", content: "y" });
		expect(result).toEqual({
			success: false,
			error: "Too many AI requests. Please try again shortly.",
		});
		expect(createMock).not.toHaveBeenCalled();
	});

	it("rejects when there is no usable context", async () => {
		const result = await generateDescription({ title: "  ", content: "" });
		expect(result).toEqual({
			success: false,
			error: "Add a title or content to generate a description.",
		});
		expect(createMock).not.toHaveBeenCalled();
	});

	it("parses the {\"description\": \"...\"} object shape", async () => {
		aiReturns('{"description": "A React hook that reads the auth session."}');
		const result = await generateDescription({ title: "useAuth", content: "x" });
		expect(result).toEqual({
			success: true,
			data: { description: "A React hook that reads the auth session." },
		});
	});

	it("builds the source from whatever fields are available", async () => {
		aiReturns('{"description": "A link to the docs."}');
		await generateDescription({ type: "link", title: "Docs", url: "https://x.dev" });
		const callArg = createMock.mock.calls[0]![0] as { input: string };
		expect(callArg.input).toContain("Type: link");
		expect(callArg.input).toContain("Title: Docs");
		expect(callArg.input).toContain("URL: https://x.dev");
	});

	it("truncates the item source to 2000 chars before calling the API", async () => {
		aiReturns('{"description": "ok"}');
		await generateDescription({ title: "", content: "a".repeat(5000) });
		const callArg = createMock.mock.calls[0]![0] as { input: string };
		const prefix = "Write a concise description as JSON for this developer item:\n\n";
		expect(callArg.input.startsWith(prefix)).toBe(true);
		expect(callArg.input.slice(prefix.length).length).toBe(2000);
	});

	it("includes the word 'json' in the input (required by json_object format)", async () => {
		aiReturns('{"description": "ok"}');
		await generateDescription({ title: "t", content: "x" });
		const callArg = createMock.mock.calls[0]![0] as { input: string };
		expect(callArg.input.toLowerCase()).toContain("json");
	});

	it("returns an error when the model returns an empty description", async () => {
		aiReturns('{"description": ""}');
		const result = await generateDescription({ title: "t", content: "x" });
		expect(result).toEqual({
			success: false,
			error: "Could not generate a description. Please try again.",
		});
	});

	it("returns an error when the model output is not valid JSON", async () => {
		aiReturns("not json");
		const result = await generateDescription({ title: "t", content: "x" });
		expect(result.success).toBe(false);
	});

	it("returns a generic error when the API call throws", async () => {
		createMock.mockRejectedValue(new Error("boom"));
		const result = await generateDescription({ title: "t", content: "x" });
		expect(result).toEqual({
			success: false,
			error: "Could not generate a description. Please try again.",
		});
	});
});

describe("explainCode", () => {
	it("rejects when not authenticated", async () => {
		authMock.mockResolvedValue(null as never);
		const result = await explainCode({ content: "const x = 1;" });
		expect(result).toEqual({ success: false, error: "Not authenticated" });
		expect(createMock).not.toHaveBeenCalled();
	});

	it("rejects free users with the Pro upgrade message", async () => {
		requireProMock.mockResolvedValue(
			"AI features are a Pro feature. Upgrade to Pro to use them.",
		);
		const result = await explainCode({ content: "const x = 1;" });
		expect(result).toEqual({
			success: false,
			error: "AI features are a Pro feature. Upgrade to Pro to use them.",
		});
		expect(createMock).not.toHaveBeenCalled();
	});

	it("rejects when rate limited", async () => {
		rateLimitMock.mockResolvedValue({ success: false } as never);
		const result = await explainCode({ content: "const x = 1;" });
		expect(result).toEqual({
			success: false,
			error: "Too many AI requests. Please try again shortly.",
		});
		expect(createMock).not.toHaveBeenCalled();
	});

	it("rejects when there is no code", async () => {
		const result = await explainCode({ content: "   " });
		expect(result).toEqual({ success: false, error: "Add code to explain." });
		expect(createMock).not.toHaveBeenCalled();
	});

	it("returns the markdown explanation from the model", async () => {
		aiReturns("## What it does\n\nDeclares a constant.");
		const result = await explainCode({ content: "const x = 1;" });
		expect(result).toEqual({
			success: true,
			data: { explanation: "## What it does\n\nDeclares a constant." },
		});
	});

	it("builds the source from type, language, and code", async () => {
		aiReturns("explanation");
		await explainCode({
			type: "command",
			language: "shell",
			content: "git reset --hard",
		});
		const callArg = createMock.mock.calls[0]![0] as { input: string };
		expect(callArg.input).toContain("Type: command");
		expect(callArg.input).toContain("Language: shell");
		expect(callArg.input).toContain("Code:\ngit reset --hard");
	});

	it("truncates the source to 2000 chars before calling the API", async () => {
		aiReturns("explanation");
		await explainCode({ content: "a".repeat(5000) });
		const callArg = createMock.mock.calls[0]![0] as { input: string };
		const prefix = "Explain the following code for a developer:\n\n";
		expect(callArg.input.startsWith(prefix)).toBe(true);
		expect(callArg.input.slice(prefix.length).length).toBe(2000);
	});

	it("returns an error when the model returns an empty explanation", async () => {
		aiReturns("   ");
		const result = await explainCode({ content: "const x = 1;" });
		expect(result).toEqual({
			success: false,
			error: "Could not generate an explanation. Please try again.",
		});
	});

	it("returns a generic error when the API call throws", async () => {
		createMock.mockRejectedValue(new Error("boom"));
		const result = await explainCode({ content: "const x = 1;" });
		expect(result).toEqual({
			success: false,
			error: "Could not generate an explanation. Please try again.",
		});
	});
});

describe("optimizePrompt", () => {
	it("rejects when not authenticated", async () => {
		authMock.mockResolvedValue(null as never);
		const result = await optimizePrompt({ content: "Write a poem" });
		expect(result).toEqual({ success: false, error: "Not authenticated" });
		expect(createMock).not.toHaveBeenCalled();
	});

	it("rejects free users with the Pro upgrade message", async () => {
		requireProMock.mockResolvedValue(
			"AI features are a Pro feature. Upgrade to Pro to use them.",
		);
		const result = await optimizePrompt({ content: "Write a poem" });
		expect(result).toEqual({
			success: false,
			error: "AI features are a Pro feature. Upgrade to Pro to use them.",
		});
		expect(createMock).not.toHaveBeenCalled();
	});

	it("rejects when rate limited", async () => {
		rateLimitMock.mockResolvedValue({ success: false } as never);
		const result = await optimizePrompt({ content: "Write a poem" });
		expect(result).toEqual({
			success: false,
			error: "Too many AI requests. Please try again shortly.",
		});
		expect(createMock).not.toHaveBeenCalled();
	});

	it("rejects when there is no prompt content", async () => {
		const result = await optimizePrompt({ content: "   " });
		expect(result).toEqual({
			success: false,
			error: "Add prompt content to optimize.",
		});
		expect(createMock).not.toHaveBeenCalled();
	});

	it("returns the optimized prompt from the model", async () => {
		aiReturns("Write a vivid four-line poem about the sea.");
		const result = await optimizePrompt({ content: "Write a poem" });
		expect(result).toEqual({
			success: true,
			data: { optimized: "Write a vivid four-line poem about the sea." },
		});
	});

	it("builds the source from title and content", async () => {
		aiReturns("optimized");
		await optimizePrompt({ title: "Poem prompt", content: "Write a poem" });
		const callArg = createMock.mock.calls[0]![0] as { input: string };
		expect(callArg.input).toContain("Title: Poem prompt");
		expect(callArg.input).toContain("Prompt:\nWrite a poem");
	});

	it("truncates the source to 2000 chars before calling the API", async () => {
		aiReturns("optimized");
		await optimizePrompt({ content: "a".repeat(5000) });
		const callArg = createMock.mock.calls[0]![0] as { input: string };
		const prefix = "Refine the following AI prompt:\n\n";
		expect(callArg.input.startsWith(prefix)).toBe(true);
		expect(callArg.input.slice(prefix.length).length).toBe(2000);
	});

	it("returns an error when the model returns an empty result", async () => {
		aiReturns("   ");
		const result = await optimizePrompt({ content: "Write a poem" });
		expect(result).toEqual({
			success: false,
			error: "Could not optimize the prompt. Please try again.",
		});
	});

	it("returns a generic error when the API call throws", async () => {
		createMock.mockRejectedValue(new Error("boom"));
		const result = await optimizePrompt({ content: "Write a poem" });
		expect(result).toEqual({
			success: false,
			error: "Could not optimize the prompt. Please try again.",
		});
	});
});

describe("summarizeNote", () => {
	it("rejects when not authenticated", async () => {
		authMock.mockResolvedValue(null as never);
		const result = await summarizeNote({ content: "A long note" });
		expect(result).toEqual({ success: false, error: "Not authenticated" });
		expect(createMock).not.toHaveBeenCalled();
	});

	it("rejects free users with the Pro upgrade message", async () => {
		requireProMock.mockResolvedValue(
			"AI features are a Pro feature. Upgrade to Pro to use them.",
		);
		const result = await summarizeNote({ content: "A long note" });
		expect(result).toEqual({
			success: false,
			error: "AI features are a Pro feature. Upgrade to Pro to use them.",
		});
		expect(createMock).not.toHaveBeenCalled();
	});

	it("rejects when rate limited", async () => {
		rateLimitMock.mockResolvedValue({ success: false } as never);
		const result = await summarizeNote({ content: "A long note" });
		expect(result).toEqual({
			success: false,
			error: "Too many AI requests. Please try again shortly.",
		});
		expect(createMock).not.toHaveBeenCalled();
	});

	it("rejects when there is no note content", async () => {
		const result = await summarizeNote({ content: "   " });
		expect(result).toEqual({
			success: false,
			error: "Add note content to summarize.",
		});
		expect(createMock).not.toHaveBeenCalled();
	});

	it("returns the markdown summary from the model", async () => {
		aiReturns("- First point\n- Second point");
		const result = await summarizeNote({ content: "A long note" });
		expect(result).toEqual({
			success: true,
			data: { summary: "- First point\n- Second point" },
		});
	});

	it("builds the source from title and content", async () => {
		aiReturns("summary");
		await summarizeNote({ title: "Standup notes", content: "We shipped X" });
		const callArg = createMock.mock.calls[0]![0] as { input: string };
		expect(callArg.input).toContain("Title: Standup notes");
		expect(callArg.input).toContain("Note:\nWe shipped X");
	});

	it("truncates the source to 2000 chars before calling the API", async () => {
		aiReturns("summary");
		await summarizeNote({ content: "a".repeat(5000) });
		const callArg = createMock.mock.calls[0]![0] as { input: string };
		const prefix = "Summarize the following note:\n\n";
		expect(callArg.input.startsWith(prefix)).toBe(true);
		expect(callArg.input.slice(prefix.length).length).toBe(2000);
	});

	it("returns an error when the model returns an empty summary", async () => {
		aiReturns("   ");
		const result = await summarizeNote({ content: "A long note" });
		expect(result).toEqual({
			success: false,
			error: "Could not summarize the note. Please try again.",
		});
	});

	it("returns a generic error when the API call throws", async () => {
		createMock.mockRejectedValue(new Error("boom"));
		const result = await summarizeNote({ content: "A long note" });
		expect(result).toEqual({
			success: false,
			error: "Could not summarize the note. Please try again.",
		});
	});
});
