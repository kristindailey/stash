import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaNeon } from "@prisma/adapter-neon";
import { ContentType, PrismaClient } from "../src/generated/prisma/client.ts";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
	throw new Error("DATABASE_URL is not set");
}

const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

const DEMO_EMAIL = "demo@devstash.io";

const systemItemTypes = [
	{ name: "snippet", icon: "Code", color: "#6CB4B8" },
	{ name: "prompt", icon: "Sparkles", color: "#A3B18A" },
	{ name: "command", icon: "Terminal", color: "#fc7a57" },
	{ name: "note", icon: "StickyNote", color: "#fcd757" },
	{ name: "file", icon: "File", color: "#6A4C93" },
	{ name: "image", icon: "Image", color: "#9A958A" },
	{ name: "link", icon: "Link", color: "#df9a57" },
];

async function seedSystemItemTypes() {
	const result: Record<string, string> = {};
	for (const type of systemItemTypes) {
		const existing = await prisma.itemType.findFirst({
			where: { name: type.name, userId: null, isSystem: true },
		});
		const record = existing
			? await prisma.itemType.update({
					where: { id: existing.id },
					data: { ...type, isSystem: true },
				})
			: await prisma.itemType.create({
					data: { ...type, isSystem: true },
				});
		result[type.name] = record.id;
	}
	return result;
}

async function seedDemoUser() {
	const password = await bcrypt.hash("12345678", 12);
	return prisma.user.upsert({
		where: { email: DEMO_EMAIL },
		update: {
			name: "Demo User",
			password,
			isPro: false,
			emailVerified: new Date(),
		},
		create: {
			email: DEMO_EMAIL,
			name: "Demo User",
			password,
			isPro: false,
			emailVerified: new Date(),
		},
	});
}

async function clearDemoContent(userId: string) {
	await prisma.itemCollection.deleteMany({
		where: { item: { userId } },
	});
	await prisma.item.deleteMany({ where: { userId } });
	await prisma.collection.deleteMany({ where: { userId } });
}

type SeedItem = {
	title: string;
	contentType: ContentType;
	content?: string;
	url?: string;
	description?: string;
	language?: string;
	itemType: string;
	isPinned?: boolean;
	isFavorite?: boolean;
};

type SeedCollection = {
	name: string;
	description: string;
	defaultType?: string;
	isFavorite?: boolean;
	items: SeedItem[];
};

