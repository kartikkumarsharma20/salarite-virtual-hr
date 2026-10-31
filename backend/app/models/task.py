from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.database.connection import Base
from app.utils.datetime_utils import utc_now


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    status = Column(String(50), nullable=False, default="Pending", index=True)  # Pending, In Progress, Completed, Blocked
    priority = Column(String(50), nullable=False, default="Medium", index=True)  # Low, Medium, High, Urgent
    deadline = Column(DateTime, nullable=True)
    assigned_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    assigned_to_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)

    # Relationships
    assigned_by = relationship(
        "User",
        foreign_keys=[assigned_by_id],
        back_populates="tasks_assigned_by",
    )
    assigned_to = relationship(
        "User",
        foreign_keys=[assigned_to_id],
        back_populates="tasks_assigned_to",
    )
    activities = relationship(
        "TaskActivity",
        back_populates="task",
        cascade="all, delete-orphan",
        order_by="desc(TaskActivity.created_at)",
    )
