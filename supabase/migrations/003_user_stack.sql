-- Migration: User stack configuration table
-- Purpose: Store user's current tool stack for personalized analysis

CREATE TABLE user_stack (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category VARCHAR(50) NOT NULL,  -- 'terminal', 'harness', 'orchestrator', etc.
  tool_name VARCHAR(100) NOT NULL,
  version VARCHAR(50),
  config JSONB DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(category)  -- One tool per category
);

-- Seed default values (user's current stack)
INSERT INTO user_stack (category, tool_name) VALUES
  ('terminal', 'Ghostty'),
  ('harness', 'Claude Code'),
  ('orchestrator', 'OMC (oh-my-claudecode)');

-- Index for category lookups
CREATE INDEX idx_user_stack_category ON user_stack(category);

-- Comment
COMMENT ON TABLE user_stack IS 'User current tool stack for personalized AI coding tool analysis';
