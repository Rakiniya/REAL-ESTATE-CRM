from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_sales_or_admin
from app.models.models import (
    Booking,
    BookingStatus,
    Lead,
    LeadStage,
    Unit,
    UnitStatus,
    User,
    UserRole,
)
from app.schemas.booking import (
    BookingCreate,
    BookingResponse,
)


router = APIRouter(
    prefix="/bookings",
    tags=["Bookings"]
)


# -------------------------
# CREATE BOOKING
# -------------------------

@router.post(
    "",
    response_model=BookingResponse,
    status_code=status.HTTP_201_CREATED
)
def create_booking(
    data: BookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_sales_or_admin)
):
    # Check lead
    lead = db.query(Lead).filter(
        Lead.id == data.lead_id
    ).first()

    if lead is None:
        raise HTTPException(
            status_code=404,
            detail="Lead not found"
        )

    # Sales employee can only book for assigned lead
    if (
        current_user.role == UserRole.SALES_EMPLOYEE
        and lead.assigned_to != current_user.id
    ):
        raise HTTPException(
            status_code=403,
            detail="You can only book your assigned leads"
        )

    # Check unit
    unit = db.query(Unit).filter(
        Unit.id == data.unit_id
    ).first()

    if unit is None:
        raise HTTPException(
            status_code=404,
            detail="Unit not found"
        )

    # IMPORTANT: prevent duplicate booking
    if unit.status == UnitStatus.BOOKED:
        raise HTTPException(
            status_code=409,
            detail="Unit is already booked"
        )

    # Extra database check
    existing_booking = db.query(Booking).filter(
        Booking.unit_id == data.unit_id,
        Booking.status == BookingStatus.CONFIRMED
    ).first()

    if existing_booking:
        raise HTTPException(
            status_code=409,
            detail="Unit is already booked"
        )

    booking = Booking(
        lead_id=data.lead_id,
        unit_id=data.unit_id,
        booked_by=current_user.id,
        status=BookingStatus.CONFIRMED
    )

    # Change unit status
    unit.status = UnitStatus.BOOKED

    # Change lead stage
    lead.stage = LeadStage.BOOKED

    db.add(booking)

    try:
        db.commit()
        db.refresh(booking)

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=409,
            detail="Unit is already booked"
        )

    return booking


# -------------------------
# GET BOOKINGS
# -------------------------

@router.get(
    "",
    response_model=list[BookingResponse]
)
def get_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_sales_or_admin)
):
    query = db.query(Booking)

    # Sales employee sees their bookings
    if current_user.role == UserRole.SALES_EMPLOYEE:
        query = query.filter(
            Booking.booked_by == current_user.id
        )

    return query.order_by(
        Booking.booking_date.desc()
    ).all()


# -------------------------
# GET SINGLE BOOKING
# -------------------------

@router.get(
    "/{booking_id}",
    response_model=BookingResponse
)
def get_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_sales_or_admin)
):
    booking = db.query(Booking).filter(
        Booking.id == booking_id
    ).first()

    if booking is None:
        raise HTTPException(
            status_code=404,
            detail="Booking not found"
        )

    if (
        current_user.role == UserRole.SALES_EMPLOYEE
        and booking.booked_by != current_user.id
    ):
        raise HTTPException(
            status_code=403,
            detail="Access denied"
        )

    return booking


# -------------------------
# CANCEL BOOKING
# -------------------------

@router.put(
    "/{booking_id}/cancel",
    response_model=BookingResponse
)
def cancel_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_sales_or_admin)
):
    booking = db.query(Booking).filter(
        Booking.id == booking_id
    ).first()

    if booking is None:
        raise HTTPException(
            status_code=404,
            detail="Booking not found"
        )

    if (
        current_user.role == UserRole.SALES_EMPLOYEE
        and booking.booked_by != current_user.id
    ):
        raise HTTPException(
            status_code=403,
            detail="You can only cancel your own bookings"
        )

    if booking.status == BookingStatus.CANCELLED:
        raise HTTPException(
            status_code=400,
            detail="Booking is already cancelled"
        )

    booking.status = BookingStatus.CANCELLED

    unit = db.query(Unit).filter(
        Unit.id == booking.unit_id
    ).first()

    if unit:
        unit.status = UnitStatus.AVAILABLE

    db.commit()
    db.refresh(booking)

    return booking