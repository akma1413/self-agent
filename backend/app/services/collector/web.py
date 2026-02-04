import httpx
from bs4 import BeautifulSoup
from typing import List, Dict, Any
import hashlib

from app.services.collector.base import AbstractCollector, CollectedItem


class WebCollector(AbstractCollector):
    """Collect items by scraping web pages"""

    def __init__(
        self,
        source_id: str,
        url: str,
        selectors: Dict[str, str] | None = None,
        config: Dict[str, Any] | None = None,
    ):
        super().__init__(source_id, config)
        self.url = url
        self.selectors = selectors or {
            "items": "article",
            "title": "h2",
            "content": "p",
            "link": "a",
        }

    def get_source_type(self) -> str:
        return "web"

    async def collect(self) -> List[CollectedItem]:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                self.url,
                timeout=30.0,
                headers={"User-Agent": "VirtualSelf/1.0"},
            )
            response.raise_for_status()

        soup = BeautifulSoup(response.text, "lxml")
        items = []

        for element in soup.select(self.selectors["items"]):
            title_el = element.select_one(self.selectors["title"])
            content_el = element.select_one(self.selectors["content"])
            link_el = element.select_one(self.selectors["link"])

            title = title_el.get_text(strip=True) if title_el else "Untitled"
            content = content_el.get_text(strip=True) if content_el else None
            url = link_el.get("href") if link_el else None

            if url and not url.startswith("http"):
                url = f"{self.url.rstrip('/')}/{url.lstrip('/')}"

            external_id = hashlib.md5(f"{self.url}:{title}".encode()).hexdigest()

            item = CollectedItem(
                external_id=external_id,
                title=title,
                content=content,
                url=url,
                metadata={"source_url": self.url},
            )
            items.append(item)

        return items
