import { cn } from "@/lib/utils";

type UserAvatarProps = {
	name?: string | null;
	image?: string | null;
	email?: string | null;
	className?: string;
};

export function UserAvatar({ name, image, email, className }: UserAvatarProps) {
	const initials = getInitials(name, email);

	if (image) {
		return (
			<img
				src={image}
				alt={name ?? "User avatar"}
				className={cn(
					"size-8 shrink-0 rounded-full object-cover",
					className
				)}
			/>
		);
	}

	return (
		<div
			aria-label={name ?? "User avatar"}
			className={cn(
				"flex size-8 shrink-0 items-center justify-center rounded-full bg-[#8b5cf6] text-sm font-medium text-white",
				className
			)}
		>
			{initials}
		</div>
	);
}

function getInitials(name?: string | null, email?: string | null): string {
	const source = (name ?? "").trim();
	if (source) {
		const parts = source.split(/\s+/).filter(Boolean);
		if (parts.length >= 2) {
			return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
		}
		return parts[0].slice(0, 2).toUpperCase();
	}
	const fromEmail = (email ?? "").trim();
	if (fromEmail) return fromEmail.charAt(0).toUpperCase();
	return "?";
}
