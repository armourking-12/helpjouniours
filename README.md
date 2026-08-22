# 🎓 HelpJuniors — AI-Powered Student Resource Sharing Platform

[![Next.js](https://img.shields.io/badge/Next.js-16.2.9-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.4-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![Clerk](https://img.shields.io/badge/Auth-Clerk-6C47FF?style=flat-square&logo=clerk)](https://clerk.com/)
[![Google Gemini](https://img.shields.io/badge/AI-Gemini_2.5_Flash-8E75C2?style=flat-square&logo=google)](https://aistudio.google.com/)

> **HelpJuniors** is a modern, community-driven platform designed to democratize academic resources for college and university students. Upload, discover, and download Previous Year Question Papers (PYQs), handwritten notes, assignments, lab manuals, and study materials with automated metadata extraction powered by Gemini AI, hybrid storage, and gamified contributor rewards.

---

## 🌟 Key Features

### 1. 🤖 AI-Powered Document Scanner (Gemini 2.5 Flash)
* **Zero-Effort Uploads**: Snap a picture of an exam paper or upload a PDF, and Google Gemini extracts the **University**, **Course**, **Subject**, **Semester**, **Year**, **Exam Type**, and relevant **Tags** automatically.
* **Resilient Extraction**: Built-in client retry loops and fallback to manual entry.

### 2. ⚡ Client-Side Duplicate Prevention & Hashing
* **SHA-256 Collision Check**: Generates file hashes directly in the browser via the Web Crypto API before file transfer.
* **Smart Similarity Detection**: Detects matching academic entries and prompts confirmation to prevent duplicate resources.

### 3. ☁️ Hybrid Dual-Cloud Storage Engine
* **Images & Small Documents (<10MB)**: Stored in **Cloudinary** with on-the-fly thumbnail generation, format optimization, and forced download attachments (`fl_attachment`).
* **Large Files & PDFs (>10MB / DOCX / PPTX)**: Programmatically committed to a dedicated GitHub repository via the **Octokit REST API** in structured directory paths (`University/Course/Sem_X/Subject/Year/ExamType/fileName`) and served via global **jsDelivr CDN**.

### 4. 🏆 Gamification & Leaderboard System
* **Reputation Points**: Earn reputation points for contributing approved resources and reaching download milestones.
* **Global Leaderboard**: Real-time rank tracking featuring top student contributors with custom badges and tier cards.
* **Anti-Farming Safeguards**: Automated point deductions on resource removal to prevent gaming the leaderboard.

### 5. 🛡️ Role-Based Access Control (RBAC) & Next.js 16 Proxy
* **Hierarchy**: `student` (0) → `moderator` (1) → `admin` (2) → `super_admin` (3).
* **Next.js 16 Proxy Guard**: [`src/proxy.ts`](src/proxy.ts) protects sensitive API and frontend routes using Clerk authentication.
* **Moderation Queue**: Dedicated approval workflow for moderators to verify quality, review AI-extracted metadata, and approve or reject submissions with feedback.

### 6. 🔍 Real-Time Search & Discovery
* **Multi-Facet Filtering**: Filter catalog items by Resource Type (PYQ, Notes, Assignment, Lab File, Practical File, Study Material), University, Semester, and Course.
* **User History & Bookmarks**: Track recently viewed documents with optimistic interaction updates (Likes & Saves) powered by TanStack Query.

### 7. 🎨 Cutting-Edge UI/UX & SEO
* **Tailwind CSS v4 & OKLCH Theme Engine**: Native dark/light mode with Chrome view transition circular expanding animations.
* **Rich SEO & JSON-LD**: Embedded Schema.org structures for `Organization`, `FAQPage`, `Article`, and `BreadcrumbList`, alongside dynamic MongoDB-backed XML sitemaps.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | Next.js 16.2.9 (Turbopack) | React 19.2 Server & Client Components, Route Handlers, App Router |
| **Route Proxy** | `src/proxy.ts` | Next.js 16 file-convention proxy & Clerk auth matcher |
| **Authentication** | Clerk (`@clerk/nextjs` v7.5) | OAuth login, session handling, user metadata, and Svix webhooks |
| **Database** | MongoDB Atlas via Mongoose 9.7 | Connection pooling, indexing, schema validations |
| **AI Integration** | Google Gemini 2.5 Flash | Multimodal document parsing & OCR metadata extraction |
| **Asset Storage** | Cloudinary + GitHub REST API | Dual storage routing for media and documents |
| **Styling & UI** | Tailwind CSS v4, Base-UI (`shadcn`) | Modern typography, fluid animations, responsive layouts |
| **Animation** | `motion/react` (Framer Motion) | Smooth page headers, staggered grids, and card transitions |
| **Data Fetching** | `@tanstack/react-query` v5 | Client-side caching, optimistic mutations, refetch invalidation |

---

## 📂 Project Directory Structure

```text
helpjuniors-app/
├── public/                     # Static assets, icons, and verification files
│   ├── icons.svg               # Vector brand logo
│   └── googlea19993370e110802.html # Google search console verification
├── src/
│   ├── proxy.ts                # Next.js 16 Route Guard / Clerk Proxy
│   ├── app/
│   │   ├── layout.tsx          # Root layout with providers & Google Analytics
│   │   ├── globals.css         # Tailwind CSS v4 configuration & theme tokens
│   │   ├── robots.ts           # Dynamic robots.txt generator
│   │   ├── sitemap.ts          # Real-time MongoDB-driven dynamic sitemap
│   │   ├── manifest.ts         # PWA Web App Manifest
│   │   ├── (auth)/             # Authentication views (Login / Register)
│   │   ├── (main)/             # Core public & authenticated pages
│   │   │   ├── page.tsx        # Homepage (Hero, Stats, Features, How It Works)
│   │   │   ├── resources/      # Resource explorer and [id] details page
│   │   │   ├── dashboard/      # User dashboard & moderation management
│   │   │   ├── upload/         # Upload wizard & AI scanning interface
│   │   │   ├── leaderboard/    # Top contributor rankings
│   │   │   ├── universities/   # University directory
│   │   │   ├── courses/        # Course directory
│   │   │   ├── history/        # User viewing history
│   │   │   ├── about/, blog/, contact/, faq/, privacy/, terms/
│   │   └── api/                # Backend API Route Handlers
│   │       ├── upload/         # Upload processing & hash collision checks
│   │       ├── ai/extract/     # Gemini AI document parsing
│   │       ├── resources/      # Resource querying, likes, saves, views, downloads
│   │       ├── admin/          # Moderation queue, approvals, rejections
│   │       ├── users/          # Profile sync, statistics, leaderboard data
│   │       ├── public/         # Platform counts and university aggregations
│   │       └── webhooks/clerk/ # Svix webhook handler for Clerk user synchronization
│   ├── components/
│   │   ├── admin/              # Moderation queue cards & actions
│   │   ├── auth/               # ProtectedRoute & RoleGate wrappers
│   │   ├── dashboard/          # Resource edit modals
│   │   ├── layout/             # Navbar, Footer, Logo, ThemeToggle, MobileNav
│   │   ├── providers/          # AuthProvider, QueryProvider, ThemeProvider
│   │   ├── shared/             # AnimatedContainer, LoadingSpinner, EmptyState
│   │   ├── ui/                 # Accessible UI components (Buttons, Cards, Dialogs)
│   │   └── upload/             # Multi-step upload system & camera capture
│   ├── hooks/                  # useAuth, useRole, useMediaQuery
│   ├── lib/
│   │   ├── constants.ts        # App routes, roles, hierarchies, file types
│   │   ├── utils.ts            # Formatting, styling, and utility helpers
│   │   ├── validations.ts      # Zod validation schemas
│   │   ├── db/                 # Mongoose client & database models
│   │   └── storage/            # Cloudinary & GitHub storage drivers
│   └── types/                  # TypeScript interface declarations
├── components.json             # shadcn component configuration
├── next.config.ts              # Next.js build and image optimization settings
├── package.json                # Project dependencies and run scripts
└── tsconfig.json               # TypeScript compiler rules
```

---

## ⚡ Getting Started

### Prerequisites
* **Node.js**: `v20.x` or higher
* **npm**, **yarn**, **pnpm**, or **bun**
* **MongoDB Atlas** database cluster
* **Clerk** account for user authentication
* **Google AI Studio API Key** for Gemini 2.5 Flash
* **Cloudinary** account for image & thumbnail storage
* **GitHub Personal Access Token** with repository access for document storage

---

### Environment Variables Configuration

Create a `.env.local` file in the root directory:

```env
# ============================================
# HelpJuniors.app — Environment Variables
# ============================================

# App Configuration
NEXT_PUBLIC_APP_NAME=HelpJuniors
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database Configuration (MongoDB Atlas)
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority

# Google Gemini AI (Google AI Studio)
GEMINI_API_KEY=your_gemini_api_key_here

# Cloudinary Storage (<10MB files & images)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# GitHub Document Storage (>10MB files, PDFs, DOCX)
GITHUB_STORAGE_TOKEN=your_github_personal_access_token
GITHUB_STORAGE_OWNER=your_github_username_or_org
GITHUB_STORAGE_REPO=your_storage_repository_name

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Clerk Webhooks (Optional for local testing, required for production)
WEBHOOK_SECRET=whsec_...
```

---

### Installation & Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/armourking-12/helpjouniours.git
   cd helpjouniours
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the local development server**:
   ```bash
   npm run dev
   ```

4. **Open in browser**:
   Navigate to [http://localhost:3000](http://localhost:3000).

---

## 📜 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Next.js development server with Turbopack |
| `npm run build` | Builds the production bundle |
| `npm run start` | Runs the built production server |
| `npm run lint` | Executes ESLint to check for code quality and syntax issues |

---

## 🎖️ Reputation System Rules

| Action | Reputation Impact | Details |
| :--- | :---: | :--- |
| **Upload Approved** | **+10 Points** | Awarded to uploader upon moderator approval / auto-approval |
| **Download Milestone** | **+5 Points** | Awarded for every 50 downloads a resource accumulates |
| **Upload Rejected** | **-5 Points** | Deducted when a submission violates guidelines |
| **Delete Own Approved Resource** | **-10 Points** | Deducted to prevent upload-delete reputation farming |

---

## 📡 API Reference Overview

| Endpoint | Method | Role Required | Description |
| :--- | :---: | :---: | :--- |
| `/api/health` | `GET` | Public | Health status check |
| `/api/upload` | `POST` | Authenticated | Validate, upload, and publish an academic resource |
| `/api/upload/check-hash` | `POST` | Public | Check if file hash exists in database |
| `/api/ai/extract` | `POST` | Public | Extract metadata from document image/PDF with Gemini AI |
| `/api/resources` | `GET` | Public | Paginated search and filter catalogue |
| `/api/resources/[id]` | `DELETE` | Owner / Admin | Delete resource from MongoDB and cloud storage |
| `/api/resources/[id]/edit` | `PATCH` | Owner / Admin | Modify resource metadata |
| `/api/resources/[id]/view` | `POST` | Public | Record a unique resource view |
| `/api/resources/[id]/download` | `POST` | Public | Increment download count and trigger milestone points |
| `/api/resources/[id]/like` | `POST` | Authenticated | Toggle like status on a resource |
| `/api/resources/[id]/save` | `POST` | Authenticated | Toggle bookmark/saved status |
| `/api/admin/pending` | `GET` | Moderator+ | Retrieve pending moderation queue |
| `/api/admin/approve` | `POST` | Moderator+ | Approve pending resource and award points |
| `/api/admin/reject` | `POST` | Moderator+ | Reject submission, delete asset, and notify uploader |
| `/api/users/leaderboard` | `GET` | Public | Top 50 contributors by reputation |
| `/api/users/me` | `GET` | Authenticated | Get or auto-sync current user profile |
| `/api/users/me/stats` | `GET` | Authenticated | Fetch stats, counts, and recent notifications |
| `/api/public/stats` | `GET` | Public | Total user, resource, university, and download metrics |
| `/api/webhooks/clerk` | `POST` | Public (Svix Verified) | Clerk webhook endpoint for user events |

---

## 🤝 Contributing

Contributions are warmly welcomed! If you'd like to improve HelpJuniors:

1. **Fork the repository**
2. **Create a feature branch**:
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**:
   ```bash
   git commit -m "feat: add amazing feature"
   ```
4. **Push to the branch**:
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">
  <sub>Built with ❤️ for students, by student.</sub>
</div>
