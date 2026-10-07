package com.helphub;

import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpExchange;

import java.io.*;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.regex.Pattern;

/**
 * HELPHUB - Main Java REST Backend Server
 * Connects society, students, colleges, NGOs, and volunteers.
 * Runs on standard JDK without external framework dependencies.
 */
public class HelpHubServer {

    private static final int PORT = 8080;
    private static final String PUBLIC_DIR = "public";

    // In-Memory Data Store (Initialized with data.sql seed records & expandable)
    private static final Map<String, Map<String, Object>> users = new ConcurrentHashMap<>();
    private static final Map<String, Map<String, Object>> volunteers = new ConcurrentHashMap<>();
    private static final List<Map<String, Object>> helpRequests = new CopyOnWriteArrayList<>();
    private static final Map<String, Map<String, Object>> teams = new ConcurrentHashMap<>();
    private static final List<Map<String, Object>> teamMembers = new CopyOnWriteArrayList<>();
    private static final List<Map<String, Object>> notifications = new CopyOnWriteArrayList<>();
    private static final List<Map<String, Object>> certificates = new CopyOnWriteArrayList<>();
    private static final List<Map<String, Object>> events = new CopyOnWriteArrayList<>();
    private static final List<Map<String, Object>> badges = new CopyOnWriteArrayList<>();
    private static final AtomicInteger requestCounter = new AtomicInteger(1028);

    public static void main(String[] args) {
        int[] tryPorts = {8080, 8081, 8085, 9090};
        HttpServer server = null;
        int activePort = 8080;

        for (int port : tryPorts) {
            try {
                server = HttpServer.create(new InetSocketAddress(port), 0);
                activePort = port;
                break;
            } catch (Exception e) {
                // Try next port
            }
        }

        if (server == null) {
            System.err.println("❌ Could not bind to any port in list.");
            return;
        }

        try {
            initSeedData();

            // Register API Handlers
            server.createContext("/api/health", new HealthHandler());
            server.createContext("/api/requests", new RequestsHandler());
            server.createContext("/api/volunteers", new VolunteersHandler());
            server.createContext("/api/certificates", new CertificatesHandler());
            server.createContext("/api/impact/stats", new ImpactStatsHandler());
            server.createContext("/api/events", new EventsHandler());
            server.createContext("/api/notifications", new NotificationsHandler());
            server.createContext("/api/emergency", new EmergencyHandler());
            server.createContext("/api/admin/metrics", new AdminMetricsHandler());
            server.createContext("/api/demo/reset", new DemoResetHandler());

            // Static Files Handler (Fallback for UI)
            server.createContext("/", new StaticFileHandler());

            server.setExecutor(java.util.concurrent.Executors.newFixedThreadPool(10));
            System.out.println("==================================================================");
            System.out.println(" 🚀 HELPHUB JAVA REST BACKEND SERVER STARTED SUCCESSFULLY");
            System.out.println(" 🌐 Web Platform & API Available at: http://localhost:" + activePort);
            System.out.println(" 🏥 Real-Time Volunteer Alert & Safety Engine Activated");
            System.out.println("==================================================================");
            server.start();

        } catch (Exception e) {
            System.err.println("❌ Failed to start HELPHUB Java Server: " + e.getMessage());
            e.printStackTrace();
        }
    }

