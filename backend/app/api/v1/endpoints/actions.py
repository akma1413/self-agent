from fastapi import APIRouter, HTTPException
from typing import List
from datetime import datetime
from app.core.database import get_supabase_client
from app.schemas.reports import ActionResponse, ActionConfirm

router = APIRouter()


@router.get("", response_model=List[ActionResponse])
async def list_actions(status: str | None = None, priority: str | None = None):
    client = get_supabase_client()
    query = client.table("actions").select("*")

    if status:
        query = query.eq("status", status)
    if priority:
        query = query.eq("priority", priority)

    result = query.order("created_at", desc=True).execute()
    return result.data


@router.get("/pending", response_model=List[ActionResponse])
async def list_pending_actions():
    """Get all pending actions"""
    client = get_supabase_client()
    result = (
        client.table("actions")
        .select("*")
        .eq("status", "pending")
        .order("priority", desc=True)
        .order("created_at", desc=True)
        .execute()
    )
    return result.data


@router.get("/{action_id}", response_model=ActionResponse)
async def get_action(action_id: str):
    client = get_supabase_client()
    result = client.table("actions").select("*").eq("id", action_id).single().execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Action not found")

    return result.data


@router.post("/{action_id}/confirm")
async def confirm_action(action_id: str, body: ActionConfirm | None = None):
    """Confirm an action (user approves)"""
    client = get_supabase_client()

    result = client.table("actions").update({
        "status": "confirmed",
        "confirmed_at": datetime.now().isoformat(),
    }).eq("id", action_id).execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Action not found")

    # Record feedback
    if body and body.comment:
        client.table("feedback").insert({
            "entity_type": "action",
            "entity_id": action_id,
            "feedback_type": "confirm",
            "comment": body.comment,
        }).execute()

    return result.data[0]


@router.post("/{action_id}/reject")
async def reject_action(action_id: str, body: ActionConfirm | None = None):
    """Reject an action"""
    client = get_supabase_client()

    result = client.table("actions").update({
        "status": "rejected",
    }).eq("id", action_id).execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Action not found")

    # Record feedback
    client.table("feedback").insert({
        "entity_type": "action",
        "entity_id": action_id,
        "feedback_type": "reject",
        "comment": body.comment if body else None,
    }).execute()

    return result.data[0]


@router.post("/{action_id}/execute")
async def mark_executed(action_id: str):
    """Mark action as executed"""
    client = get_supabase_client()

    # Check if confirmed first
    action = client.table("actions").select("status").eq("id", action_id).single().execute()
    if not action.data:
        raise HTTPException(status_code=404, detail="Action not found")

    if action.data["status"] != "confirmed":
        raise HTTPException(status_code=400, detail="Action must be confirmed before execution")

    result = client.table("actions").update({
        "status": "executed",
        "executed_at": datetime.now().isoformat(),
    }).eq("id", action_id).execute()

    return result.data[0]
