import sys
from pathlib import Path

# Add project root to sys.path so backend can be run directly via `python backend/main.py`
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from backend.database.db import init_db
from backend.api.routes import router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite database schema
    init_db()
    print("Database initialized successfully.")
    yield

app = FastAPI(
    title="Resume-to-Job Matcher API",
    description="Explainable, Responsible-AI Recruitment Assistant. Match Skills. Explain Gaps. Reduce Identity Bias.",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS to allow frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(router)

@app.get("/")
def root():
    return {
        "message": "Resume-to-Job Matcher Backend is running.",
        "documentation": "/docs",
        "health": "/api/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
