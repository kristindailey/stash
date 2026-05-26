import { cache } from "react";
import { prisma } from "@/lib/prisma";

const DEMO_USER_EMAIL = "demo@devstash.io";

export const getDemoUserId = cache(async (): Promise<string | null> => {
	const user = await prisma.user.findUnique({
		where: { email: DEMO_USER_EMAIL },
		select: { id: true },
	});
	return user?.id ?? null;
});