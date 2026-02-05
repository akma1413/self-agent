from typing import Dict, Type
from app.services.collector.base import AbstractCollector, CollectedItem
from app.services.collector.rss import RSSCollector
from app.services.collector.web import WebCollector
from app.services.collector.github import GitHubCollector
from app.services.collector.twitter import TwitterCollector
from app.core.database import get_supabase_client
import logging

logger = logging.getLogger(__name__)


COLLECTOR_REGISTRY: Dict[str, Type[AbstractCollector]] = {
    "rss": RSSCollector,
    "web": WebCollector,
    "github": GitHubCollector,
    "twitter": TwitterCollector,
}


class CollectorManager:
    """Manages collection from all configured sources"""

    def __init__(self):
        self.client = get_supabase_client()

    async def collect_all(self, agenda_id: str | None = None):
        """Run collection for all active sources"""
        query = self.client.table("sources").select("*").eq("is_active", True)

        if agenda_id:
            query = query.eq("agenda_id", agenda_id)

        sources = query.execute()

        results = []
        for source in sources.data:
            try:
                items = await self._collect_source(source)
                saved = await self._save_items(source["id"], items)
                results.append({
                    "source_id": source["id"],
                    "collected": len(items),
                    "saved": saved,
                })
            except Exception as e:
                results.append({
                    "source_id": source["id"],
                    "error": str(e),
                })

        return results

    async def _collect_source(self, source: dict) -> list[CollectedItem]:
        """Collect items from a single source"""
        source_type = source["source_type"]

        if source_type not in COLLECTOR_REGISTRY:
            raise ValueError(f"Unknown source type: {source_type}")

        collector_class = COLLECTOR_REGISTRY[source_type]

        # Create collector with appropriate params
        if source_type == "rss":
            collector = collector_class(source["id"], source["url"], source.get("config"))
        elif source_type == "web":
            collector = collector_class(
                source["id"],
                source["url"],
                source.get("config", {}).get("selectors"),
                source.get("config"),
            )
        elif source_type == "github":
            collector = collector_class(
                source["id"],
                source["config"].get("repo", source["url"]),
                source.get("config"),
            )
        elif source_type == "twitter":
            collector = collector_class(source["id"], source.get("config"))
        else:
            collector = collector_class(source["id"], source["url"], source.get("config"))

        return await collector.collect()

    async def _save_items(self, source_id: str, items: list[CollectedItem]) -> int:
        """Save collected items to database, avoiding duplicates"""
        saved = 0

        for item in items:
            data = {
                "source_id": source_id,
                **item.to_dict(),
            }

            # Upsert to avoid duplicates
            try:
                self.client.table("collected_items").upsert(
                    data,
                    on_conflict="source_id,external_id",
                ).execute()
                saved += 1
            except Exception as e:
                logger.warning(f"Failed to save item {item.external_id}: {e}")

        # Update last_collected_at
        from datetime import datetime
        self.client.table("sources").update({
            "last_collected_at": datetime.now().isoformat(),
        }).eq("id", source_id).execute()

        return saved
