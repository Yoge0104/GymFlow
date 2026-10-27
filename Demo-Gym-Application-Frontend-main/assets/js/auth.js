/* ===================================================================
   GymFlow — Role-Based Authentication & Session Simulator
   Handles simulated login/logout, route protection, and tenant context.
   =================================================================== */

const AUTH_STORAGE_KEY = 'gymflow_current_user';

const DEMO_ACCOUNTS = {
  superadmin: {
    id: "usr_superadmin",
    name: "Alex Vance",
    email: "admin@gymflow.com",
    role: "superadmin",
    roleLabel: "Super Admin",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
    gymId: null,
    dashboardUrl: "../super-admin/dashboard.html"
  },
  gymadmin: {
    id: "usr_gymadmin",
    name: "Marcus Vance",
    email: "marcus@ironpulse.com",
    role: "gymadmin",
    roleLabel: "Gym Admin (Owner)",
    gymId: "gym_1",
    gymName: "IronPulse Fitness Club",
    avatar: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=100&h=100&fit=crop",
    dashboardUrl: "../admin/dashboard.html"
  },
  member: {
    id: "mem_101",
    name: "Alex Morgan",
    email: "alex.morgan@example.com",
    role: "member",
    roleLabel: "Gym Member",
    gymId: "gym_1",
    gymName: "IronPulse Fitness Club",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
    dashboardUrl: "../member/dashboard.html"
  }
};

const Auth = {
  getUser() {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY) || sessionStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    // Default to gymadmin if not set, so reviewing pages directly works smoothly
    return DEMO_ACCOUNTS.gymadmin;
  },

  setUser(user, remember = false) {
    const serialized = JSON.stringify(user);
    if (remember) {
      localStorage.setItem(AUTH_STORAGE_KEY, serialized);
    } else {
      sessionStorage.setItem(AUTH_STORAGE_KEY, serialized);
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  },

  login(email, password, remember = false) {
    email = (email || '').trim().toLowerCase();
    
    // Check against demo accounts
    if (email.includes('admin@gymflow') || email === 'superadmin') {
      this.setUser(DEMO_ACCOUNTS.superadmin, remember);
      return { success: true, user: DEMO_ACCOUNTS.superadmin, redirect: 'super-admin/dashboard.html' };
    }
    if (email.includes('alex.morgan') || email === 'member' || email.includes('member')) {
      this.setUser(DEMO_ACCOUNTS.member, remember);
      return { success: true, user: DEMO_ACCOUNTS.member, redirect: 'member/dashboard.html' };
    }
    // Default or gym admin
    this.setUser(DEMO_ACCOUNTS.gymadmin, remember);
    return { success: true, user: DEMO_ACCOUNTS.gymadmin, redirect: 'admin/dashboard.html' };
  },

  loginAs(roleName, remember = true) {
    const target = DEMO_ACCOUNTS[roleName] || DEMO_ACCOUNTS.gymadmin;
    this.setUser(target, remember);
    return target;
  },

  logout() {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
  },

  isAuthenticated() {
    return true; // Demo mode always permits preview
  },

  getTenantGymId() {
    const user = this.getUser();
    return user ? user.gymId || 'gym_1' : 'gym_1';
  },

  getActiveMemberId() {
    const user = this.getUser();
    return (user && user.role === 'member') ? user.id : 'mem_101';
  }
};

window.Auth = Auth;
