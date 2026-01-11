from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.core.deps import get_current_user
from app.models.reaction import Reaction
from app.models.comment import Comment
from app.models.shoutout import ShoutOut
from app.schemas.reaction import ReactionCreate
from app.schemas.comment import CommentCreate

router = APIRouter(prefix="/shoutouts", tags=["Interactions"])


# ✅ Toggle reaction
@router.post("/{shoutout_id}/react")
def toggle_reaction(
    shoutout_id: int,
    payload: ReactionCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    reaction_type = payload.reaction_type.strip().lower()
    allowed = {"like", "clap", "star"}

    if reaction_type not in allowed:
        raise HTTPException(status_code=400, detail="Invalid reaction type")

    shoutout = db.query(ShoutOut).filter(ShoutOut.id == shoutout_id).first()
    if not shoutout:
        raise HTTPException(status_code=404, detail="Shoutout not found")

    existing = (
        db.query(Reaction)
        .filter(
            Reaction.shoutout_id == shoutout_id,
            Reaction.user_id == current_user.id,
            Reaction.reaction_type == reaction_type,
        )
        .first()
    )

    if existing:
        db.delete(existing)
        db.commit()
        return {"message": "Reaction removed"}
    else:
        new_reaction = Reaction(
            shoutout_id=shoutout_id,
            user_id=current_user.id,
            reaction_type=reaction_type,
        )
        db.add(new_reaction)
        db.commit()
        return {"message": "Reaction added"}


# ✅ Reaction counts
@router.get("/{shoutout_id}/reactions")
def reaction_counts(
    shoutout_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    rows = (
        db.query(Reaction.reaction_type, func.count(Reaction.id))
        .filter(Reaction.shoutout_id == shoutout_id)
        .group_by(Reaction.reaction_type)
        .all()
    )

    counts = {r[0]: r[1] for r in rows}

    # ensure keys exist
    return {
        "like": counts.get("like", 0),
        "clap": counts.get("clap", 0),
        "star": counts.get("star", 0),
    }


# ✅ Add comment
@router.post("/{shoutout_id}/comments")
def add_comment(
    shoutout_id: int,
    payload: CommentCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if not payload.content.strip():
        raise HTTPException(status_code=400, detail="Comment cannot be empty")

    shoutout = db.query(ShoutOut).filter(ShoutOut.id == shoutout_id).first()
    if not shoutout:
        raise HTTPException(status_code=404, detail="Shoutout not found")

    comment = Comment(
        shoutout_id=shoutout_id,
        user_id=current_user.id,
        content=payload.content.strip(),
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)

    return {
        "message": "Comment added",
        "comment": {
            "id": comment.id,
            "content": comment.content,
            "created_at": comment.created_at,
            "user": {
                "id": current_user.id,
                "name": current_user.name,
                "department": current_user.department,
            },
        },
    }


# ✅ Get comments
@router.get("/{shoutout_id}/comments")
def list_comments(
    shoutout_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    comments = (
        db.query(Comment)
        .filter(Comment.shoutout_id == shoutout_id)
        .order_by(Comment.created_at.asc())
        .all()
    )

    return [
        {
            "id": c.id,
            "content": c.content,
            "created_at": c.created_at,
            "user": {
                "id": c.user.id,
                "name": c.user.name,
                "department": c.user.department,
            },
        }
        for c in comments
    ]
