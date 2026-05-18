# AtomQuest HR Portal — context.md
> Single Source of Truth. Update after every meaningful action.
> Last Updated: 2026-05-16 | Step: 1 (Planning)

---

## Project Overview
Browser-based Goal Setting & Tracking Portal for the AtomQuest Hackathon.
Three roles: Employee · Manager (L1) · Admin/HR.

## Tech Stack
- **Frontend:** React 18 + TypeScript + Vite 5
- **Styling:** TailwindCSS v3 + custom design tokens
- **State:** TanStack Query v5 + Zustand
- **Forms:** React Hook Form + Zod
- **Charts:** Recharts
- **Export:** xlsx + papaparse
- **Routing:** React Router v6
- **Backend:** Supabase (PostgreSQL + Auth + RLS + Realtime)
- **Hosting target:** Vercel (frontend) + Supabase cloud

## Architecture
```
atomq_hr/
├── frontend/   (Vite React app)
├── supabase/   (migrations + seed SQL)
└── context.md
```

## Feature Status
### Phase A — Foundation
- [x] Database schema + RLS + triggers
- [x] Seed data
- [x] Vite scaffold + routing
- [x] Auth flow + role dashboards

### Phase B — Core
- [x] Employee goal creation + validation
- [x] Submission workflow
- [x] Manager review + approve/return
- [x] Goal locking
- [x] Shared goals
- [x] Quarterly achievement tracking
- [x] Manager check-in comments
- [x] Progress score computation
- [x] Completion dashboard
- [ ] Achievement export
- [x] Audit trail

### Phase C — Differentiator
- [x] Analytics module
- [ ] Notifications (P2)

### Phase D — Demo
- [x] Demo role switcher
- [x] Seeded realistic data
- [x] Empty/loading/error states
- [x] QA pass

## Data Models
> To be populated in STEP 2.

## API Contracts
> Supabase PostgREST — documented per table in STEP 2.

## Technical Debt
> None yet.
