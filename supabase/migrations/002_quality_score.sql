-- Migration: Add quality scoring columns to collected_items
-- Purpose: Enable quality-based filtering before LLM processing

ALTER TABLE collected_items ADD COLUMN quality_score FLOAT;
ALTER TABLE collected_items ADD COLUMN quality_breakdown JSONB DEFAULT '{}';
ALTER TABLE collected_items ADD COLUMN filtered_out BOOLEAN DEFAULT false;

-- Index for efficient filtering queries
CREATE INDEX idx_collected_items_quality ON collected_items(quality_score);
CREATE INDEX idx_collected_items_filtered ON collected_items(filtered_out);

-- Comment explaining usage
COMMENT ON COLUMN collected_items.quality_score IS 'Quality score 0-100, items below threshold (50) are filtered';
COMMENT ON COLUMN collected_items.quality_breakdown IS 'Breakdown of score by factor: content_length, url, recency, reputation, keywords, engagement';
COMMENT ON COLUMN collected_items.filtered_out IS 'True if item was filtered out by quality scoring';
