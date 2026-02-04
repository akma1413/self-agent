# Quick Start: Phase 0

## What Was Implemented

Phase 0: Conversation Import and Principle Extraction system

**Core Capabilities:**
1. Import conversations from Claude, ChatGPT, Gemini
2. Extract user principles using LLM analysis
3. Store and manage principles with evidence

## Files Created

```
backend/
├── app/
│   ├── schemas/
│   │   ├── conversations.py      # Conversation data models
│   │   └── principles.py         # Principle data models
│   ├── services/
│   │   └── principles/
│   │       ├── __init__.py       # Module exports
│   │       ├── parser.py         # Multi-platform parser
│   │       └── extractor.py      # LLM-based extraction
│   └── api/v1/endpoints/
│       ├── conversations.py      # Conversation endpoints
│       └── principles.py         # Principle endpoints
├── PHASE0_IMPLEMENTATION.md      # Detailed docs
├── verify_syntax.py              # Syntax validator
└── verify_phase0.py              # Integration test
```

## Before You Start

### 1. Install Dependencies

```bash
cd /Users/shin/self/version1/backend
pip install -r requirements.txt
```

### 2. Set Up Environment

Create `.env` file:

```bash
# Application
APP_ENV=development
DEBUG=true

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Anthropic
ANTHROPIC_API_KEY=your_anthropic_api_key
```

### 3. Create Database Tables

Run these SQL commands in Supabase:

```sql
-- Conversations table
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL,
  external_id TEXT,
  title TEXT,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  conversation_date TIMESTAMPTZ,
  imported_at TIMESTAMPTZ DEFAULT NOW()
);

-- Principles table
CREATE TABLE principles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  category TEXT,
  confidence_score FLOAT DEFAULT 0.5,
  source_count INT DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Evidence table
CREATE TABLE principle_evidences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  principle_id UUID REFERENCES principles(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  excerpt TEXT NOT NULL,
  relevance_score FLOAT DEFAULT 0.5,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_conversations_platform ON conversations(platform);
CREATE INDEX idx_conversations_imported_at ON conversations(imported_at DESC);
CREATE INDEX idx_principles_category ON principles(category);
CREATE INDEX idx_principles_is_active ON principles(is_active);
CREATE INDEX idx_principle_evidences_principle_id ON principle_evidences(principle_id);
```

## Usage

### 1. Start the Server

```bash
uvicorn app.main:app --reload
```

### 2. Import Conversations

**Export your conversations from Claude/ChatGPT/Gemini first**, then:

```bash
# Import Claude conversation
curl -X POST http://localhost:8000/api/v1/conversations/import \
  -H "Content-Type: application/json" \
  -d @- << 'EOF'
{
  "platform": "claude",
  "file_content": "{\"uuid\":\"...\",\"name\":\"...\",\"chat_messages\":[...]}"
}
EOF
```

### 3. Extract Principles

```bash
# Extract from all conversations
curl -X POST http://localhost:8000/api/v1/principles/extract \
  -H "Content-Type: application/json" \
  -d '{}'

# Response:
# {
#   "extracted_count": 5,
#   "principles": [
#     {
#       "id": "uuid",
#       "content": "Keep it simple",
#       "category": "simplicity",
#       "confidence_score": 0.5,
#       "source_count": 1,
#       "is_active": true,
#       "created_at": "2024-02-04T...",
#       "updated_at": "2024-02-04T..."
#     },
#     ...
#   ]
# }
```

### 4. List Principles

```bash
# All active principles
curl http://localhost:8000/api/v1/principles

# Filter by category
curl http://localhost:8000/api/v1/principles?category=simplicity

# Include inactive
curl http://localhost:8000/api/v1/principles?active_only=false
```

### 5. Get Principle Details

```bash
curl http://localhost:8000/api/v1/principles/{principle_id}

# Response includes evidences:
# {
#   "id": "uuid",
#   "content": "Keep it simple",
#   "category": "simplicity",
#   "evidences": [
#     {
#       "id": "uuid",
#       "conversation_id": "uuid",
#       "excerpt": "I prefer simple solutions...",
#       "relevance_score": 0.8
#     }
#   ]
# }
```

## Supported Export Formats

### Claude
```json
{
  "uuid": "conversation-id",
  "name": "Conversation Title",
  "created_at": "2024-01-01T00:00:00Z",
  "model": "claude-3-sonnet",
  "chat_messages": [
    {"sender": "user", "text": "Hello"},
    {"sender": "assistant", "text": "Hi"}
  ]
}
```

### ChatGPT
```json
{
  "id": "conversation-id",
  "title": "Conversation Title",
  "create_time": 1704067200,
  "model": "gpt-4",
  "mapping": {
    "1": {
      "message": {
        "author": {"role": "user"},
        "content": {"parts": ["Hello"]}
      }
    }
  }
}
```

### Gemini
```json
{
  "id": "conversation-id",
  "title": "Conversation Title",
  "timestamp": 1704067200,
  "turns": [
    {"role": "user", "text": "Hello"},
    {"role": "assistant", "text": "Hi"}
  ]
}
```

## Principle Categories

The extractor automatically categorizes principles:

- `simplicity` - Preference for simple solutions
- `pragmatism` - Focus on practical results
- `efficiency` - Optimization and performance
- `learning` - Knowledge acquisition patterns
- `communication` - Interaction preferences
- `experimentation` - Trying new approaches
- (and more based on conversation content)

## Troubleshooting

### Import fails with parse error
- Verify JSON format matches platform export
- Check for truncated or corrupted files
- Try with a single conversation first

### Extraction returns empty
- Ensure conversations are substantial (>100 chars)
- Check ANTHROPIC_API_KEY is set correctly
- Verify API quota hasn't been exceeded

### No evidences linked
- Evidence linking is not yet implemented
- Principles are extracted but evidences will be added in Phase 1

## API Documentation

Full interactive API docs available at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Next Steps

1. Import your conversation history
2. Extract initial principles
3. Review and categorize principles
4. Build frontend for principle management
5. Implement evidence linking (Phase 1)
6. Add principle refinement (Phase 2)
