from datetime import datetime, date
from decimal import Decimal
from enum import Enum

from sqlalchemy import (
    String,
    Text,
    Date,
    DateTime,
    ForeignKey,
    Numeric,
    Enum as SQLEnum,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


# -------------------------
# ENUMS
# -------------------------

class UserRole(str, Enum):
    ADMIN = "ADMIN"
    SALES_EMPLOYEE = "SALES_EMPLOYEE"


class LeadStage(str, Enum):
    NEW = "NEW"
    CONTACTED = "CONTACTED"
    SITE_VISIT = "SITE_VISIT"
    INTERESTED = "INTERESTED"
    NEGOTIATION = "NEGOTIATION"
    BOOKED = "BOOKED"
    LOST = "LOST"


class UnitStatus(str, Enum):
    AVAILABLE = "AVAILABLE"
    BOOKED = "BOOKED"


class BookingStatus(str, Enum):
    CONFIRMED = "CONFIRMED"
    CANCELLED = "CANCELLED"


# -------------------------
# USER
# -------------------------

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    email: Mapped[str] = mapped_column(
        String(150),
        unique=True,
        nullable=False,
        index=True
    )

    password_hash: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    role: Mapped[UserRole] = mapped_column(
        SQLEnum(UserRole),
        nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow
    )

    # One employee can have many assigned leads
    leads: Mapped[list["Lead"]] = relationship(
        "Lead",
        back_populates="assigned_employee"
    )

    # One employee can create many notes
    notes: Mapped[list["LeadNote"]] = relationship(
        "LeadNote",
        back_populates="created_by_user"
    )

    # One employee can make many bookings
    bookings: Mapped[list["Booking"]] = relationship(
        "Booking",
        back_populates="booked_by_user"
    )


# -------------------------
# LEAD
# -------------------------

class Lead(Base):
    __tablename__ = "leads"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    email: Mapped[str | None] = mapped_column(
        String(150),
        nullable=True
    )

    phone: Mapped[str] = mapped_column(
        String(20),
        nullable=False
    )

    stage: Mapped[LeadStage] = mapped_column(
        SQLEnum(LeadStage),
        default=LeadStage.NEW,
        nullable=False
    )

    assigned_to: Mapped[int | None] = mapped_column(
        ForeignKey("users.id"),
        nullable=True
    )

    follow_up_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    # Relationship with assigned employee
    assigned_employee: Mapped["User | None"] = relationship(
        "User",
        back_populates="leads"
    )

    # One lead can have many notes
    notes: Mapped[list["LeadNote"]] = relationship(
        "LeadNote",
        back_populates="lead",
        cascade="all, delete-orphan"
    )

    # One lead can have bookings
    bookings: Mapped[list["Booking"]] = relationship(
        "Booking",
        back_populates="lead"
    )


# -------------------------
# LEAD NOTE
# -------------------------

class LeadNote(Base):
    __tablename__ = "lead_notes"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    lead_id: Mapped[int] = mapped_column(
        ForeignKey("leads.id"),
        nullable=False
    )

    note: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    created_by: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow
    )

    lead: Mapped["Lead"] = relationship(
        "Lead",
        back_populates="notes"
    )

    created_by_user: Mapped["User"] = relationship(
        "User",
        back_populates="notes"
    )


# -------------------------
# PROJECT
# -------------------------

class Project(Base):
    __tablename__ = "projects"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    name: Mapped[str] = mapped_column(
        String(150),
        nullable=False
    )

    location: Mapped[str] = mapped_column(
        String(200),
        nullable=False
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow
    )

    # One project can have many buildings
    buildings: Mapped[list["Building"]] = relationship(
        "Building",
        back_populates="project",
        cascade="all, delete-orphan"
    )


# -------------------------
# BUILDING
# -------------------------

class Building(Base):
    __tablename__ = "buildings"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    project_id: Mapped[int] = mapped_column(
        ForeignKey("projects.id"),
        nullable=False
    )

    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    project: Mapped["Project"] = relationship(
        "Project",
        back_populates="buildings"
    )

    # One building can have many units
    units: Mapped[list["Unit"]] = relationship(
        "Unit",
        back_populates="building",
        cascade="all, delete-orphan"
    )


# -------------------------
# UNIT
# -------------------------

class Unit(Base):
    __tablename__ = "units"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    building_id: Mapped[int] = mapped_column(
        ForeignKey("buildings.id"),
        nullable=False
    )

    unit_number: Mapped[str] = mapped_column(
        String(50),
        nullable=False
    )

    type: Mapped[str] = mapped_column(
        String(50),
        nullable=False
    )

    price: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False
    )

    status: Mapped[UnitStatus] = mapped_column(
        SQLEnum(UnitStatus),
        default=UnitStatus.AVAILABLE,
        nullable=False
    )

    building: Mapped["Building"] = relationship(
        "Building",
        back_populates="units"
    )

    # A unit can have one booking in this MVP
    booking: Mapped["Booking | None"] = relationship(
        "Booking",
        back_populates="unit",
        uselist=False
    )

    __table_args__ = (
        UniqueConstraint(
            "building_id",
            "unit_number",
            name="unique_unit_per_building"
        ),
    )


# -------------------------
# BOOKING
# -------------------------

class Booking(Base):
    __tablename__ = "bookings"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    lead_id: Mapped[int] = mapped_column(
        ForeignKey("leads.id"),
        nullable=False
    )

    unit_id: Mapped[int] = mapped_column(
        ForeignKey("units.id"),
        nullable=False,
        unique=True
    )

    booked_by: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False
    )

    booking_date: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow
    )

    status: Mapped[BookingStatus] = mapped_column(
        SQLEnum(BookingStatus),
        default=BookingStatus.CONFIRMED,
        nullable=False
    )

    lead: Mapped["Lead"] = relationship(
        "Lead",
        back_populates="bookings"
    )

    unit: Mapped["Unit"] = relationship(
        "Unit",
        back_populates="booking"
    )

    booked_by_user: Mapped["User"] = relationship(
        "User",
        back_populates="bookings"
    )