import type { APIRoute } from "astro";
import { SITE_URL } from "../config";

const PAGES = ["/"];

export const GET: APIRoute = () => {
  const lastmod = new Date().toISOString().slice(0, 10);
  const urls = PAGES.map(
    (path) => `  <url>
    <loc>${new URL(path, SITE_URL).href}</loc>
    <lastmod>${lastmod}</lastmod>
  </url>`,
  ).join("\n");

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`,
    { headers: { "Content-Type": "application/xml; charset=utf-8" } },
  );
};
