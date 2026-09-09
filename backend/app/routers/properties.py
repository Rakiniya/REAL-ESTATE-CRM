from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_admin, require_sales_or_admin
from app.models.models import (
    Booking,
    BookingStatus,
    Building,
    Project,
    Unit,
    UnitStatus,
    User,
)
from app.schemas.property import (
    BuildingCreate,
    BuildingResponse,
    BuildingUpdate,
    ProjectCreate,
    ProjectResponse,
    ProjectUpdate,
    UnitCreate,
    UnitResponse,
    UnitUpdate,
)


router = APIRouter(
    prefix="/properties",
    tags=["Properties"]
)


# -------------------------
# PROJECTS
# -------------------------

@router.post(
    "/projects",
    response_model=ProjectResponse,
    status_code=status.HTTP_201_CREATED
)
def create_project(
    data: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    project = Project(
        name=data.name,
        location=data.location,
        description=data.description
    )

    db.add(project)
    db.commit()
    db.refresh(project)

    return project


@router.get(
    "/projects",
    response_model=list[ProjectResponse]
)
def get_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_sales_or_admin)
):
    return db.query(Project).order_by(
        Project.created_at.desc()
    ).all()


# -------------------------
# BUILDINGS
# -------------------------

@router.post(
    "/projects/{project_id}/buildings",
    response_model=BuildingResponse,
    status_code=status.HTTP_201_CREATED
)
def create_building(
    project_id: int,
    data: BuildingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    project = db.query(Project).filter(
        Project.id == project_id
    ).first()

    if project is None:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    building = Building(
        project_id=project_id,
        name=data.name
    )

    db.add(building)
    db.commit()
    db.refresh(building)

    return building


@router.get(
    "/projects/{project_id}/buildings",
    response_model=list[BuildingResponse]
)
def get_buildings(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_sales_or_admin)
):
    project = db.query(Project).filter(
        Project.id == project_id
    ).first()

    if project is None:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    return db.query(Building).filter(
        Building.project_id == project_id
    ).all()


@router.put(
    "/buildings/{building_id}",
    response_model=BuildingResponse
)
def update_building(
    building_id: int,
    data: BuildingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    building = (
        db.query(Building)
        .filter(Building.id == building_id)
        .first()
    )

    if building is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Building not found"
        )

    if data.name is not None:
        building.name = data.name

    try:
        db.commit()
        db.refresh(building)

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Unable to update building"
        )

    return building


# -------------------------
# UNITS
# -------------------------

@router.post(
    "/buildings/{building_id}/units",
    response_model=UnitResponse,
    status_code=status.HTTP_201_CREATED
)
def create_unit(
    building_id: int,
    data: UnitCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    building = db.query(Building).filter(
        Building.id == building_id
    ).first()

    if building is None:
        raise HTTPException(
            status_code=404,
            detail="Building not found"
        )

    existing = db.query(Unit).filter(
        Unit.building_id == building_id,
        Unit.unit_number == data.unit_number
    ).first()

    if existing:
        raise HTTPException(
            status_code=409,
            detail="Unit number already exists in this building"
        )

    unit = Unit(
        building_id=building_id,
        unit_number=data.unit_number,
        type=data.type,
        price=data.price,
        status=data.status
    )

    db.add(unit)
    db.commit()
    db.refresh(unit)

    return unit


@router.get(
    "/buildings/{building_id}/units",
    response_model=list[UnitResponse]
)
def get_building_units(
    building_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_sales_or_admin)
):
    building = db.query(Building).filter(
        Building.id == building_id
    ).first()

    if building is None:
        raise HTTPException(
            status_code=404,
            detail="Building not found"
        )

    return db.query(Unit).filter(
        Unit.building_id == building_id
    ).all()


@router.get(
    "/units",
    response_model=list[UnitResponse]
)
def get_units(
    status_filter: UnitStatus | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_sales_or_admin)
):
    query = db.query(Unit)

    if status_filter:
        query = query.filter(
            Unit.status == status_filter
        )

    return query.all()


@router.get(
    "/units/{unit_id}",
    response_model=UnitResponse
)
def get_unit(
    unit_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_sales_or_admin)
):
    unit = db.query(Unit).filter(
        Unit.id == unit_id
    ).first()

    if unit is None:
        raise HTTPException(
            status_code=404,
            detail="Unit not found"
        )

    return unit


@router.put("/units/{unit_id}", response_model=UnitResponse)
def update_unit(
    unit_id: int,
    data: UnitUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    unit = db.query(Unit).filter(Unit.id == unit_id).first()

    if unit is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Unit not found",
        )

    # A unit with a confirmed booking cannot be manually made AVAILABLE.
    confirmed_booking = (
        db.query(Booking)
        .filter(
            Booking.unit_id == unit_id,
            Booking.status == BookingStatus.CONFIRMED,
        )
        .first()
    )

    if (
        confirmed_booking
        and data.status is not None
        and data.status != UnitStatus.BOOKED
    ):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A unit with a confirmed booking must remain BOOKED",
        )

    if data.unit_number is not None:
        duplicate = (
            db.query(Unit)
            .filter(
                Unit.building_id == unit.building_id,
                Unit.unit_number == data.unit_number,
                Unit.id != unit_id,
            )
            .first()
        )

        if duplicate:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A unit with this number already exists in the building",
            )

        unit.unit_number = data.unit_number

    if data.type is not None:
        unit.type = data.type

    if data.price is not None:
        if data.price <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unit price must be greater than zero",
            )

        unit.price = data.price

    if data.status is not None:
        unit.status = data.status

    try:
        db.commit()
        db.refresh(unit)

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Unable to update unit",
        )

    return unit


@router.put(
    "/projects/{project_id}",
    response_model=ProjectResponse
)
def update_project(
    project_id: int,
    data: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    project = (
        db.query(Project)
        .filter(Project.id == project_id)
        .first()
    )

    if project is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    if data.name is not None:
        project.name = data.name

    if data.location is not None:
        project.location = data.location

    if data.description is not None:
        project.description = data.description

    try:
        db.commit()
        db.refresh(project)

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Unable to update project"
        )

    return project