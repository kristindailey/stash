"use client";

import * as React from "react";

type ItemDrawerContextValue = {
	openItemId: string | null;
	openItem: (id: string) => void;
	close: () => void;
};

const ItemDrawerContext = React.createContext<ItemDrawerContextValue | null>(
	null,
);

export function ItemDrawerProvider({ children }: { children: React.ReactNode }) {
	const [openItemId, setOpenItemId] = React.useState<string | null>(null);

	const openItem = React.useCallback((id: string) => setOpenItemId(id), []);
	const close = React.useCallback(() => setOpenItemId(null), []);

	const value = React.useMemo(
		() => ({ openItemId, openItem, close }),
		[openItemId, openItem, close],
	);

	return (
		<ItemDrawerContext.Provider value={value}>
			{children}
		</ItemDrawerContext.Provider>
	);
}

export function useItemDrawer() {
	const ctx = React.useContext(ItemDrawerContext);
	if (!ctx) {
		throw new Error("useItemDrawer must be used within ItemDrawerProvider");
	}
	return ctx;
}
