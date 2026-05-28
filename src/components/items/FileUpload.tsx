"use client";

import * as React from "react";
import { X, FileText, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
	formatBytes,
	getUploadConfig,
	validateUpload,
	type UploadKind,
} from "@/lib/constants/file-upload";

export type UploadedFile = {
	url: string;
	fileName: string;
	fileSize: number;
	contentType: string;
};

type FileUploadProps = {
	kind: UploadKind;
	value: UploadedFile | null;
	onChange: (file: UploadedFile | null) => void;
};

export function FileUpload({ kind, value, onChange }: FileUploadProps) {
	const inputRef = React.useRef<HTMLInputElement>(null);
	const [dragging, setDragging] = React.useState(false);
	const [uploading, setUploading] = React.useState(false);
	const [progress, setProgress] = React.useState(0);
	const [error, setError] = React.useState<string | null>(null);
	const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

	React.useEffect(() => {
		return () => {
			if (previewUrl) URL.revokeObjectURL(previewUrl);
		};
	}, [previewUrl]);

	const config = getUploadConfig(kind);
	const accept = config.extensions.join(",");

	const upload = React.useCallback(
		(file: File) => {
			setError(null);

			const validationError = validateUpload(kind, {
				name: file.name,
				size: file.size,
				type: file.type,
			});
			if (validationError) {
				setError(validationError.message);
				return;
			}

			const formData = new FormData();
			formData.append("kind", kind);
			formData.append("file", file);

			const xhr = new XMLHttpRequest();
			xhr.open("POST", "/api/upload");

			xhr.upload.addEventListener("progress", (event) => {
				if (event.lengthComputable) {
					setProgress(Math.round((event.loaded / event.total) * 100));
				}
			});

			xhr.addEventListener("load", () => {
				setUploading(false);
				setProgress(0);
				if (xhr.status >= 200 && xhr.status < 300) {
					try {
						const data = JSON.parse(xhr.responseText) as UploadedFile;
						setPreviewUrl(
							kind === "image" ? URL.createObjectURL(file) : null,
						);
						onChange(data);
					} catch {
						setError("Invalid server response");
					}
				} else {
					try {
						const data = JSON.parse(xhr.responseText) as { error?: string };
						setError(data.error ?? "Upload failed");
					} catch {
						setError("Upload failed");
					}
				}
			});

			xhr.addEventListener("error", () => {
				setUploading(false);
				setProgress(0);
				setError("Upload failed");
			});

			xhr.addEventListener("abort", () => {
				setUploading(false);
				setProgress(0);
			});

			setUploading(true);
			setProgress(0);
			xhr.send(formData);
		},
		[kind, onChange],
	);

	const handleFiles = (files: FileList | null) => {
		if (!files || files.length === 0) return;
		upload(files[0]);
	};

	const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
		event.preventDefault();
		setDragging(false);
		handleFiles(event.dataTransfer.files);
	};

	const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
		event.preventDefault();
		setDragging(true);
	};

	const handleDragLeave = () => setDragging(false);

	const handleClear = () => {
		setPreviewUrl(null);
		onChange(null);
		setError(null);
		if (inputRef.current) inputRef.current.value = "";
	};

	if (value) {
		return (
			<div className="rounded-md border bg-muted/30 p-3">
				<div className="flex items-start gap-3">
					{kind === "image" && previewUrl ? (
						/* eslint-disable-next-line @next/next/no-img-element */
						<img
							src={previewUrl}
							alt={value.fileName}
							className="size-16 shrink-0 rounded object-cover"
						/>
					) : (
						<div className="flex size-16 shrink-0 items-center justify-center rounded bg-muted">
							<FileText className="size-6 text-muted-foreground" />
						</div>
					)}
					<div className="min-w-0 flex-1">
						<p className="truncate text-sm font-medium">{value.fileName}</p>
						<p className="text-xs text-muted-foreground">
							{formatBytes(value.fileSize)}
						</p>
					</div>
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={handleClear}
						aria-label="Remove file"
					>
						<X />
					</Button>
				</div>
			</div>
		);
	}

	const Icon = kind === "image" ? ImageIcon : FileText;
	const limitMb = config.maxSize / (1024 * 1024);

	return (
		<div className="flex flex-col gap-2">
			<div
				onDrop={handleDrop}
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				onClick={() => inputRef.current?.click()}
				role="button"
				tabIndex={0}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						e.preventDefault();
						inputRef.current?.click();
					}
				}}
				className={cn(
					"flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed px-4 py-6 text-center transition-colors",
					dragging
						? "border-foreground bg-muted"
						: "border-border hover:bg-muted/50",
					uploading && "pointer-events-none opacity-70",
				)}
			>
				<Icon className="size-6 text-muted-foreground" />
				<div className="text-sm">
					<span className="font-medium">Click to upload</span>
					<span className="text-muted-foreground"> or drag and drop</span>
				</div>
				<p className="text-xs text-muted-foreground">
					{config.extensions.join(", ")} • up to {limitMb} MB
				</p>

				<input
					ref={inputRef}
					type="file"
					accept={accept}
					className="hidden"
					onChange={(e) => handleFiles(e.target.files)}
				/>
			</div>

			{uploading && (
				<div className="flex items-center gap-2">
					<div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
						<div
							className="h-full bg-foreground transition-all"
							style={{ width: `${progress}%` }}
						/>
					</div>
					<span className="text-xs text-muted-foreground">{progress}%</span>
				</div>
			)}

			{error && <p className="text-xs text-destructive">{error}</p>}
		</div>
	);
}
