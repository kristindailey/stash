import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDemoUserId } from "@/lib/db/get-user-id";
import { getItemById } from "@/lib/db/items";

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
	if (!item) {
		return NextResponse.json({ error: "Not found" }, { status: 404 });
	}

	return NextResponse.json({ item });
}
