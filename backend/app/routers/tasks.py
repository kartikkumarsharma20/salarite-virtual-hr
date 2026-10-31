from typing import Optional, List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.user import User
from app.schemas.task import TaskCreate, TaskUpdate, TaskStatusUpdate, TaskResponse
from app.services.task_service import TaskService
from app.core.dependencies import get_current_user, get_current_employer

router = APIRouter(prefix="/tasks", tags=["Tasks"])


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    task_in: TaskCreate,
    db: Session = Depends(get_db),
    current_employer: User = Depends(get_current_employer),
):
    """Create a new task (Employer only)."""
    task = TaskService.create_task(db=db, task_in=task_in, creator=current_employer)
    return TaskResponse.model_validate(task)


@router.get("", response_model=List[TaskResponse])
def get_all_tasks(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    assignee_id: Optional[int] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all tasks with optional filters (Search, Status, Priority, Assignee)."""
    tasks = TaskService.get_tasks(
        db=db,
        status_filter=status,
        priority_filter=priority,
        assignee_id=assignee_id,
        search=search,
    )
    return [TaskResponse.model_validate(t) for t in tasks]


@router.get("/{task_id}", response_model=TaskResponse)
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get task details by ID including full audit activities."""
    task = TaskService.get_task_by_id(db=db, task_id=task_id)
    return TaskResponse.model_validate(task)


@router.put("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    task_in: TaskUpdate,
    db: Session = Depends(get_db),
    current_employer: User = Depends(get_current_employer),
):
    """Update task title, description, priority, deadline, or assignee (Employer only)."""
    task = TaskService.get_task_by_id(db=db, task_id=task_id)
    updated_task = TaskService.update_task_details(
        db=db,
        task=task,
        task_in=task_in,
        user=current_employer,
    )
    return TaskResponse.model_validate(updated_task)


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_employer: User = Depends(get_current_employer),
):
    """Delete a task (Employer only)."""
    task = TaskService.get_task_by_id(db=db, task_id=task_id)
    TaskService.delete_task(db=db, task=task)
    return None


@router.patch("/{task_id}/status", response_model=TaskResponse)
def update_task_status(
    task_id: int,
    status_update: TaskStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update task status and append progress note.
    Virtual HR can only update their assigned tasks; Employer can update any task."""
    task = TaskService.get_task_by_id(db=db, task_id=task_id)
    updated_task = TaskService.update_task_status(
        db=db,
        task=task,
        status_update=status_update,
        user=current_user,
    )
    return TaskResponse.model_validate(updated_task)
