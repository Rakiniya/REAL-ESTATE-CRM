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
    tags=["Bookings"],
)


# =========================================================
# CREATE BOOKING
# =========================================================

@router.post(
    "",
    response_model=BookingResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_booking(
    data: BookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_sales_or_admin),
):
    # -----------------------------------------------------
    # 1. Check lead
    # -----------------------------------------------------

    lead = (
        db.query(Lead)
        .filter(Lead.id == data.lead_id)
        .first()
    )

    if lead is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lead not found",
        )

    # -----------------------------------------------------
    # 2. Sales employee can only book assigned leads
    # -----------------------------------------------------

    if (
        current_user.role == UserRole.SALES_EMPLOYEE
        and lead.assigned_to != current_user.id
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only book your assigned leads",
        )

    # -----------------------------------------------------
    # 3. Check unit
    # -----------------------------------------------------

    unit = (
        db.query(Unit)
        .filter(Unit.id == data.unit_id)
        .first()
    )

    if unit is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Unit not found",
        )

    # -----------------------------------------------------
    # 4. Check current unit status
    # -----------------------------------------------------

    if unit.status == UnitStatus.BOOKED:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                f"Unit status is BOOKED. "
                f"Unit ID: {unit.id}"
            ),
        )

    # -----------------------------------------------------
    # 5. Check for an existing CONFIRMED booking
    #
    # Cancelled bookings are allowed.
    # Only CONFIRMED bookings block a new booking.
    # -----------------------------------------------------

    existing_booking = (
        db.query(Booking)
        .filter(
            Booking.unit_id == data.unit_id,
            Booking.status == BookingStatus.CONFIRMED,
        )
        .first()
    )

    if existing_booking is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                f"Confirmed booking already exists. "
                f"Booking ID: {existing_booking.id}, "
                f"Unit ID: {existing_booking.unit_id}"
            ),
        )

    # -----------------------------------------------------
    # 6. Create booking
    # -----------------------------------------------------

    booking = Booking(
        lead_id=data.lead_id,
        unit_id=data.unit_id,
        booked_by=current_user.id,
        status=BookingStatus.CONFIRMED,
    )

    # -----------------------------------------------------
    # 7. Update unit and lead
    # -----------------------------------------------------

    unit.status = UnitStatus.BOOKED
    lead.stage = LeadStage.BOOKED

    db.add(booking)

    # -----------------------------------------------------
    # 8. Commit transaction
    # -----------------------------------------------------

    try:
        db.commit()
        db.refresh(booking)

    except IntegrityError as error:
        db.rollback()

        print(
            "================================================="
        )
        print("BOOKING DATABASE ERROR")
        print(error)
        print(
            "================================================="
        )

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Database rejected the booking",
        )

    return booking


# =========================================================
# GET ALL BOOKINGS
# =========================================================

@router.get(
    "",
    response_model=list[BookingResponse],
)
def get_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_sales_or_admin),
):
    query = db.query(Booking)

    # Sales employees only see their own bookings
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
    response_model=BookingResponse,
)
def get_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_sales_or_admin),
):
    booking = (
        db.query(Booking)
        .filter(Booking.id == booking_id)
        .first()
    )

    if booking is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found",
        )

    # Sales employee can only see their own booking
    if (
        current_user.role == UserRole.SALES_EMPLOYEE
        and booking.booked_by != current_user.id
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )

    return booking


# =========================================================
# CANCEL BOOKING
# =========================================================

@router.put(
    "/{booking_id}/cancel",
    response_model=BookingResponse,
)
def cancel_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_sales_or_admin),
):
    # -----------------------------------------------------
    # 1. Find booking
    # -----------------------------------------------------

    booking = (
        db.query(Booking)
        .filter(Booking.id == booking_id)
        .first()
    )

    if booking is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found",
        )

    # -----------------------------------------------------
    # 2. Sales employee can only cancel own booking
    # -----------------------------------------------------

    if (
        current_user.role == UserRole.SALES_EMPLOYEE
        and booking.booked_by != current_user.id
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only cancel your own bookings",
        )

    # -----------------------------------------------------
    # 3. Prevent cancelling twice
    # -----------------------------------------------------

    if booking.status == BookingStatus.CANCELLED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Booking is already cancelled",
        )

    # -----------------------------------------------------
    # 4. Mark booking as CANCELLED
    # -----------------------------------------------------

    booking.status = BookingStatus.CANCELLED

    # -----------------------------------------------------
    # 5. Make unit AVAILABLE again
    # -----------------------------------------------------

    unit = (
        db.query(Unit)
        .filter(Unit.id == booking.unit_id)
        .first()
    )

    if unit is not None:
        unit.status = UnitStatus.AVAILABLE

    # -----------------------------------------------------
    # 6. Move lead back to NEGOTIATION
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
    # 7. Commit cancellation
    # -----------------------------------------------------

    try:
        db.commit()
        db.refresh(booking)

    except IntegrityError as error:
        db.rollback()

        print(
            "================================================="
        )
        print("BOOKING CANCELLATION ERROR")
        print(error)
        print(
            "================================================="
        )

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unable to cancel booking",
        )

    return booking