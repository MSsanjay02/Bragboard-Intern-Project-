from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("")
def list_users(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    users = db.query(User).order_by(User.name.asc()).all()
    return [
        {
            "id": u.id,
            "name": u.name,
            "department": u.department,
            "role": u.role.value if hasattr(u.role, "value") else str(u.role),
        }
        for u in users
    ]
