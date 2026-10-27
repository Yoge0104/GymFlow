# GymFlow — Multi-Tenant SaaS Gym Management System Frontend

A complete, modern, professional, responsive frontend application for a multi-tenant SaaS Gym Management System built with **pure HTML5, CSS3, and Vanilla JavaScript**.

GymFlow enables multiple fitness organizations to operate their gyms, branches, memberships, trainers, group classes, billing, maintenance, and athlete portals, while providing platform-level oversight for SaaS platform administrators.

---

## 🌟 Key Highlights & Features

- **Multi-Tenant SaaS Architecture**: Platform-level oversight (Super Admin) + gym organization operations (Gym Admin) + athlete self-service (Member Portal).
- **52 Fully-Implemented Pages**: No dummy stubs, placeholders, or missing subpages. Every view is built with semantic HTML, CSS components, and live JavaScript handlers.
- **Zero Framework Lock-in**: Built with 100% Vanilla JS, modern CSS custom properties (variables), Font Awesome 6 icons, and theme-aware Chart.js.
- **Client-Side Persistence (`GymFlowDB`)**: Stateful LocalStorage engine featuring automatic seed hydration, CRUD operations, relationships, filtering, and demo reset.
- **Light & Dark Theme Engine**: System-wide theme toggle with persistent preference across all 3 portal modules.
- **Responsive Layout**: Desktop sidebar collapse, tablet grid adaptivity, and full-screen mobile slide-out navigation drawers.
- **Interactive UI Components**: Custom modal dialogs, accessible toast notifications, print-ready invoices, searchable/paginated tables, and CSV exports.
- **Instant Role Switcher**: Interactive floating widget attached to all dashboard pages for seamless 1-click role transitions.

---

## 👥 Three Complete User Portals

### 1. Super Admin Module (`/super-admin/` — 13 Pages)
Platform-level governance for GymFlow SaaS operators:
* `dashboard.html`: Global SaaS KPIs (MRR, active gyms, churn, member count), revenue trends, registration charts, renewal alerts.
* `gyms.html`: Directory of registered gym organizations with status filters, search, suspension/activation, and onboarding modal.
* `gym-details.html`: Detailed inspection view for IronPulse Fitness Club (branches, metrics, billing, audit timeline).
* `subscriptions.html`: Multi-tenant subscription tracking, billing cycles, automated trial expiry, and simulated renewals.
* `plans.html`: SaaS pricing plan tiers (Starter, Growth, Enterprise Pro) with add, edit, and feature-matrix management.
* `billing.html`: Global platform transactions, MRR breakdown, invoice inspection, and simulated refunds.
* `platform-users.html`: Internal team account administration (Support agents, DevOps, Billing specialists).
* `roles-permissions.html`: Interactive role-permission matrix with granular capability toggles.
* `support-tickets.html`: Multi-organization helpdesk queue with priority tags, status updates, and agent assignments.
* `announcements.html`: SaaS platform broadcast publisher (Maintenance alerts, new features, system notices).
* `audit-logs.html`: Immutable security audit log tracking actor events, timestamps, and target resources.
* `system-health.html`: Live simulated infrastructure telemetry (API latency, database pool, error rates, uptime).
* `settings.html`: SaaS branding, multi-currency settings, security policies, and demo data factory reset.

---

