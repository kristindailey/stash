import {
	DeleteObjectCommand,
	GetObjectCommand,
	PutObjectCommand,
	S3Client,
} from "@aws-sdk/client-s3";
import { randomBytes } from "node:crypto";
import { getExtension } from "@/lib/constants/file-upload";

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

export const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME ?? "";
export const R2_PUBLIC_URL = (process.env.R2_PUBLIC_URL ?? "").replace(/\/$/, "");

let cached: S3Client | null = null;

export function getR2Client(): S3Client {
	if (!accountId || !accessKeyId || !secretAccessKey || !R2_BUCKET_NAME) {
		throw new Error("R2 is not configured");
	}
	if (cached) return cached;

	cached = new S3Client({
		region: "auto",
		endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
		credentials: { accessKeyId, secretAccessKey },
	});
	return cached;
}

export function buildObjectKey(userId: string, filename: string): string {
	const ext = getExtension(filename);
	const random = randomBytes(12).toString("hex");
	return `users/${userId}/${Date.now()}-${random}${ext}`;
}

export function publicUrlFor(key: string): string {
	if (!R2_PUBLIC_URL) {
		throw new Error("R2_PUBLIC_URL is not configured");
	}
	return `${R2_PUBLIC_URL}/${key}`;
}

export function keyFromPublicUrl(url: string): string | null {
	if (!R2_PUBLIC_URL || !url.startsWith(`${R2_PUBLIC_URL}/`)) return null;
	return url.slice(R2_PUBLIC_URL.length + 1);
}

export async function uploadToR2(
	key: string,
	body: Uint8Array,
	contentType: string,
): Promise<void> {
	const client = getR2Client();
	await client.send(
		new PutObjectCommand({
			Bucket: R2_BUCKET_NAME,
			Key: key,
			Body: body,
			ContentType: contentType,
		}),
	);
}

export async function deleteFromR2(key: string): Promise<void> {
	const client = getR2Client();
	await client.send(
		new DeleteObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key }),
	);
}

export async function getFromR2(key: string) {
	const client = getR2Client();
	return client.send(
		new GetObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key }),
	);
}
