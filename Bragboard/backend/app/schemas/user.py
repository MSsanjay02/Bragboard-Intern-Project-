from pydantic import BaseModel, EmailStr, field_validator

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    department: str

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str):
        if len(v.encode("utf-8")) > 72:
            raise ValueError("Password too long (max 72 bytes for bcrypt)")
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters")
        return v

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    department: str
    role: str

    class Config:
        from_attributes = True
