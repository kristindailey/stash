"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { AI_MODEL, openai } from "@/lib/openai";
import { requireProForAI } from "@/lib/billing";
import { checkAiRateLimit } from "@/lib/rate-limit";
import type { ActionResult } from "@/actions/items";

const MAX_CONTENT_CHARS = 2000;

const autoTagSchema = z.object({
	title: z
		.string()
		.transform((value) => value.trim())
		.optional()
		.default(""),
	content: z
		.string()
		.transform((value) => value.trim())
		.optional()
		.default(""),
});

export type GenerateAutoTagsInput = z.input<typeof autoTagSchema>;

const INSTRUCTIONS =
	"You are a developer tool assistant that suggests tags for saved developer items (snippets, prompts, commands, notes, links). " +
	'Return ONLY a JSON object of the form {"tags": ["tag1", "tag2"]} with 3-5 short, lowercase, single-word or hyphenated tags. ' +
	"Tags should describe the topic, language, framework, or purpose. Do not include explanations or any other text.";

function parseTagsFromOutput(raw: string): string[] {
	const trimmed = raw.trim();
	if (trimmed.length === 0) return [];

	let parsed: unknown;
	try {
		parsed = JSON.parse(trimmed);
	} catch {
		return [];
	}

	const list = Array.isArray(parsed)
		? parsed
		: typeof parsed === "object" && parsed !== null && "tags" in parsed
			? (parsed as { tags: unknown }).tags
			: null;

	if (!Array.isArray(list)) return [];

	const tags = list
		.filter((tag): tag is string => typeof tag === "string")
		.map((tag) => tag.trim().toLowerCase())
		.filter((tag) => tag.length > 0);

	return Array.from(new Set(tags)).slice(0, 5);
}

export async function generateAutoTags(
	input: GenerateAutoTagsInput,
): Promise<ActionResult<{ tags: string[] }>> {
	const session = await auth();
	if (!session?.user?.id) {
		return { success: false, error: "Not authenticated" };
	}

	const proError = await requireProForAI(session.user.id);
	if (proError) {
		return { success: false, error: proError };
	}

	const rateLimit = await checkAiRateLimit(session.user.id);
	if (!rateLimit.success) {
		return {
			success: false,
			error: "Too many AI requests. Please try again shortly.",
		};
	}

	const parsed = autoTagSchema.safeParse(input);
	if (!parsed.success) {
		const firstIssue = parsed.error.issues[0];
		return { success: false, error: firstIssue?.message ?? "Invalid input" };
	}

	const { title, content } = parsed.data;
	const source = [title && `Title: ${title}`, content && `Content: ${content}`]
		.filter(Boolean)
		.join("\n")
		.slice(0, MAX_CONTENT_CHARS);

	if (source.trim().length === 0) {
		return { success: false, error: "Add a title or content to suggest tags." };
	}

	if (!openai) {
		return { success: false, error: "AI is not configured." };
	}

	const prompt = `Suggest tags as JSON for this developer item:\n\n${source}`;

	try {
		const response = await openai.responses.create({
			model: AI_MODEL,
			instructions: INSTRUCTIONS,
			input: prompt,
			reasoning: { effort: "minimal" },
			text: { format: { type: "json_object" }, verbosity: "low" },
		});

		const tags = parseTagsFromOutput(response.output_text);
		if (tags.length === 0) {
			return { success: false, error: "Could not generate tags. Please try again." };
		}

		return { success: true, data: { tags } };
	} catch (err) {
		console.error("[ai] generateAutoTags failed", err);
		return { success: false, error: "Could not generate tags. Please try again." };
	}
}

const describeSchema = z.object({
	type: z
		.string()
		.transform((value) => value.trim())
		.optional()
		.default(""),
	title: z
		.string()
		.transform((value) => value.trim())
		.optional()
		.default(""),
	content: z
		.string()
		.transform((value) => value.trim())
		.optional()
		.default(""),
	url: z
		.string()
		.transform((value) => value.trim())
		.optional()
		.default(""),
});

export type GenerateDescriptionInput = z.input<typeof describeSchema>;

const DESCRIBE_INSTRUCTIONS =
	"You are a developer tool assistant that writes concise descriptions for saved developer items (snippets, prompts, commands, notes, links, files, images). " +
	'Return ONLY a JSON object of the form {"description": "..."} where the description is 1-2 plain sentences summarizing what the item is or does. ' +
	"Do not use markdown, code blocks, or surrounding quotes. Keep it short and useful.";

function parseDescriptionFromOutput(raw: string): string {
	const trimmed = raw.trim();
	if (trimmed.length === 0) return "";

	let parsed: unknown;
	try {
		parsed = JSON.parse(trimmed);
	} catch {
		return "";
	}

	if (typeof parsed === "object" && parsed !== null && "description" in parsed) {
		const value = (parsed as { description: unknown }).description;
		if (typeof value === "string") return value.trim();
	}

	return "";
}

