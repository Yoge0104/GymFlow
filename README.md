# GymFlow Next.js SaaS Platform

> Comprehensive, multi-tenant Next.js App Router application migrated from `Demo-Gym-Application-Frontend-main`. Features complete visual fidelity, 3 distinct role-based portals (Super Admin, Gym Admin, Member), centralized RBAC permissions matrix, live discount synchronization, versioned client-side database persistence, dummy POS payment processing, and print-ready A4 invoice generation.

---

## 🌟 Highlights & Architecture

- **Next.js 14 App Router**: Complete TypeScript strict mode implementation using modern React 18 client architecture.
- **Visual Design Preservation**: 100% preservation of original colors (`#0f172a`, `#10b981`, `#2563eb`, `#f59e0b`), typography (Outfit & Plus Jakarta Sans), cards, badges, layouts, and responsive CSS.
- **Three Complete Portals**:
  1. **Super Admin (`/super-admin`)**: Platform telemetry, multi-tenant gym onboarding, SaaS subscriptions, pricing tiers, discounts, platform billing, audit logs, health telemetry, email template management, announcements, and global platform settings.
  2. **Gym Admin (`/admin`)**: Operations dashboard, branch network, member directory, membership retail packages, attendance kiosks, trainer roster, class scheduling, POS payments, partial payments & refunds, invoice ledger with print-ready A4 receipts, expenses, lead CRM, equipment tracking, maintenance queue, reports, staff management, scoped RBAC matrix, gym-level discounts, email templates, notifications, and club settings.
  3. **Member Portal (`/member`)**: Athlete dashboard, profile & goals, digital gym pass with QR code, plan catalog with dynamic coupon calculator, personal billing statements & receipts, check-in history & consistency charts, class booking & timetable, booking management & cancellations, workout split tracker with daily checkboxes, biometric tracker (weight, body fat %, measurements), and front-desk support helpdesk.
- **Centralized RBAC Engine**: 8 roles (`SUPER_ADMIN`, `GYM_OWNER`, `GYM_ADMIN`, `BRANCH_MANAGER`, `TRAINER`, `RECEPTIONIST`, `ACCOUNTANT`, `MEMBER`) with matrix-style editor, granular capability toggles, and reactive `PermissionGate`.
- **End-to-End Discount Synchronization**: Real-time discount management. When a discount is created or modified in Super Admin or Gym Admin, the public landing page (`/`), retail plan cards, and simulated checkouts update dynamically using the shared `PricingService`.
- **Versioned Client-Side Persistence (`GymFlowDB v2`)**: Full in-browser LocalStorage engine with pub/sub reactivity, automatic initial seed, JSON export, and factory reset.
- **Floating 1-Click Role Switcher**: Quick-switch button located in the bottom-right corner allows instantaneous switching between Super Admin, Gym Admin, Member, Trainer, Receptionist, and Accountant profiles.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.17+ or 20+
- npm or pnpm

### Installation & Run

