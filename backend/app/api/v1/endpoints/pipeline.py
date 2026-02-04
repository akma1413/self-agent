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
