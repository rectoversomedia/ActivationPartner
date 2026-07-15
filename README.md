# Rectoverso Activation Partner Management System

Sistem manajemen aktivasi untuk kampanye Rectoverso dengan fitur lengkap untuk partner aktivasi, PIC, dan Campaign Manager.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS + shadcn/ui
- **Icons**: Phosphor Icons (Colorful)
- **Database**: Supabase PostgreSQL
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage
- **Validation**: Zod + React Hook Form
- **Tables**: TanStack Table
- **Charts**: Recharts
- **Deployment**: Vercel

## Campaigns

Multi-brand campaign platform supporting:
- **FIFGO Reputation Improvement Campaign** (Initial)
- Configurable for future campaigns

### FIFGO Campaign Details
- Fee: IDR 5,000 per valid activation
- Payment: Weekly
- QC Required: Yes
- Evidence Required: Yes

## Features

- 🔐 Role-Based Access Control (Super Admin, Campaign Manager, PIC, Partner)
- 📱 Mobile-First Submission Form
- 🔍 Automated Fraud & Duplicate Detection
- ✅ Quality Control Workflow
- 💰 Weekly Payment Management
- 📊 Real-time Dashboards
- 🔔 Notification System
- 📝 Complete Audit Trail

## Getting Started

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local

# Run database migrations
npx supabase db push

# Seed database
npx supabase db seed

# Run development server
npm run dev
```

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@rectoverso.id | Password123! |
| Campaign Manager | manager@rectoverso.id | Password123! |
| PIC 1 | pic1@rectoverso.id | Password123! |
| PIC 2 | pic2@rectoverso.id | Password123! |
| Partner 1-20 | partner1@rectoverso.id - partner20@rectoverso.id | Password123! |

## User Roles

### Super Admin
Full system access, manage all organizations and campaigns

### Campaign Manager
Manage campaigns, review all submissions, create payment batches

### PIC (Partner In Charge)
Review assigned partners' submissions, conduct QC

### Activation Partner
Submit activations, view own submissions and earnings

## Security Features

- Row Level Security (RLS) on all sensitive tables
- Server-side permission validation
- Zod input validation
- Encrypted sensitive data (bank accounts, national ID)
- Complete audit logging
- No direct database access for partners

## License

Proprietary - Rectoverso Media
