# CivicPulse - Technical Documentation & System Design

## 1. Executive Summary
**CivicPulse** is an interactive, real-time civic engagement platform designed for citizens to report local infrastructure issues (such as potholes, trash, and hazards) using geolocation data. It serves both the community and local authorities by acting as a streamlined bridge for rapid issue identification, community prioritization (via upvotes), and tracking resolution status.

This document outlines the core technical features, overall software system design, and the architectural components connecting the frontend, backend APIs, and the database.

---

## 2. Technical Capabilities & Features

### 2.1 Citizen-Facing Features (User Application)
- **Interactive Geospatial Dashboard:** A real-time map environment leveraging `Leaflet.js` allowing users to see reported incidents locally. Custom map markers dynamically reflect issue types.
- **Geolocation & Reporting System:** Captures longitudinal and latitudinal coordinates to explicitly locate an issue. Integrated forms handle categorizations (`POTHOLE`, `TRASH`, `HAZARD`, `OTHER`), descriptive context, and photo attachments.
- **Community Validation (Upvoting System):** Allows citizens to validate the severity and existence of issues through an upvoting mechanism, automatically prioritizing reports that demand urgent attention.
- **Real-Time Lifecycle Tracking:** Status indicators represent the lifecycle of a report (`OPEN`, `IN_PROGRESS`, `RESOLVED`), giving users direct feedback transparently.
- **Responsive & Dynamic Theming:** The user interface adjusts dynamically across devices (mobile to desktop) utilizing Tailwind CSS, paired with a system-aware light/dark theme toggle (`next-themes`).

### 2.2 Authority-Facing Features (Admin Module)
- **Role-Based Admin Access:** Secure login via an admin gateway panel modal ensuring only authorized personnel have access to state-mutating privileges.
- **Centralized Data Table:** A comprehensive tabular dashboard providing an overview of all system reports complete with status filtering (`ALL`, `OPEN`, `PENDING`, `RESOLVED`).
- **State Mutation Endpoint Hooks:** Admins are equipped with one-click toggles interacting with the RESTful API endpoints `PATCH /api/reports/:id/status` to instantly mutate a report's completion status.
- **Data Summarization:** Visual indicators (colored semantic tags) for status highlighting to expedite administrative review processes.

---

## 3. High-Level Software System Architecture

CivicPulse operates on a **Monolithic Serverless Architecture** facilitated by the Next.js 14 App Router environment. The application minimizes latency and hosting complexity by collocating the frontend UI and the backend API logic within the same deployable boundary.

### 3.1 Architecture Overview (Diagrammatic Flow)
```text
[ Client (Browser / Mobile) ]
       │            ▲
(HTTP Requests)     │ (JSON Responses / UI Hydration)
       ▼            │
[ Next.js 14 Web Server (Frontend / React Server Components) ]
       │            ▲
(Internal API)      │
       ▼            │
[ Next.js API Routes (Backend Logic) `app/api/` ]
       │            ▲
(SQL Queries)       │
       ▼            │
[ Relational Database (MySQL / PostgreSQL via Supabase) ]
```

### 3.2 Technology Stack Breakdown
1. **Frontend Framework:** `Next.js 14` (React)
   - Adopts the App Router (`app/`) paradigm emphasizing React Server Components (RSC) vs Client Components (`'use client'`).
2. **Styling Engine:** `Tailwind CSS`
   - Utility-first approach ensuring highly maintainable, unbloated stylesheet delivery.
3. **Geospatial Engine:** `React Leaflet / Leaflet.js`
   - Maps API renderer built over OpenStreetMap layers.
4. **Backend Serverless Endpoints:** Node.js Edge / Vercel API Routes
   - Handles REST-like operations for report ingestion, status configuration, and leaderboard generation.
5. **Database Solution:** `MySQL` (or PostgreSQL/Supabase contextually)
   - Connection pooling utilizing `mysql2/promise` providing asynchronous SQL querying.

