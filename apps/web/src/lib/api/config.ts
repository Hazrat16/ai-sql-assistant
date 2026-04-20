export function getApiBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";
  return base;
}

export function isApiConfigured(): boolean {
  return getApiBaseUrl().length > 0;
}
