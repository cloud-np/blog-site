# SEO Plan

## Critical

- [x] 1. Add unique `description` to each blog post
  - Add `description` field to content schema in `config.ts`
  - Add `description` to each post's frontmatter
  - Pass `description` through the `seo` object in `blog/[slug].astro`

- [ ] 2. Wire up Article JSON-LD
  - Pass `section` (category) and `publishedTime` from `blog/[slug].astro` to `BaseHead`
  - Fix author `@type` from "Organization" to "Person" in the Article schema

- [ ] 3. Fix RSS feed
  - Install `@astrojs/rss`
  - Implement the feed in `rss.xml.ts`
  - Update `<link rel="alternate">` href in `BaseHead.astro` to the correct path

- [ ] 4. Fix `og:type` for blog posts
  - Pass `section` prop so posts render as `og:type="article"` (covered by #2)

## High

- [ ] 5. Fix multiple `<h1>` tags on homepage
  - Wrap animated words in a single `<h1>` with `<span>` children

- [ ] 6. Fix broken font path in `global.css`
  - Correct `inter-v19-greek_latin-regular-500.woff2` to actual filename

- [ ] 7. Remove `/privacy-policy/` from sitemap or remove its `noindex`

- [ ] 8. Fix Article schema author type (covered by #2)

## Medium

- [ ] 9. Add font preloading in `BaseHead.astro`

- [ ] 10. Add `datetime` attribute to `<time>` element in `blog/[slug].astro`

- [ ] 11. Make OG image dimensions dynamic or remove hardcoded values

- [ ] 12. Fix homepage heading skip (`<h4>` for "Latest Posts")

- [ ] 13. Add BreadcrumbList JSON-LD for blog posts

- [ ] 14. Add apple-touch-icon PNG (180x180)

- [ ] 15. Fix default language mismatch (`defaultLang` is 'el' but content is English)
