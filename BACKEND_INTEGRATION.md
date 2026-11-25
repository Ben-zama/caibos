# Backend API Integration & Customization Guide

This codebase is structured so a backend developer can connect a real REST API or customize branding, currency, and feature modules without editing UI components.

---

## 1. Quick Start: Connect Your Backend API

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Set the API mode and base URL:
   ```env
   NEXT_PUBLIC_API_MODE=api
   NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com/v1
   ```
3. Restart the dev server (`npm run dev`).

When `NEXT_PUBLIC_API_MODE=api` is enabled:
- `/login` automatically switches from Demo Persona Cards to an Email + Password sign-in form calling `POST /auth/login`.
- Every service under `src/lib/api/services/` routes through `apiClient` (`src/lib/api/client.ts`) with automatic `Authorization: Bearer <token>` headers and global 401 session-expiry handling.

---

## 2. Architecture Map (Where to Customize)

| Concern | File | What to Edit |
| --- | --- | --- |
| Brand name, currency, locale, feature toggles, plan prices | `src/config/app.config.ts` | Single config object controlling sidebar modules, plan MRR, and formatting |
| All backend URL paths | `src/lib/api/endpoints.ts` | Remap any endpoint path in one place |
| HTTP client, auth headers, response unwrapping, errors | `src/lib/api/client.ts` | Adjust `unwrapResponse()`, headers, or timeout behavior |
| Domain API contracts | `src/lib/api/services/*.service.ts` | Auth, Businesses (Admin), Finance, CRM, HR, Inventory, Settings |
| Shared TypeScript models | `src/types/index.ts` | Exact request & response interfaces shared by UI and services |
| Role permissions matrix | `src/lib/permissions.ts` | RBAC capabilities for `owner`, `admin`, and `caibos` roles |

---

## 3. Response Envelope Support

`apiClient` (`src/lib/api/client.ts`) supports **both** formats out of the box:
- Raw JSON payload: `{ "id": "biz-001", "name": "Acme Corp", ... }` or `[...]`
- Wrapped envelope: `{ "data": [...], "message": "ok", "meta": { "total": 42 } }`

If your backend uses a different wrapper key (e.g. `{ "result": ... }`), update `unwrapResponse()` in `src/lib/api/client.ts`.

---

## 4. Expected REST Endpoints

All paths are relative to `NEXT_PUBLIC_API_BASE_URL` and configured in `src/lib/api/endpoints.ts`:

### Auth
- `POST /auth/login` — Body: `{ email, password }` → Returns `{ user: User, token: string, refreshToken?: string }`
- `POST /auth/logout` — Invalidates active session
- `GET /auth/me` — Returns current `User`

### Caibos Admin — Businesses
- `GET /admin/businesses` — Query: `?search=&plan=&status=` → Returns `Business[]`
- `POST /admin/businesses` — Body: `CreateBusinessInput` → Returns `Business`
- `GET /admin/businesses/:id` — Returns `Business`
- `PATCH /admin/businesses/:id` — Body: `UpdateBusinessInput` → Returns `Business`
- `PATCH /admin/businesses/:id/plan` — Body: `{ plan: 'free' | 'pro' | 'enterprise' }` → Returns `Business`
- `PATCH /admin/businesses/:id/status` — Body: `{ status: 'active' | 'trial' | 'suspended' }` → Returns `Business`
- `GET /admin/businesses/metrics` — Returns `PlatformMetrics`

### Finance
- `GET /finance/invoices` → `Invoice[]`
- `GET /finance/payments` → `Payment[]`
- `GET /finance/expenses` → `Expense[]`
- `GET /finance/reports/revenue-series` → `{ month, revenue, expenses }[]`
- `GET /finance/reports/expense-breakdown` → `{ category, amount }[]`

### CRM
- `GET /crm/contacts` → `Contact[]`
- `GET /crm/deals` → `Deal[]`
- `GET /crm/activities` → `Activity[]`
- `PATCH /crm/activities/:id/toggle` — Body: `{ completed: boolean }` → `Activity`

### HR & Payroll
- `GET /hr/employees` → `Employee[]`
- `GET /hr/leave-requests` → `LeaveRequest[]`
- `POST /hr/leave-requests/:id/approve` → `LeaveRequest`
- `POST /hr/leave-requests/:id/reject` → `LeaveRequest`
- `GET /hr/attendance` → `AttendanceRecord[]`
- `GET /hr/payroll` → `PayrollRun[]`
- `POST /hr/payroll/:id/approve` → `PayrollRun`

### Inventory
- `GET /inventory/products`, `POST /inventory/products`, `PATCH /inventory/products/:id`, `DELETE /inventory/products/:id`
- `GET /inventory/movements`, `POST /inventory/movements`
- `POST /inventory/adjustments`
- `GET /inventory/suppliers`, `POST /inventory/suppliers`, `PATCH /inventory/suppliers/:id`, `DELETE /inventory/suppliers/:id`
- `GET /inventory/purchase-orders`, `POST /inventory/purchase-orders`, `PATCH /inventory/purchase-orders/:id/status`

### Settings
- `GET /settings/business`, `PATCH /settings/business`
- `GET /settings/team`, `DELETE /settings/team/:id`
