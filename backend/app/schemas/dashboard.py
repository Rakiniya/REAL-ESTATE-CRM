from datetime import date, datetime

from pydantic import BaseModel


class StageCount(BaseModel):
    stage: str
    count: int


class DashboardResponse(BaseModel):
    total_leads: int
    new_leads: int
    contacted_leads: int
    site_visits: int
    interested_leads: int
    negotiation_leads: int
    booked_leads: int
    lost_leads: int

    today_followups: int
    upcoming_followups: int

    total_projects: int
    available_units: int
    booked_units: int

    total_bookings: int