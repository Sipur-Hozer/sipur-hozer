# Sipur Hozer - Employee Management System

## 📚 About Sipur Hozer
Sipur Hozer is a second-hand bookstore chain with 20 branches across Israel that employs individuals with employment barriers. 
The organization emphasizes professional and social development for its employees.
Currently, employees report their work hours and job roles on two separate, disconnected platforms. 
This project aims to bridge that gap by developing a unified, accessible mobile-first application that handles both time tracking and role reporting.

### Key Objectives

Unification: Combine entry/exit time recording and job role logging into one streamlined app.
Accessibility: Designed specifically for users with diverse backgrounds and needs, featuring a high emphasis on simplicity and accessibility adjustments (e.g., text-to-speech, high contrast).
Management: Provide managers with tools to approve shifts, manage locations, and export data for salary/reward calculations.

## 🚀 Features

### For Employees
Unified Login: Simple authentication via phone number and password.
Shift Tracking: Easy Clock-in/Clock-out interface.
Location Awareness: Ability to report shifts inside the store or outside.
Role Reporting: Mandatory selection of specific job roles performed during the shift.
Accessibility: User interface optimized for ease of use and accessibility.

### For Managers

Dashboard: Manage multiple store locations and user roles.
Shift Verification: Review, approve, or reject submitted shifts.
Reports: Export detailed reports for monthly salary and reward calculations.
User Management: Add employees and assign permissions.

## 🛠️ Technology Stack

This project is built using a modern, scalable architecture designed for high performance and reliability.

### Backend
Language: Go (Golang)
Framework: Gin-Gonic
Chosen for high execution speed, low resource consumption, and ability to handle high concurrency.

### Frontend
Framework: Next.js (React)
Chosen for server-side rendering capabilities, performance, and modern mobile-first UI development.

### Database
Database: PostgreSQL
Chosen for ACID compliance and strong SQL capabilities to ensure data integrity for financial/reward calculations.

### Infrastructure & DevOps
Containerization: Docker & Docker Compose
CI/CD: Automated pipelines for linting, testing, and building production images.

## 🏗️ Architecture Overview

The system follows a microservices-oriented approach:
Application (Client): Next.js frontend interacting with the API.
API Server: Go/Gin server handling business logic, authentication, and shift management.
Database: PostgreSQL instance storing sensitive user data, shifts, and roles.

## 💻 Getting Started

Prerequisites
Docker and Docker Compose
Optional (for local dev without Docker): Go 1.20+, Node.js 18+, PostgreSQL

Installation & Running
The easiest way to run the entire system is using Docker Compose.

Clone the repository

git clone [https://github.com/your-username/sipur-hozer-project.git](https://github.com/your-username/sipur-hozer-project.git)
cd sipur-hozer-project


Environment Variables
Create a .env file in the root directory (based on .env.example) to configure database credentials and API keys.

Run with Docker Compose
This command will spin up the Frontend, Backend, and Database containers.

docker-compose up --build


Access the Application
Frontend: http://localhost:3000
API: http://localhost:8080 (or your configured port)

## 👥 The Team

This project was designed and developed by:

Yanai Zehavi

Matan Gerstman

Rotem Harel

Yoav Fuchs

Noya De Levi

Dor Chobotaro

Instructor: Maroon Ayoub
 
## 📄 License

Distributed under the MIT License. See LICENSE for more information.
