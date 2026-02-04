import httpx
from typing import List, Dict, Any
from datetime import datetime, timezone
import logging

from app.services.collector.base import AbstractCollector, CollectedItem
from app.core.config import get_settings

logger = logging.getLogger(__name__)


class TwitterCollector(AbstractCollector):
    """Collect tweets from X/Twitter via RapidAPI"""

    def __init__(
        self,
        source_id: str,
        config: Dict[str, Any] | None = None,
    ):
        """
        Constructor matches AbstractCollector pattern.

        Args:
            source_id: The source ID from database
            config: {
                "query": "search query",
                "max_results": 50,
                "include_replies": false,
                "min_likes": 0
            }
        """
        super().__init__(source_id, config)
        settings = get_settings()
        self.api_key = getattr(settings, 'rapidapi_key', None)
        self.base_url = "https://twitter154.p.rapidapi.com"

    def get_source_type(self) -> str:
        return "twitter"

    async def collect(self) -> List[CollectedItem]:
        """Collect tweets based on config."""
        if not self.api_key:
            logger.warning("RapidAPI key not configured, skipping Twitter collection")
            return []

        query = self.config.get("query", "") if self.config else ""
        if not query:
            logger.warning("No query configured for Twitter source")
            return []

        try:
            return await self._search_tweets(query)
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 429:
                logger.warning("Twitter API rate limited, will retry later")
                return []
            logger.error(f"Twitter API error: {e}")
            raise
        except Exception as e:
            logger.error(f"Twitter collection failed: {e}")
            return []

    async def _search_tweets(self, query: str) -> List[CollectedItem]:
        """Search tweets via RapidAPI."""
        max_results = self.config.get("max_results", 50) if self.config else 50
        include_replies = self.config.get("include_replies", False) if self.config else False
        min_likes = self.config.get("min_likes", 0) if self.config else 0

        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/search/search",
                params={
                    "query": query,
                    "section": "latest",
                    "limit": max_results,
                },
                headers={
                    "X-RapidAPI-Key": self.api_key,
                    "X-RapidAPI-Host": "twitter154.p.rapidapi.com",
                },
                timeout=30.0,
            )
            response.raise_for_status()

        data = response.json()
        tweets = data.get("results", [])

        items = []
        for tweet in tweets:
            likes = tweet.get("favorite_count", 0) or 0
            if likes < min_likes:
                continue

            if not include_replies and tweet.get("in_reply_to_status_id"):
                continue

            # Parse creation time for metadata.published_at
            created_at = tweet.get("creation_date")
            published_at = None
            if created_at:
                try:
                    published_at = datetime.fromisoformat(
                        created_at.replace("Z", "+00:00")
                    ).isoformat()
                except (ValueError, AttributeError):
                    pass

            item = CollectedItem(
                external_id=f"twitter:{tweet.get('tweet_id')}",
                title=tweet.get("text", "")[:100],
                content=tweet.get("text"),
                url=f"https://twitter.com/i/status/{tweet.get('tweet_id')}",
                metadata={
                    "likes": likes,
                    "retweets": tweet.get("retweet_count", 0) or 0,
                    "replies": tweet.get("reply_count", 0) or 0,
                    "user": tweet.get("user", {}).get("username"),
                    "user_followers": tweet.get("user", {}).get("follower_count"),
                    "published_at": published_at,
                    "type": "tweet",
                },
            )
            items.append(item)

        logger.info(f"Collected {len(items)} tweets for query: {query}")
        return items
