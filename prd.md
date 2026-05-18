# AtomQuest HR Portal - Product Requirements Document (PRD)

## Executive Summary

**Product Name:** AtomQuest HR Portal  
**Version:** 1.0  
**Target:** AtomQuest Hackathon 1.0 - Performance Management System  
**Objective:** Build a comprehensive, production-ready Goal Setting & Performance Tracking platform that enables employees, managers, and HR admins to collaboratively set, track, and evaluate quarterly and annual goals.

---

## 1. Problem Statement

Organizations struggle with:
- **Lack of transparency** in goal-setting processes
- **Misalignment** between individual and organizational objectives
- **Manual tracking** of quarterly progress
- **Delayed feedback** cycles
- **Poor visibility** into team performance for managers
- **Compliance gaps** in performance documentation

---

## 2. Solution Overview

AtomQuest HR Portal provides a **role-based, workflow-driven platform** that:
- Enables employees to create and submit goal sheets
- Allows managers to review, approve, or return goals with feedback
- Supports shared/cascaded goals across teams
- Tracks quarterly achievements with automated scoring
- Provides real-time analytics and reporting
- Maintains complete audit trails for compliance

---

## 3. User Roles & Personas

### 3.1 Employee
**Primary Goals:**
- Create personal goal sheets aligned with organizational objectives
- Submit goals for manager approval
- Update quarterly progress
- View performance scores and feedback

**Key Workflows:**
- Draft → Submit → Revise (if returned) → Approved → Track Progress

### 3.2 Manager (L1)
**Primary Goals:**
- Review direct reports' goal sheets
- Approve or return goals with constructive feedback
- Monitor team performance
- Add quarterly check-in comments
- View team analytics

**Key Workflows:**
- Review Submissions → Approve/Return → Monitor Progress → Provide Feedback

### 3.3 Admin/HR
**Primary Goals:**
- Manage goal cycles and timelines
- Create and distribute shared goals
- Unlock goal sheets for exceptional cases
- Generate organization-wide reports
- Maintain system configuration

**Key Workflows:**
- Configure Cycles → Create Shared Goals → Monitor Compliance → Generate Reports

---

## 4. Core Features

### 4.1 Goal Sheet Management

#### 4.1.1 Goal Creation (Employee)
**Requirements:**
- Minimum 3 goals, maximum 8 goals per sheet
- Each goal must have:
  - Title (required, max 200 chars)
  - Description (optional, max 1000 chars)
  - Thrust Area (required, dropdown)
  - UOM Type (min/max/timeline/zero_based)
  - Target value (numeric, required for min/max)
  - Target date (required for timeline)
  - Weightage (10-100%, total must equal 100%)
- Real-time weightage validation
- Drag-and-drop reordering
- Auto-save drafts

**Validation Rules:**
- Total weightage must equal exactly 100%
- Individual weightage: 10% minimum
- No duplicate titles within same sheet
- Target date must be within cycle period

#### 4.1.2 Goal Submission Workflow
**States:**
1. **Draft** - Employee editing
2. **Submitted** - Awaiting manager review
3. **Under Review** - Manager actively reviewing
4. **Returned** - Manager sent back with feedback
5. **Approved** - Locked for tracking
6. **Unlocked** - Admin emergency unlock

**Transitions:**
- Draft → Submitted (employee action, validates weightage)
- Submitted → Under Review (automatic on manager view)
- Under Review → Approved (manager action, auto-locks sheet)
- Under Review → Returned (manager action with reason)
- Returned → Draft (automatic, employee can edit)
- Approved → Unlocked (admin only, with reason)

#### 4.1.3 Manager Review Interface
**Features:**
- Side-by-side view of all goals
- Inline editing of target/weightage (with employee notification)
- Comment box for each goal
- Overall approval/return decision
- Return reason (required if returning)
- Bulk actions for multiple sheets

### 4.2 Shared Goals

#### 4.2.1 Shared Goal Creation (Manager/Admin)
**Requirements:**
- Create goal template with:
  - Title, description, thrust area
  - UOM type and target
  - Target date
  - Department/team scope
- Assign to multiple employees
- Designate primary owner (tracks actual progress)
- Set individual weightages per member

#### 4.2.2 Shared Goal Behavior
**Rules:**
- Primary owner updates achievement → auto-syncs to all members
- Members can adjust their own weightage (within limits)
- Members cannot edit title/target (read-only)
- All members see same progress score
- Individual weightages can differ

### 4.3 Quarterly Check-ins

#### 4.3.1 Achievement Tracking (Employee)
**Requirements:**
- Update progress for each goal per quarter (Q1-Q4)
- Enter:
  - Actual achievement (numeric)
  - Achievement notes (text, max 500 chars)
  - Status (not_started/on_track/completed)
- System auto-calculates progress score based on UOM type
- Window-based access (only during check-in periods)

**Scoring Formulas:**
- **MIN (higher is better):** `(achievement / target) × 100`
- **MAX (lower is better):** `(target / achievement) × 100`
- **Timeline:** Blend of completion % and deadline proximity
- **Zero-based:** 100% if achievement = 0, else 0%

