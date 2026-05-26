import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
	}

	if (!body || typeof body !== "object") {
		return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
	}

	const { name, email, password, confirmPassword } = body as Record<string, unknown>;

	if (typeof name !== "string" || name.trim().length < 1) {
		return NextResponse.json({ error: "Name is required" }, { status: 400 });
	}
	if (typeof email !== "string" || !EMAIL_REGEX.test(email)) {
		return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
	}
	if (typeof password !== "string" || password.length < 8) {
		return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
	}
	if (password !== confirmPassword) {
		return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
	}

	const normalizedEmail = email.trim().toLowerCase();
	const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
	if (existing) {
		return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
	}

	const hashed = await bcrypt.hash(password, 10);
	const user = await prisma.user.create({
		data: { name: name.trim(), email: normalizedEmail, password: hashed },
		select: { id: true, email: true, name: true },
	});

	return NextResponse.json({ success: true, user }, { status: 201 });
}
