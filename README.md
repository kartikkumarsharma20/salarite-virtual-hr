# Salarite Virtual HR

An enterprise-ready, full-stack Human Resources operations SaaS dashboard designed to streamline employer task delegation, virtual HR workflow management, candidate interview scheduling, and live audit logging.

Built with **React 18 + Vite** on the frontend and **FastAPI + SQLAlchemy + SQLite** on the backend.

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Key Features](#key-features)
3. [Technology Stack](#technology-stack)
4. [Folder Structure](#folder-structure)
5. [Prerequisites](#prerequisites)
6. [Demo Credentials](#demo-credentials)
7. [Installation & Setup](#installation--setup)
   - [Backend Setup & Database Initialization](#backend-setup)
   - [Frontend Setup](#frontend-setup)
8. [Running the Application](#running-the-application)
9. [Running Automated Tests](#running-automated-tests)
10. [API Documentation](#api-documentation)
11. [Environment Variables](#environment-variables)
12. [Deployment Guidance](#deployment-guidance)
13. [GitHub Setup Instructions](#github-setup-instructions)
14. [Design Decisions & Known Limitations](#known-limitations)

---

## Project Overview

**Salarite Virtual HR** empowers organizations with high-efficiency HR operations. Employers can create high-impact operational tasks, delegate them to dedicated Virtual HR specialists, track real-time status transitions, schedule multi-format candidate interviews (Video, Voice, Chat), and maintain a tamper-evident audit history of all activity.

Live background polling (every 3–5 seconds) guarantees that changes made by Virtual HR specialists automatically appear on the Employer dashboard without requiring manual page refreshes.

---

## Key Features

### 1. Role-Based Authentication & Permissions
- **Employer Role**:
  - Full visibility across all team tasks and aggregate statistics.
  - Create, reassign, update, and delete tasks.
  - Schedule, reschedule, and cancel candidate interviews.
  - Review live audit trail and activity feeds.
- **Virtual HR Role**:
  - Dedicated personal workspace displaying strictly tasks assigned to their account.
  - Update task progress statuses (`In Progress`, `Completed`, `Blocked`).
  - Attach progress comments and blocker explanations.
  - Strict security enforcement: Virtual HR users cannot modify tasks assigned to other specialists (HTTP 403 Forbidden).

### 2. Live Employer Dashboard
- Live aggregate metrics: **Total Tasks**, **Pending**, **In Progress**, **Completed**, **Blocked**, and **Upcoming Interviews**.
- Recent Tasks table with status indicators, priority chips, assignee avatars, and target deadlines with overdue alerts.
- Upcoming interview schedules with one-click session launch buttons.
- Real-time audit trail displaying recent system-wide task mutations.
- **Automatic Polling**: Seamlessly updates every 4 seconds with memory-safe timer cleanup on component unmount.

### 3. Task Management & Workflow Engine
- Support for four standardized statuses: `Pending` (Orange), `In Progress` (Blue), `Completed` (Green), `Blocked` (Red).
- Four priority tiers: `Low`, `Medium`, `High`, `Urgent`.
- Multi-factor filtering: search by title keyword, filter by status, priority, and Virtual HR assignee.
- Table view and responsive Card grid switcher.
- Detailed task view with complete activity history.

### 4. Candidate Interview Scheduling
- Schedule interviews with Candidate Name, Email, optional Phone, Date, Time, Duration, and Notes.
- Support for three interview modes: **Voice Call**, **Video Interview**, and **Chat Assessment**.
- Filter interviews by mode and status (`Scheduled`, `Completed`, `Cancelled`).
- Inbuilt interactive mode placeholders:
  - **Video**: Camera/mic preview simulation, HD connection badge, mute/video toggles, and session timer.
  - **Voice**: Animated audio waveform visualization, phone icon pulse, and mute controls.
  - **Chat**: Interactive two-way mock chat window with candidate response simulation.

---

## Technology Stack

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite 6
- **Routing**: React Router DOM v6
- **HTTP Client**: Axios with JWT Bearer interceptor & 401 handling
- **Icons**: Lucide React
- **Styling**: Vanilla CSS (Custom Design System with enterprise color tokens, zero external CSS bloat)

### Backend
- **Framework**: FastAPI (Python 3.10+)
- **ASGI Server**: Uvicorn
- **ORM**: SQLAlchemy 2.0
- **Validation**: Pydantic v2 & Pydantic-Settings
- **Security**: JWT (`python-jose`) and Bcrypt password hashing
- **Testing**: Pytest & HTTPX TestClient

### Database
- **Engine**: SQLite 3 (Default: `database/salarite_hr.db`)

---

## Folder Structure

```
salarite-virtual-hr/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── StatCard.jsx
│   │   │   ├── TaskCard.jsx
│   │   │   ├── TaskTable.jsx
│   │   │   ├── StatusBadge.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   └── Notification.jsx
│   │   ├── layouts/
│   │   │   └── DashboardLayout.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── EmployerTasks.jsx
│   │   │   ├── CreateTask.jsx
│   │   │   ├── VirtualHRTasks.jsx
│   │   │   ├── TaskDetails.jsx
│   │   │   ├── Interviews.jsx
│   │   │   ├── ScheduleInterview.jsx
│   │   │   └── NotFound.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── taskService.js
│   │   │   ├── interviewService.js
│   │   │   └── dashboardService.js
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── hooks/
│   │   │   ├── useTasks.js
│   │   │   └── useInterviews.js
│   │   ├── utils/
│   │   │   ├── constants.js
│   │   │   └── formatDate.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── init.py
│   │   ├── main.py
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── security.py
│   │   │   └── dependencies.py
│   │   ├── database/
│   │   │   ├── connection.py
│   │   │   └── init_db.py
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── task.py
│   │   │   ├── interview.py
│   │   │   └── task_activity.py
│   │   ├── schemas/
│   │   │   ├── user.py
│   │   │   ├── task.py
│   │   │   ├── interview.py
│   │   │   └── dashboard.py
│   │   ├── routers/
│   │   │   ├── auth.py
│   │   │   ├── tasks.py
│   │   │   ├── virtual_hr.py
│   │   │   ├── interviews.py
│   │   │   ├── dashboard.py
│   │   │   └── users.py
│   │   ├── services/
│   │   │   ├── task_service.py
│   │   │   └── interview_service.py
│   │   └── utils/
│   │       └── datetime_utils.py
│   ├── tests/
│   │   ├── conftest.py
│   │   ├── test_tasks.py
│   │   └── test_interviews.py
│   ├── requirements.txt
│   ├── .env.example
│   └── .gitignore
├── database/
│   └── .gitkeep
├── docs/
│   └── screenshots/
├── .gitignore
├── README.md
└── render.yaml
```

---

## Demo Credentials

The application initializes SQLite and automatically seeds three demo accounts on the first run. The login page also features **one-click demo login buttons**:

| Role | Name | Email | Password | Permissions |
|---|---|---|---|---|
| **Employer** | Alex Vance | `alex.vance@salarite.com` | `Employer123!` | Create tasks, reassign, view all tasks, schedule interviews, view audit logs |
| **Virtual HR** | Sarah Connor | `sarah.connor@salarite.com` | `VirtualHR123!` | View assigned tasks, update workflow status, append progress notes |
| **Virtual HR 2** | David Miller | `david.miller@salarite.com` | `VirtualHR123!` | View assigned tasks, update workflow status |

---

## Installation & Setup

### Prerequisites
- **Python**: 3.10 or higher
- **Node.js**: v18 or higher (tested on v24.18.1)
- **npm**: v9 or higher

---

### Backend Setup

1. Open your terminal and navigate to the backend directory:
   ```bash
   cd salarite-virtual-hr/backend
   ```

2. (Optional but recommended) Create and activate a Python virtual environment:
   ```bash
   # Windows (PowerShell)
   python -m venv venv
   .\venv\Scripts\Activate.ps1

   # Linux / macOS
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure the environment variables (defaults work immediately out of the box):
   ```bash
   cp .env.example .env
   ```

5. Initialize the database and demo seed data:
   ```bash
   python -c "from app.database.init_db import init_db; init_db()"
   ```

---

### Frontend Setup

1. Open a second terminal window and navigate to the frontend directory:
   ```bash
   cd salarite-virtual-hr/frontend
   ```

2. Install npm dependencies:
   ```bash
   npm install
   ```

3. Copy the environment configuration:
   ```bash
   cp .env.example .env
   ```

---

## Running the Application

### 1. Start the Backend API Server
From the `backend/` directory:
```bash
uvicorn app.main:app --reload --port 8000
```
- The API server will start at: `http://localhost:8000`
- Interactive Swagger API Documentation: `http://localhost:8000/docs`
- ReDoc Documentation: `http://localhost:8000/redoc`

### 2. Start the Frontend Development Server
From the `frontend/` directory:
```bash
npm run dev
```
- The React application will start at: `http://localhost:5173`
- Open your browser at `http://localhost:5173` to access the login page.

---

## Running Automated Tests

Backend automated tests use **pytest** and **FastAPI TestClient** with an **in-memory SQLite database** to ensure complete isolation from demo data.

Navigate to `backend/` and run:
```bash
python -m pytest tests -v
```

### Test Coverage Checklist:
- `test_health_endpoint`: Verifies `/api/health` returns healthy status and service info.
- `test_successful_login`: Validates JWT token generation and role payload.
- `test_invalid_login`: Verifies rejection of incorrect credentials (HTTP 401).
- `test_employer_task_creation`: Tests employer task creation with priority, deadline, and audit logging.
- `test_task_list_retrieval`: Validates task filtering by priority and assignee.
- `test_task_status_update_by_assigned_vhr`: Verifies Virtual HR can update assigned task status and attach notes.
- `test_vhr_cannot_update_another_users_task`: Enforces authorization check (HTTP 403 Forbidden).
- `test_dashboard_stats_calculation`: Confirms real database counts for tasks and pending items.
- `test_interview_creation`: Tests candidate interview scheduling with date and duration.
- `test_interview_creation_validation`: Tests rejection of invalid candidate email and missing fields.
- `test_interview_listing_and_filtering`: Validates mode filtering (`Voice`, `Video`, `Chat`).
- `test_interview_cancellation`: Tests status update to `Cancelled`.

---

## API Documentation

FastAPI automatically generates interactive Swagger UI documentation at:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

### Main Endpoints Summary:
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/health` | Service health status | No |
| `POST` | `/api/auth/login` | Authenticate and obtain JWT token | No |
| `GET` | `/api/auth/me` | Current authenticated user profile | Bearer Token |
| `GET` | `/api/dashboard/stats` | Aggregate dashboard metrics & upcoming items | Bearer Token |
| `GET` | `/api/dashboard/activity`| Global task activity audit feed | Bearer Token |
| `POST` | `/api/tasks` | Create and assign a task | Employer |
| `GET` | `/api/tasks` | List tasks with filters | Bearer Token |
| `GET` | `/api/tasks/{task_id}` | Detailed task information and audit logs | Bearer Token |
| `PUT` | `/api/tasks/{task_id}` | Edit task title, priority, assignee, deadline | Employer |
| `DELETE` | `/api/tasks/{task_id}` | Delete a task and associated logs | Employer |
| `PATCH` | `/api/tasks/{task_id}/status` | Update task status & append progress note | Assigned VHR or Employer |
| `GET` | `/api/virtual-hr/tasks` | List tasks assigned to current Virtual HR user | Virtual HR |
| `GET` | `/api/users/virtual-hr` | List active Virtual HR members for assignment | Bearer Token |
| `POST` | `/api/interviews` | Schedule candidate interview | Employer |
| `GET` | `/api/interviews` | List interviews with mode and status filters | Bearer Token |
| `GET` | `/api/interviews/{id}` | Interview details | Bearer Token |
| `PUT` | `/api/interviews/{id}` | Update or reschedule an interview | Employer |
| `PATCH` | `/api/interviews/{id}/cancel` | Cancel an interview | Employer |

---

## Environment Variables

### Backend (`backend/.env`)
| Variable | Description | Default |
|---|---|---|
| `PROJECT_NAME` | Name of the platform | `"Salarite Virtual HR"` |
| `API_V1_STR` | Common API prefix | `"/api"` |
| `SECRET_KEY` | Secret key for signing JWT tokens | Strong random secret string |
| `ALGORITHM` | JWT cryptographic algorithm | `"HS256"` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token lifetime in minutes | `1440` (24 hours) |
| `DATABASE_URL` | SQLAlchemy connection URL | `"sqlite:///./database/salarite_hr.db"` |
| `CORS_ORIGINS` | Comma-separated allowed frontend origins | `"http://localhost:5173,http://localhost:3000"` |

### Frontend (`frontend/.env`)
| Variable | Description | Default |
|---|---|---|
| `VITE_API_BASE_URL` | Base URL of the FastAPI backend | `http://localhost:8000/api` |

---

## Deployment Guidance

The project is structured for independent frontend and backend deployment. A blueprint configuration file `render.yaml` is included at the repository root.

### Backend Deployment (e.g. Render / Railway / Fly.io)
1. Deploy as a Python Web Service with `rootDir: backend`.
2. Build command: `pip install --upgrade pip && pip install -r requirements.txt`.
3. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
4. Configure environment variables (`SECRET_KEY`, `CORS_ORIGINS`, `DATABASE_URL`).
5. **Note on SQLite Persistence**: Hosted platforms with ephemeral file systems (e.g., Render free web service dynos) will reset SQLite database files on redeploy or container restart. For persistent production installations, attach a persistent storage disk volume mounted to `/database` or configure a persistent database instance.

### Frontend Deployment (e.g. Vercel / Netlify / Render Static Site)
1. Deploy as a Static Site with `rootDir: frontend`.
2. Build command: `npm install && npm run build`.
3. Publish directory: `dist`.
4. Set environment variable: `VITE_API_BASE_URL=https://<your-backend-domain>/api`.
5. Configure single-page application (SPA) rewrite rule: route `/*` to `/index.html`.

---

## GitHub Setup Instructions

1. Initialize git and commit:
   ```bash
   cd salarite-virtual-hr
   git init
   git add .
   git commit -m "feat: complete Salarite Virtual HR application"
   ```
2. Create a new repository on GitHub (e.g., `salarite-virtual-hr`).
3. Link and push your repository:
   ```bash
   git remote add origin https://github.com/<your-username>/salarite-virtual-hr.git
   git branch -M main
   git push -u origin main
   ```

---

## Known Limitations

1. **Inbuilt Interview Mode Placeholders**: In accordance with the project requirements, external calling providers (such as WebRTC, Twilio, Agora, or Zoom) are not integrated. The Voice, Video, and Chat modes are simulated via inbuilt interactive modal placeholders that demonstrate connection states, audio waveform animations, mute toggles, and two-way mock chat messaging.
2. **SQLite Concurrent Writes**: SQLite uses database-level locking for writes. While optimal for single-node deployments and standard HR operational volume, multi-region horizontal scaling would benefit from migrating the SQLAlchemy engine to PostgreSQL.
