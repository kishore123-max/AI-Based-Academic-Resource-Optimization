from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
import os
from typing import Any
from urllib.parse import urlsplit

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import (
    get_db_engine,
    get_assignments,
    get_departments,
    get_faculty,
    get_learning_materials,
    get_students,
    init_db,
    save_assignment,
    save_department,
    save_faculty,
    save_learning_material,
    save_student,
)
from app.optimizer import optimize_resources
from app.schemas import OptimizationInput, OptimizationResponse


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncGenerator[None, None]:
    init_db()
    yield


app = FastAPI(
    title="CampusFlow API",
    description="Academic resource planning and allocation recommendations.",
    version="0.1.0",
    lifespan=lifespan,
)

origins = os.getenv(
    "CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173"
).split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in origins if origin.strip()],
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "campusflow-api"}


@app.get("/api/db-status")
def db_status() -> dict[str, Any]:
    engine = get_db_engine()
    database_url = os.getenv("DATABASE_URL")
    if engine == "postgresql" and database_url:
        parsed_url = urlsplit(database_url)
        host = parsed_url.hostname or "configured"
        database = parsed_url.path.lstrip("/") or "configured"
    elif engine == "mysql":
        host = os.getenv("DB_HOST", "localhost")
        database = os.getenv("DB_NAME", "campusflow")
    else:
        host = "local"
        database = "sqlite"
    return {
        "engine": engine,
        "host": host,
        "database": database,
        "mode": engine,
    }


@app.post("/api/students")
def create_student(payload: dict[str, Any]) -> dict[str, Any]:
    return {"status": "ok", "record": save_student(payload)}


@app.get("/api/students")
def read_students() -> dict[str, Any]:
    return {"status": "ok", "records": get_students()}


@app.post("/api/faculty")
def create_faculty(payload: dict[str, Any]) -> dict[str, Any]:
    return {"status": "ok", "record": save_faculty(payload)}


@app.get("/api/faculty")
def read_faculty() -> dict[str, Any]:
    return {"status": "ok", "records": get_faculty()}


@app.post("/api/departments")
def create_department(payload: dict[str, Any]) -> dict[str, Any]:
    return {"status": "ok", "record": save_department(payload)}


@app.get("/api/departments")
def read_departments() -> dict[str, Any]:
    return {"status": "ok", "records": get_departments()}


@app.post("/api/materials")
def create_material(payload: dict[str, Any]) -> dict[str, Any]:
    return {"status": "ok", "record": save_learning_material(payload)}


@app.get("/api/materials")
def read_materials() -> dict[str, Any]:
    return {"status": "ok", "records": get_learning_materials()}


@app.post("/api/assignments")
def create_assignment(payload: dict[str, Any]) -> dict[str, Any]:
    return {"status": "ok", "record": save_assignment(payload)}


@app.get("/api/assignments")
def read_assignments() -> dict[str, Any]:
    return {"status": "ok", "records": get_assignments()}


@app.post("/api/optimize", response_model=OptimizationResponse)
def optimize(payload: OptimizationInput) -> OptimizationResponse:
    return optimize_resources(payload)