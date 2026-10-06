/**
 * HELPHUB Innovation Feature: Safety Notification Engine
 * Allows volunteers to confirm arrival and alerts remaining team members safely
 */
const SafetyManager = {
  async confirmArrival(reqId) {
    const vol = VolunteerManager.currentVolunteer;

    // Call REST API
    const res = await API.post(`/requests/${reqId}/safety-arrival`, {
      volunteer_id: vol.id,
      volunteer_name: vol.name
    });

    if (res && res.success) {
      // Trigger Green Safety Ripple Banner Modal & Audio Chime
      this.triggerSafetyBroadcastModal({
        volunteer_name: vol.name,
        location: 'Campus Health Center Gate',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });

      // Reload active mission view
      VolunteerManager.loadActiveMission(reqId);

      // Push real-time notification to Notification Engine
      NotificationEngine.add({
        id: 'n_safety_' + Date.now(),
        title: '🟢 VOLUNTEER REACHED SAFELY',
        message: `${vol.name} has reached the help location safely. Other volunteers can now continue to the location.`,
        type: 'ARRIVED_SAFELY',
        is_read: false
      });
    }
  },

  triggerSafetyBroadcastModal(data) {
    const modalHtml = `
      <div style="text-align:center; padding:1.5rem;">
        <div style="width:90px; height:90px; background:#ecfdf5; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 1.5rem auto; font-size:3rem; border:4px solid #10b981;" class="safety-pulse">
          🟢
        </div>

        <h2 style="font-size:1.8rem; color:#0f172a; margin-bottom:0.5rem;">ARRIVED SAFELY</h2>
        
        <div style="background:#ecfdf5; border:1.5px solid #10b981; border-radius:14px; padding:1.25rem; text-align:left; margin:1.5rem 0;">
          <div style="font-size:0.85rem; font-weight:800; color:#047857; text-transform:uppercase; letter-spacing:1px; margin-bottom:0.4rem;">
            🟢 VOLUNTEER SAFETY BROADCAST
          </div>

          <p style="font-size:1rem; color:#064e3b; margin-bottom:0.5rem; font-weight:600;">
            <strong>${data.volunteer_name}</strong> has reached the help location safely at <strong>${data.time}</strong>.
          </p>

          <p style="font-size:0.9rem; color:#047857;">
            📍 Location: <strong>${data.location}</strong>
          </p>

          <div style="font-size:0.85rem; color:#059669; margin-top:0.75rem; border-top:1px dashed #6ee7b7; padding-top:0.5rem;">
            ✅ Notification sent to all team members: <em>"Other volunteers can now safely proceed to the location."</em>
          </div>
        </div>

        <button class="btn btn-secondary" style="width:100%; font-size:1.05rem;" onclick="App.closeModal('custom-alert-modal')">
          GREAT, CONTINUE TO HELP
        </button>
      </div>
    `;

    App.showCustomModal('custom-alert-modal', modalHtml);
  }
};

window.SafetyManager = SafetyManager;
