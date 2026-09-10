from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base

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
from app.routers.leads import router as leads_router
from app.routers.properties import router as properties_router
from app.routers.bookings import router as bookings_router
from app.routers.dashboard import router as dashboard_router
from app.routers.users import router as users_router


# =========================================================
# FASTAPI APPLICATION
# =========================================================

app = FastAPI(
    title="Real Estate CRM API",
    description="API for managing real estate leads, properties and bookings",
    version="1.0.0",
)


# =========================================================
# DATABASE TABLES
# =========================================================

Base.metadata.create_all(bind=engine)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        # Local development
        "http://localhost:5173",
        "http://127.0.0.1:5173",

        # Previous Vercel production URL
        "https://real-estate-crm-omega-brown.vercel.app",

        # Current Vercel production URL
        "https://real-estate-n2bte5b14-rakiniya.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# API ROUTES
# =========================================================

app.include_router(auth_router)
app.include_router(leads_router)
app.include_router(properties_router)
app.include_router(bookings_router)
app.include_router(dashboard_router)
app.include_router(users_router)


# =========================================================
# ROOT
# =========================================================

@app.get("/")
def root():
    return {
        "message": "Real Estate CRM API is running"
    }


# =========================================================
# HEALTH CHECK
# =========================================================

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