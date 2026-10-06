/**
 * HELPHUB Volunteer Dashboard, Profile Management & Team Assembly Module
 * Manages Volunteer acceptance, automatic team formation, and authenticated profile editing
 */
const VolunteerManager = {
  currentVolunteer: {
    id: 'v1',
    user_id: 'u1',
    name: 'Mohan Das',
    email: 'mohan@campus.edu',
    phone: '+91 9876543210',
    student_id: 'STU2023CSE042',
    role: 'VOLUNTEER',
    college_name: 'City Tech University',
    department: 'Computer Science & Engineering',
    total_requests: 15,
    points: 850,
    total_hours: 42.0,
    activities_completed: 12,
    people_helped: 18,
    drives_joined: 4,
    safety_rating: 5.0,
    skills: 'First Aid, CPR Certified, Emergency Management, Tutoring',
    availability: 'Weekends, Evenings & On-Call Emergencies',
    address: 'Room 402, Campus Block B Hostel',
    bio: 'Dedicated student volunteer committed to community health drives, senior citizen support, and campus social activities.',
    emergency_contact: '+91 9876543299',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
  },

  activeMission: null,

  async init() {
    await this.fetchVolunteerProfile();
  },

  async joinHelpRequest(reqId) {
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
      RequestManager.fetchRequests();
      this.fetchVolunteerProfile();
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
      { volunteer_name: 'Mohan Das', status: 'ARRIVED_SAFELY' },
      { volunteer_name: 'Raj Kumar', status: 'ON_THE_WAY' },
      { volunteer_name: 'Santhosh V', status: 'ACCEPTED' }
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
          this.fetchVolunteerProfile();
        }
      }
    );
  },

  async fetchVolunteerProfile() {
    const data = await API.get(`/volunteers/${this.currentVolunteer.id}`);
    if (data) {
      // Merge with user details
      if (data.user) {
        this.currentVolunteer.name = data.user.name || this.currentVolunteer.name;
        this.currentVolunteer.email = data.user.email || this.currentVolunteer.email;
        this.currentVolunteer.phone = data.user.phone || this.currentVolunteer.phone;
        this.currentVolunteer.college_name = data.user.college_name || this.currentVolunteer.college_name;
        this.currentVolunteer.role = data.user.role || this.currentVolunteer.role;
      }
      this.currentVolunteer.department = data.department || this.currentVolunteer.department;
      this.currentVolunteer.student_id = data.student_id || this.currentVolunteer.student_id;
      this.currentVolunteer.points = data.points !== undefined ? data.points : this.currentVolunteer.points;
      this.currentVolunteer.total_hours = data.total_hours !== undefined ? data.total_hours : this.currentVolunteer.total_hours;
      this.currentVolunteer.activities_completed = data.activities_completed !== undefined ? data.activities_completed : this.currentVolunteer.activities_completed;
      this.currentVolunteer.people_helped = data.people_helped !== undefined ? data.people_helped : this.currentVolunteer.people_helped;
      this.currentVolunteer.skills = data.skills || this.currentVolunteer.skills;
      this.currentVolunteer.availability = data.availability || this.currentVolunteer.availability;
      this.currentVolunteer.address = data.address || this.currentVolunteer.address;
      this.currentVolunteer.bio = data.bio || this.currentVolunteer.bio;
      this.currentVolunteer.emergency_contact = data.emergency_contact || this.currentVolunteer.emergency_contact;
      this.currentVolunteer.drives_joined = data.drives_joined || this.currentVolunteer.drives_joined;

      this.renderProfile(this.currentVolunteer);
    }
  },

  renderProfile(vol) {
    // Basic Info
    const elName = document.getElementById('profile-name-text');
    const elCollege = document.getElementById('profile-college-text');
    const elEmail = document.getElementById('profile-email-val');
    const elPhone = document.getElementById('profile-phone-val');
    const elId = document.getElementById('profile-id-val');
    const elRole = document.getElementById('profile-role-val');
    const elDept = document.getElementById('profile-dept-val');

    if (elName) elName.textContent = vol.name;
    if (elCollege) elCollege.textContent = `${vol.role === 'VOLUNTEER' ? 'Student Volunteer' : vol.role} • ${vol.college_name}`;
    if (elEmail) elEmail.textContent = vol.email;
    if (elPhone) elPhone.textContent = vol.phone || '+91 9876543210';
    if (elId) elId.textContent = vol.student_id || 'STU2023CSE042';
    if (elRole) elRole.textContent = vol.role;
    if (elDept) elDept.textContent = vol.department || 'Computer Science & Engineering';

    // System-Generated Statistics (Non-editable)
    const elRequests = document.getElementById('profile-requests-val');
    const elPoints = document.getElementById('profile-points-val');
    const elHours = document.getElementById('profile-hours-val');
    const elActs = document.getElementById('profile-acts-val');
    const elPeople = document.getElementById('profile-people-val');
    const elDrives = document.getElementById('profile-drives-val');
    const elRating = document.getElementById('profile-rating-val');

    if (elRequests) elRequests.textContent = vol.total_requests || (vol.activities_completed ? vol.activities_completed + 3 : 15);
    if (elPoints) elPoints.textContent = vol.points;
    if (elHours) elHours.textContent = (vol.total_hours) + ' hrs';
    if (elActs) elActs.textContent = vol.activities_completed;
    if (elPeople) elPeople.textContent = vol.people_helped;
    if (elDrives) elDrives.textContent = vol.drives_joined || 4;
    if (elRating) elRating.textContent = `${vol.safety_rating || 5.0} / 5.0`;

    // Additional Editable Info
    const elSkills = document.getElementById('profile-skills-val');
    const elAvail = document.getElementById('profile-avail-val');
    const elAddress = document.getElementById('profile-address-val');
    const elBio = document.getElementById('profile-bio-val');
    const elEmerg = document.getElementById('profile-emerg-val');

    if (elSkills) elSkills.textContent = vol.skills || 'First Aid, CPR Certified, Emergency Management, Tutoring';
    if (elAvail) elAvail.textContent = vol.availability || 'Weekends, Evenings & On-Call Emergencies';
    if (elAddress) elAddress.textContent = vol.address || 'Room 402, Campus Block B Hostel';
    if (elBio) elBio.textContent = vol.bio || 'Dedicated student volunteer committed to community health drives and social service.';
    if (elEmerg) elEmerg.textContent = vol.emergency_contact || '+91 9876543299';

    // Update Topbar Badge
    const navUser = document.querySelector('.user-info-text .user-name');
    if (navUser) navUser.textContent = vol.name;
  },

  openEditProfileModal() {
    const vol = this.currentVolunteer;
    const modalHtml = `
      <div style="padding:1rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.25rem; border-bottom:1px solid #e2e8f0; padding-bottom:0.75rem;">
          <h2 style="font-size:1.5rem; color:#0f172a; margin:0;">✏️ Edit Volunteer Profile</h2>
        </div>

        <p style="color:#64748b; font-size:0.85rem; margin-bottom:1.25rem;">
          Update your skills, availability, address, and contact details. System statistics (hours, points, activities) are auto-calculated and cannot be modified manually.
        </p>

        <form onsubmit="event.preventDefault(); VolunteerManager.saveProfileChanges(this);">
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1rem;">
            <div class="form-group">
              <label>Full Name</label>
              <input type="text" name="name" class="form-control" value="${vol.name}" required>
            </div>
            <div class="form-group">
              <label>Phone Number</label>
              <input type="tel" name="phone" class="form-control" value="${vol.phone || '+91 9876543210'}" required>
            </div>
          </div>

          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1rem;">
            <div class="form-group">
              <label>Department / Major</label>
              <input type="text" name="department" class="form-control" value="${vol.department || 'Computer Science & Engineering'}">
            </div>
            <div class="form-group">
              <label>Emergency Contact Phone</label>
              <input type="tel" name="emergency_contact" class="form-control" value="${vol.emergency_contact || '+91 9876543299'}">
            </div>
          </div>

          <div class="form-group">
            <label>Skills & Certifications</label>
            <input type="text" name="skills" class="form-control" value="${vol.skills || 'First Aid, CPR Certified, Emergency Management, Tutoring'}" placeholder="e.g. First Aid, Teaching, Crowd Management, Driving">
          </div>

          <div class="form-group">
            <label>Availability Schedule</label>
            <input type="text" name="availability" class="form-control" value="${vol.availability || 'Weekends, Evenings & On-Call Emergencies'}" placeholder="e.g. Weekends, Evenings, On-Call Emergencies">
          </div>

          <div class="form-group">
            <label>Residential Address / Base Area</label>
            <input type="text" name="address" class="form-control" value="${vol.address || 'Room 402, Campus Block B Hostel'}" placeholder="e.g. Campus Block B Hostel, University North Area">
          </div>

          <div class="form-group">
            <label>Volunteer Bio / Statement</label>
            <textarea name="bio" class="form-control" rows="3" placeholder="A brief statement about your volunteering interests...">${vol.bio || ''}</textarea>
          </div>

          <div style="display:flex; gap:1rem; margin-top:1.5rem;">
            <button type="button" class="btn btn-outline" style="flex:1;" onclick="App.closeModal('custom-alert-modal')">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" style="flex:1.5;">
              💾 Save Changes
            </button>
          </div>
        </form>
      </div>
    `;

    App.showCustomModal('custom-alert-modal', modalHtml);
  },

  async saveProfileChanges(form) {
    const formData = new FormData(form);
    const data = {};
    formData.forEach((val, key) => data[key] = val);

    const res = await API.post(`/volunteers/${this.currentVolunteer.id}`, data);
    if (res) {
      App.closeModal('custom-alert-modal');
      
      // Update local state
      Object.assign(this.currentVolunteer, data);
      this.renderProfile(this.currentVolunteer);

      App.showSuccessAlert(
        'Profile Updated Successfully',
        'Your profile changes have been saved to the database and are now live.'
      );
    }
  }
};

window.VolunteerManager = VolunteerManager;
