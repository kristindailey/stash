"use client";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { LANGUAGE_OPTIONS } from "@/lib/constants/item-types";

export function LanguageSelect({
	value,
	onChange,
}: {
	value: string;
	onChange: (value: string) => void;
}) {
	const current = value || "plaintext";
	const known = LANGUAGE_OPTIONS.some((option) => option.value === current);

	return (
		<Select value={current} onValueChange={onChange}>
			<SelectTrigger>
				<SelectValue placeholder="Select a language" />
			</SelectTrigger>
			<SelectContent>
				{!known && (
					<SelectItem value={current}>{current}</SelectItem>
				)}
				{LANGUAGE_OPTIONS.map((option) => (
					<SelectItem key={option.value} value={option.value}>
						{option.label}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
