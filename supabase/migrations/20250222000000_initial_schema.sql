-- Migration 001: Initial Schema for FORENZIQ Digital Forensics Platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. CASES TABLE
CREATE TABLE IF NOT EXISTS cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    investigator_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'CLOSED', 'ARCHIVED')),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. EVIDENCE TABLE
CREATE TABLE IF NOT EXISTS evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evidence_id TEXT UNIQUE NOT NULL,
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('IMAGE', 'CHAT', 'TEXT')),
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type TEXT NOT NULL,
    sha256_hash TEXT NOT NULL,
    source TEXT NOT NULL DEFAULT 'UPLOAD',
    uploaded_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    analysis_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (analysis_status IN ('PENDING', 'ANALYZING', 'COMPLETED', 'FAILED')),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 4. FINDINGS TABLE
CREATE TABLE IF NOT EXISTS findings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    finding_id TEXT UNIQUE NOT NULL,
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    evidence_id UUID REFERENCES evidence(id) ON DELETE CASCADE,
    finding_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    confidence NUMERIC(3, 2) NOT NULL DEFAULT 0.0 CHECK (confidence >= 0.0 AND confidence <= 1.0),
    reasoning TEXT DEFAULT '',
    entities JSONB DEFAULT '{}'::jsonb,
    indicators JSONB DEFAULT '[]'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_cases_case_id ON cases(case_id);
CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);
CREATE INDEX IF NOT EXISTS idx_evidence_case_id ON evidence(case_id);
CREATE INDEX IF NOT EXISTS idx_evidence_evidence_id ON evidence(evidence_id);
CREATE INDEX IF NOT EXISTS idx_evidence_type ON evidence(type);
CREATE INDEX IF NOT EXISTS idx_evidence_sha256 ON evidence(sha256_hash);
CREATE INDEX IF NOT EXISTS idx_findings_case_id ON findings(case_id);
CREATE INDEX IF NOT EXISTS idx_findings_evidence_id ON findings(evidence_id);
CREATE INDEX IF NOT EXISTS idx_findings_severity ON findings(severity);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE findings ENABLE ROW LEVEL SECURITY;

-- Default permissive policies for authenticated / service role access in Phase 1
CREATE POLICY "Allow public read access to users" ON users FOR SELECT USING (true);
CREATE POLICY "Allow public insert to users" ON users FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access to cases" ON cases FOR SELECT USING (true);
CREATE POLICY "Allow public insert to cases" ON cases FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update to cases" ON cases FOR UPDATE USING (true);

CREATE POLICY "Allow public read access to evidence" ON evidence FOR SELECT USING (true);
CREATE POLICY "Allow public insert to evidence" ON evidence FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update to evidence" ON evidence FOR UPDATE USING (true);

CREATE POLICY "Allow public read access to findings" ON findings FOR SELECT USING (true);
CREATE POLICY "Allow public insert to findings" ON findings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update to findings" ON findings FOR UPDATE USING (true);
