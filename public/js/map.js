/**
 * HELPHUB Leaflet & OpenStreetMap Interactive Map Module
 * Displays Help Request locations, Volunteer coordinates, distance, and routes
 */
const MapManager = {
  map: null,
  markers: [],
  routeLayer: null,

  init() {
    const mapContainer = document.getElementById('leaflet-map');
    if (!mapContainer || typeof L === 'undefined') return;

    // Center on Campus Area (13.3512, 80.1408)
    this.map = L.map('leaflet-map').setView([13.3512, 80.1408], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors | HELPHUB Map'
    }).addTo(this.map);

    this.renderSampleMarkers();
  },

  renderSampleMarkers() {
    if (!this.map) return;

    // Clear existing
    this.markers.forEach(m => this.map.removeLayer(m));
    this.markers = [];

    // Help Request Marker (Red 🆘)
    const reqIcon = L.divIcon({
      className: 'custom-map-pin-req',
      html: '<div style="background:#ef4444; color:white; padding:8px 12px; border-radius:20px; font-weight:800; font-size:12px; box-shadow:0 4px 10px rgba(239,68,68,0.5); border:2px solid white;">🆘 HELP NEEDED</div>',
      iconSize: [120, 36],
      iconAnchor: [60, 18]
    });

    const reqMarker = L.marker([13.3512, 80.1408], { icon: reqIcon }).addTo(this.map);
    reqMarker.bindPopup('<b>🆘 Medical Support Request</b><br>Campus Health Center Gate<br>4 Volunteers Required');
    this.markers.push(reqMarker);

    // Volunteer Location Marker (Blue 📍)
    const volIcon = L.divIcon({
      className: 'custom-map-pin-vol',
      html: '<div style="background:#2563eb; color:white; padding:6px 10px; border-radius:20px; font-weight:800; font-size:12px; box-shadow:0 4px 10px rgba(37,99,235,0.5); border:2px solid white;">📍 YOU (Mohan)</div>',
      iconSize: [110, 32],
      iconAnchor: [55, 16]
    });

    const volMarker = L.marker([13.3420, 80.1350], { icon: volIcon }).addTo(this.map);
    volMarker.bindPopup('<b>📍 Volunteer Mohan Das</b><br>Campus Hostel Block B<br>Approx. 1.2 km away');
    this.markers.push(volMarker);

    // Team Member Marker (Green 🟢)
    const teamIcon = L.divIcon({
      className: 'custom-map-pin-team',
      html: '<div style="background:#10b981; color:white; padding:6px 10px; border-radius:20px; font-weight:800; font-size:12px; box-shadow:0 4px 10px rgba(16,185,129,0.5); border:2px solid white;">🟢 Raj (Arrived)</div>',
      iconSize: [110, 32],
      iconAnchor: [55, 16]
    });

    const teamMarker = L.marker([13.3510, 80.1405], { icon: teamIcon }).addTo(this.map);
    teamMarker.bindPopup('<b>🟢 Raj Kumar</b><br>Arrived Safely at 18:25 PM');
    this.markers.push(teamMarker);

    // Route Line (Dashed Polyline)
    const latlngs = [
      [13.3420, 80.1350],
      [13.3460, 80.1375],
      [13.3512, 80.1408]
    ];

    if (this.routeLayer) this.map.removeLayer(this.routeLayer);
    this.routeLayer = L.polyline(latlngs, { color: '#2563eb', weight: 4, opacity: 0.8, dashArray: '8, 8' }).addTo(this.map);
  },

  focusOnRequest(request) {
    if (!this.map) return;
    const lat = request.latitude || 13.3512;
    const lng = request.longitude || 80.1408;
    this.map.setView([lat, lng], 15);
  },

  simulateNavigation() {
    App.showSuccessAlert(
      '🗺️ GPS Navigation Started',
      'Turn-by-turn guidance active. Estimated distance: <strong>1.2 km</strong> (approx. 4 mins by bike / 12 mins walking).'
    );
  }
};

window.MapManager = MapManager;
