import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { getPageRange } from "@/lib/pagination";
import { cn } from "@/lib/utils";

type PaginationProps = {
	basePath: string;
	currentPage: number;
	totalPages: number;
};

function pageHref(basePath: string, page: number): string {
	return page <= 1 ? basePath : `${basePath}?page=${page}`;
}

export function Pagination({
	basePath,
	currentPage,
	totalPages,
}: PaginationProps) {
	if (totalPages <= 1) return null;

	const pages = getPageRange(currentPage, totalPages);
	const hasPrev = currentPage > 1;
	const hasNext = currentPage < totalPages;

	return (
		<nav
			aria-label="Pagination"
			className="flex items-center justify-center gap-1"
		>
			{hasPrev ? (
				<Link
					href={pageHref(basePath, currentPage - 1)}
					aria-label="Previous page"
					className={cn(buttonVariants({ variant: "outline", size: "icon" }))}
				>
					<ChevronLeft />
				</Link>
			) : (
				<span
					aria-disabled="true"
					className={cn(
						buttonVariants({ variant: "outline", size: "icon" }),
						"pointer-events-none opacity-50",
					)}
				>
					<ChevronLeft />
				</span>
			)}

			{pages.map((page, index) =>
				page === "ellipsis" ? (
					<span
						key={`ellipsis-${index}`}
						className="flex size-8 items-center justify-center text-sm text-muted-foreground"
					>
						…
					</span>
				) : (
					<Link
						key={page}
						href={pageHref(basePath, page)}
						aria-label={`Page ${page}`}
						aria-current={page === currentPage ? "page" : undefined}
						className={cn(
							buttonVariants({
								variant: page === currentPage ? "default" : "outline",
								size: "icon",
							}),
						)}
					>
						{page}
					</Link>
				),
			)}

			{hasNext ? (
				<Link
					href={pageHref(basePath, currentPage + 1)}
					aria-label="Next page"
					className={cn(buttonVariants({ variant: "outline", size: "icon" }))}
				>
					<ChevronRight />
				</Link>
			) : (
				<span
					aria-disabled="true"
					className={cn(
						buttonVariants({ variant: "outline", size: "icon" }),
						"pointer-events-none opacity-50",
					)}
				>
					<ChevronRight />
				</span>
			)}
		</nav>
	);
}
