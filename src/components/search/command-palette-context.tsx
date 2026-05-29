"use client";

import * as React from "react";

type CommandPaletteContextValue = {
	open: boolean;
	setOpen: (open: boolean) => void;
	openPalette: () => void;
};

const CommandPaletteContext =
	React.createContext<CommandPaletteContextValue | null>(null);

export function CommandPaletteProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const [open, setOpen] = React.useState(false);

	React.useEffect(() => {
		function onKeyDown(event: KeyboardEvent) {
			if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
				event.preventDefault();
				setOpen((prev) => !prev);
			}
		}

		document.addEventListener("keydown", onKeyDown);
		return () => document.removeEventListener("keydown", onKeyDown);
	}, []);

	const openPalette = React.useCallback(() => setOpen(true), []);

	const value = React.useMemo(
		() => ({ open, setOpen, openPalette }),
		[open, openPalette],
	);

	return (
		<CommandPaletteContext.Provider value={value}>
			{children}
		</CommandPaletteContext.Provider>
	);
}

export function useCommandPalette() {
	const ctx = React.useContext(CommandPaletteContext);
	if (!ctx) {
		throw new Error(
			"useCommandPalette must be used within CommandPaletteProvider",
		);
	}
	return ctx;
}