    // =========================================================
    // SEED DATA INITIALIZATION
    // =========================================================
    private static void initSeedData() {
        users.clear();
        volunteers.clear();
        helpRequests.clear();
        teams.clear();
        teamMembers.clear();
        notifications.clear();
        certificates.clear();
        events.clear();
        badges.clear();

        // Seed Users
        Map<String, Object> u1 = createMap("id", "u1", "name", "Mohan Das", "email", "mohan@campus.edu", "phone", "+91 9876543210", "role", "VOLUNTEER", "college_name", "City Tech University", "avatar", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150");
        Map<String, Object> u2 = createMap("id", "u2", "name", "Raj Kumar", "email", "raj@campus.edu", "phone", "+91 9876543211", "role", "VOLUNTEER", "college_name", "City Tech University", "avatar", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150");
        Map<String, Object> u3 = createMap("id", "u3", "name", "Santhosh V", "email", "santhosh@campus.edu", "phone", "+91 9876543212", "role", "VOLUNTEER", "college_name", "City Tech University", "avatar", "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150");
        Map<String, Object> u4 = createMap("id", "u4", "name", "Arun Prakash", "email", "arun@campus.edu", "phone", "+91 9876543213", "role", "VOLUNTEER", "college_name", "City Tech University", "avatar", "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150");
        Map<String, Object> u5 = createMap("id", "u5", "name", "Priya Sharma", "email", "priya@ngo.org", "phone", "+91 9876543214", "role", "REQUESTER", "college_name", "Sunshine Foundation NGO", "avatar", "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150");

        users.put("u1", u1); users.put("u2", u2); users.put("u3", u3); users.put("u4", u4); users.put("u5", u5);

        // Seed Volunteers
        Map<String, Object> v1 = createMap("id", "v1", "user_id", "u1", "name", "Mohan Das", "student_id", "STU2023CSE042", "department", "Computer Science & Engineering", "points", 850, "total_hours", 42.0, "activities_completed", 12, "people_helped", 18, "safety_rating", 5.0, "is_available", true, "skills", "First Aid, CPR Certified, Emergency Management, Tutoring", "availability", "Weekends, Evenings & On-Call Emergencies", "address", "Room 402, Campus Block B Hostel", "bio", "Dedicated student volunteer committed to community health drives, senior citizen support, and campus social activities.", "emergency_contact", "+91 9876543299", "drives_joined", 4);
        Map<String, Object> v2 = createMap("id", "v2", "user_id", "u2", "name", "Raj Kumar", "student_id", "STU2023ECE018", "department", "Electronics & Comm", "points", 620, "total_hours", 31.5, "activities_completed", 9, "people_helped", 14, "safety_rating", 4.9, "is_available", true, "skills", "Blood Donation Coordinator, Crowd Management", "availability", "Saturday & Sunday", "address", "Campus Block A Hostel", "bio", "Active NSS member and blood donation coordinator.", "emergency_contact", "+91 9876543298", "drives_joined", 3);
        Map<String, Object> v3 = createMap("id", "v3", "user_id", "u3", "name", "Santhosh V", "student_id", "STU2023EEE055", "department", "Electrical Eng", "points", 410, "total_hours", 22.0, "activities_completed", 6, "people_helped", 9, "safety_rating", 5.0, "is_available", true, "skills", "Logistics & Food Distribution", "availability", "Flexible Hours", "address", "City Tech Hostel C", "bio", "Passionate about hunger relief and environmental drives.", "emergency_contact", "+91 9876543297", "drives_joined", 2);
        Map<String, Object> v4 = createMap("id", "v4", "user_id", "u4", "name", "Arun Prakash", "student_id", "STU2023MECH012", "department", "Mechanical Eng", "points", 290, "total_hours", 15.0, "activities_completed", 4, "people_helped", 6, "safety_rating", 4.8, "is_available", true, "skills", "Disaster Relief, Driving", "availability", "Evenings", "address", "Campus Hostels", "bio", "Enthusiastic student volunteer ready for physical and community support.", "emergency_contact", "+91 9876543296", "drives_joined", 1);

        volunteers.put("v1", v1); volunteers.put("v2", v2); volunteers.put("v3", v3); volunteers.put("v4", v4);

        // Seed Badges
        badges.add(createMap("id", "b1", "name", "First Helper", "code", "FIRST_HELPER", "icon", "🏅", "description", "Completed your first help activity", "points", 20));
        badges.add(createMap("id", "b2", "name", "Community Hero", "code", "COMMUNITY_HERO", "icon", "🤝", "description", "Reached 100 volunteer points and 5 activities", "points", 100));
        badges.add(createMap("id", "b3", "name", "Active Volunteer", "code", "ACTIVE_VOLUNTEER", "icon", "⭐", "description", "Completed 10+ volunteer activities", "points", 200));
        badges.add(createMap("id", "b4", "name", "Social Impact Champion", "code", "IMPACT_CHAMPION", "icon", "❤️", "description", "Helped over 25+ people in emergency & social causes", "points", 500));
        badges.add(createMap("id", "b5", "name", "Safety Guardian", "code", "SAFETY_GUARDIAN", "icon", "🟢", "description", "Promptly sent arrival safety alerts in 5+ team missions", "points", 150));

        // Seed Help Requests
        Map<String, Object> hr1 = createMap(
            "id", "hr1", "request_code", "HH1024", "requester_id", "u5", "requester_name", "Priya Sharma (Sunshine NGO)",
            "contact_number", "+91 9876543214", "category", "Medical Support", "title", "Medical Assistance Needed at Community Camp",
            "description", "Urgent requirement for student volunteers to assist doctors, manage patient queue, and distribute medicines during senior citizen medical drive.",
            "location_name", "Campus Health Center Gate", "latitude", 13.3512, "longitude", 80.1408,
            "volunteers_needed", 5, "volunteers_joined", 3, "priority", "HIGH", "request_date", "2026-10-07",
            "request_time", "18:30", "image_url", "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=500",
            "is_emergency", false, "status", "OPEN", "created_at", LocalDateTime.now().toString()
        );

        Map<String, Object> hr2 = createMap(
            "id", "hr2", "request_code", "HH1025", "requester_id", "u5", "requester_name", "Chennai Red Cross Unit",
            "contact_number", "+91 9876543214", "category", "Blood Donation", "title", "Emergency O+ Blood Donors Required",
            "description", "Urgent requirement of 3 O+ blood donors for emergency surgical patient at City General Hospital.",
            "location_name", "City General Hospital, Main Block", "latitude", 13.0827, "longitude", 80.2707,
            "volunteers_needed", 3, "volunteers_joined", 2, "priority", "EMERGENCY", "request_date", "2026-10-07",
            "request_time", "14:00", "image_url", "https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=500",
            "is_emergency", true, "status", "OPEN", "created_at", LocalDateTime.now().toString()
        );

        Map<String, Object> hr3 = createMap(
            "id", "hr3", "request_code", "HH1026", "requester_id", "u5", "requester_name", "Campus Green Club",
            "contact_number", "+91 9876543215", "category", "Environmental Activities", "title", "Tree Plantation Drive & Campus Greening",
            "description", "Planting 200 native saplings along the campus periphery. Tools and refreshments provided.",
            "location_name", "Campus Central Grounds", "latitude", 13.3520, "longitude", 80.1415,
            "volunteers_needed", 10, "volunteers_joined", 6, "priority", "NORMAL", "request_date", "2026-10-08",
            "request_time", "09:00", "image_url", "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=500",
            "is_emergency", false, "status", "OPEN", "created_at", LocalDateTime.now().toString()
        );

        Map<String, Object> hr4 = createMap(
            "id", "hr4", "request_code", "HH1027", "requester_id", "u5", "requester_name", "Aaroham Foundation",
            "contact_number", "+91 9876543214", "category", "Education Support", "title", "Weekend Evening Tutoring for Primary Kids",
            "description", "Teaching basic mathematics and English reading to underprivileged primary school students.",
            "location_name", "Community Learning Center", "latitude", 13.3480, "longitude", 80.1380,
            "volunteers_needed", 4, "volunteers_joined", 4, "priority", "NORMAL", "request_date", "2026-10-09",
            "request_time", "16:00", "image_url", "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=500",
            "is_emergency", false, "status", "IN_PROGRESS", "created_at", LocalDateTime.now().toString()
        );

        helpRequests.add(hr1); helpRequests.add(hr2); helpRequests.add(hr3); helpRequests.add(hr4);

        // Seed Team & Team Members for HR1
        Map<String, Object> t1 = createMap("id", "t1", "team_code", "TEAM-1024", "help_request_id", "hr1", "leader_volunteer_id", "v1", "created_at", LocalDateTime.now().toString());
        teams.put("hr1", t1);

        teamMembers.add(createMap("id", "tm1", "team_id", "t1", "volunteer_id", "v1", "volunteer_name", "Mohan Das", "status", "ARRIVED_SAFELY", "arrived_at", "18:25 PM"));
        teamMembers.add(createMap("id", "tm2", "team_id", "t1", "volunteer_id", "v2", "volunteer_name", "Raj Kumar", "status", "ON_THE_WAY", "arrived_at", null));
        teamMembers.add(createMap("id", "tm3", "team_id", "t1", "volunteer_id", "v3", "volunteer_name", "Santhosh V", "status", "ACCEPTED", "arrived_at", null));

        // Seed Events (Within next 10 days from 2026-10-07, Venue: College Main Hall)
        events.add(createMap(
            "id", "ev1",
            "title", "Campus Mega Cleanliness & Green Drive",
            "organization_name", "City Tech University",
            "description", "NSS & Youth Red Cross annual environmental service drive.",
            "location", "College Main Hall",
            "event_date", "2026-10-12",
            "start_time", "09:00",
            "end_time", "13:00",
            "volunteers_capacity", 50,
            "volunteers_registered", 38,
            "category", "Cleanliness",
            "organizer_name", "Prof. K. Ramesh (NSS Coordinator)",
            "contact_info", "+91 9876543210",
            "registration_deadline", "2026-10-11",
            "status", "Upcoming"
        ));

        events.add(createMap(
            "id", "ev2",
            "title", "Inter-College Blood Donation Camp",
            "organization_name", "City Tech University & Red Cross",
            "description", "Joint mega blood donation camp with Red Cross.",
            "location", "College Main Hall",
            "event_date", "2026-10-15",
            "start_time", "09:30",
            "end_time", "15:30",
            "volunteers_capacity", 100,
            "volunteers_registered", 72,
            "category", "Blood Donation",
            "organizer_name", "Youth Red Cross Unit",
            "contact_info", "+91 9876543211",
            "registration_deadline", "2026-10-14",
            "status", "Upcoming"
        ));

        // Seed Certificates
        certificates.add(createMap("id", "cert1", "certificate_code", "CERT-HH-2026-089", "volunteer_id", "v1", "volunteer_name", "Mohan Das", "college_name", "City Tech University", "title", "Excellence in Community Volunteering", "total_hours", 42.0, "total_activities", 12, "issued_date", "2026-09-30", "qr_verification_token", "VERIFY-HELPHUB-MOHAN-850"));

        // Seed Notifications
        notifications.add(createMap("id", "n1", "user_id", "u1", "title", "🚨 HELP NEEDED NEAR YOU", "message", "Medical Assistance Needed at Campus Area (5 Volunteers Required)", "type", "NEW_REQUEST", "related_request_id", "hr1", "is_read", false, "created_at", "10 mins ago"));
        notifications.add(createMap("id", "n2", "user_id", "u1", "title", "🟢 VOLUNTEER REACHED SAFELY", "message", "Mohan Das has reached Campus Gate safely. You can now proceed to the location.", "type", "ARRIVED_SAFELY", "related_request_id", "hr1", "is_read", false, "created_at", "5 mins ago"));
        notifications.add(createMap("id", "n3", "user_id", "u1", "title", "🏆 BADGE UNLOCKED", "message", "Congratulations! You earned the 'Community Hero' Badge!", "type", "BADGE_EARNED", "related_request_id", null, "is_read", true, "created_at", "1 hour ago"));
    }

    // =========================================================
    // API HANDLERS
    // =========================================================

    private static class HealthHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String json = "{\"status\":\"UP\",\"app\":\"HELPHUB\",\"version\":\"1.0.0\",\"serverTime\":\"" + LocalDateTime.now() + "\"}";
            sendJsonResponse(exchange, 200, json);
        }
    }

