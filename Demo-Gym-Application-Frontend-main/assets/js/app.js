/* ===================================================================
   GymFlow — Main Application Bootstrapper & Utilities
   =================================================================== */

const App = {
  formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
  },

  formatDate(dateStr) {
    if (!dateStr) return '--';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  },

  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },

  initQuickRoleSwitcher() {
    // Only render if on a dashboard/module page
    if (document.querySelector('.dashboard-layout') && !document.getElementById('demo-role-banner')) {
      const banner = document.createElement('div');
      banner.id = 'demo-role-banner';
      banner.style.cssText = `
        position: fixed;
        bottom: 1rem;
        right: 1rem;
        background: var(--bg-surface);
        border: 1px solid var(--border-color);
        box-shadow: var(--shadow-lg);
        border-radius: var(--radius-md);
        padding: 0.6rem 0.85rem;
        z-index: 999;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        font-size: 0.8125rem;
      `;

      const user = Auth.getUser();
      const currentRole = user ? user.role : 'gymadmin';

      // banner.innerHTML = `
      //   <div style="display: flex; align-items: center; gap: 0.4rem; font-weight: 700;">
      //     <i class="fa-solid fa-masks-theater text-accent"></i>
      //     <span>Switch Demo Role:</span>
      //   </div>
      //   <div style="display: flex; gap: 0.35rem;">
      //     <a href="../super-admin/dashboard.html" class="btn btn-sm ${currentRole === 'superadmin' ? 'btn-primary' : 'btn-secondary'}" style="padding: 0.25rem 0.55rem; font-size: 0.75rem;" onclick="Auth.loginAs('superadmin')">Super Admin</a>
      //     <a href="../admin/dashboard.html" class="btn btn-sm ${currentRole === 'gymadmin' ? 'btn-primary' : 'btn-secondary'}" style="padding: 0.25rem 0.55rem; font-size: 0.75rem;" onclick="Auth.loginAs('gymadmin')">Gym Admin</a>
      //     <a href="../member/dashboard.html" class="btn btn-sm ${currentRole === 'member' ? 'btn-primary' : 'btn-secondary'}" style="padding: 0.25rem 0.55rem; font-size: 0.75rem;" onclick="Auth.loginAs('member')">Member</a>
      //   </div>
      // `;

      document.body.appendChild(banner);
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  App.initQuickRoleSwitcher();
});

window.App = App;
