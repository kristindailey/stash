"use client";

import { Textarea } from "@/components/ui/textarea";
import { CodeEditor } from "./CodeEditor";
import { MarkdownEditor } from "./MarkdownEditor";
import { LANGUAGE_TYPES, MARKDOWN_TYPES } from "@/lib/constants/item-types";

type ItemContentFieldProps = {
	type: string;
	value: string;
	onChange: (value: string) => void;
	language?: string;
	rows?: number;
};

export function ItemContentField({
	type,
	value,
	onChange,
	language,
	rows = 6,
}: ItemContentFieldProps) {
	if (LANGUAGE_TYPES.has(type)) {
		return (
			<CodeEditor
				value={value}
				onChange={onChange}
				language={language || undefined}
			/>
		);
	}

	if (MARKDOWN_TYPES.has(type)) {
		return (
			<MarkdownEditor
				value={value}
				onChange={onChange}
				placeholder="Write markdown…"
			/>
		);
	}

	return (
		<Textarea
			value={value}
			onChange={(e) => onChange(e.target.value)}
			placeholder="Content"
			rows={rows}
			className="font-mono text-xs"
		/>
	);
}
