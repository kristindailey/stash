import "dotenv/config";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { prisma } from "../src/lib/prisma.ts";

const DEMO_EMAIL = "demo@devstash.io";

async function confirm(question: string) {
	if (process.argv.includes("--yes") || process.argv.includes("-y")) return true;
	const rl = createInterface({ input, output });
	const answer = await rl.question(`${question} (type "DELETE" to confirm): `);
	rl.close();
	return answer.trim() === "DELETE";
}

async function main() {
	const demo = await prisma.user.findUnique({
		where: { email: DEMO_EMAIL },
		select: { id: true, email: true },
	});

	if (!demo) {
		console.error(`Demo user (${DEMO_EMAIL}) not found. Aborting to avoid wiping all users.`);
		process.exit(1);
	}

	const targets = await prisma.user.findMany({
		where: { id: { not: demo.id } },
		select: { id: true, email: true, _count: { select: { items: true, collections: true } } },
	});

	if (targets.length === 0) {
		console.log("No non-demo users to delete. Nothing to do.");
		return;
	}

	console.log(`Preserving demo user: ${demo.email} (${demo.id})`);
	console.log(`\nUsers to delete (${targets.length}):`);
	for (const u of targets) {
		console.log(`  - ${u.email}  items=${u._count.items}  collections=${u._count.collections}`);
	}

	const targetEmails = targets.map((u) => u.email).filter((e): e is string => !!e);
	const orphanTokens = await prisma.verificationToken.count({
		where: { identifier: { in: targetEmails } },
	});
	console.log(`\nOrphan verification tokens to delete: ${orphanTokens}`);

	const ok = await confirm("\nThis will permanently delete the users above and ALL their content");
	if (!ok) {
		console.log("Aborted.");
		return;
	}

	const result = await prisma.$transaction(async (tx) => {
		const tokens = await tx.verificationToken.deleteMany({
			where: { identifier: { in: targetEmails } },
		});
		const users = await tx.user.deleteMany({
			where: { id: { not: demo.id } },
		});
		return { tokens: tokens.count, users: users.count };
	});

	console.log(`\nDeleted ${result.users} users and ${result.tokens} verification tokens.`);
	console.log("Items, collections, custom item types, accounts, and sessions were cascaded by Prisma.");
}

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (e) => {
		console.error("Delete failed:", e);
		await prisma.$disconnect();
		process.exit(1);
	});
