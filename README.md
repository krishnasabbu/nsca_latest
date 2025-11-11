# Nature Space Cricket Academy - Admin & Coach Portal

A modern, responsive web application for managing cricket academy operations with role-based dashboards for Admin and Coach.

## Features

### Authentication
- Role-based login (Admin & Coach)
- Secure authentication with Google Apps Script backend

### Admin Features
- **Dashboard**: Overview with analytics (revenue, students, sessions, growth)
- **Players Management**: Add, edit, delete players with filtering and search
- **Staff Management**: Manage coaches and support staff
- **Batch Management**: Create and organize training batches
- **Media Management**: Upload and manage training videos and photos
- **Yoyo Test Results**: Track player fitness performance
- **Attendance**: Daily attendance tracking with calendar view
- **Fee Management**: Track student payments and pending fees
- **Salary Management**: Manage coach and staff salaries

### Coach Features
- **Dashboard**: Personal overview with student stats
- **My Players**: Manage assigned players
- **My Batches**: View and manage assigned batches
- **Media Upload**: Share training content
- **Yoyo Test**: Add player test results
- **Attendance**: Mark daily attendance for assigned students

## Technology Stack

- **Frontend**: React 18 + TypeScript
- **Routing**: React Router v6
- **State Management**: Zustand
- **Styling**: TailwindCSS
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Backend**: Google Apps Script REST API

## Theme Support

- Light Mode
- Dark Mode
- System Theme (auto-detects OS preference)

## Responsive Design

- Mobile-first approach
- Fully responsive layout
- Touch-friendly interface
- Mobile menu with overlay

## API Integration

The app connects to Google Apps Script backend at:
```
https://script.google.com/macros/s/AKfycbxcGtEsqgOBrBCCCxQqZYIFBYcJnCCth0U2CbTl1b3vvdhdKuS6tP3JtpKGh962cIOA/exec
```

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Type check
npm run typecheck
```

## Design Philosophy

- Clean, modern UI with green and yellow accent colors (Nature Space branding)
- Smooth transitions and animations
- Consistent spacing using 8px grid system
- Professional typography with proper hierarchy
- Accessible color contrast ratios

## Project Structure

```
src/
├── components/
│   ├── Layout/          # Sidebar, Topbar, DashboardLayout
│   └── UI/              # Card, Modal components
├── pages/
│   ├── Admin/           # Admin pages
│   ├── Coach/           # Coach pages
│   └── LoginPage.tsx    # Authentication
├── services/
│   └── api.ts           # API service layer
├── store/
│   ├── authStore.ts     # Authentication state
│   └── themeStore.ts    # Theme state
├── types/
│   └── index.ts         # TypeScript types
└── App.tsx              # Main app with routing
```
