from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Dict, Any

@dataclass
class ExecutionResult:
    status: str  # guide_generated, executed, failed
    guide: Dict[str, Any] | None = None
    executed: bool = False
    error: str | None = None

class BaseExecutor(ABC):
    """Base class for action executors. Note: Most executors generate guides, not execute commands."""

    @abstractmethod
    def execute(self, action: Dict[str, Any]) -> ExecutionResult:
        """Execute or generate guide for an action."""
        pass


class AbstractExecutor(ABC):
    """Base class for action executors"""

    @abstractmethod
    async def execute(self, action: Dict[str, Any]) -> Dict[str, Any]:
        """Execute the action and return result"""
        pass

    @abstractmethod
    def get_executor_type(self) -> str:
        """Return the type of executor"""
        pass
