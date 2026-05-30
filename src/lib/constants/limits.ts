export const FREE_ITEM_LIMIT = 50;
export const FREE_COLLECTION_LIMIT = 3;

export const PRO_ONLY_TYPES = new Set(["file", "image"]);

export function isProGatingEnabled() {
	return process.env.PRO_GATING_ENABLED === "true";
}
