/**
 * HELPHUB API Communication Module
 * Connects frontend client to Java REST Backend endpoints with role-based auth
 */
const API_BASE = window.location.origin.includes('http') ? `${window.location.origin}/api` : 'http://localhost:8081/api';

const API = {
  getAuthHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    const isAdmin = (window.AdminManager && window.AdminManager.isAuthenticated) || (sessionStorage.getItem('helphub_admin_auth') === 'true');
    if (isAdmin) {
      headers['X-Admin-Key'] = 'cse@1234';
      headers['Authorization'] = 'Bearer cse@1234';
    }
    try {
      const curUser = JSON.parse(sessionStorage.getItem('helphub_current_user') || '{}');
      const curVol = JSON.parse(sessionStorage.getItem('helphub_current_volunteer') || '{}');
      const curMember = JSON.parse(sessionStorage.getItem('helphub_current_member') || '{}');
      if (curVol.id) headers['X-User-Id'] = curVol.id;
      const email = curUser.email || (curVol && curVol.email) || curMember.email;
      if (email) headers['X-User-Email'] = email;
    } catch (e) {}
    return headers;
  },

  async get(endpoint, customHeaders = {}) {
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        headers: { ...this.getAuthHeaders(), ...customHeaders }
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
      }
      return await res.json();
    } catch (err) {
      console.warn(`[API GET ${endpoint}]`, err.message);
      return null;
    }
  },

  async post(endpoint, data = {}, customHeaders = {}) {
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { ...this.getAuthHeaders(), ...customHeaders },
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
      }
      return await res.json();
    } catch (err) {
      console.warn(`[API POST ${endpoint}]`, err.message);
      return { success: false, error: err.message };
    }
  },

  async put(endpoint, data = {}, customHeaders = {}) {
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'PUT',
        headers: { ...this.getAuthHeaders(), ...customHeaders },
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
      }
      return await res.json();
    } catch (err) {
      console.warn(`[API PUT ${endpoint}]`, err.message);
      return { success: false, error: err.message };
    }
  },

  async delete(endpoint, customHeaders = {}) {
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'DELETE',
        headers: { ...this.getAuthHeaders(), ...customHeaders }
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
      }
      return await res.json();
    } catch (err) {
      console.warn(`[API DELETE ${endpoint}]`, err.message);
      return { success: false, error: err.message };
    }
  }
};

window.API = API;
