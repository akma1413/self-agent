# Phase 0: Conversation Import and Principle Extraction

## Implementation Summary

Successfully implemented the Phase 0 system for importing AI conversations and extracting user principles.

## Files Created

### 1. Schema Files

#### `/app/schemas/conversations.py`
- `Platform` enum: CLAUDE, CHATGPT, GEMINI
- `ConversationCreate`: Input schema for creating conversations
- `ConversationResponse`: Output schema with metadata
- `ConversationImportRequest`: Import request with platform and file content
- `ConversationImportResponse`: Import response with count and data

#### `/app/schemas/principles.py`
- `PrincipleCreate`: Create new principle
- `PrincipleUpdate`: Update existing principle
- `PrincipleResponse`: Principle output with metadata
- `PrincipleEvidence`: Evidence linking principles to conversations
- `PrincipleWithEvidence`: Principle with related evidences
- `ExtractionRequest`: Request to extract principles from conversations
- `ExtractionResponse`: Extraction result with count

### 2. Service Layer

#### `/app/services/principles/parser.py`
**ConversationParser** - Parses conversation exports from different platforms:
- `_parse_claude()`: Claude conversation JSON format
- `_parse_chatgpt()`: ChatGPT export with message mapping
- `_parse_gemini()`: Gemini/Bard Takeout format
- `_extract_messages()`: Universal message extractor
- `_parse_date()`: Handles various date formats

**Supported Formats:**
- Claude: uuid, name, chat_messages
- ChatGPT: id, title, mapping structure
- Gemini: id, title, turns

#### `/app/services/principles/extractor.py`
**PrincipleExtractor** - LLM-based principle extraction:
- `extract_from_conversations()`: Process multiple conversations
- `_extract_from_single()`: Extract from one conversation
- `_deduplicate_principles()`: Remove duplicates

**Features:**
- Uses Claude Sonnet 4 for extraction
- Supports Korean and English
- Categories: simplicity, pragmatism, efficiency, learning, communication
- Skips conversations < 100 chars
- Truncates conversations > 15,000 chars
- JSON output validation

#### `/app/services/principles/__init__.py`
Exports `ConversationParser` and `PrincipleExtractor`

### 3. API Endpoints

#### `/app/api/v1/endpoints/conversations.py`
- `GET /conversations` - List conversations with optional platform filter
- `GET /conversations/{id}` - Get single conversation
- `POST /conversations/import` - Import from platform export file
- `DELETE /conversations/{id}` - Delete conversation

#### `/app/api/v1/endpoints/principles.py`
- `GET /principles` - List principles (filterable by category, active status)
- `GET /principles/{id}` - Get principle with evidences
- `POST /principles` - Create new principle
- `PATCH /principles/{id}` - Update principle
- `DELETE /principles/{id}` - Delete principle
- `POST /principles/extract` - Extract from conversations using LLM

## API Usage Examples

### Import Conversations

```bash
curl -X POST http://localhost:8000/api/v1/conversations/import \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "claude",
    "file_content": "{\"uuid\":\"123\",\"name\":\"Test\",\"chat_messages\":[...]}"
  }'
```

### Extract Principles

```bash
# Extract from all conversations
curl -X POST http://localhost:8000/api/v1/principles/extract \
  -H "Content-Type: application/json" \
  -d '{}'

# Extract from specific conversations
curl -X POST http://localhost:8000/api/v1/principles/extract \
  -H "Content-Type: application/json" \
  -d '{
    "conversation_ids": ["conv-id-1", "conv-id-2"]
  }'
```

### List Principles

```bash
# All active principles
curl http://localhost:8000/api/v1/principles

# Filter by category
curl http://localhost:8000/api/v1/principles?category=simplicity

# Include inactive
curl http://localhost:8000/api/v1/principles?active_only=false
```

## Database Schema Requirements

The implementation expects these Supabase tables:

### conversations
```sql
- id (uuid, primary key)
- platform (text)
- external_id (text, nullable)
- title (text, nullable)
- content (text)
- metadata (jsonb)
- conversation_date (timestamptz, nullable)
- imported_at (timestamptz, default now())
```

### principles
```sql
- id (uuid, primary key)
- content (text)
- category (text, nullable)
- confidence_score (float, default 0.5)
- source_count (int, default 1)
- is_active (boolean, default true)
- created_at (timestamptz, default now())
- updated_at (timestamptz, default now())
```

### principle_evidences
```sql
- id (uuid, primary key)
- principle_id (uuid, foreign key)
- conversation_id (uuid, foreign key)
- excerpt (text)
- relevance_score (float)
- created_at (timestamptz, default now())
```

## Validation Results

All Python files compiled successfully:
- ✓ app/schemas/conversations.py
- ✓ app/schemas/principles.py
- ✓ app/services/principles/parser.py
- ✓ app/services/principles/extractor.py
- ✓ app/api/v1/endpoints/conversations.py
- ✓ app/api/v1/endpoints/principles.py

Schema instantiation tests passed:
- ✓ ConversationCreate with all platforms
- ✓ PrincipleCreate and PrincipleUpdate
- ✓ ExtractionRequest with optional conversation_ids

## Next Steps

1. **Database Setup**: Create the required Supabase tables
2. **Environment Variables**: Ensure `ANTHROPIC_API_KEY` is set
3. **Testing**: Import sample conversations and test extraction
4. **Frontend Integration**: Build UI for import and principle management
5. **Evidence Linking**: Implement evidence creation during extraction

## Dependencies

All required packages are in requirements.txt:
- fastapi >= 0.109.0
- pydantic >= 2.6.0
- pydantic-settings >= 2.1.0
- supabase >= 2.3.0
- anthropic >= 0.18.0

## Notes

- Parser handles various export formats flexibly
- LLM extraction uses Claude Sonnet 4 (claude-sonnet-4-20250514)
- Deduplication is simple (exact match) - can be enhanced
- Extraction prompt supports Korean and English
- Error handling includes parse errors and missing data
