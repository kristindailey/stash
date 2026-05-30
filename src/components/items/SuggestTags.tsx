"use client";

import * as React from "react";
import { Check, Loader2, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { generateAutoTags } from "@/actions/ai";

export function SuggestTags({
	title,
	content,
	existingTags,
	onAdd,
}: {
	title: string;
	content: string;
	existingTags: string[];
	onAdd: (tag: string) => void;
}) {
	const [loading, setLoading] = React.useState(false);
	const [suggestions, setSuggestions] = React.useState<string[]>([]);

	const existing = React.useMemo(
		() => new Set(existingTags.map((tag) => tag.toLowerCase())),
		[existingTags],
	);
	const pending = suggestions.filter((tag) => !existing.has(tag));

	const handleSuggest = async () => {
		setLoading(true);
		const result = await generateAutoTags({ title, content });
		setLoading(false);

		if (!result.success) {
			if (result.error.includes("Upgrade to Pro")) {
				toast.error(result.error, {
					action: {
						label: "Upgrade",
						onClick: () => {
							window.location.href = "/upgrade";
						},
					},
				});
			} else {
				toast.error(result.error);
			}
			return;
		}

		setSuggestions(result.data.tags);
	};

	const accept = (tag: string) => {
		onAdd(tag);
		setSuggestions((prev) => prev.filter((t) => t !== tag));
	};

	const reject = (tag: string) => {
		setSuggestions((prev) => prev.filter((t) => t !== tag));
	};

	return (
		<div className="flex flex-col gap-2">
			<Button
				type="button"
				variant="ghost"
				size="sm"
				onClick={handleSuggest}
				disabled={loading}
				className="h-7 w-fit gap-1.5 px-2 text-xs text-muted-foreground"
			>
				{loading ? (
					<Loader2 className="size-3.5 animate-spin" />
				) : (
					<Sparkles className="size-3.5" />
				)}
				{loading ? "Suggesting…" : "Suggest Tags"}
			</Button>

			{pending.length > 0 && (
				<div className="flex flex-wrap gap-1.5">
					{pending.map((tag) => (
						<Badge key={tag} variant="outline" className="gap-1 pr-1">
							{tag}
							<button
								type="button"
								onClick={() => accept(tag)}
								aria-label={`Accept ${tag}`}
								className="rounded-full text-muted-foreground hover:text-emerald-500"
							>
								<Check className="size-3" />
							</button>
							<button
								type="button"
								onClick={() => reject(tag)}
								aria-label={`Reject ${tag}`}
								className="rounded-full text-muted-foreground hover:text-destructive"
							>
								<X className="size-3" />
							</button>
						</Badge>
					))}
				</div>
			)}
		</div>
	);
}
