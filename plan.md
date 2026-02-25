# Homepage Minimal Redesign Plan

## Overview
Compress the homepage to deliver value faster. Cut scroll distance roughly in half by compacting the hero, establishing information hierarchy, and surfacing contact/CTA early.

---

## Step 1: Remove the quote from mobile nav
**File:** `src/components/layout/Header.astro`
- The Cory House quote renders inside the mobile nav overlay via `<ContactInfo />`. Pass `hideQuote` to suppress it there too, matching the footer behavior.
- This frees up space in the mobile menu and removes disconnected content.

## Step 2: Compact the hero section
**File:** `src/pages/index.astro`, `src/styles/index.css`

Current hero: 95vh tall, animated word-by-word "Hi there! I'm Nick", generic subtitle, scroll-down indicator.

**Changes:**
- Reduce `.landing` height from `95vh` to something like `70vh` or `min(70vh, 600px)` so content below is visible sooner.
- Consolidate the `<h1>` from four animated spans to a single line: **"Nick Cloud"** (or your preferred name format).
- Add a role subtitle below: **"Engineering Tech Lead / Full-Stack Developer"** as an `<h2>` or styled `<p>`.
- Replace the generic hobby text with a one-sentence professional hook, e.g. _"I build scalable web applications and lead engineering teams. Currently open to new opportunities."_ (you can customize this).
- Keep the GSAP fade-in animation but simplify — animate the whole block instead of word-by-word.
- Keep the `.slow-fade` mouse-tracking effect on the hook text (it's a nice touch).
- Remove or simplify the two decorative "moon" divs (optional — they're subtle at z-index:-5, low priority).
- Keep `<ScrollDown />` but it'll naturally be lower.

## Step 3: Add Contact CTA to the navigation
**File:** `src/components/layout/Header.astro`

- Add a "Get in Touch" or "Contact" button/link to the desktop nav (it already exists as a nav item but is plain text — style it as a subtle CTA button with border or accent color).
- The mobile nav already has `<ContactInfo />` which shows the email — this is fine.

## Step 4: Establish information hierarchy in the bento grid
**File:** `src/pages/index.astro`

Current: 4 BentoCards with roughly equal weight (2 span 2 cols, 2 span 1 col).

**Proposed tiered layout:**

### Tier 1 — Hero portfolio pieces (top row, prominent)
1. **"Engineering Tech Lead"** — Keep the Planets animation. Make this `lg:col-span-2` (promoted from 1).
2. **"Bin Packing Heuristics (Research Paper)"** — Keep the TaskScheduling viz. Keep at `lg:col-span-1` (demoted from 2) OR keep at 2 if it looks better. The interactive viz is compelling.

Actually, a better approach given the 3-col grid:
1. **"Engineering Tech Lead @ Betsson"** — `lg:col-span-2` (bigger card, top-left). This is the strongest credential.
2. **"Published Research: Bin Packing Heuristics"** — `lg:col-span-1` (top-right). Research paper is impressive but more niche.
3. **"chessnp.com"** — `lg:col-span-1` (bottom-left). The interactive chess board is a great demo.
4. **"Freelancing & Web Design"** — `lg:col-span-2` (bottom-right). Collapse the 10-image slider to show fewer images or make the card smaller.

This puts the Betsson role front and center.

## Step 5: Move tech stack icons out of main flow
**File:** `src/pages/index.astro`

The `<Planets />` component (orbiting tech logos) currently lives inside the Betsson BentoCard's `preTitle` slot. Options:
- **Keep it in the Betsson card** but ensure it doesn't dominate — it's already nicely contained and serves as a visual anchor for that card. This is probably fine as-is.
- If we want to reduce visual noise further: replace the animated orbits with a simple static row of tech icons inside the card.

**Recommendation:** Keep as-is for now. It's contained within one card and adds visual interest without being overwhelming.

## Step 6: Limit blog posts
**File:** `src/pages/index.astro`

Currently shows all posts (sliced from content collection). Limit to 2-3 latest posts with a "View all posts →" link.

Check current slice logic and cap at 3 if not already.

## Step 7: Compress the portfolio transition section
**File:** `src/pages/index.astro`, `src/styles/index.css`

The `.portofolio-details` section (Logo + "Portfolio and past projects" heading + paragraph) with GSAP scroll-triggered width expansion is a nice effect but adds scroll distance before the actual work appears.

**Options:**
- Remove this transition section entirely and go straight from hero to bento grid.
- OR significantly compress it — just the heading "Selected Work" without the logo and paragraph, with a simpler/faster scroll animation.

**Recommendation:** Remove the intermediate section. Go from hero → bento grid directly. The `<Logo />` with blur glow and the expanding-width animation adds visual flair but delays content delivery.

---

## Summary of file changes

| File | Changes |
|------|---------|
| `src/pages/index.astro` | Compact hero, remove portfolio-details transition section, reorder/resize bento cards, limit blog posts to 3 |
| `src/styles/index.css` | Reduce `.landing` height, simplify hero title styles, remove `.portofolio-details` styles (or keep for reference) |
| `src/components/layout/Header.astro` | Style "Contact" nav link as CTA button, pass `hideQuote` to ContactInfo in mobile nav |

## What we're keeping
- The dark theme and overall aesthetic
- `<SceneController />` canvas background (it's subtle and branded)
- GSAP animations (simplified for hero)
- `.slow-fade` mouse-tracking effect
- The bento grid layout concept
- All four portfolio pieces (just reweighted)
- Blog posts section (capped at 3)
- Footer as-is

## What we're removing/reducing
- The quote (hidden in mobile nav)
- The "Hi there! I'm Nick" multi-word animation → single compact hero
- The portfolio transition section (Logo + expanding width animation)
- Generic hobby subtitle text
- Scroll distance (~50% reduction)
