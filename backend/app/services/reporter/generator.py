from typing import Dict, Any, List
from datetime import datetime
from app.core.database import get_supabase_client
from app.schemas.reports import ReportCreate, ReportType


class ReportGenerator:
    """Generate reports from analysis results"""

    def __init__(self):
        self.client = get_supabase_client()

    async def generate_new_tool_report(
        self,
        agenda_id: str,
        tool_name: str,
        analysis: Dict[str, Any],
        source_item: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Generate report for a new tool discovery"""

        recommendation = analysis.get("recommendation", "consider")
        summary = analysis.get("summary", "")

        report_data = {
            "agenda_id": agenda_id,
            "report_type": ReportType.NEW_TOOL.value,
            "title": f"새로운 도구 발견: {tool_name}",
            "summary": summary,
            "content": {
                "tool_name": tool_name,
                "source_url": source_item.get("url"),
                "recommendation": recommendation,
                "analysis": analysis,
                "source_item_id": source_item.get("id"),
            },
        }

        result = self.client.table("reports").insert(report_data).execute()
        report = result.data[0]

        # Create recommended actions
        await self._create_actions_for_report(report, analysis)

        return report

    async def generate_comparison_report(
        self,
        agenda_id: str,
        category: str,
        current_tool: str,
        comparisons: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        """Generate comparison report"""

        # Find the best alternative
        best_alternative = None
        for comp in comparisons:
            analysis = comp.get("analysis", {})
            if analysis.get("should_switch") and analysis.get("confidence", 0) > 0.7:
                best_alternative = comp
                break

        summary = f"{category} 카테고리의 {current_tool} 대안 분석"
        if best_alternative:
            summary += f" - {best_alternative['item']} 검토 권장"

        report_data = {
            "agenda_id": agenda_id,
            "report_type": ReportType.COMPARISON.value,
            "title": f"현행 스택 비교: {category}",
            "summary": summary,
            "content": {
                "category": category,
                "current_tool": current_tool,
                "comparisons": comparisons,
                "best_alternative": best_alternative,
            },
        }

        result = self.client.table("reports").insert(report_data).execute()
        report = result.data[0]

        # Create actions if switch recommended
        if best_alternative:
            await self._create_switch_action(report, best_alternative)

        return report

    async def generate_weekly_report(
        self,
        agenda_id: str,
        summary: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Generate weekly summary report"""

        report_data = {
            "agenda_id": agenda_id,
            "report_type": ReportType.BEST_PRACTICE.value,
            "title": f"주간 AI 코딩 트렌드 ({datetime.now().strftime('%Y-%m-%d')})",
            "summary": summary.get("summary", ""),
            "content": {
                "key_trends": summary.get("key_trends", []),
                "best_practices": summary.get("best_practices", []),
                "principle_aligned": summary.get("principle_aligned", []),
                "principle_conflicts": summary.get("principle_conflicts", []),
                "action_items": summary.get("action_items", []),
            },
        }

        result = self.client.table("reports").insert(report_data).execute()
        report = result.data[0]

        # Create actions for each action item
        for action_item in summary.get("action_items", []):
            await self._create_action(
                report_id=report["id"],
                action_type="review",
                title=action_item,
                priority="medium",
            )

        return report

    async def _create_actions_for_report(
        self, report: Dict[str, Any], analysis: Dict[str, Any]
    ):
        """Create recommended actions based on analysis"""
        recommendation = analysis.get("recommendation", "consider")

        if recommendation == "recommend":
            await self._create_action(
                report_id=report["id"],
                action_type="try",
                title=f"새 도구 사용해보기",
                description=analysis.get("summary"),
                priority="high",
            )
        elif recommendation == "consider":
            await self._create_action(
                report_id=report["id"],
                action_type="research",
                title=f"추가 조사 필요",
                description="더 많은 정보를 수집하고 평가하세요",
                priority="medium",
            )

    async def _create_switch_action(
        self, report: Dict[str, Any], alternative: Dict[str, Any]
    ):
        """Create action to switch tools"""
        analysis = alternative.get("analysis", {})

        await self._create_action(
            report_id=report["id"],
            action_type="switch",
            title=f"{alternative['item']}으로 전환 검토",
            description=analysis.get("summary"),
            priority="high" if analysis.get("confidence", 0) > 0.8 else "medium",
        )

    async def _create_action(
        self,
        report_id: str,
        action_type: str,
        title: str,
        description: str | None = None,
        priority: str = "medium",
    ):
        """Create a single action"""
        action_data = {
            "report_id": report_id,
            "action_type": action_type,
            "title": title,
            "description": description,
            "priority": priority,
        }

        self.client.table("actions").insert(action_data).execute()
