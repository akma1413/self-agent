from fastapi import APIRouter, HTTPException
from app.services.processor.vibecoding import VibeCodingProcessor

router = APIRouter()
processor = VibeCodingProcessor()


@router.post("/vibecoding/process")
async def process_vibecoding_items():
    """Process new VibeCoding items"""
    results = await processor.process_new_items()
    return {"processed": len(results), "results": results}


@router.get("/vibecoding/compare/{category}")
async def compare_with_current_stack(category: str):
    """Compare tools with current stack (terminal, harness, orchestrator)"""
    try:
        report = await processor.generate_comparison_report(category)
        return report
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/vibecoding/weekly-summary")
async def get_weekly_summary():
    """Get weekly trends summary"""
    summary = await processor.generate_weekly_summary()
    return summary
