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

import java.security.MessageDigest;

/**
 * HELPHUB - Main Java REST Backend Server
 * Connects society, students, colleges, NGOs, and volunteers.
 * Runs on standard JDK without external framework dependencies.
 */
public class HelpHubServer {

    private static final String ADMIN_KEY = "cse@1234";
    private static final int PORT = 8080;
    private static final String PUBLIC_DIR = "public";

    // In-Memory Data Store (Initialized with data.sql seed records & expandable)
    private static final Map<String, Map<String, Object>> users = new ConcurrentHashMap<>();
    private static final Map<String, Map<String, Object>> volunteers = new ConcurrentHashMap<>();
    private static final Map<String, Map<String, Object>> members = new ConcurrentHashMap<>();
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
            server.createContext("/api/auth", new AuthHandler());
            server.createContext("/api/requests", new RequestsHandler());
            server.createContext("/api/volunteers", new VolunteersHandler());
            server.createContext("/api/certificates", new CertificatesHandler());
            server.createContext("/api/impact/stats", new ImpactStatsHandler());
            server.createContext("/api/events", new EventsHandler());
            server.createContext("/api/notifications", new NotificationsHandler());
            server.createContext("/api/emergency", new EmergencyHandler());
            server.createContext("/api/admin/metrics", new AdminMetricsHandler());
            server.createContext("/api/admin/members", new AdminMembersHandler());
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
        members.clear();
        helpRequests.clear();
        teams.clear();
        teamMembers.clear();
        notifications.clear();
        certificates.clear();
        events.clear();
        badges.clear();

        // Seed Registered Members
        Map<String, Object> m1 = createMap(
            "id", "MEM-101", "member_id", "MEM-101", "name", "Mohan Das", "email", "mohan@campus.edu",
            "phone", "+91 9876543210", "role", "Volunteer", "registration_date", "05 Oct 2026, 09:00 AM",
            "last_login", "07 Oct 2026, 08:30 PM", "status", "Offline", "password_hash", hashPassword("mohan123"),
            "college_name", "City Tech University", "department", "Computer Science & Engineering",
            "year_of_study", "3rd Year", "points", 850, "total_hours", 42.0, "activities_completed", 12, "people_helped", 18,
            "skills", "First Aid, CPR Certified, Emergency Management, Tutoring",
            "bio", "Dedicated student volunteer committed to community health drives and campus social activities.",
            "emergency_contact", "+91 9876543299", "gender", "Male"
        );
        Map<String, Object> m2 = createMap(
            "id", "MEM-102", "member_id", "MEM-102", "name", "Raj Kumar", "email", "raj@campus.edu",
            "phone", "+91 9876543211", "role", "Volunteer", "registration_date", "05 Oct 2026, 09:15 AM",
            "last_login", "07 Oct 2026, 08:45 PM", "status", "Offline", "password_hash", hashPassword("raj123"),
            "college_name", "City Tech University", "department", "Electronics & Comm",
            "year_of_study", "3rd Year", "points", 620, "total_hours", 31.5, "activities_completed", 9, "people_helped", 14,
            "skills", "Blood Donation Coordinator, Crowd Management",
            "bio", "Active NSS member and blood donation coordinator.",
            "emergency_contact", "+91 9876543298", "gender", "Male"
        );
        Map<String, Object> m3 = createMap(
            "id", "MEM-103", "member_id", "MEM-103", "name", "Santhosh V", "email", "santhosh@campus.edu",
            "phone", "+91 9876543212", "role", "Volunteer", "registration_date", "06 Oct 2026, 10:00 AM",
            "last_login", "07 Oct 2026, 09:10 PM", "status", "Offline", "password_hash", hashPassword("santhosh123"),
            "college_name", "City Tech University", "department", "Electrical Eng",
            "year_of_study", "2nd Year", "points", 410, "total_hours", 22.0, "activities_completed", 6, "people_helped", 9,
            "skills", "Logistics & Food Distribution",
            "bio", "Passionate about hunger relief and environmental drives.",
            "emergency_contact", "+91 9876543297", "gender", "Male"
        );
        Map<String, Object> m4 = createMap(
            "id", "MEM-104", "member_id", "MEM-104", "name", "Arun Prakash", "email", "arun@campus.edu",
            "phone", "+91 9876543213", "role", "Student", "registration_date", "06 Oct 2026, 11:30 AM",
            "last_login", "07 Oct 2026, 09:30 PM", "status", "Offline", "password_hash", hashPassword("arun123"),
            "college_name", "City Tech University", "department", "Mechanical Eng",
            "year_of_study", "1st Year", "points", 290, "total_hours", 15.0, "activities_completed", 4, "people_helped", 6,
            "skills", "Disaster Relief, Driving",
            "bio", "Enthusiastic student volunteer ready for physical and community support.",
            "emergency_contact", "+91 9876543296", "gender", "Male"
        );

        Map<String, Object> m5 = createMap(
            "id", "MEM-105", "member_id", "MEM-105", "name", "Priya Sharma", "email", "priya@campus.edu",
            "phone", "+91 9876543214", "role", "Volunteer", "registration_date", "06 Oct 2026, 12:00 PM",
            "last_login", "07 Oct 2026, 09:40 PM", "status", "Offline", "password_hash", hashPassword("priya123"),
            "college_name", "City Tech University", "department", "Biotechnology & Healthcare",
            "year_of_study", "3rd Year", "points", 540, "total_hours", 28.0, "activities_completed", 8, "people_helped", 15,
            "skills", "Medical Aid, First Aid, Patient Care, Community Service",
            "bio", "Passionate student volunteer leading campus blood donation drives and healthcare outreach.",
            "emergency_contact", "+91 9876543295", "gender", "Female"
        );

        members.put("MEM-101", m1);
        members.put("MEM-102", m2);
        members.put("MEM-103", m3);
        members.put("MEM-104", m4);
        members.put("MEM-105", m5);

