from datetime import date, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_sales_or_admin
from app.models.models import (
    Booking,
    Lead,
    LeadStage,
    Project,
    Unit,
    UnitStatus,
    User,
    UserRole,
)
from app.schemas.dashboard import DashboardResponse


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get(
    "",
    response_model=DashboardResponse
)
def get_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_sales_or_admin)
):

    # --------------------------------
    # BASE LEAD QUERY
    # --------------------------------

    lead_query = db.query(Lead)

    if current_user.role == UserRole.SALES_EMPLOYEE:
        lead_query = lead_query.filter(
            Lead.assigned_to == current_user.id
        )

    # --------------------------------
    # LEAD COUNTS
    # --------------------------------

    total_leads = lead_query.count()

    new_leads = lead_query.filter(
        Lead.stage == LeadStage.NEW
    ).count()

    contacted_leads = lead_query.filter(
        Lead.stage == LeadStage.CONTACTED
    ).count()

    site_visits = lead_query.filter(
        Lead.stage == LeadStage.SITE_VISIT
    ).count()

    interested_leads = lead_query.filter(
        Lead.stage == LeadStage.INTERESTED
    ).count()

    negotiation_leads = lead_query.filter(
        Lead.stage == LeadStage.NEGOTIATION
    ).count()

    booked_leads = lead_query.filter(
        Lead.stage == LeadStage.BOOKED
    ).count()

    lost_leads = lead_query.filter(
        Lead.stage == LeadStage.LOST
    ).count()

    # --------------------------------
    # FOLLOW-UPS
    # --------------------------------

    today = date.today()

    today_followups = lead_query.filter(
        Lead.follow_up_date == today
    ).count()

    upcoming_followups = lead_query.filter(
        Lead.follow_up_date > today,
        Lead.follow_up_date <= today + timedelta(days=7)
    ).count()

    # --------------------------------
    # PROPERTY COUNTS
    # --------------------------------

    total_projects = db.query(Project).count()

    available_units = db.query(Unit).filter(
        Unit.status == UnitStatus.AVAILABLE
    ).count()

    booked_units = db.query(Unit).filter(
        Unit.status == UnitStatus.BOOKED
    ).count()

    # --------------------------------
    # BOOKING COUNT
    # --------------------------------

    booking_query = db.query(Booking)

    if current_user.role == UserRole.SALES_EMPLOYEE:
        booking_query = booking_query.filter(
            Booking.booked_by == current_user.id
        )

    total_bookings = booking_query.count()

    # --------------------------------
    # RESPONSE
    # --------------------------------

    return {
        "total_leads": total_leads,
        "new_leads": new_leads,
        "contacted_leads": contacted_leads,
        "site_visits": site_visits,
        "interested_leads": interested_leads,
        "negotiation_leads": negotiation_leads,
        "booked_leads": booked_leads,
        "lost_leads": lost_leads,
        "today_followups": today_followups,
        "upcoming_followups": upcoming_followups,
        "total_projects": total_projects,
        "available_units": available_units,
        "booked_units": booked_units,
        "total_bookings": total_bookings,
    }