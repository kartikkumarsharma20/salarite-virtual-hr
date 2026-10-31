from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import or_
from fastapi import HTTPException, status

from app.models.task import Task
from app.models.task_activity import TaskActivity
from app.models.user import User
from app.schemas.task import TaskCreate, TaskUpdate, TaskStatusUpdate
from app.utils.datetime_utils import utc_now


class TaskService:
    @staticmethod
    def create_task(db: Session, task_in: TaskCreate, creator: User) -> Task:
        # Validate assignee exists if provided
        assigned_to_name = "Unassigned"
        if task_in.assigned_to_id:
            assignee = db.query(User).filter(User.id == task_in.assigned_to_id).first()
            if not assignee:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Assigned Virtual HR user not found",
                )
            assigned_to_name = assignee.full_name

        db_task = Task(
            title=task_in.title,
            description=task_in.description,
            priority=task_in.priority or "Medium",
            deadline=task_in.deadline,
            status="Pending",
            assigned_by_id=creator.id,
            assigned_to_id=task_in.assigned_to_id,
            created_at=utc_now(),
            updated_at=utc_now(),
        )
        db.add(db_task)
        db.commit()
        db.refresh(db_task)

        # Log creation activity
        activity = TaskActivity(
            task_id=db_task.id,
            user_id=creator.id,
            action="created",
            details=f"Task created by {creator.full_name}. Assigned to: {assigned_to_name}.",
            created_at=utc_now(),
        )
        db.add(activity)
        db.commit()
        db.refresh(db_task)
        return db_task

    @staticmethod
    def get_tasks(
        db: Session,
        status_filter: Optional[str] = None,
        priority_filter: Optional[str] = None,
        assignee_id: Optional[int] = None,
        search: Optional[str] = None,
    ) -> List[Task]:
        query = db.query(Task)
        if status_filter and status_filter.lower() != "all":
            # Match case-insensitively
            query = query.filter(Task.status.ilike(status_filter))
        if priority_filter and priority_filter.lower() != "all":
            query = query.filter(Task.priority.ilike(priority_filter))
        if assignee_id is not None:
            query = query.filter(Task.assigned_to_id == assignee_id)
        if search:
            search_pattern = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    Task.title.ilike(search_pattern),
                    Task.description.ilike(search_pattern),
                )
            )
        return query.order_by(Task.created_at.desc()).all()

    @staticmethod
    def get_virtual_hr_tasks(
        db: Session,
        user_id: int,
        status_filter: Optional[str] = None,
        priority_filter: Optional[str] = None,
        search: Optional[str] = None,
    ) -> List[Task]:
        query = db.query(Task).filter(Task.assigned_to_id == user_id)
        if status_filter and status_filter.lower() != "all":
            query = query.filter(Task.status.ilike(status_filter))
        if priority_filter and priority_filter.lower() != "all":
            query = query.filter(Task.priority.ilike(priority_filter))
        if search:
            search_pattern = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    Task.title.ilike(search_pattern),
                    Task.description.ilike(search_pattern),
                )
            )
        return query.order_by(Task.created_at.desc()).all()

    @staticmethod
    def get_task_by_id(db: Session, task_id: int) -> Task:
        task = db.query(Task).filter(Task.id == task_id).first()
        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Task with ID {task_id} not found",
            )
        return task

    @staticmethod
    def update_task_details(
        db: Session,
        task: Task,
        task_in: TaskUpdate,
        user: User,
    ) -> Task:
        changes = []
        if task_in.title is not None and task_in.title != task.title:
            changes.append(f"title from '{task.title}' to '{task_in.title}'")
            task.title = task_in.title
        if task_in.description is not None and task_in.description != task.description:
            changes.append("description updated")
            task.description = task_in.description
        if task_in.priority is not None and task_in.priority != task.priority:
            changes.append(f"priority from '{task.priority}' to '{task_in.priority}'")
            task.priority = task_in.priority
        if task_in.deadline is not None and task_in.deadline != task.deadline:
            changes.append("deadline updated")
            task.deadline = task_in.deadline
        if task_in.status is not None and task_in.status != task.status:
            changes.append(f"status from '{task.status}' to '{task_in.status}'")
            task.status = task_in.status
        if task_in.assigned_to_id is not None and task_in.assigned_to_id != task.assigned_to_id:
            assignee = db.query(User).filter(User.id == task_in.assigned_to_id).first()
            assignee_name = assignee.full_name if assignee else "Unknown"
            changes.append(f"reassigned to {assignee_name}")
            task.assigned_to_id = task_in.assigned_to_id

        task.updated_at = utc_now()
        db.commit()
        db.refresh(task)

        if changes:
            activity = TaskActivity(
                task_id=task.id,
                user_id=user.id,
                action="details_updated",
                details=f"Task updated by {user.full_name}: {', '.join(changes)}.",
                created_at=utc_now(),
            )
            db.add(activity)
            db.commit()
            db.refresh(task)

        return task

    @staticmethod
    def update_task_status(
        db: Session,
        task: Task,
        status_update: TaskStatusUpdate,
        user: User,
    ) -> Task:
        # Check permissions: if user is virtual_hr, must be assigned to them!
        if user.role.lower() == "virtual_hr" and task.assigned_to_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Forbidden: Virtual HR can only update status of tasks assigned to them.",
            )

        old_status = task.status
        new_status = status_update.status
        task.status = new_status
        task.updated_at = utc_now()
        db.commit()
        db.refresh(task)

        detail_text = f"Status changed from {old_status} to {new_status} by {user.full_name}."
        if status_update.progress_note:
            detail_text += f" Note: \"{status_update.progress_note.strip()}\""

        activity = TaskActivity(
            task_id=task.id,
            user_id=user.id,
            action="status_changed",
            details=detail_text,
            created_at=utc_now(),
        )
        db.add(activity)
        db.commit()
        db.refresh(task)
        return task

    @staticmethod
    def delete_task(db: Session, task: Task):
        db.delete(task)
        db.commit()
