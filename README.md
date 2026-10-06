# 🤝 HELPHUB — Real-Time Volunteer Coordination Platform

> **“One Request. Many Helping Hands.”**  
> *Connecting society, students, colleges, NGOs, and volunteers through one simple platform.*

---

## 🌟 Overview

**HELPHUB** is a full-stack real-time web platform designed to connect individuals and organizations needing help with nearby student volunteers. Built with clean, modern web technologies and a native Java backend, HELPHUB introduces an end-to-end workflow from request creation to team assembly, safety verification, activity completion, impact tracking, and certificate issuance.

### 🔄 End-to-End Workflow
```
HELP REQUEST → VOLUNTEER ALERT → ACCEPT HELP → VOLUNTEER TEAM → LOCATION → ARRIVAL → SAFETY NOTIFICATION → HELP ACTIVITY → COMPLETION → IMPACT & REWARDS
```

---

## 🚀 Key Modules & Innovations

### 1. 🟢 Innovation Feature — Safety Arrival Notification
When a volunteer reaches a help location, they click:
> 🟢 **I HAVE ARRIVED SAFELY**

The system instantly updates their status to **ARRIVED SAFELY** and broadcasts a green ripple safety alert to remaining team members and the requester:
> 🟢 **VOLUNTEER REACHED SAFELY**  
> *Mohan Das has reached the help location safely at Campus Health Center Gate. Other volunteers can now safely proceed to the location.*

### 2. ⚡ 10-Step Interactive Demo Scenario Stepper
The platform features an interactive **DEMO SCENARIO** banner at the top of the interface. Evaluators and users can click **"RUN FULL DEMO"** or click through 10 steps to test the entire platform lifecycle:
1. **Create Request:** Requester submits Help Request for Medical Assistance.
2. **Broadcast Alert:** Real-time alert sent to nearby volunteers.
3. **Volunteers Accept:** Volunteers click "I CAN HELP".
4. **Team Assembly:** Automatic Volunteer Team (`TEAM-1024`) formed.
5. **On the Way:** Volunteer Mohan begins transit (Status: `🟡 ON THE WAY`).
6. **Arrived Safely:** Mohan clicks `🟢 I HAVE ARRIVED SAFELY`.
7. **Safety Broadcast:** Team receives safety clearance alert to proceed.
8. **Activity Completed:** Volunteers complete medical drive support.
9. **Help Confirmed:** Requester confirms: `✅ YES, HELP RECEIVED`.
10. **Rewards Awarded:** `+20 Points`, `+2 Hours` & `🏅 Badge` credited!

### 3. 🏥 10 Help Categories
- 🏥 Medical Support
- 🩸 Blood Donation
- 👴 Elderly Assistance
- 📚 Education Support
- 🍱 Food Distribution
- 🌱 Environmental Activities
- ♿ Accessibility Assistance
- 🚨 Emergency Support
- 🎓 College Activities
- 🤝 Other Social Help

### 4. 🗺️ Location & Interactive Map Integration
- Powered by **Leaflet & OpenStreetMap**.
- Custom interactive markers for Help Request Location (🆘), Volunteer Location (📍), and Team Members (🟢).
- Route estimation polyline & **"NAVIGATE TO LOCATION"** turn-by-turn guidance simulation.

### 5. 📜 Verified Certificate Generation
- Printable & downloadable PDF volunteering certificates.
- Features digital QR code verification tokens, total service hours, college affiliation, and signature seals.

### 6. 📊 Social Impact Dashboard
- Live animated counters: `1,250+ Volunteers`, `540+ Requests`, `3,200+ Volunteer Hours`, `4,800+ People Helped`.
- Dynamic Chart.js category breakdown doughnut charts.

### 7. 🎓 College Module (City Tech University)
- Institutional portal for colleges to publish volunteer drives, recruit students, log attendance, and issue co-curricular credit hours.

