# Tech Hill Commerce Implementation Plan

This document outlines the strategic plan to transition Tech Hill from a free enrollment model to a premium, revenue-generating platform. It incorporates user journeys, technical requirements, and debt resolution.

## 1. User Journeys

### A. Journey: Free Course Enrollment

- **Goal:** Allow students to access "Introductory" content without barriers.
- **Workflow:**
  1.  **Admin:** Publishes course with `price: 0`.
  2.  **Student:** Views course page $\rightarrow$ clicks "Enroll Free".
  3.  **System:** Verifies $0 price $\rightarrow$ creates `Enrollment(status: ACTIVE)` $\rightarrow$ redirects to first lesson.
- **Certificate Note:** Admin can configure if the certificate is free or paid. If paid, it defaults to **2000 NGN** but is customizable per course.
- **Status:** [ ] Ready for Implementation

---

### B. Journey: Discounted Purchase (Coupons & Flash Sales)

- **Goal:** Drive sales through targeted discounts or platform-wide seasonal events.
- **Workflow (Coupons):**
  1.  **Admin:** Generates coupon (e.g., `SUMMER50`).
  2.  **Student:** Enters code at checkout $\rightarrow$ system validates.
- **Workflow (Flash Sales):**
  1.  **Admin:** Selects specific courses $\rightarrow$ sets discount % $\rightarrow$ sets start/end time.
  2.  **Student:** Sees "Flash Sale" banner and timer on course card $\rightarrow$ price is automatically reduced during the window.
- **Strategic Note:** We will support **both** systems. Flash sales for platform-wide excitement and Coupons for marketing/referrals.
- **Status:** [ ] Waiting on Promotion Engine Schema

---

### C. Journey: Paid Enrollment with Preview Teasers

- **Goal:** monetise premium content while reducing purchase anxiety.
- **Workflow:**
  1.  **Student:** Clicks on a paid course.
  2.  **Student:** Able to access lessons marked as **"Free Preview"** without paying or enrolling.
  3.  **Student:** Prompted to "Buy Now to Unlock Full Course" when reaching a locked lesson.
  4.  **System:** Redirects to checkout $\rightarrow$ grants full access upon payment.
- **Status:** [ ] Update Content Logic

---

### D. Journey: Paid Certificate Issuance

- **Goal:** Additional revenue stream for free or paid courses.
- **Workflow:**
  1.  **Student:** Completes course modules.
  2.  **System:** Checks `Course.certificatePrice`.
  3.  **System:** If `> 0`, shows "Claim Certificate" button (payment required).
  4.  **Student:** Pays for certificate $\rightarrow$ System generates and allows download.
- **Status:** [ ] Missing Certificate Transaction Type

---

## 2. Technical Debt & Requirements

### Phase 1: Database Foundation (Prisma)

- [x] **Transaction Model Extension:**
  - Add `courseId` (Optional) to link payments directly to courses. ✅
  - Add `CERTIFICATE_PURCHASE` to `TransactionType`. ✅
- [x] **Promotion Engine:** Create `FlashSale` model (discountPercentage, startTime, endTime, relatedCourses). ✅
- [x] **Content Control:** Add `isPreview: Boolean` to `Topic` model. ✅
- [x] **Certificate Config:** Add `certificatePrice: Decimal` and `isCertificateFree: Boolean` to `Course` model. ✅
- [x] **Coupon Logic:** Add `restrictedToCourses: Course[]` and `maxUsesPerUser` to the `Coupon` model. ✅

### Phase 2: Service Layer & Logic

- [x] **Content Protection Middleware:** Allow GET requests to `Topic` content if `isPreview` is true, even if unauthorized/unpaid. ✅
- [x] **`CertificateService`:** Add logic to block generation if `certificatePrice > 0` and no matching transaction exists. ✅
- [x] **`PaymentService`:** Implement Strategy Pattern to support Paystack (Priority) and Stripe (Future). ✅
- [x] **Promotion Hook:** Create a utility function `getCurrentPrice(course)` that calculates price based on active flash sales. ✅

### Phase 3: Frontend & UI (Premium UX)

- [ ] **Lesson List UI:** Add "Free Preview" badges to previewable topics.
- [ ] **Checkout System:** Atomic checkout component with real-time price calculation (Price - Discount + Tax).
- [ ] **Flash Sale UI:** Add countdown timers and "was $X, now $Y" price display.
- [ ] **Admin Dashboard:** Interface to manage Flash Sales and per-course certificate pricing.

---

## 3. Implementation Log & Discussion

| Date       | Action Item           | Status | Notes                                         |
| :--------- | :-------------------- | :----- | :-------------------------------------------- |
| 2026-01-21 | Plan Created          | ✅     | Initial draft                                 |
| 2026-01-26 | User Notes Integrated | ✅     | Added Certificates, Flash Sales, and Previews |

### General Feedback / Inputs

> Use this section to add any over-arching thoughts or requests for changes to the strategy.
