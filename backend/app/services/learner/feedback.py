from typing import Dict, Any, List
from app.core.database import get_supabase_client


class FeedbackLearner:
    """Learn from user feedback to improve recommendations"""

    def __init__(self):
        self.client = get_supabase_client()

    async def analyze_feedback(self) -> Dict[str, Any]:
        """Analyze feedback patterns"""
        feedback = self.client.table("feedback").select("*").execute()

        if not feedback.data:
            return {"total": 0, "patterns": []}

        # Group by feedback type
        confirms = [f for f in feedback.data if f["feedback_type"] == "confirm"]
        rejects = [f for f in feedback.data if f["feedback_type"] == "reject"]

        return {
            "total": len(feedback.data),
            "confirms": len(confirms),
            "rejects": len(rejects),
            "confirm_rate": len(confirms) / len(feedback.data) if feedback.data else 0,
        }

    async def update_principle_confidence(self, principle_id: str, adjustment: float):
        """Adjust principle confidence based on feedback"""
        principle = (
            self.client.table("principles")
            .select("confidence_score")
            .eq("id", principle_id)
            .single()
            .execute()
        )

        if principle.data:
            new_score = max(0, min(1, principle.data["confidence_score"] + adjustment))
            self.client.table("principles").update({
                "confidence_score": new_score,
            }).eq("id", principle_id).execute()

    async def suggest_principle_refinements(self) -> List[Dict[str, Any]]:
        """Suggest refinements to principles based on feedback patterns"""
        # Get principles with low confidence
        low_confidence = (
            self.client.table("principles")
            .select("*")
            .lt("confidence_score", 0.3)
            .eq("is_active", True)
            .execute()
        )

        suggestions = []
        for principle in low_confidence.data:
            suggestions.append({
                "principle_id": principle["id"],
                "content": principle["content"],
                "confidence": principle["confidence_score"],
                "suggestion": "Consider reviewing or deactivating this principle",
            })

        return suggestions
