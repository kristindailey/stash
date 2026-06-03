import {
	AlignLeft,
	AppWindow,
	Bookmark,
	Code,
	File,
	FileCode,
	FileText,
	GitBranch,
	type LucideIcon,
	MessageSquare,
	Search,
	Star,
	StickyNote,
	Terminal,
} from "lucide-react";

export { ITEM_TYPE_COLORS as MARKETING_TYPE_COLORS } from "./item-types";

export const CTA_PRIMARY_CLASS =
	"border-transparent bg-brand-yellow text-neutral-900 transition-colors hover:bg-brand-yellow/90";

export interface MarketingFeature {
	typeKey: string;
	title: string;
	desc: string;
	icon: LucideIcon;
}

export const MARKETING_FEATURES: MarketingFeature[] = [
	{
		typeKey: "snippet",
		title: "Code Snippets",
		desc: "Save reusable code with syntax highlighting and find it instantly.",
		icon: Code,
	},
	{
		typeKey: "prompt",
		title: "Prompts",
		desc: "Stop losing your best prompts in chat histories. Stash them here.",
		icon: Star,
	},
	{
		typeKey: "link",
		title: "Instant Search",
		desc: "Full-text search across content, tags, titles and types in seconds.",
		icon: Search,
	},
	{
		typeKey: "command",
		title: "Commands",
		desc: "Keep that git incantation and shell one-liner one keystroke away.",
		icon: Terminal,
	},
	{
		typeKey: "file",
		title: "Files & Docs",
		desc: "Upload context files and images so they're never buried again.",
		icon: File,
	},
	{
		typeKey: "note",
		title: "Collections",
		desc: "Group anything into collections — patterns, prep, boilerplates.",
		icon: AlignLeft,
	},
];

export const CHAOS_ICONS: LucideIcon[] = [
	StickyNote,
	GitBranch,
	MessageSquare,
	FileCode,
	AppWindow,
	Terminal,
	FileText,
	Bookmark,
];

export interface PreviewType {
	typeKey: string;
	label: string;
	active?: boolean;
}

export const PREVIEW_TYPES: PreviewType[] = [
	{ typeKey: "snippet", label: "Snippets", active: true },
	{ typeKey: "prompt", label: "Prompts" },
	{ typeKey: "command", label: "Commands" },
	{ typeKey: "note", label: "Notes" },
	{ typeKey: "file", label: "Files" },
	{ typeKey: "image", label: "Images" },
	{ typeKey: "link", label: "Links" },
];

export interface PreviewCollection {
	name: string;
	typeKey: string;
}

export const PREVIEW_COLLECTIONS: PreviewCollection[] = [
	{ name: "React Patterns", typeKey: "snippet" },
	{ name: "AI Prompts", typeKey: "prompt" },
	{ name: "Shell Cmds", typeKey: "command" },
];

export interface PreviewRecent {
	title: string;
	typeKey: string;
}

export const PREVIEW_RECENT: PreviewRecent[] = [
	{ title: "useDebounce hook", typeKey: "snippet" },
	{ title: "Code review prompt", typeKey: "prompt" },
	{ title: "git reset --hard", typeKey: "command" },
	{ title: "Deploy checklist", typeKey: "note" },
];

export const AI_CHECKLIST: string[] = [
	"Auto-suggested tags for every item",
	"One-click summaries of long notes",
	'"Explain this code" for any snippet',
	"Prompt optimizer that sharpens your prompts",
];

export const AI_TAGS: string[] = [
	"react",
	"hooks",
	"typescript",
	"debounce",
	"utility",
];

export interface PricingPlan {
	name: string;
	priceMonthly: string;
	pricePeriod: string;
	priceYearly?: string;
	periodYearly?: string;
	features: string[];
	cta: string;
	featured?: boolean;
}

export const PRICING_PLANS: PricingPlan[] = [
	{
		name: "Free",
		priceMonthly: "$0",
		pricePeriod: "forever",
		features: [
			"50 items total",
			"3 collections",
			"Snippets, prompts, commands, notes, links",
			"Basic search",
		],
		cta: "Get Started",
	},
	{
		name: "Pro",
		priceMonthly: "$8",
		pricePeriod: "per month",
		priceYearly: "$72",
		periodYearly: "per year",
		features: [
			"Unlimited items",
			"Unlimited collections",
			"File & image uploads",
			"AI tagging, summaries & prompt optimizer",
			"Data export & priority support",
		],
		cta: "Upgrade to Pro",
		featured: true,
	},
];

export interface FooterColumn {
	heading: string;
	links: { label: string; href: string }[];
}

export const FOOTER_COLUMNS: FooterColumn[] = [
	{
		heading: "Product",
		links: [
			{ label: "Features", href: "/#features" },
			{ label: "Pricing", href: "/#pricing" },
			{ label: "AI", href: "/#ai" },
		],
	},
	{
		heading: "Account",
		links: [
			{ label: "Sign In", href: "/login" },
			{ label: "Get Started", href: "/register" },
		],
	},
];
