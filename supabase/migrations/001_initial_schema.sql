-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Agendas table
CREATE TABLE agendas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sources table (information sources for collection)
CREATE TABLE sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agenda_id UUID REFERENCES agendas(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    source_type VARCHAR(50) NOT NULL, -- 'rss', 'web', 'github', 'twitter'
    url TEXT NOT NULL,
    config JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    last_collected_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Collected items table
CREATE TABLE collected_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_id UUID REFERENCES sources(id) ON DELETE CASCADE,
    external_id VARCHAR(255),
    title TEXT NOT NULL,
    content TEXT,
    url TEXT,
    metadata JSONB DEFAULT '{}',
    collected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(source_id, external_id)
);

-- Principles table (Phase 0 - user's personal principles)
CREATE TABLE principles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT NOT NULL,
    category VARCHAR(100),
    confidence_score FLOAT DEFAULT 0.5,
    source_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversations table (imported AI conversations)
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    platform VARCHAR(50) NOT NULL, -- 'claude', 'chatgpt', 'gemini'
    external_id VARCHAR(255),
    title TEXT,
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    conversation_date TIMESTAMP WITH TIME ZONE,
    imported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Principle evidences (linking principles to source conversations)
CREATE TABLE principle_evidences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    principle_id UUID REFERENCES principles(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    excerpt TEXT NOT NULL,
    relevance_score FLOAT DEFAULT 0.5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reports table
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agenda_id UUID REFERENCES agendas(id) ON DELETE CASCADE,
    report_type VARCHAR(50) NOT NULL, -- 'new_tool', 'comparison', 'best_practice'
    title TEXT NOT NULL,
    summary TEXT,
    content JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'reviewed', 'archived'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE
);

-- Actions table (recommended actions from reports)
CREATE TABLE actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high'
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'confirmed', 'rejected', 'executed'
    confirmed_at TIMESTAMP WITH TIME ZONE,
    executed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User feedback for learning
CREATE TABLE feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(50) NOT NULL, -- 'report', 'action', 'principle'
    entity_id UUID NOT NULL,
    feedback_type VARCHAR(20) NOT NULL, -- 'confirm', 'reject', 'modify'
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_sources_agenda ON sources(agenda_id);
CREATE INDEX idx_collected_items_source ON collected_items(source_id);
CREATE INDEX idx_collected_items_collected_at ON collected_items(collected_at);
CREATE INDEX idx_principles_category ON principles(category);
CREATE INDEX idx_conversations_platform ON conversations(platform);
CREATE INDEX idx_principle_evidences_principle ON principle_evidences(principle_id);
CREATE INDEX idx_reports_agenda ON reports(agenda_id);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_actions_report ON actions(report_id);
CREATE INDEX idx_actions_status ON actions(status);

-- Enable RLS
ALTER TABLE agendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE collected_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE principles ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE principle_evidences ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Create policies (allowing all for now, will refine with auth)
CREATE POLICY "Allow all for agendas" ON agendas FOR ALL USING (true);
CREATE POLICY "Allow all for sources" ON sources FOR ALL USING (true);
CREATE POLICY "Allow all for collected_items" ON collected_items FOR ALL USING (true);
CREATE POLICY "Allow all for principles" ON principles FOR ALL USING (true);
CREATE POLICY "Allow all for conversations" ON conversations FOR ALL USING (true);
CREATE POLICY "Allow all for principle_evidences" ON principle_evidences FOR ALL USING (true);
CREATE POLICY "Allow all for reports" ON reports FOR ALL USING (true);
CREATE POLICY "Allow all for actions" ON actions FOR ALL USING (true);
CREATE POLICY "Allow all for feedback" ON feedback FOR ALL USING (true);
