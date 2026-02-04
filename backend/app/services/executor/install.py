from typing import Dict, Any
from .base import BaseExecutor, ExecutionResult

class InstallExecutor(BaseExecutor):
    """Generates installation guide. Does NOT execute system commands."""

    def execute(self, action: Dict[str, Any]) -> ExecutionResult:
        payload = action.get("payload", {})

        return ExecutionResult(
            status="guide_generated",
            guide={
                "command": payload.get("install_command", ""),
                "post_steps": payload.get("post_install", []),
                "rollback": payload.get("rollback_command", ""),
                "docs_url": payload.get("documentation_url", ""),
                "estimated_time": payload.get("estimated_time", ""),
                "difficulty": payload.get("difficulty", "MEDIUM"),
            },
            executed=False,  # Never execute system commands
        )
