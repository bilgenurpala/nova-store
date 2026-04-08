from fastapi import FastAPI
from app.core.config import settings
from app.api.v1 import health, auth

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
)

app.include_router(health.router, prefix="/api/v1")
app.include_router(auth.router, prefix="/api/v1")


@app.get("/", tags=["Root"])
def root():
    return {"message": f"Welcome to {settings.APP_NAME}"}
