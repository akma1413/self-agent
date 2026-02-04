from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from apscheduler.triggers.cron import CronTrigger
import logging

logger = logging.getLogger(__name__)
scheduler = AsyncIOScheduler()


async def run_collection_job():
    """Periodic job to collect from all sources"""
    from app.services.collector.manager import CollectorManager

    logger.info("Starting scheduled collection...")
    manager = CollectorManager()
    results = await manager.collect_all()
    logger.info(f"Collection completed: {results}")


async def run_full_pipeline():
    """Run the full pipeline periodically"""
    from app.services.pipeline import Pipeline

    logger.info("Starting scheduled pipeline run...")
    pipeline = Pipeline()
    results = await pipeline.run_full_pipeline()
    logger.info(f"Pipeline completed: {results}")


async def run_weekly_summary():
    """Generate weekly summary every Monday"""
    from app.services.pipeline import Pipeline
    from app.core.database import get_supabase_client

    logger.info("Generating weekly summary...")

    client = get_supabase_client()
    agenda = client.table("agendas").select("id").eq("name", "vibecoding").single().execute()

    if agenda.data:
        pipeline = Pipeline()
        await pipeline.run_weekly_summary(agenda.data["id"])
        logger.info("Weekly summary generated")


def start_scheduler():
    # Collection job - every 2 hours
    scheduler.add_job(
        run_collection_job,
        trigger=IntervalTrigger(hours=2),
        id="collection_job",
        name="Collect from all sources",
        replace_existing=True,
    )

    # Full pipeline - every 6 hours
    scheduler.add_job(
        run_full_pipeline,
        trigger=IntervalTrigger(hours=6),
        id="pipeline_job",
        name="Run full pipeline",
        replace_existing=True,
    )

    # Weekly summary - every Monday at 9 AM
    scheduler.add_job(
        run_weekly_summary,
        trigger=CronTrigger(day_of_week="mon", hour=9),
        id="weekly_summary_job",
        name="Generate weekly summary",
        replace_existing=True,
    )

    scheduler.start()
    logger.info("Scheduler started with all jobs")


def shutdown_scheduler():
    scheduler.shutdown(wait=False)
    logger.info("Scheduler shut down")
