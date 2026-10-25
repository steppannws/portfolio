/** Prefix a public-dir path with Vite's base URL (`/portfolio/` in production). */
export function asset(path: string): string {
  return import.meta.env.BASE_URL + path;
}
