/* ===================================================================
   GymFlow — Reusable UI Components Helpers
   Modals, Toasts, Confirm Dialogs, CSV Exporter, Pagination, Dropdowns, Tabs
   =================================================================== */

// --- Toast Notifications ---
const Toast = {
  container: null,

  _getContainer() {
    if (!this.container) {
      let el = document.getElementById('toast-container');
      if (!el) {
        el = document.createElement('div');
        el.id = 'toast-container';
        el.className = 'toast-container';
        document.body.appendChild(el);
      }
      this.container = el;
    }
    return this.container;
  },

  show(message, type = 'info', title = '', duration = 4000) {
    const container = this._getContainer();
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconClass = 'fa-solid fa-circle-info';
    let defaultTitle = 'Notification';
    if (type === 'success') {
      iconClass = 'fa-solid fa-circle-check';
      defaultTitle = 'Success';
    } else if (type === 'error' || type === 'danger') {
      iconClass = 'fa-solid fa-circle-exclamation';
      defaultTitle = 'Error';
    } else if (type === 'warning') {
      iconClass = 'fa-solid fa-triangle-exclamation';
      defaultTitle = 'Attention';
    }

    toast.innerHTML = `
      <i class="${iconClass} toast-icon"></i>
      <div class="toast-content">
        <div class="toast-title">${title || defaultTitle}</div>
        <div class="toast-message">${message}</div>
      </div>
      <button type="button" class="toast-close" aria-label="Close">&times;</button>
    `;

    container.appendChild(toast);

    // Trigger enter animation
    setTimeout(() => toast.classList.add('show'), 20);

    const closeToast = () => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    };

    toast.querySelector('.toast-close').addEventListener('click', closeToast);

    if (duration > 0) {
      setTimeout(closeToast, duration);
    }
  },

  success(msg, title = 'Success') { this.show(msg, 'success', title); },
  error(msg, title = 'Error') { this.show(msg, 'error', title); },
  warning(msg, title = 'Warning') { this.show(msg, 'warning', title); },
  info(msg, title = 'Notice') { this.show(msg, 'info', title); }
};

