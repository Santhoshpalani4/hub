/**
 * HELPHUB Notification System
 * Handles real-time alerts, audio chime, and notification drawer
 */
const NotificationEngine = {
  notifications: [],

  init() {
    this.fetchNotifications();
    this.bindEvents();
  },

  async fetchNotifications() {
    const data = await API.get('/notifications');
    if (data && Array.isArray(data)) {
      this.notifications = data;
      this.render();
    }
  },

  bindEvents() {
    const btn = document.getElementById('notif-btn');
    const drawer = document.getElementById('notif-drawer');
    if (btn && drawer) {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        drawer.classList.toggle('active');
        this.markAllRead();
      });

      document.addEventListener('click', (e) => {
        if (!drawer.contains(e.target) && e.target !== btn) {
          drawer.classList.remove('active');
        }
      });
    }
  },

  async markAllRead() {
    const badge = document.getElementById('notif-count-badge');
    if (badge) badge.style.display = 'none';
    await API.post('/notifications', {});
  },

  add(notif) {
    this.notifications.unshift(notif);
    this.render();
    this.showToast(notif);
    this.playChime();
  },

  showToast(notif) {
    const toast = document.createElement('div');
    toast.className = 'safety-toast-popup';
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: #0f172a;
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 14px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      z-index: 999;
      border-left: 5px solid ${notif.type === 'ARRIVED_SAFELY' ? '#10b981' : (notif.type === 'EMERGENCY' ? '#ef4444' : '#2563eb')};
      max-width: 360px;
      animation: slideInRight 0.4s ease;
    `;

    toast.innerHTML = `
      <div style="font-weight:800; font-size:0.95rem; margin-bottom:0.25rem;">${notif.title}</div>
      <div style="font-size:0.85rem; color:#cbd5e1;">${notif.message}</div>
    `;

    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.4s ease';
      setTimeout(() => toast.remove(), 400);
    }, 4500);
  },

  playChime() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5 note
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch (e) {
      // Audio context might be restricted before user interaction
    }
  },

  render() {
    const listContainer = document.getElementById('notif-list-container');
    const badge = document.getElementById('notif-count-badge');
    
    const unread = this.notifications.filter(n => !n.is_read).length;
    if (badge) {
      badge.textContent = unread;
      badge.style.display = unread > 0 ? 'flex' : 'none';
    }

    if (!listContainer) return;
    if (this.notifications.length === 0) {
      listContainer.innerHTML = '<div style="padding:1.5rem; text-align:center; color:#94a3b8;">No notifications yet</div>';
      return;
    }

    listContainer.innerHTML = this.notifications.map(n => `
      <div class="notif-item ${!n.is_read ? 'unread' : ''}">
        <div class="notif-title">${n.title}</div>
        <div class="notif-desc">${n.message}</div>
        <div style="font-size:0.7rem; color:#94a3b8; margin-top:0.25rem;">${n.created_at || 'Just now'}</div>
      </div>
    `).join('');
  }
};

window.NotificationEngine = NotificationEngine;
