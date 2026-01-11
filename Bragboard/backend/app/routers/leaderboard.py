from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, case

from app.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.shoutout import ShoutOutRecipient, ShoutOut
from app.models.reaction import Reaction
from app.models.comment import Comment

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/me")
def my_profile_stats(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    # shoutouts sent
    sent = db.query(func.count(ShoutOut.id)).filter(ShoutOut.sender_id == current_user.id).scalar() or 0

    # shoutouts received
    received = (
        db.query(func.count(ShoutOutRecipient.id))
        .filter(ShoutOutRecipient.recipient_id == current_user.id)
        .scalar()
        or 0
    )

    # reactions received (on shoutouts where I am recipient)
    my_shoutout_ids = (
        db.query(ShoutOutRecipient.shoutout_id)
        .filter(ShoutOutRecipient.recipient_id == current_user.id)
        .subquery()
    )

    like_count = (
        db.query(func.count(Reaction.id))
        .filter(Reaction.shoutout_id.in_(my_shoutout_ids), Reaction.reaction_type == "like")
        .scalar()
        or 0
    )
    clap_count = (
        db.query(func.count(Reaction.id))
        .filter(Reaction.shoutout_id.in_(my_shoutout_ids), Reaction.reaction_type == "clap")
        .scalar()
        or 0
    )
    star_count = (
        db.query(func.count(Reaction.id))
        .filter(Reaction.shoutout_id.in_(my_shoutout_ids), Reaction.reaction_type == "star")
        .scalar()
        or 0
    )

    # comments made
    comments_made = (
        db.query(func.count(Comment.id))
        .filter(Comment.user_id == current_user.id)
        .scalar()
        or 0
    )

    return {
        "user": {
            "id": current_user.id,
            "name": current_user.name,
            "email": current_user.email,
            "department": current_user.department,
            "role": current_user.role.value if hasattr(current_user.role, "value") else str(current_user.role),
        },
        "stats": {
            "shoutouts_sent": sent,
            "shoutouts_received": received,
            "reactions_received": {
                "like": like_count,
                "clap": clap_count,
                "star": star_count,
                "total": like_count + clap_count + star_count,
            },
            "comments_made": comments_made,
        },
    }


@router.get("/leaderboard")
def leaderboard(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Department wise leaderboard:
    - shoutouts received
    - star reactions received
    - total reactions received
    """

    # all shoutouts received per user (department filter)
    received_counts = (
        db.query(
            User.id.label("user_id"),
            User.name,
            User.department,
            func.count(ShoutOutRecipient.id).label("shoutouts_received"),
        )
        .join(ShoutOutRecipient, ShoutOutRecipient.recipient_id == User.id)
        .filter(User.department == current_user.department)
        .group_by(User.id)
        .subquery()
    )

    # reactions on shoutouts received per user
    # Join: user -> shoutout_recipients -> reactions
    rows = (
        db.query(
            User.id,
            User.name,
            User.department,
            func.coalesce(received_counts.c.shoutouts_received, 0).label("shoutouts_received"),
            func.sum(case((Reaction.reaction_type == "star", 1), else_=0)).label("stars"),
            func.sum(case((Reaction.reaction_type == "like", 1), else_=0)).label("likes"),
            func.sum(case((Reaction.reaction_type == "clap", 1), else_=0)).label("claps"),
            func.count(Reaction.id).label("total_reactions"),
        )
        .outerjoin(received_counts, received_counts.c.user_id == User.id)
        .outerjoin(ShoutOutRecipient, ShoutOutRecipient.recipient_id == User.id)
        .outerjoin(Reaction, Reaction.shoutout_id == ShoutOutRecipient.shoutout_id)
        .filter(User.department == current_user.department)
        .group_by(User.id, received_counts.c.shoutouts_received)
        .order_by(
            func.sum(case((Reaction.reaction_type == "star", 1), else_=0)).desc(),
            func.count(Reaction.id).desc(),
            func.coalesce(received_counts.c.shoutouts_received, 0).desc(),
        )
        .all()
    )

    return [
        {
            "id": r.id,
            "name": r.name,
            "department": r.department,
            "shoutouts_received": int(r.shoutouts_received or 0),
            "reactions": {
                "star": int(r.stars or 0),
                "like": int(r.likes or 0),
                "clap": int(r.claps or 0),
                "total": int(r.total_reactions or 0),
            },
        }
        for r in rows
    ]
