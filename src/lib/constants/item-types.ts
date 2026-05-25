import {
	Code,
	File,
	Image as ImageIcon,
	Link as LinkIcon,
	Sparkles,
	StickyNote,
	Terminal,
	type LucideIcon,
} from "lucide-react";

export const ITEM_TYPE_ICONS: Record<string, LucideIcon> = {
	snippet: Code,
	prompt: Sparkles,
	command: Terminal,
	note: StickyNote,
	file: File,
	image: ImageIcon,
	link: LinkIcon,
};

export const ITEM_TYPE_COLORS: Record<string, string> = {
	snippet: "#3b82f6",
	prompt: "#8b5cf6",
	command: "#f97316",
	note: "#fde047",
	file: "#6b7280",
	image: "#ec4899",
	link: "#10b981",
};

export const ITEM_TYPE_LABELS: Record<string, string> = {
	snippet: "Snippet",
	prompt: "Prompt",
	command: "Command",
	note: "Note",
	file: "File",
	image: "Image",
	link: "Link",
};
