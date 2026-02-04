import google.generativeai as genai
from typing import Dict, Any, List
from app.core.config import get_settings
import json


class GeminiAnalyzer:
    """Gemini API wrapper for LLM analysis"""

    def __init__(self):
        settings = get_settings()
        genai.configure(api_key=settings.gemini_api_key)
        self.model = genai.GenerativeModel("gemini-2.0-flash")

    async def analyze(
        self,
        prompt: str,
        system_prompt: str | None = None,
        max_tokens: int = 4000,
    ) -> str:
        """Generic analysis method"""
        full_prompt = prompt
        if system_prompt:
            full_prompt = f"{system_prompt}\n\n{prompt}"

        response = self.model.generate_content(
            full_prompt,
            generation_config=genai.types.GenerationConfig(
                max_output_tokens=max_tokens,
            ),
        )
        return response.text

    async def analyze_new_tool(
        self,
        tool_info: Dict[str, Any],
        user_principles: List[str],
        current_stack: Dict[str, str],
    ) -> Dict[str, Any]:
        """Analyze a new tool against user principles and current stack"""

        prompt = f'''Analyze this new AI coding tool/feature:

TOOL INFO:
{json.dumps(tool_info, indent=2, ensure_ascii=False)}

USER'S PRINCIPLES:
{chr(10).join(f"- {p}" for p in user_principles)}

CURRENT STACK:
{json.dumps(current_stack, indent=2, ensure_ascii=False)}

Analyze:
1. How does this align with user's principles? (principle_alignment)
2. Does it improve on current stack? (stack_comparison)
3. Recommendation (recommend/consider/skip)
4. Key benefits and drawbacks

Output as JSON:
{{
  "recommendation": "recommend|consider|skip",
  "principle_alignment": {{"aligned": ["principles..."], "conflicting": ["principles..."]}},
  "stack_comparison": {{"replaces": "tool_name or null", "complements": ["tools..."], "improvement_areas": ["areas..."]}},
  "benefits": ["benefit1", "benefit2"],
  "drawbacks": ["drawback1"],
  "summary": "2-3 sentence summary in Korean"
}}'''

        result = await self.analyze(prompt)
        try:
            # Clean up response - Gemini sometimes wraps JSON in markdown
            result = result.strip()
            if result.startswith("```json"):
                result = result[7:]
            if result.startswith("```"):
                result = result[3:]
            if result.endswith("```"):
                result = result[:-3]
            return json.loads(result.strip())
        except json.JSONDecodeError:
            return {"raw_response": result, "parse_error": True}

    async def compare_with_current_stack(
        self,
        comparison_item: Dict[str, Any],
        current_tool: str,
        user_principles: List[str],
    ) -> Dict[str, Any]:
        """Compare a tool with user's current stack"""

        prompt = f'''Compare this tool with the user's current tool:

NEW TOOL:
{json.dumps(comparison_item, indent=2, ensure_ascii=False)}

CURRENT TOOL: {current_tool}

USER'S PRINCIPLES:
{chr(10).join(f"- {p}" for p in user_principles)}

Analyze whether the new tool might be better than the current one.
Consider the user's principles in your analysis.

Output as JSON:
{{
  "should_switch": true|false,
  "confidence": 0.0-1.0,
  "advantages_of_new": ["adv1", "adv2"],
  "advantages_of_current": ["adv1", "adv2"],
  "principle_based_reasoning": "reasoning based on principles",
  "migration_effort": "low|medium|high",
  "summary": "recommendation summary in Korean"
}}'''

        result = await self.analyze(prompt)
        try:
            result = result.strip()
            if result.startswith("```json"):
                result = result[7:]
            if result.startswith("```"):
                result = result[3:]
            if result.endswith("```"):
                result = result[:-3]
            return json.loads(result.strip())
        except json.JSONDecodeError:
            return {"raw_response": result, "parse_error": True}

    async def summarize_trends(
        self,
        items: List[Dict[str, Any]],
        user_principles: List[str],
        time_period: str = "this week",
    ) -> Dict[str, Any]:
        """Summarize trends and best practices"""

        items_text = "\n\n".join([
            f"- {item.get('title', 'Untitled')}: {item.get('content', '')[:500]}"
            for item in items[:20]  # Limit items
        ])

        prompt = f'''Summarize the key AI coding trends and best practices from {time_period}:

COLLECTED ITEMS:
{items_text}

USER'S PRINCIPLES:
{chr(10).join(f"- {p}" for p in user_principles)}

Provide a summary that:
1. Highlights relevant trends
2. Notes practices aligned with user's principles
3. Flags anything conflicting with principles

Output as JSON:
{{
  "key_trends": ["trend1", "trend2"],
  "best_practices": ["practice1", "practice2"],
  "principle_aligned": ["items that align with principles"],
  "principle_conflicts": ["items that conflict"],
  "action_items": ["suggested actions"],
  "summary": "Executive summary in Korean (3-5 sentences)"
}}'''

        result = await self.analyze(prompt)
        try:
            result = result.strip()
            if result.startswith("```json"):
                result = result[7:]
            if result.startswith("```"):
                result = result[3:]
            if result.endswith("```"):
                result = result[:-3]
            return json.loads(result.strip())
        except json.JSONDecodeError:
            return {"raw_response": result, "parse_error": True}
