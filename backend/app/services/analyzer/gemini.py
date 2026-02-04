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

        prompt = f'''당신은 AI 코딩 도구 전문 분석가입니다.
사용자가 이 도구를 채택해야 할지 "판단만 하면 되는" 형태로 분석하세요.

TOOL INFO:
{json.dumps(tool_info, indent=2, ensure_ascii=False)}

USER'S PRINCIPLES:
{chr(10).join(f"- {p}" for p in user_principles)}

CURRENT STACK:
{json.dumps(current_stack, indent=2, ensure_ascii=False)}

다음 JSON 형식으로 분석하세요:
{{
  "summary": "한 문장 요약 (한국어)",
  "verdict": "ADOPT | CONSIDER | SKIP",
  "confidence": 0.0-1.0,

  "difference_from_current": {{
    "what_changes": "현재 도구 → 새 도구 변경 요약",
    "breaking_changes": ["호환 안되는 변경사항"],
    "compatible": ["그대로 사용 가능한 것들"]
  }},

  "benefits_if_adopted": [
    {{"benefit": "이점 이름", "impact": "HIGH|MEDIUM|LOW", "why": "왜 이점인지"}}
  ],

  "migration_guide": {{
    "estimated_time": "예상 소요 시간 (예: 30분)",
    "difficulty": "EASY | MEDIUM | HARD",
    "steps": [
      {{"step": 1, "action": "실행할 명령어/행동", "note": "참고사항"}}
    ],
    "rollback": "문제 시 원복 방법"
  }},

  "usage_guide": {{
    "getting_started": ["시작하기 단계들"],
    "key_features": ["핵심 기능 사용법"],
    "tips": ["활용 팁"]
  }},

  "decision_factors": {{
    "adopt_if": ["이런 경우 채택하세요"],
    "skip_if": ["이런 경우 스킵하세요"]
  }}
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
