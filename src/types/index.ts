// ===================================================================
// GymFlow SaaS — Unified TypeScript Domain Types
// ===================================================================

export type UserRole =
  | 'SUPER_ADMIN'
  | 'GYM_OWNER'
  | 'GYM_ADMIN'
  | 'BRANCH_MANAGER'
  | 'TRAINER'
  | 'RECEPTIONIST'
  | 'ACCOUNTANT'
  | 'MEMBER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleLabel: string;
  avatar: string;
  gymId: string | null;
  gymName?: string;
  branchId?: string | null;
  branchName?: string;
  phone?: string;
  customPermissions?: string[];
}

// Granular permission keys
export type PermissionKey =
  | 'dashboard.view'
  | 'platform.view'
  | 'platform.manage'
  | 'gyms.view'
  | 'gyms.create'
  | 'gyms.update'
  | 'gyms.edit'
  | 'gyms.delete'
  | 'gyms.manage_status'
  | 'branches.view'
  | 'branches.manage'
  | 'branches.create'
  | 'branches.edit'
  | 'branches.delete'
  | 'members.view'
  | 'members.create'
  | 'members.update'
  | 'members.edit'
  | 'members.delete'
  | 'memberships.view'
  | 'memberships.manage'
  | 'memberships.create'
  | 'memberships.edit'
  | 'memberships.cancel'
  | 'attendance.view'
  | 'attendance.check_in'
  | 'trainers.view'
  | 'trainers.manage'
  | 'trainers.create'
  | 'trainers.edit'
  | 'trainers.delete'
  | 'classes.view'
  | 'classes.manage'
  | 'classes.create'
  | 'classes.edit'
  | 'classes.cancel'
  | 'bookings.view'
  | 'bookings.create'
  | 'bookings.cancel'
  | 'workouts.view'
  | 'workouts.manage'
  | 'payments.view'
  | 'payments.record'
  | 'payments.create'
  | 'payments.refund'
  | 'payments.refund_simulate'
  | 'invoices.view'
  | 'invoices.create'
  | 'invoices.manage'
  | 'invoices.edit'
  | 'invoices.cancel'
  | 'invoices.print'
  | 'invoices.export'
  | 'expenses.view'
  | 'expenses.manage'
  | 'leads.view'
  | 'leads.manage'
  | 'equipment.view'
  | 'equipment.manage'
  | 'reports.view'
  | 'reports.export'
  | 'staff.view'
  | 'staff.manage'
  | 'roles.view'
  | 'roles.manage'
  | 'discounts.view'
  | 'discounts.manage'
  | 'discounts.create'
  | 'discounts.edit'
  | 'discounts.delete'
  | 'discounts.publish'
  | 'email_templates.view'
  | 'email_templates.manage'
  | 'email_templates.create'
  | 'email_templates.edit'
  | 'email_templates.delete'
  | 'notifications.view'
  | 'notifications.manage'
  | 'support.view'
  | 'support.manage'
  | 'settings.view'
  | 'settings.edit'
  | 'settings.manage';

export interface RolePermissionMatrix {
  [role: string]: PermissionKey[];
}

// Gym Organization
export interface Gym {
  id: string;
  name: string;
  slug: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  planId: string;
  planName: string;
  status: 'active' | 'pending' | 'suspended' | 'trial';
  branchesCount: number;
  membersCount: number;
  monthlyRevenue: number;
  joinedDate: string;
  address: string;
  city: string;
  country: string;
  logo?: string;
}

// Branch
export interface Branch {
  id: string;
  gymId: string;
  name: string;
  code: string;
  address: string;
  city: string;
  phone: string;
  managerName: string;
  capacity: number;
  activeMembers: number;
  status: 'active' | 'inactive';
  openingHours: string;
}

// SaaS Platform Pricing Plan
export interface SaasPlan {
  id: string;
  name: string;
  badge?: string;
  monthlyPrice: number;
  annualPrice: number;
  maxBranches: number;
  maxMembers: number;
  staffLimit: number;
  trialDays: number;
  status: 'active' | 'inactive';
  features: string[];
}

// Gym Retail Membership Plan
export interface GymMembershipPlan {
  id: string;
  gymId: string;
  name: string;
  durationMonths: number;
  duration?: string;
  durationDays?: number;
  price: number;
  discountedPrice?: number;
  activeDiscountCode?: string;
  billingCycle: 'Monthly' | 'Quarterly' | 'Annual' | 'One-Time';
  accessLevel: 'All Branches' | 'Single Branch' | 'VIP';
  joiningFee: number;
  benefits: string[];
  status: 'active' | 'inactive';
  isPopular?: boolean;
  showOnLandingPage?: boolean;
  displayOrder?: number;
}

