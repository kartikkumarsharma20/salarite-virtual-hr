from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field
from app.schemas.user import UserSimpleResponse


class TaskActivityResponse(BaseModel):
    id: int
    task_id: int
    user_id: int
    action: str
    details: str
    created_at: datetime
    user: Optional[UserSimpleResponse] = None

    model_config = ConfigDict(from_attributes=True)


class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    priority: str = Field(default="Medium")  # Low, Medium, High, Urgent
    deadline: Optional[datetime] = None
    assigned_to_id: Optional[int] = None


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    priority: Optional[str] = None
    deadline: Optional[datetime] = None
    assigned_to_id: Optional[int] = None
    status: Optional[str] = None


class TaskStatusUpdate(BaseModel):
    status: str  # Pending, In Progress, Completed, Blocked
    progress_note: Optional[str] = None


class TaskResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    status: str
    priority: str
    deadline: Optional[datetime] = None
    assigned_by_id: Optional[int] = None
    assigned_to_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    assigned_by: Optional[UserSimpleResponse] = None
    assigned_to: Optional[UserSimpleResponse] = None
    activities: Optional[List[TaskActivityResponse]] = []

    model_config = ConfigDict(from_attributes=True)
