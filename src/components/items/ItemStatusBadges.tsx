import { Pin, Star } from "lucide-react";

export function ItemStatusBadges({
	isPinned,
	isFavorite,
}: {
	isPinned: boolean;
	isFavorite: boolean;
}) {
	return (
		<>
			{isPinned && <Pin className="size-3.5" fill="currentColor" />}
			{isFavorite && (
				<Star
					className="size-3.5"
					style={{ color: "#fcd757" }}
					fill="currentColor"
				/>
			)}
		</>
	);
}