```bash
# 1. Install dependencies
npm install

# 2. Run unit tests
npm test

# 3. Start development server
npm run dev

# 4. Build for production
npm run build
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Seeded Demo Accounts (All 8 Roles)

| Role | Name | Email | Password | Default Initial Page | Scope & Capabilities |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Super Admin** | Alex Vance | `admin@gymflow.com` | `DemoPass123!` | `/super-admin/dashboard` | Platform-wide root access, SaaS health, gyms, subscriptions |
| **Gym Owner** | Marcus Vance | `marcus@ironpulse.com` | `DemoPass123!` | `/admin/dashboard` | Complete club leadership, staff governance, financial reports |
| **Gym Admin** | Marcus Vance | `admin@ironpulse.com` | `DemoPass123!` | `/admin/dashboard` | Club operational administration, rosters, discounts, timetables |
| **Branch Manager** | Jordan Smith | `jordan.bm@ironpulse.com` | `DemoPass123!` | `/admin/dashboard` | Scoped to Downtown Flagship branch records, attendance & assets |
| **Head Trainer** | David Miller | `david.m@ironpulse.com` | `DemoPass123!` | `/admin/classes` | Classes, rosters & workouts (financial records strictly excluded) |
| **Receptionist** | Jessica Taylor | `reception@ironpulse.com` | `DemoPass123!` | `/admin/attendance` | Check-in kiosk, athlete enrollment, POS payment recording |
| **Accountant** | Amanda Clark | `amanda.c@ironpulse.com` | `DemoPass123!` | `/admin/invoices` | Invoices, ledger, expenses, financial reports (no user admin) |
| **Club Athlete** | Alex Morgan | `alex.morgan@example.com` | `DemoPass123!` | `/member/dashboard` | Scoped athlete portal: workouts, bookings, own payments |

> ⚠️ **Demo Prototype Security Boundary Disclaimer**: This application operates with client-side mock authentication, RBAC permission evaluation, and LocalStorage persistence for demonstration and product evaluation purposes. Client-side permission checks provide an interactive UX and administrative workflow demonstration; in a production SaaS deployment, authorization and data scoping must be enforced server-side on every API request.

---

## 🛡️ Authentication, RBAC & Permissions Architecture (Phase 2)

### 1. Centralized Role-Permission Matrix (`src/services/PermissionService.ts`)
- Grouped operational modules: Dashboard, Platform, Gyms, Branches, Members, Memberships, Attendance, Trainers, Classes, Workouts, Payments, Invoices, Expenses, CRM Leads, Discounts, Reports, Equipment, Marketing, System Settings.
- Granular action keys with automatic alias resolution (`gyms.edit` <=> `gyms.update`, `payments.create` <=> `payments.record`, `payments.refund_simulate` <=> `payments.refund`, `invoices.export` <=> `invoices.print`, `branches.create` <=> `branches.manage`).
- Real-time reactivity via pub/sub: matrix modifications immediately update navigation links and components without requiring a page reload.
- Administrative lockout guards: critical governance permissions (`roles.manage`, `platform.manage`, `platform.view`) cannot be removed from `SUPER_ADMIN`.

### 2. Route Authorization Service (`src/services/RouteAccessService.ts`)
- Evaluates route permissions before component rendering.
- Directly intercepts unauthorized URL access in `DashboardLayout.tsx`.
- Renders an in-style `AccessDenied.tsx` view with user role badge, required permission details, and one-click return to the permitted dashboard.

### 3. Frontend Data Scoping Layer (`src/services/DataScopeService.ts`)
- **Tenant Scoping**: Records automatically isolated by `gymId`.
- **Branch Scoping**: Branch Managers (`BRANCH_MANAGER`) only view members, attendance, classes, invoices, and equipment for their assigned `branchId`.
- **Trainer Scoping**: Trainers (`TRAINER`) only view members assigned to their roster and classes they instruct.
- **Member Scoping**: Athletes (`MEMBER`) strictly see only their own profile, attendance, workouts, and invoices.
- **Financial Access Exclusion**: Trainers, Receptionists, and Members are strictly excluded from seeing operational expenses and sensitive finance ledgers.

### 4. Interactive Permissions UI
- Super Admin: `/super-admin/roles-permissions` (platform-wide 8-role matrix).
- Gym Admin: `/admin/roles-permissions` (club staff permission configuration).
- Includes instant search, module filters, live saving, and a factory "Restore Defaults" option.

*Tip: You can also use the 1-Click Demo Login buttons on the `/login` page or the floating role switcher widget at the bottom right of any screen.*

---

## 📂 Route Directory

### Public & Authentication
- `/` — Marketing landing page with dynamic promotion banner, plan cards, FAQ, and 1-click portal jump.
- `/login` — Authentication page with 1-click demo role credentials.
- `/register` — Multi-step organization onboarding wizard with plan selection and coupon verification.
- `/forgot-password` — Password recovery flow.

### Super Admin Portal (`/super-admin`)
- `/super-admin/dashboard` — Platform overview, MRR metrics, gym directory preview, upcoming renewals.
- `/super-admin/gyms` — Organization directory with status toggles and onboarding modal.
- `/super-admin/gym-details` — 360 gym inspection view with branch management and impersonation.
- `/super-admin/subscriptions` — SaaS subscription tracker with renewal simulations.
- `/super-admin/plans` — SaaS pricing plans manager with feature checklist editor.
- `/super-admin/discounts` — Platform-wide promotions and landing page synchronization.
- `/super-admin/billing` — SaaS billing transactions and refund simulation.
- `/super-admin/platform-users` — Internal platform team and DevOps accounts.
- `/super-admin/roles-permissions` — Global matrix editor across all 8 roles.
- `/super-admin/support-tickets` — Helpdesk queue with threaded replies.
- `/super-admin/announcements` — System announcement broadcaster.
- `/super-admin/audit-logs` — Immutable audit log ledger.
- `/super-admin/system-health` — Infrastructure telemetry and microservices monitor.
- `/super-admin/email-templates` — Global email templates with dynamic variable insertion and safe preview.
- `/super-admin/notifications` — In-app notification center.
- `/super-admin/settings` — Global SaaS platform settings, database backup export, and factory reset.

### Gym Admin Portal (`/admin`)
- `/admin/dashboard` — Operations dashboard with 10 KPI cards, live check-in feed, and class summary.
- `/admin/branches` — Multi-location branch network manager.
- `/admin/members` — Member directory with membership status filters, enrollment modal, freeze/delete actions.
- `/admin/member-details` — 360 athlete file with tabs: Overview, Membership, Attendance, Payments, Workout.
- `/admin/membership-plans` — Retail package catalog with dynamic promotional discount badges.
- `/admin/attendance` — Check-in kiosk with instant QR simulation and search.
- `/admin/trainers` — Trainer roster and profile management.
- `/admin/classes` — Weekly timetable scheduler and class creation modal.
- `/admin/class-bookings` — Session roster and attendance check-off.
- `/admin/workout-plans` — Exercise split library and multi-day workout builder.
- `/admin/payments` — Point-of-sale terminal (Card, UPI, Cash, Transfer), failure toggle, and refunds.
- `/admin/invoices` — Invoice ledger with line items, partial payments, and Print Invoice Modal.
- `/admin/expenses` — Operational expense ledger and categories.
- `/admin/leads` — Sales CRM pipeline with stage transitions (New, Contacted, Trial, Converted, Lost).
- `/admin/equipment` — Equipment inventory and maintenance status.
- `/admin/maintenance` — Work order queue and resolution action.
- `/admin/reports` — Financial analytics (Revenue vs Expenses) and attendance distribution charts.
- `/admin/staff` — Staff roster and role invitations.
- `/admin/roles-permissions` — Club staff permissions matrix.
- `/admin/discounts` — Gym-level promotions and coupon limits.
- `/admin/email-templates` — Club email templates with variable insertion and live preview.
- `/admin/notifications` — Operational alert center and broadcast notice dispatcher.
- `/admin/support` — Direct support ticketing to SaaS platform engineering.
- `/admin/settings` — Club profile, tax rules, operating hours, keycard access, and invoice layout.

### Member Portal (`/member`)
- `/member/dashboard` — Personalized athlete greeting, streak badge, 4 KPI cards, today's workout focus, booked classes, digital pass QR code.
- `/member/my-profile` — Athlete profile, emergency contact, home branch, avatar changer, and password settings.
- `/member/my-membership` — VIP pass card, included privileges checklist, freeze request, and renewal modal.
- `/member/plans` — Retail membership packages with coupon code input, dynamic discount calculation, and checkout modal.
- `/member/payments` — Personal billing history, outstanding balance, active card on file, and print receipt modal.
- `/member/attendance` — Check-in history log, consistency bar chart, and scan QR simulation.
- `/member/classes` — Timetable browser with category filter pills (HIIT, Spin, Yoga, Strength) and 1-click booking.
- `/member/my-bookings` — Upcoming & past bookings, spot cancellation, and coach rating modal.
- `/member/workout-plan` — Multi-day workout split with daily exercise checkboxes, target load, form tips, and progress bar.
- `/member/progress` — Biometric tracking with weight & body fat line chart, tape measurements, and log measurement modal.
- `/member/notifications` — Athlete notification center with category tabs.
- `/member/support` — Two-column helpdesk with inquiry list, threaded replies, and question submission modal.

---

## 🧪 Verification & Testing

Unit tests run with Node.js built-in test runner:
```bash
npm test
```
- Tests cover `calculateDiscount` (percentage, fixed, max cap, minimum purchase, non-negative boundary constraint).
- Tests cover RBAC permission checks (`hasPermission`, `hasAnyPermission`, `hasAllPermissions`, role matrix inheritance, and custom user permission overrides).

Production build test:
```bash
npm run build
```
- Validates strict TypeScript compilation and App Router route generation across all 37 pages.
