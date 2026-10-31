from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.database.connection import Base
from app.utils.datetime_utils import utc_now


class TaskActivity(Base):
    __tablename__ = "task_activities"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    action = Column(String(100), nullable=False)  # "created", "assigned", "status_changed", "details_updated", "progress_note"
    details = Column(Text, nullable=False)
    created_at = Column(DateTime, default=utc_now, nullable=False, index=True)

    # Relationships
    task = relationship("Task", back_populates="activities")
    user = relationship("User", back_populates="activities")
