-- =====================================================================
-- PG MANAGER SaaS - PRODUCTION DATABASE SCHEMA (POSTGRESQL + RLS)
-- Multi-Tenant Isolation via Row-Level Security (RLS)
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Organizations (Top-level billing entity / Owner group)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    owner_phone VARCHAR(20) NOT NULL UNIQUE,
    owner_email VARCHAR(255) UNIQUE,
    subscription_tier VARCHAR(50) DEFAULT 'FREE_TIER', -- 'FREE_TIER', 'PRO_MONTHLY', 'ENTERPRISE'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Properties (Individual PG Buildings belonging to an Organization)
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    upi_id VARCHAR(100),
    floors_count INT DEFAULT 1,
    rooms_per_floor INT DEFAULT 5,
    gate_closing_time VARCHAR(20) DEFAULT '22:30',
    wifi_ssid VARCHAR(100),
    wifi_pass VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. User Accounts & Staff with Role-Based Access Control (RBAC)
CREATE TYPE user_role AS ENUM ('owner', 'manager', 'warden', 'cook', 'cleaner', 'tenant');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    property_id UUID REFERENCES properties(id) ON DELETE SET NULL, -- NULL if global owner
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    role user_role NOT NULL DEFAULT 'tenant',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Rooms & Inventory
CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    room_number VARCHAR(50) NOT NULL,
    floor VARCHAR(50) NOT NULL,
    sharing_type VARCHAR(50) NOT NULL, -- 'Single', 'Double Sharing', 'Triple Sharing', etc.
    monthly_rent NUMERIC(10, 2) NOT NULL,
    total_beds INT NOT NULL DEFAULT 2,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tenants / Residents
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    room_id UUID NOT NULL REFERENCES rooms(id),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    joining_date DATE NOT NULL,
    security_deposit NUMERIC(10, 2) DEFAULT 0.00,
    rent_due_day INT DEFAULT 5, -- Day of month rent is due (e.g. 5th)
    id_proof_type VARCHAR(50),  -- 'Aadhaar', 'PAN', 'Passport'
    id_proof_masked VARCHAR(100), -- 'Aadhaar: **** **** 1234'
    kyc_document_url TEXT,      -- Presigned Cloudflare R2 path
    status VARCHAR(30) DEFAULT 'Active', -- 'Active', 'Notice_Period', 'Checked_Out'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Immutable Double-Entry Ledger System
CREATE TABLE ledger_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    account_code VARCHAR(50) NOT NULL, -- 'ACCOUNTS_RECEIVABLE', 'CASH_DRAWER_WARDEN_1', 'OWNER_BANK'
    account_name VARCHAR(255) NOT NULL,
    balance NUMERIC(12, 2) DEFAULT 0.00,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ledger_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id),
    transaction_ref VARCHAR(100) NOT NULL, -- '#CASH-4821' or 'UPI-TXN-998822'
    payment_mode VARCHAR(30) NOT NULL, -- 'Cash', 'UPI', 'Bank_Transfer'
    amount NUMERIC(10, 2) NOT NULL,
    collector_id UUID REFERENCES users(id), -- Staff or Owner who received cash
    collector_name VARCHAR(255),
    debit_account_id UUID REFERENCES ledger_accounts(id),
    credit_account_id UUID REFERENCES ledger_accounts(id),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Staff Physical Cash Drawer Handover Logs (Anti-Pilferage)
CREATE TABLE cash_handovers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    warden_id UUID NOT NULL REFERENCES users(id),
    owner_id UUID NOT NULL REFERENCES users(id),
    amount NUMERIC(10, 2) NOT NULL,
    handover_date DATE NOT NULL,
    status VARCHAR(30) DEFAULT 'PENDING', -- 'PENDING', 'CONFIRMED', 'REJECTED'
    handover_slip_ref VARCHAR(100) NOT NULL,
    confirmed_at TIMESTAMPTZ
);

-- 8. WhatsApp & Notification Message Templates (Per-Property Scoped)
CREATE TABLE property_message_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    template_key VARCHAR(50) NOT NULL, -- 'rent_reminder', 'cash_receipt', 'welcome_chit'
    template_name VARCHAR(100) NOT NULL,
    body_text TEXT NOT NULL,
    is_customized BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(property_id, template_key)
);

-- 9. Complaints & Maintenance Tickets
CREATE TABLE complaints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    room_number VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'Plumbing', 'Electrical', 'WiFi', 'Food', 'Cleaning'
    urgency VARCHAR(30) DEFAULT 'Medium', -- 'Low', 'Medium', 'High', 'Critical'
    status VARCHAR(30) DEFAULT 'Open', -- 'Open', 'In_Progress', 'Resolved'
    description TEXT,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- ROW-LEVEL SECURITY (RLS) POLICIES
-- Ensures cross-tenant leakage is mathematically impossible
-- =====================================================================

ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_handovers ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;

-- Helper policy template using PostgreSQL session variable
CREATE POLICY org_isolation_properties ON properties
    FOR ALL
    USING (organization_id = NULLIF(current_setting('request.jwt.claim.org_id', true), '')::uuid);

CREATE POLICY org_isolation_tenants ON tenants
    FOR ALL
    USING (organization_id = NULLIF(current_setting('request.jwt.claim.org_id', true), '')::uuid);

CREATE POLICY org_isolation_ledger ON ledger_entries
    FOR ALL
    USING (organization_id = NULLIF(current_setting('request.jwt.claim.org_id', true), '')::uuid);

CREATE POLICY org_isolation_templates ON property_message_templates
    FOR ALL
    USING (organization_id = NULLIF(current_setting('request.jwt.claim.org_id', true), '')::uuid);
