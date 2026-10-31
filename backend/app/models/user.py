from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship

from app.database.connection import Base
from app.utils.datetime_utils import utc_now


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="virtual_hr")  # "employer" or "virtual_hr"
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=utc_now, nullable=False)

    # Relationships
    tasks_assigned_by = relationship(
        "Task",
        foreign_keys="Task.assigned_by_id",
        back_populates="assigned_by",
        cascade="all, delete-orphan",
    )
    tasks_assigned_to = relationship(
        "Task",
        foreign_keys="Task.assigned_to_id",
        back_populates="assigned_to",
    )
    interviews_created = relationship(
        "Interview",
        back_populates="created_by",
        cascade="all, delete-orphan",
    )
    activities = relationship(
        "TaskActivity",
        back_populates="user",
        cascade="all, delete-orphan",
    )
