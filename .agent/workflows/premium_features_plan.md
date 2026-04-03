---
description: Implementation plan for Subscriptions, Payments, Coupons, and Advanced Session Integrity.
---

# Premium Features & Business Logic Implementation

This workflow outlines the technical steps to implement the subscription model, payment infrastructure, and security enhancements requested.

## Phase 1: Database Schema Expansion

We need to introduce models for commerce and subscriptions that don't currently exist.

1.  **Add Commerce Models**

    - [ ] Create `Plan` model (e.g., Monthly/Yearly, price, features).
    - [ ] Create `Subscription` model (User relation, start/end dates, status, auto-renew).
    - [ ] Create `Transaction` model (Provider agnostic: reference, amount, currency, status, metadata).
    - [ ] Create `Coupon` model (Code, Type, Value, MaxUses, UsageCount, Expiry).

2.  **Enhance User & Security Models**
    - [ ] Add `Device` model or enhance `Session` to track `deviceId`, `ipAddress`, `lastActive`.
    - [ ] Add `deviceLimit` to `User` or `Plan`.

## Phase 2: The "Payment Interface" (Strategy Pattern)

To ensure future compatibility (Stripe, Flutterwave), we will use an Interface/Adapter pattern.

3.  **Core Payment Architecture**
    - [ ] Create `src/lib/payment/types.ts`: Define `PaymentProvider` interface (initialize, verify, webhook).
    - [ ] Implement `src/lib/payment/paystack.ts`: Concrete implementation for Paystack.
    - [ ] Create `src/lib/payment/service.ts`: Factory to get the correct provider.

## Phase 3: The Restricted Enrollment Logic

The core requirement: "Single active course at a time."

4.  **Enrollment Controller**
    - [ ] Create `EnrollmentService.enroll(userId, courseId)`.
    - [ ] **Logic Check**: `SELECT count(*) FROM enrollments WHERE userId = ? AND status = 'ACTIVE'`.
    - [ ] **Condition**: If count > 0, throw error "Please complete your current course first."
    - [ ] **Transaction**: Create Enrollment + Log Activity.

## Phase 4: Session Integrity (Anti-Sharing)

5.  **Strict Session Management**
    - [ ] **Concurrent Session Logic**: When `auth/login` occurs, check for existing active sessions.
      - Strategy: _Aggressive_ - Invalidate all previous sessions (Single Device).
      - Strategy: _Fingerprint_ - Generate a unique browser fingerprint. Store in DB. If session token matches but fingerprint differs -> Fraud alert/Logout.
    - [ ] **Middleware Check**: Ensure strict `max-age` on sessions and frequent re-validation.

## Phase 5: Coupon System

6.  **Coupon Logic**
    - [ ] Implement `validateCoupon(code, userId, context)`.
    - [ ] Handle "Single User" (check DB if this user already used it).
    - [ ] Handle "Platform Wide" vs "Specific Plan".

## Future Roadmap (Revenue & Engagement)

- **Corporate/Team Plans**: Allow a manager to buy 5 seats.
- **Gift Cards**: Purchase subscription for a friend (generating a unique 100% off coupon code).
- **Affiliate System**: Users generate referral links for % commission (uses Coupon logic).
