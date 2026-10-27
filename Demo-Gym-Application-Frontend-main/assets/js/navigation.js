/* ===================================================================
   GymFlow — Navigation, Sidebar, Theme Switcher & Layout Orchestrator
   =================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  Navigation.init();
});

const Navigation = {
  init() {
    this.initTheme();
    this.initSidebar();
    this.initActiveLinks();
    this.initDropdowns();
    this.initRoleIndicators();
    this.initNotifications();
  },

  /* --- Theme Switcher (Dark / Light) --- */
  initTheme() {
    const savedTheme = localStorage.getItem('gymflow_theme') || 'light';
    this.setTheme(savedTheme);

    const themeToggles = document.querySelectorAll('.theme-toggle-btn');
    themeToggles.forEach(btn => {
      btn.onclick = () => {
        const current = document.documentElement.getAttribute('data-theme') || 'light';
        const nextTheme = current === 'dark' ? 'light' : 'dark';
        this.setTheme(nextTheme);
      };
    });
  },

  setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
    localStorage.setItem('gymflow_theme', theme);

    // Update icons
    const icons = document.querySelectorAll('.theme-toggle-btn i');
    icons.forEach(icon => {
      icon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    });
  },

  /* --- Sidebar Collapse & Mobile Drawer --- */
  initSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const toggleBtns = document.querySelectorAll('.sidebar-toggle-btn');
    let overlay = document.querySelector('.sidebar-overlay');

    if (!overlay && sidebar) {
      overlay = document.createElement('div');
      overlay.className = 'sidebar-overlay';
      document.body.appendChild(overlay);
    }

    // Restore desktop collapsed state
    const isCollapsed = localStorage.getItem('gymflow_sidebar_collapsed') === 'true';
    if (isCollapsed && sidebar && window.innerWidth > 768) {
      sidebar.classList.add('collapsed');
    }

    toggleBtns.forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        if (!sidebar) return;

        if (window.innerWidth <= 768) {
          // Mobile drawer mode
          const isOpen = sidebar.classList.toggle('mobile-open');
          if (overlay) overlay.classList.toggle('active', isOpen);
        } else {
          // Desktop collapse
          const collapsed = sidebar.classList.toggle('collapsed');
          localStorage.setItem('gymflow_sidebar_collapsed', collapsed);
        }
      };
    });

    if (overlay) {
      overlay.onclick = () => {
        if (sidebar) sidebar.classList.remove('mobile-open');
        overlay.classList.remove('active');
      };
    }
  },

  /* --- Active Navigation Link Matching --- */
  initActiveLinks() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href) {
        const linkFile = href.split('/').pop();
        if (linkFile === currentPath) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      }
    });
  },

  /* --- Dropdowns --- */
  initDropdowns() {
    document.addEventListener('click', (e) => {
      const toggle = e.target.closest('[data-dropdown-toggle]');
      if (toggle) {
        e.preventDefault();
        e.stopPropagation();
        const parent = toggle.closest('.dropdown');
        const menu = parent ? parent.querySelector('.dropdown-menu') : null;

        // Close others
        document.querySelectorAll('.dropdown-menu.show').forEach(m => {
          if (m !== menu) m.classList.remove('show');
        });

        if (menu) {
          menu.classList.toggle('show');
        }
      } else if (!e.target.closest('.dropdown-menu')) {
        document.querySelectorAll('.dropdown-menu.show').forEach(m => m.classList.remove('show'));
      }
    });
  },

  /* --- Topbar Role & User Information --- */
  initRoleIndicators() {
    const user = Auth.getUser();
    if (!user) return;

    // Update avatar and username if elements exist
    document.querySelectorAll('.current-user-name').forEach(el => el.textContent = user.name);
    document.querySelectorAll('.current-user-role').forEach(el => el.textContent = user.roleLabel || user.role);
    document.querySelectorAll('.current-user-avatar').forEach(img => {
      if (img.tagName === 'IMG') img.src = user.avatar;
    });

    // Logout button bindings
    document.querySelectorAll('.btn-logout').forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        Modal.confirm({
          title: 'Sign Out',
          message: 'Are you sure you want to log out of your session?',
          confirmText: 'Sign Out',
          confirmClass: 'btn-danger',
          onConfirm: () => {
            Auth.logout();
            Toast.info('Logged out successfully.');
            setTimeout(() => {
              window.location.href = '../login.html';
            }, 500);
          }
        });
      };
    });
  },

  /* --- Topbar Notifications Popover --- */
  initNotifications() {
    const notifBtn = document.querySelector('#btn-notifications');
    if (!notifBtn) return;

    notifBtn.onclick = (e) => {
      e.stopPropagation();
      let notifMenu = document.getElementById('notifications-popover');
      if (!notifMenu) {
        notifMenu = document.createElement('div');
        notifMenu.id = 'notifications-popover';
        notifMenu.className = 'dropdown-menu show';
        notifMenu.style.width = '340px';
        notifMenu.style.right = '0';
        notifMenu.style.padding = '0';

        notifMenu.innerHTML = `
          <div style="padding: 0.85rem 1rem; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
            <strong style="font-size: 0.875rem;">Notifications</strong>
            <span class="badge badge-accent" style="font-size: 0.7rem;">3 New</span>
          </div>
          <div style="max-height: 280px; overflow-y: auto;">
            <div style="padding: 0.75rem 1rem; border-bottom: 1px solid var(--border-color-subtle); display: flex; gap: 0.75rem; align-items: flex-start;">
              <span class="stat-icon amber" style="width: 32px; height: 32px; font-size: 0.85rem;"><i class="fa-solid fa-clock"></i></span>
              <div style="font-size: 0.8125rem;">
                <div style="font-weight: 600; color: var(--text-main);">David Kim's plan expires soon</div>
                <div style="color: var(--text-muted); font-size: 0.75rem;">20 mins ago</div>
              </div>
            </div>
            <div style="padding: 0.75rem 1rem; border-bottom: 1px solid var(--border-color-subtle); display: flex; gap: 0.75rem; align-items: flex-start;">
              <span class="stat-icon green" style="width: 32px; height: 32px; font-size: 0.85rem;"><i class="fa-solid fa-credit-card"></i></span>
              <div style="font-size: 0.8125rem;">
                <div style="font-weight: 600; color: var(--text-main);">Payment received: ₹450.00</div>
                <div style="color: var(--text-muted); font-size: 0.75rem;">1 hour ago</div>
              </div>
            </div>
            <div style="padding: 0.75rem 1rem; display: flex; gap: 0.75rem; align-items: flex-start;">
              <span class="stat-icon blue" style="width: 32px; height: 32px; font-size: 0.85rem;"><i class="fa-solid fa-calendar-check"></i></span>
              <div style="font-size: 0.8125rem;">
                <div style="font-weight: 600; color: var(--text-main);">Morning HIIT class is now full</div>
                <div style="color: var(--text-muted); font-size: 0.75rem;">3 hours ago</div>
              </div>
            </div>
          </div>
          <div style="padding: 0.5rem; text-align: center; border-top: 1px solid var(--border-color); background: var(--bg-surface-secondary);">
            <a href="notifications.html" style="font-size: 0.775rem; font-weight: 600; color: var(--color-accent);">View All Notifications</a>
          </div>
        `;
        notifBtn.parentElement.appendChild(notifMenu);
      } else {
        notifMenu.classList.toggle('show');
      }
    };
  }
};

window.Navigation = Navigation;
