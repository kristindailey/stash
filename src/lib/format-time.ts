export function formatRelativeTime(date: string | Date): string {
	const then = new Date(date).getTime();
	const diffSec = Math.max(0, Math.floor((Date.now() - then) / 1000));
	if (diffSec < 60) return "just now";
	const diffMin = Math.floor(diffSec / 60);
	if (diffMin < 60) return `${diffMin} ${diffMin === 1 ? "minute" : "minutes"} ago`;
	const diffHr = Math.floor(diffMin / 60);
	if (diffHr < 24) return `${diffHr} ${diffHr === 1 ? "hour" : "hours"} ago`;
	const diffDay = Math.floor(diffHr / 24);
	if (diffDay < 30) return `${diffDay} ${diffDay === 1 ? "day" : "days"} ago`;
	const diffMo = Math.floor(diffDay / 30);
	if (diffMo < 12) return `${diffMo} ${diffMo === 1 ? "month" : "months"} ago`;
	const diffYr = Math.floor(diffMo / 12);
	return `${diffYr} ${diffYr === 1 ? "year" : "years"} ago`;
}
