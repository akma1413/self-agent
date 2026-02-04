# Collector service
# Collects data from various sources (RSS, APIs, etc.)

from app.services.collector.base import AbstractCollector, CollectedItem
from app.services.collector.manager import CollectorManager
from app.services.collector.rss import RSSCollector
from app.services.collector.web import WebCollector
from app.services.collector.github import GitHubCollector

__all__ = [
    "AbstractCollector",
    "CollectedItem",
    "CollectorManager",
    "RSSCollector",
    "WebCollector",
    "GitHubCollector",
]
