# Sipur Hozer - Employee Management System

## 📚 About Sipur Hozer
Sipur Hozer is a second-hand bookstore chain with 20 branches across Israel that employs individuals with employment barriers. 

The organization emphasizes professional and social development for its employees.

Currently, employees report their work hours and job roles on two separate, disconnected platforms. 

This project aims to bridge that gap by developing a unified, accessible mobile-first application that handles both time tracking and role reporting.

### Key Objectives

- Unification: Combine entry/exit time recording and job role logging into one streamlined app.

- Accessibility: Designed specifically for users with diverse backgrounds and needs, featuring a high emphasis on simplicity and accessibility adjustments (e.g., text-to-speech, high contrast).

- Management: Provide managers with tools to approve shifts, manage locations, and export data for salary/reward calculations.

## 🚀 Features 

### For Employees
- Unified Login: Simple authentication via phone number and password.
- Shift Tracking: Easy Clock-in/Clock-out interface.
- Location Awareness: Ability to report shifts inside the store or outside.
- Role Reporting: Mandatory selection of specific job roles performed during the shift.
- Accessibility: User interface optimized for ease of use and accessibility.

### For Managers

- Dashboard: Manage multiple store locations and user roles.
- Shift Verification: Review, approve, or reject submitted shifts.
- Reports: Export detailed reports for monthly salary and reward calculations.
- User Management: Add employees and assign permissions.

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
- Application (Client): Next.js frontend interacting with the API.
- API Server: Go/Gin server handling business logic, authentication, and shift management.
- Database: PostgreSQL instance storing sensitive user data, shifts, and roles.

## 💻 Getting Started

### Prerequisites

Since the entire workflow (running, testing, and linting) is containerized, you only need:

Docker & Docker Compose (Essential)

Make (Pre-installed on Linux/macOS; Windows users may need WSL or Git Bash)

Note: You do not need Go, Node.js, or any other language dependencies installed on your host machine.

### 🚀 Run Application

The easiest way to run the entire system is using the provided Make automation.

Start the System

Builds the Docker images, starts the containers in the background, and automatically launches the application.

make run


Frontend: http://localhost:3000

API: http://localhost:8080

Note: Your terminal will remain free for use after the app starts.

View Logs

Follow the server output in real-time:

make logs


Stop the System

Stops and removes the running containers:

make stop


🧪 Development & Quality Checks

These commands run inside isolated Docker containers to ensure consistency.

Run Tests

Executes the test suites for both Backend and Frontend inside a container.

make test


Run Linters

Runs code quality checks and static analysis inside a container.

make lint


Access Container Shells

If you need to debug inside the running environment:

Backend: make shell-back

Frontend: make shell-front


🔧 Maintenance

Rebuild Images

Force a rebuild of the Docker images (useful if you changed dependencies).

make images


Deep Clean

Removes all Docker artifacts (images, volumes, and orphans) created by this project to ensure a completely clean slate.

make clean


ℹ️ Help

To see a full list of available commands directly in your terminal:

make help



## 👥 The Team

This project was designed and developed by:

Yanai Zehavi

Matan Gerstman

Rotem Harel

Yoav Fuchs

Noya De Levi

Dor Chobotaro

Instructor: Maroon Ayoub

