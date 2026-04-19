from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1 import health, auth, categories, products, cart, orders, ai, admin

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api/v1")
app.include_router(auth.router, prefix="/api/v1")
app.include_router(categories.router, prefix="/api/v1")
app.include_router(products.router, prefix="/api/v1")
app.include_router(cart.router, prefix="/api/v1")
app.include_router(orders.router, prefix="/api/v1")
app.include_router(ai.router, prefix="/api/v1")
app.include_router(admin.router, prefix="/api/v1")


@app.get("/", tags=["Root"])
def root():
    return {"message": f"Welcome to {settings.APP_NAME}"}
