from abc import ABC, abstractmethod
from typing import List, Dict, Any
from datetime import datetime


class CollectedItem:
    def __init__(
        self,
        external_id: str,
        title: str,
        content: str | None = None,
        url: str | None = None,
        metadata: Dict[str, Any] | None = None,
        collected_at: datetime | None = None,
    ):
        self.external_id = external_id
        self.title = title
        self.content = content
        self.url = url
        self.metadata = metadata or {}
        self.collected_at = collected_at or datetime.now()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "external_id": self.external_id,
            "title": self.title,
            "content": self.content,
            "url": self.url,
            "metadata": self.metadata,
            "collected_at": self.collected_at.isoformat(),
        }


class AbstractCollector(ABC):
    """Base class for all data collectors"""

    def __init__(self, source_id: str, config: Dict[str, Any] | None = None):
        self.source_id = source_id
        self.config = config or {}

    @abstractmethod
    async def collect(self) -> List[CollectedItem]:
        """Collect items from the source"""
        pass

    @abstractmethod
    def get_source_type(self) -> str:
        """Return the type of source (rss, web, github, etc.)"""
        pass
