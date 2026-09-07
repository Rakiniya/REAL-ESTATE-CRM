from pydantic import BaseModel, ConfigDict, EmailStr
from app.models.models import UserRole


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: UserRole = UserRole.SALES_EMPLOYEE


class UserUpdate(BaseModel):
    name: str | None = None
    email: EmailStr | None = None
    role: UserRole | None = None


class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: UserRole

    model_config = ConfigDict(from_attributes=True)