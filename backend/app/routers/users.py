from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.user import User
from app.schemas.user import UserSimpleResponse
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/virtual-hr", response_model=List[UserSimpleResponse])
def get_virtual_hr_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve all active Virtual HR members for task assignment."""
    users = db.query(User).filter(
        User.role == "virtual_hr",
        User.is_active == True,
    ).all()
    return [UserSimpleResponse.model_validate(u) for u in users]