### 8. 🚨 Emergency Mode
- Prominent `🚨 EMERGENCY HELP` button for urgent crises with high priority alert dispatches and safety warnings (112 / 108 emergency contact info).

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | HTML5, CSS3 (Vanilla design tokens, Glassmorphism, Responsive CSS), JavaScript ES6+ |
| **Maps & Charts** | Leaflet.js (OpenStreetMap API), Chart.js |
| **Backend** | Java 21+ (`com.sun.net.httpserver.HttpServer`), RESTful API Architecture |
| **Database** | MySQL Schema & Data scripts (`schema.sql`, `data.sql`) + High-performance In-Memory JSON Data Store |
| **Build Tools** | Standalone Java Compiler (`javac`), Maven (`pom.xml` included) |

---

## 📁 Project Structure

```
e:\volunteer\
├── src\
│   └── main\
│       ├── java\
│       │   └── com\
│       │       └── helphub\
│       │           └── HelpHubServer.java     # Main Java REST Backend Server
│       └── resources\
│           ├── schema.sql                     # Full MySQL Database Schema (15 Tables)
│           └── data.sql                       # Seed Data Script
├── public\                                    # Web Frontend Root
│   ├── index.html                             # Master Single-Page Web Application
│   ├── css\
│   │   ├── style.css                          # Modern Design System & Component Styles
│   │   └── certificate.css                    # Certificate Print & Preview Styles
│   └── js\
│       ├── api.js                             # REST API Client Service
│       ├── app.js                             # Main Router & State Controller
│       ├── requests.js                        # Help Request Creator & Cards
│       ├── volunteer.js                       # Volunteer Dashboard & Team Assembly
│       ├── safety.js                          # Safety Arrival Notification Engine
│       ├── map.js                             # Leaflet Interactive Map Module
│       ├── impact.js                          # Impact Analytics & Chart.js
│       ├── college.js                         # College Drives Module
│       ├── admin.js                           # Admin Portal Module
│       ├── notifications.js                   # Notification Drawer & Audio Chimes
│       ├── certificate.js                     # Certificate Generator
│       └── demo.js                            # 10-Step Interactive Demo Stepper
├── pom.xml                                    # Maven POM Configuration
├── run.bat                                    # 1-Click Windows Launch Script
└── README.md                                  # Platform Documentation
```

---

## 🗄️ Database Schema (`schema.sql`)

The database consists of 15 relational tables:
1. `users`: System users with roles (`ADMIN`, `VOLUNTEER`, `REQUESTER`, `COLLEGE`).
2. `volunteers`: Volunteer stats (points, total hours, safety rating, student ID).
3. `help_requests`: Help requests with category, location coordinates, priority, and request codes (`HH1024`).
4. `teams`: Automatic volunteer teams (`TEAM-1024`).
5. `team_members`: Roster with pipeline statuses (`ACCEPTED`, `ON_THE_WAY`, `ARRIVED_SAFELY`, `HELPING`, `COMPLETED`).
6. `volunteer_requests`: Join request logs.
7. `locations`: Geo-coordinates for mapping.
8. `notifications`: Real-time notification log.
9. `activities`: Active service activities.
10. `attendance`: Verified service hours logged per volunteer.
11. `badges`: Achievement badges (🏅 First Helper, 🤝 Community Hero, ⭐ Active Volunteer, ❤️ Social Impact Champion).
12. `volunteer_points`: Audit trail for points.
13. `certificates`: Verification records and QR tokens.
14. `organizations`: Colleges and NGOs (e.g. City Tech University).
15. `events`: College volunteer drives.

---

## ⚡ How to Run Locally

### Prerequisites
- JDK 21 or higher installed (`java` & `javac` available in command line).

### Step 1: Launch the Application
Simply double click `run.bat` or run the following command in PowerShell:
```powershell
javac -d bin src/main/java/com/helphub/HelpHubServer.java
java -cp bin com.helphub.HelpHubServer
```

### Step 2: Open in Web Browser
Open your browser and navigate to:
```
http://localhost:8081
```
*(or `http://localhost:8080`)*

---

## 📜 License & Key Message

> **“When someone needs help, the right volunteers should know, respond, reach safely, and help together.”**
