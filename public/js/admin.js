/**
 * HELPHUB Admin Portal Module
 * Central Control Panel for System Administrators
 * Manages all help requests (View, Edit, Delete), system metrics, and security authorization
 */
const AdminManager = {
  metrics: null,
  isAuthenticated: false,
  ADMIN_KEY: 'cse@1234',

  async init() {
    if (sessionStorage.getItem('helphub_admin_auth') === 'true') {
      this.isAuthenticated = true;
    }
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
      sessionStorage.setItem('helphub_admin_auth', 'true');
      App.closeModal('custom-alert-modal');
      
      App.showSuccessAlert(
        '🔓 Master Admin Access Granted',
        'Welcome, System Administrator. You have full access to database metrics, request audits, and emergency overrides.'
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
    sessionStorage.removeItem('helphub_admin_auth');
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
    if (elActiveReq) elActiveReq.textContent = (this.metrics.requests && this.metrics.requests.length) || this.metrics.active_requests || 4;
    if (elCompReq) elCompReq.textContent = this.metrics.completed_requests || 498;

    this.renderRequestsTable(this.metrics.requests || []);
  },

  renderRequestsTable(requests) {
    const tbody = document.getElementById('admin-requests-table-body');
    if (!tbody) return;

    if (requests.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:2rem; color:#64748b;">No active requests in system.</td></tr>';
      return;
    }

    tbody.innerHTML = requests.map(r => {
      const isEmergency = r.is_emergency || r.priority === 'EMERGENCY';
      const statusColor = r.status === 'COMPLETED' ? '#10b981' : (r.status === 'IN_PROGRESS' ? '#f59e0b' : (r.status === 'CANCELLED' ? '#ef4444' : '#2563eb'));
      const statusBg = r.status === 'COMPLETED' ? '#ecfdf5' : (r.status === 'IN_PROGRESS' ? '#fef3c7' : (r.status === 'CANCELLED' ? '#fef2f2' : '#eff6ff'));

      return `
        <tr style="border-bottom:1px solid #f1f5f9; transition:background 0.2s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='white'">
          <td style="padding:0.85rem 0.75rem; font-weight:800; color:#0f172a;">
            <a href="javascript:void(0)" onclick="AdminManager.openViewModal('${r.id}')" style="color:#2563eb; text-decoration:none;">
              ${r.request_code}
            </a>
          </td>
          <td style="padding:0.85rem 0.75rem; font-weight:600; color:#1e293b; max-width:240px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
            ${r.title}
          </td>
          <td style="padding:0.85rem 0.75rem;">
            <span style="background:#f1f5f9; color:#475569; padding:0.25rem 0.55rem; border-radius:6px; font-size:0.75rem; font-weight:700;">
              ${r.category}
            </span>
          </td>
          <td style="padding:0.85rem 0.75rem; color:#64748b; font-size:0.85rem; max-width:180px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
            📍 ${r.location_name}
          </td>
          <td style="padding:0.85rem 0.75rem;">
            <span class="badge-priority ${isEmergency ? 'priority-emergency' : (r.priority === 'HIGH' ? 'priority-high' : 'priority-normal')}" style="font-size:0.75rem;">
              ${r.priority}
            </span>
          </td>
          <td style="padding:0.85rem 0.75rem;">
            <span onclick="AdminManager.openViewModal('${r.id}')" style="cursor:pointer; background:${statusBg}; color:${statusColor}; font-weight:800; font-size:0.75rem; padding:0.25rem 0.6rem; border-radius:99px; display:inline-block;" title="Click to view full details">
              ${r.status}
            </span>
          </td>
          <td style="padding:0.85rem 0.75rem; text-align:center;">
            <div style="display:flex; gap:0.35rem; justify-content:center;">
              <button class="btn btn-outline" style="padding:0.3rem 0.55rem; font-size:0.75rem; font-weight:700; color:#2563eb; border-color:#93c5fd;" onclick="AdminManager.openViewModal('${r.id}')" title="View Request Details">
                👁️ View
              </button>
              <button class="btn btn-outline" style="padding:0.3rem 0.55rem; font-size:0.75rem; font-weight:700; color:#d97706; border-color:#fcd34d;" onclick="AdminManager.openEditModal('${r.id}')" title="Edit Request">
                ✏️ Edit
              </button>
              <button class="btn btn-outline" style="padding:0.3rem 0.55rem; font-size:0.75rem; font-weight:700; color:#ef4444; border-color:#fca5a5;" onclick="AdminManager.deleteRequest('${r.id}')" title="Delete Request">
                🗑️ Delete
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  async openViewModal(reqId) {
    if (!this.isAuthenticated) {
      this.promptAdminPassword();
      return;
    }

    let req = (this.metrics && this.metrics.requests) ? this.metrics.requests.find(r => r.id === reqId || r.request_code === reqId) : null;

    if (!req) {
      req = await API.get(`/requests/${reqId}`);
    }

    if (!req) {
      alert('Request details could not be loaded.');
      return;
    }

    const titleEl = document.getElementById('admin-view-title');
    if (titleEl) {
      titleEl.textContent = `Request [${req.request_code}] - ${req.title}`;
    }

    const isEmergency = req.is_emergency || req.priority === 'EMERGENCY';
    const statusColor = req.status === 'COMPLETED' ? '#10b981' : (req.status === 'IN_PROGRESS' ? '#f59e0b' : (req.status === 'CANCELLED' ? '#ef4444' : '#2563eb'));
    const statusBg = req.status === 'COMPLETED' ? '#ecfdf5' : (req.status === 'IN_PROGRESS' ? '#fef3c7' : (req.status === 'CANCELLED' ? '#fef2f2' : '#eff6ff'));

    const assigned = req.assigned_volunteer || (req.team && req.team.assigned_to) || 'None (Open for volunteers)';

    const detailsContainer = document.getElementById('admin-view-details-content');
    if (detailsContainer) {
      detailsContainer.innerHTML = `
        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:1.25rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; flex-wrap:wrap; gap:0.5rem;">
            <div style="display:flex; gap:0.5rem; align-items:center;">
              <span style="font-weight:800; font-size:1.1rem; color:#0f172a;">${req.request_code}</span>
              <span style="background:#e0f2fe; color:#0369a1; font-size:0.75rem; font-weight:800; padding:0.25rem 0.6rem; border-radius:99px;">
                🏷️ ${req.category}
              </span>
            </div>
            <div style="display:flex; gap:0.5rem; align-items:center;">
              <span class="badge-priority ${isEmergency ? 'priority-emergency' : (req.priority === 'HIGH' ? 'priority-high' : 'priority-normal')}">
                ${isEmergency ? '🚨 EMERGENCY' : req.priority}
              </span>
              <span style="background:${statusBg}; color:${statusColor}; font-weight:800; font-size:0.8rem; padding:0.25rem 0.65rem; border-radius:99px;">
                ${req.status}
              </span>
            </div>
          </div>

          <h3 style="font-size:1.2rem; color:#0f172a; margin-bottom:0.6rem; line-height:1.4;">${req.title}</h3>
          <p style="font-size:0.95rem; color:#475569; line-height:1.6; margin-bottom:1rem; background:white; padding:0.75rem 1rem; border-radius:8px; border:1px solid #e2e8f0;">
            ${req.description}
          </p>

          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:0.75rem; font-size:0.85rem; color:#334155;">
            <div>👤 <strong>Requester:</strong> ${req.requester_name || 'Community Member'}</div>
            <div>📞 <strong>Contact:</strong> ${req.contact_number || '+91 9876543210'}</div>
            <div>📍 <strong>Location:</strong> ${req.location_name || 'N/A'}</div>
            <div>👥 <strong>Capacity:</strong> ${req.volunteers_joined || 0} / ${req.volunteers_needed || 4} Joined</div>
            <div>📅 <strong>Date/Time:</strong> ${req.request_date || 'N/A'} ${req.request_time ? `(${req.request_time})` : ''}</div>
            <div>🚨 <strong>Emergency Flag:</strong> ${isEmergency ? 'Yes (Urgent Priority)' : 'No (Standard Request)'}</div>
            <div>🤝 <strong>Assigned Volunteer:</strong> ${assigned}</div>
            <div>🕒 <strong>System Created:</strong> ${req.created_at || 'Recently'}</div>
          </div>
        </div>
      `;
    }

    // Set buttons
    const editBtn = document.getElementById('admin-view-edit-btn');
    if (editBtn) {
      editBtn.onclick = () => {
        App.closeModal('admin-view-modal');
        AdminManager.openEditModal(req.id);
      };
    }

    const delBtn = document.getElementById('admin-view-del-btn');
    if (delBtn) {
      delBtn.onclick = () => {
        AdminManager.deleteRequest(req.id);
      };
    }

    App.openModal('admin-view-modal');
  },

  async openEditModal(reqId) {
    if (!this.isAuthenticated) {
      this.promptAdminPassword();
      return;
    }

    App.closeModal('admin-view-modal');

    let req = (this.metrics && this.metrics.requests) ? this.metrics.requests.find(r => r.id === reqId || r.request_code === reqId) : null;

    if (!req) {
      req = await API.get(`/requests/${reqId}`);
    }

    if (!req) {
      alert('Request details could not be loaded for editing.');
      return;
    }

    const errContainer = document.getElementById('admin-edit-validation-error');
    if (errContainer) errContainer.style.display = 'none';

    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = (val !== undefined && val !== null) ? val : '';
    };

    setVal('edit-req-id', req.id);
    setVal('edit-req-title', req.title);
    setVal('edit-req-category', req.category);
    setVal('edit-req-location', req.location_name);
    setVal('edit-req-priority', req.priority || 'HIGH');
    setVal('edit-req-is-emergency', String(req.is_emergency || req.priority === 'EMERGENCY'));
    setVal('edit-req-status', req.status || 'OPEN');
    setVal('edit-req-assigned-vol', req.assigned_volunteer || (req.team && req.team.assigned_to) || '');
    setVal('edit-req-vol-needed', req.volunteers_needed || 4);
    setVal('edit-req-requester-name', req.requester_name || '');
    setVal('edit-req-contact-number', req.contact_number || '');
    setVal('edit-req-description', req.description || '');

    App.openModal('admin-edit-modal');
  },

  async saveEditRequest(form) {
    const errContainer = document.getElementById('admin-edit-validation-error');
    if (errContainer) errContainer.style.display = 'none';

    const formData = new FormData(form);
    const data = {};
    formData.forEach((val, key) => data[key] = (typeof val === 'string' ? val.trim() : val));

    if (!data.title || !data.category || !data.location_name || !data.description) {
      if (errContainer) {
        errContainer.textContent = '⚠️ Please fill out all required fields marked with *.';
        errContainer.style.display = 'block';
      }
      return;
    }

    const res = await API.post(`/requests/${data.id}/edit`, data);
    if (res && res.success) {
      App.closeModal('admin-edit-modal');
      App.showSuccessAlert(
        '💾 Request Updated by Admin',
        `Help Request #${data.id} has been successfully updated and synced across all pages.`
      );

      // Refresh Admin data
      await this.fetchMetrics();

      // Refresh Find Help page requests
      if (window.RequestManager && typeof window.RequestManager.fetchRequests === 'function') {
        await window.RequestManager.fetchRequests();
      }
    } else {
      if (errContainer) {
        errContainer.textContent = res && res.error ? `⚠️ ${res.error}` : '⚠️ Error saving changes. Admin authorization required.';
        errContainer.style.display = 'block';
      }
    }
  },

  async deleteRequest(reqId) {
    if (!this.isAuthenticated) {
      this.promptAdminPassword();
      return;
    }

    if (!confirm('Are you sure you want to delete this help request?')) {
      return;
    }

    const res = await API.post(`/requests/${reqId}/delete`, {});
    if (res && res.success) {
      App.closeModal('admin-view-modal');
      App.showSuccessAlert(
        '🗑️ Request Deleted',
        `Help Request #${reqId} was permanently deleted from the database.`
      );

      // Refresh Admin data
      await this.fetchMetrics();

      // Refresh Find Help page requests
      if (window.RequestManager && typeof window.RequestManager.fetchRequests === 'function') {
        await window.RequestManager.fetchRequests();
      }
    } else {
      alert(res && res.error ? res.error : 'Failed to delete request. Admin authorization required.');
    }
  }
};

window.AdminManager = AdminManager;
