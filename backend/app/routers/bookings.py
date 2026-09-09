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


# =========================================================
# CREATE BOOKING
# =========================================================

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
    # -----------------------------------------------------
    # Check lead
    # -----------------------------------------------------

    lead = (
        db.query(Lead)
        .filter(Lead.id == data.lead_id)
        .first()
    )

    if lead is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lead not found"
        )

    # Sales employee can only book their assigned leads
    if (
        current_user.role == UserRole.SALES_EMPLOYEE
        and lead.assigned_to != current_user.id
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only book your assigned leads"
        )

    # -----------------------------------------------------
    # Check unit
    # -----------------------------------------------------

    unit = (
        db.query(Unit)
        .filter(Unit.id == data.unit_id)
        .first()
    )

    if unit is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Unit not found"
        )

    # -----------------------------------------------------
    # Prevent booking an unavailable unit
    # -----------------------------------------------------

    if unit.status == UnitStatus.BOOKED:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Unit is already booked"
        )

    # -----------------------------------------------------
    # Extra database check
    # Only a CONFIRMED booking blocks the unit.
    # CANCELLED bookings do not block re-booking.
    # -----------------------------------------------------

    existing_booking = (
        db.query(Booking)
        .filter(
            Booking.unit_id == data.unit_id,
            Booking.status == BookingStatus.CONFIRMED
        )
        .first()
    )

    if existing_booking:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Unit is already booked"
        )

    # -----------------------------------------------------
    # Create booking
    # -----------------------------------------------------

    booking = Booking(
        lead_id=data.lead_id,
        unit_id=data.unit_id,
        booked_by=current_user.id,
        status=BookingStatus.CONFIRMED
    )

    # Unit becomes booked
    unit.status = UnitStatus.BOOKED

    # Lead becomes booked
    lead.stage = LeadStage.BOOKED

    db.add(booking)

    try:
        db.commit()
        db.refresh(booking)

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Unit is already booked"
        )

    return booking


# =========================================================
# GET ALL BOOKINGS
# =========================================================

@router.get(
    "",
    response_model=list[BookingResponse]
)
def get_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_sales_or_admin)
):
    query = db.query(Booking)

    # Sales employee sees only their bookings
    if current_user.role == UserRole.SALES_EMPLOYEE:
        query = query.filter(
            Booking.booked_by == current_user.id
        )

    return (
        query
        .order_by(Booking.booking_date.desc())
        .all()
    )


# =========================================================
# GET SINGLE BOOKING
# =========================================================

@router.get(
    "/{booking_id}",
    response_model=BookingResponse
)
def get_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_sales_or_admin)
):
    booking = (
        db.query(Booking)
        .filter(Booking.id == booking_id)
        .first()
    )

    if booking is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )

    # Sales employee can only view their own bookings
    if (
        current_user.role == UserRole.SALES_EMPLOYEE
        and booking.booked_by != current_user.id
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )

    return booking


# =========================================================
# CANCEL BOOKING
# =========================================================

@router.put(
    "/{booking_id}/cancel",
    response_model=BookingResponse
)
def cancel_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_sales_or_admin),
):
    # -----------------------------------------------------
    # Find booking
    # -----------------------------------------------------

    booking = (
        db.query(Booking)
        .filter(Booking.id == booking_id)
        .first()
    )

    if booking is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )

    # -----------------------------------------------------
    # Sales employee can only cancel their own booking
    # -----------------------------------------------------

    if (
        current_user.role == UserRole.SALES_EMPLOYEE
        and booking.booked_by != current_user.id
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only cancel your own bookings"
        )

    # -----------------------------------------------------
    # Prevent cancelling twice
    # -----------------------------------------------------

    if booking.status == BookingStatus.CANCELLED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Booking is already cancelled"
        )

    # -----------------------------------------------------
    # Cancel booking
    # -----------------------------------------------------

    booking.status = BookingStatus.CANCELLED

    # -----------------------------------------------------
    # Release unit
    # -----------------------------------------------------

    unit = (
        db.query(Unit)
        .filter(Unit.id == booking.unit_id)
        .first()
    )

    if unit is not None:
        unit.status = UnitStatus.AVAILABLE

    # -----------------------------------------------------
    # Move lead back from BOOKED to NEGOTIATION
    # -----------------------------------------------------

    lead = (
        db.query(Lead)
        .filter(Lead.id == booking.lead_id)
        .first()
    )

    if (
        lead is not None
        and lead.stage == LeadStage.BOOKED
    ):
        lead.stage = LeadStage.NEGOTIATION

    # -----------------------------------------------------
    # Save changes
    # -----------------------------------------------------

    try:
        db.commit()
        db.refresh(booking)

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unable to cancel booking"
        )

    return booking