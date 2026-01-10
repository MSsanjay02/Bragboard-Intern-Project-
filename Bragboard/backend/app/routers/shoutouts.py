from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.shoutout import ShoutOut, ShoutOutRecipient
from app.schemas.shoutout import ShoutOutCreate

router = APIRouter(prefix="/shoutouts", tags=["Shoutouts"])


@router.post("")
def create_shoutout(
    payload: ShoutOutCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if not payload.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    if len(payload.recipient_ids) == 0:
        raise HTTPException(status_code=400, detail="At least one recipient must be tagged")

    # Validate recipients exist
    recipients = db.query(User).filter(User.id.in_(payload.recipient_ids)).all()
    if len(recipients) != len(set(payload.recipient_ids)):
        raise HTTPException(status_code=400, detail="One or more recipients not found")

    shoutout = ShoutOut(
        sender_id=current_user.id,
        message=payload.message.strip(),
    )
    db.add(shoutout)
    db.commit()
    db.refresh(shoutout)

    # Add recipients
    for rid in set(payload.recipient_ids):
        db.add(ShoutOutRecipient(shoutout_id=shoutout.id, recipient_id=rid))

    db.commit()

    return {"message": "Shout-out created successfully", "shoutout_id": shoutout.id}


@router.get("")
def list_shoutouts(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    # Department scoping: show shoutouts from same department only
    # (You can later make it "company-wide" toggle)
    shoutouts = (
        db.query(ShoutOut)
        .join(User, User.id == ShoutOut.sender_id)
        .filter(User.department == current_user.department)
        .order_by(ShoutOut.created_at.desc())
        .all()
    )

    result = []
    for s in shoutouts:
        recipient_users = [sr.recipient for sr in s.recipients]

        result.append(
            {
                "id": s.id,
                "message": s.message,
                "created_at": s.created_at,
                "sender": {
                    "id": s.sender.id,
                    "name": s.sender.name,
                    "department": s.sender.department,
                },
                "recipients": [
                    {"id": u.id, "name": u.name, "department": u.department}
                    for u in recipient_users
                ],
            }
        )

    return result
