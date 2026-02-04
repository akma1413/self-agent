from abc import ABC, abstractmethod
from typing import Dict, Any


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
