# CivicPulse - Smart Civic Reporting System 🇧🇹

![CivicPulse Banner](https://img.shields.io/badge/Status-Hackathon_MVP-blue) ![License](https://img.shields.io/badge/License-MIT-green) ![Tech](https://img.shields.io/badge/Stack-Next.js_|_MySQL_|_Leaflet-black)

**CivicPulse** is a modern, real-time civic engagement platform designed to bridge the gap between citizens and local authorities. It empowers users to report infrastructure issues (like potholes, trash, and hazards) instantly via an interactive map, while providing administrators with a powerful dashboard to track, manage, and resolve these complaints efficiently.

Built with performance and user experience in mind, CivicPulse transforms passive observation into active community improvement.

---

## 🌟 Key Features

### For Citizens (User App)
- **📍 Interactive Map Interface**: Visual reporting using robust geolocation (Leaflet.js).
- **📸 Smart Reporting**: Submit issues with photos, categories, and detailed descriptions.
- **🚀 Real-Time Status**: Track reports from "Open" to "Pending" to "Resolved" with live updates.
- **🗳️ Community Validation**: Upvote system to prioritize urgent issues based on community consensus.
- **📱 Responsive Design**: Fully optimized for mobile and desktop experiences.

### For Authorities (Admin Dashboard)
- **🛡️ Secure Access**: Protected admin panel restricted to authorized personnel.
- **📊 Overview Dashboard**: View all reports in a comprehensive list with filtering capabilities (All, Open, Pending, Resolved).
- **✅ Status Management**: Update the lifecycle of a report with a single click.
- **🔍 Issue Visualization**: See exact locations and user-submitted photos to plan repairs.

---

## 🛠️ Technology Stack

- **Frontend**: [Next.js 14](https://nextjs.org/) (App Router, Server Components)
- **UI/Styling**: [Tailwind CSS](https://tailwindcss.com/), [Lucide React](https://lucide.dev/) (Icons)
- **Maps**: [React Leaflet](https://react-leaflet.js.org/) & OpenStreetMap
- **Database**: [MySQL](https://www.mysql.com/) (Local instance with `mysql2` driver)
- **Notifications**: React Hot Toast
- **Language**: TypeScript

---

## 🚀 Getting Started

Follow these instructions to set up the project locally.

### Prerequisites
- Node.js (v18 or higher)
- MySQL Server installed and running

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/guruwangchuk7/CivicPulse---Smart-Complain-System.git
    cd CivicPulse
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment**
    Create a `.env.local` file (though current configuration uses `lib/db.ts` directly, it is best practice to move credentials later).
    Ensure your MySQL server is running on `localhost:3306`.

4.  **Initialize Database**
    The application includes a self-initialization script. Simply running the app for the first time will attempt to create the necessary tables (`reports`, `votes`) in your MySQL database.
    *   *Database Name*: `civic_pulse` (Update in `lib/db.ts` if needed)
    *   *Credentials*: Update `user` and `password` in `lib/db.ts`.

5.  **Run the Development Server**
    ```bash
    npm run dev
    ```

6.  **Access the App**
    Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📂 Project Structure

```
├── app/
│   ├── admin/          # Admin Dashboard page
│   ├── api/            # Backend API routes (Reports, Status, Votes)
│   ├── map/            # Main Map Application
│   └── page.tsx        # Landing Page
├── components/         # Reusable UI Components (Modals, Map, Feed)
├── lib/
│   ├── db.ts           # MySQL Connection Pool
│   └── init-db.ts      # Database Schema Initialization
├── types/              # TypeScript Interfaces
└── public/             # Static Assets
```

---

## 🔒 Admin Access

To access the Admin Dashboard:
1.  Click the **"Admin"** button in the top navigation bar.
2.  Enter an authorized email address (e.g., `admin@civicpulse.com`).
3.  Manage reports, update statuses, and filter issues.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
1.  Fork the project
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

Made with ❤️ for a cleaner, smarter Bhutan.
