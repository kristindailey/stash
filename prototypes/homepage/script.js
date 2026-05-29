const ICONS = {
	notion:
		'<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7l8 .5"/><path d="M9 7v9l6-8v8"/></svg>',
	github:
		'<svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor"><path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.36 1.09 2.94.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2z"/></svg>',
	slack:
		'<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M5.5 14.5A1.75 1.75 0 1 1 3.75 12.75h1.75zm.88 0a1.75 1.75 0 0 1 3.5 0v4.38a1.75 1.75 0 1 1-3.5 0zM9.5 5.5A1.75 1.75 0 1 1 11.25 3.75v1.75zm0 .88a1.75 1.75 0 0 1 0 3.5H5.12a1.75 1.75 0 1 1 0-3.5zM18.5 9.5a1.75 1.75 0 1 1 1.75 1.75H18.5zm-.88 0a1.75 1.75 0 0 1-3.5 0V5.12a1.75 1.75 0 1 1 3.5 0zM14.5 18.5a1.75 1.75 0 1 1-1.75 1.75V18.5zm0-.88a1.75 1.75 0 0 1 0-3.5h4.38a1.75 1.75 0 1 1 0 3.5z"/></svg>',
	vscode:
		'<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3v18l-9-7 3-2zM8 8l-3 3 3 3"/></svg>',
	tabs:
		'<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="18" height="14" rx="2"/><path d="M3 9h6V6m6 3h6"/><path d="M9 6h6v3H9z"/></svg>',
	terminal:
		'<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 9l3 3-3 3M13 15h4"/></svg>',
	textfile:
		'<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/></svg>',
	bookmark:
		'<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12v18l-6-4-6 4z"/></svg>',
};

const FEATURES = [
	{
		key: "snippet",
		title: "Code Snippets",
		desc: "Save reusable code with syntax highlighting and find it instantly.",
		icon: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
	},
	{
		key: "prompt",
		title: "AI Prompts",
		desc: "Stop losing your best prompts in chat histories. Stash them here.",
		icon: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.9 4.6 5 .4-3.8 3.3 1.2 4.9L12 14.6 7.7 16.2l1.2-4.9L5.1 8l5-.4z"/></svg>',
	},
	{
		key: "url",
		title: "Instant Search",
		desc: "Full-text search across content, tags, titles and types in seconds.",
		icon: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
	},
	{
		key: "command",
		title: "Commands",
		desc: "Keep that git incantation and shell one-liner one keystroke away.",
		icon: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>',
	},
	{
		key: "file",
		title: "Files & Docs",
		desc: "Upload context files and images so they're never buried again.",
		icon: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/></svg>',
	},
	{
		key: "note",
		title: "Collections",
		desc: "Group anything into collections — patterns, prep, boilerplates.",
		icon: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M4 12h16M4 17h10"/></svg>',
	},
];

const TYPE_COLORS = {
	snippet: "#3b82f6",
	prompt: "#f59e0b",
	command: "#06b6d4",
	note: "#22c55e",
	file: "#64748b",
	image: "#ec4899",
	url: "#6366f1",
};

function renderFeatures() {
	const grid = document.getElementById("features-grid");
	if (!grid) return;
	grid.innerHTML = FEATURES.map(
		(f) => `
		<article class="feature reveal" style="--c:${TYPE_COLORS[f.key]}">
			<span class="feature__icon">${f.icon}</span>
			<h3 class="feature__title">${f.title}</h3>
			<p class="feature__desc">${f.desc}</p>
		</article>`
	).join("");
}

const PREVIEW_TYPES = [
	{ key: "snippet", label: "Snippets", active: true },
	{ key: "prompt", label: "Prompts" },
	{ key: "command", label: "Commands" },
	{ key: "note", label: "Notes" },
	{ key: "file", label: "Files" },
	{ key: "image", label: "Images" },
	{ key: "url", label: "Links" },
];

const PREVIEW_COLLECTIONS = [
	{ name: "React Patterns", key: "snippet" },
	{ name: "AI Prompts", key: "prompt" },
	{ name: "Shell Cmds", key: "command" },
];

const PREVIEW_RECENT = [
	{ title: "useDebounce hook", key: "snippet" },
	{ title: "Code review prompt", key: "prompt" },
	{ title: "git reset --hard", key: "command" },
	{ title: "Deploy checklist", key: "note" },
];

function renderPreviewTypes() {
	const wrap = document.getElementById("previewTypes");
	if (!wrap) return;
	wrap.innerHTML = PREVIEW_TYPES.map(
		(t) =>
			`<span class="preview__type${t.active ? " preview__type--active" : ""}">
				<span class="preview__type-dot" style="--c:${TYPE_COLORS[t.key]}"></span>
				${t.label}
			</span>`
	).join("");
}

function renderPreviewCollections() {
	const wrap = document.getElementById("previewCollections");
	if (!wrap) return;
	wrap.innerHTML = PREVIEW_COLLECTIONS.map(
		(c) =>
			`<div class="preview__collection" style="--c:${TYPE_COLORS[c.key]}">
				<span class="preview__collection-name">${c.name}</span>
				<span class="preview__collection-meta"></span>
			</div>`
	).join("");
}

