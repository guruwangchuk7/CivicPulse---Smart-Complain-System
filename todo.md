# CivicPulse Implementation Tasks

This document outlines the step-by-step plan to build the CivicPulse MVP based on the PRD, Design Document, and Technical Rules.

## Phase 1: Project Setup & Infrastructure
- [x] **Initialize Project**
  - [x] Create Next.js app with TypeScript and Tailwind CSS (`npx create-next-app@latest`).
  - [x] Configure `eslint` and `prettier`.
  - [x] Set up folder structure: `/app`, `/lib`, `/components`, `/types`.
- [ ] **Supabase Setup**
  - [ ] Create Supabase project.
  - [ ] Define Database Schema:
    - [ ] `reports` table (id, userId, category, description, lat, lng, photoUrl, status, createdAt).
    - [ ] `votes` table (id, reportId, userId, createdAt).
    - [ ] `users` table (optional/ if using auth).
  - [ ] Configure Storage bucket for photos.
  - [ ] Set up Environment Variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) in `.env.local`.
  - [ ] Create Supabase client helper in `/lib/supabase.ts`.

## Phase 2: Map Core & Reporting (MVP Critical Path)
- [x] **Map Interface**
  - [x] Install dependencies: `leaflet`, `react-leaflet`, `leaflet-defaulticon-compatibility`, `leaflet-geosearch` (if needed).
  - [x] Create `MapHome` component (Leaflet map focused on default city/user location).
  - [x] Add "Drop Pin" functionality (click listener captures lat/lng).
- [x] **Report Creation Flow**
  - [x] Create `CreateReportModal` / Bottom Sheet.
  - [x] **Step 1:** Category Selector (Potholes, Trash, Hazards) - Color coded.
  - [x] **Step 2:** Description Text Area.
  - [x] **Step 3:** Photo Upload (Handle file selection and upload to Supabase Storage).
  - [x] **Step 4:** Confirm Location Preview.
  - [x] Implement `POST /api/reports` API route.
  - [x] Validate inputs and store report in Supabase.
- [x] **Display Reports**
  - [x] Implement `GET /api/reports` API route.
  - [x] Search/Fetch reports based on viewport (optional) or all recent reports.
  - [x] Render Report Pins on the Map (Custom markers by category).
  - [ ] Create `ReportDetail` Drawer (opens on Pin click).
    - [ ] Show Photo, Description, Status, Time, Upvote count.

## Phase 3: Voting & Engagement
- [x] **Voting System**
  - [x] Implement `POST /api/reports/:id/upvote` API route.
  - [x] Add "Upvote" button to `ReportDetail` and `NearbyFeed`.
  - [x] Handle optimistic UI updates for vote count.
  - [x] Prevent double voting (check local storage or user ID).
- [x] **Nearby Feed / Trending**
  - [x] Create `NearbyFeed` list view component.
  - [x] Sort reports by "Visibility Score" (Upvote count).
  - [x] Display summary cards: Category icon, Status pill, Distance, Upvotes.

## Phase 4: Leaderboard & Gamification
- [x] **Leaderboard**
  - [x] Implement `GET /api/leaderboard` API route.
  - [x] Create `LeaderboardPage`.
  - [x] Display top users by Number of Reports and/or Upvotes Received.

## Phase 5: AI Chatbot (Demo)
- [x] **Chat Interface**
  - [x] Create floating "Ask Chatbot" button or tab.
  - [x] Create simple Chat UI (User message, Bot response).
- [x] **Logic**
  - [x] Implement `POST /api/chat` endpoint.
  - [x] Connect to simple logic or pre-written FAQ responses (e.g., "What's trending nearby?").

## Phase 6: Polish & Deployment
- [x] **UI/UX Refinement**
  - [x] Ensure high-contrast colors and accessibility.
  - [x] Verify tap targets are >= 44px.
  - [x] Add toast notifications for success/errors (Report submitted, Vote recorded).
- [x] **Security (Lightweight)**
  - [x] Implement rate limiting (max 5 reports/day/user).
  - [x] Validate coordinates (reject obviously invalid ones).
- [ ] **Deployment**
  - [ ] Push code to GitHub (Single Repo).
  - [ ] Deploy to Vercel.
  - [ ] Verify production functionality.
