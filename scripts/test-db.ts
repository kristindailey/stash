import "dotenv/config";
import { prisma } from "../src/lib/prisma.ts";

async function main() {
	console.log("Testing database connection...\n");

	const itemTypes = await prisma.itemType.findMany({
		where: { isSystem: true },
		orderBy: { name: "asc" },
	});

	console.log(`Found ${itemTypes.length} system item types:`);
	for (const type of itemTypes) {
		console.log(`  - ${type.name.padEnd(8)} ${type.color}  (${type.icon})`);
	}

	const userCount = await prisma.user.count();
	const itemCount = await prisma.item.count();
	const collectionCount = await prisma.collection.count();

	console.log("\nTable counts:");
	console.log(`  users:       ${userCount}`);
	console.log(`  items:       ${itemCount}`);
	console.log(`  collections: ${collectionCount}`);

	console.log("\nDatabase connection OK.");
}

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (e) => {
		console.error("Database test failed:", e);
		await prisma.$disconnect();
		process.exit(1);
	});
