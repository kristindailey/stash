import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDemoUserId } from "@/lib/db/get-user-id";
import { getItemById } from "@/lib/db/items";
import { getFromR2, keyFromPublicUrl } from "@/lib/r2";

export const runtime = "nodejs";

export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const session = await auth();
	if (!session?.user?.id) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const userId = await getDemoUserId();
	if (!userId) {
		return NextResponse.json({ error: "Not found" }, { status: 404 });
	}

	const { id } = await params;
	const item = await getItemById(id, userId);
	if (!item || item.contentType !== "FILE" || !item.fileName) {
		return NextResponse.json({ error: "Not found" }, { status: 404 });
	}

	const key = item.fileUrl ? keyFromPublicUrl(item.fileUrl) : null;
	if (!key) {
		return NextResponse.json({ error: "Not found" }, { status: 404 });
	}

	let object;
	try {
		object = await getFromR2(key);
	} catch (err) {
		console.error("R2 download failed", err);
		return NextResponse.json({ error: "Download failed" }, { status: 500 });
	}

	const body = object.Body as ReadableStream | undefined;
	if (!body) {
		return NextResponse.json({ error: "Empty body" }, { status: 500 });
	}

	const headers = new Headers();
	headers.set(
		"Content-Type",
		object.ContentType ?? "application/octet-stream",
	);
	if (typeof object.ContentLength === "number") {
		headers.set("Content-Length", String(object.ContentLength));
	}
	headers.set(
		"Content-Disposition",
		`attachment; filename="${encodeURIComponent(item.fileName)}"`,
	);
	headers.set("Cache-Control", "private, max-age=0, no-store");

	return new Response(body, { headers });
}
