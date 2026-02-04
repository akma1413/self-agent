import json
from typing import List, Dict, Any
from app.schemas.conversations import Platform, ConversationCreate
from datetime import datetime


class ConversationParser:
    """Parse conversation exports from different AI platforms"""

    def parse(self, platform: Platform, content: str) -> List[ConversationCreate]:
        parsers = {
            Platform.CLAUDE: self._parse_claude,
            Platform.CHATGPT: self._parse_chatgpt,
            Platform.GEMINI: self._parse_gemini,
        }
        return parsers[platform](content)

    def _parse_claude(self, content: str) -> List[ConversationCreate]:
        """Parse Claude conversation export JSON"""
        data = json.loads(content)
        conversations = []

        # Claude export format varies, handle common cases
        items = data if isinstance(data, list) else data.get("conversations", [data])

        for item in items:
            conv = ConversationCreate(
                platform=Platform.CLAUDE,
                external_id=item.get("uuid") or item.get("id"),
                title=item.get("name") or item.get("title"),
                content=self._extract_messages(item),
                metadata={"model": item.get("model")},
                conversation_date=self._parse_date(item.get("created_at") or item.get("create_time")),
            )
            conversations.append(conv)

        return conversations

    def _parse_chatgpt(self, content: str) -> List[ConversationCreate]:
        """Parse ChatGPT conversation export JSON"""
        data = json.loads(content)
        conversations = []

        items = data if isinstance(data, list) else [data]

        for item in items:
            messages = []
            mapping = item.get("mapping", {})
            for node in mapping.values():
                msg = node.get("message")
                if msg and msg.get("content", {}).get("parts"):
                    role = msg.get("author", {}).get("role", "unknown")
                    text = " ".join(msg["content"]["parts"])
                    messages.append(f"{role}: {text}")

            conv = ConversationCreate(
                platform=Platform.CHATGPT,
                external_id=item.get("id"),
                title=item.get("title"),
                content="\n\n".join(messages),
                metadata={"model": item.get("model")},
                conversation_date=self._parse_date(item.get("create_time")),
            )
            conversations.append(conv)

        return conversations

    def _parse_gemini(self, content: str) -> List[ConversationCreate]:
        """Parse Gemini/Bard Takeout JSON"""
        data = json.loads(content)
        conversations = []

        items = data if isinstance(data, list) else [data]

        for item in items:
            messages = []
            for turn in item.get("turns", []):
                role = turn.get("role", "unknown")
                text = turn.get("text", "")
                messages.append(f"{role}: {text}")

            conv = ConversationCreate(
                platform=Platform.GEMINI,
                external_id=item.get("id"),
                title=item.get("title"),
                content="\n\n".join(messages),
                metadata={},
                conversation_date=self._parse_date(item.get("timestamp")),
            )
            conversations.append(conv)

        return conversations

    def _extract_messages(self, item: Dict[str, Any]) -> str:
        """Extract message content from various formats"""
        messages = []

        # Try different message formats
        chat_messages = item.get("chat_messages") or item.get("messages") or []
        for msg in chat_messages:
            sender = msg.get("sender") or msg.get("role") or "unknown"
            text = msg.get("text") or msg.get("content") or ""
            if isinstance(text, list):
                text = " ".join(str(t) for t in text)
            messages.append(f"{sender}: {text}")

        return "\n\n".join(messages) if messages else item.get("content", "")

    def _parse_date(self, date_val) -> datetime | None:
        if not date_val:
            return None
        if isinstance(date_val, (int, float)):
            return datetime.fromtimestamp(date_val)
        if isinstance(date_val, str):
            try:
                return datetime.fromisoformat(date_val.replace("Z", "+00:00"))
            except:
                return None
        return None
