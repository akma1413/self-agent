# Virtual Self - Frontend Dashboard

Executive Intelligence System for AI Coding Tools and Trends Analysis

## Overview

A clean, minimal dashboard built with Next.js 15 for monitoring and managing AI-generated reports, actions, and principles extracted from coding activities.

## Tech Stack

- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS 4** for styling
- **lucide-react** for icons
- **Supabase** client for database integration

## Features

### Dashboard (/)
- Summary cards showing pending reports, actions, and active principles
- Recent reports list
- Quick action buttons for triggering analysis and navigation

### Reports (/reports)
- List view with filtering by status (pending/reviewed/archived)
- Report cards with type badges and summaries
- Individual report detail pages with full analysis
- Mark as reviewed and archive functionality

### Actions (/actions)
- List view with filtering by status
- Confirm/reject buttons for pending actions
- Priority and type badges
- Action payload preview

### Principles (/principles)
- Extracted principles from AI analysis
- Category filtering (workflow, tool_preference, quality, communication)
- Confidence score display
- Evidence tracking

### Settings (/settings)
- API configuration
- Database statistics
- Notification preferences
- System information

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with sidebar
│   ├── page.tsx            # Dashboard home
│   ├── actions/
│   │   └── page.tsx        # Actions list
│   ├── principles/
│   │   └── page.tsx        # Principles list
│   ├── reports/
│   │   ├── page.tsx        # Reports list
│   │   └── [id]/
│   │       └── page.tsx    # Report detail
│   └── settings/
│       └── page.tsx        # Settings
├── components/
│   ├── layout/
│   │   ├── header.tsx      # Page header
│   │   └── sidebar.tsx     # Navigation sidebar
│   └── ui/
│       ├── badge.tsx       # Status/type badges
│       ├── button.tsx      # Button component
│       └── card.tsx        # Card components
└── lib/
    ├── api.ts              # API client
    └── supabase/           # Supabase client setup
```

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
Create a `.env.local` file with:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Design System

### Colors
- **Primary**: blue-600 (interactive elements, CTAs)
- **Success**: green-600 (confirmed actions, positive states)
- **Warning**: amber-600 (pending items, medium priority)
- **Danger**: red-600 (rejected actions, high priority)
- **Background**: slate-50 (light) / slate-900 (dark)

### Components
All UI components follow a consistent pattern:
- Clean, minimal design
- Dark mode support
- Mobile responsive
- Accessible with proper ARIA labels

### Typography
- System font stack with Geist Sans as primary
- Korean text support
- Responsive text sizes

## API Integration

The dashboard connects to the FastAPI backend at `/api/v1`:

- `GET /agendas` - List all agendas
- `GET /reports` - List all reports
- `GET /reports/pending` - Get pending reports
- `GET /reports/{id}` - Get report details
- `POST /reports/{id}/review` - Mark report as reviewed
- `GET /actions` - List all actions
- `GET /actions/pending` - Get pending actions
- `POST /actions/{id}/confirm` - Confirm action
- `POST /actions/{id}/reject` - Reject action
- `GET /principles` - List all principles
- `POST /process/vibecoding/process` - Trigger analysis process
- `GET /process/vibecoding/weekly-summary` - Get weekly summary

## Development

### Build
```bash
npm run build
```

### Lint
```bash
npm run lint
```

### Type Check
TypeScript is automatically checked during build. All files compile without errors.

## Features Implementation

### Sidebar Navigation
- Collapsible on mobile with hamburger menu
- Active state highlighting
- Korean labels
- Icons from lucide-react

### Dark Mode
- Automatic based on system preference
- Consistent across all components
- Proper contrast ratios

### Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px)
- Touch-friendly interactive elements

### Error Handling
- Try-catch blocks for all API calls
- User-friendly error messages
- Loading states for async operations

## Future Enhancements

- Real-time updates with WebSocket
- Advanced filtering and search
- Principle editing interface
- Export functionality for reports
- User authentication and profiles
- Analytics dashboard
- Notification system integration

## License

Private - For personal use only
