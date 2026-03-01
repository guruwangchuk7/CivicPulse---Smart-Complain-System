🎨 Summary of the Dribbble Design

Title: Project management dashboard | Business Analytics App
Designer: George Lov® for Fireart Studio
Concept: A data-driven dashboard interface that visually presents key project analytics like revenue, expenses, sales, profit, customer satisfaction, and other performance metrics.

This design features:

Graphs & charts for financial metrics

Summary cards highlighting key values

Sidebar navigation

Clean hierarchical UI with layered charts and numbers

Modern, minimalist visual style

This is a great reference if you want to make Civic Pulse’s interface look professional, data-centric, and dashboard-oriented.

🧠 Design Document for Civic Pulse Website (Based on the Above Inspiration)

Below is a structured design doc template you can give to Gemini or a design team to start creating visuals and UI specs.

1. Overview

Goal:
Create a Civic Pulse dashboard that visually communicates civic engagement data, trends, and analytics in a meaningful way, inspired by the “Project Management Dashboard | Business Analytics App” design.

Target Users:

Civic administrators

Community organizers

Researchers

Public users interested in civic data

2. UI Structure and Layout
Home / Dashboard Screen

Header:

Logo + site name (Civic Pulse)

Global search

Profile access / settings icon

Sidebar Navigation:

Dashboard

Projects & Initiatives

Engagement Metrics

Community Feedback

Reports

Settings

3. Core Components
📊 Top Summary Cards

Place summary cards at the top with key civic metrics:

Example Metric	Description
Active Initiatives	Total number of ongoing civic projects
Engagement Score	Index based on user participation
Funding Utilized	Total funding used vs available
Satisfaction Level	Aggregated from surveys or polls

Visuals:

Clear numeric display (big font)

Color-coded highlights for status

Simple icon for each metric

📈 Charts and Graphs Section

Trend Graph: Yearly/Monthly engagement trend (line chart style)

Category Breakdown: Bar chart showing Volunteer activity, Event participation

Geographical Analytics: Map or heatmap for region-wise engagement

Note: In your Dribbble reference design, the charts are centered and prominent; adopt that hierarchy for Civic Pulse too.

4. Interaction & Navigation

Filtering Tools:
Ability to filter by date range, region, and project type

Responsive Breakpoints:

Desktop: grid layout

Tablet: simplified grid

Mobile: collapsible sidebar, vertical scrolling

Hover / Click Interactions:
Chart tooltips, clickable cards to expand details

5. Visual Style Guidelines (Based on Dribbble Inspiration)

Color Palette:
Use neutral base colors with vibrant accent colors for highlights (inspired by the design’s clean look).

Neutral backgrounds (light gray / white)

Deep text colors for readability

Accent colors for key metrics or status

Typography:

Sans-serif font family (modern, clean)

Hierarchy:

H1: Large, bold dashboard titles

H2/H3: Clear section headers

Body text: legible for information density

Spacing / Layout:

Use consistent spacing and alignment

Card UI with rounded corners, subtle shadows

6. Wireframes & UI Screens

Create wireframes for the following screens:

Landing / Login Screen

Civic Pulse logo

Login / Sign up

Dashboard Overview

Summary cards + charts

Filters & Details Page

User can interact with filters

Display updated graphs

Reports & Exports

Page for printable exports

Tip: Label each wireframe with UI states (normal, hover, active).

7. UI Specifications (for developers/designers)
UI Element	Size	Color	Behavior
Summary Card	240×120 px	Accent background	Press expands detail
Line Chart	Full width	Dark line over grid	Tooltip on hover
Sidebar	Fixed 240 px	Neutral background	Active item highlight
8. Assets to Provide to Design Tools

Ask Gemini or your design team to output:

✅ Vector wireframes (Figma / XD)
✅ Clickable prototype
✅ Color palette values
✅ Typography scale
✅ Icon set
✅ Component library (buttons, cards, filters)import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createClient } from '@/utils/supabase/server';
import { isAdmin } from '@/lib/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user || !isAdmin(user.email)) {
            return NextResponse.json({ error: 'Unauthorized: Admin access required.' }, { status: 401 });
        }

        // Overall summary counts
        let summary: any = { total: 0, open_count: 0, in_progress: 0, resolved: 0, avg_resolution_hours: null };
        try {
            const [summaryRows] = await db.execute(`
                SELECT
                    COUNT(*) AS total,
                    SUM(CASE WHEN status = 'OPEN' THEN 1 ELSE 0 END) AS open_count,
                    SUM(CASE WHEN status = 'IN_PROGRESS' THEN 1 ELSE 0 END) AS in_progress,
                    SUM(CASE WHEN status = 'RESOLVED' THEN 1 ELSE 0 END) AS resolved,
                    AVG(
                        CASE 
                            WHEN status = 'RESOLVED' AND resolved_at IS NOT NULL AND assigned_at IS NOT NULL
                            THEN TIMESTAMPDIFF(HOUR, assigned_at, resolved_at)
                            ELSE NULL
                        END
                    ) AS avg_resolution_hours
                FROM reports
            `);
            summary = (summaryRows as any)[0];
        } catch (e) {
            console.error('Analytics: Summary query failed, falling back to basic counts', e);
            const [basicRows] = await db.execute(`
                SELECT
                    COUNT(*) AS total,
                    SUM(CASE WHEN status = 'OPEN' THEN 1 ELSE 0 END) AS open_count,
                    SUM(CASE WHEN status = 'IN_PROGRESS' THEN 1 ELSE 0 END) AS in_progress,
                    SUM(CASE WHEN status = 'RESOLVED' THEN 1 ELSE 0 END) AS resolved
                FROM reports
            `);
            summary = { ...(basicRows as any)[0], avg_resolution_hours: null };
        }

        // By category
        const [categoryRows] = await db.execute(`
            SELECT category, COUNT(*) AS count
            FROM reports
            GROUP BY category
            ORDER BY count DESC
        `);

        // Reports per day for last 7 days
        const [trendsRows] = await db.execute(`
            SELECT 
                DATE(created_at) AS date,
                COUNT(*) AS count
            FROM reports
            WHERE created_at >= NOW() - INTERVAL 7 DAY
            GROUP BY DATE(created_at)
            ORDER BY date ASC
        `);

        // Department breakdown
        let deptRows: any[] = [];
        try {
            const [rows] = await db.execute(`
                SELECT 
                    department,
                    COUNT(*) AS total,
                    SUM(CASE WHEN status = 'OPEN' THEN 1 ELSE 0 END) AS open_count,
                    SUM(CASE WHEN status = 'RESOLVED' THEN 1 ELSE 0 END) AS resolved
                FROM reports
                GROUP BY department
            `);
            deptRows = rows as any[];
        } catch (e) {
            console.error('Analytics: Department query failed (migration may be missing)', e);
            deptRows = [];
        }

        const summaryFinal = summary;

        return NextResponse.json({
            total: Number(summaryFinal.total),
            open: Number(summaryFinal.open_count),
            in_progress: Number(summaryFinal.in_progress),
            resolved: Number(summaryFinal.resolved),
            avg_resolution_hours: summaryFinal.avg_resolution_hours
                ? parseFloat(summaryFinal.avg_resolution_hours).toFixed(1)
                : null,
            by_category: categoryRows,
            trends: trendsRows,
            by_department: deptRows,
        });
    } catch (error: any) {
        console.error('Analytics error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
