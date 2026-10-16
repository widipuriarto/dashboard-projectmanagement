# System Architecture Blueprint

**Project**: RSO Area 1 Project Management Dashboard
**Status**: Approved (Revised: Decoupled Architecture)
**Version**: 2.0

## 1. Executive Summary
Sistem ini menggunakan **Decoupled Architecture** yang memisahkan antara *Frontend* dan *Backend* secara fisik. Pendekatan ini dipilih untuk memastikan skalabilitas jangka panjang, kemudahan pembaruan fitur, dan pemisahan beban komputasi. *Frontend* menggunakan **React (Vite)** untuk performa *Single Page Application (SPA)* yang maksimal, sedangkan *Backend* kustom dibangun dengan **Node.js (Express.js)** untuk menangani logika bisnis kompleks. Penyimpanan data dan autentikasi tetap dikelola secara *fully-managed* oleh **Supabase (PostgreSQL)**.

## 2. Architecture Topology (High-Level)

```mermaid
graph TD
    %% Entities
    Client[Web Browser Client]
    Vercel[Vercel / Frontend Host]
    Vite[React SPA Vite]
    Express[Node.js Express Backend]
    Supabase[Supabase Platform]
    DB[(PostgreSQL DB)]
    Auth[Supabase Auth]
    Bot[Telegram Bot v2]

    %% Connections
    Client <-->|HTTPS| Vercel
    Vercel -->|Serves Static Files| Vite
    Vite <-->|REST API| Express
    Vite <-->|PostgREST API (CRUD)| Supabase
    Express <-->|Supabase Admin SDK| Supabase
    Supabase <--> DB
    Supabase <--> Auth
    Bot -.->|Webhook / Polling| Express
```

## 3. Technology Stack & Justification
- **Frontend Framework**: `React 18+` dengan *build tool* `Vite` dan `TypeScript`.
  - *Justifikasi*: Vite memberikan kompilasi *development* instan (HMR). React sebagai SPA murni tidak membebani server dan sangat responsif di sisi klien.
- **Backend API Framework**: `Node.js` dengan `Express.js` dan `TypeScript`.
  - *Justifikasi*: Memberikan ruang khusus untuk logika server berat, *proxy* API internal (NCX/Bima), dan generasi dokumen tanpa mengekspos *credential* ke klien.
- **Database & Backend-as-a-Service (BaaS)**: `Supabase`.
  - *Justifikasi*: *Free tier* memberikan 500MB *storage* dan 50.000 MAU. Supabase menangani operasi CRUD standar secara langsung (PostgREST) dengan *Row Level Security* (RLS).
- **UI & Styling**: `Tailwind CSS`, `Shadcn UI`, `TanStack Table`, `Framer Motion`.
  - *Justifikasi*: TanStack Table menangani *client-side processing* untuk 38 kolom secara asinkron dengan efisien.
- **Hosting & CI/CD**: 
  - **Frontend**: `Vercel` atau `Netlify` (Optimal untuk aset statis SPA).
  - **Backend**: `Render` / `Railway` / `VPS Telkom` (Cocok untuk layanan Node.js yang berjalan 24/7).

## 4. Data Flow & State Management
1. **Direct DB Operations (Client to Supabase)**: Untuk efisiensi *bandwidth* dan beban *backend*, pengambilan data standar (Tabel, Pivot) dan mutasi CRUD dasar dilakukan langsung dari Frontend (React) ke Supabase menggunakan *Supabase Client SDK*.
2. **Complex Mutations (Client to Express)**: Aksi kompleks seperti *generate* dokumen `.docx` (BAPL) atau integrasi sistem pihak ketiga akan dikirimkan dari Frontend ke REST API Express.js.
3. **State Management**: Data dikelola menggunakan *Client State* (React Query / TanStack Table) untuk *filtering*, *sorting*, dan *pagination* di memori browser.

## 5. Authentication & Security (Supabase Auth)
- **Metode**: Email & Password Login melalui *Supabase Auth*.
- **Session Management**: JWT (JSON Web Token) di sisi klien, yang disertakan dalam setiap permintaan HTTP (*Request Header*) baik ke Supabase maupun ke Backend Express.
- **Row Level Security (RLS)**: Diaktifkan pada level PostgreSQL untuk mencegah akses data dari *user* yang tidak memiliki sesi valid.

## 6. Integrasi Masa Depan (v2)
- **Bima/NCX API Proxy**: Rute API internal Telkom akan diakses dari Backend Express untuk mencegah *CORS error* dan mengamankan API Key rahasia.
- **Telegram Bot BAPL**: Akan berjalan sebagai *service* / *webhook* independen di dalam Backend Node.js yang dapat berkomunikasi dengan sistem utama.

## 7. Disaster Recovery & Availability
- Database di- *backup* otomatis secara harian oleh *Supabase Free Tier*.
- Menggunakan GitHub untuk kontrol versi dua repositori/folder terpisah (`frontend` dan `backend`).
