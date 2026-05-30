"use client";

import * as React from "react";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { generateDescription } from "@/actions/ai";

export function SuggestDescription({
	type,
	title,
	content,
	url,
	onGenerate,
}: {
	type: string;
	title: string;
	content: string;
	url: string;
	onGenerate: (description: string) => void;
}) {
	const [loading, setLoading] = React.useState(false);

	const handleGenerate = async () => {
		setLoading(true);
		const result = await generateDescription({ type, title, content, url });
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

		onGenerate(result.data.description);
	};

	return (
		<Button
			type="button"
			variant="ghost"
			size="sm"
			onClick={handleGenerate}
			disabled={loading}
			className="h-7 w-fit gap-1.5 px-2 text-xs text-muted-foreground"
		>
			{loading ? (
				<Loader2 className="size-3.5 animate-spin" />
			) : (
				<Sparkles className="size-3.5" />
			)}
			{loading ? "Generating…" : "Generate description"}
		</Button>
	);
}