#### 4.3.2 Manager Check-ins
**Requirements:**
- Add quarterly comments per employee
- Provide overall rating (exceeds/meets/below/critical)
- View aggregated team progress
- Export check-in history

### 4.4 Analytics & Reporting

#### 4.4.1 Employee Dashboard
**Metrics:**
- Total goals count
- Cycle status (draft/submitted/approved)
- Overall progress percentage
- Time remaining in cycle
- Goal health distribution (pie chart)
- Recent activity feed

#### 4.4.2 Manager Dashboard
**Metrics:**
- Team completion rate
- Average team score
- Goals pending review
- At-risk goals count
- Department comparison charts
- Direct reports list with status

#### 4.4.3 Admin Dashboard
**Metrics:**
- Organization-wide completion rate
- Department-wise breakdown
- Cycle timeline visualization
- Compliance metrics (% approved on time)
- Audit log summary

#### 4.4.4 Export Capabilities
**Formats:**
- Excel (.xlsx) - Full data export
- CSV - Raw data for analysis
- PDF - Formatted reports (future)

**Export Options:**
- Individual goal sheets
- Team summaries
- Quarterly achievement reports
- Audit trails

### 4.5 Notifications

#### 4.5.1 Notification Types
1. **Submission** - Manager notified when employee submits
2. **Approval** - Employee notified when goals approved
3. **Return** - Employee notified when goals returned
4. **Check-in** - Reminders for quarterly updates
5. **Shared Goal** - Notification when added to shared goal
6. **Unlock** - Employee notified when sheet unlocked
7. **System** - Cycle deadlines, maintenance alerts

#### 4.5.2 Notification Channels
- In-app notification center (bell icon)
- Email notifications (future)
- Browser push notifications (future)

### 4.6 Audit Trail

#### 4.6.1 Logged Events
**Tracked Tables:**
- goal_sheets (all status changes, locks/unlocks)
- goals (create, update, delete)
- quarterly_achievements (all updates)

**Captured Data:**
- Timestamp
- User who made change
- Old values (JSONB)
- New values (JSONB)
- Change summary

#### 4.6.2 Audit Viewer (Admin Only)
**Features:**
- Filter by table, user, date range
- Search by record ID
- View diff of old vs new values
- Export audit logs

---

## 5. Technical Requirements

### 5.1 Frontend Stack
- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite 5
- **Styling:** TailwindCSS v3
- **State Management:** TanStack Query v5 + Zustand
- **Forms:** React Hook Form + Zod validation
- **Charts:** Recharts
- **Routing:** React Router v6
- **Animations:** Lottie, Framer Motion

### 5.2 Backend Stack
- **Database:** PostgreSQL (via Supabase)
- **Authentication:** Supabase Auth (JWT-based)
- **API:** Supabase PostgREST (auto-generated)
- **Real-time:** Supabase Realtime subscriptions
- **Storage:** Supabase Storage (for future file uploads)

### 5.3 Security
- **Row Level Security (RLS):** Enforced on all tables
- **Role-based Access Control:** employee/manager/admin
- **Session Management:** Secure JWT tokens
- **Data Encryption:** At rest and in transit
- **Audit Logging:** Immutable append-only logs

### 5.4 Performance
- **Page Load:** < 2 seconds
- **API Response:** < 500ms (p95)
- **Real-time Updates:** < 1 second latency
- **Concurrent Users:** Support 500+ simultaneous users

### 5.5 Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## 6. User Experience Requirements

### 6.1 Design Principles
- **Clarity:** Clear visual hierarchy, obvious CTAs
- **Efficiency:** Minimize clicks, keyboard shortcuts
- **Feedback:** Immediate visual feedback for all actions
- **Consistency:** Unified design language across all views
- **Accessibility:** WCAG 2.1 AA compliance

### 6.2 Key UX Flows

#### 6.2.1 Employee Goal Creation Flow
1. Land on dashboard → See "Create Goals" CTA
2. Click → Open goal editor
3. Add goals (min 3) → Real-time weightage validation
4. Submit → Confirmation modal → Success message
5. Redirect to dashboard → See "Submitted" status

#### 6.2.2 Manager Review Flow
1. Land on dashboard → See "Pending Reviews" count
2. Click → List of submitted sheets
3. Select employee → Side-by-side goal view
4. Review each goal → Add comments
5. Approve/Return → Confirmation → Success message
6. Employee receives notification

#### 6.2.3 Quarterly Check-in Flow
1. Notification: "Q2 check-in window open"
2. Navigate to Check-ins page
3. See list of approved goals
4. Update achievement for each goal
5. System auto-calculates score
6. Save → Success message

### 6.3 Empty States
- **No goals yet:** Friendly illustration + "Create Your First Goal" CTA
- **No pending reviews:** "All caught up!" message
- **Check-in closed:** Lock icon + next window date
- **No notifications:** "You're all set" message

