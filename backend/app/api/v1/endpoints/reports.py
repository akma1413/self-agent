from fastapi import APIRouter, HTTPException
from typing import List
from app.core.database import get_supabase_client
from app.schemas.reports import ReportCreate, ReportResponse, ReportStatus

router = APIRouter()


@router.get("", response_model=List[ReportResponse])
async def list_reports(status: str | None = None, limit: int = 50):
    client = get_supabase_client()
    query = client.table("reports").select("*")

    if status:
        query = query.eq("status", status)

    result = query.order("created_at", desc=True).limit(limit).execute()
    return result.data


@router.get("/pending", response_model=List[ReportResponse])
async def list_pending_reports():
    """Get all pending reports for review"""
    client = get_supabase_client()
    result = (
        client.table("reports")
        .select("*")
        .eq("status", ReportStatus.PENDING.value)
        .order("created_at", desc=True)
        .execute()
    )
    return result.data


@router.get("/{report_id}", response_model=ReportResponse)
async def get_report(report_id: str):
    client = get_supabase_client()
    result = client.table("reports").select("*").eq("id", report_id).single().execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Report not found")

    return result.data


@router.get("/{report_id}/actions")
async def get_report_actions(report_id: str):
    client = get_supabase_client()
    result = client.table("actions").select("*").eq("report_id", report_id).execute()
    return result.data


@router.post("/{report_id}/review")
async def mark_reviewed(report_id: str):
    """Mark report as reviewed"""
    client = get_supabase_client()
    from datetime import datetime

    result = client.table("reports").update({
        "status": ReportStatus.REVIEWED.value,
        "reviewed_at": datetime.now().isoformat(),
    }).eq("id", report_id).execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Report not found")

    return result.data[0]


@router.post("/{report_id}/archive")
async def archive_report(report_id: str):
    """Archive a report"""
    client = get_supabase_client()

    result = client.table("reports").update({
        "status": ReportStatus.ARCHIVED.value,
    }).eq("id", report_id).execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Report not found")

    return result.data[0]
