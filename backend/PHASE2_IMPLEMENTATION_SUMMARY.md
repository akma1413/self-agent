# Phase 2: Data Collection Layer - Implementation Summary

## Files Created

### Core Collector Framework
1. **app/services/collector/base.py**
   - `CollectedItem`: Data model for collected items
   - `AbstractCollector`: Base class for all collectors

2. **app/services/collector/rss.py**
   - `RSSCollector`: Collects from RSS/Atom feeds
   - Uses feedparser library
   - Extracts: title, content, url, author, tags, published_at

3. **app/services/collector/web.py**
   - `WebCollector`: Scrapes web pages
   - Uses BeautifulSoup with lxml
   - Configurable CSS selectors
   - Generates MD5 hash for external_id

4. **app/services/collector/github.py**
   - `GitHubCollector`: Fetches GitHub releases
   - Uses GitHub API v3
   - Limits to 10 most recent releases
   - Handles 404 gracefully

5. **app/services/collector/manager.py**
   - `CollectorManager`: Orchestrates all collectors
   - `COLLECTOR_REGISTRY`: Maps source_type to collector class
   - `collect_all()`: Runs collection for active sources
   - `_save_items()`: Upserts items, avoids duplicates
   - Updates `last_collected_at` timestamp

6. **app/services/collector/__init__.py**
   - Package initialization with exports

### Scheduling
7. **app/services/scheduler.py** (Updated)
   - Added `run_collection_job()`: Async job for periodic collection
   - Configured to run every hour
   - Logs collection results

### API Endpoints
8. **app/api/v1/endpoints/sources.py**
   - `GET /api/v1/sources`: List all sources (optional agenda_id filter)
   - `POST /api/v1/sources`: Create new source
   - `DELETE /api/v1/sources/{source_id}`: Delete source
   - `POST /api/v1/sources/collect`: Manually trigger collection
   - `GET /api/v1/sources/{source_id}/items`: Get collected items

9. **app/api/v1/__init__.py** (Updated)
   - Added sources router integration

## Architecture

```
┌─────────────────────────────────────────────┐
│         API Layer (FastAPI)                 │
│  /sources/* endpoints                       │
└─────────────┬───────────────────────────────┘
              │
┌─────────────▼───────────────────────────────┐
│      CollectorManager                       │
│  - Orchestrates collection                  │
│  - Saves to database                        │
└─────────────┬───────────────────────────────┘
              │
      ┌───────┴────────┬────────────┐
      │                │            │
┌─────▼─────┐  ┌──────▼──────┐  ┌──▼────────┐
│ RSS       │  │ Web         │  │ GitHub    │
│ Collector │  │ Collector   │  │ Collector │
└───────────┘  └─────────────┘  └───────────┘
      │                │            │
      └────────┬───────┴────────────┘
               │
      ┌────────▼─────────┐
      │  Supabase DB     │
      │  collected_items │
      └──────────────────┘
```

## Collector Registry Pattern

New collectors can be added by:
1. Extending `AbstractCollector`
2. Implementing `collect()` and `get_source_type()`
3. Adding to `COLLECTOR_REGISTRY` in manager.py

## Data Flow

1. **Scheduled**: APScheduler runs `run_collection_job()` every hour
2. **Manual**: POST /api/v1/sources/collect triggers collection
3. **Process**:
   - CollectorManager fetches active sources from DB
   - For each source, instantiates appropriate collector
   - Collector fetches items from external source
   - Manager upserts items to `collected_items` table
   - Updates `last_collected_at` timestamp

## Deduplication Strategy

- Upsert based on composite key: `(source_id, external_id)`
- External ID generation:
  - RSS: Uses feed entry ID or link
  - Web: MD5 hash of URL + title
  - GitHub: Format "github:{repo}:release:{id}"

## Configuration

Sources stored in `sources` table with:
- `source_type`: "rss" | "web" | "github"
- `url`: Source URL
- `config`: JSON with type-specific settings
  - Web: `{"selectors": {...}}`
  - GitHub: `{"repo": "owner/name"}`

## Dependencies Used

- feedparser: RSS/Atom parsing
- httpx: Async HTTP client
- beautifulsoup4 + lxml: HTML parsing
- apscheduler: Periodic task scheduling

## Next Steps

Phase 2 is complete. The system can now:
- Collect from RSS feeds
- Scrape web pages
- Fetch GitHub releases
- Store items with deduplication
- Schedule automatic collection

Ready for Phase 3: Processing & Intelligence Layer
