/**
 * HELPHUB Help Request Module
 * Handles creation of Help Requests, search, category selection, and card rendering
 */
const RequestManager = {
  requests: [],

  categoryIcons: {
    'Medical Support': '🏥',
    'Blood Donation': '🩸',
    'Elderly Assistance': '👴',
    'Education Support': '📚',
    'Food Distribution': '🍱',
    'Environmental Activities': '🌱',
    'Accessibility Assistance': '♿',
    'Emergency Support': '🚨',
    'College Activities': '🎓',
    'Other Social Help': '🤝'
  },

  async init() {
    await this.fetchRequests();
    this.bindEvents();
  },

  async fetchRequests() {
    const data = await API.get('/requests');
    if (data && Array.isArray(data)) {
      this.requests = data;
      this.render();
    }
  },

  bindEvents() {
    const form = document.getElementById('create-request-form');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.handleCreateFormSubmit(form);
      });
    }

    const searchInput = document.getElementById('search-requests-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.filterAndRender(e.target.value.toLowerCase());
      });
    }
  },

  async handleCreateFormSubmit(form) {
    const formData = new FormData(form);
    const data = {};
    formData.forEach((val, key) => data[key] = val);

    const result = await API.post('/requests', data);
    if (result && result.success) {
      // Close Modal
      App.closeModal('request-modal');
      form.reset();

      // Show Success Popup with Unique Request ID
      App.showSuccessAlert(
        'Help Request Created Successfully',
        `Request ID: <strong>${result.request_id}</strong> has been generated and broadcasted to nearby volunteers!`
      );

      // Add to local state & notify
      if (result.data) {
        this.requests.unshift(result.data);
        this.render();
      }

      // Refresh notifications
      NotificationEngine.fetchNotifications();
    }
  },

  render(filteredList = null) {
    const grid = document.getElementById('requests-grid-container');
    if (!grid) return;

    const list = filteredList || this.requests;

    if (list.length === 0) {
      grid.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding:3rem; background:white; border-radius:16px;"><h3>No Help Requests Found</h3><p style="color:#64748b;">Be the first to post a request or adjust your search filter.</p></div>';
      return;
    }

    grid.innerHTML = list.map(req => {
      const icon = this.categoryIcons[req.category] || '🤝';
      const isEmergency = req.is_emergency || req.priority === 'EMERGENCY';
      const joined = req.volunteers_joined || 0;
      const needed = req.volunteers_needed || 1;
      const pct = Math.min(Math.round((joined / needed) * 100), 100);

      return `
        <div class="request-card ${isEmergency ? 'emergency-card' : ''}" id="card-${req.id}">
          <div class="request-card-header">
            <div class="request-badge-group">
              <span class="badge-priority ${isEmergency ? 'priority-emergency' : (req.priority === 'HIGH' ? 'priority-high' : 'priority-normal')}">
                ${isEmergency ? '🚨 EMERGENCY' : req.priority}
              </span>
              <span style="font-size:0.8rem; font-weight:700; color:#64748b; background:#f1f5f9; padding:0.25rem 0.6rem; border-radius:99px;">
                ${icon} ${req.category}
              </span>
            </div>
            <span class="request-code-lbl">${req.request_code}</span>
          </div>

          <div class="request-card-body">
            <h3 class="request-title">${req.title}</h3>
            
            <div class="request-meta-row">
              <span>📍</span> <strong>${req.location_name}</strong>
            </div>

            <div class="request-meta-row">
              <span>👥</span> <span>${joined} / ${needed} Volunteers Joined</span>
              <span style="margin-left:auto;">🕐 ${req.request_time || '6:30 PM'}</span>
            </div>

            <p class="request-desc">${req.description}</p>

            <div class="volunteer-progress-bar">
              <div class="volunteer-progress-fill" style="width: ${pct}%;"></div>
            </div>
          </div>

          <div class="request-card-footer">
            <button class="btn-help-action" onclick="VolunteerManager.joinHelpRequest('${req.id}')">
              🤝 I CAN HELP
            </button>
          </div>
        </div>
      `;
    }).join('');
  },

  filterAndRender(query, btnElement = null) {
    if (btnElement) {
      document.querySelectorAll('.filter-tabs .tab-btn').forEach(b => b.classList.remove('active'));
      btnElement.classList.add('active');
    }

    if (!query || query.trim() === '') {
      this.render();
      return;
    }

    const q = query.trim().toLowerCase();
    const filtered = this.requests.filter(r =>
      (r.priority && r.priority.toLowerCase() === q) ||
      (q === 'emergency' && (r.is_emergency || r.priority === 'EMERGENCY')) ||
      r.title.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q) ||
      r.location_name.toLowerCase().includes(q) ||
      r.request_code.toLowerCase().includes(q)
    );
    this.render(filtered);
  }
};

window.RequestManager = RequestManager;
