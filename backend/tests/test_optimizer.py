from fastapi.testclient import TestClient

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


def test_health_and_optimize_endpoints() -> None:
    client = TestClient(app)
    assert client.get("/health").json()["status"] == "ok"

    response = client.post(
        "/api/optimize",
        json={
            "resources": [
                {"name": "Study rooms", "category": "Study spaces", "available_units": 3}
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


def test_database_can_save_student_record(monkeypatch, tmp_path) -> None:
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