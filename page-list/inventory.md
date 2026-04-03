# Tech Hill – Page & Component Inventory

> Design status tracking for all layouts, pages, modals, forms, and components.
> Update the `Status` column as each item is reviewed or redesigned.

**Status Key:**
| Badge | Meaning |
|---|---|
| `✅ Done` | Reviewed & redesigned to premium standard |
| `🔄 Updated` | Partially improved, needs full polish |
| `⚠️ Needs Work` | Functional but below quality bar |
| `🚫 Placeholder` | Boilerplate / stub, not yet built |
| `🔒 Admin Only` | Internal tool — lower priority |

---

## 🗂️ Layouts

| File | Route Scope | Status | Notes |
|---|---|---|---|
| `src/app/layout.tsx` | Root | `✅ Done` | Inter font, dark class on html, providers |
| `src/app/(public)/layout.tsx` | Public | `⚠️ Needs Work` | Thin wrapper only |
| `src/app/pricing/layout.tsx` | `/pricing` | `⚠️ Needs Work` | Check if redundant with page |
| `src/components/layout/PublicHeader.tsx` | All public pages | `✅ Done` | Scroll-aware glass nav, icon wordmark, mobile menu, glow CTA |
| `src/components/layout/AdminLayout.tsx` | `/admin/*` | `🔒 Admin Only` | Sidebar + nav |
| `src/components/layout/ManagerLayout.tsx` | `/manager/*` | `🔒 Admin Only` | Sidebar + nav |
| `src/components/layout/StudentLayout.tsx` | `/student/*` | `✅ Done` | Premium glassmorphic sidebar + responsive header w/ ThemeToggle |

---

## 🌐 Public Pages

| File | URL | Status | Notes |
|---|---|---|---|
| `src/app/page.tsx` | `/` | `✅ Done` | **Silicon Valley grade** — hero with glow orbs, social proof, 6-feature grid, curriculum paths, testimonial, CTA, 5-col footer |
| `src/app/pricing/page.tsx` | `/pricing` | `✅ Done` | Tiered cards, toggle, gradient background |
| `src/components/pricing/PricingClient.tsx` | `/pricing` (client) | `✅ Done` | Monthly/yearly toggle, glassmorphism |
| `src/app/payment/success/page.tsx` | `/payment/success` | `⚠️ Needs Work` | Basic — needs visual confirmation UI |
| `src/app/payment/failed/page.tsx` | `/payment/failed` | `⚠️ Needs Work` | Basic — needs retry + support CTA |

---

## 🔐 Auth Pages

| File | URL | Status | Notes |
|---|---|---|---|
| `src/app/(auth)/login/page.tsx` | `/login` | `✅ Done` | Upgraded to Silicon Valley glassmorphism full-page layout |
| `src/app/(auth)/register/page.tsx` | `/register` | `✅ Done` | Upgraded to Silicon Valley glassmorphism full-page layout |
| `src/app/(auth)/forgot-password/page.tsx` | `/forgot-password` | `⚠️ Needs Work` | Stub — needs full flow |
| `src/components/forms/login-form.tsx` | `/login` | `✅ Done` | Glowing input styling, unified typography |
| `src/components/forms/register-form.tsx` | `/register` | `✅ Done` | Glowing input styling, unified typography |

---

## 🎓 Student Pages

| File | URL | Status | Notes |
|---|---|---|---|
| `src/app/(dashboard)/student/page.tsx` | `/student` | `🔄 Updated` | Dashboard — has PaymentSuccessToast |
| `src/app/(dashboard)/student/courses/page.tsx` | `/student/courses` | `🔄 Updated` | Flash sale badges + corrected pricing |
| `src/app/(dashboard)/student/courses/[courseId]/page.tsx` | `/student/courses/:id` | `🔄 Updated` | Pricing, flash sale badge updated |
| `src/app/(dashboard)/student/topics/[topicId]/page.tsx` | `/student/topics/:id` | `⚠️ Needs Work` | Topic viewer — functional |
| `src/app/(dashboard)/student/quiz/[quizId]/page.tsx` | `/student/quiz/:id` | `⚠️ Needs Work` | Quiz interface — functional |
| `src/app/(dashboard)/student/quiz/[quizId]/results/page.tsx` | `/student/quiz/:id/results` | `⚠️ Needs Work` | Results view — functional |

---

## 🔴 Admin Pages

