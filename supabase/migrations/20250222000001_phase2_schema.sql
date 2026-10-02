-- Migration 002: Phase 2 Schema additions for FORENZIQ
-- Tables: audit_logs, correlations, reports

-- 1. AUDIT LOGS TABLE (Chain of Custody & Event History)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id TEXT UNIQUE NOT NULL,
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    evidence_id UUID REFERENCES evidence(id) ON DELETE SET NULL,
    actor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL CHECK (event_type IN (
        'CASE_CREATED',
        'EVIDENCE_UPLOADED',
        'EVIDENCE_ANALYZED',
        'FINDING_CREATED',
        'CORRELATION_CREATED',
        'REPORT_GENERATED',
        'REPORT_VIEWED',
        'REPORT_DOWNLOADED'
    )),
    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. CORRELATIONS TABLE (Cross-Evidence Relationships)
CREATE TABLE IF NOT EXISTS correlations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    correlation_id TEXT UNIQUE NOT NULL,
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    source_evidence_id UUID NOT NULL REFERENCES evidence(id) ON DELETE CASCADE,
    target_evidence_id UUID NOT NULL REFERENCES evidence(id) ON DELETE CASCADE,
    source_finding_id UUID REFERENCES findings(id) ON DELETE CASCADE,
    target_finding_id UUID REFERENCES findings(id) ON DELETE CASCADE,
    matched_entity_type TEXT NOT NULL,
    matched_entity_value TEXT NOT NULL,
    correlation_type TEXT NOT NULL DEFAULT 'SHARED_ENTITY',
    confidence NUMERIC(3, 2) NOT NULL DEFAULT 0.60 CHECK (confidence >= 0.0 AND confidence <= 1.0),
    reason TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. REPORTS TABLE (Persisted Forensic PDF Reports)
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id TEXT UNIQUE NOT NULL,
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'GENERATED' CHECK (status IN ('GENERATED', 'ARCHIVED')),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- INDEXES FOR PHASE 2 PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_audit_logs_case_id ON audit_logs(case_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_evidence_id ON audit_logs(evidence_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_correlations_case_id ON correlations(case_id);
CREATE INDEX IF NOT EXISTS idx_correlations_src_ev ON correlations(source_evidence_id);
CREATE INDEX IF NOT EXISTS idx_correlations_tgt_ev ON correlations(target_evidence_id);
CREATE INDEX IF NOT EXISTS idx_correlations_matched_entity ON correlations(matched_entity_value);

CREATE INDEX IF NOT EXISTS idx_reports_case_id ON reports(case_id);
CREATE INDEX IF NOT EXISTS idx_reports_report_id ON reports(report_id);

-- ROW LEVEL SECURITY (RLS) POLICIES FOR PHASE 2 TABLES
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE correlations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to audit_logs" ON audit_logs FOR SELECT USING (true);
CREATE POLICY "Allow public insert to audit_logs" ON audit_logs FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access to correlations" ON correlations FOR SELECT USING (true);
CREATE POLICY "Allow public insert to correlations" ON correlations FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access to reports" ON reports FOR SELECT USING (true);
CREATE POLICY "Allow public insert to reports" ON reports FOR INSERT WITH CHECK (true);
