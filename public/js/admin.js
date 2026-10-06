/**
 * HELPHUB Admin Portal Module
 * Provides administration tables, security overrides, and password-protected admin access
 */
const AdminManager = {
  metrics: null,
  isAuthenticated: false,
  ADMIN_KEY: 'cse@1234',

  async init() {
    // Initialized on-demand upon authorized entry
  },

  handleAdminNavClick() {
    if (this.isAuthenticated) {
      App.showSection('admin');
      this.fetchMetrics();
    } else {
      this.promptAdminPassword();
    }
  },

  promptAdminPassword() {
    const modalHtml = `
      <div style="text-align:center; padding:1.25rem;">
        <div style="width:70px; height:70px; background:#fef2f2; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 1.25rem auto; font-size:2.2rem; border:3px solid #ef4444;">
          🔒
        </div>
        <h2 style="font-size:1.6rem; color:#0f172a; margin-bottom:0.4rem;">Admin Verification Required</h2>
        <p style="color:#64748b; font-size:0.9rem; margin-bottom:1.5rem;">
          The Admin Panel is restricted to authorized personnel. Please enter the master admin key to proceed.
        </p>

        <form onsubmit="event.preventDefault(); AdminManager.verifyPassword();">
          <div class="form-group" style="text-align:left;">
            <label style="font-weight:700; font-size:0.85rem;">Admin Security Password</label>
            <input type="password" id="admin-password-input" class="form-control" placeholder="Enter admin password..." required autofocus style="font-size:1.1rem; letter-spacing:2px; text-align:center;">
            <div id="admin-auth-error" style="color:#ef4444; font-size:0.85rem; font-weight:700; margin-top:0.4rem; display:none;">
              ❌ Incorrect Password! Access Denied.
            </div>
          </div>

          <div style="display:flex; gap:1rem; margin-top:1.5rem;">
            <button type="button" class="btn btn-outline" style="flex:1;" onclick="App.closeModal('custom-alert-modal')">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" style="flex:1.2; background:#ef4444; border:none;">
              🔓 Unlock Admin Panel
            </button>
          </div>
        </form>
      </div>
    `;

    App.showCustomModal('custom-alert-modal', modalHtml);
  },

  verifyPassword() {
    const input = document.getElementById('admin-password-input');
    const errorEl = document.getElementById('admin-auth-error');

    if (input && input.value === this.ADMIN_KEY) {
      this.isAuthenticated = true;
      App.closeModal('custom-alert-modal');
      
      App.showSuccessAlert(
        '🔓 Master Admin Access Granted',
        'Welcome, System Administrator. You have full access to database metrics, user audit logs, and emergency controls.'
      );

      // Navigate to Admin Section & highlight navbar
      App.showSection('admin');
      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
      const adminLink = document.querySelector('.nav-link[data-section="admin"]');
      if (adminLink) adminLink.classList.add('active');

      this.fetchMetrics();
    } else {
      if (errorEl) {
        errorEl.style.display = 'block';
        if (input) {
          input.value = '';
          input.focus();
        }
      }
    }
  },

  lockAdmin() {
    this.isAuthenticated = false;
    App.showSuccessAlert('🔒 Admin Panel Locked', 'Admin session terminated successfully.');
    App.showSection('home');
  },

  async fetchMetrics() {
    const data = await API.get('/admin/metrics');
    if (data) {
      this.metrics = data;
      this.render();
    }
  },

  render() {
    if (!this.metrics) return;

    const elTotalUsers = document.getElementById('admin-total-users');
    const elActiveVol = document.getElementById('admin-active-vol');
    const elActiveReq = document.getElementById('admin-active-req');
    const elCompReq = document.getElementById('admin-comp-req');

    if (elTotalUsers) elTotalUsers.textContent = this.metrics.total_users || 127;
    if (elActiveVol) elActiveVol.textContent = this.metrics.active_volunteers || 89;
    if (elActiveReq) elActiveReq.textContent = this.metrics.active_requests || 4;
    if (elCompReq) elCompReq.textContent = this.metrics.completed_requests || 498;

    this.renderRequestsTable(this.metrics.requests || []);
  },

  renderRequestsTable(requests) {
    const tbody = document.getElementById('admin-requests-table-body');
    if (!tbody) return;

    if (requests.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:1.5rem;">No requests found.</td></tr>';
      return;
    }

    tbody.innerHTML = requests.map(r => `
      <tr>
        <td style="padding:0.75rem; font-weight:700;">${r.request_code}</td>
        <td style="padding:0.75rem;">${r.title}</td>
        <td style="padding:0.75rem;"><span style="background:#eff6ff; color:#2563eb; padding:0.2rem 0.5rem; border-radius:4px; font-size:0.75rem; font-weight:700;">${r.category}</span></td>
        <td style="padding:0.75rem;">${r.location_name}</td>
        <td style="padding:0.75rem;"><span class="badge-priority ${r.priority === 'EMERGENCY' ? 'priority-emergency' : 'priority-high'}">${r.priority}</span></td>
        <td style="padding:0.75rem;"><strong style="color:${r.status === 'COMPLETED' ? '#10b981' : '#2563eb'};">${r.status}</strong></td>
      </tr>
    `).join('');
  }
};

window.AdminManager = AdminManager;
