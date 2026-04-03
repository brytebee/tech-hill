# Tech Hill Design System
> Extracted from the `/` premium landing page redesign.
> Use this as the canonical reference when designing or redesigning any page, layout, or component.

---

## 🎨 Color Palette

### Dark Mode (Primary — Pages use `class="dark"` on root)

| Token | HSL Value | Hex Approx | Usage |
|---|---|---|---|
| `--background` | `222 47% 5%` | `#080e1a` | Page background |
| `--card` | `222 40% 8%` | `#0d152a` | Card surfaces |
| `--surface-2` | `222 35% 11%` | `#121c30` | Elevated surface |
| `--border` | `222 30% 14%` | `#172038` | Borders, dividers |
| `--foreground` | `210 30% 96%` | `#f0f4f8` | Body text |
| `--muted-foreground` | `215 20% 55%` | `#768aab` | Subtext, labels |
| `--primary` | `213 94% 62%` | `#3b9eff` | Primary actions, links, glows |

### Brand Accent
| Name | Value | Usage |
|---|---|---|
| Blue 400 | `#60a5fa` | Gradient text start |
| Indigo 500 | `#818cf8` | Gradient text end |
| Blue 600 | `#2563eb` | Primary button bg |
| Blue 500 | `#3b82f6` | Hover state |

### Light Mode (dashboard/internal pages)
| Token | HSL Value | Usage |
|---|---|---|
| `--background` | `220 30% 97%` | Light page bg |
| `--foreground` | `222 47% 8%` | Dark body text |
| `--primary` | `221 83% 53%` | Actions |
| `--border` | `220 20% 90%` | Dividers |

---

## 🔤 Typography

**Font Family:** `Inter` (Google Fonts, via Next.js `next/font/google`)

| Role | Size | Weight | Class |
|---|---|---|---|
| Hero H1 | `5xl–8xl` | `900` (black) | `font-black tracking-tight leading-[1.05]` |
| Section H2 | `3xl–4xl` | `800` (extrabold) | `font-extrabold tracking-tight` |
| Feature H3 | `lg` | `700` (bold) | `font-bold` |
| Body | `base–lg` | `400` | `leading-relaxed text-slate-400` |
| Caption/Label | `xs–sm` | `600` (semibold) | `uppercase tracking-widest text-blue-400` |
| CTA Button | `base` | `600` (semibold) | `font-semibold` |

---

## 🧩 Reusable CSS Classes (globals.css)

| Class | Effect |
|---|---|
| `.gradient-text` | Blue→Purple text gradient |
| `.gradient-text-blue` | Blue400→Indigo400 text gradient |
| `.glass` | Frosted glass background (70% opacity + blur) |
| `.glass-card` | Card frosted glass with box-shadow |
| `.glass-nav` | Navbar frosted glass (80% opacity + saturate) |
| `.glow-blue` | Large blue glow shadow on element |
| `.glow-blue-sm` | Subtle small blue glow |
| `.btn-glow` | Hover: lift + blue glow shadow |
| `.grid-overlay` | Subtle dot/grid background texture |
| `.announcement-badge` | Pill badge with blue tint + border |
| `.animate-fade-in` | Fade in opacity (0.6s) |
| `.animate-fade-in-up` | Fade in from below (0.7s) |
| `.animate-float` | Gentle vertical float loop |
| `.animate-orb` | Slow pulse + scale for bg orbs |
| `.delay-{n}` | Animation delays: 100, 200, 300, 500, 700, 1000ms |

---

## 📐 Layout & Spacing

| Pattern | Usage |
|---|---|
| `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` | Standard page container |
| `max-w-5xl mx-auto px-4 sm:px-6` | Narrower content sections |
| `max-w-3xl mx-auto px-4 text-center` | CTA / testimonial sections |
| Section vertical padding | `py-24` or `py-28` |
| Hero top padding | `pt-16 pb-24` (to clear fixed nav) |
| Grid gap | `gap-5` (cards), `gap-8` (stat row) |

---

## 🏠 Page Sections (Landing Page Pattern)

1. **Header** — Fixed, scroll-aware, glassmorphism at scroll > 12px
2. **Hero** — Centered, dark, radial glow orbs, grid overlay, animated badge
3. **Social Proof Bar** — Metric stats across 4 columns, border-y
4. **Why Section** — 2–3 col feature card grid
5. **Curriculum/Paths** — Side-by-side sticky copy + cards grid
6. **Testimonial** — Centered blockquote with stars + avatar
7. **Final CTA** — Centered, radial glow bg, two buttons
8. **Footer** — 5-col grid, brand + 3 link groups

---

## 🎛️ Component Patterns

### Buttons
```tsx
// Primary
<Button className="btn-glow bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-500/25 h-13 px-8 font-semibold">
  Get started free
</Button>

// Secondary (outline)
<Button variant="outline" className="border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-700/60 hover:text-white rounded-xl backdrop-blur-sm">
  Explore Courses
</Button>

// Ghost
<Button variant="ghost" className="text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl">
  View Pricing
</Button>
```

### Feature Card (dark with gradient top border on hover)
```tsx
<div className="group relative p-px rounded-2xl bg-gradient-to-b from-slate-700/40 to-transparent hover:from-blue-500/30 transition-all duration-500">
  <div className="bg-slate-900/90 rounded-2xl p-7 h-full">
    {/* Icon, title, description */}
  </div>
</div>
```

### Announcement Badge
```tsx
<div className="inline-flex items-center gap-2 announcement-badge rounded-full px-4 py-1.5 text-sm font-medium">
  <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-ping" />
  Label text here
  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
</div>
```

### Background Orbs
```tsx
<div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 
     w-[800px] h-[800px] rounded-full bg-blue-600/12 blur-[120px] animate-orb" />
```

### Section Label
```tsx
<p className="text-sm font-semibold text-blue-400 uppercase tracking-widest mb-3">
  Section Name
</p>
```

---

## 🧭 Navigation (PublicHeader)

- **Behavior:** `fixed`, scroll-aware → adds `.glass-nav` after 12px scroll
- **Wordmark:** Icon (gradient box with BookOpen) + "Tech Hill." with blue dot
- **Links:** Courses, Pricing (subdued `text-slate-400`, hover `text-white`)
- **CTAs:** "Log in" (text), "Get started free" (blue button with glow)
- **Mobile:** Hamburger → full-width dropdown with same links

---

## 📋 Page Checklist (When Designing New Pages)

- [ ] Page root uses `class="dark"` if it's a marketing/public page
- [ ] Page bg is `bg-[#080e1a]` or uses `bg-background` token
- [ ] Hero has `pt-16` or `pt-24` to account for fixed nav height
- [ ] Headings use `font-black tracking-tight` for H1, `font-extrabold` for H2
- [ ] Subtext uses `text-slate-400` dark or `text-slate-600` light
- [ ] Primary CTAs use `.btn-glow` + blue gradient
- [ ] Key sections have a radial glow orb in the background
- [ ] SEO: `export const metadata = { title, description }` on every page
- [ ] Mobile responsive: all grids collapse to `grid-cols-1` on `sm:`
- [ ] Footer reused from landing page (or adapted from same template)