### 2. Gym Admin Module (`/admin/` — 22 Pages)
Club-level operational management for gym owners and staff:
* `dashboard.html`: Single-club operational overview (active members, today's attendance, revenue, trainer occupancy).
* `branches.html`: Multi-branch club network management (locations, operating hours, managers, capacity).
* `members.html`: Unified Membership Management workspace combining member directory, subscription lifecycles, renewals, payment tracking, and enrollment modal.
* `member-details.html`: 360-degree athlete file for Alex Morgan (membership, attendance log, payments, assigned workouts).
* `membership-plans.html`: Gym retail package catalog (Monthly, Annual VIP, Personal Coaching bundles).
* `attendance.html`: Real-time reception desk check-in kiosk with instant QR verification and manual search.
* `trainers.html`: Certified trainer staff profiles, specialties, schedules, client counts, and ratings.
* `classes.html`: Weekly timetable scheduler for group sessions (HIIT, Yoga, Spin, Powerlifting).
* `class-bookings.html`: Real-time roster management, attendance verification, and spot allocations.
* `workout-plans.html`: Custom fitness plan builder with multi-day splits, exercises, sets, reps, and assignments.
* `payments.html`: Member point-of-sale and subscription dues ledger with payment method records.
* `invoices.html`: Formal gym invoice generator with printable receipts and PDF download simulator.
* `expenses.html`: Operational gym expenditure ledger (rent, equipment leasing, utilities, staff payroll).
* `leads.html`: Sales CRM pipeline (New Inquiry, Contacted, Trial Scheduled, Induction, Converted).
* `equipment.html`: Gym floor asset inventory (weight cages, cardio suites, pin-loaded machines, serial numbers).
* `maintenance.html`: Equipment repair and servicing tickets with technician assignments and safety tags.
* `reports.html`: Business intelligence analytics (membership growth, attendance heatmaps, revenue vs expenses).
* `staff.html`: Front desk, trainer, and cleaning crew accounts with branch assignments.
* `roles-permissions.html`: Club-level role access control (Owner, Club Manager, Head Trainer, Receptionist).
* `notifications.html`: Member alert broadcast center for gym news, holiday hours, and equipment upgrades.
* `support.html`: SaaS helpdesk submission channel directly to GymFlow platform specialists.
* `settings.html`: Club profile, legal identity, operating hours, tax rates, and invoice footer terms.

---

### 3. Member / Athlete Portal (`/member/` — 12 Pages)
Self-service athlete portal for gym members:
* `dashboard.html`: Personalized greeting, membership days remaining, check-in streak, today's workout focus, booked classes.
* `my-profile.html`: Athlete personal profile, emergency contact, home branch, avatar picker, and fitness goals.
* `my-membership.html`: Digital VIP membership card, included amenities checklist, auto-renew setting, hold/freeze requests.
* `plans.html`: Interactive gym tier browser with 1-click upgrade checkout simulator.
* `payments.html`: Personal billing history, downloadable official receipts, and payment method manager.
* `attendance.html`: Check-in consistency log, weekly duration chart, and self-service QR scanner simulation.
* `classes.html`: Timetable browser with category filters (HIIT, Spin, Yoga, Strength) and 1-click spot reservation.
* `my-bookings.html`: Upcoming and past class bookings with cancellation actions and trainer rating review modal.
* `workout-plan.html`: Assigned workout regimen with interactive exercise checkboxes, form tips, and daily progress bar.
* `progress.html`: Biometric tracker (weight kg, body fat %, tape measurements) with Chart.js progress graph.
* `notifications.html`: Personal notification center (class reminders, payment receipts, facility updates).
* `support.html`: Interactive threaded messaging helpdesk with club front desk staff and trainers.

---

### 4. Public Marketing & Onboarding (`/` — 4 Pages)
* `index.html`: Modern high-converting SaaS landing page with features, benefits by role, pricing tiers, FAQs, and footer.
* `login.html`: Secure authentication interface featuring instant 1-click demo buttons for all three roles.
* `register.html`: Multi-step organization onboarding form that provisions sample gyms directly into local storage.
* `forgot-password.html`: Password recovery workflow with simulated delivery instructions.

---

## 🔑 Demo Access & Test Accounts

You can log in instantly using the 1-click demo role buttons on `login.html`, or navigate directly into any module:

| Role | Demo Email | Password | Primary Scope | Default Landing Page |
| :--- | :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@gymflow.com` | `admin123` | Platform-Wide (All Gyms) | `super-admin/dashboard.html` |
| **Gym Admin** | `marcus@ironpulse.com` | `admin123` | IronPulse Fitness Club | `admin/dashboard.html` |
| **Member** | `alex.morgan@example.com` | `member123` | Personal Athlete File | `member/dashboard.html` |

> [!TIP]
> Use the **Floating Role Switcher** in the bottom-right corner of any dashboard page to switch roles instantly without logging out.

---

## 📂 Project Directory Structure

```text
gymflow/
├── index.html                      # Marketing landing page
├── login.html                      # Authentication portal with 1-click demo logins
├── register.html                   # Gym registration and SaaS plan onboarding
├── forgot-password.html            # Password recovery simulator
│
├── super-admin/                    # Super Admin Platform Management (13 pages)
│   ├── dashboard.html
│   ├── gyms.html
│   ├── gym-details.html
│   ├── subscriptions.html
│   ├── plans.html
│   ├── billing.html
│   ├── platform-users.html
│   ├── roles-permissions.html
│   ├── support-tickets.html
│   ├── announcements.html
│   ├── audit-logs.html
│   ├── system-health.html
│   └── settings.html
│
├── admin/                          # Gym Organization Administration (22 pages)
│   ├── dashboard.html
│   ├── branches.html
│   ├── members.html
│   ├── member-details.html
│   ├── membership-plans.html
│   ├── attendance.html
│   ├── trainers.html
│   ├── classes.html
│   ├── class-bookings.html
│   ├── workout-plans.html
│   ├── payments.html
│   ├── invoices.html
│   ├── expenses.html
│   ├── leads.html
│   ├── equipment.html
│   ├── maintenance.html
│   ├── reports.html
│   ├── staff.html
│   ├── roles-permissions.html
│   ├── notifications.html
│   ├── support.html
│   └── settings.html
│
├── member/                         # Athlete Self-Service Portal (12 pages)
│   ├── dashboard.html
│   ├── my-profile.html
│   ├── my-membership.html
│   ├── plans.html
│   ├── payments.html
│   ├── attendance.html
│   ├── classes.html
│   ├── my-bookings.html
│   ├── workout-plan.html
│   ├── progress.html
│   ├── notifications.html
│   └── support.html
│
├── assets/
│   ├── css/
│   │   ├── style.css               # Design tokens, variables, base resets & layout primitives
│   │   ├── components.css          # Buttons, cards, badges, modals, forms, tables, tabs, toasts
│   │   ├── dashboard.css           # Sidebar layout, topbar, stats grid, timeline, invoice styles
│   │   └── responsive.css          # Breakpoints, mobile drawer, responsive tables & grids
│   │
│   └── js/
│       ├── mock-data.js            # Initial realistic multi-tenant dataset
│       ├── storage.js              # GymFlowDB LocalStorage CRUD singleton engine
│       ├── auth.js                 # Session manager, demo accounts, tenant context provider
│       ├── navigation.js           # Theme toggle, sidebar collapse, mobile drawer, active links
│       ├── components.js           # Toast alerts, modal controller, pagination, invoice printing
│       ├── charts.js               # Theme-aware Chart.js line, bar, and doughnut wrappers
│       ├── validation.js           # Client-side form validation utility
│       └── app.js                  # Global formatters and interactive floating role switcher
│
└── README.md                       # Comprehensive project documentation
```

---

## 🚀 How to Run Locally

Because GymFlow is constructed with vanilla web technologies, no build tools, npm packages, or bundlers are required.

### Option 1: Direct File Opening
Double-click `index.html` or open any `.html` file directly in any modern browser (Chrome, Edge, Firefox, Safari).

### Option 2: Local HTTP Server (Recommended)
Running through an HTTP server ensures full compatibility with browser modules and font rendering:

```bash
# Using Python 3:
cd gymflow
python -m http.server 8080

# Or using Node.js:
npx serve .

# Or using PHP:
php -S localhost:8080
```
Then navigate to `http://localhost:8080` in your web browser.

---

## 🎨 Design System & Styling Guide

* **Color Palette**:
  - Primary / Charcoal Background: `#0f172a` (Dark) / `#f8fafc` (Light)
  - Surface Cards: `#1e293b` (Dark) / `#ffffff` (Light)
  - Accent Color: `#10b981` (Emerald Green)
  - Secondary Accent: `#2563eb` (Electric Blue) & `#38bdf8` (Sky)
  - Text: High contrast readable typography with muted subtitles.
* **Typography**: Outfit (Headings) and Plus Jakarta Sans (Body text & metrics) via Google Fonts.
* **Icons**: Font Awesome 6 CDN icons with semantic accessibility markup.
* **Print Optimization**: Dedicated `@media print` CSS rules ensure invoices, workout plans, and membership certificates print cleanly without navigational clutter.

---

## 🛠️ Ready for Backend Integration

GymFlow's architecture mirrors production SaaS REST APIs:
* All database queries flow through `GymFlowDB` (`storage.js`).
* To connect to a real backend (Node.js, Laravel, Django, ASP.NET Core, or Go), simply replace the `GymFlowDB` LocalStorage methods with standard `fetch()` or `axios` API calls.
* All data structures follow standard JSON schema representations for gyms, members, memberships, classes, and payments.
