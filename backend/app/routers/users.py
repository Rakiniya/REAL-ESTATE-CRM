from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_admin
from app.models.models import Lead, User, UserRole
from app.schemas.user import UserCreate, UserResponse, UserUpdate
from app.security import hash_password


router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/sales-employees", response_model=list[UserResponse])
def get_sales_employees(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return (
        db.query(User)
        .filter(User.role == UserRole.SALES_EMPLOYEE)
        .order_by(User.name.asc())
        .all()
    )


@router.get("", response_model=list[UserResponse])
def get_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return db.query(User).order_by(User.created_at.desc()).all()


@router.post(
    "",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_user(
    data: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    existing_user = db.query(User).filter(User.email == data.email).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email already exists",
        )

    user = User(
        name=data.name,
        email=data.email,
        password_hash=hash_password(data.password),
        role=data.role,
    )

    db.add(user)

    try:
        db.commit()
        db.refresh(user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email already exists",
        )

    return user


@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    user = db.query(User).filter(User.id == user_id).first()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    if data.email is not None:
        existing_user = (
            db.query(User)
            .filter(User.email == data.email, User.id != user_id)
            .first()
        )

        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A user with this email already exists",
            )

        user.email = data.email

    if data.name is not None:
        user.name = data.name

    if data.role is not None:
        # Don't allow the last admin to be removed.
        if user.role == UserRole.ADMIN and data.role != UserRole.ADMIN:
            admin_count = (
                db.query(User)
                .filter(User.role == UserRole.ADMIN)
                .count()
            )

            if admin_count <= 1:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="At least one admin user must remain",
                )

        user.role = data.role

    try:
        db.commit()
        db.refresh(user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Unable to update user",
        )

    return user


@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    user = db.query(User).filter(User.id == user_id).first()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot delete your own account",
        )

    if user.role == UserRole.ADMIN:
        admin_count = (
            db.query(User)
            .filter(User.role == UserRole.ADMIN)
            .count()
        )

        if admin_count <= 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="At least one admin user must remain",
            )

    has_leads = db.query(user.leads.property.mapper.class_).filter

    if has_leads:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot delete user because leads are assigned to this employee",
        )

    try:
        db.delete(user)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot delete this user because they have related records",
        )

    return {"message": "User deleted successfully"}