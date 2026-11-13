import asyncio

import httpx

import app.database as database
from app.main import app
from app.optimizer import optimize_resources
from app.schemas import OptimizationInput


def test_higher_priority_request_receives_shared_capacity_first() -> None:
    payload = OptimizationInput.model_validate(
        {
            "resources": [
                {"name": "Lab A", "category": "Lab access", "available_units": 5}
            ],
            "requests": [
                {
                    "id": "low",
                    "title": "Routine lab",
                    "department": "Science",
                    "category": "Lab access",
                    "requested_units": 4,
                    "urgency": 1,
                    "students_affected": 10,
                },
                {
                    "id": "high",
                    "title": "Urgent lab",
                    "department": "Science",
                    "category": "Lab access",
                    "requested_units": 4,
                    "urgency": 5,
                    "students_affected": 20,
                },
            ],
        }
    )

    result = optimize_resources(payload)

    assert result.allocations[0].request_id == "high"
    assert result.allocations[0].allocated_units == 4
    assert result.allocations[1].allocated_units == 1
    assert result.unfilled_requests == ["low"]


def test_health_and_optimize_endpoints(monkeypatch, tmp_path) -> None:
    monkeypatch.delenv("DATABASE_URL", raising=False)
    monkeypatch.setenv("DB_ENGINE", "sqlite")
    monkeypatch.setenv("SQLITE_PATH", str(tmp_path / "campusflow.db"))

    async def exercise_api() -> None:
        async with app.router.lifespan_context(app):
            transport = httpx.ASGITransport(app=app)
            async with httpx.AsyncClient(
                transport=transport, base_url="http://testserver"
            ) as client:
                health = await client.get("/health")
                assert health.json()["status"] == "ok"
                db_status = await client.get("/api/db-status")
                assert db_status.json()["engine"] == "sqlite"

                response = await client.post(
                    "/api/optimize",
                    json={
                        "resources": [
                            {
                                "name": "Study rooms",
                                "category": "Study spaces",
                                "available_units": 3,
                            }
                        ],
                        "requests": [
                            {
                                "id": "REQ-1",
                                "title": "Exam study rooms",
                                "department": "Student services",
                                "category": "Study spaces",
                                "requested_units": 2,
                                "urgency": 4,
                                "students_affected": 16,
                            }
                        ],
                    },
                )

                assert response.status_code == 200
                assert response.json()["allocations"][0]["allocated_units"] == 2

    asyncio.run(exercise_api())


def test_database_can_save_student_record(monkeypatch, tmp_path) -> None:
    monkeypatch.delenv("DATABASE_URL", raising=False)
    monkeypatch.setenv("DB_ENGINE", "sqlite")
    monkeypatch.setenv("SQLITE_PATH", str(tmp_path / "campusflow.db"))

    from app.database import get_students, init_db, save_student

    init_db()
    save_student(
        {
            "full_name": "Aarav Nair",
            "register_number": "24CSE1042",
            "date_of_birth": "2006-04-12",
            "department": "Computer Science & Engineering",
            "program_type": "B.E.",
            "program": "Computer Engineering",
            "semester": "Semester 4",
            "email": "student@campusflow.edu",
            "phone": "+91 98765 43210",
            "advisor": "Dr. Meera Iyer",
            "status": "Active",
        }
    )

    students = get_students()
    assert students[0]["register_number"] == "24CSE1042"
    assert students[0]["advisor"] == "Dr. Meera Iyer"


def test_postgres_student_save_uses_upsert(monkeypatch) -> None:
    class FakeCursor:
        query = ""
        values = ()

        def execute(self, query, values):
            self.query = query
            self.values = values

    class FakeConnection:
        def __init__(self):
            self.test_cursor = FakeCursor()

        def cursor(self):
            return self.test_cursor

        def commit(self):
            pass

        def close(self):
            pass

    connection = FakeConnection()
    monkeypatch.setenv("DATABASE_URL", "postgresql://user:pass@host/campusflow")
    monkeypatch.setattr(database, "get_connection", lambda: connection)

    record = database.save_student({"register_number": "24CSE1042"})

    assert "ON CONFLICT (register_number)" in connection.test_cursor.query
    assert connection.test_cursor.values[2] is None
    assert record["register_number"] == "24CSE1042"


def test_postgres_initialization_creates_application_tables(monkeypatch) -> None:
    class FakeCursor:
        def __init__(self):
            self.statements = []

        def execute(self, statement):
            self.statements.append(statement)

        def close(self):
            pass

    class FakeConnection:
        def __init__(self):
            self.test_cursor = FakeCursor()
            self.committed = False

        def cursor(self):
            return self.test_cursor

        def commit(self):
            self.committed = True

        def close(self):
            pass

    connection = FakeConnection()
    monkeypatch.setenv("DATABASE_URL", "postgresql://user:pass@host/campusflow")
    monkeypatch.setattr(database, "_postgres_connection", lambda: connection)

    database.init_db()

    schema = "\n".join(connection.test_cursor.statements)
    assert "CREATE TABLE IF NOT EXISTS students" in schema
    assert "CREATE TABLE IF NOT EXISTS assignments" in schema
    assert "GENERATED BY DEFAULT AS IDENTITY" in schema
    assert connection.committed