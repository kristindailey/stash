import { describe, expect, it } from "vitest";
import {
	MAX_FILE_SIZE,
	MAX_IMAGE_SIZE,
	formatBytes,
	getExtension,
	getUploadConfig,
	validateUpload,
} from "./file-upload";

describe("getExtension", () => {
	it("returns the lowercased extension including the dot", () => {
		expect(getExtension("photo.PNG")).toBe(".png");
		expect(getExtension("notes.MD")).toBe(".md");
	});

	it("returns empty string when there is no extension", () => {
		expect(getExtension("README")).toBe("");
	});

	it("uses only the last dot for multi-dot filenames", () => {
		expect(getExtension("archive.tar.gz")).toBe(".gz");
	});
});

describe("getUploadConfig", () => {
	it("returns the image config for kind=image", () => {
		const config = getUploadConfig("image");
		expect(config.maxSize).toBe(MAX_IMAGE_SIZE);
		expect(config.extensions).toContain(".png");
	});

	it("returns the file config for kind=file", () => {
		const config = getUploadConfig("file");
		expect(config.maxSize).toBe(MAX_FILE_SIZE);
		expect(config.extensions).toContain(".pdf");
	});
});

describe("validateUpload", () => {
	it("rejects an empty file", () => {
		const error = validateUpload("file", {
			name: "doc.pdf",
			size: 0,
			type: "application/pdf",
		});
		expect(error?.code).toBe("empty");
	});

	it("rejects images that exceed the 5MB limit", () => {
		const error = validateUpload("image", {
			name: "huge.png",
			size: MAX_IMAGE_SIZE + 1,
			type: "image/png",
		});
		expect(error?.code).toBe("size");
	});

	it("rejects files that exceed the 10MB limit", () => {
		const error = validateUpload("file", {
			name: "big.pdf",
			size: MAX_FILE_SIZE + 1,
			type: "application/pdf",
		});
		expect(error?.code).toBe("size");
	});

	it("rejects extensions outside the allowlist for images", () => {
		const error = validateUpload("image", {
			name: "doc.pdf",
			size: 100,
			type: "application/pdf",
		});
		expect(error?.code).toBe("extension");
	});

	it("rejects extensions outside the allowlist for files", () => {
		const error = validateUpload("file", {
			name: "photo.png",
			size: 100,
			type: "image/png",
		});
		expect(error?.code).toBe("extension");
	});

	it("rejects mismatched MIME types when provided", () => {
		const error = validateUpload("image", {
			name: "photo.png",
			size: 100,
			type: "application/x-evil",
		});
		expect(error?.code).toBe("mime");
	});

	it("accepts a valid image upload", () => {
		expect(
			validateUpload("image", {
				name: "photo.PNG",
				size: 1024,
				type: "image/png",
			}),
		).toBeNull();
	});

	it("accepts a valid file upload", () => {
		expect(
			validateUpload("file", {
				name: "notes.md",
				size: 1024,
				type: "text/markdown",
			}),
		).toBeNull();
	});

	it("accepts when the browser provides no MIME type", () => {
		expect(
			validateUpload("file", { name: "notes.md", size: 10, type: "" }),
		).toBeNull();
	});
});

describe("formatBytes", () => {
	it("formats sub-kilobyte sizes in bytes", () => {
		expect(formatBytes(512)).toBe("512 B");
	});

	it("formats kilobyte sizes with one decimal", () => {
		expect(formatBytes(2048)).toBe("2.0 KB");
	});

	it("formats megabyte sizes with one decimal", () => {
		expect(formatBytes(3 * 1024 * 1024)).toBe("3.0 MB");
	});

	it("formats gigabyte sizes with two decimals", () => {
		expect(formatBytes(2 * 1024 * 1024 * 1024)).toBe("2.00 GB");
	});

	it("renders an em-dash for null", () => {
		expect(formatBytes(null)).toBe("—");
	});
});
