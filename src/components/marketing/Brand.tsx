import Image from "next/image";
import Link from "next/link";

export function Brand({ href = "/" }: { href?: string }) {
	return (
		<Link
			href={href}
			className="inline-flex items-center gap-2 text-lg font-extrabold"
		>
			<Image
				src="/logo.png"
				alt="Stash"
				width={32}
				height={32}
				className="size-8 rounded-[9px]"
				priority
			/>
			<span>Stash</span>
		</Link>
	);
}