export async function generateDescription(
	input: GenerateDescriptionInput,
): Promise<ActionResult<{ description: string }>> {
	const session = await auth();
	if (!session?.user?.id) {
		return { success: false, error: "Not authenticated" };
	}

	const proError = await requireProForAI(session.user.id);
	if (proError) {
		return { success: false, error: proError };
	}

	const rateLimit = await checkAiRateLimit(session.user.id);
	if (!rateLimit.success) {
		return {
			success: false,
			error: "Too many AI requests. Please try again shortly.",
		};
	}

	const parsed = describeSchema.safeParse(input);
	if (!parsed.success) {
		const firstIssue = parsed.error.issues[0];
		return { success: false, error: firstIssue?.message ?? "Invalid input" };
	}

	const { type, title, content, url } = parsed.data;
	const source = [
		type && `Type: ${type}`,
		title && `Title: ${title}`,
		url && `URL: ${url}`,
		content && `Content: ${content}`,
	]
		.filter(Boolean)
		.join("\n")
		.slice(0, MAX_CONTENT_CHARS);

	if (source.trim().length === 0) {
		return {
			success: false,
			error: "Add a title or content to generate a description.",
		};
	}

	if (!openai) {
		return { success: false, error: "AI is not configured." };
	}

	const prompt = `Write a concise description as JSON for this developer item:\n\n${source}`;

	try {
		const response = await openai.responses.create({
			model: AI_MODEL,
			instructions: DESCRIBE_INSTRUCTIONS,
			input: prompt,
			reasoning: { effort: "minimal" },
			text: { format: { type: "json_object" }, verbosity: "low" },
		});

		const description = parseDescriptionFromOutput(response.output_text);
		if (description.length === 0) {
			return {
				success: false,
				error: "Could not generate a description. Please try again.",
			};
		}

		return { success: true, data: { description } };
	} catch (err) {
		console.error("[ai] generateDescription failed", err);
		return {
			success: false,
			error: "Could not generate a description. Please try again.",
		};
	}
}

const explainSchema = z.object({
	type: z
		.string()
		.transform((value) => value.trim())
		.optional()
		.default(""),
	language: z
		.string()
		.transform((value) => value.trim())
		.optional()
		.default(""),
	content: z
		.string()
		.transform((value) => value.trim())
		.optional()
		.default(""),
});

export type ExplainCodeInput = z.input<typeof explainSchema>;

const EXPLAIN_INSTRUCTIONS =
	"You are a developer tool assistant that explains code snippets and terminal commands in plain English. " +
	"Write a concise explanation of about 200-300 words covering what the code does and the key concepts involved. " +
	"Use clear markdown with short paragraphs and bullet points where helpful. " +
	"Do not repeat the code verbatim or wrap the whole response in a code block.";

export async function explainCode(
	input: ExplainCodeInput,
): Promise<ActionResult<{ explanation: string }>> {
	const session = await auth();
	if (!session?.user?.id) {
		return { success: false, error: "Not authenticated" };
	}

	const proError = await requireProForAI(session.user.id);
	if (proError) {
		return { success: false, error: proError };
	}

	const rateLimit = await checkAiRateLimit(session.user.id);
	if (!rateLimit.success) {
		return {
			success: false,
			error: "Too many AI requests. Please try again shortly.",
		};
	}

	const parsed = explainSchema.safeParse(input);
	if (!parsed.success) {
		const firstIssue = parsed.error.issues[0];
		return { success: false, error: firstIssue?.message ?? "Invalid input" };
	}

	const { type, language, content } = parsed.data;
	if (content.length === 0) {
		return { success: false, error: "Add code to explain." };
	}

	const source = [
		type && `Type: ${type}`,
		language && `Language: ${language}`,
		`Code:\n${content}`,
	]
		.filter(Boolean)
		.join("\n")
		.slice(0, MAX_CONTENT_CHARS);

	if (!openai) {
		return { success: false, error: "AI is not configured." };
	}

	const prompt = `Explain the following code for a developer:\n\n${source}`;

	try {
		const response = await openai.responses.create({
			model: AI_MODEL,
			instructions: EXPLAIN_INSTRUCTIONS,
			input: prompt,
			reasoning: { effort: "minimal" },
			text: { verbosity: "medium" },
		});

		const explanation = response.output_text.trim();
		if (explanation.length === 0) {
			return {
				success: false,
				error: "Could not generate an explanation. Please try again.",
			};
		}

		return { success: true, data: { explanation } };
	} catch (err) {
		console.error("[ai] explainCode failed", err);
		return {
			success: false,
			error: "Could not generate an explanation. Please try again.",
		};
	}
}
