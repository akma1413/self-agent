from typing import Dict, Any, List
from datetime import datetime
import logging

from app.core.database import get_supabase_client
from app.services.collector.manager import CollectorManager
from app.services.processor.vibecoding import VibeCodingProcessor
from app.services.reporter.generator import ReportGenerator
from app.services.executor.notification import NotificationExecutor
from app.services.quality import QualityScorer

logger = logging.getLogger(__name__)


class Pipeline:
    """Main orchestration pipeline: Collect -> Process -> Analyze -> Report -> Execute"""

    def __init__(self):
        self.client = get_supabase_client()
        self.collector = CollectorManager()
        self.processor = VibeCodingProcessor()
        self.reporter = ReportGenerator()
        self.notifier = NotificationExecutor()
        self.quality_scorer = QualityScorer()

    async def _filter_by_quality(
        self, items: List[Dict], agenda: Dict | None = None
    ) -> List[Dict]:
        """
        Filter collected items by quality score.
        Updates DB with scores and returns items above threshold.
        """
        if not items:
            return []

        # Get sources for reputation info
        source_ids = list(set(item.get("source_id") for item in items if item.get("source_id")))
        sources = {}
        if source_ids:
            result = self.client.table("sources").select("*").in_("id", source_ids).execute()
            sources = {s["id"]: s for s in result.data}

        filtered_items = []
        for item in items:
            source = sources.get(item.get("source_id"), {})
            result = self.quality_scorer.score(item, source, agenda)

            # Update DB with score
            self.client.table("collected_items").update({
                "quality_score": result.score,
                "quality_breakdown": result.breakdown,
                "filtered_out": not result.should_process
            }).eq("id", item["id"]).execute()

            if result.should_process:
                filtered_items.append(item)

        logger.info(
            f"Quality filter: {len(filtered_items)}/{len(items)} passed "
            f"(threshold: {self.quality_scorer.DEFAULT_THRESHOLD})"
        )
        return filtered_items

    async def run_full_pipeline(self, agenda_id: str | None = None) -> Dict[str, Any]:
        """Run the complete pipeline"""
        results = {
            "started_at": datetime.now().isoformat(),
            "steps": {},
            "errors": [],
        }

        try:
            # Step 1: Collect
            logger.info("Starting collection...")
            collection_results = await self.collector.collect_all(agenda_id)
            results["steps"]["collect"] = {
                "success": True,
                "results": collection_results,
            }

            # Step 1.5: Quality filtering on newly collected items
            logger.info("Applying quality filter to newly collected items...")
            agenda = None
            if agenda_id:
                agenda_result = self.client.table("agendas").select("*").eq("id", agenda_id).single().execute()
                agenda = agenda_result.data if agenda_result.data else None

            # Get newly collected items (no quality_score yet)
            newly_collected = (
                self.client.table("collected_items")
                .select("*")
                .is_("quality_score", "null")
                .order("collected_at", desc=True)
                .limit(200)
                .execute()
            )

            filtered_items = await self._filter_by_quality(newly_collected.data, agenda)
            results["steps"]["quality_filter"] = {
                "success": True,
                "total_items": len(newly_collected.data),
                "passed_items": len(filtered_items),
                "filtered_out": len(newly_collected.data) - len(filtered_items),
            }
        except Exception as e:
            logger.error(f"Collection failed: {e}")
            results["errors"].append(f"Collection: {str(e)}")
            results["steps"]["collect"] = {"success": False, "error": str(e)}

        try:
            # Step 2: Process & Analyze
            logger.info("Processing items...")
            process_results = await self.processor.process_new_items()
            results["steps"]["process"] = {
                "success": True,
                "processed_count": len(process_results),
            }

            # Step 3: Generate Reports for recommendations
            logger.info("Generating reports...")
            reports_created = await self._generate_reports_from_analysis(
                agenda_id, process_results
            )
            results["steps"]["reports"] = {
                "success": True,
                "reports_created": reports_created,
            }
        except Exception as e:
            logger.error(f"Processing failed: {e}")
            results["errors"].append(f"Processing: {str(e)}")
            results["steps"]["process"] = {"success": False, "error": str(e)}

        try:
            # Step 4: Notify about new pending actions
            pending_actions = await self._get_pending_actions()
            if pending_actions:
                logger.info(f"Notifying about {len(pending_actions)} pending actions...")
                await self._send_notifications(pending_actions)
            results["steps"]["notify"] = {
                "success": True,
                "notifications_sent": len(pending_actions),
            }
        except Exception as e:
            logger.error(f"Notification failed: {e}")
            results["errors"].append(f"Notification: {str(e)}")

        results["completed_at"] = datetime.now().isoformat()
        results["success"] = len(results["errors"]) == 0

        return results

    async def _generate_reports_from_analysis(
        self, agenda_id: str | None, process_results: List[Dict[str, Any]]
    ) -> int:
        """Generate reports from analysis results"""
        if not agenda_id:
            # Get default vibecoding agenda
            agenda = (
                self.client.table("agendas")
                .select("id")
                .eq("name", "vibecoding")
                .single()
                .execute()
            )
            agenda_id = agenda.data["id"] if agenda.data else None

        if not agenda_id:
            return 0

        reports_created = 0

        for result in process_results:
            analysis = result.get("analysis", {})
            recommendation = analysis.get("recommendation")

            # Only create reports for recommended items
            if recommendation in ["recommend", "consider"]:
                await self.reporter.generate_new_tool_report(
                    agenda_id=agenda_id,
                    tool_name=result.get("item_title", "Unknown"),
                    analysis=analysis,
                    source_item={"id": result.get("item_id"), "url": None},
                )
                reports_created += 1

        return reports_created

    async def _get_pending_actions(self) -> List[Dict[str, Any]]:
        """Get all pending actions"""
        result = (
            self.client.table("actions")
            .select("*")
            .eq("status", "pending")
            .execute()
        )
        return result.data

    async def _send_notifications(self, actions: List[Dict[str, Any]]):
        """Send notifications for pending actions"""
        for action in actions:
            await self.notifier.execute(action)

    async def run_weekly_summary(self, agenda_id: str) -> Dict[str, Any]:
        """Generate weekly summary report"""
        summary = await self.processor.generate_weekly_summary()
        report = await self.reporter.generate_weekly_report(agenda_id, summary)
        return {"summary": summary, "report": report}
