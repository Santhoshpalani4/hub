/**
 * HELPHUB Social Impact Analytics Module
 * Handles metric counting animations and Chart.js visualizations
 */
const ImpactManager = {
  chartInstance: null,

  async init() {
    await this.fetchStats();
  },

  async fetchStats() {
    const data = await API.get('/impact/stats');
    if (data) {
      this.animateCounters(data);
      this.renderCategoryChart(data.category_breakdown);
    }
  },

  animateCounters(data) {
    const vols = data.total_volunteers || 300;
    const reqs = data.total_help_requests || 89;
    const people = data.people_helped || 200;

    // Synchronize Impact Analytics Page
    this.animateVal('stat-volunteers', 0, vols, 1200, '+');
    this.animateVal('stat-requests', 0, reqs, 1200, '');
    const hoursEl = document.getElementById('stat-hours');
    if (hoursEl) hoursEl.textContent = '24/7';
    this.animateVal('stat-people', 0, people, 1200, '');

    // Synchronize Home Page Hero Stats
    this.animateVal('home-stat-volunteers', 0, vols, 1200, '+');
    this.animateVal('home-stat-requests', 0, reqs, 1200, '');
    const homeHoursEl = document.getElementById('home-stat-hours');
    if (homeHoursEl) homeHoursEl.textContent = '24/7';
    this.animateVal('home-stat-people', 0, people, 1200, '');
  },

  animateVal(id, start, end, duration, suffix = '') {
    const obj = document.getElementById(id);
    if (!obj) return;
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const value = Math.floor(progress * (end - start) + start);
      obj.textContent = value.toLocaleString() + suffix;
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  },

  renderCategoryChart(breakdownData) {
    const canvas = document.getElementById('impactCategoryChart');
    if (!canvas || typeof Chart === 'undefined') return;

    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    const defaultBreakdown = {
      'Medical Support': 28,
      'Blood Donation': 22,
      'Elderly Assistance': 15,
      'Education Support': 12,
      'Food Distribution': 8,
      'Environmental Activities': 4
    };

    const categories = breakdownData || defaultBreakdown;
    const labels = Object.keys(categories);
    const data = Object.values(categories);

    this.chartInstance = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: [
            '#ef4444',
            '#dc2626',
            '#f59e0b',
            '#2563eb',
            '#10b981',
            '#8b5cf6'
          ],
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { font: { family: 'Plus Jakarta Sans', size: 12 } }
          }
        }
      }
    });
  }
};

window.ImpactManager = ImpactManager;
