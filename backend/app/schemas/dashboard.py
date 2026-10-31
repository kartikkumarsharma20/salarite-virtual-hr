from typing import List, Optional
from pydantic import BaseModel, ConfigDict
from app.schemas.task import TaskResponse, TaskActivityResponse
from app.schemas.interview import InterviewResponse


class DashboardStatsResponse(BaseModel):
    total_tasks: int
    pending_tasks: int
    in_progress_tasks: int
    completed_tasks: int
    blocked_tasks: int
    upcoming_interviews_count: int
    recent_tasks: List[TaskResponse] = []
    upcoming_interviews: List[InterviewResponse] = []

    model_config = ConfigDict(from_attributes=True)


class DashboardActivityResponse(BaseModel):
    activities: List[TaskActivityResponse] = []

    model_config = ConfigDict(from_attributes=True)