| File | URL | Status | Notes |
|---|---|---|---|
| `src/app/(dashboard)/admin/page.tsx` | `/admin` | `🔒 Admin Only` | Dashboard overview |
| `src/app/(dashboard)/admin/courses/page.tsx` | `/admin/courses` | `🔒 Admin Only` | Course list |
| `src/app/(dashboard)/admin/courses/create/page.tsx` | `/admin/courses/create` | `🔒 Admin Only` | Create form |
| `src/app/(dashboard)/admin/courses/[courseId]/page.tsx` | `/admin/courses/:id` | `🔒 Admin Only` | Course detail |
| `src/app/(dashboard)/admin/courses/[courseId]/edit/page.tsx` | `/admin/courses/:id/edit` | `🔒 Admin Only` | Edit form |
| `src/app/(dashboard)/admin/courses/[courseId]/modules/create/page.tsx` | `/admin/courses/:id/modules/create` | `🔒 Admin Only` | Add module |
| `src/app/(dashboard)/admin/modules/[moduleId]/page.tsx` | `/admin/modules/:id` | `🔒 Admin Only` | Module detail |
| `src/app/(dashboard)/admin/modules/[moduleId]/edit/page.tsx` | `/admin/modules/:id/edit` | `🔒 Admin Only` | Edit module |
| `src/app/(dashboard)/admin/modules/[moduleId]/topics/create/page.tsx` | `/admin/modules/:id/topics/create` | `🔒 Admin Only` | Add topic |
| `src/app/(dashboard)/admin/topics/[topicId]/page.tsx` | `/admin/topics/:id` | `🔒 Admin Only` | Topic detail |
| `src/app/(dashboard)/admin/topics/[topicId]/edit/page.tsx` | `/admin/topics/:id/edit` | `🔒 Admin Only` | Edit topic |
| `src/app/(dashboard)/admin/topics/[topicId]/quizzes/create/page.tsx` | `/admin/topics/:id/quizzes/create` | `🔒 Admin Only` | Add quiz |
| `src/app/(dashboard)/admin/quizzes/[quizId]/page.tsx` | `/admin/quizzes/:id` | `🔒 Admin Only` | Quiz detail |
| `src/app/(dashboard)/admin/quizzes/[quizId]/edit/page.tsx` | `/admin/quizzes/:id/edit` | `🔒 Admin Only` | Edit quiz |
| `src/app/(dashboard)/admin/quizzes/[quizId]/builder/page.tsx` | `/admin/quizzes/:id/builder` | `🔒 Admin Only` | Drag-and-drop builder |
| `src/app/(dashboard)/admin/quizzes/[quizId]/questions/page.tsx` | `/admin/quizzes/:id/questions` | `🔒 Admin Only` | Question list |
| `src/app/(dashboard)/admin/users/page.tsx` | `/admin/users` | `🔒 Admin Only` | User list |
| `src/app/(dashboard)/admin/users/create/page.tsx` | `/admin/users/create` | `🔒 Admin Only` | Create user |
| `src/app/(dashboard)/admin/users/[userId]/page.tsx` | `/admin/users/:id` | `🔒 Admin Only` | User profile |
| `src/app/(dashboard)/admin/users/[userId]/edit/page.tsx` | `/admin/users/:id/edit` | `🔒 Admin Only` | Edit user |
| `src/app/(dashboard)/admin/promotions/page.tsx` | `/admin/promotions` | `✅ Done` | Coupons + Flash Sales dashboard |

---

## 🟡 Manager Pages

| File | URL | Status | Notes |
|---|---|---|---|
| `src/app/(dashboard)/manager/page.tsx` | `/manager` | `🔒 Admin Only` | Manager overview |
| `src/app/(dashboard)/manager/courses/page.tsx` | `/manager/courses` | `🔒 Admin Only` | Manager course list |
| `src/app/(dashboard)/manager/courses/create/page.tsx` | `/manager/courses/create` | `🔒 Admin Only` | Create course |
| `src/app/(dashboard)/manager/courses/[courseId]/page.tsx` | `/manager/courses/:id` | `🔒 Admin Only` | Course detail |
| `src/app/(dashboard)/manager/courses/[courseId]/edit/page.tsx` | `/manager/courses/:id/edit` | `🔒 Admin Only` | Edit course |

---

## 🧩 Modals & Overlays

