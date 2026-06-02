import Link from "next/link";
import { Terminal } from "lucide-react";

export function Brand({ href = "/" }: { href?: string }) {
	return (
		<Link
			href={href}
			className="inline-flex items-center gap-2 text-lg font-extrabold"
		>
			<span className="inline-flex size-8 items-center justify-center rounded-[9px] bg-gradient-to-br from-blue-400 to-blue-500 text-white">
				<Terminal className="size-5" strokeWidth={2} />
			</span>
			<span>Stash</span>
		</Link>
	);
}
