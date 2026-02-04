from fastapi import APIRouter, HTTPException
from typing import List
from app.core.database import get_supabase_client
from app.schemas.principles import (
    PrincipleCreate,
    PrincipleUpdate,
    PrincipleResponse,
    PrincipleWithEvidence,
    ExtractionRequest,
    ExtractionResponse,
)
from app.services.principles.extractor import PrincipleExtractor

router = APIRouter()
extractor = PrincipleExtractor()


@router.get("", response_model=List[PrincipleResponse])
async def list_principles(category: str | None = None, active_only: bool = True):
    client = get_supabase_client()
    query = client.table("principles").select("*")

    if category:
        query = query.eq("category", category)
    if active_only:
        query = query.eq("is_active", True)

    result = query.order("confidence_score", desc=True).execute()
    return result.data


@router.get("/{principle_id}", response_model=PrincipleWithEvidence)
async def get_principle(principle_id: str):
    client = get_supabase_client()

    principle = client.table("principles").select("*").eq("id", principle_id).single().execute()
    if not principle.data:
        raise HTTPException(status_code=404, detail="Principle not found")

    evidences = client.table("principle_evidences").select("*").eq("principle_id", principle_id).execute()

    return {**principle.data, "evidences": evidences.data}


@router.post("", response_model=PrincipleResponse)
async def create_principle(principle: PrincipleCreate):
    client = get_supabase_client()
    result = client.table("principles").insert(principle.model_dump()).execute()
    return result.data[0]


@router.patch("/{principle_id}", response_model=PrincipleResponse)
async def update_principle(principle_id: str, principle: PrincipleUpdate):
    client = get_supabase_client()

    update_data = {k: v for k, v in principle.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    result = client.table("principles").update(update_data).eq("id", principle_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Principle not found")

    return result.data[0]


@router.delete("/{principle_id}")
async def delete_principle(principle_id: str):
    client = get_supabase_client()
    client.table("principles").delete().eq("id", principle_id).execute()
    return {"deleted": True}


@router.post("/extract", response_model=ExtractionResponse)
async def extract_principles(request: ExtractionRequest):
    """Extract principles from imported conversations using LLM"""
    client = get_supabase_client()

    query = client.table("conversations").select("*")
    if request.conversation_ids:
        query = query.in_("id", request.conversation_ids)

    conversations = query.execute()

    if not conversations.data:
        raise HTTPException(status_code=404, detail="No conversations found")

    extracted = await extractor.extract_from_conversations(conversations.data)

    # Save extracted principles
    saved = []
    for p in extracted:
        result = client.table("principles").insert(p.model_dump()).execute()
        if result.data:
            saved.append(result.data[0])

    return ExtractionResponse(
        extracted_count=len(saved),
        principles=saved,
    )
