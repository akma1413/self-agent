from fastapi import APIRouter, BackgroundTasks
from app.services.pipeline import Pipeline
from app.services.learner.feedback import FeedbackLearner

router = APIRouter()
pipeline = Pipeline()
learner = FeedbackLearner()


@router.post("/run")
async def run_pipeline(
    background_tasks: BackgroundTasks,
    agenda_id: str | None = None,
    run_in_background: bool = False,
):
    """Run the full pipeline"""
    if run_in_background:
        background_tasks.add_task(pipeline.run_full_pipeline, agenda_id)
        return {"status": "started", "message": "Pipeline running in background"}

    results = await pipeline.run_full_pipeline(agenda_id)
    return results


@router.post("/weekly-summary/{agenda_id}")
async def generate_weekly_summary(agenda_id: str):
    """Generate weekly summary report"""
    results = await pipeline.run_weekly_summary(agenda_id)
    return results


@router.get("/feedback/analysis")
async def get_feedback_analysis():
    """Analyze feedback patterns"""
    analysis = await learner.analyze_feedback()
    return analysis


@router.get("/feedback/suggestions")
async def get_principle_suggestions():
    """Get suggestions for principle refinements"""
    suggestions = await learner.suggest_principle_refinements()
    return suggestions


@router.post("/reprocess")
async def reprocess_items(limit: int = 50):
    """Reset processed_at to allow reprocessing of items"""
    from app.core.database import get_supabase_client
    client = get_supabase_client()

    # Get items that have been processed
    items = (
        client.table("collected_items")
        .select("id")
        .not_.is_("processed_at", "null")
        .eq("filtered_out", False)
        .limit(limit)
        .execute()
    )

    if not items.data:
        return {"reset_count": 0, "message": "No processed items found"}

    # Reset processed_at to NULL
    item_ids = [item["id"] for item in items.data]
    for item_id in item_ids:
        client.table("collected_items").update({
            "processed_at": None
        }).eq("id", item_id).execute()

    return {"reset_count": len(item_ids), "message": f"Reset {len(item_ids)} items for reprocessing"}
