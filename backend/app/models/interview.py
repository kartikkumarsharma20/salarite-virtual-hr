from datetime import datetime, date
from sqlalchemy import Column, Integer, String, Text, DateTime, Date, ForeignKey
from sqlalchemy.orm import relationship

from app.database.connection import Base
from app.utils.datetime_utils import utc_now


class Interview(Base):
    __tablename__ = "interviews"

    id = Column(Integer, primary_key=True, index=True)
    candidate_name = Column(String(255), nullable=False, index=True)
    candidate_email = Column(String(255), nullable=False)
    candidate_phone = Column(String(50), nullable=True)
    interview_date = Column(Date, nullable=False, index=True)
    start_time = Column(String(50), nullable=False)  # e.g. "10:30 AM" or "14:30"
    duration_minutes = Column(Integer, default=30, nullable=False)
    mode = Column(String(50), nullable=False, default="Video", index=True)  # Voice, Video, Chat
    status = Column(String(50), nullable=False, default="Scheduled", index=True)  # Scheduled, Completed, Cancelled
    notes = Column(Text, nullable=True)
    created_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)

    # Relationships
    created_by = relationship(
        "User",
        back_populates="interviews_created",
    )