// --- Modals ---
const Modal = {
  open(modalId) {
    const el = document.getElementById(modalId);
    if (el) {
      el.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  },

  close(modalId) {
    const el = document.getElementById(modalId);
    if (el) {
      el.classList.remove('active');
      document.body.style.overflow = '';
    }
  },

  confirm({ title = 'Confirm Action', message = 'Are you sure you want to proceed?', confirmText = 'Confirm', confirmClass = 'btn-danger', onConfirm }) {
    let confirmBackdrop = document.getElementById('modal-confirm-dialog');
    if (!confirmBackdrop) {
      confirmBackdrop = document.createElement('div');
      confirmBackdrop.id = 'modal-confirm-dialog';
      confirmBackdrop.className = 'modal-backdrop';
      document.body.appendChild(confirmBackdrop);
    }

    confirmBackdrop.innerHTML = `
      <div class="modal modal-sm">
        <div class="modal-header">
          <h3 class="modal-title"><i class="fa-solid fa-circle-question text-warning"></i> ${title}</h3>
          <button type="button" class="modal-close" data-close>&times;</button>
        </div>
        <div class="modal-body">
          <p>${message}</p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-close>Cancel</button>
          <button type="button" class="btn ${confirmClass}" id="btn-confirm-action">${confirmText}</button>
        </div>
      </div>
    `;

    confirmBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';

    const closeDialog = () => {
      confirmBackdrop.classList.remove('active');
      document.body.style.overflow = '';
    };

    confirmBackdrop.querySelectorAll('[data-close]').forEach(btn => {
      btn.onclick = closeDialog;
    });

    const actionBtn = confirmBackdrop.querySelector('#btn-confirm-action');
    actionBtn.onclick = () => {
      closeDialog();
      if (typeof onConfirm === 'function') onConfirm();
    };
  }
};

// Global click delegation for modal close buttons
document.addEventListener('click', (e) => {
  if (e.target.matches('.modal-backdrop') || e.target.closest('[data-modal-close]')) {
    const backdrop = e.target.closest('.modal-backdrop');
    if (backdrop) {
      backdrop.classList.remove('active');
      document.body.style.overflow = '';
    }
  }
});

// --- Table and Export Helpers ---
const TableHelper = {
  renderPagination(containerEl, totalItems, currentPage, pageSize, onPageChange) {
    if (!containerEl) return;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(totalItems, currentPage * pageSize);

    let html = `
      <div class="table-info">Showing <strong>${startItem}-${endItem}</strong> of <strong>${totalItems}</strong> entries</div>
      <div class="pagination-controls">
        <button class="pagination-btn" ${currentPage === 1 ? 'disabled' : ''} data-page="${currentPage - 1}">
          <i class="fa-solid fa-chevron-left"></i>
        </button>
    `;

    for (let p = 1; p <= totalPages; p++) {
      if (totalPages > 6 && Math.abs(p - currentPage) > 2 && p !== 1 && p !== totalPages) {
        if (p === 2 || p === totalPages - 1) {
          html += `<span style="padding: 0 4px; color: var(--text-subtle);">...</span>`;
        }
        continue;
      }
      html += `
        <button class="pagination-btn ${p === currentPage ? 'active' : ''}" data-page="${p}">${p}</button>
      `;
    }

    html += `
        <button class="pagination-btn" ${currentPage === totalPages ? 'disabled' : ''} data-page="${currentPage + 1}">
          <i class="fa-solid fa-chevron-right"></i>
        </button>
      </div>
    `;

    containerEl.innerHTML = html;

    containerEl.querySelectorAll('.pagination-btn:not(:disabled)').forEach(btn => {
      btn.onclick = () => {
        const page = parseInt(btn.dataset.page);
        if (page && page !== currentPage) {
          onPageChange(page);
        }
      };
    });
  },

  exportToCsv(filename, headers, rows) {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += headers.map(h => `"${h}"`).join(",") + "\r\n";

    rows.forEach(row => {
      const line = row.map(cell => {
        const str = String(cell !== undefined && cell !== null ? cell : "").replace(/"/g, '""');
        return `"${str}"`;
      }).join(",");
      csvContent += line + "\r\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    Toast.success(`Exported ${rows.length} records to ${filename}`);
  }
};

// --- Printable Invoice & Receipt Helpers ---
const PrintHelper = {
  previewInvoice(paymentRecord, gymInfo) {
    let modal = document.getElementById('modal-invoice-preview');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'modal-invoice-preview';
      modal.className = 'modal-backdrop';
      document.body.appendChild(modal);
    }

    gymInfo = gymInfo || {
      name: "IronPulse Fitness Club",
      address: "742 Evergreen Terrace, Downtown, Austin, TX",
      phone: "+1 (555) 234-5678",
      email: "billing@ironpulse.com"
    };

    const taxAmount = (paymentRecord.amount * 0.0825).toFixed(2);
    const subtotal = (paymentRecord.amount - taxAmount).toFixed(2);

    modal.innerHTML = `
      <div class="modal modal-lg">
        <div class="modal-header">
          <h3 class="modal-title"><i class="fa-solid fa-receipt text-accent"></i> Invoice & Receipt Preview</h3>
          <button type="button" class="modal-close" data-modal-close>&times;</button>
        </div>
        <div class="modal-body">
          <div class="invoice-card" id="printable-invoice-content">
            <div class="alert alert-info" style="margin-bottom: 1.5rem;">
              <i class="fa-solid fa-circle-info"></i>
              <div><strong>Demonstration Receipt:</strong> This is a simulated invoice created for presentation & testing purposes.</div>
            </div>
            <div class="invoice-header">
              <div>
                <h2 style="margin: 0 0 0.5rem; color: #0f172a;">${gymInfo.name}</h2>
                <div style="font-size: 0.85rem; color: #64748b; line-height: 1.4;">
                  ${gymInfo.address}<br>
                  Phone: ${gymInfo.phone} | Email: ${gymInfo.email}
                </div>
              </div>
              <div style="text-align: right;">
                <span class="badge badge-success" style="font-size: 0.85rem; padding: 0.4rem 0.8rem; margin-bottom: 0.5rem;">${paymentRecord.status}</span>
                <div style="font-size: 0.875rem; font-weight: 700; color: #0f172a;">Invoice #: ${paymentRecord.invoiceNo || 'INV-' + paymentRecord.id}</div>
                <div style="font-size: 0.8rem; color: #64748b;">Date: ${paymentRecord.date}</div>
              </div>
            </div>

            <div style="display: flex; justify-content: space-between; margin-bottom: 1.5rem; font-size: 0.875rem;">
              <div>
                <strong style="color: #64748b; text-transform: uppercase; font-size: 0.75rem;">Billed To:</strong>
                <div style="font-weight: 700; font-size: 1rem; color: #0f172a; margin-top: 0.2rem;">${paymentRecord.memberName || 'Gym Member'}</div>
                <div style="color: #64748b;">Member ID: ${paymentRecord.memberId || 'N/A'}</div>
              </div>
              <div style="text-align: right;">
                <strong style="color: #64748b; text-transform: uppercase; font-size: 0.75rem;">Payment Method:</strong>
                <div style="font-weight: 600; color: #0f172a; margin-top: 0.2rem;">${paymentRecord.method || 'Card'}</div>
              </div>
            </div>

            <table class="invoice-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th style="text-align: center;">Qty</th>
                  <th style="text-align: right;">Unit Price</th>
                  <th style="text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>${paymentRecord.description || 'Gym Membership Access Plan'}</strong>
                    <div style="font-size: 0.8rem; color: #64748b;">Standard 30-day recurring term</div>
                  </td>
                  <td style="text-align: center;">1</td>
                  <td style="text-align: right;">₹${subtotal}</td>
                  <td style="text-align: right;">₹${subtotal}</td>
                </tr>
              </tbody>
            </table>

            <div style="display: flex; justify-content: flex-end; margin-top: 1rem;">
              <div style="width: 250px; font-size: 0.875rem;">
                <div style="display: flex; justify-content: space-between; padding: 0.35rem 0;">
                  <span style="color: #64748b;">Subtotal:</span>
                  <span>₹${subtotal}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 0.35rem 0;">
                  <span style="color: #64748b;">Taxes (8.25%):</span>
                  <span>₹${taxAmount}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 0.75rem 0; border-top: 2px solid #e2e8f0; font-size: 1.15rem; font-weight: 800; color: #0f172a;">
                  <span>Grand Total:</span>
                  <span style="color: #10b981;">₹${Number(paymentRecord.amount).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div style="margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #e2e8f0; text-align: center; font-size: 0.775rem; color: #94a3b8;">
              Thank you for training with ${gymInfo.name}! Please retain this receipt for your personal tax or reimbursement records.
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-modal-close>Close</button>
          <button type="button" class="btn btn-primary" onclick="window.print()">
            <i class="fa-solid fa-print"></i> Print Invoice
          </button>
        </div>
      </div>
    `;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
};

// Tab switching logic
document.addEventListener('click', (e) => {
  const tabBtn = e.target.closest('.tab-btn');
  if (tabBtn && tabBtn.dataset.tab) {
    const nav = tabBtn.closest('.tabs-nav');
    if (nav) {
      nav.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      tabBtn.classList.add('active');

      const targetId = tabBtn.dataset.tab;
      const container = nav.parentElement;
      container.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
      const targetPane = document.getElementById(targetId);
      if (targetPane) targetPane.classList.add('active');
    }
  }
});

// --- DataGrid & Filter / Sort Helpers ---
const DataGridHelper = {
  matchSearch(item, query, fields) {
    if (!query) return true;
    const q = String(query).toLowerCase().trim();
    if (!q) return true;
    return fields.some(field => {
      let val;
      if (typeof field === 'function') {
        val = field(item);
      } else if (field.includes('.')) {
        val = field.split('.').reduce((obj, key) => (obj ? obj[key] : undefined), item);
      } else {
        val = item[field];
      }
      if (val === undefined || val === null) return false;
      return String(val).toLowerCase().includes(q);
    });
  },

  compare(a, b, key, isAsc = true) {
    let valA = typeof key === 'function' ? key(a) : a[key];
    let valB = typeof key === 'function' ? key(b) : b[key];

    if (valA === undefined || valA === null) valA = '';
    if (valB === undefined || valB === null) valB = '';

    // Direct numeric comparison
    if (typeof valA === 'number' && typeof valB === 'number') {
      return isAsc ? valA - valB : valB - valA;
    }

    // Try parsing date if looks like YYYY-MM-DD or ISO date string
    const isDatePattern = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}/.test(s);
    if (isDatePattern(valA) && isDatePattern(valB)) {
      const timeA = new Date(valA).getTime() || 0;
      const timeB = new Date(valB).getTime() || 0;
      return isAsc ? timeA - timeB : timeB - timeA;
    }

    // Cleaned currency/numeric string comparison (e.g. "$49", "₹120", "49.00")
    if (typeof valA === 'string' && typeof valB === 'string') {
      const cleanA = valA.replace(/[^0-9.-]+/g, '');
      const cleanB = valB.replace(/[^0-9.-]+/g, '');
      const numA = parseFloat(cleanA);
      const numB = parseFloat(cleanB);
      if (!isNaN(numA) && !isNaN(numB) && cleanA.length > 0 && cleanB.length > 0 && (cleanA === valA || /[\$₹€£]/.test(valA) || /[\$₹€£]/.test(valB))) {
        return isAsc ? numA - numB : numB - numA;
      }
    }

    // String locale comparison
    const strA = String(valA).toLowerCase();
    const strB = String(valB).toLowerCase();
    if (strA < strB) return isAsc ? -1 : 1;
    if (strA > strB) return isAsc ? 1 : -1;
    return 0;
  },

  matchDateRange(itemDate, startRange, endRange) {
    if (!startRange && !endRange) return true;
    if (!itemDate) return false;
    const d = new Date(itemDate).getTime();
    if (isNaN(d)) return true;
    if (startRange) {
      const s = new Date(startRange).getTime();
      if (!isNaN(s) && d < s) return false;
    }
    if (endRange) {
      const e = new Date(endRange);
      e.setHours(23, 59, 59, 999);
      if (!isNaN(e.getTime()) && d > e.getTime()) return false;
    }
    return true;
  },

  updateSortHeaders(container, activeKey, isAsc) {
    const root = typeof container === 'string' ? document.querySelector(container) : container;
    if (!root) return;
    root.querySelectorAll('th.sortable').forEach(th => {
      const key = th.dataset.sort || th.getAttribute('onclick')?.match(/['"]([^'"]+)['"]/)?.[1];
      let icon = th.querySelector('i');
      if (!icon) {
        icon = document.createElement('i');
        th.appendChild(icon);
      }
      if (key === activeKey) {
        icon.className = isAsc ? 'fa-solid fa-sort-up text-accent' : 'fa-solid fa-sort-down text-accent';
      } else {
        icon.className = 'fa-solid fa-sort text-muted';
      }
    });
  },

  getEmptyStateHtml(title = 'No records found', desc = 'No results match your active search or filters. Try adjusting your query or resetting filters.', resetFn = '') {
    return `
      <div class="empty-state" style="padding: 3.5rem 1rem; text-align: center; width: 100%;">
        <div class="empty-icon" style="font-size: 2.75rem; color: var(--text-subtle); margin-bottom: 0.75rem;">
          <i class="fa-solid fa-folder-open"></i>
        </div>
        <div class="empty-title" style="font-size: 1.15rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.35rem;">
          ${title}
        </div>
        <p class="text-muted text-xs" style="max-width: 360px; margin: 0 auto 1.25rem;">
          ${desc}
        </p>
        ${resetFn ? `
          <button type="button" class="btn btn-sm btn-outline" onclick="${resetFn}">
            <i class="fa-solid fa-arrow-rotate-left"></i> Reset All Filters
          </button>
        ` : ''}
      </div>
    `;
  }
};

<<<<<<< HEAD

=======
>>>>>>> d832a2791cfbe3530142912a0522d7e539f037e8
window.Toast = Toast;
window.Modal = Modal;
window.TableHelper = TableHelper;
window.PrintHelper = PrintHelper;
window.DataGridHelper = DataGridHelper;
<<<<<<< HEAD

=======
>>>>>>> d832a2791cfbe3530142912a0522d7e539f037e8