| File | Type | Status | Notes |
|---|---|---|---|
| `src/components/checkout/CheckoutModal.tsx` | Modal | `🔄 Updated` | Coupon input, price display — functional |
| `src/components/checkout/PaymentSuccessToast.tsx` | Toast | `✅ Done` | Success notification after checkout |
| `src/components/modals/AlertModal.tsx` | Modal | `⚠️ Needs Work` | Generic alert — basic styling |
| `src/components/modals/ConfirmModal.tsx` | Modal | `⚠️ Needs Work` | Confirmation dialog — basic styling |

---

## 📋 Forms

| File | Used In | Status | Notes |
|---|---|---|---|
| `src/components/forms/login-form.tsx` | `/login` | `⚠️ Needs Work` | |
| `src/components/forms/register-form.tsx` | `/register` | `⚠️ Needs Work` | |
| `src/components/forms/course-form.tsx` | Create/edit courses | `🔒 Admin Only` | |
| `src/components/forms/module-form.tsx` | Create/edit modules | `🔒 Admin Only` | |
| `src/components/forms/topic-form.tsx` | Create/edit topics | `🔒 Admin Only` | |
| `src/components/forms/quiz-form.tsx` | Create/edit quizzes | `🔒 Admin Only` | |
| `src/components/forms/question-form.tsx` | Manage questions | `🔒 Admin Only` | |
| `src/components/forms/user-form.tsx` | Create/edit users | `🔒 Admin Only` | |

---

## 🧱 Feature Components

| File | Role | Status | Notes |
|---|---|---|---|
| `src/components/courses/course-details-view.tsx` | Course detail (public+student) | `🔄 Updated` | Flash sale badge, ₦ pricing |
| `src/components/courses/course-actions.tsx` | Admin course action bar | `🔒 Admin Only` | |
| `src/components/topics/edit-topic.tsx` | Edit topic inline | `🔒 Admin Only` | |
| `src/components/topics/topic-actions.tsx` | Topic action bar | `🔒 Admin Only` | |
| `src/components/modules/module-actions.tsx` | Module action bar | `🔒 Admin Only` | |
| `src/components/students/EnrollButton.tsx` | Enroll CTA | `✅ Done` | Integrated gradient glow conversion button |
| `src/components/students/StudentCourseOverview.tsx` | Enrolled course view | `✅ Done` | Premium Hero block, glass cards, dynamic light/dark contrast |
| `src/components/students/StudentTopicViewer.tsx` | Topic content view | `✅ Done` | prose-slate typography, refined attachments & quizzes wrappers |
| `src/components/students/QuizInterface.tsx` | Live quiz UI | `⚠️ Needs Work` | Timer, question flow |
| `src/components/students/QuizResults.tsx` | Post-quiz results | `⚠️ Needs Work` | Score, pass/fail, retake |
| `src/components/students/QuizInstructions.tsx` | Pre-quiz instructions | `⚠️ Needs Work` | |
| `src/components/quiz/quiz-builder.tsx` | Admin quiz builder | `🔒 Admin Only` | |
| `src/components/quiz/quiz-overview.tsx` | Quiz overview | `🔒 Admin Only` | |
| `src/components/quiz/quiz-preview.tsx` | Quiz preview | `🔒 Admin Only` | |
| `src/components/quiz/question-editor.tsx` | Question WYSIWYG | `🔒 Admin Only` | |
| `src/components/questions/question-list.tsx` | Question list | `🔒 Admin Only` | |

---

## ⚡ Loading & Utility

| File | Role | Status | Notes |
|---|---|---|---|
| `src/app/loading.tsx` | Root loading state | `⚠️ Needs Work` | |
| `src/app/(dashboard)/loading.tsx` | Dashboard loading | `⚠️ Needs Work` | |
| `src/components/providers.tsx` | App providers wrapper | `✅ Done` | Session, toast |
| `src/components/ui/global-loader.tsx` | Full-screen loader | `⚠️ Needs Work` | |

---

## 📊 Design Priority Queue

> Sorted by user-facing impact. Tackle these next for maximum visual lift.

1. `PublicHeader.tsx` — Every public page uses this
2. `StudentLayout.tsx` — Every student session uses this
3. `EnrollButton.tsx` — Key conversion element
4. `/login` + `/register` pages — Entry point for all users
5. `StudentCourseOverview.tsx` — Core enrolled learning experience
6. `StudentTopicViewer.tsx` — Where students spend most time
7. `QuizInterface.tsx` + `QuizResults.tsx` — Assessment experience
8. `payment/success` + `payment/failed` — Post-checkout moments
9. `AlertModal.tsx` + `ConfirmModal.tsx` — Appear frequently
