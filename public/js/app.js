/**
 * HELPHUB Main Application Logic & Router (app.js)
 * Manages single-page navigation, modal handling, and state initialization
 */
const App = {
  isLoggedIn: false,
  isSignUpMode: false,

  init() {
    console.log('🚀 Initializing HELPHUB Web Application...');
    this.bindNavigation();

    // Initialize Sub-Modules
    if (window.NotificationEngine) NotificationEngine.init();
    if (window.RequestManager) RequestManager.init();
    if (window.VolunteerManager) VolunteerManager.fetchVolunteerProfile();
    if (window.MapManager) MapManager.init();
    if (window.ImpactManager) ImpactManager.init();
    if (window.CollegeManager) CollegeManager.init();
    if (window.AdminManager) AdminManager.init();
    if (window.CertificateManager) CertificateManager.init();

    // Default Section Routing to Login Portal First
    this.showSection('login-portal');
  },

  bindNavigation() {
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = link.getAttribute('data-section');

        if (target === 'admin') {
          AdminManager.handleAdminNavClick();
          return;
        }

        this.showSection(target);

        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      });
    });
  },

  togglePortalMode() {
    this.isSignUpMode = !this.isSignUpMode;
    const title = document.getElementById('portal-title');
    const btn = document.getElementById('portal-toggle-btn');
    const submitBtn = document.getElementById('portal-submit-btn');
    const nameGroup = document.getElementById('portal-name-group');
    const phoneGroup = document.getElementById('portal-phone-group');
    const deptGroup = document.getElementById('portal-dept-group');
    const referralGroup = document.getElementById('portal-referral-group');

    if (this.isSignUpMode) {
      if (title) title.textContent = '📝 Volunteer & User Registration Portal';
      if (btn) btn.textContent = 'Already have an account? Log In';
      if (submitBtn) submitBtn.textContent = '✨ COMPLETE REGISTRATION & ENTER';
      if (nameGroup) nameGroup.style.display = 'block';
      if (phoneGroup) phoneGroup.style.display = 'block';
      if (deptGroup) deptGroup.style.display = 'block';
      if (referralGroup) referralGroup.style.display = 'block';
    } else {
      if (title) title.textContent = '🔐 Volunteer & User Login Portal';
      if (btn) btn.textContent = 'Need an account? Sign Up';
      if (submitBtn) submitBtn.textContent = '🚀 LOG IN & ENTER PLATFORM';
      if (nameGroup) nameGroup.style.display = 'none';
      if (phoneGroup) phoneGroup.style.display = 'none';
      if (deptGroup) deptGroup.style.display = 'none';
      if (referralGroup) referralGroup.style.display = 'none';
    }
  },

  applyPortalReferral() {
    const input = document.getElementById('portal-referral');
    const badge = document.getElementById('portal-ref-badge');
    if (input && input.value.trim().length > 0) {
      if (badge) badge.style.display = 'inline';
      this.showSuccessAlert(
        '🎉 Referral Code Verified!',
        `Code <strong>${input.value.trim().toUpperCase()}</strong> applied! <strong>+50 Bonus Impact Points</strong> will be credited upon registration/login.`
      );
    }
  },

  async performPortalLogin() {
    this.isLoggedIn = true;
    const email = document.getElementById('portal-email')?.value.trim() || 'mohan@campus.edu';
    const role = document.getElementById('portal-role')?.value || 'VOLUNTEER';
    let name = document.getElementById('portal-name')?.value.trim();
    let phone = document.getElementById('portal-phone')?.value.trim();
    let dept = document.getElementById('portal-dept')?.value.trim();

    if (!this.isSignUpMode || !name) {
      if (email.toLowerCase().includes('mohan')) {
        name = 'Mohan Das'; phone = '+91 9876543210'; dept = 'Computer Science & Engineering';
      } else if (email.toLowerCase().includes('raj')) {
        name = 'Raj Kumar'; phone = '+91 9876543211'; dept = 'Electronics & Communication';
      } else if (email.toLowerCase().includes('santhosh')) {
        name = 'Santhosh V'; phone = '+91 9876543212'; dept = 'Electrical Engineering';
      } else if (email.toLowerCase().includes('arun')) {
        name = 'Arun Prakash'; phone = '+91 9876543213'; dept = 'Mechanical Engineering';
      } else if (email.toLowerCase().includes('priya')) {
        name = 'Priya Sharma'; phone = '+91 9876543214'; dept = 'Sunshine NGO';
      } else {
        const prefix = email.split('@')[0].replace(/[._-]/g, ' ');
        name = prefix.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'Volunteer User';
        phone = phone || '+91 9876543210';
        dept = dept || 'University Campus';
      }
    }

    if (window.VolunteerManager) {
      VolunteerManager.currentVolunteer.name = name;
      VolunteerManager.currentVolunteer.email = email;
      VolunteerManager.currentVolunteer.phone = phone;
      VolunteerManager.currentVolunteer.department = dept;
      VolunteerManager.currentVolunteer.role = role;
      
      // If newly registered, generate a unique student volunteer ID
      if (this.isSignUpMode && !VolunteerManager.currentVolunteer.student_id) {
        VolunteerManager.currentVolunteer.student_id = 'STU2026VOL' + Math.floor(100 + Math.random() * 900);
      }

      // Sync updated registration data to backend
      try {
        await API.post(`/volunteers/${VolunteerManager.currentVolunteer.id}`, {
          name: name,
          email: email,
          phone: phone,
          department: dept
        });
      } catch (err) {
        console.warn('Backend sync note:', err);
      }

      VolunteerManager.renderProfile(VolunteerManager.currentVolunteer);
    }

    // Show main navbar links & user profile
    const navLinks = document.querySelector('.nav-links');
    const navRight = document.querySelector('.nav-right');
    if (navLinks) navLinks.style.display = 'flex';
    if (navRight) navRight.style.display = 'flex';

    // Update topbar user name
    const navUserName = document.querySelector('.user-info-text .user-name');
    const navUserRole = document.querySelector('.user-info-text .user-role');
    if (navUserName) navUserName.textContent = name;
    if (navUserRole) navUserRole.textContent = role === 'VOLUNTEER' ? 'Student Volunteer' : role;

    this.showSuccessAlert(
      `Welcome to HELPHUB, ${name}!`,
      `Authentication successful. You are logged in as <strong>${role}</strong>. Your profile has been automatically loaded.`
    );

    // Enter inside platform to Home page
    this.showSection('home');
  },

  logout() {
    this.isLoggedIn = false;
    this.showSuccessAlert('Logged Out', 'You have been safely logged out of HELPHUB.');
    this.showSection('login-portal');
  },

  showSection(sectionId) {
    document.querySelectorAll('.app-section').forEach(sec => {
      sec.style.display = 'none';
    });

    const targetSec = document.getElementById(`section-${sectionId}`);
    if (targetSec) {
      targetSec.style.display = 'block';
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Control Navbar visibility depending on whether user is on Login Portal
      const navLinks = document.querySelector('.nav-links');
      const navRight = document.querySelector('.nav-right');

      if (sectionId === 'login-portal' && !this.isLoggedIn) {
        if (navLinks) navLinks.style.display = 'none';
        if (navRight) navRight.style.display = 'none';
      } else {
        if (navLinks) navLinks.style.display = 'flex';
        if (navRight) navRight.style.display = 'flex';
      }

      if (sectionId === 'profile' && window.VolunteerManager) {
        VolunteerManager.fetchVolunteerProfile();
      } else if (sectionId === 'impact' && window.ImpactManager) {
        ImpactManager.fetchStats();
      } else if (sectionId === 'map' && window.MapManager) {
        setTimeout(() => MapManager.init(), 100);
      } else if (sectionId === 'admin' && window.AdminManager) {
        AdminManager.fetchMetrics();
      }
    }
  },

  openModal(modalId) {
    const overlay = document.getElementById(modalId);
    if (overlay) {
      overlay.classList.add('active');
    }
  },

  closeModal(modalId) {
    const overlay = document.getElementById(modalId);
    if (overlay) {
      overlay.classList.remove('active');
    }
  },

  showSuccessAlert(title, messageHtml) {
    const html = `
      <div style="text-align:center; padding:1.5rem;">
        <div style="width:70px; height:70px; background:#ecfdf5; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 1.25rem auto; font-size:2.2rem; border:3px solid #10b981;">
          ✅
        </div>
        <h2 style="font-size:1.5rem; color:#0f172a; margin-bottom:0.5rem;">${title}</h2>
        <div style="font-size:0.95rem; color:#475569; margin-bottom:1.5rem;">${messageHtml}</div>
        <button class="btn btn-primary" style="width:100%;" onclick="App.closeModal('custom-alert-modal')">
          OK, GOT IT
        </button>
      </div>
    `;
    this.showCustomModal('custom-alert-modal', html);
  },

  showConfirmModal(title, messageHtml, onConfirmCallback) {
    const html = `
      <div style="text-align:center; padding:1.5rem;">
        <div style="width:70px; height:70px; background:#eff6ff; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 1.25rem auto; font-size:2.2rem; border:3px solid #2563eb;">
          ❓
        </div>
        <h2 style="font-size:1.5rem; color:#0f172a; margin-bottom:0.5rem;">${title}</h2>
        <div style="font-size:0.95rem; color:#475569; margin-bottom:1.5rem;">${messageHtml}</div>
        <div style="display:flex; gap:1rem;">
          <button class="btn btn-outline" style="flex:1;" onclick="App.closeModal('custom-alert-modal')">NO, CANCEL</button>
          <button class="btn btn-primary" style="flex:1;" id="confirm-dialog-yes-btn">YES, CONFIRM</button>
        </div>
      </div>
    `;
    this.showCustomModal('custom-alert-modal', html);

    const yesBtn = document.getElementById('confirm-dialog-yes-btn');
    if (yesBtn) {
      yesBtn.onclick = () => {
        App.closeModal('custom-alert-modal');
        if (onConfirmCallback) onConfirmCallback();
      };
    }
  },

  showCustomModal(modalId, bodyHtml) {
    const overlay = document.getElementById(modalId);
    const contentBox = document.getElementById(`${modalId}-body`);
    if (overlay && contentBox) {
      contentBox.innerHTML = bodyHtml;
      overlay.classList.add('active');
    }
  },

  triggerEmergencyModal() {
    this.openModal('emergency-modal');
  },

  async handleEmergencySubmit(form) {
    const formData = new FormData(form);
    const data = {};
    formData.forEach((val, key) => data[key] = val);

    const res = await API.post('/emergency', data);
    if (res && res.success) {
      this.closeModal('emergency-modal');
      form.reset();
      this.showSuccessAlert(
        '🚨 EMERGENCY ALERT BROADCASTED',
        `High priority alert <strong>${res.request_id}</strong> dispatched to all nearby volunteers!<br><br><small style="color:#ef4444; font-weight:700;">⚠️ Reminder: For life-threatening medical/fire emergencies, please also call professional emergency services 112 / 108 immediately.</small>`
      );
      RequestManager.fetchRequests();
      NotificationEngine.fetchNotifications();
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

window.App = App;
