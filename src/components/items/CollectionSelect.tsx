"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import type { CollectionOption } from "@/lib/db/collections";
import { cn } from "@/lib/utils";

export function CollectionSelect({
	options,
	selected,
	onChange,
	loading,
}: {
	options: CollectionOption[];
	selected: string[];
	onChange: (ids: string[]) => void;
	loading?: boolean;
}) {
	const [open, setOpen] = React.useState(false);

	const toggle = (id: string) => {
		onChange(
			selected.includes(id)
				? selected.filter((s) => s !== id)
				: [...selected, id],
		);
	};

	const selectedNames = options
		.filter((option) => selected.includes(option.id))
		.map((option) => option.name);

	const label =
		selectedNames.length === 0
			? "Select collections"
			: selectedNames.length <= 2
				? selectedNames.join(", ")
				: `${selectedNames.length} selected`;

	const disabled = loading && options.length === 0;

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					disabled={disabled || options.length === 0}
					className="w-full justify-between font-normal"
				>
					<span
						className={cn(
							"truncate",
							selectedNames.length === 0 && "text-muted-foreground",
						)}
					>
						{disabled
							? "Loading collections…"
							: options.length === 0
								? "No collections yet"
								: label}
					</span>
					<ChevronsUpDown className="size-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-(--radix-popover-trigger-width) p-1">
				<div className="max-h-60 overflow-y-auto">
					{options.map((option) => {
						const active = selected.includes(option.id);
						return (
							<button
								key={option.id}
								type="button"
								onClick={() => toggle(option.id)}
								aria-pressed={active}
								className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-left transition-colors hover:bg-accent hover:text-accent-foreground"
							>
								<Check
									className={cn(
										"size-4 shrink-0",
										active ? "opacity-100" : "opacity-0",
									)}
								/>
								<span className="truncate">{option.name}</span>
							</button>
						);
					})}
				</div>
			</PopoverContent>
		</Popover>
	);
}