// Gym Member
export interface Member {
  id: string;
  gymId: string;
  branchId: string;
  name: string;
  email: string;
  phone: string;
  gender: string;
  dob: string;
  address: string;
  emergencyContact: string;
  planId: string;
  planName: string;
  startDate: string;
  endDate: string;
  status: 'Active' | 'Expired' | 'Pending' | 'Frozen' | 'Cancelled';
  assignedTrainerId?: string | null;
  assignedTrainerName?: string | null;
  balanceDue: number;
  avatar: string;
  totalVisits: number;
  lastVisit?: string;
  streakDays?: number;
  weight?: number;
  targetWeight?: number;
}

// Trainer
export interface Trainer {
  id: string;
  gymId: string;
  branchId?: string;
  branchName?: string;
  name: string;
  email: string;
  phone: string;
  specialties: string[];
  bio: string;
  experienceYears: number;
  rating: number;
  avatar: string;
  status: 'active' | 'on_leave' | 'inactive' | 'Active' | 'On Leave' | 'Inactive';
  clientCount: number;
  schedule?: string;
}

// Fitness Class
export interface FitnessClass {
  id: string;
  gymId: string;
  branchId: string;
  name: string;
  category: 'HIIT' | 'Yoga' | 'Spin' | 'Strength' | 'Pilates' | 'Boxing';
  trainerId: string;
  trainerName: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  room: string;
  capacity: number;
  enrolledCount: number;
  status: 'active' | 'cancelled' | 'Scheduled' | 'In-Progress' | 'Completed' | 'Cancelled';
  description: string;
}

// Class Booking
export interface ClassBooking {
  id: string;
  gymId: string;
  memberId: string;
  memberName: string;
  classId: string;
  className: string;
  trainerName: string;
  date: string;
  time: string;
  status: 'Booked' | 'Attended' | 'Cancelled' | 'No-Show';
  bookingDate: string;
  rating?: number;
  review?: string;
}

// Attendance
export interface AttendanceRecord {
  id: string;
  gymId: string;
  branchId: string;
  memberId: string;
  memberName: string;
  planName: string;
  checkInTime: string;
  checkOutTime?: string;
  status: 'Active' | 'Completed';
  verifiedVia: 'QR Kiosk' | 'Manual Reception' | 'NFC' | 'Mobile App';
}

// Discount & Promotion
export interface Discount {
  id: string;
  gymId: string | null; // null = platform-wide SaaS promotion
  name: string;
  description: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive';
  eligiblePlanIds: string[]; // empty array = all plans
  eligibleBranchIds?: string[];
  minPurchaseAmount: number;
  maxDiscountAmount?: number;
  totalUsageLimit?: number;
  usedCount: number;
  perMemberLimit?: number;
  firstTimeOnly: boolean;
  isFeatured: boolean;
  isPublicLandingPage: boolean;
  landingHeadline?: string;
  landingDescription?: string;
  badgeText?: string;
}

// Payment Transaction
export interface PaymentRecord {
  id: string;
  transactionId?: string;
  invoiceId?: string;
  invoiceNo?: string;
  gymId: string;
  memberId: string;
  memberName: string;
  memberEmail?: string;
  planName?: string;
  description?: string;
  amount: number;
  subtotal?: number;
  discountAmount?: number;
  taxAmount?: number;
  couponCode?: string;
  date: string;
  method: 'Cash' | 'UPI' | 'Card' | 'Bank Transfer' | string;
  status: 'Successful' | 'Pending' | 'Processing' | 'Failed' | 'Refunded' | 'Paid' | string;
  receiptNumber?: string;
  notes?: string;
}

export type Payment = PaymentRecord;

// Invoice Line Item
export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discountAmount?: number;
  taxRate?: number;
  total: number;
}

// Invoice
export interface Invoice {
  id: string;
  invoiceNumber: string;
  gymId: string;
  gymName: string;
  gymAddress?: string;
  gymPhone?: string;
  gymEmail?: string;
  memberId: string;
  memberName: string;
  memberEmail?: string;
  memberPhone?: string;
  memberAddress?: string;
  planId?: string;
  planName?: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceLineItem[];
  subtotal: number;
  discountAmount: number;
  couponCode?: string;
  taxRate: number;
  taxAmount: number;
  total: number;
  paidAmount: number;
  balanceDue: number;
  status: 'Draft' | 'Unpaid' | 'Partially Paid' | 'Paid' | 'Overdue' | 'Cancelled';
  paymentMethod?: string;
  paymentTransactionIds: string[];
  notes?: string;
  terms?: string;
  createdAt: string;
}

// Email Template
export interface EmailTemplate {
  id: string;
  gymId: string | null; // null = platform
  name: string;
  templateKey: string;
  category: 'onboarding' | 'billing' | 'attendance' | 'marketing' | 'system' | 'support';
  subject: string;
  htmlBody: string;
  plainTextBody: string;
  availablePlaceholders: string[];
  status: 'active' | 'inactive';
  lastModified: string;
}

// In-App Notification
export interface AppNotification {
  id: string;
  gymId: string | null;
  targetUserId?: string | null;
  targetRole?: UserRole | 'ALL';
  category:
    | 'membership'
    | 'payments'
    | 'attendance'
    | 'classes'
    | 'promotions'
    | 'support'
    | 'staff'
    | 'platform'
    | 'billing';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  linkUrl?: string;
  relatedEntityId?: string;
  dedupKey?: string;
}

