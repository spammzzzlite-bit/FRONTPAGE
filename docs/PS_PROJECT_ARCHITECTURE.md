# PS PROJECT -- ARCHITECTURE & LAYOUT GUIDE

This document serves as the roadmap for your full-stack application. It maps the unified file structure of the **TanStack Start** & **Supabase** template into distinct, clean layers.

---

## 🎨 PS PROJECT -- FRONT END (Client-Side Interface & State)

The front-end consists of your React routes, components, and local UI state.

### 1. View Pages & Route Layouts

All user-facing views are located in [src/routes/](file:///c:/Users/Jay%20B%20Kalsariya/Downloads/new/PSproject/src/routes):

- **Core App Shell:** [\_app.tsx](file:///c:/Users/Jay%20B%20Kalsariya/Downloads/new/PSproject/src/routes/_app.tsx) handles the dashboard sidebar, navigation permissions, theme toggling, and global toasts.
- **Specific Views:** Page content is defined in files like:
  - [\_app.index.tsx](file:///c:/Users/Jay%20B%20Kalsariya/Downloads/new/PSproject/src/routes/_app.index.tsx) (Dashboard)
  - [\_app.projects.tsx](file:///c:/Users/Jay%20B%20Kalsariya/Downloads/new/PSproject/src/routes/_app.projects.tsx) (Project details & creation)
  - [auth.tsx](file:///c:/Users/Jay%20B%20Kalsariya/Downloads/new/PSproject/src/routes/auth.tsx) (Login UI)

### 2. Client-Side Global State

The local UI state is managed in [src/lib/store.ts](file:///c:/Users/Jay%20B%20Kalsariya/Downloads/new/PSproject/src/lib/store.ts). This handles React store wrappers (e.g., `projectsStore`, `testCasesStore`) that load/save data in `localStorage`.

### 3. Reusable UI Components

UI primitives (buttons, inputs, dialogs, drawers) are located under:

- [src/components/ui/](file:///c:/Users/Jay%20B%20Kalsariya/Downloads/new/PSproject/src/components/ui) (Shadcn-compatible primitives)
- [src/components/](file:///c:/Users/Jay%20B%20Kalsariya/Downloads/new/PSproject/src/components) (Shared components like layout panels and command search)

---

## ⚙️ PS PROJECT -- BACKEND (Server-Side Logic & API Routines)

The backend runs on Nitro (under the hood of TanStack Start). Code here runs server-side on Node.js/Bun, not in the browser.

### 1. Server Functions (RPC Calls)

Server functions reside in [src/lib/api/](file:///c:/Users/Jay%20B%20Kalsariya/Downloads/new/PSproject/src/lib/api):

- **Server Endpoints:** Files like [example.functions.ts](file:///c:/Users/Jay%20B%20Kalsariya/Downloads/new/PSproject/src/lib/api/example.functions.ts) contain handlers wrapped in `createServerFn`.
- **Execution:** These handlers are stripped from the browser compilation bundle and compiled into secure JSON-RPC endpoints that the client invokes seamlessly.

### 2. Server Configuration & Secrets

Private server variables (like private API keys or webhook secrets) are handled inside:

- [src/lib/config.server.ts](file:///c:/Users/Jay%20B%20Kalsariya/Downloads/new/PSproject/src/lib/config.server.ts)

### 3. Server Startup Entry

The SSR error catching and request forwarding wrapper is handled at:

- [src/server.ts](file:///c:/Users/Jay%20B%20Kalsariya/Downloads/new/PSproject/src/server.ts)

---

## 💾 PS PROJECT -- DATABASE (Data Storage & Security)

Your database operations, schema definitions, and cloud sync policies.

### 1. Database Connection & Typings

The interface to connect to your PostgreSQL database is located at:

- [src/lib/supabase.ts](file:///c:/Users/Jay%20B%20Kalsariya/Downloads/new/PSproject/src/lib/supabase.ts) (Sets up the connection client and defines table schema types)

### 2. Database Schema SQL

The source-of-truth database structure is stored in:

- [SUPABASE_SETUP.sql](file:///c:/Users/Jay%20B%20Kalsariya/Downloads/new/PSproject/SUPABASE_SETUP.sql) (Defines custom tables, automatic triggers, updated_at timestamps, indexes, and Row-Level Security)
