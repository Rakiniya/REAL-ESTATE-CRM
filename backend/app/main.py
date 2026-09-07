from fastapi import FastAPI

from app.database import engine, Base
from app.routers.leads import router as leads_router
from app.routers.properties import router as properties_router
from app.models.models import (
    User,
    Lead,
    LeadNote,
    Project,
    Building,
    Unit,
    Booking,
    UserRole,
    LeadStage,
    UnitStatus,
    BookingStatus,
)

from app.routers.auth import router as auth_router


app = FastAPI(
    title="Real Estate CRM API",
    description="API for managing real estate leads, properties and bookings",
    version="1.0.0",
)


# Create database tables
Base.metadata.create_all(bind=engine)


# Authentication routes
app.include_router(auth_router)
app.include_router(leads_router)
app.include_router(properties_router)


@app.get("/")
def root():
    return {
        "message": "Real Estate CRM API is running"
    }


@app.get("/health")
def health_check():
    try:
        with engine.connect():
            return {
                "status": "healthy",
                "database": "connected"
            }

    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e)
        }