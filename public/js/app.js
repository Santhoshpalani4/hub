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
      try {
        const parsedVol = JSON.parse(savedVol);
        if (window.VolunteerManager) {
          VolunteerManager.currentVolunteer = parsedVol;
          VolunteerManager.renderProfile(parsedVol);
          if (parsedVol.id) VolunteerManager.fetchVolunteerProfile(parsedVol.id);
        }
      } catch (e) {}
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

  // Track current mode: 'login' or 'register'
  _portalMode: 'login',

  showPortalError(msg) {
    const box = document.getElementById('portal-auth-error');
    const txt = document.getElementById('portal-auth-error-msg');
    if (box && txt) {
      txt.textContent = msg;
      box.style.display = 'block';
    }
  },

  hidePortalError() {
    const box = document.getElementById('portal-auth-error');
    if (box) box.style.display = 'none';
  },

  togglePortalMode() {
    this._portalMode = (this._portalMode === 'login') ? 'register' : 'login';
    const isRegister = this._portalMode === 'register';

    const title = document.getElementById('portal-title');
    const toggleBtn = document.getElementById('portal-toggle-btn');
    const toggleHint = document.getElementById('portal-toggle-hint');
    const submitBtn = document.getElementById('portal-submit-btn');
    const nameGroup = document.getElementById('portal-name-group');
    const roleGroup = document.getElementById('portal-role-group');
    const phoneGroup = document.getElementById('portal-phone-group');
    const genderGroup = document.getElementById('portal-gender-group');

    // Clear form & error
    const form = document.getElementById('student-volunteer-login-form');
    if (form) form.reset();
    this.hidePortalError();

    if (isRegister) {
      if (title) title.textContent = '📝 Volunteer & User Registration Portal';
      if (submitBtn) submitBtn.textContent = '✨ COMPLETE REGISTRATION & ENTER';
      if (toggleHint) toggleHint.textContent = 'Already have an account?';
      if (toggleBtn) toggleBtn.textContent = 'Log In';
      if (nameGroup) nameGroup.style.display = 'block';
      if (roleGroup) roleGroup.style.display = 'block';
      if (phoneGroup) phoneGroup.style.display = 'block';
      if (genderGroup) genderGroup.style.display = 'block';
    } else {
      if (title) title.textContent = '🔐 Student / Volunteer Portal Login';
      if (submitBtn) submitBtn.innerHTML = '🚀 LOG IN &amp; ENTER PLATFORM';
      if (toggleHint) toggleHint.textContent = "Don't have an account?";
      if (toggleBtn) toggleBtn.textContent = 'Create an account / Register';
      if (nameGroup) nameGroup.style.display = 'none';
      if (roleGroup) roleGroup.style.display = 'none';
      if (phoneGroup) phoneGroup.style.display = 'none';
      if (genderGroup) genderGroup.style.display = 'none';
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

    const email = elEmail ? elEmail.value.trim() : '';
    const password = elPassword ? elPassword.value.trim() : '';

    this.hidePortalError();

    // ── LOGIN MODE ──────────────────────────────────────────────
    if (this._portalMode === 'login') {
      // Validate required fields
      if (!email) {
        this.showPortalError('Please enter your email address.');
        if (elEmail) elEmail.focus();
        return;
      }
      if (!password) {
        this.showPortalError('Please enter your password.');
        if (elPassword) elPassword.focus();
        return;
      }

      const res = await API.post('/auth/login', { email, password });

      if (res && res.success && res.volunteer) {
        this._onLoginSuccess(res);
      } else {
        // Show exact server error message inline
        const errMsg = (res && res.error)
          ? res.error
          : 'Login failed. Please check your credentials and try again.';
        this.showPortalError(errMsg);
      }
      return;
    }

    // ── REGISTER MODE ───────────────────────────────────────────
    const name = elName ? elName.value.trim() : '';
    const role = elRole ? elRole.value.trim() : 'Volunteer';
    const phone = elPhone ? elPhone.value.trim() : '';
    const elGender = document.getElementById('portal-gender');
    const gender = elGender ? elGender.value.trim() : '';

    if (!name) {
      this.showPortalError('Please enter your full name.');
      if (elName) elName.focus();
      return;
    }
    if (!phone) {
      this.showPortalError('Please enter your phone number.');
      if (elPhone) elPhone.focus();
      return;
    }
    if (!gender) {
      this.showPortalError('Please select your Gender (Male / Female).');
      if (elGender) elGender.focus();
      return;
    }
    if (!email) {
      this.showPortalError('Please enter your email address.');
      if (elEmail) elEmail.focus();
      return;
    }
    if (!password) {
      this.showPortalError('Please enter a password.');
      if (elPassword) elPassword.focus();
      return;
    }

    const res = await API.post('/auth/register', { name, role, phone, gender, email, password });

    if (res && res.success && res.volunteer) {
      this._onLoginSuccess(res);
    } else {
      const errMsg = (res && res.error)
        ? res.error
        : 'Registration failed. Please try again.';
      this.showPortalError(errMsg);
    }
  },

  _onLoginSuccess(res) {
    this.isLoggedIn = true;
    sessionStorage.setItem('helphub_current_volunteer', JSON.stringify(res.volunteer));
    if (res.user) {
      sessionStorage.setItem('helphub_current_user', JSON.stringify(res.user));
    }
    if (res.member) {
      sessionStorage.setItem('helphub_current_member', JSON.stringify(res.member));
    }

    // Update volunteer manager profile
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

    // Update topbar user name/role
    const navUserName = document.querySelector('.user-info-text .user-name');
    const navUserRole = document.querySelector('.user-info-text .user-role');
    const displayName = (res.user && res.user.name) ? res.user.name : (res.volunteer.name || '');
    const displayRole = (res.member && res.member.role) || (res.user && res.user.role) || 'Volunteer';
    if (navUserName) navUserName.textContent = displayName;
    if (navUserRole) navUserRole.textContent = displayRole === 'Student' ? 'Student' : 'Student Volunteer';

    this.showSuccessAlert(
      `Welcome, ${displayName}!`,
      `Logged in successfully as <strong>${displayRole}</strong>. Welcome to the HELPHUB Community.`
    );

    // Redirect to Home page
    this.showSection('home');
    document.querySelectorAll('.nav-link').forEach(l => {
      l.classList.remove('active');
      if (l.getAttribute('data-section') === 'home') l.classList.add('active');
    });
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
    this._portalMode = 'login';
    sessionStorage.removeItem('helphub_current_volunteer');
    sessionStorage.removeItem('helphub_current_user');
    sessionStorage.removeItem('helphub_current_member');
    const form = document.getElementById('student-volunteer-login-form');
    if (form) form.reset();
    this.hidePortalError();
    // Reset portal UI to login mode
    const title = document.getElementById('portal-title');
    const submitBtn = document.getElementById('portal-submit-btn');
    const toggleHint = document.getElementById('portal-toggle-hint');
    const toggleBtn = document.getElementById('portal-toggle-btn');
    const nameGroup = document.getElementById('portal-name-group');
    const roleGroup = document.getElementById('portal-role-group');
    const phoneGroup = document.getElementById('portal-phone-group');
    if (title) title.textContent = '🔐 Student / Volunteer Portal Login';
    if (submitBtn) submitBtn.innerHTML = '🚀 LOG IN &amp; ENTER PLATFORM';
    if (toggleHint) toggleHint.textContent = "Don't have an account?";
    if (toggleBtn) toggleBtn.textContent = 'Create an account / Register';
    if (nameGroup) nameGroup.style.display = 'none';
    if (roleGroup) roleGroup.style.display = 'none';
    if (phoneGroup) phoneGroup.style.display = 'none';
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
