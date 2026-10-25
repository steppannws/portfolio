/** Prefix a public-dir path with Vite's base URL (`/` on the custom domain). */
export function asset(path: string): string {
  return import.meta.env.BASE_URL + path;
}
