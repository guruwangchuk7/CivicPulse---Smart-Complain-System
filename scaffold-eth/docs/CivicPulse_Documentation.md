# CivicPulse - Smart Civic Reporting System: Technical Documentation

## 1. Website Overview
**CivicPulse** is a cutting-edge civic engagement platform designed to streamline infrastructure reporting and community improvement. It provides a real-time, map-based interface for citizens to report local issues and a robust dashboard for authorities to manage these reports efficiently. 

Built as a high-performance web application, CivicPulse bridges the communication gap between the public and local government through transparency, data-driven prioritization, and gamified community action.

---

## 2. Purpose of the Platform
The primary goal of CivicPulse is to transform passive observation into active community participation. In many urban environments, reporting issues like potholes, illegal trash dumping, or hazards is often slow, opaque, and bureaucratic. 

**CivicPulse solves this by:**
- **Centralizing Infrastructure Data**: Creating a single source of truth for all reported issues using a hybrid Web2.5 database architecture.
- **Enabling Instant Reporting**: Allowing users to report issues in seconds via a mobile-responsive map without needing crypto wallets.
- **Improving Transparency (Web3)**: Letting citizens track the status of their reports in real-time and cryptographically verifying the city's repair claims.
- **Optimizing Resource Allocation**: Helping authorities prioritize repairs based on community upvotes and time-weighted priority scores.

---

## 3. Key Features and Functionality

### 🗺️ Citizen Interface (User App)
- **Interactive Map (Leaflet.js)**: A live, full-screen map showing all active reports in the area. 
- **Smart 3-Step Reporting**:
    1. **Categorization**: Choose from predefined categories (Pothole, Trash, Hazard, Other).
    2. **Details & Capture**: Upload photos (with mobile camera support) and add descriptions.
    3. **Precision Pinning**: Pan the map to drop a pin at the exact GPS coordinates of the issue.
- **Community Validation (Upvoting)**: Users can upvote existing reports to signal urgency, which directly impacts the internal priority score.
- **Blockchain Anchoring (Web2.5)**: High priority reports are automatically and gaslessly anchored to an Ethereum smart contract, issuing users an immutable 🔗 On-Chain Verified receipt.
- **Nearby Feed**: A slide-up "Nearby Feed" that lists the most recent and relevant reports based on map view.
- **Leaderboard & Gamification**: A "Trust Score" system (`Reports × 10 + Upvotes × 3`) that ranks users as "Civic Heroes" to encourage engagement.
- **CivicBot AI**: A built-in assistant that can answer questions about local trends and specific issue counts.

### 📊 Authority Dashboard (Admin Panel)
- **Analytics & KPIs**: Real-time tracking of Total Reports, Active Issues, Processing (Pending), and Resolution Rates.
- **Priority Scoring Engine**: An automated system that calculates urgency based on a 72-hour aging factor and upvote counts:
  `Score = (Votes × 3) + (Age Factor [0-30])`
- **Department Auto-Assignment**: Reports are automatically routed to relevant departments (e.g., Potholes → ROADS, Trash → SANITATION).
- **Report Management Queue**: A powerful tabular view for admins to filter, search, and bulk-update report statuses (Open, Pending, Resolved).
- **Proof of Resolution (Blockchain)**: When an admin marks a job "Resolved", the system forces an on-chain transaction proving they completed the work, attaching a cryptographic receipt.
- **Visual Analytics**: Interactive breakdowns by category, department, and 7-day reporting trends.

---

## 4. How Users Interact with the System

### For a Resident (Reporting an Issue):
1. **Locate**: Open the app and pan the map to the location of the issue.
2. **Report**: Click the "Report Issue" button.
3. **Detail**: Select a category, take/upload a photo, and add any clarifying notes.
4. **Submit**: Confirm the location and submit. The app immediately saves data to Supabase (Web2) for speed, while simultaneously anchoring a cryptographic hash to the Polygon blockchain (Web3) in the background.
5. **Track**: Revisit the marker on the map to see if the status has shifted. A 🔗 On-Chain Verified badge proves the city received the report.

### For an Official (Managing Repairs):
1. **Login**: Access the Secure Admin Dashboard via authorized credentials.
2. **Analyze**: Use the Analytics tab to identify high-density issue zones or categories.
3. **Dispatch**: Switch to the Reports tab, identify high-priority items (indicated by a pulse effect), and assign teams.
4. **Update**: Mark the issue as "Pending" once work begins.
5. **Prove Resolution**: Mark it as "Resolved" once completed. This triggers a secondary smart contract function (`markResolved(id, proofHash)`) that permanently stamps the completion date into the blockchain ledger.

---

## 5. Technical Components

### Frontend
- **Framework**: **Next.js 14** (App Router) for high performance and SEO-friendly rendering.
- **Styling**: **Tailwind CSS** for a modern, responsive design with "Glassmorphism" effects.
- **State Management**: **SWR** for real-time data fetching and optimistic UI updates.
- **Icons**: **Lucide React** for clean, scalable iconography.
- **Notifications**: **React Hot Toast** for instant user feedback.

### Backend & Database
- **Primary Database**: **MySQL** (local connection via `mysql2/promise`) for structured report and vote data.
- **Secondary Services**: **Supabase** is utilized for:
    - **Authentication**: Secure admin login logic.
    - **Storage**: (Planned/Active) for user-submitted photos.
    - **Real-time Elements**: Powering portions of the Chatbot logic.
- **API Architecture**: Next.js Serverless Routes for:
    - `/api/reports`: Handles GET (listing/filtering) and POST (creating), alongside background execution of Web3 transactions.
    - `/api/reports/[id]/status`: Handles status updates.
    - `/api/analytics`: Aggregates data for the admin home view.
    - `/api/leaderboard`: Computes user rankings.

### Web3 & Blockchain (Web2.5 Truth Layer)
**CivicPulse uses a "Web2.5" Hybrid Architecture.** To maintain high-speed map loads and avoid charging users "Gas Fees" for uploading huge photos to the blockchain, we use a hybrid model:
- The **Filing Cabinet (Supabase/MySQL)** stores heavy data like photos and coordinates for fast frontend rendering.
- The **Notary Public (Blockchain)** stores tiny cryptographic hashes representing the Supabase data, ensuring city officials cannot quietly delete reports.

- **Framework**: **Scaffold-ETH 2** (Hardhat / Solidity) used for the smart contract infrastructure.
- **Smart Contract**: Immutable `CivicPulse.sol` registry that tracks timestamps, citizen addresses, and guarantees Proof of Resolution.
- **Client**: **Viem** handles gas-abstracted background signing. The backend server acts as the "Paymaster," allowing everyday citizens to interact with the Ethereum blockchain entirely seamlessly.

### Mapping & Geolocation
- **Engine**: **React Leaflet** wrapper over **OpenStreetMap**.
- **Features**: Custom marker icons based on category type, GPS-based "Locate Me" functionality, and map-center reticle pinning.

---

## 6. Conclusion
CivicPulse is more than just a reporting tool; it is a data-driven ecosystem for urban management. By combining modern web technologies like Next.js and Leaflet with a mission-driven approach to community improvement, it empowers every citizen to have a direct, visible impact on their neighborhood's future.
