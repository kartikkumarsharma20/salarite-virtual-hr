from typing import Optional, List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.user import User
from app.schemas.interview import InterviewCreate, InterviewUpdate, InterviewResponse
from app.services.interview_service import InterviewService
from app.core.dependencies import get_current_user, get_current_employer

router = APIRouter(prefix="/interviews", tags=["Interviews"])


@router.post("", response_model=InterviewResponse, status_code=status.HTTP_201_CREATED)
def create_interview(
    interview_in: InterviewCreate,
    db: Session = Depends(get_db),
    current_employer: User = Depends(get_current_employer),
):
    """Schedule a new candidate interview (Employer only)."""
    interview = InterviewService.create_interview(
        db=db,
        interview_in=interview_in,
        creator=current_employer,
    )
    return InterviewResponse.model_validate(interview)


@router.get("", response_model=List[InterviewResponse])
def get_all_interviews(
    mode: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve interviews with optional mode (Voice, Video, Chat) and status filters."""
    interviews = InterviewService.get_interviews(
        db=db,
        mode_filter=mode,
        status_filter=status,
    )
    return [InterviewResponse.model_validate(i) for i in interviews]


@router.get("/{interview_id}", response_model=InterviewResponse)
def get_interview(
    interview_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get interview details by ID."""
    interview = InterviewService.get_interview_by_id(db=db, interview_id=interview_id)
    return InterviewResponse.model_validate(interview)


@router.put("/{interview_id}", response_model=InterviewResponse)
def update_interview(
    interview_id: int,
    interview_in: InterviewUpdate,
    db: Session = Depends(get_db),
    current_employer: User = Depends(get_current_employer),
):
    """Update or reschedule an interview (Employer only)."""
    interview = InterviewService.get_interview_by_id(db=db, interview_id=interview_id)
    updated_interview = InterviewService.update_interview(
        db=db,
        interview=interview,
        interview_in=interview_in,
    )
    return InterviewResponse.model_validate(updated_interview)


@router.patch("/{interview_id}/cancel", response_model=InterviewResponse)
def cancel_interview(
    interview_id: int,
    db: Session = Depends(get_db),
    current_employer: User = Depends(get_current_employer),
):
    """Cancel a scheduled interview (Employer only)."""
    interview = InterviewService.get_interview_by_id(db=db, interview_id=interview_id)
    cancelled_interview = InterviewService.cancel_interview(db=db, interview=interview)
    return InterviewResponse.model_validate(cancelled_interview)