        // Seed Users
        Map<String, Object> u1 = createMap("id", "u1", "name", "Mohan Das", "email", "mohan@campus.edu", "phone", "+91 9876543210", "role", "VOLUNTEER", "gender", "Male", "college_name", "City Tech University", "avatar", "img/avatar-male.svg");
        Map<String, Object> u2 = createMap("id", "u2", "name", "Raj Kumar", "email", "raj@campus.edu", "phone", "+91 9876543211", "role", "VOLUNTEER", "gender", "Male", "college_name", "City Tech University", "avatar", "img/avatar-male.svg");
        Map<String, Object> u3 = createMap("id", "u3", "name", "Santhosh V", "email", "santhosh@campus.edu", "phone", "+91 9876543212", "role", "VOLUNTEER", "gender", "Male", "college_name", "City Tech University", "avatar", "img/avatar-male.svg");
        Map<String, Object> u4 = createMap("id", "u4", "name", "Arun Prakash", "email", "arun@campus.edu", "phone", "+91 9876543213", "role", "VOLUNTEER", "gender", "Male", "college_name", "City Tech University", "avatar", "img/avatar-male.svg");
        Map<String, Object> u5 = createMap("id", "u5", "name", "Priya Sharma", "email", "priya@campus.edu", "phone", "+91 9876543214", "role", "VOLUNTEER", "gender", "Female", "college_name", "City Tech University", "avatar", "img/avatar-female.svg");

        users.put("u1", u1); users.put("u2", u2); users.put("u3", u3); users.put("u4", u4); users.put("u5", u5);

        // Seed Volunteers
        Map<String, Object> v1 = createMap("id", "v1", "user_id", "u1", "name", "Mohan Das", "email", "mohan@campus.edu", "phone", "+91 9876543210", "role", "Volunteer", "gender", "Male", "student_id", "STU2023CSE042", "department", "Computer Science & Engineering", "college_name", "City Tech University", "year_of_study", "3rd Year", "points", 850, "total_hours", 42.0, "activities_completed", 12, "people_helped", 18, "safety_rating", 5.0, "is_available", true, "skills", "First Aid, CPR Certified, Emergency Management, Tutoring", "availability", "Weekends, Evenings & On-Call Emergencies", "address", "Room 402, Campus Block B Hostel", "bio", "Dedicated student volunteer committed to community health drives, senior citizen support, and campus social activities.", "emergency_contact", "+91 9876543299", "drives_joined", 4, "avatar", "img/avatar-male.svg");
        Map<String, Object> v2 = createMap("id", "v2", "user_id", "u2", "name", "Raj Kumar", "email", "raj@campus.edu", "phone", "+91 9876543211", "role", "Volunteer", "gender", "Male", "student_id", "STU2023ECE018", "department", "Electronics & Comm", "college_name", "City Tech University", "year_of_study", "3rd Year", "points", 620, "total_hours", 31.5, "activities_completed", 9, "people_helped", 14, "safety_rating", 4.9, "is_available", true, "skills", "Blood Donation Coordinator, Crowd Management", "availability", "Saturday & Sunday", "address", "Campus Block A Hostel", "bio", "Active NSS member and blood donation coordinator.", "emergency_contact", "+91 9876543298", "drives_joined", 3, "avatar", "img/avatar-male.svg");
        Map<String, Object> v3 = createMap("id", "v3", "user_id", "u3", "name", "Santhosh V", "email", "santhosh@campus.edu", "phone", "+91 9876543212", "role", "Volunteer", "gender", "Male", "student_id", "STU2023EEE055", "department", "Electrical Eng", "college_name", "City Tech University", "year_of_study", "2nd Year", "points", 410, "total_hours", 22.0, "activities_completed", 6, "people_helped", 9, "safety_rating", 5.0, "is_available", true, "skills", "Logistics & Food Distribution", "availability", "Flexible Hours", "address", "City Tech Hostel C", "bio", "Passionate about hunger relief and environmental drives.", "emergency_contact", "+91 9876543297", "drives_joined", 2, "avatar", "img/avatar-male.svg");
        Map<String, Object> v4 = createMap("id", "v4", "user_id", "u4", "name", "Arun Prakash", "email", "arun@campus.edu", "phone", "+91 9876543213", "role", "Student", "gender", "Male", "student_id", "STU2023MECH012", "department", "Mechanical Eng", "college_name", "City Tech University", "year_of_study", "1st Year", "points", 290, "total_hours", 15.0, "activities_completed", 4, "people_helped", 6, "safety_rating", 4.8, "is_available", true, "skills", "Disaster Relief, Driving", "availability", "Evenings", "address", "Campus Hostels", "bio", "Enthusiastic student volunteer ready for physical and community support.", "emergency_contact", "+91 9876543296", "drives_joined", 1, "avatar", "img/avatar-male.svg");
        Map<String, Object> v5 = createMap("id", "v5", "user_id", "u5", "name", "Priya Sharma", "email", "priya@campus.edu", "phone", "+91 9876543214", "role", "Volunteer", "gender", "Female", "student_id", "STU2023BIO029", "department", "Biotechnology & Healthcare", "college_name", "City Tech University", "year_of_study", "3rd Year", "points", 540, "total_hours", 28.0, "activities_completed", 8, "people_helped", 15, "safety_rating", 5.0, "is_available", true, "skills", "Medical Aid, First Aid, Patient Care", "availability", "Weekdays & Health Camps", "address", "Campus Girls Hostel Block A", "bio", "Passionate student volunteer leading campus blood donation drives and healthcare outreach.", "emergency_contact", "+91 9876543295", "drives_joined", 3, "avatar", "img/avatar-female.svg");

        volunteers.put("v1", v1); volunteers.put("v2", v2); volunteers.put("v3", v3); volunteers.put("v4", v4); volunteers.put("v5", v5);

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

