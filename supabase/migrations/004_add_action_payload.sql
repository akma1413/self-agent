-- Add payload field to actions table for storing structured execution data
ALTER TABLE actions
ADD COLUMN payload JSONB DEFAULT NULL;

-- Add comment
COMMENT ON COLUMN actions.payload IS 'Structured data for action execution (install commands, configs, etc.)';
