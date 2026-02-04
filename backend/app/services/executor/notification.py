import httpx
from typing import Dict, Any
from app.services.executor.base import AbstractExecutor
from app.core.config import get_settings


class NotificationExecutor(AbstractExecutor):
    """Send notifications about actions"""

    def get_executor_type(self) -> str:
        return "notification"

    async def execute(self, action: Dict[str, Any]) -> Dict[str, Any]:
        """Execute notification (placeholder for email/slack)"""
        # For now, just log the action
        print(f"Notification: {action.get('title')}")

        return {
            "success": True,
            "message": f"Notification sent for: {action.get('title')}",
        }


class SlackNotifier(AbstractExecutor):
    """Send Slack notifications"""

    def __init__(self, webhook_url: str | None = None):
        self.webhook_url = webhook_url

    def get_executor_type(self) -> str:
        return "slack"

    async def execute(self, action: Dict[str, Any]) -> Dict[str, Any]:
        if not self.webhook_url:
            return {"success": False, "error": "Slack webhook not configured"}

        message = {
            "text": f"*{action.get('title')}*\n{action.get('description', '')}",
            "blocks": [
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": f"*New Action:* {action.get('title')}"
                    }
                },
                {
                    "type": "section",
                    "fields": [
                        {"type": "mrkdwn", "text": f"*Priority:* {action.get('priority')}"},
                        {"type": "mrkdwn", "text": f"*Type:* {action.get('action_type')}"},
                    ]
                }
            ]
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(self.webhook_url, json=message)

            if response.status_code == 200:
                return {"success": True, "message": "Slack notification sent"}
            else:
                return {"success": False, "error": f"Slack error: {response.status_code}"}
