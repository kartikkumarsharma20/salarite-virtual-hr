from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict, Field
from app.schemas.user import UserSimpleResponse


class InterviewBase(BaseModel):
    candidate_name: str = Field(..., min_length=1, max_length=255)
    candidate_email: EmailStr
    candidate_phone: Optional[str] = None
    interview_date: date
    start_time: str = Field(..., min_length=1, max_length=50)
    duration_minutes: int = Field(default=30, ge=5, le=480)
    mode: str = Field(default="Video")  # Voice, Video, Chat
    notes: Optional[str] = None


class InterviewCreate(InterviewBase):
    pass


class InterviewUpdate(BaseModel):
    candidate_name: Optional[str] = None
    candidate_email: Optional[EmailStr] = None
    candidate_phone: Optional[str] = None
    interview_date: Optional[date] = None
    start_time: Optional[str] = None
    duration_minutes: Optional[int] = None
    mode: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None


class InterviewResponse(InterviewBase):
    id: int
    status: str
    created_by_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    created_by: Optional[UserSimpleResponse] = None

    model_config = ConfigDict(from_attributes=True)