// Audit Log
export interface AuditLog {
  id: string;
  gymId: string | null;
  actorName: string;
  actorRole: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
}

// Support Ticket
export interface SupportTicket {
  id: string;
  ticketNumber: string;
  gymId: string | null;
  gymName?: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  subject: string;
  category: 'Billing' | 'Technical' | 'Membership' | 'Equipment' | 'General';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  createdAt: string;
  updatedAt: string;
  messages: {
    id: string;
    senderName: string;
    senderRole: string;
    message: string;
    timestamp: string;
  }[];
}

// Lead CRM
export interface Lead {
  id: string;
  gymId: string;
  branchId: string;
  name: string;
  email: string;
  phone: string;
  source: 'Walk-in' | 'Website' | 'Instagram' | 'Referral' | 'Google';
  interestedPlan: string;
  stage: 'New Inquiry' | 'Contacted' | 'Trial Scheduled' | 'Induction' | 'Converted' | 'Lost';
  notes: string;
  assignedStaff: string;
  createdAt: string;
}

// Expense
export interface Expense {
  id: string;
  gymId: string;
  branchId?: string;
  category: 'Facility Rent' | 'Equipment Leasing' | 'Utilities' | 'Staff Payroll' | 'Maintenance' | 'Marketing';
  description: string;
  amount: number;
  date: string;
  paymentMethod: string;
  vendorName: string;
  status: 'Paid' | 'Pending' | 'Scheduled';
}

// Equipment
export interface Equipment {
  id: string;
  gymId: string;
  branchId: string;
  name: string;
  category: 'Cardio' | 'Strength' | 'Free Weights' | 'Accessories';
  serialNumber: string;
  purchaseDate: string;
  warrantyExpiry: string;
  lastServicedDate: string;
  status: 'Operational' | 'Under Maintenance' | 'Out of Order';
  brand: string;
  location: string;
}

// Maintenance Ticket
export interface MaintenanceTicket {
  id: string;
  gymId: string;
  equipmentId: string;
  equipmentName: string;
  issueDescription: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Open' | 'In Progress' | 'Resolved';
  reportedDate: string;
  technicianName?: string;
  cost?: number;
  resolutionNotes?: string;
}

// Workout Plan
export interface WorkoutExercise {
  id: string;
  name: string;
  category?: string;
  sets: number;
  reps: string;
  targetMuscle?: string;
  restSeconds?: number;
  weight?: string;
  load?: string;
  notes?: string;
  tips?: string;
  completed?: boolean;
  isCompleted?: boolean;
}

export interface WorkoutDay {
  dayName?: string; // e.g. "Monday — Chest & Triceps"
  day?: string;
  title?: string;
  focus?: string;
  exercises: WorkoutExercise[];
}

export interface WorkoutPlan {
  id: string;
  gymId: string;
  memberId?: string;
  memberName?: string;
  trainerName: string;
  title: string;
  goal: 'Hypertrophy' | 'Fat Loss' | 'Strength' | 'Endurance' | 'Mobility' | string;
  durationWeeks?: number;
  schedule?: WorkoutDay[];
  weeklySchedule?: any[];
  assignedDate?: string;
  createdDate?: string;
  notes?: string;
}

// Progress Record
export interface ProgressRecord {
  id: string;
  memberId: string;
  date: string;
  weightKg: number;
  bodyFatPercent: number;
  chestCm?: number;
  waistCm?: number;
  armsCm?: number;
  notes?: string;
}

// Announcement
export interface Announcement {
  id: string;
  gymId: string | null;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'danger';
  targetAudience: 'ALL' | 'GYM_ADMINS' | 'MEMBERS';
  publishDate: string;
  expiresDate?: string;
  isActive: boolean;
}

// Settings
export interface PlatformSettings {
  appName: string;
  supportEmail: string;
  defaultCurrency: string;
  currencySymbol: string;
  taxRate: number;
  allowPublicRegistration: boolean;
  maintenanceMode: boolean;
  demoMode: boolean;
}

export interface GymSettings {
  gymId: string;
  name: string;
  legalEntityName: string;
  slogan?: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  website?: string;
  socialHandle?: string;
  currency: string;
  currencySymbol: string;
  taxRate: number;
  taxName: string;
  taxId?: string;
  invoicePrefix: string;
  invoiceFooterNotes: string;
  invoiceTerms: string;
  openingHours: string;
  hoursWeekday?: string;
  hoursSaturday?: string;
  hoursSunday?: string;
  keycardAccess?: boolean;
  capacityMain?: number;
  capacityStudio?: number;
  gracePeriodDays?: number;
  cancellationNoticeDays?: number;
  guestPassesPerMonth?: number;
  autoRenewDefault?: boolean;
  waiverText?: string;
  logo?: string;
}
