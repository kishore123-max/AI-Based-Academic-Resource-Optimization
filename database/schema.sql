CREATE DATABASE IF NOT EXISTS campusflow;
USE campusflow;

CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    register_number VARCHAR(80) NOT NULL UNIQUE,
    date_of_birth DATE,
    department VARCHAR(150),
    program_type VARCHAR(20),
    program VARCHAR(150),
    semester VARCHAR(60),
    email VARCHAR(150),
    phone VARCHAR(40),
    advisor VARCHAR(150),
    status VARCHAR(40) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS faculty (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    department VARCHAR(150),
    designation VARCHAR(150),
    email VARCHAR(150),
    phone VARCHAR(40),
    status VARCHAR(40) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL UNIQUE,
    head VARCHAR(150),
    code VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS learning_materials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    category VARCHAR(80) NOT NULL,
    course VARCHAR(200),
    format_label VARCHAR(120),
    description TEXT,
    author_name VARCHAR(150),
    resource_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_name VARCHAR(150) NOT NULL,
    registration_number VARCHAR(80),
    course VARCHAR(200),
    assignment_title VARCHAR(200) NOT NULL,
    notes TEXT,
    file_name VARCHAR(200),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS resource_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(160) NOT NULL,
    department VARCHAR(120) NOT NULL,
    category VARCHAR(80) NOT NULL,
    requested_units INT NOT NULL,
    urgency TINYINT NOT NULL,
    students_affected INT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS academic_resources (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    category VARCHAR(80) NOT NULL,
    total_units INT NOT NULL,
    available_units INT NOT NULL,
    unit_label VARCHAR(40) NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);