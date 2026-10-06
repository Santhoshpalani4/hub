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
    this.animateVal('stat-volunteers', 0, data.total_volunteers || 1250, 1500, '+');
    this.animateVal('stat-requests', 0, data.total_help_requests || 540, 1500, '+');
    this.animateVal('stat-hours', 0, data.total_volunteer_hours || 3200, 1500, '+ hrs');
    this.animateVal('stat-people', 0, data.people_helped || 4800, 1500, '+');
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

    const labels = Object.keys(breakdownData || {
      'Medical Support': 140,
      'Blood Donation': 95,
      'Elderly Assistance': 80,
      'Education Support': 110,
      'Food Distribution': 75,
      'Environmental Activities': 40
    });

    const data = Object.values(breakdownData || {
      'Medical Support': 140,
      'Blood Donation': 95,
      'Elderly Assistance': 80,
      'Education Support': 110,
      'Food Distribution': 75,
      'Environmental Activities': 40
    });

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
