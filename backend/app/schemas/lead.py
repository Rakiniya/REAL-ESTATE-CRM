from datetime import date, datetime

from pydantic import BaseModel, EmailStr, ConfigDict

from app.models.models import LeadStage


class LeadCreate(BaseModel):
    name: str
    email: EmailStr | None = None
    phone: str
    stage: LeadStage = LeadStage.NEW
    assigned_to: int | None = None
    follow_up_date: date | None = None


class LeadUpdate(BaseModel):
    name: str | None = None
    email: EmailStr | None = None
    phone: str | None = None
    stage: LeadStage | None = None
    assigned_to: int | None = None
    follow_up_date: date | None = None


class LeadResponse(BaseModel):
    id: int
    name: str
    email: EmailStr | None
    phone: str
    stage: LeadStage
    assigned_to: int | None
    follow_up_date: date | None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class LeadNoteCreate(BaseModel):
    note: str


class LeadNoteResponse(BaseModel):
    id: int
    lead_id: int
    note: str
    created_by: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)