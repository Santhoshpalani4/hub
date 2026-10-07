/**
 * HELPHUB Volunteer Dashboard, Profile Management & Team Assembly Module
 * Manages Volunteer acceptance, automatic team formation, and authenticated profile editing
 */
const VolunteerManager = {
  currentVolunteer: null,
  currentUser: null,
  activeMission: null,

  async init() {
    const savedVol = sessionStorage.getItem('helphub_current_volunteer');
    const savedUser = sessionStorage.getItem('helphub_current_user');

    if (savedVol) {
      try {
        this.currentVolunteer = JSON.parse(savedVol);
      } catch (e) {}
    }
    if (savedUser) {
      try {
        this.currentUser = JSON.parse(savedUser);
      } catch (e) {}
    }

    if (this.currentVolunteer && this.currentVolunteer.id) {
      await this.fetchVolunteerProfile(this.currentVolunteer.id);
    }
  },

  async fetchVolunteerProfile(volId) {
    const targetId = volId || (this.currentVolunteer && this.currentVolunteer.id);
    if (!targetId) return;

    const data = await API.get(`/volunteers/${targetId}`);
    if (data) {
      this.currentVolunteer = data;
      if (data.user) {
        this.currentUser = data.user;
      }
      sessionStorage.setItem('helphub_current_volunteer', JSON.stringify(this.currentVolunteer));
      if (this.currentUser) {
        sessionStorage.setItem('helphub_current_user', JSON.stringify(this.currentUser));
      }
      this.renderProfile(this.currentVolunteer);
    }
  },

  calculateCompletion(vol) {
    if (!vol) return 0;
    const fields = [
      vol.name,
      vol.phone,
      vol.email,
      vol.college_name,
      vol.department,
      vol.year_of_study,
      vol.skills,
      vol.areas_of_interest,
      vol.availability,
      vol.preferred_categories,
      vol.address,
      vol.bio
    ];
    const filled = fields.filter(f => f && String(f).trim().length > 0).length;
    return Math.round((filled / fields.length) * 100);
  },

  renderProfile(vol) {
    if (!vol) return;

    // Header Info
    const elImg = document.getElementById('profile-img');
    const elName = document.getElementById('profile-name-text');
    const elDeptHeader = document.getElementById('profile-dept-header');
    const elYearHeader = document.getElementById('profile-year-header');
    const elRoleTag = document.getElementById('profile-role-tag');
    const elRating = document.getElementById('profile-rating-val');

    if (elImg && vol.avatar) elImg.src = vol.avatar;
    if (elName) elName.textContent = vol.name || 'Student Volunteer';
    if (elDeptHeader) elDeptHeader.textContent = vol.department || 'Department of Engineering';
    if (elYearHeader) elYearHeader.textContent = vol.year_of_study || 'Student';
    if (elRoleTag) elRoleTag.textContent = `🎓 ${(vol.role || 'VOLUNTEER').toUpperCase()}`;
    if (elRating) elRating.textContent = `${vol.safety_rating || 5.0} / 5.0`;

    // Completion Status
    const completionPct = this.calculateCompletion(vol);
    const elPct = document.getElementById('profile-completion-pct');
    const elBar = document.getElementById('profile-completion-bar');
    if (elPct) elPct.textContent = `${completionPct}%`;
    if (elBar) elBar.style.width = `${completionPct}%`;

    // Account & Academic Details
    const elNameVal = document.getElementById('profile-name-val');
    const elRoleVal = document.getElementById('profile-role-val');
    const elPhoneVal = document.getElementById('profile-phone-val');
    const elEmailVal = document.getElementById('profile-email-val');
    const elCollegeVal = document.getElementById('profile-college-val');
    const elDeptVal = document.getElementById('profile-dept-val');
    const elYearVal = document.getElementById('profile-year-val');

    if (elNameVal) elNameVal.textContent = vol.name || 'N/A';
    if (elRoleVal) elRoleVal.textContent = vol.role || 'Volunteer';
    if (elPhoneVal) elPhoneVal.textContent = vol.phone || 'Not provided';
    if (elEmailVal) elEmailVal.textContent = vol.email || 'Not provided';
    if (elCollegeVal) elCollegeVal.textContent = vol.college_name || 'City Tech University';
    if (elDeptVal) elDeptVal.textContent = vol.department || 'Not specified';
    if (elYearVal) elYearVal.textContent = vol.year_of_study || 'Not specified';

    // Skills, Availability & Preferences
    const elSkillsVal = document.getElementById('profile-skills-val');
    const elInterestsVal = document.getElementById('profile-interests-val');
    const elAvailVal = document.getElementById('profile-avail-val');
    const elCategoriesVal = document.getElementById('profile-categories-val');
    const elAddressVal = document.getElementById('profile-address-val');
    const elEmergVal = document.getElementById('profile-emerg-val');
    const elBioVal = document.getElementById('profile-bio-val');

    if (elSkillsVal) elSkillsVal.textContent = vol.skills || 'None specified. Click Complete Profile to add skills.';
    if (elInterestsVal) elInterestsVal.textContent = vol.areas_of_interest || 'Community Service, Healthcare, Education';
    if (elAvailVal) elAvailVal.textContent = vol.availability || 'Weekends, Evenings & On-Call Emergencies';
    if (elCategoriesVal) elCategoriesVal.textContent = vol.preferred_categories || 'Medical Support, Cleanliness, Education';
    if (elAddressVal) elAddressVal.textContent = vol.address || 'Campus Block B Hostel';
    if (elEmergVal) elEmergVal.textContent = vol.emergency_contact || '+91 9876543299';
    if (elBioVal) elBioVal.textContent = vol.bio || 'Dedicated student volunteer committed to social development and community impact.';

    // Statistics
    const elRequests = document.getElementById('profile-requests-val');
    const elPoints = document.getElementById('profile-points-val');
    const elHours = document.getElementById('profile-hours-val');
    const elActs = document.getElementById('profile-acts-val');
    const elDrives = document.getElementById('profile-drives-val');

    if (elRequests) elRequests.textContent = vol.total_requests || (vol.activities_completed ? vol.activities_completed + 3 : 0);
    if (elPoints) elPoints.textContent = vol.points !== undefined ? vol.points : 50;
    if (elHours) elHours.textContent = (vol.total_hours || 0.0) + ' hrs';
    if (elActs) elActs.textContent = vol.activities_completed || 0;
    if (elDrives) elDrives.textContent = vol.drives_joined || 0;

    // Topbar update
    const navUser = document.querySelector('.user-info-text .user-name');
    const navRole = document.querySelector('.user-info-text .user-role');
    if (navUser) navUser.textContent = vol.name;
    if (navRole) navRole.textContent = vol.role === 'Student' ? 'Student' : 'Student Volunteer';
  },

  openEditProfileModal() {
    const vol = this.currentVolunteer;
    if (!vol) {
      alert('Please log in first.');
      return;
    }

    const errContainer = document.getElementById('profile-edit-validation-error');
    if (errContainer) errContainer.style.display = 'none';

    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = (val !== undefined && val !== null) ? val : '';
    };

    setVal('edit-prof-id', vol.id);
    setVal('edit-prof-name', vol.name || '');
    setVal('edit-prof-role', vol.role || 'Volunteer');
    setVal('edit-prof-phone', vol.phone || '');
    setVal('edit-prof-email', vol.email || '');
    setVal('edit-prof-avatar', vol.avatar || '');
    setVal('edit-prof-college', vol.college_name || 'City Tech University');
    setVal('edit-prof-dept', vol.department || '');
    setVal('edit-prof-year', vol.year_of_study || '1st Year');
    setVal('edit-prof-skills', vol.skills || '');
    setVal('edit-prof-interests', vol.areas_of_interest || '');
    setVal('edit-prof-avail', vol.availability || '');
    setVal('edit-prof-categories', vol.preferred_categories || '');
    setVal('edit-prof-address', vol.address || '');
    setVal('edit-prof-emerg', vol.emergency_contact || '');
    setVal('edit-prof-bio', vol.bio || '');

    App.openModal('profile-edit-modal');
  },

  async saveProfileChanges(form) {
    const errContainer = document.getElementById('profile-edit-validation-error');
    if (errContainer) errContainer.style.display = 'none';

    const formData = new FormData(form);
    const data = {};
    formData.forEach((val, key) => data[key] = (typeof val === 'string' ? val.trim() : val));

    // Validation
    if (!data.name || !data.phone || !data.email) {
      if (errContainer) {
        errContainer.textContent = '⚠️ Please fill out all required fields (Name, Phone, Email).';
        errContainer.style.display = 'block';
      }
      return;
    }

    const volId = this.currentVolunteer ? this.currentVolunteer.id : data.id;
    const res = await API.post(`/volunteers/${volId}`, data);

    if (res && res.success) {
      App.closeModal('profile-edit-modal');

      // Update state
      Object.assign(this.currentVolunteer, data);
      if (res.user) this.currentUser = res.user;

      sessionStorage.setItem('helphub_current_volunteer', JSON.stringify(this.currentVolunteer));
      if (this.currentUser) {
        sessionStorage.setItem('helphub_current_user', JSON.stringify(this.currentUser));
      }

      this.renderProfile(this.currentVolunteer);

      App.showSuccessAlert(
        'Profile updated successfully.',
        'Your profile changes have been saved to the database and your dashboard is updated.'
      );
    } else {
      if (errContainer) {
        errContainer.textContent = res && res.error ? `⚠️ ${res.error}` : '⚠️ Failed to save profile changes.';
        errContainer.style.display = 'block';
      }
    }
  },

  async joinHelpRequest(reqId) {
    if (!this.currentVolunteer) {
      alert('Please log in first to join requests.');
      return;
    }

    const res = await API.post(`/requests/${reqId}/join`, {
      volunteer_id: this.currentVolunteer.id,
      volunteer_name: this.currentVolunteer.name
    });

    if (res && res.success) {
      App.showSuccessAlert(
        '🤝 You Have Joined This Help Request!',
        `You are now part of Team <strong>${res.team ? res.team.team_code : 'HH1024'}</strong>. ${res.volunteers_joined} / ${res.volunteers_needed} volunteers joined.`
      );

      this.loadActiveMission(reqId);
      if (window.RequestManager) RequestManager.fetchRequests();
      this.fetchVolunteerProfile(this.currentVolunteer.id);
    }
  },

  async loadActiveMission(reqId) {
    const data = await API.get(`/requests/${reqId}`);
    if (data) {
      this.activeMission = data;
      this.renderActiveMissionBanner(data);
      if (window.MapManager) {
        MapManager.focusOnRequest(data);
      }
    }
  },

  renderActiveMissionBanner(mission) {
    const container = document.getElementById('active-mission-container');
    if (!container) return;

    container.style.display = 'block';

    const members = mission.team_members || [
      { volunteer_name: (this.currentVolunteer && this.currentVolunteer.name) || 'Student Volunteer', status: 'ARRIVED_SAFELY' }
    ];

    container.innerHTML = `
      <div class="active-mission-banner">
        <div class="mission-grid">
          <div>
            <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.5rem;">
              <span style="background:var(--accent-green); color:white; font-size:0.75rem; font-weight:800; padding:0.2rem 0.6rem; border-radius:99px;">
                ACTIVE TEAM MISSION
              </span>
              <span style="font-weight:700; color:#94a3b8;">Request ID: ${mission.request_code}</span>
            </div>

            <h2 style="font-size:1.6rem; margin-bottom:0.5rem; color:white;">🤝 ${mission.title}</h2>
            <p style="color:#cbd5e1; font-size:0.9rem; margin-bottom:1rem;">📍 Location: <strong>${mission.location_name}</strong></p>

            <div style="font-size:0.85rem; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:1px; margin-bottom:0.4rem;">
              VOLUNTEER TEAM (${members.length} / ${mission.volunteers_needed} JOINED)
            </div>

            <div class="team-members-list">
              ${members.map(m => `
                <div class="team-member-chip">
                  <span class="status-dot ${m.status === 'ARRIVED_SAFELY' ? 'status-arrived' : (m.status === 'ON_THE_WAY' ? 'status-on-way' : 'status-accepted')}"></span>
                  <strong>👤 ${m.volunteer_name}</strong>
                  <span style="font-size:0.75rem; color:#cbd5e1;">(${this.formatStatus(m.status)})</span>
                </div>
              `).join('')}
            </div>
          </div>

          <div>
            <div class="safety-arrival-box">
              <div style="font-size:0.9rem; color:#cbd5e1; margin-bottom:0.75rem;">
                Reached the destination? Let your team know!
              </div>
              
              <button class="safety-btn safety-pulse" onclick="SafetyManager.confirmArrival('${mission.id}')">
                🟢 I HAVE ARRIVED SAFELY
              </button>

              <div style="display:flex; gap:0.5rem; margin-top:1rem;">
                <button class="btn btn-outline" style="flex:1; background:rgba(255,255,255,0.1); color:white; border-color:rgba(255,255,255,0.2); font-size:0.85rem;" onclick="VolunteerManager.startActivity('${mission.id}')">
                  ▶ START HELP
                </button>
                <button class="btn btn-primary" style="flex:1; font-size:0.85rem;" onclick="VolunteerManager.completeActivity('${mission.id}')">
                  ✅ MARK COMPLETED
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  formatStatus(status) {
    switch (status) {
      case 'ACCEPTED': return '🔵 Accepted';
      case 'ON_THE_WAY': return '🟡 On the Way';
      case 'ARRIVED_SAFELY': return '🟢 Arrived Safely';
      case 'HELPING': return '🟣 Helping';
      case 'COMPLETED': return '✅ Completed';
      default: return status;
    }
  },

  async startActivity(reqId) {
    const res = await API.post(`/requests/${reqId}/start`, {});
    if (res && res.success) {
      App.showSuccessAlert('🤝 Help Activity Started', 'The activity is now in progress. Stay safe!');
      this.loadActiveMission(reqId);
    }
  },

  async completeActivity(reqId) {
    const req = this.activeMission || { request_code: 'HH1024' };
    
    App.showConfirmModal(
      'Was the help successfully provided?',
      `Confirm completion of Request ID: <strong>${req.request_code}</strong>. Points and service hours will be credited to your profile.`,
      async () => {
        const res = await API.post(`/requests/${reqId}/complete`, {});
        if (res && res.success) {
          App.showSuccessAlert(
            '✅ HELP SUCCESSFULLY COMPLETED!',
            `Request ${res.request_code} marked completed.<br>+20 Volunteer Points & +2 Service Hours credited to your profile!`
          );

          document.getElementById('active-mission-container').style.display = 'none';
          if (this.currentVolunteer) {
            this.fetchVolunteerProfile(this.currentVolunteer.id);
          }
        }
      }
    );
  }
};

window.VolunteerManager = VolunteerManager;
