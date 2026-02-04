import feedparser
import httpx
from typing import List, Dict, Any
from datetime import datetime
from time import mktime

from app.services.collector.base import AbstractCollector, CollectedItem


class RSSCollector(AbstractCollector):
    """Collect items from RSS feeds"""

    def __init__(self, source_id: str, url: str, config: Dict[str, Any] | None = None):
        super().__init__(source_id, config)
        self.url = url

    def get_source_type(self) -> str:
        return "rss"

    async def collect(self) -> List[CollectedItem]:
        async with httpx.AsyncClient() as client:
            response = await client.get(self.url, timeout=30.0)
            response.raise_for_status()

        feed = feedparser.parse(response.text)
        items = []

        for entry in feed.entries:
            published = None
            if hasattr(entry, "published_parsed") and entry.published_parsed:
                published = datetime.fromtimestamp(mktime(entry.published_parsed))

            item = CollectedItem(
                external_id=entry.get("id") or entry.get("link") or entry.get("title"),
                title=entry.get("title", "Untitled"),
                content=entry.get("summary") or entry.get("description"),
                url=entry.get("link"),
                metadata={
                    "author": entry.get("author"),
                    "tags": [t.get("term") for t in entry.get("tags", [])],
                },
                collected_at=published,
            )
            items.append(item)

        return items