            String[] parts = path.split("/");

            // 1. DELETE Request (DELETE /api/requests/{id} or POST /api/requests/{id}/delete)
            if ("DELETE".equalsIgnoreCase(method) || (parts.length >= 4 && "delete".equalsIgnoreCase(parts[parts.length - 1]))) {
                String reqId = parts.length >= 4 ? parts[3] : "";
                handleDeleteRequest(exchange, reqId);
                return;
            }

            // 2. EDIT Request (PUT /api/requests/{id} or POST /api/requests/{id}/edit)
            if ("PUT".equalsIgnoreCase(method) || (parts.length >= 4 && "edit".equalsIgnoreCase(parts[parts.length - 1]))) {
                String reqId = parts.length >= 4 ? parts[3] : "";
                String body = readBody(exchange);
                handleEditRequest(exchange, reqId, body);
                return;
            }

            if ("GET".equalsIgnoreCase(method)) {
                // Check if path is /api/requests/{id}
                if (parts.length >= 4 && !parts[3].isEmpty()) {
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

    private static void handleDeleteRequest(HttpExchange exchange, String reqId) throws IOException {
        if (!isAuthorizedAdmin(exchange)) {
            sendJsonResponse(exchange, 403, "{\"success\":false,\"error\":\"Forbidden: Admin privileges required to delete requests.\"}");
            return;
        }

        Map<String, Object> req = findHelpRequest(reqId);
        if (req == null) {
            sendJsonResponse(exchange, 404, "{\"success\":false,\"error\":\"Help request not found.\"}");
            return;
        }

        String targetId = (String) req.get("id");
        helpRequests.removeIf(r -> targetId.equals(r.get("id")));
        teams.remove(targetId);
        notifications.removeIf(n -> targetId.equals(n.get("related_request_id")));

        sendJsonResponse(exchange, 200, "{\"success\":true,\"message\":\"Help request deleted successfully.\"}");
    }

    private static void handleEditRequest(HttpExchange exchange, String reqId, String body) throws IOException {
        if (!isAuthorizedAdmin(exchange)) {
            sendJsonResponse(exchange, 403, "{\"success\":false,\"error\":\"Forbidden: Admin privileges required to edit requests.\"}");
            return;
        }

        Map<String, Object> req = findHelpRequest(reqId);
        if (req == null) {
            sendJsonResponse(exchange, 404, "{\"success\":false,\"error\":\"Help request not found.\"}");
            return;
        }

        Map<String, String> data = parseSimpleJson(body);

        if (data.containsKey("title") && !data.get("title").trim().isEmpty()) {
            req.put("title", data.get("title").trim());
        }
        if (data.containsKey("description") && !data.get("description").trim().isEmpty()) {
            req.put("description", data.get("description").trim());
        }
        if (data.containsKey("category") && !data.get("category").trim().isEmpty()) {
            req.put("category", data.get("category").trim());
        }
        if (data.containsKey("location_name") && !data.get("location_name").trim().isEmpty()) {
            req.put("location_name", data.get("location_name").trim());
        }
        if (data.containsKey("priority") && !data.get("priority").trim().isEmpty()) {
            String p = data.get("priority").trim().toUpperCase();
            req.put("priority", p);
            req.put("is_emergency", "EMERGENCY".equalsIgnoreCase(p));
        }
        if (data.containsKey("is_emergency")) {
            req.put("is_emergency", "true".equalsIgnoreCase(data.get("is_emergency")));
        }
        if (data.containsKey("status") && !data.get("status").trim().isEmpty()) {
            req.put("status", data.get("status").trim().toUpperCase());
        }
        if (data.containsKey("contact_number") && !data.get("contact_number").trim().isEmpty()) {
            req.put("contact_number", data.get("contact_number").trim());
        }
        if (data.containsKey("requester_name") && !data.get("requester_name").trim().isEmpty()) {
            req.put("requester_name", data.get("requester_name").trim());
        }
        if (data.containsKey("volunteers_needed")) {
            try {
                req.put("volunteers_needed", Integer.parseInt(data.get("volunteers_needed").trim()));
            } catch (Exception ignored) {}
        }
        if (data.containsKey("assigned_volunteer")) {
            String assigned = data.get("assigned_volunteer").trim();
            req.put("assigned_volunteer", assigned);
            String tId = (String) req.get("id");
            Map<String, Object> team = teams.get(tId);
            if (team == null && !assigned.isEmpty()) {
                team = createMap("id", "t_" + System.currentTimeMillis(), "team_code", "TEAM-" + req.get("request_code"), "help_request_id", tId, "assigned_to", assigned, "created_at", LocalDateTime.now().toString());
                teams.put(tId, team);
            } else if (team != null) {
                team.put("assigned_to", assigned);
            }
        }

        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("message", "Help request updated successfully.");
        res.put("data", req);

        sendJsonResponse(exchange, 200, toJson(res));
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

    private static class AuthHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCorsHeaders(exchange);
            String method = exchange.getRequestMethod();
            if ("OPTIONS".equalsIgnoreCase(method)) {
                sendJsonResponse(exchange, 204, "");
                return;
            }

            String path = exchange.getRequestURI().getPath();

            if ("POST".equalsIgnoreCase(method)) {
                String body = readBody(exchange);
                Map<String, String> data = parseSimpleJson(body);

                // --- 1. LOGOUT ENDPOINT ---
                if (path.endsWith("/logout")) {
                    String email = getOrDefault(data, "email", "").toLowerCase().trim();
                    String id = getOrDefault(data, "id", getOrDefault(data, "member_id", "")).trim();

                    for (Map<String, Object> m : members.values()) {
                        if ((!email.isEmpty() && email.equalsIgnoreCase(String.valueOf(m.get("email")).trim())) ||
                            (!id.isEmpty() && id.equalsIgnoreCase(String.valueOf(m.get("id")).trim()))) {
                            m.put("status", "Offline");
                            break;
                        }
                    }
                    sendJsonResponse(exchange, 200, "{\"success\":true,\"message\":\"Logged out successfully\"}");
                    return;
                }

                // --- 2. REGISTRATION ENDPOINT ---
                if (path.endsWith("/register")) {
                    String name = getOrDefault(data, "name", "").trim();
                    String email = getOrDefault(data, "email", "").toLowerCase().trim();
                    String phone = getOrDefault(data, "phone", "").trim();
                    String role = getOrDefault(data, "role", "Volunteer").trim();
                    String password = getOrDefault(data, "password", "").trim();

                    if (name.isEmpty() || email.isEmpty() || phone.isEmpty() || password.isEmpty()) {
                        sendJsonResponse(exchange, 400, "{\"success\":false,\"error\":\"Please fill in all required registration fields.\"}");
                        return;
                    }

                    if (role.equalsIgnoreCase("student")) role = "Student";
                    else role = "Volunteer";

                    // Check if already registered
                    for (Map<String, Object> m : members.values()) {
                        if (email.equalsIgnoreCase(String.valueOf(m.get("email")).trim())) {
                            sendJsonResponse(exchange, 409, "{\"success\":false,\"error\":\"An account with this email is already registered. Please log in.\"}");
                            return;
                        }
                    }

                    String nowStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a"));
                    String memId = "MEM-" + (100 + members.size() + 1);
                    String gender = getOrDefault(data, "gender", "").trim();
                    if (gender.isEmpty() || (!gender.equalsIgnoreCase("Male") && !gender.equalsIgnoreCase("Female"))) {
                        sendJsonResponse(exchange, 400, "{\"success\":false,\"error\":\"Gender is required. Please select Male or Female.\"}");
                        return;
                    }
                    if (gender.equalsIgnoreCase("female")) gender = "Female";
                    else gender = "Male";
                    String defaultAvatar = gender.equalsIgnoreCase("Female")
                        ? "img/avatar-female.svg"
                        : "img/avatar-male.svg";

                    Map<String, Object> newMember = createMap(
                        "id", memId,
                        "member_id", memId,
                        "name", name,
                        "email", email,
                        "phone", phone,
                        "role", role,
                        "gender", gender,
                        "avatar", defaultAvatar,
                        "registration_date", nowStr,
                        "last_login", nowStr,
                        "status", "Active",
                        "password_hash", hashPassword(password),
                        "college_name", getOrDefault(data, "college_name", "City Tech University"),
                        "department", getOrDefault(data, "department", "General Studies"),
                        "year_of_study", getOrDefault(data, "year_of_study", "1st Year"),
                        "points", 50,
                        "total_hours", 0.0,
                        "activities_completed", 0,
                        "people_helped", 0,
                        "safety_rating", 5.0,
                        "skills", "",
                        "bio", "",
                        "emergency_contact", ""
                    );
                    members.put(memId, newMember);

                    // Sync user & volunteer maps
                    String uId = "u_" + System.currentTimeMillis();
                    Map<String, Object> newUser = createMap(
                        "id", uId,
                        "name", name,
                        "email", email,
                        "phone", phone,
                        "role", role,
                        "gender", gender,
                        "college_name", newMember.get("college_name"),
                        "avatar", defaultAvatar
                    );
                    users.put(uId, newUser);

                    String vId = "v_" + System.currentTimeMillis();
                    Map<String, Object> newVol = createMap(
                        "id", vId,
                        "user_id", uId,
                        "name", name,
                        "email", email,
                        "phone", phone,
                        "gender", gender,
                        "student_id", "STU" + (202600 + volunteers.size() + 1),
                        "department", newMember.get("department"),
                        "year_of_study", newMember.get("year_of_study"),
                        "role", role,
                        "college_name", newMember.get("college_name"),
                        "points", 50,
                        "total_hours", 0.0,
                        "activities_completed", 0,
                        "people_helped", 0,
                        "safety_rating", 5.0,
                        "is_available", true,
                        "skills", "",
                        "areas_of_interest", "",
                        "availability", "",
                        "preferred_categories", "",
                        "address", "",
                        "bio", "",
                        "emergency_contact", "",
                        "drives_joined", 0,
                        "avatar", defaultAvatar
                    );
                    volunteers.put(vId, newVol);

                    Map<String, Object> res = new HashMap<>();
                    res.put("success", true);
                    res.put("message", "Registration successful. Welcome to HELPHUB!");
                    res.put("member", sanitizeMember(newMember));
                    res.put("user", newUser);
                    res.put("volunteer", newVol);

                    sendJsonResponse(exchange, 201, toJson(res));
                    return;
                }

                // --- 3. LOGIN AUTHENTICATION ENDPOINT ---
                String email = getOrDefault(data, "email", "").toLowerCase().trim();
                String password = getOrDefault(data, "password", "").trim();

                // Validation: Check empty credentials
                if (email.isEmpty() || password.isEmpty()) {
                    sendJsonResponse(exchange, 400, "{\"success\":false,\"error\":\"Please enter both email address and password.\"}");
                    return;
                }

                // Step 1: Find existing registered member by email
                Map<String, Object> member = null;
                for (Map<String, Object> m : members.values()) {
                    if (email.equalsIgnoreCase(String.valueOf(m.get("email")).trim())) {
                        member = m;
                        break;
                    }
                }

                // If user is not found in database -> Do NOT create account, return error
                if (member == null) {
                    sendJsonResponse(exchange, 404, "{\"success\":false,\"error\":\"User not found. Please register before logging in.\"}");
                    return;
                }

                // Step 2: Validate password hash
                String storedHash = (String) member.get("password_hash");
                String enteredHash = hashPassword(password);

                boolean passwordMatches = false;
                if (storedHash != null && !storedHash.isEmpty()) {
                    passwordMatches = storedHash.equals(enteredHash) || storedHash.equals(password);
                }

                // If password does not match -> return error
                if (!passwordMatches) {
                    sendJsonResponse(exchange, 401, "{\"success\":false,\"error\":\"Incorrect password. Please try again.\"}");
                    return;
                }

                // Step 3: Login Success -> update last_login and status
                String nowStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a"));
                member.put("last_login", nowStr);
                member.put("status", "Active");

                String memberName = String.valueOf(member.get("name"));
                String memberRole = String.valueOf(member.get("role"));
                String memberPhone = String.valueOf(member.get("phone"));

                String memberGender = (String) member.getOrDefault("gender", "Male");
                String customAvatar = (String) member.get("custom_avatar");
                String defaultAvatar = memberGender.equalsIgnoreCase("Female") ? "img/avatar-female.svg" : "img/avatar-male.svg";
                String effectiveAvatar = (customAvatar != null && !customAvatar.isEmpty()) ? customAvatar : defaultAvatar;

                // Sync linked user
                Map<String, Object> foundUser = null;
                for (Map<String, Object> u : users.values()) {
                    if (email.equalsIgnoreCase(String.valueOf(u.get("email")).trim())) {
                        foundUser = u;
                        break;
                    }
                }
                if (foundUser == null) {
                    foundUser = createMap(
                        "id", member.get("id"),
                        "name", memberName,
                        "email", email,
                        "phone", memberPhone,
                        "role", memberRole,
                        "gender", memberGender,
                        "college_name", member.getOrDefault("college_name", "City Tech University"),
                        "avatar", effectiveAvatar
                    );
                    if (customAvatar != null && !customAvatar.isEmpty()) {
                        foundUser.put("custom_avatar", customAvatar);
                    }
                    users.put(String.valueOf(member.get("id")), foundUser);
                } else {
                    foundUser.put("gender", memberGender);
                    foundUser.put("avatar", effectiveAvatar);
                    if (customAvatar != null && !customAvatar.isEmpty()) {
                        foundUser.put("custom_avatar", customAvatar);
                    } else {
                        foundUser.remove("custom_avatar");
                    }
                }

                // Sync linked volunteer
                Map<String, Object> vol = null;
                for (Map<String, Object> v : volunteers.values()) {
                    if (email.equalsIgnoreCase(String.valueOf(v.get("email")).trim()) || foundUser.get("id").equals(v.get("user_id"))) {
                        vol = v;
                        break;
                    }
                }
                if (vol == null) {
                    String vId = "v_" + System.currentTimeMillis();
                    vol = createMap(
                        "id", vId,
                        "user_id", foundUser.get("id"),
                        "name", memberName,
                        "email", email,
                        "phone", memberPhone,
                        "gender", memberGender,
                        "student_id", "STU" + (202600 + volunteers.size() + 1),
                        "department", member.getOrDefault("department", "General Studies"),
                        "year_of_study", member.getOrDefault("year_of_study", "1st Year"),
                        "role", memberRole,
                        "college_name", member.getOrDefault("college_name", "City Tech University"),
                        "points", member.getOrDefault("points", 50),
                        "total_hours", member.getOrDefault("total_hours", 0.0),
                        "activities_completed", member.getOrDefault("activities_completed", 0),
                        "people_helped", member.getOrDefault("people_helped", 0),
                        "safety_rating", 5.0,
                        "is_available", true,
                        "skills", member.getOrDefault("skills", ""),
                        "areas_of_interest", "",
                        "availability", "",
                        "preferred_categories", "",
                        "address", "",
                        "bio", member.getOrDefault("bio", ""),
                        "emergency_contact", member.getOrDefault("emergency_contact", ""),
                        "drives_joined", 0,
                        "avatar", effectiveAvatar
                    );
                    if (customAvatar != null && !customAvatar.isEmpty()) {
                        vol.put("custom_avatar", customAvatar);
                    }
                    volunteers.put(vId, vol);
                } else {
                    // Update volunteer details from member
                    vol.put("name", memberName);
                    vol.put("role", memberRole);
                    vol.put("phone", memberPhone);
                    vol.put("gender", memberGender);
                    vol.put("avatar", effectiveAvatar);
                    if (customAvatar != null && !customAvatar.isEmpty()) {
                        vol.put("custom_avatar", customAvatar);
                    } else {
                        vol.remove("custom_avatar");
                    }
                }

                Map<String, Object> res = new HashMap<>();
                res.put("success", true);
                res.put("message", "Login successful");
                res.put("member", sanitizeMember(member));
                res.put("user", foundUser);
                res.put("volunteer", vol);

                sendJsonResponse(exchange, 200, toJson(res));
            } else {
                sendJsonResponse(exchange, 405, "{\"error\":\"Method not allowed\"}");
            }
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
                // Lookup by ID or user_id
                Map<String, Object> vol = volunteers.get(vId);
                if (vol == null) {
                    for (Map<String, Object> v : volunteers.values()) {
                        if (vId.equals(v.get("user_id")) || vId.equals(v.get("id"))) {
                            vol = v;
                            break;
                        }
                    }
                }

                if (vol != null) {
                    String userId = (String) vol.get("user_id");
                    Map<String, Object> user = users.get(userId);

                    if ("POST".equalsIgnoreCase(method) || "PUT".equalsIgnoreCase(method)) {
                        // Security check: Only the account owner or admin can edit
                        if (!isAuthorizedAdmin(exchange)) {
                            String headerUserId = exchange.getRequestHeaders().getFirst("X-User-Id");
                            String headerUserEmail = exchange.getRequestHeaders().getFirst("X-User-Email");
                            boolean isOwner = false;
                            if (headerUserId != null && (headerUserId.equalsIgnoreCase(vId) || headerUserId.equalsIgnoreCase(userId) || headerUserId.equalsIgnoreCase((String)vol.get("id")))) {
                                isOwner = true;
                            }
                            if (headerUserEmail != null && headerUserEmail.equalsIgnoreCase((String)vol.get("email"))) {
                                isOwner = true;
                            }
                            if (!isOwner) {
                                sendJsonResponse(exchange, 403, "{\"success\":false,\"error\":\"Security violation: Each user can edit only their own profile.\"}");
                                return;
                            }
                        }

                        // Update Profile
                        String body = readBody(exchange);
                        Map<String, String> data = parseSimpleJson(body);

                        if (data.containsKey("name") && !data.get("name").trim().isEmpty()) {
                            vol.put("name", data.get("name").trim());
                            if (user != null) user.put("name", data.get("name").trim());
                        }
                        if (data.containsKey("email") && !data.get("email").trim().isEmpty()) {
                            vol.put("email", data.get("email").trim());
                            if (user != null) user.put("email", data.get("email").trim());
                        }
                        if (data.containsKey("phone") && !data.get("phone").trim().isEmpty()) {
                            vol.put("phone", data.get("phone").trim());
                            if (user != null) user.put("phone", data.get("phone").trim());
                        }
                        if (data.containsKey("role") && !data.get("role").trim().isEmpty()) {
                            vol.put("role", data.get("role").trim());
                            if (user != null) user.put("role", data.get("role").trim());
                        }
                        if (data.containsKey("college_name") && !data.get("college_name").trim().isEmpty()) {
                            vol.put("college_name", data.get("college_name").trim());
                            if (user != null) user.put("college_name", data.get("college_name").trim());
                        }

                        // Gender Handling
                        if (data.containsKey("gender") && !data.get("gender").trim().isEmpty()) {
                            String newGender = data.get("gender").trim();
                            if (!newGender.equalsIgnoreCase("Female")) newGender = "Male";
                            vol.put("gender", newGender);
                            if (user != null) user.put("gender", newGender);
                        }

                        // Photo / Avatar Handling
                        String curGender = (String) vol.getOrDefault("gender", "Male");
                        String defAvatar = curGender.equalsIgnoreCase("Female") ? "img/avatar-female.svg" : "img/avatar-male.svg";
                        boolean removePhoto = "true".equalsIgnoreCase(data.get("remove_custom_photo"));
                        String customPhoto = data.get("custom_avatar");

                        if (removePhoto) {
                            vol.remove("custom_avatar");
                            if (user != null) user.remove("custom_avatar");
                            vol.put("avatar", defAvatar);
                            if (user != null) user.put("avatar", defAvatar);
                        } else if (customPhoto != null && !customPhoto.trim().isEmpty()) {
                            vol.put("custom_avatar", customPhoto.trim());
                            vol.put("avatar", customPhoto.trim());
                            if (user != null) {
                                user.put("custom_avatar", customPhoto.trim());
                                user.put("avatar", customPhoto.trim());
                            }
                        } else if (data.containsKey("avatar") && !data.get("avatar").trim().isEmpty()) {
                            String av = data.get("avatar").trim();
                            if (av.startsWith("data:")) {
                                vol.put("custom_avatar", av);
                                vol.put("avatar", av);
                                if (user != null) {
                                    user.put("custom_avatar", av);
                                    user.put("avatar", av);
                                }
                            } else {
                                vol.put("avatar", defAvatar);
                                if (user != null) user.put("avatar", defAvatar);
                            }
                        } else {
                            // If gender was updated and there's no custom photo:
                            String existingCustom = (String) vol.get("custom_avatar");
                            if (existingCustom == null || existingCustom.trim().isEmpty()) {
                                vol.put("avatar", defAvatar);
                                if (user != null) user.put("avatar", defAvatar);
                            }
                        }

                        if (data.containsKey("department")) vol.put("department", data.get("department").trim());
                        if (data.containsKey("year_of_study")) vol.put("year_of_study", data.get("year_of_study").trim());
                        if (data.containsKey("skills")) vol.put("skills", data.get("skills").trim());
                        if (data.containsKey("areas_of_interest")) vol.put("areas_of_interest", data.get("areas_of_interest").trim());
                        if (data.containsKey("availability")) vol.put("availability", data.get("availability").trim());
                        if (data.containsKey("preferred_categories")) vol.put("preferred_categories", data.get("preferred_categories").trim());
                        if (data.containsKey("address")) vol.put("address", data.get("address").trim());
                        if (data.containsKey("bio")) vol.put("bio", data.get("bio").trim());
                        if (data.containsKey("emergency_contact")) vol.put("emergency_contact", data.get("emergency_contact").trim());

                        // Sync to members store
                        String volEmail = (String) vol.get("email");
                        if (volEmail != null) {
                            for (Map<String, Object> m : members.values()) {
                                if (volEmail.equalsIgnoreCase(String.valueOf(m.get("email")))) {
                                    if (data.containsKey("name")) m.put("name", vol.get("name"));
                                    if (data.containsKey("phone")) m.put("phone", vol.get("phone"));
                                    if (data.containsKey("role")) m.put("role", vol.get("role"));
                                    m.put("gender", vol.get("gender"));
                                    m.put("avatar", vol.get("avatar"));
                                    if (removePhoto) {
                                        m.remove("custom_avatar");
                                    } else if (vol.containsKey("custom_avatar")) {
                                        m.put("custom_avatar", vol.get("custom_avatar"));
                                    }
                                    if (data.containsKey("college_name")) m.put("college_name", vol.get("college_name"));
                                    if (data.containsKey("department")) m.put("department", vol.get("department"));
                                    if (data.containsKey("year_of_study")) m.put("year_of_study", vol.get("year_of_study"));
                                    if (data.containsKey("skills")) m.put("skills", vol.get("skills"));
                                    if (data.containsKey("bio")) m.put("bio", vol.get("bio"));
                                    if (data.containsKey("emergency_contact")) m.put("emergency_contact", vol.get("emergency_contact"));
                                    break;
                                }
                            }
                        }

                        Map<String, Object> res = new HashMap<>(vol);
                        res.put("user", user);
                        res.put("badges", badges);
                        res.put("success", true);
                        res.put("message", "Profile updated successfully.");
                        sendJsonResponse(exchange, 200, toJson(res));
                    } else {
                        Map<String, Object> res = new HashMap<>(vol);
                        res.put("user", user);
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
                if (!isAuthorizedAdmin(exchange)) {
                    sendJsonResponse(exchange, 403, "{\"success\":false,\"error\":\"Forbidden: Admin privileges required.\"}");
                    return;
                }
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

                if (!isAuthorizedAdmin(exchange)) {
                    sendJsonResponse(exchange, 403, "{\"success\":false,\"error\":\"Forbidden: Admin privileges required to publish college drives.\"}");
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

            long studentCount = members.values().stream().filter(m -> "Student".equalsIgnoreCase(String.valueOf(m.get("role")))).count();
            long volunteerCount = members.values().stream().filter(m -> "Volunteer".equalsIgnoreCase(String.valueOf(m.get("role")))).count();
            long activeCount = members.values().stream().filter(m -> "Active".equalsIgnoreCase(String.valueOf(m.get("status")))).count();

            List<Map<String, Object>> memberList = new ArrayList<>();
            for (Map<String, Object> m : members.values()) {
                memberList.add(sanitizeMember(m));
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

            // Real Registered Member tracking counts & data
            res.put("total_members", members.size());
            res.put("total_students", studentCount);
            res.put("total_volunteers", volunteerCount);
            res.put("logged_in_users", activeCount);
            res.put("members", memberList);

            sendJsonResponse(exchange, 200, toJson(res));
        }
    }

    private static class AdminMembersHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCorsHeaders(exchange);
            String method = exchange.getRequestMethod();
            if ("OPTIONS".equalsIgnoreCase(method)) {
                sendJsonResponse(exchange, 204, "");
                return;
            }

            if (!isAuthorizedAdmin(exchange)) {
                sendJsonResponse(exchange, 403, "{\"success\":false,\"error\":\"Forbidden: Admin authorization required to access Registered Members.\"}");
                return;
            }

            String path = exchange.getRequestURI().getPath();
            String[] parts = path.split("/");

            if ("GET".equalsIgnoreCase(method)) {
                if (parts.length >= 5) {
                    // /api/admin/members/{id}
                    String id = parts[4];
                    Map<String, Object> found = members.get(id);
                    if (found == null) {
                        for (Map<String, Object> m : members.values()) {
                            if (id.equalsIgnoreCase(String.valueOf(m.get("id"))) ||
                                id.equalsIgnoreCase(String.valueOf(m.get("member_id"))) ||
                                id.equalsIgnoreCase(String.valueOf(m.get("email")))) {
                                found = m;
                                break;
                            }
                        }
                    }
                    if (found != null) {
                        Map<String, Object> res = new HashMap<>();
                        res.put("success", true);
                        res.put("member", sanitizeMember(found));
                        sendJsonResponse(exchange, 200, toJson(res));
                    } else {
                        sendJsonResponse(exchange, 404, "{\"success\":false,\"error\":\"Member not found\"}");
                    }
                    return;
                }

                // List all members with summary counts
                long studentCount = members.values().stream().filter(m -> "Student".equalsIgnoreCase(String.valueOf(m.get("role")))).count();
                long volunteerCount = members.values().stream().filter(m -> "Volunteer".equalsIgnoreCase(String.valueOf(m.get("role")))).count();
                long activeCount = members.values().stream().filter(m -> "Active".equalsIgnoreCase(String.valueOf(m.get("status")))).count();

                List<Map<String, Object>> memberList = new ArrayList<>();
                for (Map<String, Object> m : members.values()) {
                    memberList.add(sanitizeMember(m));
                }

                Map<String, Object> res = new LinkedHashMap<>();
                res.put("success", true);
                res.put("total_members", members.size());
                res.put("total_students", studentCount);
                res.put("total_volunteers", volunteerCount);
                res.put("logged_in_users", activeCount);
                res.put("members", memberList);

                sendJsonResponse(exchange, 200, toJson(res));
                return;
            }

            if ("DELETE".equalsIgnoreCase(method) || (parts.length >= 5 && "delete".equalsIgnoreCase(parts[parts.length - 1]))) {
                String id = parts.length >= 5 ? parts[4] : "";
                Map<String, Object> removed = members.remove(id);
                if (removed == null) {
                    for (Map.Entry<String, Map<String, Object>> e : members.entrySet()) {
                        if (id.equalsIgnoreCase(e.getKey()) ||
                            id.equalsIgnoreCase(String.valueOf(e.getValue().get("member_id"))) ||
                            id.equalsIgnoreCase(String.valueOf(e.getValue().get("email")))) {
                            removed = members.remove(e.getKey());
                            break;
                        }
                    }
                }
                if (removed != null) {
                    String uEmail = String.valueOf(removed.get("email"));
                    users.values().removeIf(u -> uEmail.equalsIgnoreCase(String.valueOf(u.get("email"))));
                    volunteers.values().removeIf(v -> uEmail.equalsIgnoreCase(String.valueOf(v.get("email"))));
                }
                sendJsonResponse(exchange, 200, "{\"success\":true,\"message\":\"Member deleted successfully\"}");
                return;
            }

            if ("POST".equalsIgnoreCase(method) || "PUT".equalsIgnoreCase(method)) {
                String body = readBody(exchange);
                Map<String, String> data = parseSimpleJson(body);
                String id = parts.length >= 5 ? parts[4] : getOrDefault(data, "id", getOrDefault(data, "member_id", ""));

                Map<String, Object> target = members.get(id);
                if (target == null) {
                    for (Map<String, Object> m : members.values()) {
                        if (id.equalsIgnoreCase(String.valueOf(m.get("id"))) ||
                            id.equalsIgnoreCase(String.valueOf(m.get("member_id"))) ||
                            id.equalsIgnoreCase(String.valueOf(m.get("email")))) {
                            target = m;
                            break;
                        }
                    }
                }

                if (target != null) {
                    if (data.containsKey("name") && !data.get("name").trim().isEmpty()) target.put("name", data.get("name").trim());
                    if (data.containsKey("phone") && !data.get("phone").trim().isEmpty()) target.put("phone", data.get("phone").trim());
                    if (data.containsKey("role") && !data.get("role").trim().isEmpty()) target.put("role", data.get("role").trim());
                    if (data.containsKey("status") && !data.get("status").trim().isEmpty()) target.put("status", data.get("status").trim());
                    if (data.containsKey("college_name")) target.put("college_name", data.get("college_name").trim());
                    if (data.containsKey("department")) target.put("department", data.get("department").trim());
                    if (data.containsKey("year_of_study")) target.put("year_of_study", data.get("year_of_study").trim());
                    if (data.containsKey("skills")) target.put("skills", data.get("skills").trim());
                    if (data.containsKey("bio")) target.put("bio", data.get("bio").trim());
                    if (data.containsKey("emergency_contact")) target.put("emergency_contact", data.get("emergency_contact").trim());

                    // Sync to users & volunteers
                    String email = String.valueOf(target.get("email"));
                    for (Map<String, Object> u : users.values()) {
                        if (email.equalsIgnoreCase(String.valueOf(u.get("email")))) {
                            if (data.containsKey("name")) u.put("name", data.get("name").trim());
                            if (data.containsKey("phone")) u.put("phone", data.get("phone").trim());
                            if (data.containsKey("role")) u.put("role", data.get("role").trim());
                            if (data.containsKey("college_name")) u.put("college_name", data.get("college_name").trim());
                        }
                    }
                    for (Map<String, Object> v : volunteers.values()) {
                        if (email.equalsIgnoreCase(String.valueOf(v.get("email")))) {
                            if (data.containsKey("name")) v.put("name", data.get("name").trim());
                            if (data.containsKey("phone")) v.put("phone", data.get("phone").trim());
                            if (data.containsKey("role")) v.put("role", data.get("role").trim());
                            if (data.containsKey("college_name")) v.put("college_name", data.get("college_name").trim());
                            if (data.containsKey("department")) v.put("department", data.get("department").trim());
                            if (data.containsKey("year_of_study")) v.put("year_of_study", data.get("year_of_study").trim());
                            if (data.containsKey("skills")) v.put("skills", data.get("skills").trim());
                            if (data.containsKey("bio")) v.put("bio", data.get("bio").trim());
                            if (data.containsKey("emergency_contact")) v.put("emergency_contact", data.get("emergency_contact").trim());
                        }
                    }

                    Map<String, Object> res = new HashMap<>();
                    res.put("success", true);
                    res.put("message", "Member updated successfully");
                    res.put("member", sanitizeMember(target));
                    sendJsonResponse(exchange, 200, toJson(res));
                } else {
                    sendJsonResponse(exchange, 404, "{\"success\":false,\"error\":\"Member not found\"}");
                }
                return;
            }

            sendJsonResponse(exchange, 405, "{\"error\":\"Method not allowed\"}");
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
    private static String hashPassword(String password) {
        if (password == null || password.isEmpty()) return "";
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(password.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            return "hash_" + password.hashCode();
        }
    }

    private static Map<String, Object> sanitizeMember(Map<String, Object> m) {
        if (m == null) return null;
        Map<String, Object> safe = new LinkedHashMap<>(m);
        safe.remove("password");
        safe.remove("password_hash");
        return safe;
    }

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

    private static boolean isAuthorizedAdmin(HttpExchange exchange) {
        if (exchange == null) return false;
        String adminKey = exchange.getRequestHeaders().getFirst("X-Admin-Key");
        String auth = exchange.getRequestHeaders().getFirst("Authorization");
        String query = exchange.getRequestURI() != null ? exchange.getRequestURI().getQuery() : null;

        if (ADMIN_KEY.equals(adminKey)) return true;
        if (auth != null && (auth.equals(ADMIN_KEY) || auth.equalsIgnoreCase("Bearer " + ADMIN_KEY))) return true;
        if (query != null && query.contains("admin_key=" + ADMIN_KEY)) return true;
        return false;
    }

    private static void addCorsHeaders(HttpExchange exchange) {
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Admin-Key");
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

    // Robust Lightweight JSON Parser for simple key-value objects
    private static Map<String, String> parseSimpleJson(String json) {
        Map<String, String> map = new HashMap<>();
        if (json == null || json.trim().isEmpty()) return map;
        String clean = json.trim();
        if (clean.startsWith("{")) clean = clean.substring(1);
        if (clean.endsWith("}")) clean = clean.substring(0, clean.length() - 1);
        clean = clean.trim();

        Pattern p = Pattern.compile("\"?([a-zA-Z0-9_]+)\"?\\s*:\\s*(?:\"((?:\\\\\"|[^\"])*)\"|([^,}]+))");
        java.util.regex.Matcher m = p.matcher(clean);
        while (m.find()) {
            String key = m.group(1).trim();
            String val = m.group(2) != null ? m.group(2) : (m.group(3) != null ? m.group(3).trim() : "");
            val = val.replace("\\\"", "\"").replace("\\\\", "\\");
            if (val.startsWith("\"") && val.endsWith("\"") && val.length() >= 2) {
                val = val.substring(1, val.length() - 1);
            }
            map.put(key, val.trim());
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
