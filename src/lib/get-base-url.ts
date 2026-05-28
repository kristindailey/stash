export function getBaseUrl(request: Request): string {
	if (process.env.AUTH_URL) return process.env.AUTH_URL;
	if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
	return new URL(request.url).origin;
}