const collections: SeedCollection[] = [
	{
		name: "React Patterns",
		description: "Reusable React patterns and hooks",
		defaultType: "snippet",
		isFavorite: true,
		items: [
			{
				title: "useDebounce hook",
				contentType: "TEXT",
				language: "typescript",
				itemType: "snippet",
				description: "Debounces a rapidly changing value.",
				isPinned: true,
				isFavorite: true,
				content: `import { useEffect, useState } from "react";

export function useDebounce<T>(value: T, delay = 300): T {
	const [debounced, setDebounced] = useState(value);

	useEffect(() => {
		const id = setTimeout(() => setDebounced(value), delay);
		return () => clearTimeout(id);
	}, [value, delay]);

	return debounced;
}`,
			},
			{
				title: "useLocalStorage hook",
				contentType: "TEXT",
				language: "typescript",
				itemType: "snippet",
				description: "State synced with window.localStorage.",
				content: `import { useEffect, useState } from "react";

export function useLocalStorage<T>(key: string, initial: T) {
	const [value, setValue] = useState<T>(() => {
		if (typeof window === "undefined") return initial;
		const raw = window.localStorage.getItem(key);
		return raw ? (JSON.parse(raw) as T) : initial;
	});

	useEffect(() => {
		window.localStorage.setItem(key, JSON.stringify(value));
	}, [key, value]);

	return [value, setValue] as const;
}`,
			},
			{
				title: "Theme context provider",
				contentType: "TEXT",
				language: "typescript",
				itemType: "snippet",
				description: "Compound provider + hook pattern for theme state.",
				content: `import { createContext, useContext, useState, type ReactNode } from "react";

type Theme = "light" | "dark";
const ThemeContext = createContext<{ theme: Theme; toggle: () => void } | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
	const [theme, setTheme] = useState<Theme>("dark");
	const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));
	return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
	const ctx = useContext(ThemeContext);
	if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
	return ctx;
}`,
			},
		],
	},
	{
		name: "AI Workflows",
		description: "AI prompts and workflow automations",
		defaultType: "prompt",
		isFavorite: true,
		items: [
			{
				title: "Code review prompt",
				contentType: "TEXT",
				itemType: "prompt",
				description: "Structured review covering bugs, style, and security.",
				isPinned: true,
				isFavorite: true,
				content: `You are a senior engineer reviewing a pull request.

Review the diff below and respond with:
1. Correctness issues (bugs, edge cases, race conditions)
2. Style / readability concerns
3. Security or performance risks
4. Suggested follow-ups (with file:line references)

Be concise. Only flag issues that matter.

Diff:
<<<DIFF>>>`,
			},
			{
				title: "Documentation generation prompt",
				contentType: "TEXT",
				itemType: "prompt",
				description: "Generates README sections from source files.",
				content: `Given the source file below, produce:
- A one-paragraph overview
- A bullet list of public exports with one-line descriptions
- A short usage example in TypeScript
- Any non-obvious gotchas

Write in Markdown. No headings deeper than H3.

Source:
<<<FILE>>>`,
			},
			{
				title: "Refactoring assistant prompt",
				contentType: "TEXT",
				itemType: "prompt",
				description: "Suggests refactors without changing behavior.",
				content: `Refactor the code below for clarity and maintainability.

Constraints:
- Preserve all observable behavior
- Keep the public API stable
- Do not introduce new dependencies
- Explain each change in one sentence

Code:
<<<CODE>>>`,
			},
		],
	},
	{
		name: "DevOps",
		description: "Infrastructure and deployment resources",
		items: [
			{
				title: "Multi-stage Node Dockerfile",
				contentType: "TEXT",
				language: "dockerfile",
				itemType: "snippet",
				description: "Small production image for a Node.js app.",
				content: `FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package*.json ./
EXPOSE 3000
CMD ["node", "dist/index.js"]`,
			},
			{
				title: "Deploy to production",
				contentType: "TEXT",
				itemType: "command",
				description: "Build, tag, push, and roll the production deployment.",
				content: `docker build -t registry.example.com/app:$(git rev-parse --short HEAD) . \\
	&& docker push registry.example.com/app:$(git rev-parse --short HEAD) \\
	&& kubectl set image deployment/app app=registry.example.com/app:$(git rev-parse --short HEAD) \\
	&& kubectl rollout status deployment/app`,
			},
			{
				title: "Kubernetes Documentation",
				contentType: "URL",
				itemType: "link",
				url: "https://kubernetes.io/docs/home/",
				description: "Official Kubernetes documentation.",
			},
			{
				title: "Terraform Registry",
				contentType: "URL",
				itemType: "link",
				url: "https://registry.terraform.io/",
				description: "Provider and module registry for Terraform.",
			},
		],
	},
];

async function seedCollectionsAndItems(
	userId: string,
	itemTypeIds: Record<string, string>,
) {
	for (const col of collections) {
		const collection = await prisma.collection.create({
			data: {
				name: col.name,
				description: col.description,
				isFavorite: col.isFavorite ?? false,
				userId,
				defaultTypeId: col.defaultType ? itemTypeIds[col.defaultType] : null,
			},
		});

		await Promise.all(
			col.items.map((item) =>
				prisma.item.create({
					data: {
						title: item.title,
						contentType: item.contentType,
						content: item.content,
						url: item.url,
						description: item.description,
						language: item.language,
						isPinned: item.isPinned ?? false,
						isFavorite: item.isFavorite ?? false,
						userId,
						itemTypeId: itemTypeIds[item.itemType],
						collections: {
							create: [{ collectionId: collection.id }],
						},
					},
				}),
			),
		);
	}
}

async function main() {
	console.log("Seeding system item types...");
	const itemTypeIds = await seedSystemItemTypes();

	console.log("Seeding demo user...");
	const user = await seedDemoUser();

	console.log("Clearing existing demo content...");
	await clearDemoContent(user.id);

	console.log("Seeding collections and items...");
	await seedCollectionsAndItems(user.id, itemTypeIds);

	console.log("Seeding complete!");
}

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (e) => {
		console.error(e);
		await prisma.$disconnect();
		process.exit(1);
	});
