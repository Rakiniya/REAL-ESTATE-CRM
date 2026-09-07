from fastapi import FastAPI

app = FastAPI(
    title="Real Estate CRM API",
    description="API for managing real estate leads, properties and bookings",
    version="1.0.0"
)


@app.get("/")
def root():
    return {
        "message": "Real Estate CRM API is running"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }