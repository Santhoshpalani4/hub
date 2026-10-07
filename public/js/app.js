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

    // Check existing login session
    const savedVol = sessionStorage.getItem('helphub_current_volunteer');
    if (savedVol) {
      this.isLoggedIn = true;
      const navLinks = document.querySelector('.nav-links');
      const navRight = document.querySelector('.nav-right');
      if (navLinks) navLinks.style.display = 'flex';
      if (navRight) navRight.style.display = 'flex';
      this.showSection('home');
    } else {
      // Default Section Routing to Login Portal First
      this.showSection('login-portal');
    }
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
    const elName = document.getElementById('portal-name');
    const elRole = document.getElementById('portal-role');
    const elPhone = document.getElementById('portal-phone');
    const elEmail = document.getElementById('portal-email');
    const elPassword = document.getElementById('portal-password');

    const name = elName ? elName.value.trim() : '';
    const role = elRole ? elRole.value.trim() : 'Volunteer';
    const phone = elPhone ? elPhone.value.trim() : '';
    const email = elEmail ? elEmail.value.trim() : '';
    const password = elPassword ? elPassword.value.trim() : '';

    if (!name || !phone || !email || !password) {
      alert('Please fill out all required login fields.');
      return;
    }

    const res = await API.post('/auth/login', {
      name,
      role,
      phone,
      email,
      password
    });

    if (res && res.success && res.volunteer) {
      this.isLoggedIn = true;
      sessionStorage.setItem('helphub_current_volunteer', JSON.stringify(res.volunteer));
      if (res.user) {
        sessionStorage.setItem('helphub_current_user', JSON.stringify(res.user));
      }

      if (window.VolunteerManager) {
        VolunteerManager.currentVolunteer = res.volunteer;
        VolunteerManager.currentUser = res.user;
        VolunteerManager.renderProfile(res.volunteer);
      }

      // Show main navbar links & user profile
      const navLinks = document.querySelector('.nav-links');
      const navRight = document.querySelector('.nav-right');
      if (navLinks) navLinks.style.display = 'flex';
      if (navRight) navRight.style.display = 'flex';

      // Update topbar user name
      const navUserName = document.querySelector('.user-info-text .user-name');
      const navUserRole = document.querySelector('.user-info-text .user-role');
      if (navUserName) navUserName.textContent = res.user ? res.user.name : name;
      if (navUserRole) navUserRole.textContent = role === 'Student' ? 'Student' : 'Student Volunteer';

      this.showSuccessAlert(
        `Welcome, ${res.user ? res.user.name : name}!`,
        `Logged in successfully as <strong>${role}</strong>. Welcome to the HELPHUB Community.`
      );

      if (res.member) {
        sessionStorage.setItem('helphub_current_member', JSON.stringify(res.member));
      }

      // Redirect directly to Home page as specified
      this.showSection('home');

      // Update active nav link to Home
      document.querySelectorAll('.nav-link').forEach(l => {
        l.classList.remove('active');
        if (l.getAttribute('data-section') === 'home') {
          l.classList.add('active');
        }
      });
    } else {
      alert(res && res.error ? res.error : 'Login failed. Please check your credentials.');
    }
  },

  async logout() {
    let email = '';
    let id = '';
    try {
      const curUser = JSON.parse(sessionStorage.getItem('helphub_current_user') || '{}');
      const curMember = JSON.parse(sessionStorage.getItem('helphub_current_member') || '{}');
      email = curMember.email || curUser.email || '';
      id = curMember.id || curUser.id || '';
    } catch (e) {}

    // Notify backend to update status to Offline
    if (email || id) {
      try {
        await API.post('/auth/logout', { email, id });
      } catch (e) {}
    }

    this.isLoggedIn = false;
    sessionStorage.removeItem('helphub_current_volunteer');
    sessionStorage.removeItem('helphub_current_user');
    sessionStorage.removeItem('helphub_current_member');
    const form = document.getElementById('student-volunteer-login-form');
    if (form) form.reset();
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
