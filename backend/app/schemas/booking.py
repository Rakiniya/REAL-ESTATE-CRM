from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.models import BookingStatus


class BookingCreate(BaseModel):
    lead_id: int
    unit_id: int


class BookingResponse(BaseModel):
    id: int
    lead_id: int
    unit_id: int
    booked_by: int
    booking_date: datetime
    status: BookingStatus

    model_config = ConfigDict(from_attributes=True)