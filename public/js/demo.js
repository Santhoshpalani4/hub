/**
 * HELPHUB Interactive 10-Step Demo Scenario Runner
 * Executes the complete workflow requested in prompt item 28 seamlessly
 */
const DemoScenarioRunner = {
  currentStep: 0,

  steps: [
    { title: 'Step 1: Create Request', desc: 'Requester submits Help Request for Medical Assistance' },
    { title: 'Step 2: Broadcast Alert', desc: 'Real-time alert sent to nearby volunteers' },
    { title: 'Step 3: Volunteers Accept', desc: 'Volunteers click "I CAN HELP"' },
    { title: 'Step 4: Team Assembly', desc: 'Automatic Volunteer Team (TEAM-1024) formed' },
    { title: 'Step 5: On the Way', desc: 'Volunteer Mohan begins transit (Status: 🟡 ON THE WAY)' },
    { title: 'Step 6: Arrived Safely', desc: 'Mohan clicks 🟢 I HAVE ARRIVED SAFELY' },
    { title: 'Step 7: Safety Broadcast', desc: 'Team receives safety clearance alert to proceed' },
    { title: 'Step 8: Activity Completed', desc: 'Volunteers complete medical drive support' },
    { title: 'Step 9: Help Confirmed', desc: 'Requester confirms: ✅ YES, HELP RECEIVED' },
    { title: 'Step 10: Rewards Awarded', desc: '+20 Points, +2 Hours & 🏅 Badge credited!' }
  ],

  async startDemoScenario() {
    this.currentStep = 0;
    this.executeStep(1);
  },

  async executeStep(stepNumber) {
    this.currentStep = stepNumber;
    this.updateStepperUI(stepNumber);

    switch (stepNumber) {
      case 1:
        // Step 1: Create Request
        const res1 = await API.post('/requests', {
          title: 'Emergency Medical Camp Assistance',
          category: 'Medical Support',
          location_name: 'Campus Health Center Gate',
          volunteers_needed: '4',
          priority: 'HIGH',
          description: 'Assist elderly patients at community health drive.'
        });
        App.showSuccessAlert('Step 1 Complete: Help Request Created', 'Help Request HH1024 created by requester Priya Sharma.');
        RequestManager.fetchRequests();
        break;

      case 2:
        // Step 2: Broadcast Alert
        NotificationEngine.add({
          id: 'demo_n2_' + Date.now(),
          title: '🚨 HELP NEEDED NEAR YOU',
          message: 'Someone needs assistance near you at Campus Health Center Gate (4 Volunteers Needed).',
          type: 'NEW_REQUEST',
          is_read: false
        });
        App.showSuccessAlert('Step 2 Complete: Alert Broadcasted', 'Real-time alert 🚨 "HELP NEEDED NEAR YOU" delivered to registered volunteers.');
        break;

      case 3:
        // Step 3: Volunteers Click "I CAN HELP"
        await API.post('/requests/hr1/join', { volunteer_id: 'v1', volunteer_name: 'Mohan Das' });
        await API.post('/requests/hr1/join', { volunteer_id: 'v2', volunteer_name: 'Raj Kumar' });
        await API.post('/requests/hr1/join', { volunteer_id: 'v3', volunteer_name: 'Santhosh V' });
        App.showSuccessAlert('Step 3 Complete: 3 Volunteers Joined', 'Mohan, Raj, and Santhosh clicked "I CAN HELP".');
        VolunteerManager.loadActiveMission('hr1');
        break;

      case 4:
        // Step 4: Automatic Volunteer Team Created
        App.showSuccessAlert('Step 4 Complete: Team Assembled', 'Automatic Team <strong>TEAM-1024</strong> formed. Team Leader: Mohan Das.');
        VolunteerManager.loadActiveMission('hr1');
        break;

      case 5:
        // Step 5: Volunteer Transit Status 🟡 ON THE WAY
        App.showSuccessAlert('Step 5 Complete: Transit Started', 'Volunteer Mohan Das status set to 🟡 ON THE WAY.');
        break;

      case 6:
        // Step 6: Safety Arrival Confirmation 🟢 I HAVE ARRIVED SAFELY
        await SafetyManager.confirmArrival('hr1');
        break;

      case 7:
        // Step 7: Safety Alert Received by remaining team members
        NotificationEngine.add({
          id: 'demo_n7_' + Date.now(),
          title: '🟢 VOLUNTEER REACHED SAFELY',
          message: 'Mohan has reached the help location safely at Campus Health Center Gate. Other volunteers can now continue safely to the location.',
          type: 'ARRIVED_SAFELY',
          is_read: false
        });
        break;

      case 8:
        // Step 8: Complete Activity
        await API.post('/requests/hr1/start', {});
        App.showSuccessAlert('Step 8 Complete: Help Activity Completed', 'Volunteers successfully completed the medical support drive.');
        break;

      case 9:
        // Step 9: Requester Confirms Help Received
        App.showSuccessAlert('Step 9 Complete: Requester Confirmed', 'Requester Priya Sharma clicked: ✅ YES, HELP RECEIVED.');
        break;

      case 10:
        // Step 10: Points & Badges Awarded
        await API.post('/requests/hr1/complete', {});
        App.showSuccessAlert(
          '🎉 Step 10 Complete: IMPACT & REWARDS',
          'System Updated: <strong>+20 Points</strong>, <strong>+2 Volunteer Hours</strong>, and <strong>🏅 Community Helper Badge</strong> awarded!'
        );
        VolunteerManager.fetchVolunteerProfile();
        break;
    }
  },

  updateStepperUI(stepNum) {
    for (let i = 1; i <= 10; i++) {
      const pill = document.getElementById(`demo-pill-${i}`);
      if (pill) {
        pill.classList.remove('active', 'completed');
        if (i < stepNum) pill.classList.add('completed');
        else if (i === stepNum) pill.classList.add('active');
      }
    }
  }
};

window.DemoScenarioRunner = DemoScenarioRunner;
