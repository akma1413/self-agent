import httpx
from typing import List, Dict, Any
from datetime import datetime

from app.services.collector.base import AbstractCollector, CollectedItem


class GitHubCollector(AbstractCollector):
    """Collect releases and updates from GitHub repositories"""

    def __init__(
        self,
        source_id: str,
        repo: str,  # format: "owner/repo"
        config: Dict[str, Any] | None = None,
    ):
        super().__init__(source_id, config)
        self.repo = repo
        self.api_base = "https://api.github.com"

    def get_source_type(self) -> str:
        return "github"

    async def collect(self) -> List[CollectedItem]:
        items = []

        # Collect releases
        releases = await self._fetch_releases()
        items.extend(releases)

        return items

    async def _fetch_releases(self) -> List[CollectedItem]:
        url = f"{self.api_base}/repos/{self.repo}/releases"

        async with httpx.AsyncClient() as client:
            response = await client.get(
                url,
                timeout=30.0,
                headers={
                    "Accept": "application/vnd.github.v3+json",
                    "User-Agent": "VirtualSelf/1.0",
                },
            )

            if response.status_code == 404:
                return []
            response.raise_for_status()

        releases = response.json()
        items = []

        for release in releases[:10]:  # Limit to recent 10
            published = None
            if release.get("published_at"):
                published = datetime.fromisoformat(
                    release["published_at"].replace("Z", "+00:00")
                )

            item = CollectedItem(
                external_id=f"github:{self.repo}:release:{release['id']}",
                title=f"[{self.repo}] {release['name'] or release['tag_name']}",
                content=release.get("body"),
                url=release.get("html_url"),
                metadata={
                    "repo": self.repo,
                    "tag": release.get("tag_name"),
                    "prerelease": release.get("prerelease"),
                    "type": "release",
                },
                collected_at=published,
            )
            items.append(item)

        return items
