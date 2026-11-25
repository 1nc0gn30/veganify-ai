import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');

test('index.html has valid SEO, OpenGraph, Twitter, and AEO JSON-LD @graph', () => {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

  assert.match(html, /<meta name="viewport" content="width=device-width, initial-scale=1\.0"/);
  assert.match(html, /property="og:title"/);
  assert.match(html, /property="og:description"/);
  assert.match(html, /property="og:url"/);
  assert.match(html, /property="og:type" content="website"/);
  assert.match(html, /property="og:image" content="https:\/\/veganify-ai\.nealfrazier\.tech\/og-image\.png"/);
  assert.match(html, /name="twitter:card" content="summary_large_image"/);
  assert.match(html, /name="twitter:site" content="@1nc0gn30"/);
  assert.match(html, /name="twitter:creator" content="@1nc0gn30"/);

  // Zero hidden waitlist form
  assert.doesNotMatch(html, /name="waitlist"/i);

  // Parse JSON-LD graph
  const ldMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  assert.ok(ldMatch, 'Missing JSON-LD script block');
  const parsed = JSON.parse(ldMatch[1]);
  assert.ok(Array.isArray(parsed['@graph']), 'JSON-LD must contain @graph array');

  const webApp = parsed['@graph'].find((n) => n['@type'] === 'WebApplication');
  const faq = parsed['@graph'].find((n) => n['@type'] === 'FAQPage');
  assert.ok(webApp, 'JSON-LD @graph must declare WebApplication');
  assert.ok(faq && Array.isArray(faq.mainEntity) && faq.mainEntity.length >= 2, 'JSON-LD @graph must declare FAQPage with 2+ Q&As');
  assert.equal(webApp.offers?.price, '0');
});

test('public/og-image.png exists and is a valid 1200x630 PNG', () => {
  const pngPath = path.join(ROOT, 'public/og-image.png');
  assert.ok(fs.existsSync(pngPath), 'public/og-image.png must exist');
  const buf = fs.readFileSync(pngPath);
  // PNG signature
  assert.deepEqual(Array.from(buf.subarray(0, 8)), [137, 80, 78, 71, 13, 10, 26, 10]);
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  assert.equal(width, 1200, `Expected OG image width 1200, got ${width}`);
  assert.equal(height, 630, `Expected OG image height 630, got ${height}`);
});

test('robots.txt allows frontier crawlers with 0 crawl delay and declares sitemap', () => {
  const robots = fs.readFileSync(path.join(ROOT, 'public/robots.txt'), 'utf8');
  for (const agent of ['*', 'Googlebot', 'GPTBot', 'ClaudeBot', 'PerplexityBot', 'Applebot']) {
    assert.ok(robots.includes(`User-agent: ${agent}`), `Missing crawler directive for ${agent}`);
  }
  assert.match(robots, /Crawl-delay:\s*0/);
  assert.match(robots, /Sitemap:\s*https:\/\/veganify-ai\.nealfrazier\.tech\/sitemap\.xml/);
});

test('sitemap.xml has canonical URL and lastmod timestamp', () => {
  const sitemap = fs.readFileSync(path.join(ROOT, 'public/sitemap.xml'), 'utf8');
  assert.match(sitemap, /<loc>https:\/\/veganify-ai\.nealfrazier\.tech\/<\/loc>/);
  assert.match(sitemap, /<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/);
});

test('netlify.toml declares dist publish, SPA fallback, and security headers', () => {
  const toml = fs.readFileSync(path.join(ROOT, 'netlify.toml'), 'utf8');
  assert.match(toml, /publish\s*=\s*"dist"/);
  assert.match(toml, /from\s*=\s*"\/\*"/);
  assert.match(toml, /to\s*=\s*"\/index\.html"/);
  assert.match(toml, /status\s*=\s*200/);
  assert.match(toml, /X-Frame-Options\s*=\s*"SAMEORIGIN"/);
  assert.match(toml, /X-Content-Type-Options\s*=\s*"nosniff"/);
  assert.match(toml, /Referrer-Policy\s*=\s*"strict-origin-when-cross-origin"/);
});

test('App includes open-access Buy Us a Coffee support and zero paywalls, waitlists, or DePay links', () => {
  const appSrc = fs.readFileSync(path.join(ROOT, 'src/App.tsx'), 'utf8');
  assert.ok(appSrc.includes('https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X'), 'Missing Stripe coffee link');
  assert.ok(appSrc.includes('GG2eQbVh8ut1BK6j1A2tz7pSySdLpD38BgyEhGcxdXoK'), 'Missing Solana tip address');
  assert.ok(appSrc.includes('Neal Frazier Tech'), 'Missing Neal Frazier Tech attribution');
  assert.doesNotMatch(appSrc, /depay/i);
  assert.doesNotMatch(appSrc, /waitlist/i);
  assert.doesNotMatch(appSrc, /openfoodfacts|themealdb/i);
});
