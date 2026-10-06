/**
 * HELPHUB API Communication Module
 * Connects frontend client to Java REST Backend endpoints
 */
const API_BASE = window.location.origin.includes('http') ? `${window.location.origin}/api` : 'http://localhost:8080/api';

const API = {
  async get(endpoint) {
    try {
      const res = await fetch(`${API_BASE}${endpoint}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn(`[API GET ${endpoint}] Server error or offline. Using local state.`, err);
      return null;
    }
  },

  async post(endpoint, data) {
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn(`[API POST ${endpoint}] Server error or offline. Falling back.`, err);
      return null;
    }
  }
};

window.API = API;
