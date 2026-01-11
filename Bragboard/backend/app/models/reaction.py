from sqlalchemy import Column, Integer, ForeignKey, String, TIMESTAMP, UniqueConstraint
from sqlalchemy.sql import func

from app.database import Base


class Reaction(Base):
    __tablename__ = "reactions"

    id = Column(Integer, primary_key=True, index=True)
    shoutout_id = Column(Integer, ForeignKey("shoutouts.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    # example: "like", "clap", "star"
    reaction_type = Column(String(20), nullable=False)

    created_at = Column(TIMESTAMP, server_default=func.now(), nullable=False)

    __table_args__ = (
        UniqueConstraint("shoutout_id", "user_id", "reaction_type", name="uq_user_reaction"),
    )
