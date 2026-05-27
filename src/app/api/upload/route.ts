import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDemoUserId } from "@/lib/db/get-user-id";
import { buildObjectKey, publicUrlFor, uploadToR2 } from "@/lib/r2";
import { validateUpload, type UploadKind } from "@/lib/constants/file-upload";

export const runtime = "nodejs";

export async function POST(request: Request) {
	const session = await auth();
	if (!session?.user?.id) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const userId = await getDemoUserId();
	if (!userId) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	let form: FormData;
	try {
		form = await request.formData();
	} catch {
		return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
	}

	const kindRaw = form.get("kind");
	const file = form.get("file");

	if (kindRaw !== "file" && kindRaw !== "image") {
		return NextResponse.json({ error: "Invalid kind" }, { status: 400 });
	}
	if (!(file instanceof File)) {
		return NextResponse.json({ error: "No file provided" }, { status: 400 });
	}

	const kind = kindRaw as UploadKind;
	const validationError = validateUpload(kind, {
		name: file.name,
		size: file.size,
		type: file.type,
	});
	if (validationError) {
		return NextResponse.json(
			{ error: validationError.message },
			{ status: 400 },
		);
	}

	const key = buildObjectKey(userId, file.name);
	const bytes = new Uint8Array(await file.arrayBuffer());
	const contentType = file.type || "application/octet-stream";

	try {
		await uploadToR2(key, bytes, contentType);
	} catch (err) {
		console.error("R2 upload failed", err);
		return NextResponse.json({ error: "Upload failed" }, { status: 500 });
	}

	return NextResponse.json({
		url: publicUrlFor(key),
		key,
		fileName: file.name,
		fileSize: file.size,
		contentType,
	});
}
