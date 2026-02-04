from fastapi import APIRouter, HTTPException
from typing import List
from pydantic import BaseModel
from app.core.database import get_supabase_client
from app.services.collector.manager import CollectorManager

router = APIRouter()


class SourceCreate(BaseModel):
    agenda_id: str
    name: str
    source_type: str
    url: str
    config: dict = {}


class SourceResponse(BaseModel):
    id: str
    agenda_id: str
    name: str
    source_type: str
    url: str
    config: dict
    is_active: bool
    last_collected_at: str | None
    created_at: str


@router.get("", response_model=List[SourceResponse])
async def list_sources(agenda_id: str | None = None):
    client = get_supabase_client()
    query = client.table("sources").select("*")

    if agenda_id:
        query = query.eq("agenda_id", agenda_id)

    result = query.execute()
    return result.data


@router.post("", response_model=SourceResponse)
async def create_source(source: SourceCreate):
    client = get_supabase_client()
    result = client.table("sources").insert(source.model_dump()).execute()
    return result.data[0]


@router.delete("/{source_id}")
async def delete_source(source_id: str):
    client = get_supabase_client()
    client.table("sources").delete().eq("id", source_id).execute()
    return {"deleted": True}


@router.post("/collect")
async def trigger_collection(agenda_id: str | None = None):
    """Manually trigger collection"""
    manager = CollectorManager()
    results = await manager.collect_all(agenda_id)
    return {"results": results}


@router.get("/{source_id}/items")
async def get_source_items(source_id: str, limit: int = 50):
    client = get_supabase_client()
    result = (
        client.table("collected_items")
        .select("*")
        .eq("source_id", source_id)
        .order("collected_at", desc=True)
        .limit(limit)
        .execute()
    )
    return result.data
