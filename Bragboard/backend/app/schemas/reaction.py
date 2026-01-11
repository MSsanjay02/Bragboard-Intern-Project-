from pydantic import BaseModel


class ReactionCreate(BaseModel):
    reaction_type: str
