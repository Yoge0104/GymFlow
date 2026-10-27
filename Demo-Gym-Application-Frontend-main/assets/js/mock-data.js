/* ===================================================================
   GymFlow — Realistic Seed Mock Data
   Provides initial demonstration data across Platform, Gym, and Member scopes.
   =================================================================== */

<<<<<<< HEAD
const SUPER_ADMIN_PLAN_FEATURES = [
"Gym Registration",
"Gym Management",
"Gym Activation and Deactivation",
"Gym Verification",
"Subscription Plan Creation",
"Subscription Plan Editing",
"Subscription Plan Deletion",
"Subscription Assignment",
"Subscription Billing",
"Payment Tracking",
"Invoice Management",
"Payment History",
"Branch Limits",
"Member Limits",
"Staff Account Limits",
"Storage Limits",
"Role and Permission Management",
"Platform Analytics",
"Revenue Reports",
"Subscription Reports",
"Gym Growth Reports",
"System Health Monitoring",
"Audit Logs",
"Platform Activity Monitoring",
"Support Ticket Management",
"Platform Announcements",
"Global Settings",
"Email Configuration",
"Notification Settings",
"API Management",
"Webhook Management",
"Integration Settings"
];
=======
const INITIAL_MOCK_DATA = {
  // SaaS Subscription Plans (Platform Level)
  saasPlans: [
    {
      id: "saas_starter",
      name: "Starter",
      badge: "Popular for Single Gyms",
      monthlyPrice: 49,
      annualPrice: 470,
      maxBranches: 1,
      maxMembers: 300,
      staffLimit: 3,
      trialDays: 14,
      status: "active",
      features: [
        "1 Gym Branch",
        "Up to 300 active members",
        "Basic attendance tracking",
        "Payment & invoice generator",
        "Member web portal",
        "Email support"
      ]
    },
    {
      id: "saas_growth",
      name: "Growth",
      badge: "Most Popular",
      monthlyPrice: 99,
      annualPrice: 950,
      maxBranches: 3,
      maxMembers: 1000,
      staffLimit: 10,
      trialDays: 14,
      status: "active",
      features: [
        "Up to 3 Gym Branches",
        "Up to 1,000 active members",
        "Full trainer & class scheduling",
        "Automated recurring billing",
        "Lead CRM & sales pipeline",
        "Equipment maintenance tracker",
        "Priority 24/7 support"
      ]
    },
    {
      id: "saas_enterprise",
      name: "Enterprise Pro",
      badge: "Chains & Franchises",
      monthlyPrice: 199,
      annualPrice: 1900,
      maxBranches: 10,
      maxMembers: 5000,
      staffLimit: 50,
      trialDays: 30,
      status: "active",
      features: [
        "Up to 10 Gym Branches",
        "Up to 5,000 members",
        "Custom branding & domain",
        "Role-based access matrix",
        "Multi-branch consolidated reports",
        "Dedicated account manager",
        "API & Webhook access"
      ]
    }
  ],
>>>>>>> d832a2791cfbe3530142912a0522d7e539f037e8

  // Registered Gym Organizations (Super Admin Scope)
  gyms: [
    {
      id: "gym_1",
      name: "IronPulse Fitness Club",
      slug: "ironpulse",
      logo: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=100&h=100&fit=crop",
      owner: "Marcus Vance",
      email: "marcus@ironpulse.com",
      phone: "+1 (555) 234-5678",
      address: "742 Evergreen Terrace",
      city: "Austin, TX",
      planId: "saas_growth",
      planName: "Growth",
      status: "active", // active, trial, suspended
      registrationDate: "2025-01-15",
      renewalDate: "2026-01-15",
      mrr: 99,
      membersCount: 420,
      branchesCount: 2
    },
    {
      id: "gym_2",
      name: "Apex Performance Center",
      slug: "apex-performance",
      logo: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=100&h=100&fit=crop",
      owner: "Elena Rostova",
      email: "elena@apexperformance.com",
      phone: "+1 (555) 345-6789",
      address: "10880 Wilshire Blvd",
      city: "Los Angeles, CA",
      planId: "saas_enterprise",
      planName: "Enterprise Pro",
      status: "active",
      registrationDate: "2025-02-10",
      renewalDate: "2026-02-10",
      mrr: 199,
      membersCount: 1250,
      branchesCount: 4
    },
    {
      id: "gym_3",
      name: "Titan Barbell & Conditioning",
      slug: "titan-barbell",
      logo: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=100&h=100&fit=crop",
      owner: "Derek Thorne",
      email: "derek@titanbarbell.com",
      phone: "+1 (555) 456-7890",
      address: "350 5th Ave",
      city: "New York, NY",
      planId: "saas_growth",
      planName: "Growth",
      status: "active",
      registrationDate: "2025-03-01",
      renewalDate: "2026-03-01",
      mrr: 99,
      membersCount: 380,
      branchesCount: 1
    },
    {
      id: "gym_4",
      name: "Zenith Yoga & Wellness",
      slug: "zenith-yoga",
      logo: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=100&h=100&fit=crop",
      owner: "Sarah Jenkins",
      email: "sarah@zenithyoga.com",
      phone: "+1 (555) 567-8901",
      address: "200 Boulder Hwy",
      city: "Boulder, CO",
      planId: "saas_starter",
      planName: "Starter",
      status: "trial",
      registrationDate: "2026-04-01",
      renewalDate: "2026-04-15",
      mrr: 49,
      membersCount: 140,
      branchesCount: 1
    },
    {
      id: "gym_5",
      name: "CrossFit Vanguard",
      slug: "crossfit-vanguard",
      logo: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=100&h=100&fit=crop",
      owner: "Jake Sullivan",
      email: "jake@vanguardcf.com",
      phone: "+1 (555) 678-9012",
      address: "414 S Michigan Ave",
      city: "Chicago, IL",
      planId: "saas_growth",
      planName: "Growth",
      status: "active",
      registrationDate: "2025-05-18",
      renewalDate: "2026-05-18",
      mrr: 99,
      membersCount: 290,
      branchesCount: 2
    },
    {
      id: "gym_6",
      name: "Lumina Pilates & Sculpt",
      slug: "lumina-pilates",
      logo: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=100&h=100&fit=crop",
      owner: "Camilla Cruz",
      email: "camilla@luminapilates.com",
      phone: "+1 (555) 789-0123",
      address: "880 Biscayne Blvd",
      city: "Miami, FL",
      planId: "saas_starter",
      planName: "Starter",
      status: "active",
      registrationDate: "2025-06-20",
      renewalDate: "2026-06-20",
      mrr: 49,
      membersCount: 180,
      branchesCount: 1
    },
    {
      id: "gym_7",
      name: "Iron Kingdom Athletics",
      slug: "iron-kingdom",
      logo: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=100&h=100&fit=crop",
      owner: "Tariq Owens",
      email: "tariq@ironkingdom.com",
      phone: "+1 (555) 890-1234",
      address: "1200 Market St",
      city: "Philadelphia, PA",
      planId: "saas_starter",
      planName: "Starter",
      status: "suspended",
      registrationDate: "2025-04-11",
      renewalDate: "2026-04-11",
      mrr: 0,
      membersCount: 95,
      branchesCount: 1
    },
    {
      id: "gym_8",
      name: "MetroFlex Gym & Spa",
      slug: "metroflex-spa",
      logo: "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=100&h=100&fit=crop",
      owner: "Chloe Bennett",
      email: "chloe@metroflexgym.com",
      phone: "+1 (555) 901-2345",
      address: "600 Pine St",
      city: "Seattle, WA",
      planId: "saas_enterprise",
      planName: "Enterprise Pro",
      status: "active",
      registrationDate: "2025-07-04",
      renewalDate: "2026-07-04",
      mrr: 199,
      membersCount: 890,
      branchesCount: 3
    },
    {
      id: "gym_9",
      name: "Elevation Fitness Hub",
      slug: "elevation-fitness",
      logo: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=100&h=100&fit=crop",
      owner: "Liam Gallagher",
      email: "liam@elevationhub.com",
      phone: "+1 (555) 012-3456",
      address: "1701 California St",
      city: "Denver, CO",
      planId: "saas_growth",
      planName: "Growth",
      status: "active",
      registrationDate: "2025-08-14",
      renewalDate: "2026-08-14",
      mrr: 99,
      membersCount: 340,
      branchesCount: 2
    },
    {
      id: "gym_10",
      name: "Pulse Boxing & Fitness",
      slug: "pulse-boxing",
      logo: "https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=100&h=100&fit=crop",
      owner: "Anthony Morales",
      email: "anthony@pulseboxing.com",
      phone: "+1 (555) 123-4567",
      address: "500 Elm St",
      city: "Dallas, TX",
      planId: "saas_starter",
      planName: "Starter",
      status: "trial",
      registrationDate: "2026-04-10",
      renewalDate: "2026-04-24",
      mrr: 49,
      membersCount: 110,
      branchesCount: 1
    }
  ],

  // Branches (for default Gym: IronPulse "gym_1")
  branches: [
    {
      id: "br_1",
      gymId: "gym_1",
      name: "Downtown Flagship",
      address: "742 Evergreen Terrace, Downtown",
      city: "Austin, TX",
      phone: "+1 (555) 234-5678",
      manager: "Marcus Vance",
      memberCount: 280,
      openingHours: "Mon-Fri: 5:00 AM - 11:00 PM | Sat-Sun: 7:00 AM - 9:00 PM",
      status: "active"
    },
    {
      id: "br_2",
      gymId: "gym_1",
      name: "North Austin Studio",
      address: "10400 Research Blvd",
      city: "Austin, TX",
      phone: "+1 (555) 234-5699",
      manager: "Rachel Kim",
      memberCount: 140,
      openingHours: "Mon-Sun: 24/7 Access",
      status: "active"
    }
  ],

  // Gym-Level Membership Plans (for IronPulse Gym)
  gymPlans: [
    {
      id: "gplan_1",
      gymId: "gym_1",
      name: "Standard Monthly",
      duration: "1 Month",
      durationDays: 30,
      price: 49,
      joiningFee: 20,
      benefits: ["Access to Gym floor & free weights", "Locker room access", "1 Free Trainer Consultation"],
      status: "active"
    },
    {
      id: "gplan_2",
      gymId: "gym_1",
      name: "Quarterly Fitness Pass",
      duration: "3 Months",
      durationDays: 90,
      price: 135,
      joiningFee: 0,
      benefits: ["All gym equipment & cardio zone", "Free fitness assessment", "Access to sauna & steam room", "10% off cafe"],
      status: "active"
    },
    {
      id: "gplan_3",
      gymId: "gym_1",
      name: "Semi-Annual Club",
      duration: "6 Months",
      durationDays: 180,
      price: 250,
      joiningFee: 0,
      benefits: ["Unlimited access to both branches", "Group class access (Spin, HIIT, Yoga)", "Locker & towel service"],
      status: "active"
    },
    {
      id: "gplan_4",
      gymId: "gym_1",
      name: "Annual VIP All-Access",
      duration: "12 Months",
      durationDays: 365,
      price: 450,
      joiningFee: 0,
      benefits: ["All branches 24/7 access", "Unlimited group classes", "Monthly 1-on-1 personal training", "Guest pass every month", "Custom diet chart"],
      status: "active"
    },
    {
      id: "gplan_5",
      gymId: "gym_1",
      name: "Personal Training Elite",
      duration: "3 Months",
      durationDays: 90,
      price: 380,
      joiningFee: 0,
      benefits: ["12 one-on-one PT sessions", "Full nutrition & macro plan", "Bi-weekly body composition analysis", "Dedicated coach chat"],
      status: "active"
    }
  ],

  // Gym Members (20+ detailed records for gym_1)
<<<<<<< HEAD
  members[
=======
  members: [
>>>>>>> d832a2791cfbe3530142912a0522d7e539f037e8
    {
      id: "mem_101",
      gymId: "gym_1",
      branchId: "br_1",
      name: "Alex Morgan",
      email: "alex.morgan@example.com",
      phone: "+1 (555) 101-2001",
      gender: "Male",
      dob: "1994-08-14",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
      planId: "gplan_4",
      planName: "Annual VIP All-Access",
      startDate: "2025-05-01",
      expiryDate: "2026-05-01",
      paymentStatus: "Paid",
      status: "Active",
      emergencyContact: "Sarah Morgan (+1 555-101-9999)",
      fitnessGoal: "Hypertrophy & Muscle Tone",
      assignedTrainer: "Coach David Miller",
      notes: "Consistent morning lifter. Preparing for amateur powerlifting meet."
    },
    {
      id: "mem_102",
      gymId: "gym_1",
      branchId: "br_1",
      name: "Jessica Taylor",
      email: "jessica.t@example.com",
      phone: "+1 (555) 101-2002",
      gender: "Female",
      dob: "1998-03-22",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
      planId: "gplan_3",
      planName: "Semi-Annual Club",
      startDate: "2025-11-15",
      expiryDate: "2026-05-15",
      paymentStatus: "Paid",
      status: "Active",
      emergencyContact: "Mark Taylor (+1 555-101-8888)",
      fitnessGoal: "Weight Loss & Cardiovascular Endurance",
      assignedTrainer: "Sarah Connor",
      notes: "Loves morning HIIT and spin classes."
    },
    {
      id: "mem_103",
      gymId: "gym_1",
      branchId: "br_1",
      name: "David Kim",
      email: "david.kim@example.com",
      phone: "+1 (555) 101-2003",
      gender: "Male",
      dob: "1991-11-05",
      avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&h=100&fit=crop",
      planId: "gplan_1",
      planName: "Standard Monthly",
      startDate: "2026-03-25",
      expiryDate: "2026-04-25",
      paymentStatus: "Pending",
      status: "Expiring",
      emergencyContact: "Grace Kim (+1 555-101-7777)",
      fitnessGoal: "Strength & Mobility",
      assignedTrainer: "Coach David Miller",
      notes: "Membership renewal reminder sent."
    },
    {
      id: "mem_104",
      gymId: "gym_1",
      branchId: "br_2",
      name: "Emily Watson",
      email: "emily.w@example.com",
      phone: "+1 (555) 101-2004",
      gender: "Female",
      dob: "1996-07-19",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
      planId: "gplan_5",
      planName: "Personal Training Elite",
      startDate: "2026-02-01",
      expiryDate: "2026-05-01",
      paymentStatus: "Paid",
      status: "Active",
      emergencyContact: "John Watson (+1 555-101-6666)",
      fitnessGoal: "Post-Injury Rehabilitation & Core Strength",
      assignedTrainer: "Sarah Connor",
      notes: "Recovering from ankle sprain. Low impact exercises only."
    },
    {
      id: "mem_105",
      gymId: "gym_1",
      branchId: "br_1",
      name: "Michael Rossi",
      email: "michael.rossi@example.com",
      phone: "+1 (555) 101-2005",
      gender: "Male",
      dob: "1988-02-14",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
      planId: "gplan_2",
      planName: "Quarterly Fitness Pass",
      startDate: "2026-01-10",
      expiryDate: "2026-04-10",
      paymentStatus: "Failed",
      status: "Expired",
      emergencyContact: "Laura Rossi (+1 555-101-5555)",
      fitnessGoal: "General Fitness",
      assignedTrainer: "Marcus Steel",
      notes: "Credit card expired. Contacted on phone."
    },
    {
      id: "mem_106",
      gymId: "gym_1",
      branchId: "br_2",
      name: "Sophia Martinez",
      email: "sophia.m@example.com",
      phone: "+1 (555) 101-2006",
      gender: "Female",
      dob: "2000-05-30",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop",
      planId: "gplan_4",
      planName: "Annual VIP All-Access",
      startDate: "2025-09-01",
      expiryDate: "2026-09-01",
      paymentStatus: "Paid",
      status: "Active",
      emergencyContact: "Carlos Martinez (+1 555-101-4444)",
      fitnessGoal: "Agility & Core Balance",
      assignedTrainer: "Elena Rostova",
      notes: "Attends evening Pilates and body pump."
    },
    {
      id: "mem_107",
      gymId: "gym_1",
      branchId: "br_1",
      name: "James Wilson",
      email: "james.wilson@example.com",
      phone: "+1 (555) 101-2007",
      gender: "Male",
      dob: "1985-12-03",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
      planId: "gplan_3",
      planName: "Semi-Annual Club",
      startDate: "2025-12-01",
      expiryDate: "2026-06-01",
      paymentStatus: "Paid",
      status: "Active",
      emergencyContact: "Amy Wilson (+1 555-101-3333)",
      fitnessGoal: "Cardiovascular Health",
      assignedTrainer: "Marcus Steel",
      notes: "Early bird 6 AM workout routine."
    },
    {
      id: "mem_108",
      gymId: "gym_1",
      branchId: "br_1",
      name: "Olivia Brown",
      email: "olivia.brown@example.com",
      phone: "+1 (555) 101-2008",
      gender: "Female",
      dob: "1997-09-12",
      avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&h=100&fit=crop",
      planId: "gplan_1",
      planName: "Standard Monthly",
      startDate: "2026-03-28",
      expiryDate: "2026-04-28",
      paymentStatus: "Paid",
      status: "Expiring",
      emergencyContact: "Ben Brown (+1 555-101-2222)",
      fitnessGoal: "Fat Loss & Endurance",
      assignedTrainer: "Sarah Connor",
      notes: "Considering upgrade to Semi-Annual pass."
    },
    {
      id: "mem_109",
      gymId: "gym_1",
      branchId: "br_2",
      name: "Ethan Davis",
      email: "ethan.d@example.com",
      phone: "+1 (555) 101-2009",
      gender: "Male",
      dob: "1993-04-18",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
      planId: "gplan_4",
      planName: "Annual VIP All-Access",
      startDate: "2025-08-15",
      expiryDate: "2026-08-15",
      paymentStatus: "Paid",
      status: "Active",
      emergencyContact: "Chloe Davis (+1 555-101-1111)",
      fitnessGoal: "Powerlifting & Deadlifts",
      assignedTrainer: "Marcus Steel",
      notes: "Active competitor in regional meets."
    },
    {
      id: "mem_110",
      gymId: "gym_1",
      branchId: "br_1",
      name: "Chloe Anderson",
      email: "chloe.a@example.com",
      phone: "+1 (555) 101-2010",
      gender: "Female",
      dob: "1999-01-25",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop",
      planId: "gplan_2",
      planName: "Quarterly Fitness Pass",
      startDate: "2026-02-15",
      expiryDate: "2026-05-15",
      paymentStatus: "Paid",
      status: "Active",
      emergencyContact: "Ryan Anderson (+1 555-101-0000)",
      fitnessGoal: "Yoga & Flexibility",
      assignedTrainer: "Elena Rostova",
      notes: "Enrolled in weekend sunrise yoga."
    },
    {
      id: "mem_111",
      gymId: "gym_1",
      branchId: "br_1",
      name: "Daniel White",
      email: "daniel.w@example.com",
      phone: "+1 (555) 101-2011",
      gender: "Male",
      dob: "1992-06-10",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop",
      planId: "gplan_1",
      planName: "Standard Monthly",
      startDate: "2026-01-05",
      expiryDate: "2026-02-05",
      paymentStatus: "Pending",
      status: "Expired",
      emergencyContact: "Nancy White (+1 555-101-1234)",
      fitnessGoal: "General Fitness",
      assignedTrainer: "Coach David Miller",
      notes: "Requested a break due to work travel."
    },
    {
      id: "mem_112",
      gymId: "gym_1",
      branchId: "br_2",
      name: "Ava Campbell",
      email: "ava.campbell@example.com",
      phone: "+1 (555) 101-2012",
      gender: "Female",
      dob: "2001-10-08",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
      planId: "gplan_5",
      planName: "Personal Training Elite",
      startDate: "2026-03-01",
      expiryDate: "2026-06-01",
      paymentStatus: "Paid",
      status: "Active",
      emergencyContact: "Thomas Campbell (+1 555-101-5678)",
      fitnessGoal: "Athletic Conditioning",
      assignedTrainer: "Sarah Connor",
      notes: "College soccer player off-season training."
    },
    {
      id: "mem_113",
      gymId: "gym_1",
      branchId: "br_1",
      name: "Lucas Scott",
      email: "lucas.scott@example.com",
      phone: "+1 (555) 101-2013",
      gender: "Male",
      dob: "1995-03-17",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop",
      planId: "gplan_4",
      planName: "Annual VIP All-Access",
      startDate: "2025-10-10",
      expiryDate: "2026-10-10",
      paymentStatus: "Paid",
      status: "Active",
      emergencyContact: "Haley Scott (+1 555-101-9012)",
      fitnessGoal: "Functional Hypertrophy",
      assignedTrainer: "Marcus Steel",
      notes: "Always brings guest on Saturdays."
    },
    {
      id: "mem_114",
      gymId: "gym_1",
      branchId: "br_1",
      name: "Mia Robinson",
      email: "mia.robinson@example.com",
      phone: "+1 (555) 101-2014",
      gender: "Female",
      dob: "1996-12-29",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop",
      planId: "gplan_3",
      planName: "Semi-Annual Club",
      startDate: "2026-01-15",
      expiryDate: "2026-07-15",
      paymentStatus: "Paid",
      status: "Active",
      emergencyContact: "Gary Robinson (+1 555-101-3456)",
      fitnessGoal: "Pilates & Core Stability",
      assignedTrainer: "Elena Rostova",
      notes: "Prefers evening class slots."
    },
    {
      id: "mem_115",
      gymId: "gym_1",
      branchId: "br_2",
      name: "Noah Clarke",
      email: "noah.clarke@example.com",
      phone: "+1 (555) 101-2015",
      gender: "Male",
      dob: "1989-08-04",
      avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&h=100&fit=crop",
      planId: "gplan_1",
      planName: "Standard Monthly",
      startDate: "2026-03-10",
      expiryDate: "2026-04-10",
      paymentStatus: "Paid",
      status: "Expiring",
      emergencyContact: "Karen Clarke (+1 555-101-7890)",
      fitnessGoal: "Weight Loss",
      assignedTrainer: "Coach David Miller",
      notes: "Lost 4kg in first month. Very dedicated."
    },
    {
      id: "mem_116",
      gymId: "gym_1",
      branchId: "br_1",
      name: "Harper Lee",
      email: "harper.lee@example.com",
      phone: "+1 (555) 101-2016",
      gender: "Female",
      dob: "1997-04-02",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop",
      planId: "gplan_2",
      planName: "Quarterly Fitness Pass",
      startDate: "2026-02-01",
      expiryDate: "2026-05-01",
      paymentStatus: "Paid",
      status: "Active",
      emergencyContact: "Sam Lee (+1 555-101-2345)",
      fitnessGoal: "High Intensity Cardio",
      assignedTrainer: "Sarah Connor",
      notes: "Regular in Tuesday evening Spin."
    },
    {
      id: "mem_117",
      gymId: "gym_1",
      branchId: "br_2",
      name: "Benjamin Foster",
      email: "benjamin.f@example.com",
      phone: "+1 (555) 101-2017",
      gender: "Male",
      dob: "1987-05-16",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
      planId: "gplan_4",
      planName: "Annual VIP All-Access",
      startDate: "2025-11-01",
      expiryDate: "2026-11-01",
      paymentStatus: "Paid",
      status: "Active",
      emergencyContact: "Hannah Foster (+1 555-101-6789)",
      fitnessGoal: "General Wellness & Stress Relief",
      assignedTrainer: "Coach David Miller",
      notes: "Uses sauna daily."
    },
    {
      id: "mem_118",
      gymId: "gym_1",
      branchId: "br_1",
      name: "Ella Garcia",
      email: "ella.garcia@example.com",
      phone: "+1 (555) 101-2018",
      gender: "Female",
      dob: "2002-02-11",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
      planId: "gplan_1",
      planName: "Standard Monthly",
      startDate: "2026-03-20",
      expiryDate: "2026-04-20",
      paymentStatus: "Paid",
      status: "Active",
      emergencyContact: "Luis Garcia (+1 555-101-0123)",
      fitnessGoal: "Weight Gain & Tone",
      assignedTrainer: "Marcus Steel",
      notes: "Student discount applied."
    },
    {
      id: "mem_119",
      gymId: "gym_1",
      branchId: "br_1",
      name: "William Wright",
      email: "william.w@example.com",
      phone: "+1 (555) 101-2019",
      gender: "Male",
      dob: "1990-09-21",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
      planId: "gplan_3",
      planName: "Semi-Annual Club",
      startDate: "2025-12-10",
      expiryDate: "2026-06-10",
      paymentStatus: "Paid",
      status: "Active",
      emergencyContact: "Clara Wright (+1 555-101-4567)",
      fitnessGoal: "Marathon Preparation",
      assignedTrainer: "Sarah Connor",
      notes: "Focusing on treadmill cadence."
    },
    {
      id: "mem_120",
      gymId: "gym_1",
      branchId: "br_2",
      name: "Zoe Patel",
      email: "zoe.patel@example.com",
      phone: "+1 (555) 101-2020",
      gender: "Female",
      dob: "1995-07-07",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
      planId: "gplan_5",
      planName: "Personal Training Elite",
      startDate: "2026-01-20",
      expiryDate: "2026-04-20",
      paymentStatus: "Pending",
      status: "Expiring",
      emergencyContact: "Raj Patel (+1 555-101-8901)",
      fitnessGoal: "Postpartum Fitness",
      assignedTrainer: "Elena Rostova",
      notes: "Requested renewal with same trainer."
    }
  ],

  // Trainers (Gym Level)
<<<<<<< HEAD
  trainers [
=======
  trainers: [
>>>>>>> d832a2791cfbe3530142912a0522d7e539f037e8
    {
      id: "tr_1",
      gymId: "gym_1",
      name: "David Miller",
      email: "david.m@ironpulse.com",
      phone: "+1 (555) 301-1111",
      avatar: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=100&h=100&fit=crop",
      specialization: "Hypertrophy & Strength Conditioning",
      experience: "8 years",
      assignedClasses: ["Crossfit WOD", "Powerlifting Masters"],
      availability: "Mon - Fri (6 AM - 2 PM)",
      status: "active",
      rating: 4.9,
      clientCount: 14
    },
    {
      id: "tr_2",
      gymId: "gym_1",
      name: "Sarah Connor",
      email: "sarah.c@ironpulse.com",
      phone: "+1 (555) 301-2222",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop",
      specialization: "HIIT, Spin & Cardio Conditioning",
      experience: "6 years",
      assignedClasses: ["Morning HIIT Blast", "RPM Spin Turbo"],
      availability: "Mon - Sat (7 AM - 3 PM)",
      status: "active",
      rating: 4.8,
      clientCount: 18
    },
    {
      id: "tr_3",
      gymId: "gym_1",
      name: "Marcus Steel",
      email: "marcus.s@ironpulse.com",
      phone: "+1 (555) 301-3333",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
      specialization: "Olympic Weightlifting & Functional Mobility",
      experience: "10 years",
      assignedClasses: ["Barbell Basics", "Core & Shred"],
      availability: "Tue - Sat (12 PM - 8 PM)",
      status: "active",
      rating: 5.0,
      clientCount: 12
    },
    {
      id: "tr_4",
      gymId: "gym_1",
      name: "Elena Rostova",
      email: "elena.r@ironpulse.com",
      phone: "+1 (555) 301-4444",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop",
      specialization: "Vinyasa Yoga, Pilates & Flexibility",
      experience: "7 years",
      assignedClasses: ["Sunrise Yoga Flow", "Mat Pilates & Core"],
      availability: "Mon - Fri (8 AM - 4 PM)",
      status: "active",
      rating: 4.9,
      clientCount: 22
    },
    {
      id: "tr_5",
      gymId: "gym_1",
      name: "Leo Torres",
      email: "leo.t@ironpulse.com",
      phone: "+1 (555) 301-5555",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop",
      specialization: "Boxing Conditioning & Kickboxing",
      experience: "5 years",
      assignedClasses: ["Boxing Conditioning 101"],
      availability: "Mon - Thu (3 PM - 9 PM)",
      status: "active",
      rating: 4.7,
      clientCount: 9
    }
  ],

  // Classes & Group Schedules (Gym Level)
<<<<<<< HEAD
  classes [
=======
  classes: [
>>>>>>> d832a2791cfbe3530142912a0522d7e539f037e8
    {
      id: "cls_1",
      gymId: "gym_1",
      branchId: "br_1",
      name: "Morning HIIT Blast",
      category: "HIIT",
      trainerId: "tr_2",
      trainerName: "Sarah Connor",
      dayOfWeek: "Monday",
      date: "2026-04-27",
      time: "07:00 AM",
      duration: "45 mins",
      capacity: 20,
      bookedCount: 16,
      room: "Studio A",
      status: "active"
    },
    {
      id: "cls_2",
      gymId: "gym_1",
      branchId: "br_1",
      name: "Sunrise Yoga Flow",
      category: "Yoga",
      trainerId: "tr_4",
      trainerName: "Elena Rostova",
      dayOfWeek: "Tuesday",
      date: "2026-04-28",
      time: "08:00 AM",
      duration: "60 mins",
      capacity: 25,
      bookedCount: 22,
      room: "Zen Studio",
      status: "active"
    },
    {
      id: "cls_3",
      gymId: "gym_1",
      branchId: "br_1",
      name: "RPM Spin Turbo",
      category: "Spin",
      trainerId: "tr_2",
      trainerName: "Sarah Connor",
      dayOfWeek: "Wednesday",
      date: "2026-04-29",
      time: "06:00 PM",
      duration: "50 mins",
      capacity: 18,
      bookedCount: 18, // Full
      room: "Cycle Arena",
      status: "active"
    },
    {
      id: "cls_4",
      gymId: "gym_1",
      branchId: "br_2",
      name: "Barbell Basics & Power",
      category: "Strength",
      trainerId: "tr_3",
      trainerName: "Marcus Steel",
      dayOfWeek: "Thursday",
      date: "2026-04-30",
      time: "05:30 PM",
      duration: "60 mins",
      capacity: 12,
      bookedCount: 8,
      room: "CrossFit Pit",
      status: "active"
    },
    {
      id: "cls_5",
      gymId: "gym_1",
      branchId: "br_1",
      name: "Boxing Conditioning 101",
      category: "Boxing",
      trainerId: "tr_5",
      trainerName: "Leo Torres",
      dayOfWeek: "Friday",
      date: "2026-05-01",
      time: "06:30 PM",
      duration: "55 mins",
      capacity: 15,
      bookedCount: 11,
      room: "Combat Ring",
      status: "active"
    },
    {
      id: "cls_6",
      gymId: "gym_1",
      branchId: "br_1",
      name: "Mat Pilates & Core Strength",
      category: "Pilates",
      trainerId: "tr_4",
      trainerName: "Elena Rostova",
      dayOfWeek: "Saturday",
      date: "2026-05-02",
      time: "10:00 AM",
      duration: "50 mins",
      capacity: 20,
      bookedCount: 14,
      room: "Zen Studio",
      status: "active"
    }
  ],

  // Class Bookings (Member level bookings)
<<<<<<< HEAD
  classBooking [
=======
  classBookings: [
>>>>>>> d832a2791cfbe3530142912a0522d7e539f037e8
    {
      id: "bk_101",
      gymId: "gym_1",
      memberId: "mem_101",
      memberName: "Alex Morgan",
      classId: "cls_1",
      className: "Morning HIIT Blast",
      trainerName: "Sarah Connor",
      date: "2026-04-27",
      time: "07:00 AM",
      bookingDate: "2026-04-20",
      status: "Confirmed" // Confirmed, Cancelled, Attended
    },
    {
      id: "bk_102",
      gymId: "gym_1",
      memberId: "mem_101",
      memberName: "Alex Morgan",
      classId: "cls_4",
      className: "Barbell Basics & Power",
      trainerName: "Marcus Steel",
      date: "2026-04-30",
      time: "05:30 PM",
      bookingDate: "2026-04-21",
      status: "Confirmed"
    },
    {
      id: "bk_103",
      gymId: "gym_1",
      memberId: "mem_102",
      memberName: "Jessica Taylor",
      classId: "cls_1",
      className: "Morning HIIT Blast",
      trainerName: "Sarah Connor",
      date: "2026-04-27",
      time: "07:00 AM",
      bookingDate: "2026-04-19",
      status: "Confirmed"
    },
    {
      id: "bk_104",
      gymId: "gym_1",
      memberId: "mem_102",
      memberName: "Jessica Taylor",
      classId: "cls_3",
      className: "RPM Spin Turbo",
      trainerName: "Sarah Connor",
      date: "2026-04-29",
      time: "06:00 PM",
      bookingDate: "2026-04-18",
      status: "Confirmed"
    },
    {
      id: "bk_105",
      gymId: "gym_1",
      memberId: "mem_106",
      memberName: "Sophia Martinez",
      classId: "cls_2",
      className: "Sunrise Yoga Flow",
      trainerName: "Elena Rostova",
      date: "2026-04-28",
      time: "08:00 AM",
      bookingDate: "2026-04-20",
      status: "Confirmed"
    },
    {
      id: "bk_106",
      gymId: "gym_1",
      memberId: "mem_110",
      memberName: "Chloe Anderson",
      classId: "cls_2",
      className: "Sunrise Yoga Flow",
      trainerName: "Elena Rostova",
      date: "2026-04-28",
      time: "08:00 AM",
      bookingDate: "2026-04-19",
      status: "Confirmed"
    },
    {
      id: "bk_107",
      gymId: "gym_1",
      memberId: "mem_107",
      memberName: "James Wilson",
      classId: "cls_5",
      className: "Boxing Conditioning 101",
      trainerName: "Leo Torres",
      date: "2026-05-01",
      time: "06:30 PM",
      bookingDate: "2026-04-21",
      status: "Confirmed"
    }
  ],

  // Today & Recent Attendance Records
  attendance: [
    {
      id: "att_1",
      gymId: "gym_1",
      branchId: "br_1",
      memberId: "mem_101",
      memberName: "Alex Morgan",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
      date: "2026-04-21",
      checkInTime: "06:15 AM",
      checkOutTime: "07:45 AM",
      status: "Checked-Out"
    },
    {
      id: "att_2",
      gymId: "gym_1",
      branchId: "br_1",
      memberId: "mem_102",
      memberName: "Jessica Taylor",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
      date: "2026-04-21",
      checkInTime: "07:05 AM",
      checkOutTime: "08:20 AM",
      status: "Checked-Out"
    },
    {
      id: "att_3",
      gymId: "gym_1",
      branchId: "br_2",
      memberId: "mem_104",
      memberName: "Emily Watson",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
      date: "2026-04-21",
      checkInTime: "08:30 AM",
      checkOutTime: "--",
      status: "In Gym"
    },
    {
      id: "att_4",
      gymId: "gym_1",
      branchId: "br_1",
      memberId: "mem_106",
      memberName: "Sophia Martinez",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop",
      date: "2026-04-21",
      checkInTime: "09:00 AM",
      checkOutTime: "--",
      status: "In Gym"
    },
    {
      id: "att_5",
      gymId: "gym_1",
      branchId: "br_1",
      memberId: "mem_107",
      memberName: "James Wilson",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
      date: "2026-04-21",
      checkInTime: "06:00 AM",
      checkOutTime: "07:15 AM",
      status: "Checked-Out"
    },
    {
      id: "att_6",
      gymId: "gym_1",
      branchId: "br_2",
      memberId: "mem_109",
      memberName: "Ethan Davis",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
      date: "2026-04-21",
      checkInTime: "10:15 AM",
      checkOutTime: "--",
      status: "In Gym"
    },
    {
      id: "att_7",
      gymId: "gym_1",
      branchId: "br_1",
      memberId: "mem_113",
      memberName: "Lucas Scott",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop",
      date: "2026-04-20",
      checkInTime: "05:45 PM",
      checkOutTime: "07:00 PM",
      status: "Checked-Out"
    },
    {
      id: "att_8",
      gymId: "gym_1",
      branchId: "br_1",
      memberId: "mem_116",
      memberName: "Harper Lee",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop",
      date: "2026-04-20",
      checkInTime: "06:30 PM",
      checkOutTime: "07:35 PM",
      status: "Checked-Out"
    },
    {
      id: "att_9",
      gymId: "gym_1",
      branchId: "br_2",
      memberId: "mem_117",
      memberName: "Benjamin Foster",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
      date: "2026-04-20",
      checkInTime: "07:10 AM",
      checkOutTime: "08:45 AM",
      status: "Checked-Out"
    },
    {
      id: "att_10",
      gymId: "gym_1",
      branchId: "br_1",
      memberId: "mem_119",
      memberName: "William Wright",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
      date: "2026-04-20",
      checkInTime: "06:30 AM",
      checkOutTime: "08:00 AM",
      status: "Checked-Out"
    }
  ],

  // Payments & Financial Transactions (Gym & Platform Level)
  payments: [
    {
      id: "pay_1001",
      gymId: "gym_1",
      memberId: "mem_101",
      memberName: "Alex Morgan",
      invoiceNo: "INV-2025-0501",
      description: "Annual VIP All-Access Plan",
      amount: 450.00,
      date: "2025-05-01",
      method: "Credit Card (Stripe)",
      status: "Paid"
    },
    {
      id: "pay_1002",
      gymId: "gym_1",
      memberId: "mem_102",
      memberName: "Jessica Taylor",
      invoiceNo: "INV-2025-1115",
      description: "Semi-Annual Club Pass",
      amount: 250.00,
      date: "2025-11-15",
      method: "Credit Card",
      status: "Paid"
    },
    {
      id: "pay_1003",
      gymId: "gym_1",
      memberId: "mem_104",
      memberName: "Emily Watson",
      invoiceNo: "INV-2026-0201",
      description: "Personal Training Elite",
      amount: 380.00,
      date: "2026-02-01",
      method: "Bank Transfer",
      status: "Paid"
    },
    {
      id: "pay_1004",
      gymId: "gym_1",
      memberId: "mem_103",
      memberName: "David Kim",
      invoiceNo: "INV-2026-0325",
      description: "Standard Monthly Renewal",
      amount: 49.00,
      date: "2026-03-25",
      method: "UPI / QR",
      status: "Pending"
    },
    {
      id: "pay_1005",
      gymId: "gym_1",
      memberId: "mem_105",
      memberName: "Michael Rossi",
      invoiceNo: "INV-2026-0410",
      description: "Quarterly Fitness Pass",
      amount: 135.00,
      date: "2026-04-10",
      method: "Credit Card",
      status: "Failed"
    },
    {
      id: "pay_1006",
      gymId: "gym_1",
      memberId: "mem_106",
      memberName: "Sophia Martinez",
      invoiceNo: "INV-2025-0901",
      description: "Annual VIP All-Access Plan",
      amount: 450.00,
      date: "2025-09-01",
      method: "Credit Card",
      status: "Paid"
    },
    {
      id: "pay_1007",
      gymId: "gym_1",
      memberId: "mem_107",
      memberName: "James Wilson",
      invoiceNo: "INV-2025-1201",
      description: "Semi-Annual Club Pass",
      amount: 250.00,
      date: "2025-12-01",
      method: "Debit Card",
      status: "Paid"
    },
    {
      id: "pay_1008",
      gymId: "gym_1",
      memberId: "mem_108",
      memberName: "Olivia Brown",
      invoiceNo: "INV-2026-0328",
      description: "Standard Monthly Pass + Joining Fee",
      amount: 69.00,
      date: "2026-03-28",
      method: "Cash",
      status: "Paid"
    },
    {
      id: "pay_1009",
      gymId: "gym_1",
      memberId: "mem_109",
      memberName: "Ethan Davis",
      invoiceNo: "INV-2025-0815",
      description: "Annual VIP All-Access Plan",
      amount: 450.00,
      date: "2025-08-15",
      method: "Credit Card",
      status: "Paid"
    },
    {
      id: "pay_1010",
      gymId: "gym_1",
      memberId: "mem_110",
      memberName: "Chloe Anderson",
      invoiceNo: "INV-2026-0215",
      description: "Quarterly Fitness Pass",
      amount: 135.00,
      date: "2026-02-15",
      method: "PayPal",
      status: "Paid"
    },
    {
      id: "pay_1011",
      gymId: "gym_1",
      memberId: "mem_112",
      memberName: "Ava Campbell",
      invoiceNo: "INV-2026-0301",
      description: "Personal Training Elite",
      amount: 380.00,
      date: "2026-03-01",
      method: "Credit Card",
      status: "Paid"
    },
    {
      id: "pay_1012",
      gymId: "gym_1",
      memberId: "mem_114",
      memberName: "Mia Robinson",
      invoiceNo: "INV-2026-0115",
      description: "Semi-Annual Club Pass",
      amount: 250.00,
      date: "2026-01-15",
      method: "Stripe",
      status: "Paid"
    }
  ],

  // Platform Level Billing Transactions (Super Admin Scope)
<<<<<<< HEAD
  platformBilling [
=======
  platformBilling: [
>>>>>>> d832a2791cfbe3530142912a0522d7e539f037e8
    {
      id: "saas_tx_901",
      invoiceNo: "SAAS-INV-2026-04",
      gymId: "gym_1",
      gymName: "IronPulse Fitness Club",
      planName: "Growth",
      amount: 99.00,
      date: "2026-04-15",
      method: "Stripe Automatic",
      status: "Paid",
      refundStatus: "None"
    },
    {
      id: "saas_tx_902",
      invoiceNo: "SAAS-INV-2026-03",
      gymId: "gym_2",
      gymName: "Apex Performance Center",
      planName: "Enterprise Pro",
      amount: 199.00,
      date: "2026-04-10",
      method: "Credit Card",
      status: "Paid",
      refundStatus: "None"
    },
    {
      id: "saas_tx_903",
      invoiceNo: "SAAS-INV-2026-02",
      gymId: "gym_3",
      gymName: "Titan Barbell & Conditioning",
      planName: "Growth",
      amount: 99.00,
      date: "2026-04-01",
      method: "Stripe Automatic",
      status: "Paid",
      refundStatus: "None"
    },
    {
      id: "saas_tx_904",
      invoiceNo: "SAAS-INV-2026-01",
      gymId: "gym_7",
      gymName: "Iron Kingdom Athletics",
      planName: "Starter",
      amount: 49.00,
      date: "2026-04-11",
      method: "Credit Card",
      status: "Failed",
      refundStatus: "None"
    },
    {
      id: "saas_tx_905",
      invoiceNo: "SAAS-INV-2026-05",
      gymId: "gym_5",
      gymName: "CrossFit Vanguard",
      planName: "Growth",
      amount: 99.00,
      date: "2026-04-18",
      method: "Stripe Automatic",
      status: "Paid",
      refundStatus: "None"
    },
    {
      id: "saas_tx_906",
      invoiceNo: "SAAS-INV-2026-06",
      gymId: "gym_8",
      gymName: "MetroFlex Gym & Spa",
      planName: "Enterprise Pro",
      amount: 199.00,
      date: "2026-04-04",
      method: "Credit Card",
      status: "Paid",
      refundStatus: "None"
    }
  ],

  // Gym Operational Expenses (Gym Admin Level)
<<<<<<< HEAD
  expenses [
=======
  expenses: [
>>>>>>> d832a2791cfbe3530142912a0522d7e539f037e8
    {
      id: "exp_1",
      gymId: "gym_1",
      category: "Facility Rent",
      description: "Downtown Branch Monthly Rent",
      amount: 3200.00,
      date: "2026-04-01",
      vendor: "Austin Commercial Properties LLC",
      paymentMethod: "Wire Transfer",
      notes: "Approved by Owner"
    },
    {
      id: "exp_2",
      gymId: "gym_1",
      category: "Trainer Payroll",
      description: "Bi-weekly trainer compensation",
      amount: 4850.00,
      date: "2026-04-15",
      vendor: "Internal Payroll Direct Deposit",
      paymentMethod: "Bank Transfer",
      notes: "Covered 5 trainers + bonuses"
    },
    {
      id: "exp_3",
      gymId: "gym_1",
      category: "Utilities & Power",
      description: "Electricity, Water, HVAC",
      amount: 840.00,
      date: "2026-04-10",
      vendor: "Austin Energy",
      paymentMethod: "Auto Debit",
      notes: "Includes 24/7 HVAC cooling"
    },
    {
      id: "exp_4",
      gymId: "gym_1",
      category: "Equipment Maintenance",
      description: "Treadmill belt replacement & cable servicing",
      amount: 420.00,
      date: "2026-04-08",
      vendor: "FitTech Service Pros",
      paymentMethod: "Credit Card",
      notes: "Serviced 3 treadmills and 2 cable stations"
    },
    {
      id: "exp_5",
      gymId: "gym_1",
      category: "Supplies & Hygiene",
      description: "Disinfectant wipes, locker room towels & soap",
      amount: 310.00,
      date: "2026-04-12",
      vendor: "CleanGym Supplies Co.",
      paymentMethod: "Debit Card",
      notes: "Monthly bulk order"
    }
  ],

  // Leads & Sales CRM (Gym Admin Level)
  leads: [
    {
      id: "ld_1",
      gymId: "gym_1",
      name: "Marcus Brody",
      email: "marcus.brody@example.com",
      phone: "+1 (555) 888-1122",
      interestedPlan: "Semi-Annual Club",
      source: "Instagram Ad",
      assignedStaff: "Coach David Miller",
      followUpDate: "2026-04-23",
      status: "Trial Scheduled", // New, Contacted, Trial Scheduled, Converted, Lost
      notes: "Interested in free weights and evening cardio."
    },
    {
      id: "ld_2",
      gymId: "gym_1",
      name: "Samantha Reed",
      email: "samantha.reed@example.com",
      phone: "+1 (555) 888-2233",
      interestedPlan: "Personal Training Elite",
      source: "Google Search",
      assignedStaff: "Sarah Connor",
      followUpDate: "2026-04-22",
      status: "Contacted",
      notes: "Wants 1-on-1 guidance for marathon rehab."
    },
    {
      id: "ld_3",
      gymId: "gym_1",
      name: "Tyler Jenkins",
      email: "tyler.j@example.com",
      phone: "+1 (555) 888-3344",
      interestedPlan: "Annual VIP All-Access",
      source: "Walk-in",
      assignedStaff: "Marcus Vance",
      followUpDate: "2026-04-24",
      status: "New",
      notes: "Toured facility today, showed great interest in sauna."
    },
    {
      id: "ld_4",
      gymId: "gym_1",
      name: "Valerie Gomez",
      email: "valerie.g@example.com",
      phone: "+1 (555) 888-4455",
      interestedPlan: "Standard Monthly",
      source: "Member Referral",
      assignedStaff: "Rachel Kim",
      followUpDate: "2026-04-20",
      status: "Converted",
      notes: "Joined as mem_118 (Ella Garcia referral)."
    },
    {
      id: "ld_5",
      gymId: "gym_1",
      name: "Brandon Cole",
      email: "b.cole@example.com",
      phone: "+1 (555) 888-5566",
      interestedPlan: "Quarterly Fitness Pass",
      source: "Flyer",
      assignedStaff: "Coach David Miller",
      followUpDate: "2026-04-18",
      status: "Lost",
      notes: "Moved out of town for university."
    }
  ],

  // Gym Equipment Inventory
  equipment: [
    {
      id: "eq_1",
      gymId: "gym_1",
      branchId: "br_1",
      name: "LifeFitness Pro Treadmill #1",
      category: "Cardio",
      model: "Elevation 95T",
      purchaseDate: "2024-03-10",
      condition: "Good", // Excellent, Good, Needs Service, Under Maintenance
      warrantyExpiry: "2027-03-10",
      lastMaintenance: "2026-03-15",
      nextMaintenance: "2026-06-15"
    },
    {
      id: "eq_2",
      gymId: "gym_1",
      branchId: "br_1",
      name: "Rogue Monster Power Rack A",
      category: "Free Weights & Racks",
      model: "RM-4 Bolt-Together",
      purchaseDate: "2024-01-15",
      condition: "Excellent",
      warrantyExpiry: "2029-01-15",
      lastMaintenance: "2026-02-10",
      nextMaintenance: "2026-08-10"
    },
    {
      id: "eq_3",
      gymId: "gym_1",
      branchId: "br_1",
      name: "Concept2 RowErg Model D",
      category: "Cardio",
      model: "PM5 Rower",
      purchaseDate: "2024-05-20",
      condition: "Needs Service",
      warrantyExpiry: "2026-05-20",
      lastMaintenance: "2025-11-20",
      nextMaintenance: "2026-04-25"
    },
    {
      id: "eq_4",
      gymId: "gym_1",
      branchId: "br_1",
      name: "Dual Adjustable Pulley Cable Machine",
      category: "Cable & Selectorized",
      model: "Precor FTS Glide",
      purchaseDate: "2024-06-12",
      condition: "Under Maintenance",
      warrantyExpiry: "2027-06-12",
      lastMaintenance: "2026-04-18",
      nextMaintenance: "2026-04-24"
    },
    {
      id: "eq_5",
      gymId: "gym_1",
      branchId: "br_2",
      name: "Hammer Strength Leg Press",
      category: "Plate Loaded",
      model: "Linear 45-Degree",
      purchaseDate: "2024-02-28",
      condition: "Excellent",
      warrantyExpiry: "2028-02-28",
      lastMaintenance: "2026-01-30",
      nextMaintenance: "2026-07-30"
    },
    {
      id: "eq_6",
      gymId: "gym_1",
      branchId: "br_2",
      name: "Keiser M3i Indoor Cycle #4",
      category: "Spin",
      model: "M3i Bluetooth",
      purchaseDate: "2024-08-10",
      condition: "Good",
      warrantyExpiry: "2027-08-10",
      lastMaintenance: "2026-02-15",
      nextMaintenance: "2026-05-15"
    }
  ],

  // Equipment Maintenance Records
  maintenance: [
    {
      id: "maint_1",
      gymId: "gym_1",
      equipmentId: "eq_4",
      equipmentName: "Dual Adjustable Pulley Cable Machine",
      issue: "Right side top pulley cable frayed and sticking",
      priority: "High",
      reportedDate: "2026-04-18",
      assignedTechnician: "FitTech Service Pros (Keith)",
      estimatedCost: 180.00,
      status: "In Progress" // Reported, In Progress, Completed
    },
    {
      id: "maint_2",
      gymId: "gym_1",
      equipmentId: "eq_3",
      equipmentName: "Concept2 RowErg Model D",
      issue: "Flywheel damper loose and sensor intermittent",
      priority: "Medium",
      reportedDate: "2026-04-19",
      assignedTechnician: "Keith Vance",
      estimatedCost: 75.00,
      status: "Reported"
    },
    {
      id: "maint_3",
      gymId: "gym_1",
      equipmentId: "eq_1",
      equipmentName: "LifeFitness Pro Treadmill #1",
      issue: "Routine 6-month belt lubrication and motor calibration",
      priority: "Low",
      reportedDate: "2026-03-14",
      assignedTechnician: "FitTech Service Pros",
      estimatedCost: 120.00,
      status: "Completed"
    }
  ],

  // Workout Plans (Assigned to Members)
  workoutPlans: [
    {
      id: "wp_1",
      gymId: "gym_1",
      memberId: "mem_101",
      memberName: "Alex Morgan",
      trainerName: "Coach David Miller",
      title: "Hypertrophy 4-Day Push/Pull/Legs Split",
      goal: "Muscle Building & Strength",
      assignedDate: "2026-04-01",
      weeklySchedule: [
        {
          day: "Monday (Push Day)",
          exercises: [
            { name: "Barbell Bench Press", sets: 4, reps: "8-10", weight: "185 lbs", completed: true },
            { name: "Incline Dumbbell Press", sets: 3, reps: "10-12", weight: "65 lbs", completed: true },
            { name: "Standing Overhead Military Press", sets: 3, reps: "8-10", weight: "115 lbs", completed: true },
            { name: "Tricep Rope Pushdowns", sets: 4, reps: "12-15", weight: "55 lbs", completed: false }
          ]
        },
        {
          day: "Tuesday (Pull Day)",
          exercises: [
            { name: "Barbell Deadlift", sets: 4, reps: "5-6", weight: "275 lbs", completed: true },
            { name: "Lat Pulldown Wide Grip", sets: 4, reps: "10-12", weight: "140 lbs", completed: true },
            { name: "Seated Cable Rows", sets: 3, reps: "10-12", weight: "130 lbs", completed: false },
            { name: "Barbell Bicep Curls", sets: 3, reps: "12", weight: "65 lbs", completed: false }
          ]
        },
        {
          day: "Thursday (Legs & Core)",
          exercises: [
            { name: "Barbell Back Squat", sets: 4, reps: "8-10", weight: "225 lbs", completed: false },
            { name: "Leg Press 45-degree", sets: 3, reps: "12", weight: "400 lbs", completed: false },
            { name: "Romanian Deadlift", sets: 3, reps: "10", weight: "185 lbs", completed: false },
            { name: "Hanging Leg Raises", sets: 3, reps: "15", weight: "Bodyweight", completed: false }
          ]
        },
        {
          day: "Friday (Full Body & Conditioning)",
          exercises: [
            { name: "Dumbbell Clean & Press", sets: 3, reps: "10", weight: "45 lbs", completed: false },
            { name: "Kettlebell Swings", sets: 4, reps: "20", weight: "50 lbs", completed: false },
            { name: "Farmer's Walk", sets: 3, reps: "50 meters", weight: "70 lbs each", completed: false }
          ]
        }
      ]
    }
  ],

  // Member Fitness Progress & Tracking
  progressRecords: [
    {
      memberId: "mem_101",
      date: "2026-01-15",
      weightKg: 84.5,
      bodyFatPct: 18.2,
      chestCm: 104,
      waistCm: 88,
      armsCm: 38
    },
    {
      memberId: "mem_101",
      date: "2026-02-15",
      weightKg: 83.2,
      bodyFatPct: 16.8,
      chestCm: 105,
      waistCm: 86,
      armsCm: 38.5
    },
    {
      memberId: "mem_101",
      date: "2026-03-15",
      weightKg: 82.0,
      bodyFatPct: 15.5,
      chestCm: 106,
      waistCm: 84,
      armsCm: 39
    },
    {
      memberId: "mem_101",
      date: "2026-04-15",
      weightKg: 81.3,
      bodyFatPct: 14.6,
      chestCm: 107,
      waistCm: 82,
      armsCm: 39.5
    }
  ],

  // Support Tickets (Both SaaS Platform and Gym level)
  supportTickets: [
    {
      id: "tkt_1",
      scope: "platform", // platform or gym
      gymId: "gym_1",
      gymName: "IronPulse Fitness Club",
      submittedBy: "Marcus Vance",
      email: "marcus@ironpulse.com",
      subject: "Stripe recurring billing webhook sync delay",
      category: "Billing & Webhooks",
      priority: "High",
      status: "Open", // Open, In Progress, Resolved, Closed
      assignedAgent: "Sarah DevOps",
      createdAt: "2026-04-20 09:30 AM",
      replies: [
        {
          author: "Marcus Vance",
          role: "Gym Admin",
          time: "2026-04-20 09:30 AM",
          message: "Our automated webhook seems to take 5 minutes to mark member subscriptions as active upon checkout. Could you check the endpoint latency?"
        },
        {
          author: "Sarah DevOps",
          role: "Super Admin Support",
          time: "2026-04-20 10:15 AM",
          message: "Hi Marcus, we are reviewing the event log on our webhook queue. It looks like a brief spike in traffic. We are investigating."
        }
      ]
    },
    {
      id: "tkt_2",
      scope: "platform",
      gymId: "gym_2",
      gymName: "Apex Performance Center",
      submittedBy: "Elena Rostova",
      email: "elena@apexperformance.com",
      subject: "Requesting custom domain setup for apex.gymflow.app",
      category: "Configuration",
      priority: "Medium",
      status: "In Progress",
      assignedAgent: "Alex Admin",
      createdAt: "2026-04-19 02:15 PM",
      replies: [
        {
          author: "Elena Rostova",
          role: "Gym Admin",
          time: "2026-04-19 02:15 PM",
          message: "We would like to connect our domain apexperformance.com directly to the GymFlow white-label dashboard."
        }
      ]
    },
    {
      id: "tkt_3",
      scope: "gym",
      gymId: "gym_1",
      gymName: "IronPulse Fitness Club",
      submittedBy: "Jessica Taylor",
      email: "jessica.t@example.com",
      subject: "Locker room padlock replacement request",
      category: "Facility",
      priority: "Low",
      status: "Resolved",
      assignedAgent: "Marcus Vance",
      createdAt: "2026-04-18 11:00 AM",
      replies: [
        {
          author: "Jessica Taylor",
          role: "Member",
          time: "2026-04-18 11:00 AM",
          message: "Hi! My locker #44 combination dial was jammed today. Had to use locker #45."
        },
        {
          author: "Marcus Vance",
          role: "Gym Manager",
          time: "2026-04-18 01:20 PM",
          message: "Thanks Jessica! Our maintenance team replaced the dial this afternoon. Locker #44 is fully operational again."
        }
      ]
    },
    {
      id: "tkt_4",
      scope: "gym",
      gymId: "gym_1",
      gymName: "IronPulse Fitness Club",
      submittedBy: "Alex Morgan",
      email: "alex.morgan@example.com",
      subject: "Inquiry about personal trainer session schedule adjustment",
      category: "Training",
      priority: "Medium",
      status: "Open",
      assignedAgent: "Coach David Miller",
      createdAt: "2026-04-20 03:00 PM",
      replies: [
        {
          author: "Alex Morgan",
          role: "Member",
          time: "2026-04-20 03:00 PM",
          message: "Hey Coach David, can we move our Thursday deadlift session to Friday 6 PM this week?"
        }
      ]
    }
  ],

  // Platform & Gym Announcements
  announcements: [
    {
      id: "ann_1",
      scope: "platform", // platform-wide
      target: "All Gym Admins",
      title: "GymFlow v2.4 Feature Release — QR Attendance & Multi-Branch Enhancements",
      content: "We are thrilled to roll out enhanced QR attendance check-in, faster member export, and consolidated billing tools in today's update. Check out our changelog for details.",
      date: "2026-04-18",
      status: "Published",
      author: "GymFlow Product Team"
    },
    {
      id: "ann_2",
      scope: "platform",
      target: "All Gym Admins",
      title: "Scheduled Maintenance Window — April 28th, 2:00 AM UTC",
      content: "Brief 15-minute maintenance on primary database replica clusters for performance tuning. No downtime expected for active check-in portals.",
      date: "2026-04-15",
      status: "Published",
      author: "DevOps Operations"
    },
    {
      id: "ann_3",
      scope: "gym",
      gymId: "gym_1",
      target: "All Members",
      title: "New Rogue Power Racks & Dumbbells Arrived at Downtown Branch!",
      content: "We have upgraded our free-weights section with brand new urethane dumbbells from 5 lbs up to 120 lbs, plus two additional squat cages. Come test them out!",
      date: "2026-04-17",
      status: "Published",
      author: "Management Team"
    },
    {
      id: "ann_4",
      scope: "gym",
      gymId: "gym_1",
      target: "All Members",
      title: "Easter Holiday Weekend Operating Hours",
      content: "Please note that on Sunday April 26th, the main gym floor will operate on modified hours from 8:00 AM to 6:00 PM. 24/7 keycard access remains open at North Austin studio.",
      date: "2026-04-12",
      status: "Published",
      author: "Front Desk"
    }
  ],

  // Platform Audit Logs (Super Admin Scope)
  auditLogs: [
    {
      id: "log_1",
      timestamp: "2026-04-21 11:45:12",
      actor: "Super Admin (system_admin)",
      role: "Super Admin",
      action: "UPDATED_PLAN",
      resource: "SaaS Plan: Growth",
      ip: "192.168.1.104",
      result: "Success"
    },
    {
      id: "log_2",
      timestamp: "2026-04-21 10:12:44",
      actor: "Marcus Vance",
      role: "Gym Admin",
      action: "MEMBER_CHECKIN",
      resource: "Member: Alex Morgan (mem_101)",
      ip: "10.0.0.12",
      result: "Success"
    },
    {
      id: "log_3",
      timestamp: "2026-04-21 09:30:05",
      actor: "Marcus Vance",
      role: "Gym Admin",
      action: "CREATE_SUPPORT_TICKET",
      resource: "Ticket #tkt_1",
      ip: "10.0.0.12",
      result: "Success"
    },
    {
      id: "log_4",
      timestamp: "2026-04-20 18:22:19",
      actor: "Super Admin (system_admin)",
      role: "Super Admin",
      action: "SUSPEND_ORGANIZATION",
      resource: "Gym: Iron Kingdom Athletics (gym_7)",
      ip: "192.168.1.104",
      result: "Success"
    },
    {
      id: "log_5",
      timestamp: "2026-04-20 14:10:00",
      actor: "Derek Thorne",
      role: "Gym Admin",
      action: "EXPORT_CSV",
      resource: "Titan Barbell Member Directory",
      ip: "172.16.0.45",
      result: "Success"
    },
    {
      id: "log_6",
      timestamp: "2026-04-19 16:04:33",
      actor: "Sarah DevOps",
      role: "Platform Support",
      action: "SYSTEM_HEALTH_CHECK",
      resource: "Database Pool & Read Replica",
      ip: "192.168.1.150",
      result: "Success"
    }
  ],

  // Platform Internal SaaS Users (Super Admin Scope)
  platformUsers: [
    {
      id: "usr_1",
      name: "Chief Platform Admin",
      email: "admin@gymflow.com",
      role: "Super Admin",
      status: "active",
      lastActive: "Just now"
    },
    {
      id: "usr_2",
      name: "Sarah Jenkins",
      email: "sarah.devops@gymflow.com",
      role: "DevOps & Infrastructure",
      status: "active",
      lastActive: "25 mins ago"
    },
    {
      id: "usr_3",
      name: "Alex Vance",
      email: "alex.billing@gymflow.com",
      role: "Billing & Revenue Specialist",
      status: "active",
      lastActive: "1 hour ago"
    },
    {
      id: "usr_4",
      name: "Jordan Lee",
      email: "jordan.support@gymflow.com",
      role: "Tier 2 Customer Support",
      status: "active",
      lastActive: "3 hours ago"
    }
  ],

  // Gym Staff (Gym Admin Scope)
  staff: [
    {
      id: "stf_1",
      gymId: "gym_1",
      name: "Rachel Kim",
      email: "rachel.k@ironpulse.com",
      phone: "+1 (555) 401-1111",
      role: "Branch Manager",
      branch: "North Austin Studio",
      status: "active"
    },
    {
      id: "stf_2",
      gymId: "gym_1",
      name: "Jason Miller",
      email: "jason.m@ironpulse.com",
      phone: "+1 (555) 401-2222",
      role: "Front Desk Receptionist",
      branch: "Downtown Flagship",
      status: "active"
    },
    {
      id: "stf_3",
      gymId: "gym_1",
      name: "Amanda Clark",
      email: "amanda.c@ironpulse.com",
      phone: "+1 (555) 401-3333",
      role: "Accountant",
      branch: "Downtown Flagship",
      status: "active"
    },
    {
      id: "stf_4",
      gymId: "gym_1",
      name: "Carlos Rivera",
      email: "carlos.r@ironpulse.com",
      phone: "+1 (555) 401-4444",
      role: "Equipment & Facilities Technician",
      branch: "Downtown Flagship",
      status: "active"
    }
  ],

  // System Health Indicators (Mock demonstration metrics)
  systemHealth: {
    status: "Healthy",
    uptime: "99.98%",
    apiLatencyMs: 42,
    dbConnections: "34 / 200",
    errorRate: "0.02%",
    cpuUsage: "28%",
    memoryUsage: "45%",
    lastIncident: "18 days ago (Resolved in 6 mins)"
  }
};
