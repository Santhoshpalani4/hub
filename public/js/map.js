/**
 * HELPHUB Location & Public Health Map Module
 * Displays real Government Hospitals, Government Blood Centres/Banks, and verified donation camps.
 * All mock/random data removed. Ready for live API integration.
 */
const MapManager = {
  map: null,
  markers: [],
  activeFilter: 'ALL',
  searchQuery: '',

  // Real, verified public-health facilities
  facilities: [
    {
      id: 'gh_gummidipoondi',
      name: 'Government General Hospital, Gummidipoondi',
      type: 'HOSPITAL',
      typeLabel: 'Government Hospital',
      address: 'Bazaar Street, Gummidipoondi, Thiruvallur District, Tamil Nadu - 601201',
      latitude: 13.4072,
      longitude: 80.1287,
      contact: '044-27922240',
      emergencyHelpline: '108',
      operatingHours: '24x7 Emergency Services'
    },
    {
      id: 'gh_ponneri',
      name: 'Government General Hospital, Ponneri',
      type: 'HOSPITAL',
      typeLabel: 'Government Hospital',
      address: 'Taluk Hospital Road, Ponneri, Thiruvallur District, Tamil Nadu - 601204',
      latitude: 13.3328,
      longitude: 80.1989,
      contact: '044-27972233',
      emergencyHelpline: '108',
      operatingHours: '24x7 Emergency & Trauma Care'
    },
    {
      id: 'gh_thiruvallur',
      name: 'Government Headquarters Hospital, Thiruvallur',
      type: 'HOSPITAL',
      typeLabel: 'Government Hospital',
      address: 'JN Road, Raja Shanmugam Nagar, Thiruvallur, Tamil Nadu - 602001',
      latitude: 13.1436,
      longitude: 79.9082,
      contact: '044-27660300',
      emergencyHelpline: '108',
      operatingHours: '24x7 District Headquarters Facility'
    },
    {
      id: 'gh_rgggh_chennai',
      name: 'Rajiv Gandhi Government General Hospital (RGGGH)',
      type: 'HOSPITAL',
      typeLabel: 'Government Hospital',
      address: 'EVR Periyar Salai, Park Town, Chennai, Tamil Nadu - 600003',
      latitude: 13.0827,
      longitude: 80.2778,
      contact: '044-25305000',
      emergencyHelpline: '108 / 104',
      operatingHours: '24x7 Multi-Specialty Government Hospital'
    },
    {
      id: 'gh_stanley_chennai',
      name: 'Government Stanley Medical College Hospital',
      type: 'HOSPITAL',
      typeLabel: 'Government Hospital',
      address: 'Old Jail Road, Royapuram, Chennai, Tamil Nadu - 600001',
      latitude: 13.1075,
      longitude: 80.2872,
      contact: '044-25281351',
      emergencyHelpline: '108 / 104',
      operatingHours: '24x7 Government Tertiary Care Facility'
    },
    {
      id: 'bc_ponneri',
      name: 'Government Blood Centre, GGH Ponneri',
      type: 'BLOOD_CENTRE',
      typeLabel: 'Blood Centre',
      address: 'Taluk Hospital Campus, Ponneri, Thiruvallur District, Tamil Nadu - 601204',
      latitude: 13.3330,
      longitude: 80.1992,
      contact: '044-27972233',
      emergencyHelpline: '104 (Blood Availability Helpline)',
      operatingHours: '24x7 Blood Banking Services'
    },
    {
      id: 'bc_thiruvallur',
      name: 'District Blood Bank, Government Headquarters Hospital',
      type: 'BLOOD_CENTRE',
      typeLabel: 'Blood Centre',
      address: 'Government Headquarters Hospital, Thiruvallur, Tamil Nadu - 602001',
      latitude: 13.1438,
      longitude: 79.9085,
      contact: '044-27660300',
      emergencyHelpline: '104 (Blood Helpline)',
      operatingHours: '24x7 Official e-RaktKosh Verified Blood Centre'
    },
    {
      id: 'bc_stanley',
      name: 'Government Stanley Hospital Blood Centre',
      type: 'BLOOD_CENTRE',
      typeLabel: 'Blood Centre',
      address: 'Old Jail Road, Royapuram, Chennai, Tamil Nadu - 600001',
      latitude: 13.1078,
      longitude: 80.2875,
      contact: '044-25281351 / 104',
      emergencyHelpline: '104 (National Blood Helpline)',
      operatingHours: '24x7 Government Blood Component Separation Unit'
    },
    {
      id: 'bc_rgggh',
      name: 'RGGGH Blood Bank (Madras Medical College)',
      type: 'BLOOD_CENTRE',
      typeLabel: 'Blood Centre',
      address: 'Madras Medical College Campus, EVR Periyar Salai, Park Town, Chennai - 600003',
      latitude: 13.0825,
      longitude: 80.2780,
      contact: '044-25305139',
      emergencyHelpline: '104',
      operatingHours: '24x7 State Model Blood Bank'
    }
  ],

  // Verified Upcoming Blood Donation Camps (Empty when no verified upcoming camps)
  upcomingCamps: [],

  init() {
    const mapContainer = document.getElementById('leaflet-map');
    if (!mapContainer || typeof L === 'undefined') return;

    if (!this.map) {
      // Center on the regional corridor (Gummidipoondi / Thiruvallur / North Chennai)
      this.map = L.map('leaflet-map').setView([13.2500, 80.1500], 10);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors | HELPHUB Public Health Directory'
      }).addTo(this.map);
    } else {
      setTimeout(() => this.map.invalidateSize(), 150);
    }

    this.renderMarkersAndList();
  },

  setFilter(filterType, element) {
    this.activeFilter = filterType;
    if (element) {
      document.querySelectorAll('#map-filter-tabs .tab-btn').forEach(btn => btn.classList.remove('active'));
      element.classList.add('active');
    }
    this.renderMarkersAndList();
  },

  setSearch(query) {
    this.searchQuery = (query || '').toLowerCase().trim();
    this.renderMarkersAndList();
  },

  getFilteredFacilities() {
    return this.facilities.filter(item => {
      const matchesFilter = this.activeFilter === 'ALL' || item.type === this.activeFilter;
      const matchesSearch = !this.searchQuery || 
        item.name.toLowerCase().includes(this.searchQuery) ||
        item.address.toLowerCase().includes(this.searchQuery) ||
        item.typeLabel.toLowerCase().includes(this.searchQuery);
      return matchesFilter && matchesSearch;
    });
  },

  renderMarkersAndList() {
    if (!this.map) return;

    // Clear existing markers
    this.markers.forEach(m => this.map.removeLayer(m));
    this.markers = [];

    const filtered = this.getFilteredFacilities();
    const bounds = [];

    filtered.forEach(item => {
      const isHospital = item.type === 'HOSPITAL';
      const isBloodCentre = item.type === 'BLOOD_CENTRE';

      // Custom marker icon based on facility type
      const iconHtml = isHospital
        ? `<div style="background:#dc2626; color:white; width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:16px; border:2px solid white; box-shadow:0 3px 8px rgba(220,38,38,0.5);">🏥</div>`
        : isBloodCentre
        ? `<div style="background:#991b1b; color:white; width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:16px; border:2px solid white; box-shadow:0 3px 8px rgba(153,27,27,0.5);">🩸</div>`
        : `<div style="background:#059669; color:white; width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:16px; border:2px solid white; box-shadow:0 3px 8px rgba(5,150,105,0.5);">⛺</div>`;

      const customIcon = L.divIcon({
        className: 'health-map-icon',
        html: iconHtml,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
        popupAnchor: [0, -18]
      });

      const marker = L.marker([item.latitude, item.longitude], { icon: customIcon }).addTo(this.map);

      const popupHtml = `
        <div style="font-family:inherit; min-width:220px; padding:4px;">
          <span style="display:inline-block; font-size:0.7rem; font-weight:800; padding:2px 8px; border-radius:99px; background:${isHospital ? '#fee2e2; color:#b91c1c;' : '#fef2f2; color:#991b1b;'} margin-bottom:4px;">
            ${item.typeLabel}
          </span>
          <h4 style="font-size:0.95rem; margin:4px 0 6px 0; color:#0f172a; font-weight:700;">${item.name}</h4>
          <p style="font-size:0.8rem; color:#475569; margin-bottom:6px; line-height:1.4;">📍 ${item.address}</p>
          <div style="font-size:0.8rem; font-weight:600; color:#1e293b; margin-bottom:4px;">📞 Official Contact: <strong>${item.contact}</strong></div>
          <div style="font-size:0.75rem; color:#dc2626; font-weight:700;">🚨 Helpline: ${item.emergencyHelpline}</div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      this.markers.push(marker);
      bounds.push([item.latitude, item.longitude]);
    });

    // Fit map to visible markers if any exist
    if (bounds.length > 0 && this.map) {
      this.map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }

    // Render list sidebar in UI
    this.renderDirectoryCards(filtered);
    this.renderCampsSection();
  },

  renderDirectoryCards(items) {
    const container = document.getElementById('facilities-list-container');
    if (!container) return;

    if (items.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding:2.5rem 1rem; color:#64748b; background:#f8fafc; border-radius:12px; border:1px dashed #cbd5e1;">
          <div style="font-size:2rem; margin-bottom:0.5rem;">🔍</div>
          <div style="font-weight:700; color:#0f172a; margin-bottom:0.25rem;">No Facilities Found</div>
          <div style="font-size:0.85rem;">Try adjusting your filter or search query.</div>
        </div>
      `;
      return;
    }

    container.innerHTML = items.map(item => {
      const isHospital = item.type === 'HOSPITAL';
      const badgeBg = isHospital ? '#eff6ff' : '#fef2f2';
      const badgeColor = isHospital ? '#1d4ed8' : '#991b1b';
      const icon = isHospital ? '🏥' : '🩸';

      return `
        <div class="facility-card" style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:1.15rem; transition:all 0.2s ease; box-shadow:0 1px 3px rgba(0,0,0,0.05); margin-bottom:1rem;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:0.5rem; margin-bottom:0.5rem;">
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <span style="font-size:1.25rem;">${icon}</span>
              <span style="background:${badgeBg}; color:${badgeColor}; font-size:0.75rem; font-weight:800; padding:0.2rem 0.6rem; border-radius:99px;">
                ${item.typeLabel}
              </span>
            </div>
            <span style="font-size:0.75rem; color:#10b981; font-weight:700;">🟢 Verified</span>
          </div>

          <h3 style="font-size:1.05rem; font-weight:800; color:#0f172a; margin-bottom:0.4rem;">${item.name}</h3>
          <p style="font-size:0.85rem; color:#475569; margin-bottom:0.6rem; line-height:1.4;">
            📍 ${item.address}
          </p>

          <div style="display:flex; flex-wrap:wrap; gap:0.75rem; font-size:0.8rem; color:#334155; margin-bottom:0.85rem; padding-top:0.5rem; border-top:1px solid #f1f5f9;">
            <div>📞 <strong>Contact:</strong> ${item.contact}</div>
            <div>🚨 <strong>Helpline:</strong> <span style="color:#dc2626; font-weight:700;">${item.emergencyHelpline}</span></div>
          </div>

          <div style="display:flex; gap:0.5rem;">
            <button class="btn btn-outline" style="flex:1; padding:0.45rem 0.75rem; font-size:0.8rem;" onclick="MapManager.focusFacility('${item.id}')">
              📍 View on Map
            </button>
            <a href="tel:${item.contact.replace(/[^0-9]/g, '')}" class="btn btn-primary" style="flex:1; padding:0.45rem 0.75rem; font-size:0.8rem; text-align:center; text-decoration:none; display:inline-flex; align-items:center; justify-content:center;">
              📞 Call Now
            </a>
          </div>
        </div>
      `;
    }).join('');
  },

  renderCampsSection() {
    const container = document.getElementById('donation-camps-container');
    if (!container) return;

    if (this.upcomingCamps.length === 0) {
      container.innerHTML = `
        <div style="background:#f8fafc; border:1px dashed #cbd5e1; border-radius:12px; padding:1.5rem; text-align:center; color:#64748b;">
          <div style="font-size:2rem; margin-bottom:0.5rem;">⛺</div>
          <div style="font-weight:800; font-size:1rem; color:#0f172a; margin-bottom:0.25rem;">
            No verified upcoming blood donation camps available.
          </div>
          <p style="font-size:0.85rem; color:#64748b; margin-bottom:1rem; max-width:550px; margin-left:auto; margin-right:auto;">
            Blood donation camps are verified directly with State Blood Transfusion Councils and licensed blood centres. When official camps are scheduled, verified dates, venues, and organizers will appear here.
          </p>
          <div style="display:inline-flex; gap:0.75rem; flex-wrap:wrap; justify-content:center;">
            <a href="tel:104" class="btn btn-outline" style="font-size:0.8rem; padding:0.4rem 0.85rem;">
              📞 Call 104 Blood Helpline
            </a>
            <button class="btn btn-primary" style="font-size:0.8rem; padding:0.4rem 0.85rem;" onclick="App.openModal('request-modal')">
              🩸 Request Blood Assistance
            </button>
          </div>
        </div>
      `;
    } else {
      container.innerHTML = `
        <div class="requests-grid">
          ${this.upcomingCamps.map(camp => `
            <div class="facility-card" style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:1.25rem;">
              <span style="background:#ecfdf5; color:#059669; font-size:0.75rem; font-weight:800; padding:0.2rem 0.6rem; border-radius:99px;">
                ⛺ VERIFIED BLOOD CAMP
              </span>
              <h3 style="font-size:1.1rem; font-weight:800; margin:0.5rem 0 0.25rem 0;">${camp.title}</h3>
              <p style="font-size:0.85rem; color:#475569;">📍 Venue: <strong>${camp.venue}</strong></p>
              <p style="font-size:0.85rem; color:#475569;">📅 Date: <strong>${camp.date}</strong> | ⏰ Time: <strong>${camp.time}</strong></p>
              <p style="font-size:0.85rem; color:#475569;">🤝 Organizer: <strong>${camp.organizer}</strong></p>
            </div>
          `).join('')}
        </div>
      `;
    }
  },

  focusFacility(id) {
    const item = this.facilities.find(f => f.id === id);
    if (item && this.map) {
      this.map.setView([item.latitude, item.longitude], 15, { animate: true });
      const marker = this.markers.find(m => {
        const pos = m.getLatLng();
        return Math.abs(pos.lat - item.latitude) < 0.0001 && Math.abs(pos.lng - item.longitude) < 0.0001;
      });
      if (marker) {
        marker.openPopup();
      }
      // Scroll smoothly to map
      document.getElementById('leaflet-map')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
};

window.MapManager = MapManager;
