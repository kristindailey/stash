"use client";

import * as React from "react";
import { toast } from "sonner";
import { updateEditorPreferences } from "@/actions/editor-preferences";
import {
	DEFAULT_EDITOR_PREFERENCES,
	type EditorPreferences,
} from "@/lib/constants/editor-preferences";

type EditorPreferencesContextValue = {
	preferences: EditorPreferences;
	saving: boolean;
	update: (patch: Partial<EditorPreferences>) => Promise<void>;
};

const EditorPreferencesContext =
	React.createContext<EditorPreferencesContextValue | null>(null);

export function EditorPreferencesProvider({
	initialPreferences,
	children,
}: {
	initialPreferences: EditorPreferences;
	children: React.ReactNode;
}) {
	const [preferences, setPreferences] = React.useState(initialPreferences);
	const [saving, setSaving] = React.useState(false);

	const update = React.useCallback(
		async (patch: Partial<EditorPreferences>) => {
			const previous = preferences;
			const next = { ...preferences, ...patch };
			setPreferences(next);
			setSaving(true);

			const result = await updateEditorPreferences(next);

			setSaving(false);
			if (!result.success) {
				setPreferences(previous);
				toast.error(result.error ?? "Could not save preferences");
				return;
			}

			setPreferences(result.data);
			toast.success("Editor preferences saved");
		},
		[preferences],
	);

	const value = React.useMemo(
		() => ({ preferences, saving, update }),
		[preferences, saving, update],
	);

	return (
		<EditorPreferencesContext.Provider value={value}>
			{children}
		</EditorPreferencesContext.Provider>
	);
}

export function useEditorPreferences(): EditorPreferencesContextValue {
	const ctx = React.useContext(EditorPreferencesContext);
	if (!ctx) {
		return {
			preferences: DEFAULT_EDITOR_PREFERENCES,
			saving: false,
			update: async () => {},
		};
	}
	return ctx;
}