    private static class RequestsHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCorsHeaders(exchange);
            String method = exchange.getRequestMethod();
            String path = exchange.getRequestURI().getPath();

            if ("OPTIONS".equalsIgnoreCase(method)) {
                sendJsonResponse(exchange, 204, "");
                return;
            }

            if ("GET".equalsIgnoreCase(method)) {
                // Check if path is /api/requests/{id}
                String[] parts = path.split("/");
                if (parts.length == 4) {
                    String reqId = parts[3];
                    Map<String, Object> found = findHelpRequest(reqId);
                    if (found != null) {
                        Map<String, Object> response = new HashMap<>(found);
                        Map<String, Object> team = teams.get(reqId);
                        response.put("team", team);
                        response.put("team_members", getMembersForRequest(reqId));
                        sendJsonResponse(exchange, 200, toJson(response));
                    } else {
                        sendJsonResponse(exchange, 404, "{\"error\":\"Help request not found\"}");
                    }
                } else {
                    // List all requests
                    sendJsonResponse(exchange, 200, toJson(helpRequests));
                }
            } else if ("POST".equalsIgnoreCase(method)) {
                String body = readBody(exchange);

                // Handle Sub-routes: join, safety-arrival, start, complete
                if (path.endsWith("/join")) {
                    String reqId = path.split("/")[3];
                    handleJoinRequest(exchange, reqId, body);
                } else if (path.endsWith("/safety-arrival")) {
                    String reqId = path.split("/")[3];
                    handleSafetyArrival(exchange, reqId, body);
                } else if (path.endsWith("/start")) {
                    String reqId = path.split("/")[3];
                    handleStartActivity(exchange, reqId);
                } else if (path.endsWith("/complete")) {
                    String reqId = path.split("/")[3];
                    handleCompleteActivity(exchange, reqId, body);
                } else {
                    // Create New Help Request
                    handleCreateRequest(exchange, body);
                }
            }
        }
    }

    private static void handleCreateRequest(HttpExchange exchange, String body) throws IOException {
        try {
            Map<String, String> data = parseSimpleJson(body);
            int codeNum = requestCounter.incrementAndGet();
            String id = "hr_" + codeNum;
            String requestCode = "HH" + codeNum;

            boolean isEmergency = "EMERGENCY".equalsIgnoreCase(data.get("priority")) || "true".equalsIgnoreCase(data.get("is_emergency"));

            Map<String, Object> newReq = new HashMap<>();
            newReq.put("id", id);
            newReq.put("request_code", requestCode);
            newReq.put("requester_id", "u5");
            newReq.put("requester_name", getOrDefault(data, "requester_name", "Community Member"));
            newReq.put("contact_number", getOrDefault(data, "contact_number", "+91 9876543210"));
            newReq.put("category", getOrDefault(data, "category", "Medical Support"));
            newReq.put("title", getOrDefault(data, "title", "Community Help Request"));
            newReq.put("description", getOrDefault(data, "description", "Help needed urgently in the area."));
            newReq.put("location_name", getOrDefault(data, "location_name", "Campus Health Center"));
            newReq.put("latitude", 13.3512 + (Math.random() - 0.5) * 0.02);
            newReq.put("longitude", 80.1408 + (Math.random() - 0.5) * 0.02);
            newReq.put("volunteers_needed", Integer.parseInt(getOrDefault(data, "volunteers_needed", "4")));
            newReq.put("volunteers_joined", 0);
            newReq.put("priority", isEmergency ? "EMERGENCY" : getOrDefault(data, "priority", "HIGH"));
            newReq.put("request_date", getOrDefault(data, "request_date", "2026-10-07"));
            newReq.put("request_time", getOrDefault(data, "request_time", "18:30"));
            newReq.put("image_url", getOrDefault(data, "image_url", "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=500"));
            newReq.put("is_emergency", isEmergency);
            newReq.put("status", "OPEN");
            newReq.put("created_at", LocalDateTime.now().toString());

            helpRequests.add(0, newReq);

            // Broadcast real-time simulated notification to all registered volunteers
            Map<String, Object> notif = new HashMap<>();
            notif.put("id", "n_" + System.currentTimeMillis());
            notif.put("user_id", "u1");
            notif.put("title", isEmergency ? "🚨 EMERGENCY HELP NEEDED" : "🚨 HELP NEEDED NEAR YOU");
            notif.put("message", newReq.get("title") + " at " + newReq.get("location_name") + " (" + newReq.get("volunteers_needed") + " Volunteers Required)");
            notif.put("type", isEmergency ? "EMERGENCY" : "NEW_REQUEST");
            notif.put("related_request_id", id);
            notif.put("is_read", false);
            notif.put("created_at", "Just now");
            notifications.add(0, notif);

            Map<String, Object> res = new HashMap<>();
            res.put("success", true);
            res.put("message", "Help Request Created Successfully");
            res.put("request_id", requestCode);
            res.put("data", newReq);

            sendJsonResponse(exchange, 201, toJson(res));
        } catch (Exception e) {
            sendJsonResponse(exchange, 400, "{\"error\":\"Invalid request parameters: " + e.getMessage() + "\"}");
        }
    }

    private static void handleJoinRequest(HttpExchange exchange, String reqId, String body) throws IOException {
        Map<String, Object> req = findHelpRequest(reqId);
        if (req == null) {
            sendJsonResponse(exchange, 404, "{\"error\":\"Help request not found\"}");
            return;
        }

        Map<String, String> data = parseSimpleJson(body);
        String volunteerId = getOrDefault(data, "volunteer_id", "v1");
        String volunteerName = getOrDefault(data, "volunteer_name", "Mohan Das");

        // Ensure Team Exists
        Map<String, Object> team = teams.get(reqId);
        if (team == null) {
            team = new HashMap<>();
            team.put("id", "t_" + reqId);
            team.put("team_code", "TEAM-" + req.get("request_code"));
            team.put("help_request_id", reqId);
            team.put("leader_volunteer_id", volunteerId);
            team.put("created_at", LocalDateTime.now().toString());
            teams.put(reqId, team);
        }

        // Add to Team Members
        String memberId = "tm_" + System.currentTimeMillis();
        Map<String, Object> member = new HashMap<>();
        member.put("id", memberId);
        member.put("team_id", team.get("id"));
        member.put("volunteer_id", volunteerId);
        member.put("volunteer_name", volunteerName);
        member.put("status", "ACCEPTED");
        member.put("arrived_at", null);
        teamMembers.add(member);

        // Update Volunteers Joined Count
        int currentJoined = (int) req.getOrDefault("volunteers_joined", 0);
        req.put("volunteers_joined", currentJoined + 1);

        // Notify team
        Map<String, Object> notif = new HashMap<>();
        notif.put("id", "n_" + System.currentTimeMillis());
        notif.put("user_id", "u1");
        notif.put("title", "👥 VOLUNTEER JOINED TEAM");
        notif.put("message", volunteerName + " has joined the help request team for " + req.get("request_code"));
        notif.put("type", "VOLUNTEER_JOINED");
        notif.put("related_request_id", reqId);
        notif.put("is_read", false);
        notif.put("created_at", "Just now");
        notifications.add(0, notif);

        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("message", "You have joined this help request.");
        res.put("team", team);
        res.put("volunteers_joined", req.get("volunteers_joined"));
        res.put("volunteers_needed", req.get("volunteers_needed"));
        res.put("team_members", getMembersForRequest(reqId));

        sendJsonResponse(exchange, 200, toJson(res));
    }

    private static void handleSafetyArrival(HttpExchange exchange, String reqId, String body) throws IOException {
        Map<String, Object> req = findHelpRequest(reqId);
        if (req == null) {
            sendJsonResponse(exchange, 404, "{\"error\":\"Help request not found\"}");
            return;
        }

        Map<String, String> data = parseSimpleJson(body);
        String volunteerId = getOrDefault(data, "volunteer_id", "v1");
        String volunteerName = getOrDefault(data, "volunteer_name", "Mohan Das");

        // Update status in Team Members
        boolean updated = false;
        for (Map<String, Object> tm : teamMembers) {
            Map<String, Object> team = teams.get(reqId);
            if (team != null && team.get("id").equals(tm.get("team_id")) && volunteerId.equals(tm.get("volunteer_id"))) {
                tm.put("status", "ARRIVED_SAFELY");
                tm.put("arrived_at", LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm a")));
                updated = true;
                break;
            }
        }

        if (!updated) {
            // Add if missing
            Map<String, Object> team = teams.get(reqId);
            if (team == null) {
                team = new HashMap<>();
                team.put("id", "t_" + reqId);
                team.put("team_code", "TEAM-" + req.get("request_code"));
                team.put("help_request_id", reqId);
                team.put("leader_volunteer_id", volunteerId);
                teams.put(reqId, team);
            }
            Map<String, Object> tm = new HashMap<>();
            tm.put("id", "tm_" + System.currentTimeMillis());
            tm.put("team_id", team.get("id"));
            tm.put("volunteer_id", volunteerId);
            tm.put("volunteer_name", volunteerName);
            tm.put("status", "ARRIVED_SAFELY");
            tm.put("arrived_at", LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm a")));
            teamMembers.add(tm);
        }

        // KEY INNOVATION: Create Safety Broadcast Notification
        Map<String, Object> notif = new HashMap<>();
        notif.put("id", "n_safety_" + System.currentTimeMillis());
        notif.put("user_id", "u1");
        notif.put("title", "🟢 VOLUNTEER REACHED SAFELY");
        notif.put("message", volunteerName + " has reached the help location safely (" + req.get("location_name") + "). Other volunteers can now continue safely to the location.");
        notif.put("type", "ARRIVED_SAFELY");
        notif.put("related_request_id", reqId);
        notif.put("is_read", false);
        notif.put("created_at", "Just now");
        notifications.add(0, notif);

        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("status", "ARRIVED_SAFELY");
        res.put("message", "Safety Arrival Notification Broadcasted Successfully");
        res.put("safety_alert", notif);
        res.put("team_members", getMembersForRequest(reqId));

        sendJsonResponse(exchange, 200, toJson(res));
    }

    private static void handleStartActivity(HttpExchange exchange, String reqId) throws IOException {
        Map<String, Object> req = findHelpRequest(reqId);
        if (req != null) {
            req.put("status", "IN_PROGRESS");
            for (Map<String, Object> tm : getMembersForRequest(reqId)) {
                tm.put("status", "HELPING");
            }

            Map<String, Object> notif = new HashMap<>();
            notif.put("id", "n_start_" + System.currentTimeMillis());
            notif.put("user_id", "u1");
            notif.put("title", "🤝 HELP ACTIVITY IN PROGRESS");
            notif.put("message", "Volunteers have commenced assistance for Request " + req.get("request_code"));
            notif.put("type", "HELP_STARTED");
            notif.put("related_request_id", reqId);
            notif.put("is_read", false);
            notif.put("created_at", "Just now");
            notifications.add(0, notif);

            sendJsonResponse(exchange, 200, "{\"success\":true,\"status\":\"IN_PROGRESS\",\"message\":\"Help activity started successfully.\"}");
        } else {
            sendJsonResponse(exchange, 404, "{\"error\":\"Request not found\"}");
        }
    }

    private static void handleCompleteActivity(HttpExchange exchange, String reqId, String body) throws IOException {
        Map<String, Object> req = findHelpRequest(reqId);
        if (req != null) {
            req.put("status", "COMPLETED");
            List<Map<String, Object>> members = getMembersForRequest(reqId);
            for (Map<String, Object> tm : members) {
                tm.put("status", "COMPLETED");

                // Award Points & Service Hours to Volunteer Profile
                String vId = (String) tm.get("volunteer_id");
                Map<String, Object> v = volunteers.get(vId);
                if (v != null) {
                    int currPoints = (int) v.getOrDefault("points", 0);
                    double currHours = Double.parseDouble(v.getOrDefault("total_hours", 0.0).toString());
                    int currActs = (int) v.getOrDefault("activities_completed", 0);
                    int currPeople = (int) v.getOrDefault("people_helped", 0);

                    v.put("points", currPoints + 20);
                    v.put("total_hours", currHours + 2.0);
                    v.put("activities_completed", currActs + 1);
                    v.put("people_helped", currPeople + 2);
                }
            }

            // Generate completion notification
            Map<String, Object> notif = new HashMap<>();
            notif.put("id", "n_comp_" + System.currentTimeMillis());
            notif.put("user_id", "u1");
            notif.put("title", "✅ HELP SUCCESSFULLY COMPLETED");
            notif.put("message", "Request " + req.get("request_code") + " was completed! +20 Points and +2 Hours awarded to participating volunteers.");
            notif.put("type", "HELP_COMPLETED");
            notif.put("related_request_id", reqId);
            notif.put("is_read", false);
            notif.put("created_at", "Just now");
            notifications.add(0, notif);

            Map<String, Object> res = new HashMap<>();
            res.put("success", true);
            res.put("status", "COMPLETED");
            res.put("request_code", req.get("request_code"));
            res.put("points_awarded", 20);
            res.put("hours_awarded", 2.0);
            res.put("badge_unlocked", "🏅 Community Helper");

            sendJsonResponse(exchange, 200, toJson(res));
        } else {
            sendJsonResponse(exchange, 404, "{\"error\":\"Request not found\"}");
        }
    }

    private static class VolunteersHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCorsHeaders(exchange);
            String method = exchange.getRequestMethod();

            if ("OPTIONS".equalsIgnoreCase(method)) {
                sendJsonResponse(exchange, 204, "");
                return;
            }

            String path = exchange.getRequestURI().getPath();
            String[] parts = path.split("/");
            if (parts.length >= 4) {
                String vId = parts[3];
                Map<String, Object> vol = volunteers.get(vId);

                if (vol != null) {
                    if ("POST".equalsIgnoreCase(method) || "PUT".equalsIgnoreCase(method)) {
                        // Update Profile
                        String body = readBody(exchange);
                        Map<String, String> data = parseSimpleJson(body);

                        if (data.containsKey("phone") || data.containsKey("name") || data.containsKey("email")) {
                            Map<String, Object> user = users.get((String) vol.get("user_id"));
                            if (user != null) {
                                if (data.containsKey("name")) user.put("name", data.get("name"));
                                if (data.containsKey("email")) user.put("email", data.get("email"));
                                if (data.containsKey("phone")) user.put("phone", data.get("phone"));
                            }
                        }

                        if (data.containsKey("department")) vol.put("department", data.get("department"));
                        if (data.containsKey("skills")) vol.put("skills", data.get("skills"));
                        if (data.containsKey("availability")) vol.put("availability", data.get("availability"));
                        if (data.containsKey("address")) vol.put("address", data.get("address"));
                        if (data.containsKey("bio")) vol.put("bio", data.get("bio"));
                        if (data.containsKey("emergency_contact")) vol.put("emergency_contact", data.get("emergency_contact"));

                        Map<String, Object> res = new HashMap<>(vol);
                        res.put("user", users.get(vol.get("user_id")));
                        res.put("badges", badges);
                        res.put("success", true);
                        res.put("message", "Profile updated successfully");
                        sendJsonResponse(exchange, 200, toJson(res));
                    } else {
                        Map<String, Object> res = new HashMap<>(vol);
                        res.put("user", users.get(vol.get("user_id")));
                        res.put("badges", badges);
                        sendJsonResponse(exchange, 200, toJson(res));
                    }
                } else {
                    sendJsonResponse(exchange, 404, "{\"error\":\"Volunteer not found\"}");
                }
            } else {
                sendJsonResponse(exchange, 200, toJson(new ArrayList<>(volunteers.values())));
            }
        }
    }

    private static class CertificatesHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCorsHeaders(exchange);
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendJsonResponse(exchange, 204, "");
                return;
            }

            sendJsonResponse(exchange, 200, toJson(certificates));
        }
    }

    private static class ImpactStatsHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCorsHeaders(exchange);
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendJsonResponse(exchange, 204, "");
                return;
            }

            Map<String, Object> stats = new HashMap<>();
            stats.put("total_volunteers", 300);
            stats.put("total_help_requests", 89);
            stats.put("total_volunteer_hours", "24/7");
            stats.put("people_helped", 200);
            stats.put("college_activities", 12);

            Map<String, Integer> categoryBreakdown = new HashMap<>();
            categoryBreakdown.put("Medical Support", 28);
            categoryBreakdown.put("Blood Donation", 22);
            categoryBreakdown.put("Elderly Assistance", 15);
            categoryBreakdown.put("Education Support", 12);
            categoryBreakdown.put("Food Distribution", 8);
            categoryBreakdown.put("Environmental Activities", 4);
            stats.put("category_breakdown", categoryBreakdown);

            sendJsonResponse(exchange, 200, toJson(stats));
        }
    }

    private static class EventsHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCorsHeaders(exchange);
            String method = exchange.getRequestMethod();
            if ("OPTIONS".equalsIgnoreCase(method)) {
                sendJsonResponse(exchange, 204, "");
                return;
            }

            String path = exchange.getRequestURI().getPath();
            String[] parts = path.split("/");

            if ("DELETE".equalsIgnoreCase(method) || (parts.length >= 4 && "delete".equalsIgnoreCase(parts[parts.length - 1]))) {
                String id = parts.length >= 4 ? parts[3] : "";
                events.removeIf(e -> id.equals(e.get("id")));
                sendJsonResponse(exchange, 200, "{\"success\":true,\"message\":\"College drive deleted successfully\"}");
                return;
            }

            if ("POST".equalsIgnoreCase(method)) {
                String body = readBody(exchange);
                Map<String, String> data = parseSimpleJson(body);

                if (path.endsWith("/join")) {
                    String evId = parts[3];
                    for (Map<String, Object> ev : events) {
                        if (evId.equals(ev.get("id"))) {
                            int reg = Integer.parseInt(ev.getOrDefault("volunteers_registered", "0").toString());
                            ev.put("volunteers_registered", reg + 1);
                            break;
                        }
                    }
                    sendJsonResponse(exchange, 200, "{\"success\":true,\"message\":\"Successfully joined college drive\"}");
                    return;
                }

                Map<String, Object> newEv = new HashMap<>();
                newEv.put("id", "ev_" + System.currentTimeMillis());
                newEv.put("organization_name", getOrDefault(data, "organization_name", "City Tech University"));
                newEv.put("title", getOrDefault(data, "title", "College Volunteer Drive"));
                newEv.put("description", getOrDefault(data, "description", "Student volunteering drive."));
                newEv.put("event_date", getOrDefault(data, "event_date", "2026-10-16"));
                newEv.put("start_time", getOrDefault(data, "start_time", "09:30"));
                newEv.put("end_time", getOrDefault(data, "end_time", "13:30"));
                newEv.put("location", getOrDefault(data, "location", "College Main Hall"));
                newEv.put("category", getOrDefault(data, "category", "Cleanliness"));
                newEv.put("volunteers_capacity", Integer.parseInt(getOrDefault(data, "volunteers_capacity", "50")));
                newEv.put("volunteers_registered", 0);
                newEv.put("organizer_name", getOrDefault(data, "organizer_name", "NSS Coordinator"));
                newEv.put("contact_info", getOrDefault(data, "contact_info", "+91 9876543210"));
                newEv.put("registration_deadline", getOrDefault(data, "registration_deadline", "2026-10-15"));
                newEv.put("status", getOrDefault(data, "status", "Upcoming"));

                events.add(0, newEv);

                sendJsonResponse(exchange, 201, toJson(createMap("success", true, "message", "College drive created successfully", "data", newEv)));
            } else {
                sendJsonResponse(exchange, 200, toJson(events));
            }
        }
    }

    private static class NotificationsHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCorsHeaders(exchange);
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendJsonResponse(exchange, 204, "");
                return;
            }

            if ("POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                for (Map<String, Object> n : notifications) {
                    n.put("is_read", true);
                }
                sendJsonResponse(exchange, 200, "{\"success\":true,\"message\":\"All notifications marked as read\"}");
            } else {
                sendJsonResponse(exchange, 200, toJson(notifications));
            }
        }
    }

    private static class EmergencyHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCorsHeaders(exchange);
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendJsonResponse(exchange, 204, "");
                return;
            }

            if ("POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                String body = readBody(exchange);
                Map<String, String> data = parseSimpleJson(body);
                data.put("priority", "EMERGENCY");
                data.put("is_emergency", "true");
                if (!data.containsKey("category")) data.put("category", "Emergency Support");

                handleCreateRequest(exchange, body);
            }
        }
    }

    private static class AdminMetricsHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCorsHeaders(exchange);
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendJsonResponse(exchange, 204, "");
                return;
            }

            Map<String, Object> res = new HashMap<>();
            res.put("total_users", users.size() + 120);
            res.put("active_volunteers", volunteers.size() + 85);
            res.put("active_requests", helpRequests.size());
            res.put("completed_requests", 498);
            res.put("total_impact_hours", 3200);
            res.put("requests", helpRequests);
            res.put("volunteers", new ArrayList<>(volunteers.values()));
            res.put("certificates_issued", certificates.size() + 140);

            sendJsonResponse(exchange, 200, toJson(res));
        }
    }

    private static class DemoResetHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCorsHeaders(exchange);
            initSeedData();
            sendJsonResponse(exchange, 200, "{\"success\":true,\"message\":\"Demo data reset successfully.\"}");
        }
    }

    // =========================================================
    // STATIC FILE SERVER
    // =========================================================
    private static class StaticFileHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String pathStr = exchange.getRequestURI().getPath();
            if (pathStr.equals("/") || pathStr.isEmpty()) {
                pathStr = "/index.html";
            }

            Path filePath = Paths.get(PUBLIC_DIR, pathStr);
            if (!Files.exists(filePath) || Files.isDirectory(filePath)) {
                // Fallback to index.html for single-page routing
                filePath = Paths.get(PUBLIC_DIR, "index.html");
            }

            if (Files.exists(filePath)) {
                byte[] fileBytes = Files.readAllBytes(filePath);
                String contentType = getContentType(filePath.toString());
                exchange.getResponseHeaders().set("Content-Type", contentType);
                addCorsHeaders(exchange);
                exchange.sendResponseHeaders(200, fileBytes.length);
                try (OutputStream os = exchange.getResponseBody()) {
                    os.write(fileBytes);
                }
            } else {
                String error = "<html><body><h1>404 Not Found</h1><p>HELPHUB frontend root missing.</p></body></html>";
                exchange.getResponseHeaders().set("Content-Type", "text/html");
                exchange.sendResponseHeaders(404, error.length());
                try (OutputStream os = exchange.getResponseBody()) {
                    os.write(error.getBytes());
                }
            }
        }
    }

    // =========================================================
    // HELPER FUNCTIONS & UTILITIES
    // =========================================================
    private static Map<String, Object> findHelpRequest(String reqId) {
        for (Map<String, Object> req : helpRequests) {
            if (reqId.equalsIgnoreCase((String) req.get("id")) || reqId.equalsIgnoreCase((String) req.get("request_code"))) {
                return req;
            }
        }
        return null;
    }

    private static List<Map<String, Object>> getMembersForRequest(String reqId) {
        List<Map<String, Object>> result = new ArrayList<>();
        Map<String, Object> team = teams.get(reqId);
        if (team != null) {
            String teamId = (String) team.get("id");
            for (Map<String, Object> tm : teamMembers) {
                if (teamId.equals(tm.get("team_id"))) {
                    result.add(tm);
                }
            }
        }
        return result;
    }

    private static String getOrDefault(Map<String, String> map, String key, String def) {
        return (map != null && map.containsKey(key) && !map.get(key).trim().isEmpty()) ? map.get(key).trim() : def;
    }

    private static Map<String, Object> createMap(Object... keyValues) {
        Map<String, Object> map = new HashMap<>();
        for (int i = 0; i < keyValues.length; i += 2) {
            map.put((String) keyValues[i], keyValues[i + 1]);
        }
        return map;
    }

    private static String readBody(HttpExchange exchange) throws IOException {
        try (InputStream is = exchange.getRequestBody();
             ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            byte[] buffer = new byte[1024];
            int len;
            while ((len = is.read(buffer)) != -1) {
                baos.write(buffer, 0, len);
            }
            return baos.toString(StandardCharsets.UTF_8.name());
        }
    }

    private static void sendJsonResponse(HttpExchange exchange, int statusCode, String responseJson) throws IOException {
        addCorsHeaders(exchange);
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
        byte[] bytes = responseJson.getBytes(StandardCharsets.UTF_8);
        exchange.sendResponseHeaders(statusCode, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }

    private static void addCorsHeaders(HttpExchange exchange) {
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    }

    private static String getContentType(String filename) {
        if (filename.endsWith(".html")) return "text/html; charset=UTF-8";
        if (filename.endsWith(".css")) return "text/css; charset=UTF-8";
        if (filename.endsWith(".js")) return "application/javascript; charset=UTF-8";
        if (filename.endsWith(".json")) return "application/json";
        if (filename.endsWith(".png")) return "image/png";
        if (filename.endsWith(".jpg") || filename.endsWith(".jpeg")) return "image/jpeg";
        if (filename.endsWith(".svg")) return "image/svg+xml";
        return "text/plain";
    }

    // Lightweight JSON Parser for simple key-value objects
    private static Map<String, String> parseSimpleJson(String json) {
        Map<String, String> map = new HashMap<>();
        if (json == null || json.trim().isEmpty()) return map;
        String clean = json.trim();
        if (clean.startsWith("{")) clean = clean.substring(1);
        if (clean.endsWith("}")) clean = clean.substring(0, clean.length() - 1);

        String[] pairs = clean.split(",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)");
        for (String pair : pairs) {
            String[] keyValue = pair.split(":(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)", 2);
            if (keyValue.length == 2) {
                String k = keyValue[0].trim().replaceAll("^\"|\"$", "");
                String v = keyValue[1].trim().replaceAll("^\"|\"$", "");
                map.put(k, v);
            }
        }
        return map;
    }

    // Lightweight JSON Serializer for Maps, Lists, Strings, Numbers, Booleans
    private static String toJson(Object obj) {
        if (obj == null) return "null";
        if (obj instanceof String) {
            return "\"" + escapeJson((String) obj) + "\"";
        }
        if (obj instanceof Number || obj instanceof Boolean) {
            return obj.toString();
        }
        if (obj instanceof Map) {
            Map<?, ?> map = (Map<?, ?>) obj;
            StringBuilder sb = new StringBuilder("{");
            boolean first = true;
            for (Map.Entry<?, ?> entry : map.entrySet()) {
                if (!first) sb.append(",");
                sb.append("\"").append(escapeJson(entry.getKey().toString())).append("\":");
                sb.append(toJson(entry.getValue()));
                first = false;
            }
            sb.append("}");
            return sb.toString();
        }
        if (obj instanceof List) {
            List<?> list = (List<?>) obj;
            StringBuilder sb = new StringBuilder("[");
            boolean first = true;
            for (Object item : list) {
                if (!first) sb.append(",");
                sb.append(toJson(item));
                first = false;
            }
            sb.append("]");
            return sb.toString();
        }
        return "\"" + escapeJson(obj.toString()) + "\"";
    }

    private static String escapeJson(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\b", "\\b")
                .replace("\f", "\\f")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }
}
