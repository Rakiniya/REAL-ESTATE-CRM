from pydantic import BaseModel, ConfigDict, EmailStr

from app.models.models import UserRole


class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    role: UserRole


class TokenResponse(BaseModel):
    access_token: str
    token_type: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: UserRole

    model_config = ConfigDict(from_attributes=True)