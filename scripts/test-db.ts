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

	const demoUser = await prisma.user.findUnique({
		where: { email: "demo@devstash.io" },
		include: {
			collections: {
				orderBy: { name: "asc" },
				include: {
					defaultType: true,
					items: {
						include: { item: { include: { itemType: true } } },
					},
				},
			},
		},
	});

	if (!demoUser) {
		console.log("\nDemo user not found. Run `npm run db:seed`.");
	} else {
		console.log("\nDemo user:");
		console.log(`  email:         ${demoUser.email}`);
		console.log(`  name:          ${demoUser.name}`);
		console.log(`  isPro:         ${demoUser.isPro}`);
		console.log(`  emailVerified: ${demoUser.emailVerified?.toISOString() ?? "—"}`);
		console.log(`  password set:  ${Boolean(demoUser.password)}`);

		console.log(`\nCollections (${demoUser.collections.length}):`);
		for (const c of demoUser.collections) {
			const def = c.defaultType ? ` [default: ${c.defaultType.name}]` : "";
			console.log(`  • ${c.name} — ${c.items.length} items${def}`);
			console.log(`      ${c.description ?? ""}`);
			for (const ic of c.items) {
				console.log(`      - [${ic.item.itemType.name.padEnd(7)}] ${ic.item.title}`);
			}
		}
	}

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
