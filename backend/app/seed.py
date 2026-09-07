from app.database import SessionLocal
from app.models.models import User, UserRole
from app.security import hash_password


def seed_users():

    db = SessionLocal()

    try:

        admin = db.query(User).filter(
            User.email == "admin@realestate.com"
        ).first()

        if admin is None:

            admin = User(
                name="Admin User",
                email="admin@realestate.com",
                password_hash=hash_password("Admin@123"),
                role=UserRole.ADMIN
            )

            db.add(admin)

        sales = db.query(User).filter(
            User.email == "sales@realestate.com"
        ).first()

        if sales is None:

            sales = User(
                name="Sales Employee",
                email="sales@realestate.com",
                password_hash=hash_password("Sales@123"),
                role=UserRole.SALES_EMPLOYEE
            )

            db.add(sales)

        db.commit()

        print("Users seeded successfully.")

    finally:
        db.close()


if __name__ == "__main__":
    seed_users()