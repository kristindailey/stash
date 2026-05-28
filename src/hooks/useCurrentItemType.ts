"use client";

import { usePathname } from "next/navigation";
import { CREATABLE_TYPES, type CreatableType } from "@/lib/constants/item-types";

const CREATABLE_SET = new Set<string>(CREATABLE_TYPES);

export function typeFromPath(pathname: string | null): CreatableType {
	const match = pathname?.match(/^\/items\/([^/]+)/);
	const slug = match?.[1]?.replace(/s$/, "");
	return slug && CREATABLE_SET.has(slug) ? (slug as CreatableType) : "snippet";
}

export function useCurrentItemType(): CreatableType {
	const pathname = usePathname();
	return typeFromPath(pathname);
}
