from typing import List, Dict, Any
import google.generativeai as genai
from app.core.config import get_settings
from app.schemas.principles import PrincipleCreate

EXTRACTION_PROMPT = '''You are analyzing AI conversation history to extract the user's personal principles, preferences, and values.

Look for patterns where the user:
- Expresses strong opinions or preferences
- Makes decisions and explains why
- Criticizes or praises approaches
- States what they value or avoid
- Shows consistent behavioral patterns

For each principle found, provide:
1. A clear, concise statement in the user's voice (Korean or English as used)
2. The category (e.g., "simplicity", "pragmatism", "efficiency", "learning", "communication")

Examples of principles:
- "복잡해지면 단순하게 만들어" (simplicity)
- "이론보다 실제 작동하는 예시" (pragmatism)
- "새로운 도구는 써봐야 안다" (experimentation)

Analyze this conversation and extract principles:

{conversation}

Output as JSON array:
[
  {{"content": "principle statement", "category": "category_name"}},
  ...
]

Only output the JSON array, nothing else. If no clear principles found, output empty array [].'''


class PrincipleExtractor:
    """Extract user principles from conversation history using LLM"""

    def __init__(self):
        settings = get_settings()
        genai.configure(api_key=settings.gemini_api_key)
        self.model = genai.GenerativeModel("gemini-2.0-flash")

    async def extract_from_conversations(
        self, conversations: List[Dict[str, Any]]
    ) -> List[PrincipleCreate]:
        """Extract principles from a list of conversations"""
        all_principles = []

        for conv in conversations:
            principles = await self._extract_from_single(conv)
            all_principles.extend(principles)

        # Deduplicate similar principles
        return self._deduplicate_principles(all_principles)

    async def _extract_from_single(
        self, conversation: Dict[str, Any]
    ) -> List[PrincipleCreate]:
        """Extract principles from a single conversation"""
        import json

        content = conversation.get("content", "")
        if len(content) < 100:  # Skip very short conversations
            return []

        # Truncate very long conversations
        if len(content) > 15000:
            content = content[:15000] + "\n... (truncated)"

        prompt = EXTRACTION_PROMPT.format(conversation=content)

        try:
            response = self.model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    max_output_tokens=2000,
                ),
            )

            result_text = response.text.strip()
            # Clean up response - Gemini sometimes wraps JSON in markdown
            if result_text.startswith("```json"):
                result_text = result_text[7:]
            if result_text.startswith("```"):
                result_text = result_text[3:]
            if result_text.endswith("```"):
                result_text = result_text[:-3]
            result_text = result_text.strip()
            principles_data = json.loads(result_text)

            return [
                PrincipleCreate(
                    content=p["content"],
                    category=p.get("category"),
                )
                for p in principles_data
            ]
        except Exception as e:
            print(f"Extraction error: {e}")
            return []

    def _deduplicate_principles(
        self, principles: List[PrincipleCreate]
    ) -> List[PrincipleCreate]:
        """Remove duplicate or very similar principles"""
        seen = set()
        unique = []

        for p in principles:
            # Simple dedup by exact content
            if p.content.lower() not in seen:
                seen.add(p.content.lower())
                unique.append(p)

        return unique