### 6.4 Loading States
- **Skeleton screens** for data-heavy pages
- **Lottie animations** for brand consistency
- **Progress indicators** for long operations
- **Optimistic updates** for instant feedback

### 6.5 Error Handling
- **Inline validation** errors (red text below field)
- **Toast notifications** for API errors
- **Retry buttons** for failed operations
- **Fallback UI** for critical failures

---

## 7. Data Model Summary

### 7.1 Core Tables
1. **profiles** - User accounts (extends auth.users)
2. **departments** - Organizational structure
3. **goal_cycles** - Quarterly/annual periods
4. **goal_sheets** - Container for employee goals
5. **goals** - Individual goal rows
6. **shared_goal_groups** - Shared goal templates
7. **shared_goal_members** - Employee assignments
8. **quarterly_achievements** - Progress tracking
9. **manager_checkins** - Manager feedback
10. **audit_logs** - Change history
11. **notifications** - In-app alerts

### 7.2 Key Relationships
- Employee → Manager (profiles.manager_id)
- Goal Sheet → Goals (1:many)
- Shared Goal Group → Members (1:many)
- Goal → Quarterly Achievements (1:4, one per quarter)
- Goal Sheet → Manager Check-ins (1:many)

---

## 8. Success Metrics

### 8.1 Adoption Metrics
- **User Activation:** 90% of employees create goals within first cycle
- **Submission Rate:** 95% of employees submit on time
- **Manager Engagement:** 90% of managers review within 48 hours
- **Check-in Completion:** 85% of employees update quarterly

### 8.2 Performance Metrics
- **System Uptime:** 99.9%
- **Page Load Time:** < 2 seconds (p95)
- **Error Rate:** < 0.1%
- **User Satisfaction:** NPS > 50

### 8.3 Business Metrics
- **Goal Alignment:** 80% of goals linked to org objectives
- **On-time Completion:** 90% of goals completed by deadline
- **Manager Feedback:** 100% of employees receive quarterly feedback
- **Audit Compliance:** 100% of changes logged

---

## 9. Future Enhancements (Post-Hackathon)

### 9.1 Phase 2 Features
- **360-degree feedback** - Peer reviews
- **Development plans** - Skill gap analysis
- **Succession planning** - Talent pipeline
- **Compensation integration** - Link performance to rewards
- **Mobile app** - iOS/Android native apps

### 9.2 Phase 3 Features
- **AI-powered insights** - Goal recommendations
- **Predictive analytics** - Risk identification
- **Integrations** - HRIS, Slack, Teams
- **Advanced reporting** - Custom dashboards
- **Multi-language support** - Localization

---

## 10. Hackathon Evaluation Criteria Alignment

### 10.1 Innovation (25%)
- **Shared goal cascading** with auto-sync
- **Real-time progress scoring** with multiple UOM types
- **Audit trail** for compliance
- **Role-based workflows** with state machine

### 10.2 Technical Excellence (25%)
- **Modern tech stack** (React 18, TypeScript, Supabase)
- **Type-safe** end-to-end
- **Row-level security** enforced
- **Scalable architecture** (serverless)

### 10.3 User Experience (25%)
- **Beautiful UI** with Lottie animations
- **Intuitive workflows** with minimal training
- **Responsive design** (mobile-friendly)
- **Accessibility** compliant

### 10.4 Completeness (25%)
- **Fully functional** all core workflows
- **Production-ready** code quality
- **Comprehensive testing** (manual QA)
- **Documentation** (README, PRD, API docs)

---

## 11. Deployment Plan

### 11.1 Development Environment
- **Local Supabase:** Docker-based local instance
- **Hot Reload:** Vite dev server
- **Seed Data:** Realistic demo users and goals

### 11.2 Production Environment
- **Frontend:** Vercel (auto-deploy from main branch)
- **Backend:** Supabase Cloud (managed PostgreSQL)
- **Domain:** Custom domain with SSL
- **Monitoring:** Vercel Analytics + Supabase Dashboard

### 11.3 CI/CD Pipeline
- **Linting:** ESLint + Prettier
- **Type Checking:** TypeScript strict mode
- **Build:** Vite production build
- **Deploy:** Automatic on merge to main

---

## 12. Conclusion

AtomQuest HR Portal is a **production-ready, enterprise-grade** performance management system that addresses real organizational pain points with a modern, user-friendly interface. By combining robust backend logic (RLS, triggers, audit trails) with a delightful frontend experience (Lottie animations, real-time updates), this platform stands out as a **hackathon-winning solution** that can scale to real-world usage.

**Key Differentiators:**
1. **Shared goal cascading** - Unique feature for organizational alignment
2. **Automated progress scoring** - Reduces manual calculation errors
3. **Complete audit trail** - Enterprise compliance built-in
4. **Beautiful UX** - Not just functional, but delightful to use
5. **Production-ready** - Can be deployed immediately

This is not just a hackathon project—it's a **real product** that organizations would actually use.
