from fastapi import APIRouter

from app.api.v1.endpoints import agendas, reports, actions, principles, conversations, sources, process, pipeline

router = APIRouter()

router.include_router(agendas.router, prefix="/agendas", tags=["agendas"])
router.include_router(reports.router, prefix="/reports", tags=["reports"])
router.include_router(actions.router, prefix="/actions", tags=["actions"])
router.include_router(principles.router, prefix="/principles", tags=["principles"])
router.include_router(
    conversations.router, prefix="/conversations", tags=["conversations"]
)
router.include_router(sources.router, prefix="/sources", tags=["sources"])
router.include_router(process.router, prefix="/process", tags=["process"])
router.include_router(pipeline.router, prefix="/pipeline", tags=["pipeline"])
