-- =========================================================
-- HELPHUB DATABASE SCHEMA (MySQL / H2 Compatible)
-- Database Name: helphub_db
-- =========================================================

CREATE DATABASE IF NOT EXISTS helphub_db;
USE helphub_db;

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    role ENUM('ADMIN', 'VOLUNTEER', 'REQUESTER', 'COLLEGE') NOT NULL DEFAULT 'VOLUNTEER',
    college_name VARCHAR(150),
    avatar_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. VOLUNTEERS TABLE
CREATE TABLE IF NOT EXISTS volunteers (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) UNIQUE NOT NULL,
    student_id VARCHAR(50),
    department VARCHAR(100),
    points INT DEFAULT 0,
    total_hours DECIMAL(6,2) DEFAULT 0.00,
    activities_completed INT DEFAULT 0,
    people_helped INT DEFAULT 0,
    safety_rating DECIMAL(3,2) DEFAULT 5.00,
    is_available BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. HELP REQUESTS TABLE
CREATE TABLE IF NOT EXISTS help_requests (
    id VARCHAR(36) PRIMARY KEY,
    request_code VARCHAR(20) UNIQUE NOT NULL,
    requester_id VARCHAR(36) NOT NULL,
    requester_name VARCHAR(100) NOT NULL,
    contact_number VARCHAR(20) NOT NULL,
    category ENUM('Medical Support', 'Blood Donation', 'Elderly Assistance', 'Education Support', 'Food Distribution', 'Environmental Activities', 'Accessibility Assistance', 'Emergency Support', 'College Activities', 'Other Social Help') NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    location_name VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    volunteers_needed INT NOT NULL DEFAULT 1,
    volunteers_joined INT DEFAULT 0,
    priority ENUM('NORMAL', 'HIGH', 'EMERGENCY') DEFAULT 'NORMAL',
    request_date DATE NOT NULL,
    request_time TIME NOT NULL,
    image_url VARCHAR(255),
    is_emergency BOOLEAN DEFAULT FALSE,
    status ENUM('OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') DEFAULT 'OPEN',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (requester_id) REFERENCES users(id)
);

-- 4. TEAMS TABLE
CREATE TABLE IF NOT EXISTS teams (
    id VARCHAR(36) PRIMARY KEY,
    team_code VARCHAR(20) UNIQUE NOT NULL,
    help_request_id VARCHAR(36) UNIQUE NOT NULL,
    leader_volunteer_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (help_request_id) REFERENCES help_requests(id) ON DELETE CASCADE
);

-- 5. TEAM MEMBERS TABLE
CREATE TABLE IF NOT EXISTS team_members (
    id VARCHAR(36) PRIMARY KEY,
    team_id VARCHAR(36) NOT NULL,
    volunteer_id VARCHAR(36) NOT NULL,
    status ENUM('ACCEPTED', 'ON_THE_WAY', 'ARRIVED_SAFELY', 'HELPING', 'COMPLETED') DEFAULT 'ACCEPTED',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    arrived_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (volunteer_id) REFERENCES volunteers(id) ON DELETE CASCADE,
    UNIQUE KEY unique_team_volunteer (team_id, volunteer_id)
);

-- 6. VOLUNTEER REQUESTS (JOIN LOG) TABLE
CREATE TABLE IF NOT EXISTS volunteer_requests (
    id VARCHAR(36) PRIMARY KEY,
    help_request_id VARCHAR(36) NOT NULL,
    volunteer_id VARCHAR(36) NOT NULL,
    status ENUM('ACCEPTED', 'DECLINED', 'PENDING') DEFAULT 'ACCEPTED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (help_request_id) REFERENCES help_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (volunteer_id) REFERENCES volunteers(id) ON DELETE CASCADE
);

