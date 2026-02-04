from dataclasses import dataclass
from typing import Dict, Any, List
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

@dataclass
class QualityResult:
    score: float  # 0-100
    breakdown: Dict[str, float]
    should_process: bool

class QualityScorer:
    """
    Quality scoring service using 6-factor weighted scoring.

    Factors:
    - Content Length (20%): Longer content = higher quality
    - Has URL (10%): URL presence indicates source reference
    - Recency (20%): Newer content preferred (uses published_at)
    - Source Reputation (15%): Based on source.config.reputation_score
    - Keyword Relevance (25%): Matches against agenda/source keywords
    - Engagement (10%): Social signals (likes, retweets, stars)
    """

    DEFAULT_THRESHOLD = 50  # Items below this are filtered

    DEFAULT_REPUTATION = {
        "github": 80,
        "rss": 60,
        "twitter": 50,
        "web": 40,
    }

    DEFAULT_KEYWORDS = [
        "claude", "cursor", "copilot", "ai coding", "llm",
        "terminal", "ghostty", "warp", "mcp", "agent"
    ]

    def score(
        self,
        item: Dict[str, Any],
        source: Dict[str, Any],
        agenda: Dict[str, Any] | None = None,
        threshold: float | None = None
    ) -> QualityResult:
        """
        Calculate quality score for a collected item.

        Args:
            item: The collected_items row
            source: The sources row (for reputation, keywords)
            agenda: The agendas row (for keywords), optional
            threshold: Override default threshold

        Returns:
            QualityResult with score, breakdown, and should_process flag
        """
        breakdown = {
            "content_length": self._calculate_content_length_score(item),
            "has_url": self._calculate_url_score(item),
            "recency": self._calculate_recency_score(item),
            "reputation": self._calculate_reputation_score(source),
            "keyword_relevance": self._calculate_keyword_score(item, agenda, source),
            "engagement": self._calculate_engagement_score(item),
        }

        total_score = sum(breakdown.values())
        effective_threshold = threshold or self.DEFAULT_THRESHOLD

        return QualityResult(
            score=round(total_score, 2),
            breakdown=breakdown,
            should_process=total_score >= effective_threshold
        )

    def _calculate_content_length_score(self, item: Dict[str, Any]) -> float:
        """Score based on content length. Max 20 points."""
        content = item.get("content") or ""
        length = len(content)
        if length < 50:
            return 0.0
        elif length >= 200:
            return 20.0
        else:
            return ((length - 50) / 150) * 20.0

    def _calculate_url_score(self, item: Dict[str, Any]) -> float:
        """Score based on URL presence. Max 10 points."""
        return 10.0 if item.get("url") else 0.0

    def _calculate_recency_score(self, item: Dict[str, Any]) -> float:
        """
        Score based on recency. Max 20 points.
        Priority: metadata.published_at > collected_at
        """
        published_at = item.get("metadata", {}).get("published_at")

        if published_at:
            if isinstance(published_at, str):
                reference_time = datetime.fromisoformat(
                    published_at.replace("Z", "+00:00")
                )
            else:
                reference_time = published_at
        else:
            collected_at = item.get("collected_at")
            if not collected_at:
                return 10.0  # Default mid-score if no date
            reference_time = datetime.fromisoformat(collected_at)

        # Ensure timezone awareness
        if reference_time.tzinfo is None:
            reference_time = reference_time.replace(tzinfo=timezone.utc)

        age_hours = (datetime.now(timezone.utc) - reference_time).total_seconds() / 3600

        if age_hours < 24:
            return 20.0
        elif age_hours < 168:  # 7 days
            return 15.0
        elif age_hours < 720:  # 30 days
            return 10.0
        else:
            return 5.0

    def _calculate_reputation_score(self, source: Dict[str, Any]) -> float:
        """
        Score based on source reputation. Max 15 points.
        Uses source.config.reputation_score or defaults by type.
        """
        config = source.get("config", {})
        if "reputation_score" in config:
            return min(15.0, config["reputation_score"] * 0.15)

        source_type = source.get("source_type", "web")
        default = self.DEFAULT_REPUTATION.get(source_type, 40)
        return default * 0.15

    def _calculate_keyword_score(
        self,
        item: Dict[str, Any],
        agenda: Dict[str, Any] | None,
        source: Dict[str, Any]
    ) -> float:
        """
        Score based on keyword relevance. Max 25 points.
        Priority: agenda.keywords > source.config.keywords > DEFAULT_KEYWORDS
        """
        keywords = []
        if agenda and agenda.get("keywords"):
            keywords = agenda["keywords"]
        elif source.get("config", {}).get("keywords"):
            keywords = source["config"]["keywords"]
        else:
            keywords = self.DEFAULT_KEYWORDS

        text = f"{item.get('title', '')} {item.get('content', '')}".lower()
        matched = sum(1 for kw in keywords if kw.lower() in text)
        match_ratio = matched / len(keywords) if keywords else 0

        return match_ratio * 25.0

    def _calculate_engagement_score(self, item: Dict[str, Any]) -> float:
        """
        Score based on engagement signals. Max 10 points.
        Uses likes, retweets, stars from metadata.
        """
        metadata = item.get("metadata", {})

        likes = metadata.get("likes", 0) or 0
        retweets = metadata.get("retweets", 0) or 0
        stars = metadata.get("stars", 0) or 0

        total_engagement = likes + retweets + stars

        if total_engagement >= 100:
            return 10.0
        elif total_engagement >= 50:
            return 7.0
        elif total_engagement >= 10:
            return 4.0
        elif total_engagement > 0:
            return 2.0
        else:
            return 0.0
