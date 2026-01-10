from pydantic import BaseModel
from typing import List
from datetime import datetime


class ShoutOutCreate(BaseModel):
    message: str
    recipient_ids: List[int]


class UserMini(BaseModel):
    id: int
    name: str
    department: str

    class Config:
        from_attributes = True


class ShoutOutResponse(BaseModel):
    id: int
    message: str
    created_at: datetime
    sender: UserMini
    recipients: List[UserMini]

    class Config:
        from_attributes = True
