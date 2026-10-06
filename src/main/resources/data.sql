-- =========================================================
-- HELPHUB DEMO SEED DATA (data.sql)
-- =========================================================

-- 1. SEED BADGES
INSERT INTO badges (id, name, code, icon, description, required_points) VALUES
('b1', 'First Helper', 'FIRST_HELPER', '🏅', 'Completed your first help activity', 20),
('b2', 'Community Hero', 'COMMUNITY_HERO', '🤝', 'Reached 100 volunteer points and 5 activities', 100),
('b3', 'Active Volunteer', 'ACTIVE_VOLUNTEER', '⭐', 'Completed 10+ volunteer activities', 200),
('b4', 'Social Impact Champion', 'IMPACT_CHAMPION', '❤️', 'Helped over 25+ people in emergency & social causes', 500),
('b5', 'Safety Guardian', 'SAFETY_GUARDIAN', '🟢', 'Promptly sent arrival safety alerts in 5+ team missions', 150);

-- 2. SEED USERS
INSERT INTO users (id, name, email, password_hash, phone, role, college_name, avatar_url) VALUES
('u1', 'Mohan Das', 'mohan@campus.edu', 'hashed_pass', '+91 9876543210', 'VOLUNTEER', 'City Tech University', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'),
('u2', 'Raj Kumar', 'raj@campus.edu', 'hashed_pass', '+91 9876543211', 'VOLUNTEER', 'City Tech University', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'),
('u3', 'Santhosh V', 'santhosh@campus.edu', 'hashed_pass', '+91 9876543212', 'VOLUNTEER', 'City Tech University', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'),
('u4', 'Arun Prakash', 'arun@campus.edu', 'hashed_pass', '+91 9876543213', 'VOLUNTEER', 'City Tech University', 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150'),
('u5', 'Priya Sharma', 'priya@ngo.org', 'hashed_pass', '+91 9876543214', 'REQUESTER', 'Sunshine Foundation', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'),
('u6', 'Dr. K. Raman', 'admin@campus.edu', 'hashed_pass', '+91 9876543215', 'COLLEGE', 'City Tech University', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'),
('u7', 'System Admin', 'admin@helphub.org', 'hashed_pass', '+91 9876543216', 'ADMIN', 'HELPHUB HQ', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150');

-- 3. SEED VOLUNTEERS
INSERT INTO volunteers (id, user_id, student_id, department, points, total_hours, activities_completed, people_helped, safety_rating, is_available) VALUES
('v1', 'u1', 'STU2023CSE042', 'Computer Science & Engineering', 850, 42.0, 12, 18, 5.0, TRUE),
('v2', 'u2', 'STU2023ECE018', 'Electronics & Comm Engineering', 620, 31.5, 9, 14, 4.9, TRUE),
('v3', 'u3', 'STU2023EEE055', 'Electrical & Electronics Eng', 410, 22.0, 6, 9, 5.0, TRUE),
('v4', 'u4', 'STU2023MECH012', 'Mechanical Engineering', 290, 15.0, 4, 6, 4.8, TRUE);

-- 4. SEED ORGANIZATIONS
INSERT INTO organizations (id, name, type, email, phone, location, verified) VALUES
('org1', 'City Tech University', 'COLLEGE', 'info@campus.edu', '+91 44 6790 0600', 'University Road, Main Campus', TRUE),
('org2', 'Sunshine Elders Care NGO', 'NGO', 'contact@sunshinecare.org', '+91 44 2626 1122', 'Anna Nagar, Chennai', TRUE),
('org3', 'Red Cross Blood Bank', 'HOSPITAL', 'bloodbank@redcross.org', '+91 44 2855 4321', 'Egmore, Chennai', TRUE);

-- 5. SEED HELP REQUESTS
INSERT INTO help_requests (id, request_code, requester_id, requester_name, contact_number, category, title, description, location_name, latitude, longitude, volunteers_needed, volunteers_joined, priority, request_date, request_time, image_url, is_emergency, status) VALUES
('hr1', 'HH1024', 'u5', 'Priya Sharma (Sunshine NGO)', '+91 9876543214', 'Medical Support', 'Medical Assistance Needed at Community Camp', 'Urgent requirement for student volunteers to assist doctors, manage patient queue, and distribute medicines during senior citizen medical drive.', 'Campus Health Center Gate', 13.3512, 80.1408, 4, 3, 'HIGH', '2026-10-07', '18:30:00', 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=500', FALSE, 'OPEN'),
('hr2', 'HH1025', 'u5', 'Chennai Red Cross Unit', '+91 9876543214', 'Blood Donation', 'Emergency O+ Blood Donors Required', 'Urgent requirement of 3 O+ blood donors for emergency surgical patient at City General Hospital.', 'City General Hospital, Main Block', 13.0827, 80.2707, 3, 2, 'EMERGENCY', '2026-10-07', '14:00:00', 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=500', TRUE, 'OPEN'),
('hr3', 'HH1026', 'u6', 'Campus Green Club', '+91 9876543215', 'Environmental Activities', 'Tree Plantation Drive & Campus Greening', 'Planting 200 native saplings along the campus periphery. Tools and refreshments provided.', 'Campus Central Grounds', 13.3520, 80.1415, 10, 6, 'NORMAL', '2026-10-08', '09:00:00', 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=500', FALSE, 'OPEN'),
('hr4', 'HH1027', 'u5', 'Aaroham Foundation', '+91 9876543214', 'Education Support', 'Weekend Evening Tutoring for Primary Kids', 'Teaching basic mathematics and English reading to underprivileged primary school students.', 'Community Learning Center', 13.3480, 80.1380, 5, 5, 'NORMAL', '2026-10-09', '16:00:00', 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=500', FALSE, 'IN_PROGRESS'),
('hr5', 'HH1028', 'u5', 'Food for All Drive', '+91 9876543214', 'Food Distribution', 'Sunday Relief Meals Packing & Distribution', 'Packing 500 dry ration kits and distributing cooked lunch to shelter homes.', 'Youth Welfare Hall, Anna Nagar', 13.0850, 80.2100, 8, 8, 'HIGH', '2026-10-10', '10:30:00', 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=500', FALSE, 'COMPLETED');

-- 6. SEED TEAMS & TEAM MEMBERS
INSERT INTO teams (id, team_code, help_request_id, leader_volunteer_id) VALUES
('t1', 'TEAM-1024', 'hr1', 'v1');

INSERT INTO team_members (id, team_id, volunteer_id, status, joined_at) VALUES
('tm1', 't1', 'v1', 'ARRIVED_SAFELY', CURRENT_TIMESTAMP),
('tm2', 't1', 'v2', 'ON_THE_WAY', CURRENT_TIMESTAMP),
('tm3', 't1', 'v3', 'ACCEPTED', CURRENT_TIMESTAMP);

-- 7. SEED EVENTS (COLLEGE VOLUNTEER DRIVES)
INSERT INTO events (id, title, organization_id, organization_name, description, location, event_date, volunteers_capacity, volunteers_registered, category, status) VALUES
('ev1', 'Campus Mega Cleanliness & Green Drive', 'org1', 'City Tech University', 'NSS & Youth Red Cross annual environmental service drive across local adoption villages.', 'Campus Grounds & Local Adoption Village', '2026-10-12', 50, 38, 'Environment', 'UPCOMING'),
('ev2', 'Inter-College Blood Donation Camp', 'org1', 'City Tech University', 'Joint mega blood donation camp with Red Cross. Certificate of appreciation provided.', 'Main Auditorium Hall', '2026-10-18', 100, 72, 'Medical', 'UPCOMING');

-- 8. SEED CERTIFICATES
INSERT INTO certificates (id, certificate_code, volunteer_id, volunteer_name, college_name, title, total_hours, total_activities, issued_date, qr_verification_token, pdf_url) VALUES
('cert1', 'CERT-HH-2026-089', 'v1', 'Mohan Das', 'City Tech University', 'Excellence in Community Volunteering', 42.0, 12, '2026-09-30', 'VERIFY-HELPHUB-MOHAN-850', '#');

-- 9. SEED NOTIFICATIONS
INSERT INTO notifications (id, user_id, title, message, type, related_request_id, is_read) VALUES
('n1', 'u1', '🚨 HELP NEEDED NEAR YOU', 'Medical Assistance Needed at Campus Area (4 Volunteers Required)', 'NEW_REQUEST', 'hr1', FALSE),
('n2', 'u1', '🟢 VOLUNTEER REACHED SAFELY', 'Mohan Das reached Campus Health Center Gate safely. You can proceed.', 'ARRIVED_SAFELY', 'hr1', FALSE),
('n3', 'u1', '🏆 BADGE UNLOCKED', 'Congratulations! You earned the "Community Hero" Badge!', 'BADGE_EARNED', NULL, TRUE);
