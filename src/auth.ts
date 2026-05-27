import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { isEmailVerificationEnabled } from "@/lib/email";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import authConfig from "./auth.config";

class EmailNotVerifiedError extends CredentialsSignin {
	code = "EmailNotVerified";
}

class RateLimitError extends CredentialsSignin {
	code: string;
	constructor(seconds: number) {
		super();
		this.code = `RateLimited:${seconds}`;
	}
}

const providers = authConfig.providers.map((provider) => {
	if (typeof provider === "function") return provider;
	if (provider.id !== "credentials") return provider;
	return Credentials({
		credentials: {
			email: { label: "Email", type: "email" },
			password: { label: "Password", type: "password" },
		},
		authorize: async (credentials, request) => {
			const email = typeof credentials?.email === "string" ? credentials.email.trim().toLowerCase() : "";
			const password = typeof credentials?.password === "string" ? credentials.password : "";
			if (!email || !password) return null;

			const ip = getClientIp(request);
			const rl = await checkRateLimit("login", `ip:${ip}:email:${email}`);
			if (!rl.success) throw new RateLimitError(rl.windowSeconds);

			const user = await prisma.user.findUnique({ where: { email } });
			if (!user?.password) return null;
			const valid = await bcrypt.compare(password, user.password);
			if (!valid) return null;
			if (isEmailVerificationEnabled() && !user.emailVerified) {
				throw new EmailNotVerifiedError();
			}
			return { id: user.id, email: user.email, name: user.name, image: user.image };
		},
	});
});

export const { auth, handlers, signIn, signOut } = NextAuth({
	adapter: PrismaAdapter(prisma),
	session: { strategy: "jwt" },
	callbacks: {
		jwt({ token, user }) {
			if (user) {
				token.id = user.id;
			}
			return token;
		},
		session({ session, token }) {
			if (token.id && session.user) {
				session.user.id = token.id as string;
			}
			return session;
		},
	},
	...authConfig,
	providers,
});