-- 7. LOCATIONS TABLE
CREATE TABLE IF NOT EXISTS locations (
    id VARCHAR(36) PRIMARY KEY,
    entity_id VARCHAR(36) NOT NULL,
    entity_type ENUM('REQUEST', 'VOLUNTEER', 'COLLEGE') NOT NULL,
    address TEXT NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 8. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('NEW_REQUEST', 'VOLUNTEER_JOINED', 'ARRIVED_SAFELY', 'HELP_STARTED', 'HELP_COMPLETED', 'BADGE_EARNED', 'CERTIFICATE_READY', 'EMERGENCY') NOT NULL,
    related_request_id VARCHAR(36),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 9. ACTIVITIES TABLE
CREATE TABLE IF NOT EXISTS activities (
    id VARCHAR(36) PRIMARY KEY,
    help_request_id VARCHAR(36) UNIQUE NOT NULL,
    team_id VARCHAR(36) NOT NULL,
    start_time TIMESTAMP NULL,
    end_time TIMESTAMP NULL,
    summary TEXT,
    requester_feedback ENUM('CONFIRMED', 'ISSUES_REPORTED') DEFAULT 'CONFIRMED',
    status ENUM('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED') DEFAULT 'NOT_STARTED',
    FOREIGN KEY (help_request_id) REFERENCES help_requests(id) ON DELETE CASCADE
);

-- 10. ATTENDANCE TABLE
CREATE TABLE IF NOT EXISTS attendance (
    id VARCHAR(36) PRIMARY KEY,
    activity_id VARCHAR(36) NOT NULL,
    volunteer_id VARCHAR(36) NOT NULL,
    hours_logged DECIMAL(4,2) DEFAULT 0.00,
    verified_by_leader BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
    FOREIGN KEY (volunteer_id) REFERENCES volunteers(id) ON DELETE CASCADE
);

-- 11. BADGES TABLE
CREATE TABLE IF NOT EXISTS badges (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    icon VARCHAR(10) NOT NULL,
    description TEXT NOT NULL,
    required_points INT DEFAULT 0
);

-- 12. VOLUNTEER POINTS TABLE (POINTS AUDIT LOG)
CREATE TABLE IF NOT EXISTS volunteer_points (
    id VARCHAR(36) PRIMARY KEY,
    volunteer_id VARCHAR(36) NOT NULL,
    points_awarded INT NOT NULL,
    reason VARCHAR(255) NOT NULL,
    help_request_id VARCHAR(36),
    awarded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (volunteer_id) REFERENCES volunteers(id) ON DELETE CASCADE
);

-- 13. CERTIFICATES TABLE
CREATE TABLE IF NOT EXISTS certificates (
    id VARCHAR(36) PRIMARY KEY,
    certificate_code VARCHAR(30) UNIQUE NOT NULL,
    volunteer_id VARCHAR(36) NOT NULL,
    volunteer_name VARCHAR(100) NOT NULL,
    college_name VARCHAR(150),
    title VARCHAR(150) NOT NULL,
    total_hours DECIMAL(6,2) NOT NULL,
    total_activities INT NOT NULL,
    issued_date DATE NOT NULL,
    qr_verification_token VARCHAR(100) NOT NULL,
    pdf_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (volunteer_id) REFERENCES volunteers(id) ON DELETE CASCADE
);

-- 14. ORGANIZATIONS / COLLEGES TABLE
CREATE TABLE IF NOT EXISTS organizations (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    type ENUM('COLLEGE', 'NGO', 'COMMUNITY', 'HOSPITAL') NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    location VARCHAR(255) NOT NULL,
    verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 15. EVENTS TABLE (COLLEGE VOLUNTEER DRIVES)
CREATE TABLE IF NOT EXISTS events (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    organization_id VARCHAR(36) NOT NULL,
    organization_name VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(255) NOT NULL,
    event_date DATE NOT NULL,
    volunteers_capacity INT NOT NULL,
    volunteers_registered INT DEFAULT 0,
    category VARCHAR(50) NOT NULL,
    status ENUM('UPCOMING', 'ACTIVE', 'COMPLETED') DEFAULT 'UPCOMING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);
