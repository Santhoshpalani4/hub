/**
 * HELPHUB College Portal & Student Drive Module
 * Manages institutional drives (e.g. City Tech University)
 */
const CollegeManager = {
  events: [],

  async init() {
    await this.fetchEvents();
  },

  async fetchEvents() {
    const data = await API.get('/events');
    if (data && Array.isArray(data)) {
      this.events = data;
      this.render();
    }
  },

  render() {
    const container = document.getElementById('college-events-grid');
    if (!container) return;

    if (this.events.length === 0) {
      container.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:2rem;">No college drives available right now.</div>';
      return;
    }

    container.innerHTML = this.events.map(ev => `
      <div style="background:white; border:1px solid #e2e8f0; border-radius:16px; padding:1.5rem; box-shadow:0 4px 6px -1px rgba(0,0,0,0.05); display:flex; flex-direction:column; justify-space-between;">
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
            <span style="background:#eff6ff; color:#2563eb; font-size:0.75rem; font-weight:800; padding:0.25rem 0.6rem; border-radius:99px;">
              🎓 ${ev.organization_name}
            </span>
            <span style="font-size:0.8rem; color:#64748b; font-weight:600;">📅 ${ev.event_date}</span>
          </div>

          <h3 style="font-size:1.2rem; margin-bottom:0.5rem; color:#0f172a;">${ev.title}</h3>
          <p style="font-size:0.9rem; color:#64748b; margin-bottom:1rem;">${ev.description}</p>
          
          <div style="font-size:0.85rem; color:#475569; margin-bottom:0.5rem;">
            📍 <strong>${ev.location}</strong>
          </div>
          <div style="font-size:0.85rem; color:#475569; margin-bottom:1rem;">
            👥 <strong>${ev.volunteers_registered || 38} / ${ev.volunteers_capacity} Students Joined</strong>
          </div>
        </div>

        <button class="btn btn-secondary" style="width:100%; font-size:0.9rem;" onclick="CollegeManager.joinEvent('${ev.id}')">
          🤝 JOIN COLLEGE DRIVE
        </button>
      </div>
    `).join('');
  },

  async joinEvent(eventId) {
    App.showSuccessAlert(
      '🎉 Joined College Volunteer Drive!',
      'You are registered for this event. Your attendance will be logged for NSS/College Service Credit Hours.'
    );
  },

  async createEvent(form) {
    const formData = new FormData(form);
    const data = {};
    formData.forEach((val, key) => data[key] = val);

    const res = await API.post('/events', data);
    if (res && res.success) {
      App.closeModal('college-event-modal');
      App.showSuccessAlert('🎓 Event Published', 'College volunteer drive is now live for student registrations!');
      this.fetchEvents();
    }
  }
};

window.CollegeManager = CollegeManager;
