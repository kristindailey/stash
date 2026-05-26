import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import authConfig from "@/auth.config";

const { auth } = NextAuth(authConfig);

export const proxy = auth((req) => {
	const isLoggedIn = !!req.auth;
	const { pathname } = req.nextUrl;
	const isProtected =
		pathname.startsWith("/dashboard") || pathname.startsWith("/profile");

	if (isProtected && !isLoggedIn) {
		const signInUrl = new URL("/login", req.nextUrl);
		signInUrl.searchParams.set("callbackUrl", pathname);
		return NextResponse.redirect(signInUrl);
	}

	return NextResponse.next();
});

export const config = {
	matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
