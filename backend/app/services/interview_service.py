from typing import Optional, List
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.interview import Interview
from app.models.user import User
from app.schemas.interview import InterviewCreate, InterviewUpdate
from app.utils.datetime_utils import utc_now


class InterviewService:
    @staticmethod
    def create_interview(db: Session, interview_in: InterviewCreate, creator: User) -> Interview:
        # Create interview record
        interview = Interview(
            candidate_name=interview_in.candidate_name.strip(),
            candidate_email=interview_in.candidate_email.strip(),
            candidate_phone=interview_in.candidate_phone.strip() if interview_in.candidate_phone else None,
            interview_date=interview_in.interview_date,
            start_time=interview_in.start_time.strip(),
            duration_minutes=interview_in.duration_minutes,
            mode=interview_in.mode,
            status="Scheduled",
            notes=interview_in.notes.strip() if interview_in.notes else None,
            created_by_id=creator.id,
            created_at=utc_now(),
            updated_at=utc_now(),
        )
        db.add(interview)
        db.commit()
        db.refresh(interview)
        return interview

    @staticmethod
    def get_interviews(
        db: Session,
        mode_filter: Optional[str] = None,
        status_filter: Optional[str] = None,
    ) -> List[Interview]:
        query = db.query(Interview)
        if mode_filter and mode_filter.lower() != "all":
            query = query.filter(Interview.mode.ilike(mode_filter))
        if status_filter and status_filter.lower() != "all":
            query = query.filter(Interview.status.ilike(status_filter))
        return query.order_by(Interview.interview_date.desc(), Interview.start_time.asc()).all()

    @staticmethod
    def get_interview_by_id(db: Session, interview_id: int) -> Interview:
        interview = db.query(Interview).filter(Interview.id == interview_id).first()
        if not interview:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Interview with ID {interview_id} not found",
            )
        return interview

    @staticmethod
    def update_interview(
        db: Session,
        interview: Interview,
        interview_in: InterviewUpdate,
    ) -> Interview:
        update_data = interview_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(interview, field, value)
        interview.updated_at = utc_now()
        db.commit()
        db.refresh(interview)
        return interview

    @staticmethod
    def cancel_interview(db: Session, interview: Interview) -> Interview:
        interview.status = "Cancelled"
        interview.updated_at = utc_now()
        db.commit()
        db.refresh(interview)
        return interview
