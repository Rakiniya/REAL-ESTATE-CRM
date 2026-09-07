from decimal import Decimal

from pydantic import BaseModel, ConfigDict

from app.models.models import UnitStatus


# =========================
# Project
# =========================

class ProjectCreate(BaseModel):
    name: str
    location: str
    description: str | None = None


class ProjectUpdate(BaseModel):
    name: str | None = None
    location: str | None = None
    description: str | None = None


class ProjectResponse(BaseModel):
    id: int
    name: str
    location: str
    description: str | None

    model_config = ConfigDict(from_attributes=True)


# =========================
# Building
# =========================

class BuildingCreate(BaseModel):
    name: str


class BuildingUpdate(BaseModel):
    name: str | None = None


class BuildingResponse(BaseModel):
    id: int
    project_id: int
    name: str

    model_config = ConfigDict(from_attributes=True)


# =========================
# Unit
# =========================

class UnitCreate(BaseModel):
    unit_number: str
    type: str
    price: Decimal
    status: UnitStatus = UnitStatus.AVAILABLE


class UnitUpdate(BaseModel):
    unit_number: str | None = None
    type: str | None = None
    price: Decimal | None = None
    status: UnitStatus | None = None


class UnitResponse(BaseModel):
    id: int
    building_id: int
    unit_number: str
    type: str
    price: Decimal
    status: UnitStatus

    model_config = ConfigDict(from_attributes=True)