const fs = require('fs');
const path = require('path');

const BASE = 'https://khotwa-weld.vercel.app';
const routes = [
  { path: '/', priority: 1.0 },
  { path: '/ai-tutor', priority: 0.9 },
  { path: '/summarizer', priority: 0.9 },
  { path: '/quiz', priority: 0.8 },
  { path: '/writing', priority: 0.8 },
  { path: '/citation', priority: 0.8 },
  { path: '/cv', priority: 0.9 },
  { path: '/gpa', priority: 0.9 },
  { path: '/math', priority: 0.8 },
  { path: '/latex', priority: 0.7 },
  { path: '/schedule', priority: 0.8 },
  { path: '/focus', priority: 0.7 },
  { path: '/budget', priority: 0.8 },
  { path: '/pdf-merge', priority: 0.8 },
  { path: '/pdf-pages', priority: 0.8 },
  { path: '/pdf-protect', priority: 0.8 },
  { path: '/ocr', priority: 0.8 },
  { path: '/convert', priority: 0.8 },
  { path: '/pdf-watermark', priority: 0.7 },
  { path: '/image-tools', priority: 0.7 },
  { path: '/majors', priority: 0.7 },
  { path: '/scholarships', priority: 0.7 },
  { path: '/projects', priority: 0.6 },
  { path: '/notes', priority: 0.7 },
  { path: '/forums', priority: 0.6 },
  { path: '/market', priority: 0.6 },
  { path: '/guide', priority: 0.6 },
];

function buildSitemap() {
  const urlset = routes.map(r => {
    const loc = `${BASE}${r.path}`;
    const changefreq = 'weekly';
    const priority = r.priority.toFixed(1);
    return `  <url>\n    <loc>${loc}</loc>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
  }).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlset}\n</urlset>\n`;

  const outDir = path.join(__dirname, '..', 'public');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'sitemap.xml'), xml, 'utf8');
  console.log('Generated public/sitemap.xml');
}

buildSitemap();
