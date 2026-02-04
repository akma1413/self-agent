from typing import List, Dict, Any
from datetime import datetime, timedelta
from app.services.analyzer.claude import ClaudeAnalyzer
from app.core.database import get_supabase_client


# User's current stack for comparison
CURRENT_STACK = {
    "terminal": "Ghostty",
    "harness": "Claude Code",
    "orchestrator": "OMC (oh-my-claudecode)",
}


class VibeCodingProcessor:
    """Process VibeCoding agenda items"""

    def __init__(self):
        self.analyzer = ClaudeAnalyzer()
        self.client = get_supabase_client()
        self.agenda_name = "vibecoding"

    async def process_new_items(self) -> List[Dict[str, Any]]:
        """Process newly collected items"""
        # Get unprocessed items
        items = await self._get_unprocessed_items()
        if not items:
            return []

        # Get user principles
        principles = await self._get_user_principles()

        results = []
        for item in items:
            result = await self._process_single_item(item, principles)
            results.append(result)

            # Mark as processed
            await self._mark_processed(item["id"])

        return results

    async def _get_unprocessed_items(self) -> List[Dict[str, Any]]:
        """Get items that haven't been processed yet"""
        # Get vibecoding agenda ID
        agenda = self.client.table("agendas").select("id").eq("name", self.agenda_name).single().execute()

        if not agenda.data:
            return []

        agenda_id = agenda.data["id"]

        # Get sources for this agenda
        sources = self.client.table("sources").select("id").eq("agenda_id", agenda_id).execute()
        source_ids = [s["id"] for s in sources.data]

        if not source_ids:
            return []

        # Get unprocessed collected items
        items = (
            self.client.table("collected_items")
            .select("*")
            .in_("source_id", source_ids)
            .is_("processed_at", "null")
            .order("collected_at", desc=True)
            .limit(50)
            .execute()
        )

        return items.data

    async def _get_user_principles(self) -> List[str]:
        """Get active user principles"""
        principles = (
            self.client.table("principles")
            .select("content")
            .eq("is_active", True)
            .order("confidence_score", desc=True)
            .limit(10)
            .execute()
        )

        return [p["content"] for p in principles.data]

    async def _process_single_item(
        self, item: Dict[str, Any], principles: List[str]
    ) -> Dict[str, Any]:
        """Process a single collected item"""
        tool_info = {
            "title": item.get("title"),
            "content": item.get("content"),
            "url": item.get("url"),
            "metadata": item.get("metadata", {}),
        }

        analysis = await self.analyzer.analyze_new_tool(
            tool_info=tool_info,
            user_principles=principles,
            current_stack=CURRENT_STACK,
        )

        return {
            "item_id": item["id"],
            "item_title": item["title"],
            "analysis": analysis,
        }

    async def _mark_processed(self, item_id: str):
        """Mark item as processed"""
        self.client.table("collected_items").update({
            "processed_at": datetime.now().isoformat(),
        }).eq("id", item_id).execute()

    async def generate_comparison_report(
        self, category: str
    ) -> Dict[str, Any]:
        """Generate comparison report for a category (terminal, harness, orchestrator)"""
        if category not in CURRENT_STACK:
            raise ValueError(f"Unknown category: {category}")

        current_tool = CURRENT_STACK[category]
        principles = await self._get_user_principles()

        # Get recent items related to this category
        items = await self._search_items_by_category(category)

        comparisons = []
        for item in items[:5]:  # Limit comparisons
            comparison = await self.analyzer.compare_with_current_stack(
                comparison_item={
                    "title": item["title"],
                    "content": item["content"],
                    "url": item["url"],
                },
                current_tool=current_tool,
                user_principles=principles,
            )
            comparisons.append({
                "item": item["title"],
                "analysis": comparison,
            })

        return {
            "category": category,
            "current_tool": current_tool,
            "comparisons": comparisons,
        }

    async def _search_items_by_category(self, category: str) -> List[Dict[str, Any]]:
        """Search collected items related to a category"""
        keywords = {
            "terminal": ["terminal", "shell", "ghostty", "warp", "iterm", "kitty"],
            "harness": ["claude code", "cursor", "aider", "windsurf", "cline", "copilot"],
            "orchestrator": ["mcp", "orchestrat", "agent", "omc", "roo", "continue"],
        }

        search_terms = keywords.get(category, [])

        # Simple search in title/content
        all_items = self.client.table("collected_items").select("*").execute()

        matched = []
        for item in all_items.data:
            title_lower = (item.get("title") or "").lower()
            content_lower = (item.get("content") or "").lower()

            if any(term in title_lower or term in content_lower for term in search_terms):
                matched.append(item)

        return matched

    async def generate_weekly_summary(self) -> Dict[str, Any]:
        """Generate weekly trends summary"""
        # Get items from last week
        week_ago = (datetime.now() - timedelta(days=7)).isoformat()

        items = (
            self.client.table("collected_items")
            .select("*")
            .gte("collected_at", week_ago)
            .order("collected_at", desc=True)
            .limit(100)
            .execute()
        )

        principles = await self._get_user_principles()

        summary = await self.analyzer.summarize_trends(
            items=items.data,
            user_principles=principles,
            time_period="this week",
        )

        return summary
