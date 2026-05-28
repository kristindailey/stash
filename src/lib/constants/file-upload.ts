export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

export const IMAGE_EXTENSIONS = [
	".png",
	".jpg",
	".jpeg",
	".gif",
	".webp",
	".svg",
] as const;

export const FILE_EXTENSIONS = [
	".pdf",
	".txt",
	".md",
	".json",
	".yaml",
	".yml",
	".xml",
	".csv",
	".toml",
	".ini",
] as const;

export const IMAGE_MIME_TYPES = [
	"image/png",
	"image/jpeg",
	"image/gif",
	"image/webp",
	"image/svg+xml",
] as const;

export const FILE_MIME_TYPES = [
	"application/pdf",
	"text/plain",
	"text/markdown",
	"application/json",
	"application/x-yaml",
	"text/yaml",
	"application/xml",
	"text/xml",
	"text/csv",
	"application/toml",
] as const;

export type UploadKind = "file" | "image";

export function getUploadConfig(kind: UploadKind) {
	return kind === "image"
		? {
				maxSize: MAX_IMAGE_SIZE,
				extensions: IMAGE_EXTENSIONS,
				mimeTypes: IMAGE_MIME_TYPES,
			}
		: {
				maxSize: MAX_FILE_SIZE,
				extensions: FILE_EXTENSIONS,
				mimeTypes: FILE_MIME_TYPES,
			};
}

export function getExtension(filename: string): string {
	const dot = filename.lastIndexOf(".");
	return dot === -1 ? "" : filename.slice(dot).toLowerCase();
}

export type FileValidationError = {
	code: "size" | "extension" | "mime" | "empty";
	message: string;
};

export function validateUpload(
	kind: UploadKind,
	file: { name: string; size: number; type: string },
): FileValidationError | null {
	if (file.size === 0) {
		return { code: "empty", message: "File is empty" };
	}

	const config = getUploadConfig(kind);

	if (file.size > config.maxSize) {
		const limitMb = config.maxSize / (1024 * 1024);
		return {
			code: "size",
			message: `File exceeds ${limitMb} MB limit`,
		};
	}

	const ext = getExtension(file.name);
	if (!(config.extensions as readonly string[]).includes(ext)) {
		return {
			code: "extension",
			message: `Unsupported file type: ${ext || "(no extension)"}`,
		};
	}

	if (
		file.type &&
		!(config.mimeTypes as readonly string[]).includes(file.type)
	) {
		return {
			code: "mime",
			message: `Unsupported content type: ${file.type}`,
		};
	}

	return null;
}

export function formatBytes(bytes: number | null | undefined): string {
	if (bytes === null || bytes === undefined) return "—";
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}
