from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import (
    get_current_user,
    require_admin,
    require_sales_or_admin,
)
from app.models.models import (
    Lead,
    LeadNote,
    User,
    UserRole,
)
from app.schemas.lead import (
    LeadCreate,
    LeadUpdate,
    LeadResponse,
    LeadNoteCreate,
    LeadNoteResponse,
)


router = APIRouter(
    prefix="/leads",
    tags=["Leads"]
)


# CREATE LEAD
@router.post(
    "",
    response_model=LeadResponse,
    status_code=status.HTTP_201_CREATED
)
def create_lead(
    lead_data: LeadCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_sales_or_admin)
):
    if lead_data.assigned_to is not None:
        employee = db.query(User).filter(
            User.id == lead_data.assigned_to
        ).first()

        if employee is None:
            raise HTTPException(
                status_code=404,
                detail="Assigned user not found"
            )

        if employee.role != UserRole.SALES_EMPLOYEE:
            raise HTTPException(
                status_code=400,
                detail="Lead can only be assigned to a Sales Employee"
            )

    lead = Lead(
        name=lead_data.name,
        email=lead_data.email,
        phone=lead_data.phone,
        stage=lead_data.stage,
        assigned_to=lead_data.assigned_to,
        follow_up_date=lead_data.follow_up_date,
    )

    db.add(lead)
    db.commit()
    db.refresh(lead)

    return lead


# GET ALL / SEARCH LEADS
@router.get(
    "",
    response_model=list[LeadResponse]
)
def get_leads(
    search: str | None = None,
    stage: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_sales_or_admin)
):
    query = db.query(Lead)

    # Sales employee sees only assigned leads
    if current_user.role == UserRole.SALES_EMPLOYEE:
        query = query.filter(
            Lead.assigned_to == current_user.id
        )

    if search:
        query = query.filter(
            (Lead.name.ilike(f"%{search}%")) |
            (Lead.email.ilike(f"%{search}%")) |
            (Lead.phone.ilike(f"%{search}%"))
        )

    if stage:
        query = query.filter(
            Lead.stage == stage
        )

    return query.order_by(
        Lead.created_at.desc()
    ).all()


# GET SINGLE LEAD
@router.get(
    "/{lead_id}",
    response_model=LeadResponse
)
def get_lead(
    lead_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_sales_or_admin)
):
    lead = db.query(Lead).filter(
        Lead.id == lead_id
    ).first()

    if lead is None:
        raise HTTPException(
            status_code=404,
            detail="Lead not found"
        )

    if (
        current_user.role == UserRole.SALES_EMPLOYEE
        and lead.assigned_to != current_user.id
    ):
        raise HTTPException(
            status_code=403,
            detail="You can only access your assigned leads"
        )

    return lead


# UPDATE LEAD
@router.put(
    "/{lead_id}",
    response_model=LeadResponse
)
def update_lead(
    lead_id: int,
    lead_data: LeadUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_sales_or_admin)
):
    lead = db.query(Lead).filter(
        Lead.id == lead_id
    ).first()

    if lead is None:
        raise HTTPException(
            status_code=404,
            detail="Lead not found"
        )

    if (
        current_user.role == UserRole.SALES_EMPLOYEE
        and lead.assigned_to != current_user.id
    ):
        raise HTTPException(
            status_code=403,
            detail="You can only update your assigned leads"
        )

    if lead_data.assigned_to is not None:
        employee = db.query(User).filter(
            User.id == lead_data.assigned_to
        ).first()

        if employee is None:
            raise HTTPException(
                status_code=404,
                detail="Assigned user not found"
            )

        if employee.role != UserRole.SALES_EMPLOYEE:
            raise HTTPException(
                status_code=400,
                detail="Lead can only be assigned to a Sales Employee"
            )

        # Only admin can reassign
        if current_user.role != UserRole.ADMIN:
            raise HTTPException(
                status_code=403,
                detail="Only Admin can assign leads"
            )

    update_data = lead_data.model_dump(
        exclude_unset=True
    )

    for key, value in update_data.items():
        setattr(lead, key, value)

    db.commit()
    db.refresh(lead)

    return lead


# DELETE LEAD - ADMIN ONLY
@router.delete(
    "/{lead_id}"
)
def delete_lead(
    lead_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    lead = db.query(Lead).filter(
        Lead.id == lead_id
    ).first()

    if lead is None:
        raise HTTPException(
            status_code=404,
            detail="Lead not found"
        )

    db.delete(lead)
    db.commit()

    return {
        "message": "Lead deleted successfully"
    }


# ADD NOTE
@router.post(
    "/{lead_id}/notes",
    response_model=LeadNoteResponse,
    status_code=status.HTTP_201_CREATED
)
def add_note(
    lead_id: int,
    note_data: LeadNoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_sales_or_admin)
):
    lead = db.query(Lead).filter(
        Lead.id == lead_id
    ).first()

    if lead is None:
        raise HTTPException(
            status_code=404,
            detail="Lead not found"
        )

    if (
        current_user.role == UserRole.SALES_EMPLOYEE
        and lead.assigned_to != current_user.id
    ):
        raise HTTPException(
            status_code=403,
            detail="You can only add notes to your assigned leads"
        )

    note = LeadNote(
        lead_id=lead_id,
        note=note_data.note,
        created_by=current_user.id
    )

    db.add(note)
    db.commit()
    db.refresh(note)

    return note


# GET NOTES
@router.get(
    "/{lead_id}/notes",
    response_model=list[LeadNoteResponse]
)
def get_notes(
    lead_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_sales_or_admin)
):
    lead = db.query(Lead).filter(
        Lead.id == lead_id
    ).first()

    if lead is None:
        raise HTTPException(
            status_code=404,
            detail="Lead not found"
        )

    if (
        current_user.role == UserRole.SALES_EMPLOYEE
        and lead.assigned_to != current_user.id
    ):
        raise HTTPException(
            status_code=403,
            detail="Access denied"
        )

    return db.query(LeadNote).filter(
        LeadNote.lead_id == lead_id
    ).order_by(
        LeadNote.created_at.desc()
    ).all()