---

## 4. Database Schema Design

The datastore maintains two primary entities under normalized relational design representing the **Reports** and their **Votes**.

### 4.1 `reports` Table
Entity holding the localized municipal problem data.
| Column        | Data Type           | Constraints                            | Description                                    |
|---------------|---------------------|----------------------------------------|------------------------------------------------|
| `id`          | `UUID` (or string)  | Primary Key                            | Unique identifier generated on creation        |
| `user_id`     | `UUID`              | Foreign Key / Local ID                 | Identifying marker for the submitter           |
| `category`    | `VARCHAR / ENUM`    | Not Null                               | E.g., `POTHOLE`, `TRASH`, etc.                 |
| `description` | `TEXT`              | Optional                               | Elaborative details on the report              |
| `lat`         | `DOUBLE PRECISION`  | Not Null                               | Latitude geocoordinate                         |
| `lng`         | `DOUBLE PRECISION`  | Not Null                               | Longitude geocoordinate                        |
| `photo_url`   | `VARCHAR`           | Optional                               | Cloud storage URI pointing to image evidence   |
| `status`      | `ENUM`              | Default: `OPEN`                        | Lifecycle state (`OPEN`, `IN_PROGRESS`...)     |
| `created_at`  | `TIMESTAMP`         | Default: `NOW()`                       | Record creation timestamp                      |

### 4.2 `votes` Table
Junction entity managing the many-to-many relationship of users validating reports to prevent duplicate upvoting.
| Column        | Data Type           | Constraints                            | Description                                    |
|---------------|---------------------|----------------------------------------|------------------------------------------------|
| `id`          | `UUID` (or string)  | Primary Key                            | Unique identifier for the vote interaction     |
| `report_id`   | `UUID`              | Foreign Key (`reports.id`), On Delete Cascade | Report being upvoted                           |
| `user_id`     | `UUID`              | Not Null                               | User initiating the vote                       |
| `created_at`  | `TIMESTAMP`         | Default: `NOW()`                       | Cast vote time                                 |
*Note: A `UNIQUE(user_id, report_id)` composite restriction prevents polling abuse.*

---

## 5. API Endpoints Dictionary

The backend infrastructure exposes structured routes under `/api`.

1. **`GET /api/reports`**
   - *Description:* Retrieve a paginated chronological feed of available mapped issues.
2. **`POST /api/reports`**
   - *Description:* Generates a new issue report record pushing geographical and metadata bounds into the SQL store.
3. **`PATCH /api/reports/:id/status`**
   - *Description:* Admin-authenticated endpoint permitting the state mutation (`OPEN` -> `RESOLVED`) of a designated report.
4. **`GET /api/leaderboard`**
   - *Description:* Fetches an aggregated analysis of top contributing citizens based on generated reports and successful votes.
5. **`POST /api/chat`** 
   - *Description:* Processes conversational inputs for the included Chatbot utility.

---

## 6. Security Analysis & Constraints

- **Client-Side Authorization Check:** Administrative routes restrict navigation unless `sessionStorage.getItem('isAdmin')` matches expectations, deterring non-administrative layout rendering.
- **SQL Injection Prevention:** Core database integrations (`db.execute`) enforce parameterized parameterized query preparations mitigating traditional SQLi injection threat vectors.
- **Safe Environment Variables:** Secrets (`Supabase`, `MySQL` passwords) are scoped server-side under `process.env.*` barring token spillage onto client environments.

## 7. Extensibility Recommendations
- **Geofencing Operations:** Future integrations could allow geospatial fencing assigning specific districts or constituencies to their allocated administrative branch automatically.
- **AI Triage Validation:** Incorporating visual AI models handling the initial `photo_url` upload could pre-authenticate issue severity.
- **Push Notification Infrastructure:** Migrating from React Hot Toast passive alerts to genuine device notification channels (via Web Push API) triggering when report status evolves into `RESOLVED`.
