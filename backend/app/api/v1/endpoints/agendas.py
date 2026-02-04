from fastapi import APIRouter, HTTPException
from typing import List
from app.core.database import get_supabase_client
from app.schemas.agendas import AgendaCreate, AgendaUpdate, AgendaResponse

router = APIRouter()


@router.get("", response_model=List[AgendaResponse])
async def list_agendas(active_only: bool = True):
    client = get_supabase_client()
    query = client.table("agendas").select("*")

    if active_only:
        query = query.eq("is_active", True)

    result = query.order("created_at", desc=True).execute()
    return result.data


@router.get("/{agenda_id}", response_model=AgendaResponse)
async def get_agenda(agenda_id: str):
    client = get_supabase_client()
    result = client.table("agendas").select("*").eq("id", agenda_id).single().execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Agenda not found")

    return result.data


@router.post("", response_model=AgendaResponse)
async def create_agenda(agenda: AgendaCreate):
    client = get_supabase_client()
    result = client.table("agendas").insert(agenda.model_dump()).execute()
    return result.data[0]


@router.patch("/{agenda_id}", response_model=AgendaResponse)
async def update_agenda(agenda_id: str, agenda: AgendaUpdate):
    client = get_supabase_client()

    update_data = {k: v for k, v in agenda.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    result = client.table("agendas").update(update_data).eq("id", agenda_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Agenda not found")

    return result.data[0]


@router.delete("/{agenda_id}")
async def delete_agenda(agenda_id: str):
    client = get_supabase_client()
    client.table("agendas").delete().eq("id", agenda_id).execute()
    return {"deleted": True}


@router.get("/{agenda_id}/reports")
async def get_agenda_reports(agenda_id: str, status: str | None = None):
    client = get_supabase_client()
    query = client.table("reports").select("*").eq("agenda_id", agenda_id)

    if status:
        query = query.eq("status", status)

    result = query.order("created_at", desc=True).execute()
    return result.data
