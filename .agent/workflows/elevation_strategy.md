---
description: Strategic plan to elevate Tech Hill to a premium, silicon-valley tier educational platform.
---

# Elevation Strategy: From MVP to Premium

This workflow outlines the strategic steps to refactor the codebase for performance, security, and high-end aesthetics.

## Phase 1: Foundation & Architecture (The "Senior Dev" Refactor)

This phase focuses on code correctness, performance, and security.

1.  **Establish Service Layer Pattern**

    - [ ] Identify all "API Loopback" calls in Server Components.
    - [ ] Create/Refactor Service files (e.g., `src/lib/services/dashboard.service.ts`) to handle DB logic.
    - [ ] Replace `fetch` calls in `src/app/(dashboard)/admin/page.tsx` with direct service calls.

2.  **Fortify Security**
    - [ ] Review `middleware.ts` (or create if missing) to handle role-based route protection.
    - [ ] Remove client-side redirect logic from `AdminLayout.tsx`.
    - [ ] Ensure all Admin Server Components check permissions before data fetching.

## Phase 2: The "Premium" Design System (The "UX Designer" Facelift)

This phase focuses on creating a visually stunning, scalable UI.

3.  **Design Token Architecture (Tailwind 4)**

    - [ ] Define a sophisticated color palette in `src/app/globals.css` using HSL variables (enable precise control over opacity/glassmorphism).
    - [ ] Define semantic tokens: `--layer-1`, `--layer-2`, `--border-subtle`, `--accent-glow`.
    - [ ] Configure `font-family` to use a premium variable font (Inter or Geist).

4.  **Component "Glow Up"**
    - [ ] Refactor `AdminLayout` sidebar to use glassmorphism, active state markers, and subtle hover animations.
    - [ ] Redesign Dashboard Cards: Remove basic borders, add subtle shadows, inner glows, and gradient text for metrics.
    - [ ] Add "Micro-interactions": subtle scale effects on click, fade-ins on page load.

## Phase 3: Data & Reliability

5.  **Truth in Data**
    - [ ] Replace hardcoded "System Status" with a real (or at least honest) implementation.

## Execution Guide

To run this workflow, we will iterate through phases.

- Start with **Phase 1** to ensure the app is stable before applying complex styles.
- Move to **Phase 2** for the visual overhaul.
