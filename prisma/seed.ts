import "dotenv/config";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma/client.ts";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
	throw new Error("DATABASE_URL is not set");
}

const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

const systemItemTypes = [
	{ name: "snippet", icon: "Code", color: "#3b82f6", isSystem: true },
	{ name: "prompt", icon: "Sparkles", color: "#8b5cf6", isSystem: true },
	{ name: "command", icon: "Terminal", color: "#f97316", isSystem: true },
	{ name: "note", icon: "StickyNote", color: "#fde047", isSystem: true },
	{ name: "file", icon: "File", color: "#6b7280", isSystem: true },
	{ name: "image", icon: "Image", color: "#ec4899", isSystem: true },
	{ name: "link", icon: "Link", color: "#10b981", isSystem: true },
];

async function main() {
	console.log("Seeding system item types...");

	for (const type of systemItemTypes) {
		const existing = await prisma.itemType.findFirst({
			where: { name: type.name, userId: null, isSystem: true },
		});

		if (existing) {
			await prisma.itemType.update({
				where: { id: existing.id },
				data: type,
			});
		} else {
			await prisma.itemType.create({ data: type });
		}
	}

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
