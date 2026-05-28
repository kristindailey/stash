export function formatRetryAfter(seconds: number): string {
	if (seconds <= 0) return "a moment";
	if (seconds < 60) return `${seconds} second${seconds === 1 ? "" : "s"}`;
	const minutes = Math.ceil(seconds / 60);
	if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"}`;
	const hours = Math.ceil(minutes / 60);
	return `${hours} hour${hours === 1 ? "" : "s"}`;
}
