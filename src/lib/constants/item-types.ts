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

export const ITEM_TYPE_ICONS: Partial<Record<string, LucideIcon>> = {
	snippet: Code,
	prompt: Sparkles,
	command: Terminal,
	note: StickyNote,
	file: File,
	image: ImageIcon,
	link: LinkIcon,
};

export const ITEM_TYPE_COLORS: Partial<Record<string, string>> = {
	snippet: "#3b82f6",
	prompt: "#8b5cf6",
	command: "#f97316",
	note: "#fde047",
	file: "#6b7280",
	image: "#ec4899",
	link: "#10b981",
};

export const ITEM_TYPE_LABELS: Partial<Record<string, string>> = {
	snippet: "Snippet",
	prompt: "Prompt",
	command: "Command",
	note: "Note",
	file: "File",
	image: "Image",
	link: "Link",
};

export const CREATABLE_TYPES = [
	"snippet",
	"prompt",
	"command",
	"note",
	"file",
	"image",
	"link",
] as const;

export type CreatableType = (typeof CREATABLE_TYPES)[number];

export const CONTENT_TYPES = new Set<string>([
	"snippet",
	"prompt",
	"command",
	"note",
]);
export const LANGUAGE_TYPES = new Set<string>(["snippet", "command"]);

export const LANGUAGE_OPTIONS = [
	{ value: "plaintext", label: "Plain Text" },
	{ value: "bash", label: "Bash / Shell" },
	{ value: "c", label: "C" },
	{ value: "cpp", label: "C++" },
	{ value: "csharp", label: "C#" },
	{ value: "css", label: "CSS" },
	{ value: "dockerfile", label: "Dockerfile" },
	{ value: "go", label: "Go" },
	{ value: "graphql", label: "GraphQL" },
	{ value: "html", label: "HTML" },
	{ value: "java", label: "Java" },
	{ value: "javascript", label: "JavaScript" },
	{ value: "json", label: "JSON" },
	{ value: "kotlin", label: "Kotlin" },
	{ value: "markdown", label: "Markdown" },
	{ value: "php", label: "PHP" },
	{ value: "powershell", label: "PowerShell" },
	{ value: "python", label: "Python" },
	{ value: "ruby", label: "Ruby" },
	{ value: "rust", label: "Rust" },
	{ value: "scss", label: "SCSS" },
	{ value: "sql", label: "SQL" },
	{ value: "swift", label: "Swift" },
	{ value: "typescript", label: "TypeScript" },
	{ value: "yaml", label: "YAML" },
] as const;
export const MARKDOWN_TYPES = new Set<string>(["note", "prompt"]);
export const FILE_TYPES = new Set<string>(["file", "image"]);
export const URL_TYPES = new Set<string>(["link"]);
