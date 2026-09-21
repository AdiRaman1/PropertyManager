# PG Manager Platform (Multi-Tenant SaaS)
*Architected for Web, Android, and iOS across Multi-Property Operations*

---

## 📁 Repository Structure

```
pg-manager/
├── frontend/             # Cross-Platform Client (Web, Android, iOS ready)
│   ├── src/
│   │   ├── components/   # AuthModal, RentLedger, WhatsAppTemplateModal, StorageVault, etc.
│   │   ├── utils/        # templateEngine.js (Variable interpolation)
│   │   ├── translations.js # Multi-lingual localization
│   │   └── App.jsx
│   ├── public/
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── backend/              # Production Multi-Tenant API & Business Logic
│   ├── src/
│   │   ├── controllers/
│   │   ├── db/
│   │   │   └── schema.sql # PostgreSQL Schema with Row-Level Security (RLS)
│   │   ├── middleware/
│   │   │   ├── auth.js    # JWT & Role-Based Access Control (RBAC)
│   │   │   └── tenantIsolation.js # Organization & Property Context Scoping
│   │   ├── routes/
│   │   │   └── api.routes.js # Ledger, WhatsApp templates, Properties, R2 Vault
│   │   ├── services/
│   │   └── server.js      # Express / Node HTTP API (Port 4000)
│   ├── .env.example
│   └── package.json
│
├── package.json          # Root Monorepo Scripts
└── README.md
```

---

## 🚀 Getting Started

### 1. Run Frontend (Web Dev Server)
```bash
cd frontend
npm run dev
# Running on http://localhost:5173
```

### 2. Run Backend API Server
```bash
cd backend
npm run dev
# Running on http://localhost:4000
```

### 3. Build Frontend for Production
```bash
cd frontend
npm run build
```
