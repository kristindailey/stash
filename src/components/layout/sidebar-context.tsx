"use client";

import * as React from "react";

type SidebarContextValue = {
	open: boolean;
	setOpen: (open: boolean) => void;
	toggle: () => void;
};

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
	const [open, setOpen] = React.useState(true);
	const toggle = React.useCallback(() => setOpen((o) => !o), []);
	const value = React.useMemo(
		() => ({ open, setOpen, toggle }),
		[open, toggle]
	);
	return (
		<SidebarContext.Provider value={value}>
			{children}
		</SidebarContext.Provider>
	);
}

export function useSidebar() {
	const ctx = React.useContext(SidebarContext);
	if (!ctx) {
		throw new Error("useSidebar must be used within SidebarProvider");
	}
	return ctx;
}