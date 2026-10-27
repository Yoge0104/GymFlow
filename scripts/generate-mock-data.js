const fs = require('fs');
const path = require('path');

const srcFile = path.join(__dirname, '..', 'Demo-Gym-Application-Frontend-main', 'assets', 'js', 'mock-data.js');
let raw = fs.readFileSync(srcFile, 'utf8');

// Fix conflict markers in mock-data.js
// 1. Line 6 SUPER_ADMIN_PLAN_FEATURES vs INITIAL_MOCK_DATA
raw = raw.replace(
  /<<<<<<< HEAD[\s\S]*?const SUPER_ADMIN_PLAN_FEATURES = \[([\s\S]*?)\];[\s\S]*?=======[\s\S]*?const INITIAL_MOCK_DATA = \{([\s\S]*?)>>>>>>> [a-f0-9]+/m,
  'export const SUPER_ADMIN_PLAN_FEATURES = [$1];\n\nexport const INITIAL_MOCK_DATA = {\n$2'
);

// 2. Fix members conflict
raw = raw.replace(/<<<<<<< HEAD\s*members\[\s*=======\s*members:\s*\[\s*>>>>>>> [a-f0-9]+/g, 'members: [');

// 3. Fix trainers conflict
raw = raw.replace(/<<<<<<< HEAD\s*trainers\s*\[\s*=======\s*trainers:\s*\[\s*>>>>>>> [a-f0-9]+/g, 'trainers: [');

// 4. Fix classes conflict
raw = raw.replace(/<<<<<<< HEAD\s*classes\s*\[\s*=======\s*classes:\s*\[\s*>>>>>>> [a-f0-9]+/g, 'classes: [');

// 5. Fix classBooking conflict
raw = raw.replace(/<<<<<<< HEAD\s*classBooking\s*\[\s*=======\s*classBookings:\s*\[\s*>>>>>>> [a-f0-9]+/g, 'classBookings: [');

// 6. Fix platformBilling conflict
raw = raw.replace(/<<<<<<< HEAD\s*platformBilling\s*\[\s*=======\s*platformBilling:\s*\[\s*>>>>>>> [a-f0-9]+/g, 'platformBilling: [');

// 7. Fix expenses conflict
raw = raw.replace(/<<<<<<< HEAD\s*expenses\s*\[\s*=======\s*expenses:\s*\[\s*>>>>>>> [a-f0-9]+/g, 'expenses: [');

// Check if any <<<<<<< markers remain
if (raw.includes('<<<<<<<')) {
  console.error('Warning: Conflict markers still remain in mock-data.js!');
} else {
  console.log('All conflict markers cleanly resolved in mock-data.');
}

// Convert "const INITIAL_MOCK_DATA" to export if not already
if (!raw.includes('export const INITIAL_MOCK_DATA')) {
  raw = raw.replace('const INITIAL_MOCK_DATA', 'export const INITIAL_MOCK_DATA');
}

// Now we need to append the new required modules: discounts, invoices, emailTemplates, notifications, rolePermissions, settings
const additionalSeedData = `
  // Discounts & Promotions (Landing Page Synchronized)
  discounts: [
    {
      id: "disc_summer30",
      gymId: null, // Platform-wide promotion
      name: "Summer Fitness Sprint",
      description: "Get 30% off any annual VIP or quarterly plan. Transform your body this season with full access.",
      code: "SUMMER30",
      discountType: "percentage",
      discountValue: 30,
      startDate: "2026-01-01",
      endDate: "2026-12-31",
      status: "active",
      eligiblePlanIds: ["gplan_2", "gplan_3", "saas_growth", "saas_enterprise"],
      eligibleBranchIds: [],
      minPurchaseAmount: 50,
      maxDiscountAmount: 250,
      totalUsageLimit: 100,
      usedCount: 14,
      perMemberLimit: 1,
      firstTimeOnly: false,
      isFeatured: true,
      isPublicLandingPage: true,
      landingHeadline: "Summer Fitness Sprint — 30% Off All Annual Plans!",
      landingDescription: "Commit to your fitness journey today. Use code SUMMER30 at checkout to unlock instant savings on our most popular passes.",
      badgeText: "30% OFF SPECIAL"
    },
    {
      id: "disc_flat50",
      gymId: "gym_1",
      name: "New Member Kickstart",
      description: "Flat $50 discount on your first subscription payment of $100 or more.",
      code: "FLAT50",
      discountType: "fixed",
      discountValue: 50,
      startDate: "2026-01-01",
      endDate: "2026-12-31",
      status: "active",
      eligiblePlanIds: ["gplan_2", "gplan_3"],
      eligibleBranchIds: ["br_1", "br_2"],
      minPurchaseAmount: 100,
      maxDiscountAmount: 50,
      totalUsageLimit: 200,
      usedCount: 28,
      perMemberLimit: 1,
      firstTimeOnly: true,
      isFeatured: false,
      isPublicLandingPage: true,
      landingHeadline: "New Member Kickstart — Flat $50 Off",
      landingDescription: "Start strong with an instant $50 reduction on your coaching pack or annual membership.",
      badgeText: "$50 OFF"
    },
    {
      id: "disc_welcome10",
      gymId: "gym_1",
      name: "Starter Welcome Boost",
      description: "10% off any monthly or multi-week plan for new joiners.",
      code: "WELCOME10",
      discountType: "percentage",
      discountValue: 10,
      startDate: "2026-01-01",
      endDate: "2026-12-31",
      status: "active",
      eligiblePlanIds: [],
      minPurchaseAmount: 20,
      maxDiscountAmount: 50,
      totalUsageLimit: 500,
      usedCount: 42,
      perMemberLimit: 1,
      firstTimeOnly: true,
      isFeatured: false,
      isPublicLandingPage: false,
      badgeText: "10% OFF"
    },
    {
      id: "disc_winter40_exp",
      gymId: null,
      name: "Winter Warmup 2025",
      description: "40% holiday discount (expired for demo testing).",
      code: "WINTER40",
      discountType: "percentage",
      discountValue: 40,
      startDate: "2025-11-01",
      endDate: "2025-12-31",
      status: "inactive",
      eligiblePlanIds: [],
      minPurchaseAmount: 50,
      totalUsageLimit: 50,
      usedCount: 50,
      firstTimeOnly: false,
      isFeatured: false,
      isPublicLandingPage: false
    }
  ],

  // Invoices (Full Line-Item & Status Ledger)
  invoices: [
    {
      id: "inv_101",
      invoiceNumber: "INV-2026-001",
      gymId: "gym_1",
      gymName: "IronPulse Fitness Club",
      gymAddress: "742 Evergreen Terrace, Austin, TX",
      gymPhone: "+1 (555) 234-5678",
      gymEmail: "billing@ironpulse.com",
      memberId: "mem_101",
      memberName: "Alex Morgan",
      memberEmail: "alex.morgan@example.com",
      memberPhone: "+1 (555) 101-2001",
      memberAddress: "124 Conch Street, Austin, TX",
      planId: "gplan_2",
      planName: "Annual VIP Pass",
      issueDate: "2026-03-01",
      dueDate: "2026-03-15",
      items: [
        {
          id: "item_1",
          description: "Annual VIP Pass Membership (12 Months)",
          quantity: 1,
          unitPrice: 699.00,
          discountAmount: 209.70,
          taxRate: 8,
          total: 489.30
        },
        {
          id: "item_2",
          description: "RFID Access Key & Onboarding Pack",
          quantity: 1,
          unitPrice: 25.00,
          discountAmount: 0,
          taxRate: 8,
          total: 25.00
        }
      ],
      subtotal: 724.00,
      discountAmount: 209.70,
      couponCode: "SUMMER30",
      taxRate: 8,
      taxAmount: 41.14,
      total: 555.44,
      paidAmount: 555.44,
      balanceDue: 0.00,
      status: "Paid",
      paymentMethod: "Credit Card",
      paymentTransactionIds: ["pay_101"],
      notes: "Simulated payment processed via secure demo gateway.",
      terms: "All membership sales are subject to IronPulse club house rules. No cash refunds.",
      createdAt: "2026-03-01T09:30:00Z"
    },
    {
      id: "inv_102",
      invoiceNumber: "INV-2026-002",
      gymId: "gym_1",
      gymName: "IronPulse Fitness Club",
      gymAddress: "742 Evergreen Terrace, Austin, TX",
      gymPhone: "+1 (555) 234-5678",
      gymEmail: "billing@ironpulse.com",
      memberId: "mem_102",
      memberName: "Sarah Jenkins",
      memberEmail: "sarah.j@example.com",
      memberPhone: "+1 (555) 101-2002",
      planId: "gplan_1",
      planName: "Monthly All-Access",
      issueDate: "2026-04-01",
      dueDate: "2026-04-10",
      items: [
        {
          id: "item_1",
          description: "Monthly All-Access Membership Dues (April 2026)",
          quantity: 1,
          unitPrice: 69.00,
          total: 69.00
        }
      ],
      subtotal: 69.00,
      discountAmount: 0.00,
      taxRate: 8,
      taxAmount: 5.52,
      total: 74.52,
      paidAmount: 74.52,
      balanceDue: 0.00,
      status: "Paid",
      paymentMethod: "UPI",
      paymentTransactionIds: ["pay_102"],
      notes: "Instant simulated UPI confirmation.",
      terms: "Monthly memberships auto-renew unless cancelled 7 days prior.",
      createdAt: "2026-04-01T10:15:00Z"
    },
    {
      id: "inv_103",
      invoiceNumber: "INV-2026-003",
      gymId: "gym_1",
      gymName: "IronPulse Fitness Club",
      gymAddress: "742 Evergreen Terrace, Austin, TX",
      gymPhone: "+1 (555) 234-5678",
      gymEmail: "billing@ironpulse.com",
      memberId: "mem_103",
      memberName: "Marcus Brody",
      memberEmail: "marcus.b@example.com",
      memberPhone: "+1 (555) 101-2003",
      planId: "gplan_3",
      planName: "Personal Coaching Pack",
      issueDate: "2026-04-05",
      dueDate: "2026-04-20",
      items: [
        {
          id: "item_1",
          description: "12-Week Personal Coaching & Nutrition Regimen",
          quantity: 1,
          unitPrice: 249.00,
          discountAmount: 50.00,
          taxRate: 8,
          total: 199.00
        }
      ],
      subtotal: 249.00,
      discountAmount: 50.00,
      couponCode: "FLAT50",
      taxRate: 8,
      taxAmount: 15.92,
      total: 214.92,
      paidAmount: 100.00,
      balanceDue: 114.92,
      status: "Partially Paid",
      paymentMethod: "Bank Transfer",
      paymentTransactionIds: ["pay_103"],
      notes: "First installment received; balance due by April 20.",
      terms: "Personal coaching hours expire 6 months from purchase date.",
      createdAt: "2026-04-05T14:00:00Z"
    },
    {
      id: "inv_104",
      invoiceNumber: "INV-2026-004",
      gymId: "gym_1",
      gymName: "IronPulse Fitness Club",
      gymAddress: "742 Evergreen Terrace, Austin, TX",
      gymPhone: "+1 (555) 234-5678",
      gymEmail: "billing@ironpulse.com",
      memberId: "mem_104",
      memberName: "Elena Rostova",
      memberEmail: "elena.r@example.com",
      memberPhone: "+1 (555) 101-2004",
      planId: "gplan_1",
      planName: "Monthly All-Access",
      issueDate: "2026-04-10",
      dueDate: "2026-04-25",
      items: [
        {
          id: "item_1",
          description: "Monthly All-Access Dues",
          quantity: 1,
          unitPrice: 69.00,
          total: 69.00
        }
      ],
      subtotal: 69.00,
      discountAmount: 0.00,
      taxRate: 8,
      taxAmount: 5.52,
      total: 74.52,
      paidAmount: 0.00,
      balanceDue: 74.52,
      status: "Unpaid",
      paymentTransactionIds: [],
      notes: "Invoice issued to member; pending simulated payment.",
      terms: "Payment due within 15 days of issue.",
      createdAt: "2026-04-10T08:00:00Z"
    },
    {
      id: "inv_105",
      invoiceNumber: "INV-2026-005",
      gymId: "gym_1",
      gymName: "IronPulse Fitness Club",
      gymAddress: "742 Evergreen Terrace, Austin, TX",
      gymPhone: "+1 (555) 234-5678",
      gymEmail: "billing@ironpulse.com",
      memberId: "mem_105",
      memberName: "Derek Thorne",
      memberEmail: "derek.t@example.com",
      memberPhone: "+1 (555) 101-2005",
      planId: "gplan_2",
      planName: "Annual VIP Pass",
      issueDate: "2026-02-01",
      dueDate: "2026-02-15",
      items: [
        {
          id: "item_1",
          description: "Annual VIP Membership Renewal",
          quantity: 1,
          unitPrice: 699.00,
          total: 699.00
        }
      ],
      subtotal: 699.00,
      discountAmount: 0.00,
      taxRate: 8,
      taxAmount: 55.92,
      total: 754.92,
      paidAmount: 0.00,
      balanceDue: 754.92,
      status: "Overdue",
      paymentTransactionIds: [],
      notes: "Overdue reminder sent to athlete email.",
      terms: "Facility access temporarily suspended until dues settled.",
      createdAt: "2026-02-01T12:00:00Z"
    },
    {
      id: "inv_106",
      invoiceNumber: "INV-2026-006",
      gymId: "gym_1",
      gymName: "IronPulse Fitness Club",
      gymAddress: "742 Evergreen Terrace, Austin, TX",
      gymPhone: "+1 (555) 234-5678",
      gymEmail: "billing@ironpulse.com",
      memberId: "mem_106",
      memberName: "Jordan Lee",
      memberEmail: "jordan.l@example.com",
      memberPhone: "+1 (555) 101-2006",
      planId: "gplan_1",
      planName: "Monthly All-Access",
      issueDate: "2026-04-15",
      dueDate: "2026-04-30",
      items: [
        {
          id: "item_1",
          description: "Monthly All-Access Draft Assessment",
          quantity: 1,
          unitPrice: 69.00,
          total: 69.00
        }
      ],
      subtotal: 69.00,
      discountAmount: 0.00,
      taxRate: 8,
      taxAmount: 5.52,
      total: 74.52,
      paidAmount: 0.00,
      balanceDue: 74.52,
      status: "Draft",
      paymentTransactionIds: [],
      notes: "Internal draft invoice; not yet sent to athlete.",
      terms: "Standard club terms apply upon issuance.",
      createdAt: "2026-04-15T16:20:00Z"
    }
  ],

  // Email Templates (Full 14 Required Templates)
  emailTemplates: [
    {
      id: "tpl_welcome",
      gymId: null,
      name: "Welcome Email",
      templateKey: "welcome_email",
      category: "onboarding",
      subject: "Welcome to {{gymName}}, {{memberName}}!",
      htmlBody: "<div style='font-family:sans-serif;padding:20px;max-width:600px;margin:auto;'><h2>Welcome to {{gymName}}!</h2><p>Hi {{memberName}},</p><p>We are thrilled to welcome you to our fitness family. Your membership plan <strong>{{membershipPlan}}</strong> is now active!</p><p>Download our mobile app or visit the front desk to get your digital access key.</p><p>Stay strong,<br>The {{gymName}} Team</p></div>",
      plainTextBody: "Welcome to {{gymName}}! Hi {{memberName}}, We are thrilled to welcome you. Your membership ({{membershipPlan}}) is active. Stay strong, The {{gymName}} Team",
      availablePlaceholders: ["{{memberName}}", "{{gymName}}", "{{membershipPlan}}"],
      status: "active",
      lastModified: "2026-04-01"
    },
    {
      id: "tpl_registration",
      gymId: null,
      name: "Member Registration Confirmation",
      templateKey: "member_registration",
      category: "onboarding",
      subject: "Your Registration at {{gymName}} is Confirmed",
      htmlBody: "<div style='font-family:sans-serif;padding:20px;'><h2>Registration Confirmed</h2><p>Hi {{memberName}}, your profile has been successfully created at {{gymName}}.</p></div>",
      plainTextBody: "Hi {{memberName}}, your profile has been successfully created at {{gymName}}.",
      availablePlaceholders: ["{{memberName}}", "{{gymName}}"],
      status: "active",
      lastModified: "2026-04-01"
    },
    {
      id: "tpl_membership_confirm",
      gymId: "gym_1",
      name: "Membership Confirmation",
      templateKey: "membership_confirmation",
      category: "billing",
      subject: "Membership Confirmed: {{membershipPlan}}",
      htmlBody: "<div style='font-family:sans-serif;padding:20px;'><h3>Membership Confirmed</h3><p>Dear {{memberName}}, thank you for joining {{gymName}}. Your plan <strong>{{membershipPlan}}</strong> is valid until <strong>{{membershipEndDate}}</strong>.</p></div>",
      plainTextBody: "Dear {{memberName}}, thank you for joining {{gymName}}. Plan: {{membershipPlan}}, valid until {{membershipEndDate}}.",
      availablePlaceholders: ["{{memberName}}", "{{gymName}}", "{{membershipPlan}}", "{{membershipEndDate}}"],
      status: "active",
      lastModified: "2026-04-02"
    },
    {
      id: "tpl_renewal_reminder",
      gymId: "gym_1",
      name: "Membership Renewal Reminder",
      templateKey: "renewal_reminder",
      category: "billing",
      subject: "Action Required: Your {{gymName}} Membership Renews Soon",
      htmlBody: "<div style='font-family:sans-serif;padding:20px;'><h3>Renewal Reminder</h3><p>Hi {{memberName}}, your {{membershipPlan}} expires on {{membershipEndDate}}. Renew today to lock in your discounted rate!</p></div>",
      plainTextBody: "Hi {{memberName}}, your {{membershipPlan}} expires on {{membershipEndDate}}. Renew today to lock in your rate!",
      availablePlaceholders: ["{{memberName}}", "{{gymName}}", "{{membershipPlan}}", "{{membershipEndDate}}"],
      status: "active",
      lastModified: "2026-04-05"
    },
    {
      id: "tpl_membership_expiry",
      gymId: "gym_1",
      name: "Membership Expiry Notice",
      templateKey: "membership_expiry",
      category: "billing",
      subject: "Your {{gymName}} Membership Has Expired",
      htmlBody: "<div style='font-family:sans-serif;padding:20px;'><h3>Membership Expired</h3><p>Hi {{memberName}}, your membership ended on {{membershipEndDate}}. Reactivate anytime to resume your fitness streak.</p></div>",
      plainTextBody: "Hi {{memberName}}, your membership ended on {{membershipEndDate}}. Reactivate anytime at {{gymName}}.",
      availablePlaceholders: ["{{memberName}}", "{{gymName}}", "{{membershipEndDate}}"],
      status: "active",
      lastModified: "2026-04-05"
    },
    {
      id: "tpl_payment_receipt",
      gymId: null,
      name: "Payment Receipt",
      templateKey: "payment_receipt",
      category: "billing",
      subject: "Payment Receipt for {{amount}} — {{gymName}}",
      htmlBody: "<div style='font-family:sans-serif;padding:20px;'><h3>Payment Received</h3><p>Hi {{memberName}}, we received your payment of <strong>\${{amount}}</strong> against Invoice <strong>#{{invoiceNumber}}</strong>.</p><p>Thank you for choosing {{gymName}}!</p></div>",
      plainTextBody: "Hi {{memberName}}, we received your payment of \${{amount}} for Invoice #{{invoiceNumber}}. Thank you, {{gymName}}.",
      availablePlaceholders: ["{{memberName}}", "{{gymName}}", "{{amount}}", "{{invoiceNumber}}"],
      status: "active",
      lastModified: "2026-04-10"
    },
    {
      id: "tpl_invoice_notification",
      gymId: "gym_1",
      name: "Invoice Notification",
      templateKey: "invoice_notification",
      category: "billing",
      subject: "New Invoice #{{invoiceNumber}} from {{gymName}}",
      htmlBody: "<div style='font-family:sans-serif;padding:20px;'><h3>New Invoice Available</h3><p>Hi {{memberName}}, a new invoice #{{invoiceNumber}} for \${{amount}} has been generated for your {{membershipPlan}}.</p></div>",
      plainTextBody: "Hi {{memberName}}, new invoice #{{invoiceNumber}} for \${{amount}} has been generated at {{gymName}}.",
      availablePlaceholders: ["{{memberName}}", "{{gymName}}", "{{invoiceNumber}}", "{{amount}}", "{{membershipPlan}}"],
      status: "active",
      lastModified: "2026-04-10"
    },
    {
      id: "tpl_class_confirm",
      gymId: "gym_1",
      name: "Class Booking Confirmation",
      templateKey: "class_booking_confirmation",
      category: "attendance",
      subject: "Spot Confirmed: {{className}} on {{bookingDate}}",
      htmlBody: "<div style='font-family:sans-serif;padding:20px;'><h3>You're Booked!</h3><p>Hi {{memberName}}, your spot in <strong>{{className}}</strong> on <strong>{{bookingDate}}</strong> has been confirmed at {{gymName}}.</p></div>",
      plainTextBody: "Hi {{memberName}}, spot in {{className}} on {{bookingDate}} confirmed at {{gymName}}.",
      availablePlaceholders: ["{{memberName}}", "{{gymName}}", "{{className}}", "{{bookingDate}}"],
      status: "active",
      lastModified: "2026-04-11"
    },
    {
      id: "tpl_class_cancel",
      gymId: "gym_1",
      name: "Class Booking Cancellation",
      templateKey: "class_booking_cancellation",
      category: "attendance",
      subject: "Class Cancelled: {{className}}",
      htmlBody: "<div style='font-family:sans-serif;padding:20px;'><h3>Booking Cancelled</h3><p>Hi {{memberName}}, your booking for {{className}} on {{bookingDate}} has been cancelled as requested.</p></div>",
      plainTextBody: "Hi {{memberName}}, your booking for {{className}} on {{bookingDate}} has been cancelled.",
      availablePlaceholders: ["{{memberName}}", "{{gymName}}", "{{className}}", "{{bookingDate}}"],
      status: "active",
      lastModified: "2026-04-11"
    },
    {
      id: "tpl_password_reset",
      gymId: null,
      name: "Password Reset Preview",
      templateKey: "password_reset",
      category: "system",
      subject: "Reset your {{gymName}} password",
      htmlBody: "<div style='font-family:sans-serif;padding:20px;'><h3>Password Reset Request</h3><p>Hi {{memberName}}, click the button below to safely reset your password for {{gymName}}.</p></div>",
      plainTextBody: "Hi {{memberName}}, reset your password for {{gymName}}.",
      availablePlaceholders: ["{{memberName}}", "{{gymName}}"],
      status: "active",
      lastModified: "2026-04-01"
    },
    {
      id: "tpl_ticket_ack",
      gymId: null,
      name: "Support Ticket Acknowledgement",
      templateKey: "support_ticket_ack",
      category: "support",
      subject: "[Ticket #{{supportTicketId}}] We received your request",
      htmlBody: "<div style='font-family:sans-serif;padding:20px;'><h3>Ticket Received</h3><p>Hi {{memberName}}, your support ticket <strong>#{{supportTicketId}}</strong> has been received by {{gymName}} support team.</p></div>",
      plainTextBody: "Hi {{memberName}}, support ticket #{{supportTicketId}} received at {{gymName}}.",
      availablePlaceholders: ["{{memberName}}", "{{gymName}}", "{{supportTicketId}}"],
      status: "active",
      lastModified: "2026-04-02"
    },
    {
      id: "tpl_discount_announcement",
      gymId: null,
      name: "Promotional Discount Announcement",
      templateKey: "discount_announcement",
      category: "marketing",
      subject: "Special Offer: Save {{discountAmount}} with code {{discountCode}}!",
      htmlBody: "<div style='font-family:sans-serif;padding:20px;'><h3>Limited Time Fitness Promotion</h3><p>Hi {{memberName}}, use code <strong>{{discountCode}}</strong> at {{gymName}} to save <strong>{{discountAmount}}</strong> on your next plan upgrade!</p></div>",
      plainTextBody: "Hi {{memberName}}, use code {{discountCode}} to save {{discountAmount}} at {{gymName}}!",
      availablePlaceholders: ["{{memberName}}", "{{gymName}}", "{{discountCode}}", "{{discountAmount}}"],
      status: "active",
      lastModified: "2026-04-12"
    },
    {
      id: "tpl_staff_invite",
      gymId: "gym_1",
      name: "Staff Invitation",
      templateKey: "staff_invitation",
      category: "onboarding",
      subject: "You've been invited to join the staff at {{gymName}}",
      htmlBody: "<div style='font-family:sans-serif;padding:20px;'><h3>Welcome to the Team</h3><p>Hi {{memberName}}, you have been granted staff access to {{gymName}} on GymFlow.</p></div>",
      plainTextBody: "Hi {{memberName}}, you have been granted staff access to {{gymName}}.",
      availablePlaceholders: ["{{memberName}}", "{{gymName}}"],
      status: "active",
      lastModified: "2026-04-01"
    },
    {
      id: "tpl_saas_renewal",
      gymId: null,
      name: "Platform Subscription Renewal",
      templateKey: "saas_subscription_renewal",
      category: "system",
      subject: "GymFlow SaaS: Subscription Renewal Notice for {{gymName}}",
      htmlBody: "<div style='font-family:sans-serif;padding:20px;'><h3>SaaS Renewal</h3><p>Greetings, your platform subscription for {{gymName}} (\${{amount}}) renews on {{membershipEndDate}}.</p></div>",
      plainTextBody: "Your SaaS subscription for {{gymName}} (\${{amount}}) renews on {{membershipEndDate}}.",
      availablePlaceholders: ["{{gymName}}", "{{amount}}", "{{membershipEndDate}}"],
      status: "active",
      lastModified: "2026-04-01"
    }
  ],

  // In-App Notifications
  notifications: [
    {
      id: "notif_1",
      gymId: null,
      targetRole: "SUPER_ADMIN",
      category: "platform",
      title: "New Gym Registration",
      message: "MetroPulse Gym registered for Starter SaaS tier.",
      timestamp: "2026-04-18T10:30:00Z",
      isRead: false,
      linkUrl: "/super-admin/gyms"
    },
    {
      id: "notif_2",
      gymId: "gym_1",
      targetRole: "GYM_ADMIN",
      category: "payments",
      title: "Payment Received",
      message: "Simulated payment of $555.44 received from Alex Morgan for INV-2026-001.",
      timestamp: "2026-04-18T09:15:00Z",
      isRead: false,
      linkUrl: "/admin/invoices"
    },
    {
      id: "notif_3",
      gymId: "gym_1",
      targetUserId: "mem_101",
      targetRole: "MEMBER",
      category: "classes",
      title: "Class Reminder: Morning HIIT",
      message: "Your HIIT session with Sarah Connor starts tomorrow at 07:00 AM.",
      timestamp: "2026-04-18T08:00:00Z",
      isRead: false,
      linkUrl: "/member/classes"
    },
    {
      id: "notif_4",
      gymId: "gym_1",
      targetRole: "ALL",
      category: "promotions",
      title: "Summer Fitness Sprint Live!",
      message: "30% off all annual memberships with code SUMMER30.",
      timestamp: "2026-04-17T12:00:00Z",
      isRead: true,
      linkUrl: "/member/plans"
    }
  ],

  // Central Role-Permission Matrix
  defaultRolePermissions: {
    SUPER_ADMIN: [
      "platform.view", "platform.manage", "gyms.view", "gyms.create", "gyms.update", "gyms.manage_status",
      "branches.view", "branches.manage", "members.view", "members.create", "members.update", "members.delete",
      "memberships.view", "memberships.manage", "attendance.view", "attendance.check_in",
      "trainers.view", "trainers.manage", "classes.view", "classes.manage", "bookings.view", "bookings.create", "bookings.cancel",
      "workouts.view", "workouts.manage", "payments.view", "payments.record", "payments.refund",
      "invoices.view", "invoices.create", "invoices.manage", "invoices.print",
      "expenses.view", "expenses.manage", "leads.view", "leads.manage", "equipment.view", "equipment.manage",
      "reports.view", "staff.view", "staff.manage", "roles.view", "roles.manage",
      "discounts.view", "discounts.manage", "email_templates.view", "email_templates.manage",
      "notifications.view", "notifications.manage", "support.view", "support.manage", "settings.view", "settings.manage"
    ],
    GYM_OWNER: [
      "gyms.view", "branches.view", "branches.manage", "members.view", "members.create", "members.update", "members.delete",
      "memberships.view", "memberships.manage", "attendance.view", "attendance.check_in",
      "trainers.view", "trainers.manage", "classes.view", "classes.manage", "bookings.view", "bookings.create", "bookings.cancel",
      "workouts.view", "workouts.manage", "payments.view", "payments.record", "payments.refund",
      "invoices.view", "invoices.create", "invoices.manage", "invoices.print",
      "expenses.view", "expenses.manage", "leads.view", "leads.manage", "equipment.view", "equipment.manage",
      "reports.view", "staff.view", "staff.manage", "roles.view", "roles.manage",
      "discounts.view", "discounts.manage", "email_templates.view", "email_templates.manage",
      "notifications.view", "notifications.manage", "support.view", "support.manage", "settings.view", "settings.manage"
    ],
    GYM_ADMIN: [
      "gyms.view", "branches.view", "branches.manage", "members.view", "members.create", "members.update",
      "memberships.view", "memberships.manage", "attendance.view", "attendance.check_in",
      "trainers.view", "trainers.manage", "classes.view", "classes.manage", "bookings.view", "bookings.create", "bookings.cancel",
      "workouts.view", "workouts.manage", "payments.view", "payments.record",
      "invoices.view", "invoices.create", "invoices.manage", "invoices.print",
      "expenses.view", "leads.view", "leads.manage", "equipment.view", "equipment.manage",
      "reports.view", "staff.view", "roles.view",
      "discounts.view", "discounts.manage", "email_templates.view", "email_templates.manage",
      "notifications.view", "notifications.manage", "support.view", "support.manage", "settings.view"
    ],
    BRANCH_MANAGER: [
      "branches.view", "members.view", "members.create", "members.update",
      "attendance.view", "attendance.check_in", "trainers.view", "classes.view", "classes.manage",
      "bookings.view", "bookings.create", "bookings.cancel", "workouts.view",
      "payments.view", "payments.record", "invoices.view", "invoices.create", "invoices.print",
      "equipment.view", "reports.view", "staff.view", "notifications.view", "support.view"
    ],
    TRAINER: [
      "members.view", "attendance.view", "attendance.check_in", "classes.view",
      "bookings.view", "workouts.view", "workouts.manage", "notifications.view", "support.view"
    ],
    RECEPTIONIST: [
      "members.view", "members.create", "members.update", "attendance.view", "attendance.check_in",
      "classes.view", "bookings.view", "bookings.create", "bookings.cancel",
      "payments.view", "payments.record", "invoices.view", "invoices.create", "invoices.print",
      "notifications.view", "support.view"
    ],
    ACCOUNTANT: [
      "members.view", "memberships.view", "payments.view", "payments.record", "payments.refund",
      "invoices.view", "invoices.create", "invoices.manage", "invoices.print",
      "expenses.view", "expenses.manage", "reports.view", "notifications.view"
    ],
    MEMBER: [
      "memberships.view", "attendance.view", "classes.view", "bookings.view", "bookings.create", "bookings.cancel",
      "workouts.view", "payments.view", "invoices.view", "invoices.print", "discounts.view",
      "notifications.view", "support.view"
    ]
  },

  // Platform & Gym Settings
  platformSettings: {
    appName: "GymFlow",
    supportEmail: "support@gymflow.com",
    defaultCurrency: "USD",
    currencySymbol: "$",
    taxRate: 8,
    allowPublicRegistration: true,
    maintenanceMode: false,
    demoMode: true
  },

  gymSettings: {
    gymId: "gym_1",
    name: "IronPulse Fitness Club",
    legalEntityName: "IronPulse Fitness LLC",
    phone: "+1 (555) 234-5678",
    email: "info@ironpulse.com",
    address: "742 Evergreen Terrace",
    city: "Austin, TX",
    currency: "USD",
    currencySymbol: "$",
    taxRate: 8,
    taxName: "State Sales Tax (8%)",
    invoicePrefix: "INV",
    invoiceFooterNotes: "Thank you for choosing IronPulse. Stay consistent, stay strong!",
    invoiceTerms: "Payment is due upon receipt. Inquiries: billing@ironpulse.com.",
    openingHours: "Mon - Fri: 5:00 AM - 11:00 PM | Sat - Sun: 7:00 AM - 9:00 PM"
  }
`;

// Insert additionalSeedData before the closing "};"
const lastBraceIndex = raw.lastIndexOf('};');
if (lastBraceIndex !== -1) {
  raw = raw.slice(0, lastBraceIndex) + ',\n' + additionalSeedData + '\n};';
} else {
  raw += '\n' + additionalSeedData;
}

const destDir = path.join(__dirname, '..', 'src', 'lib');
fs.mkdirSync(destDir, { recursive: true });
fs.writeFileSync(path.join(destDir, 'mock-data.ts'), raw, 'utf8');
console.log('Successfully generated src/lib/mock-data.ts');
