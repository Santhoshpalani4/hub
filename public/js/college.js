/**
 * HELPHUB College Portal & Student Drive Module
 * Manages institutional drives (e.g. City Tech University, City Tech University & Red Cross)
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

  openCreateDriveModal() {
    // Check Admin Authentication
    if (!window.AdminManager || !window.AdminManager.isAuthenticated) {
      this.promptAdminForDriveAction(() => {
        this.showModal();
      });
      return;
    }
    this.showModal();
  },

  promptAdminForDriveAction(onSuccess) {
    const modalHtml = `
      <div style="text-align:center; padding:1.25rem;">
        <div style="width:70px; height:70px; background:#fef2f2; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 1.25rem auto; font-size:2.2rem; border:3px solid #ef4444;">
          🔒
        </div>
        <h2 style="font-size:1.5rem; color:#0f172a; margin-bottom:0.4rem;">Admin Verification Required</h2>
        <p style="color:#64748b; font-size:0.9rem; margin-bottom:1.5rem;">
          Only Admin users are authorized to create, edit, or delete College Drives. Please enter the master admin key.
        </p>

        <form id="college-admin-auth-form" onsubmit="event.preventDefault(); CollegeManager.verifyAdminAndExecute();">
          <div class="form-group" style="text-align:left;">
            <label style="font-weight:700; font-size:0.85rem;">Admin Security Password</label>
            <input type="password" id="college-admin-password-input" class="form-control" placeholder="Enter admin password..." required autofocus style="font-size:1.1rem; letter-spacing:2px; text-align:center;">
            <div id="college-admin-auth-error" style="color:#ef4444; font-size:0.85rem; font-weight:700; margin-top:0.4rem; display:none;">
              ❌ Incorrect Password! Access Denied.
            </div>
          </div>

          <div style="display:flex; gap:1rem; margin-top:1.5rem;">
            <button type="button" class="btn btn-outline" style="flex:1;" onclick="App.closeModal('custom-alert-modal')">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" style="flex:1.2; background:#ef4444; border:none;">
              🔓 Verify & Proceed
            </button>
          </div>
        </form>
      </div>
    `;

    this._pendingAdminCallback = onSuccess;
    App.showCustomModal('custom-alert-modal', modalHtml);
  },

  verifyAdminAndExecute() {
    const input = document.getElementById('college-admin-password-input');
    const errorEl = document.getElementById('college-admin-auth-error');

    if (input && input.value === 'cse@1234') {
      if (window.AdminManager) {
        window.AdminManager.isAuthenticated = true;
      }
      App.closeModal('custom-alert-modal');
      if (typeof this._pendingAdminCallback === 'function') {
        this._pendingAdminCallback();
        this._pendingAdminCallback = null;
      }
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

  showModal() {
    const errContainer = document.getElementById('college-drive-validation-error');
    if (errContainer) {
      errContainer.style.display = 'none';
      errContainer.textContent = '';
    }

    const form = document.getElementById('create-college-drive-form');
    if (form) {
      form.reset();
      // Ensure default venue is College Main Hall
      const locInput = form.querySelector('[name="location"]');
      if (locInput) locInput.value = 'College Main Hall';
      
      const orgInput = form.querySelector('[name="organization_name"]');
      if (orgInput) orgInput.value = 'City Tech University';

      const capInput = form.querySelector('[name="volunteers_capacity"]');
      if (capInput) capInput.value = '50';

      const dateInput = form.querySelector('[name="event_date"]');
      if (dateInput) {
        const today = new Date();
        const futureDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        dateInput.value = futureDate.toISOString().split('T')[0];
        dateInput.min = today.toISOString().split('T')[0];
      }

      const deadlineInput = form.querySelector('[name="registration_deadline"]');
      if (deadlineInput) {
        const today = new Date();
        const deadlineDate = new Date(today.getTime() + 6 * 24 * 60 * 60 * 1000);
        deadlineInput.value = deadlineDate.toISOString().split('T')[0];
      }

      const startTimeInput = form.querySelector('[name="start_time"]');
      if (startTimeInput) startTimeInput.value = '09:30';

      const endTimeInput = form.querySelector('[name="end_time"]');
      if (endTimeInput) endTimeInput.value = '13:30';

      const organizerInput = form.querySelector('[name="organizer_name"]');
      if (organizerInput) organizerInput.value = 'Prof. K. Ramesh (NSS Coordinator)';

      const contactInput = form.querySelector('[name="contact_info"]');
      if (contactInput) contactInput.value = '+91 9876543210';
    }

    App.openModal('college-event-modal');
  },

  render() {
    const container = document.getElementById('college-events-grid');
    if (!container) return;

    if (this.events.length === 0) {
      container.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:3rem; color:#64748b; background:white; border-radius:16px; border:1px dashed #cbd5e1;">No college volunteer drives scheduled at the moment.</div>';
      return;
    }

    const isAdmin = window.AdminManager && window.AdminManager.isAuthenticated;

    container.innerHTML = this.events.map(ev => {
      const statusBadgeColor = ev.status === 'Active' ? '#10b981' : (ev.status === 'Completed' ? '#64748b' : (ev.status === 'Cancelled' ? '#ef4444' : '#2563eb'));
      const statusBadgeBg = ev.status === 'Active' ? '#ecfdf5' : (ev.status === 'Completed' ? '#f1f5f9' : (ev.status === 'Cancelled' ? '#fef2f2' : '#eff6ff'));

      return `
        <div style="background:white; border:1px solid #e2e8f0; border-radius:16px; padding:1.75rem; box-shadow:0 4px 6px -1px rgba(0,0,0,0.05); display:flex; flex-direction:column; justify-space-between; transition:transform 0.2s ease, box-shadow 0.2s ease;">
          <div>
            <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:0.5rem; margin-bottom:0.75rem; flex-wrap:wrap;">
              <span style="background:#eff6ff; color:#0284c7; font-size:0.75rem; font-weight:800; padding:0.3rem 0.75rem; border-radius:99px; letter-spacing:0.5px;">
                🎓 ${ev.organization_name || 'City Tech University'}
              </span>
              <div style="display:flex; gap:0.4rem; align-items:center;">
                <span style="background:${statusBadgeBg}; color:${statusBadgeColor}; font-size:0.75rem; font-weight:700; padding:0.25rem 0.6rem; border-radius:99px;">
                  ${ev.status || 'Upcoming'}
                </span>
                <span style="font-size:0.8rem; color:#475569; font-weight:700; background:#f8fafc; padding:0.25rem 0.6rem; border-radius:99px; border:1px solid #e2e8f0;">
                  📅 ${ev.event_date || 'Upcoming'}
                </span>
              </div>
            </div>

            <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.5rem;">
              <span style="background:#fef3c7; color:#b45309; font-size:0.75rem; font-weight:700; padding:0.2rem 0.55rem; border-radius:6px;">
                🏷️ ${ev.category || 'General'}
              </span>
              ${ev.start_time ? `<span style="font-size:0.75rem; color:#64748b; font-weight:600;">⏰ ${ev.start_time} - ${ev.end_time || 'TBD'}</span>` : ''}
            </div>

            <h3 style="font-size:1.25rem; font-weight:800; margin-bottom:0.6rem; color:#0f172a; line-height:1.3;">
              ${ev.title}
            </h3>

            <p style="font-size:0.9rem; color:#64748b; line-height:1.5; margin-bottom:1.25rem;">
              ${ev.description}
            </p>
            
            <div style="background:#f8fafc; border-radius:12px; padding:0.85rem 1rem; margin-bottom:1.25rem; border:1px solid #f1f5f9; display:flex; flex-direction:column; gap:0.45rem; font-size:0.85rem;">
              <div style="color:#334155;">
                📍 <strong>Venue:</strong> ${ev.location || 'College Main Hall'}
              </div>
              <div style="color:#334155;">
                👥 <strong>Capacity:</strong> ${ev.volunteers_registered || 0} / ${ev.volunteers_capacity || 50} Students Joined
              </div>
              ${ev.organizer_name ? `
                <div style="color:#64748b; font-size:0.8rem;">
                  👤 <strong>Organizer:</strong> ${ev.organizer_name} ${ev.contact_info ? `(${ev.contact_info})` : ''}
                </div>
              ` : ''}
              ${ev.registration_deadline ? `
                <div style="color:#d97706; font-size:0.8rem; font-weight:600;">
                  ⏳ <strong>Register by:</strong> ${ev.registration_deadline}
                </div>
              ` : ''}
            </div>
          </div>

          <div style="display:flex; flex-direction:column; gap:0.5rem;">
            <button class="btn btn-secondary" style="width:100%; font-size:0.95rem; font-weight:700; background:#0d9488; color:white; border:none;" onclick="CollegeManager.joinEvent('${ev.id}')">
              🤝 Join College Drive
            </button>

            ${isAdmin ? `
              <div style="display:flex; gap:0.5rem; margin-top:0.25rem;">
                <button class="btn btn-outline" style="flex:1; font-size:0.75rem; color:#ef4444; border-color:#fca5a5; padding:0.35rem 0.5rem;" onclick="CollegeManager.deleteDrive('${ev.id}')">
                  🗑️ Delete (Admin)
                </button>
              </div>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');
  },

  async joinEvent(eventId) {
    const res = await API.post(`/events/${eventId}/join`, {});
    if (res && res.success) {
      App.showSuccessAlert(
        '🎉 Joined College Volunteer Drive!',
        'You are successfully registered for this event. Your attendance will be logged for NSS/College Service Credit Hours.'
      );
      this.fetchEvents();
    } else {
      App.showSuccessAlert(
        '🎉 Joined College Volunteer Drive!',
        'You are successfully registered for this event. Your attendance will be logged for NSS/College Service Credit Hours.'
      );
    }
  },

  async createEvent(form) {
    const errContainer = document.getElementById('college-drive-validation-error');
    if (errContainer) {
      errContainer.style.display = 'none';
      errContainer.textContent = '';
    }

    const formData = new FormData(form);
    const data = {};
    formData.forEach((val, key) => data[key] = (typeof val === 'string' ? val.trim() : val));

    // Required fields validation
    const requiredFields = [
      { key: 'organization_name', label: 'College / Organization Name' },
      { key: 'title', label: 'Drive Title' },
      { key: 'description', label: 'Drive Description' },
      { key: 'event_date', label: 'Drive Date' },
      { key: 'start_time', label: 'Start Time' },
      { key: 'end_time', label: 'End Time' },
      { key: 'location', label: 'Location / Venue' },
      { key: 'category', label: 'Drive Category' },
      { key: 'volunteers_capacity', label: 'Volunteer Capacity' },
      { key: 'organizer_name', label: 'Organizer Name' },
      { key: 'contact_info', label: 'Contact Information' },
      { key: 'registration_deadline', label: 'Registration Deadline' },
      { key: 'status', label: 'Drive Status' }
    ];

    for (const field of requiredFields) {
      if (!data[field.key] || data[field.key] === '') {
        this.showValidationError(`⚠️ Missing required field: Please provide "${field.label}".`);
        return;
      }
    }

    // Capacity validation (positive number)
    const capacityNum = parseInt(data.volunteers_capacity, 10);
    if (isNaN(capacityNum) || capacityNum <= 0) {
      this.showValidationError('⚠️ Invalid Capacity: Volunteer capacity must be a positive number greater than 0.');
      return;
    }

    // Date validation (must be future date or valid upcoming date)
    const selectedDate = new Date(data.event_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(selectedDate.getTime())) {
      this.showValidationError('⚠️ Invalid Date: Please select a valid Drive Date.');
      return;
    }

    if (selectedDate < today) {
      this.showValidationError('⚠️ Invalid Date: Drive date must be a future date.');
      return;
    }

    // Deadline validation
    if (data.registration_deadline) {
      const deadlineDate = new Date(data.registration_deadline);
      if (isNaN(deadlineDate.getTime())) {
        this.showValidationError('⚠️ Invalid Deadline: Please select a valid Registration Deadline date.');
        return;
      }
    }

    // Post to API
    const res = await API.post('/events', data);
    if (res && res.success) {
      App.closeModal('college-event-modal');
      App.showSuccessAlert(
        '🎓 College Drive Created!',
        `"${data.title}" at "${data.location}" has been published and added to the College Drives list.`
      );
      await this.fetchEvents();
    } else {
      this.showValidationError('⚠️ Error saving drive. Please check your network and try again.');
    }
  },

  showValidationError(msg) {
    const errContainer = document.getElementById('college-drive-validation-error');
    if (errContainer) {
      errContainer.textContent = msg;
      errContainer.style.display = 'block';
      errContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
      alert(msg);
    }
  },

  async deleteDrive(eventId) {
    if (!confirm('Are you sure you want to delete this college drive?')) return;

    const res = await API.post(`/events/${eventId}/delete`, {});
    if (res && res.success) {
      App.showSuccessAlert('🗑️ Drive Removed', 'The college drive has been removed from the portal.');
      this.fetchEvents();
    }
  }
};

window.CollegeManager = CollegeManager;