function renderPreviewRecent() {
	const wrap = document.getElementById("previewRecent");
	if (!wrap) return;
	wrap.innerHTML = PREVIEW_RECENT.map(
		(r) =>
			`<div class="preview__recent-row">
				<span class="preview__recent-dot" style="--c:${TYPE_COLORS[r.key]}"></span>
				<span class="preview__recent-title">${r.title}</span>
			</div>`
	).join("");
}

function setYear() {
	const el = document.getElementById("year");
	if (el) el.textContent = String(new Date().getFullYear());
}

function initNavScroll() {
	const nav = document.getElementById("nav");
	if (!nav) return;
	const onScroll = () => {
		nav.classList.toggle("is-scrolled", window.scrollY > 16);
	};
	onScroll();
	window.addEventListener("scroll", onScroll, { passive: true });
}

function initReveal() {
	const items = document.querySelectorAll(".reveal");
	if (!("IntersectionObserver" in window)) {
		items.forEach((el) => el.classList.add("is-visible"));
		return;
	}
	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					entry.target.classList.add("is-visible");
					observer.unobserve(entry.target);
				}
			});
		},
		{ threshold: 0.15 }
	);
	items.forEach((el) => observer.observe(el));
}

function initPricingToggle() {
	const toggle = document.getElementById("billingToggle");
	const amount = document.getElementById("proAmount");
	const period = document.getElementById("proPeriod");
	if (!toggle || !amount || !period) return;
	const opts = toggle.querySelectorAll(".toggle__opt");
	opts.forEach((opt) => {
		opt.addEventListener("click", () => {
			opts.forEach((o) => o.classList.remove("is-active"));
			opt.classList.add("is-active");
			if (opt.dataset.cycle === "yearly") {
				amount.textContent = "$72";
				period.textContent = "per year";
			} else {
				amount.textContent = "$8";
				period.textContent = "per month";
			}
		});
	});
}

function initChaos() {
	const field = document.getElementById("chaosField");
	if (!field) return;
	if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

	const keys = Object.keys(ICONS);
	const size = 52;
	const mouse = { x: -999, y: -999 };
	const sprites = keys.map((key) => {
		const el = document.createElement("div");
		el.className = "chaos-icon";
		el.innerHTML = ICONS[key];
		field.appendChild(el);
		return {
			el,
			x: 0,
			y: 0,
			vx: (Math.random() - 0.5) * 1.1,
			vy: (Math.random() - 0.5) * 1.1,
			rot: Math.random() * 360,
			vrot: (Math.random() - 0.5) * 0.6,
			phase: Math.random() * Math.PI * 2,
		};
	});

	function layout() {
		const w = field.clientWidth;
		const h = field.clientHeight;
		sprites.forEach((s) => {
			s.x = Math.random() * (w - size);
			s.y = Math.random() * (h - size);
		});
	}

	layout();
	window.addEventListener("resize", layout);

	field.addEventListener("mousemove", (e) => {
		const rect = field.getBoundingClientRect();
		mouse.x = e.clientX - rect.left;
		mouse.y = e.clientY - rect.top;
	});
	field.addEventListener("mouseleave", () => {
		mouse.x = -999;
		mouse.y = -999;
	});

	function tick(t) {
		const w = field.clientWidth;
		const h = field.clientHeight;
		sprites.forEach((s) => {
			const cx = s.x + size / 2;
			const cy = s.y + size / 2;
			const dx = cx - mouse.x;
			const dy = cy - mouse.y;
			const dist = Math.hypot(dx, dy);
			if (dist < 120 && dist > 0.01) {
				const force = (1 - dist / 120) * 0.9;
				s.vx += (dx / dist) * force;
				s.vy += (dy / dist) * force;
			}

			s.vx *= 0.985;
			s.vy *= 0.985;
			const speed = Math.hypot(s.vx, s.vy);
			const min = 0.35;
			if (speed < min && speed > 0.001) {
				s.vx = (s.vx / speed) * min;
				s.vy = (s.vy / speed) * min;
			}
			const max = 3.2;
			if (speed > max) {
				s.vx = (s.vx / speed) * max;
				s.vy = (s.vy / speed) * max;
			}

			s.x += s.vx;
			s.y += s.vy;

			if (s.x <= 0) {
				s.x = 0;
				s.vx = Math.abs(s.vx);
			} else if (s.x >= w - size) {
				s.x = w - size;
				s.vx = -Math.abs(s.vx);
			}
			if (s.y <= 0) {
				s.y = 0;
				s.vy = Math.abs(s.vy);
			} else if (s.y >= h - size) {
				s.y = h - size;
				s.vy = -Math.abs(s.vy);
			}

			s.rot += s.vrot;
			const scale = 1 + Math.sin(t / 700 + s.phase) * 0.06;
			s.el.style.transform = `translate(${s.x}px, ${s.y}px) rotate(${s.rot}deg) scale(${scale})`;
		});
		requestAnimationFrame(tick);
	}

	requestAnimationFrame(tick);
}

document.addEventListener("DOMContentLoaded", () => {
	setYear();
	renderFeatures();
	renderPreviewTypes();
	renderPreviewCollections();
	renderPreviewRecent();
	initNavScroll();
	initReveal();
	initPricingToggle();
	initChaos();
});
