# Dashboard Project - Task Tracker

## Phase 1 to 4: Initiation, Specs, & Data ETL
- [x] Phase 1: Initiation & Discovery
- [x] Phase 2: Technical Documentation (PRD, Architecture v2, Design-System)
- [x] Phase 3: Tech Stack Selection (Decoupled: React Vite + Express + Supabase)
- [x] Phase 4: Data Migration (ETL Script & CSV Generation)

## Phase 5: Core Infrastructure (Setup) (Completed)
- [x] Initialize Frontend (React Vite + TypeScript + Tailwind v4)
- [x] Configure Shadcn UI (Luma Preset) & Path Aliases
- [x] Install Frontend Libs (TanStack Table, Recharts, Framer Motion, React Router)
- [x] Initialize Backend (Node.js, Express, TypeScript)
- [x] Setup Supabase Client Connection (Frontend & Backend)

## Phase 6: Frontend Development (Atomic UI & Client Logic)
### 6.1. Routing & Shell Setup
- [x] Implement `react-router-dom` basic routes (`App.tsx` & `main.tsx`)
### 6.2. Sidebar (Organism)
- [x] Atom: Navigation Icon Buttons & Links
- [x] Molecule: Sidebar Menu Group
- [x] Organism: Complete Sidebar Layout (Responsiveness & Telkom Navy colors)
- [x] Logic: Desktop Collapsible Sidebar (`w-[240px]` ⇄ `w-[72px]`) with persistent `localStorage` and Navbar toggle button
### 6.3. Navbar (Organism)
- [x] Atom: User Profile Avatar
- [x] Atom: Global Search Input Field
- [x] Molecule: User Profile Dropdown & Search Bar Assembly
- [x] Organism: Complete Navbar (Glassmorphism effect)
### 6.4. Global Layout (Template)
- [x] Template: Assemble Sidebar & Navbar into `GlobalLayout.tsx`
- [ ] Logic: Add Framer Motion page transitions
### 6.5. Tab 2: Master Repository Table (Page)
- [x] Atom: Status Badges (Red/Green/Yellow)
- [x] Molecule: Table Pagination & Virtual Scrolling (@tanstack/react-virtual)
- [x] Molecule: Universal Column Sorting Header (13 columns sortable: A-Z, dates, numbers, SLA)
- [x] Organism: TanStack Table Core Implementation (38 columns)
- [x] Organism: Client-Side Local Search & Filtering Integration
- [x] Page: Final Assembly of `Repository.tsx`
### 6.6. Tab 1: Reporting Analytics (Page)
- [ ] Molecule: Summary Metric Cards
- [ ] Organism: Recharts Bar/Line/Pie instances
- [ ] Page: Final Assembly of `Dashboard.tsx`
### 6.7. Authentication UI (Organism)
- [ ] Organism: Login Form with Zod Validation
- [ ] Logic: Supabase Auth integration

## Phase 7: Backend Development (API & Microservices)
- [ ] Develop Express API Architecture (Controllers, Routes, Middleware)
- [ ] Implement JWT Verification Middleware (Supabase Auth checks)
- [ ] Develop Telegram Bot Webhook (v2)
- [ ] Develop Document Generator Logic (.docx BAPL automation)

## Phase 8: Deployment & Operations
- [ ] Deploy Frontend (Vercel)
- [ ] Deploy Backend (Render / VPS)
- [ ] Configure CORS & Production Environment Variables
- [ ] Security Audit & Performance Testing
