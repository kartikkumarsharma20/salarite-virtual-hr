from datetime import date
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database.connection import get_db
from app.models.task import Task
from app.models.interview import Interview
from app.models.task_activity import TaskActivity
from app.models.user import User
from app.schemas.dashboard import DashboardStatsResponse, DashboardActivityResponse
from app.schemas.task import TaskResponse, TaskActivityResponse
from app.schemas.interview import InterviewResponse
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats", response_model=DashboardStatsResponse)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve aggregate statistics for the employer dashboard."""
    # Count tasks by status case-insensitively
    total_tasks = db.query(func.count(Task.id)).scalar() or 0
    pending_tasks = db.query(func.count(Task.id)).filter(Task.status.ilike("pending")).scalar() or 0
    in_progress_tasks = db.query(func.count(Task.id)).filter(Task.status.ilike("in progress")).scalar() or 0
    completed_tasks = db.query(func.count(Task.id)).filter(Task.status.ilike("completed")).scalar() or 0
    blocked_tasks = db.query(func.count(Task.id)).filter(Task.status.ilike("blocked")).scalar() or 0

    # Upcoming interviews (Scheduled and date >= today)
    today = date.today()
    upcoming_interviews_query = db.query(Interview).filter(
        Interview.status.ilike("scheduled"),
        Interview.interview_date >= today,
    ).order_by(Interview.interview_date.asc(), Interview.start_time.asc())

    upcoming_count = upcoming_interviews_query.count()
    upcoming_interviews = upcoming_interviews_query.limit(5).all()

    # Recent tasks
    recent_tasks = db.query(Task).order_by(Task.updated_at.desc()).limit(6).all()

    return DashboardStatsResponse(
        total_tasks=total_tasks,
        pending_tasks=pending_tasks,
        in_progress_tasks=in_progress_tasks,
        completed_tasks=completed_tasks,
        blocked_tasks=blocked_tasks,
        upcoming_interviews_count=upcoming_count,
        recent_tasks=[TaskResponse.model_validate(t) for t in recent_tasks],
        upcoming_interviews=[InterviewResponse.model_validate(i) for i in upcoming_interviews],
    )


@router.get("/activity", response_model=DashboardActivityResponse)
def get_recent_activity(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve latest activity feed items."""
    activities = db.query(TaskActivity).order_by(TaskActivity.created_at.desc()).limit(15).all()
    return DashboardActivityResponse(
        activities=[TaskActivityResponse.model_validate(a) for a in activities]
    )
