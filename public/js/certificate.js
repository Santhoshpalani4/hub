/**
 * HELPHUB Certificate Generation & Verification Module
 * Generates official certificates for volunteers
 */
const CertificateManager = {
  certificates: [],

  async init() {
    await this.fetchCertificates();
  },

  async fetchCertificates() {
    const data = await API.get('/certificates');
    if (data && Array.isArray(data)) {
      this.certificates = data;
    }
  },

  showCertificateModal(certId = 'cert1') {
    const cert = this.certificates.find(c => c.id === certId) || {
      certificate_code: 'CERT-HH-2026-089',
      volunteer_name: 'Mohan Das',
      college_name: 'City Tech University',
      title: 'Excellence in Community Volunteering',
      total_hours: 42.0,
      total_activities: 12,
      issued_date: '2026-09-30',
      qr_verification_token: 'VERIFY-HELPHUB-MOHAN-850'
    };

    const certHtml = `
      <div class="certificate-frame">
        <div class="certificate-inner-border">
          <div class="cert-watermark">HELPHUB VERIFIED</div>
          
          <div class="cert-header">
            <h1>HELPHUB</h1>
            <div class="cert-sub">Certificate of Volunteering</div>
          </div>

          <p style="font-size:1rem; color:#475569; margin-top:1rem;">This official certificate is proudly awarded to</p>

          <div class="cert-recipient">${cert.volunteer_name}</div>

          <div style="font-weight:700; color:#1e3a8a; font-size:1.1rem; margin-bottom:1rem;">
            ${cert.college_name || 'City Tech University'}
          </div>

          <p class="cert-body-text">
            For outstanding dedication, empathy, and active contribution to community service through <strong>HELPHUB</strong> platform. Having completed <strong>${cert.total_hours} Service Hours</strong> across <strong>${cert.total_activities} Community Activities</strong>.
          </p>

          <div class="cert-footer-row">
            <div class="cert-sig-box">
              <div class="cert-sig-line"></div>
              <span>Dr. K. Raman</span><br>
              <span style="font-weight:400; font-size:0.75rem;">Director of Student Affairs</span>
            </div>

            <div class="cert-qr-box">
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${cert.qr_verification_token}" alt="Verification QR">
              <div style="font-size:0.65rem; color:#64748b; font-weight:700; margin-top:2px;">${cert.certificate_code}</div>
            </div>

            <div class="cert-sig-box">
              <div class="cert-sig-line"></div>
              <span>Priya Sharma</span><br>
              <span style="font-weight:400; font-size:0.75rem;">HELPHUB Community Lead</span>
            </div>
          </div>
        </div>
      </div>

      <div style="display:flex; gap:1rem; margin-top:1.5rem;">
        <button class="btn btn-primary" style="flex:1;" onclick="window.print()">
          🖨️ PRINT / DOWNLOAD PDF CERTIFICATE
        </button>
        <button class="btn btn-outline" style="flex:1;" onclick="App.closeModal('custom-alert-modal')">
          CLOSE
        </button>
      </div>
    `;

    App.showCustomModal('custom-alert-modal', certHtml);
  }
};

window.CertificateManager = CertificateManager;
