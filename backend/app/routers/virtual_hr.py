from typing import Optional, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.user import User
from app.schemas.task import TaskResponse
from app.services.task_service import TaskService
from app.core.dependencies import get_current_virtual_hr

router = APIRouter(prefix="/virtual-hr", tags=["Virtual HR"])


@router.get("/tasks", response_model=List[TaskResponse])
def get_my_tasks(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_vhr: User = Depends(get_current_virtual_hr),
):
    """Retrieve tasks assigned strictly to the authenticated Virtual HR user."""
    tasks = TaskService.get_virtual_hr_tasks(
        db=db,
        user_id=current_vhr.id,
        status_filter=status,
        priority_filter=priority,
        search=search,
    )
    return [TaskResponse.model_validate(t) for t in tasks]
