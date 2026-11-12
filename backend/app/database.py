from __future__ import annotations

import os
import sqlite3
from pathlib import Path
from typing import Any


BASE_DIR = Path(__file__).resolve().parents[2]
DEFAULT_SQLITE_PATH = BASE_DIR / "campusflow.db"


def _sqlite_path() -> str:
    return os.getenv("SQLITE_PATH", str(DEFAULT_SQLITE_PATH))


def _mysql_config() -> dict[str, Any]:
    return {
        "host": os.getenv("DB_HOST", "localhost"),
        "port": int(os.getenv("DB_PORT", "3306")),
        "user": os.getenv("DB_USER", "root"),
        "password": os.getenv("DB_PASSWORD", "kishore@123"),
        "database": os.getenv("DB_NAME", "campusflow"),
        "autocommit": True,
    }


def _mysql_connection():
    import mysql.connector

    return mysql.connector.connect(**_mysql_config())


def get_connection():
    engine = os.getenv("DB_ENGINE", "mysql").lower()
    if engine == "sqlite":
        connection = sqlite3.connect(_sqlite_path())
        connection.row_factory = sqlite3.Row
        return connection

    try:
        connection = _mysql_connection()
        return connection
    except Exception:
        connection = sqlite3.connect(_sqlite_path())
        connection.row_factory = sqlite3.Row
        return connection


def _execute_schema(connection: Any, statements: list[str]) -> None:
    cursor = connection.cursor()
    try:
        for statement in statements:
            if statement.strip():
                cursor.execute(statement)
    finally:
        cursor.close()


def init_db() -> None:
    engine = os.getenv("DB_ENGINE", "mysql").lower()

    if engine == "sqlite":
        connection = sqlite3.connect(_sqlite_path())
        try:
            _execute_schema(
                connection,
                [
                    """
                    CREATE TABLE IF NOT EXISTS students (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        full_name TEXT NOT NULL,
                        register_number TEXT NOT NULL UNIQUE,
                        date_of_birth TEXT,
                        department TEXT,
                        program_type TEXT,
                        program TEXT,
                        semester TEXT,
                        email TEXT,
                        phone TEXT,
                        advisor TEXT,
                        status TEXT DEFAULT 'Active'
                    )
                    """,
                    """
                    CREATE TABLE IF NOT EXISTS faculty (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        full_name TEXT NOT NULL,
                        department TEXT,
                        designation TEXT,
                        email TEXT,
                        phone TEXT,
                        status TEXT DEFAULT 'Active'
                    )
                    """,
                    """
                    CREATE TABLE IF NOT EXISTS departments (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        name TEXT NOT NULL UNIQUE,
                        head TEXT,
                        code TEXT
                    )
                    """,
                    """
                    CREATE TABLE IF NOT EXISTS learning_materials (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        title TEXT NOT NULL,
                        category TEXT NOT NULL,
                        course TEXT,
                        format_label TEXT,
                        description TEXT,
                        author_name TEXT,
                        resource_url TEXT,
                        created_at TEXT DEFAULT CURRENT_TIMESTAMP
                    )
                    """,
                    """
                    CREATE TABLE IF NOT EXISTS assignments (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        student_name TEXT NOT NULL,
                        registration_number TEXT,
                        course TEXT,
                        assignment_title TEXT NOT NULL,
                        notes TEXT,
                        file_name TEXT,
                        submitted_at TEXT DEFAULT CURRENT_TIMESTAMP
                    )
                    """,
                ],
            )
        finally:
            connection.commit()
            connection.close()
        return

    try:
        connection = _mysql_connection()
        cursor = connection.cursor()
        try:
            cursor.execute("CREATE DATABASE IF NOT EXISTS campusflow")
            cursor.execute("USE campusflow")
            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS students (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    full_name VARCHAR(150) NOT NULL,
                    register_number VARCHAR(80) NOT NULL UNIQUE,
                    date_of_birth DATE,
                    department VARCHAR(150),
                    program_type VARCHAR(20),
                    program VARCHAR(150),
                    semester VARCHAR(60),
                    email VARCHAR(150),
                    phone VARCHAR(40),
                    advisor VARCHAR(150),
                    status VARCHAR(40) DEFAULT 'Active',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
                """
            )
            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS faculty (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    full_name VARCHAR(150) NOT NULL,
                    department VARCHAR(150),
                    designation VARCHAR(150),
                    email VARCHAR(150),
                    phone VARCHAR(40),
                    status VARCHAR(40) DEFAULT 'Active',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
                """
            )
            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS departments (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(150) NOT NULL UNIQUE,
                    head VARCHAR(150),
                    code VARCHAR(50),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
                """
            )
            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS learning_materials (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    title VARCHAR(200) NOT NULL,
                    category VARCHAR(80) NOT NULL,
                    course VARCHAR(200),
                    format_label VARCHAR(120),
                    description TEXT,
                    author_name VARCHAR(150),
                    resource_url TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
                """
            )
            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS assignments (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    student_name VARCHAR(150) NOT NULL,
                    registration_number VARCHAR(80),
                    course VARCHAR(200),
                    assignment_title VARCHAR(200) NOT NULL,
                    notes TEXT,
                    file_name VARCHAR(200),
                    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
                """
            )
        finally:
            cursor.close()
            connection.close()
    except Exception:
        # Fallback for local development when MySQL is not installed yet.
        connection = sqlite3.connect(_sqlite_path())
        try:
            _execute_schema(
                connection,
                [
                    """
                    CREATE TABLE IF NOT EXISTS students (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        full_name TEXT NOT NULL,
                        register_number TEXT NOT NULL UNIQUE,
                        date_of_birth TEXT,
                        department TEXT,
                        program_type TEXT,
                        program TEXT,
                        semester TEXT,
                        email TEXT,
                        phone TEXT,
                        advisor TEXT,
                        status TEXT DEFAULT 'Active'
                    )
                    """,
                    """
                    CREATE TABLE IF NOT EXISTS faculty (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        full_name TEXT NOT NULL,
                        department TEXT,
                        designation TEXT,
                        email TEXT,
                        phone TEXT,
                        status TEXT DEFAULT 'Active'
                    )
                    """,
                    """
                    CREATE TABLE IF NOT EXISTS departments (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        name TEXT NOT NULL UNIQUE,
                        head TEXT,
                        code TEXT
                    )
                    """,
                    """
                    CREATE TABLE IF NOT EXISTS learning_materials (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        title TEXT NOT NULL,
                        category TEXT NOT NULL,
                        course TEXT,
                        format_label TEXT,
                        description TEXT,
                        author_name TEXT,
                        resource_url TEXT,
                        created_at TEXT DEFAULT CURRENT_TIMESTAMP
                    )
                    """,
                    """
                    CREATE TABLE IF NOT EXISTS assignments (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        student_name TEXT NOT NULL,
                        registration_number TEXT,
                        course TEXT,
                        assignment_title TEXT NOT NULL,
                        notes TEXT,
                        file_name TEXT,
                        submitted_at TEXT DEFAULT CURRENT_TIMESTAMP
                    )
                    """,
                ],
            )
        finally:
            connection.commit()
            connection.close()


def _row_to_dict(row: Any) -> dict[str, Any]:
    if row is None:
        return {}
    if isinstance(row, sqlite3.Row):
        return dict(row)
    return dict(row)


def save_student(student: dict[str, Any]) -> dict[str, Any]:
    connection = get_connection()
    try:
        values = (
            student.get("full_name") or student.get("name") or "",
            student.get("register_number") or "",
            student.get("date_of_birth") or "",
            student.get("department") or "",
            student.get("program_type") or "",
            student.get("program") or "",
            student.get("semester") or "",
            student.get("email") or "",
            student.get("phone") or "",
            student.get("advisor") or "",
            student.get("status") or "Active",
        )
        if isinstance(connection, sqlite3.Connection):
            cursor = connection.cursor()
            cursor.execute(
                """
                INSERT INTO students (
                    full_name, register_number, date_of_birth, department,
                    program_type, program, semester, email, phone, advisor, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(register_number) DO UPDATE SET
                    full_name=excluded.full_name,
                    date_of_birth=excluded.date_of_birth,
                    department=excluded.department,
                    program_type=excluded.program_type,
                    program=excluded.program,
                    semester=excluded.semester,
                    email=excluded.email,
                    phone=excluded.phone,
                    advisor=excluded.advisor,
                    status=excluded.status
                """,
                values,
            )
            connection.commit()
            return {
                "full_name": values[0],
                "register_number": values[1],
                "advisor": values[9],
                "status": values[10],
            }

        cursor = connection.cursor()
        cursor.execute(
            """
            INSERT INTO students (
                full_name, register_number, date_of_birth, department,
                program_type, program, semester, email, phone, advisor, status
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE
                full_name = VALUES(full_name),
                date_of_birth = VALUES(date_of_birth),
                department = VALUES(department),
                program_type = VALUES(program_type),
                program = VALUES(program),
                semester = VALUES(semester),
                email = VALUES(email),
                phone = VALUES(phone),
                advisor = VALUES(advisor),
                status = VALUES(status)
            """,
            values,
        )
        connection.commit()
        return {
            "full_name": values[0],
            "register_number": values[1],
            "advisor": values[9],
            "status": values[10],
        }
    finally:
        connection.close()


def get_students() -> list[dict[str, Any]]:
    connection = get_connection()
    try:
        cursor = connection.cursor()
        if isinstance(connection, sqlite3.Connection):
            rows = cursor.execute(
                "SELECT * FROM students ORDER BY id DESC"
            ).fetchall()
            return [_row_to_dict(row) for row in rows]
        rows = cursor.execute("SELECT * FROM students ORDER BY id DESC").fetchall()
        return [_row_to_dict(row) for row in rows]
    finally:
        connection.close()


def save_faculty(faculty: dict[str, Any]) -> dict[str, Any]:
    connection = get_connection()
    try:
        data = (
            faculty.get("full_name") or faculty.get("name") or "",
            faculty.get("department") or "",
            faculty.get("designation") or "",
            faculty.get("email") or "",
            faculty.get("phone") or "",
            faculty.get("status") or "Active",
        )
        if isinstance(connection, sqlite3.Connection):
            cursor = connection.cursor()
            cursor.execute(
                """
                INSERT INTO faculty (full_name, department, designation, email, phone, status)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                data,
            )
            connection.commit()
            return {"full_name": data[0], "department": data[1], "status": data[5]}

        cursor = connection.cursor()
        cursor.execute(
            """
            INSERT INTO faculty (full_name, department, designation, email, phone, status)
            VALUES (%s, %s, %s, %s, %s, %s)
            """,
            data,
        )
        connection.commit()
        return {"full_name": data[0], "department": data[1], "status": data[5]}
    finally:
        connection.close()


def get_faculty() -> list[dict[str, Any]]:
    connection = get_connection()
    try:
        cursor = connection.cursor()
        rows = cursor.execute("SELECT * FROM faculty ORDER BY id DESC").fetchall()
        return [_row_to_dict(row) for row in rows]
    finally:
        connection.close()


def save_department(department: dict[str, Any]) -> dict[str, Any]:
    connection = get_connection()
    try:
        data = (
            department.get("name") or "",
            department.get("head") or "",
            department.get("code") or "",
        )
        if isinstance(connection, sqlite3.Connection):
            cursor = connection.cursor()
            cursor.execute(
                "INSERT INTO departments (name, head, code) VALUES (?, ?, ?)",
                data,
            )
            connection.commit()
            return {"name": data[0], "head": data[1], "code": data[2]}

        cursor = connection.cursor()
        cursor.execute(
            "INSERT INTO departments (name, head, code) VALUES (%s, %s, %s)",
            data,
        )
        connection.commit()
        return {"name": data[0], "head": data[1], "code": data[2]}
    finally:
        connection.close()


def get_departments() -> list[dict[str, Any]]:
    connection = get_connection()
    try:
        cursor = connection.cursor()
        rows = cursor.execute("SELECT * FROM departments ORDER BY id DESC").fetchall()
        return [_row_to_dict(row) for row in rows]
    finally:
        connection.close()


def save_learning_material(material: dict[str, Any]) -> dict[str, Any]:
    connection = get_connection()
    try:
        data = (
            material.get("title") or "",
            material.get("category") or "",
            material.get("course") or "",
            material.get("format_label") or material.get("format") or "",
            material.get("description") or "",
            material.get("author_name") or material.get("author") or "",
            material.get("resource_url") or "",
        )
        if isinstance(connection, sqlite3.Connection):
            cursor = connection.cursor()
            cursor.execute(
                """
                INSERT INTO learning_materials (
                    title, category, course, format_label, description, author_name, resource_url
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                data,
            )
            connection.commit()
            return {"title": data[0], "category": data[1], "author_name": data[5]}

        cursor = connection.cursor()
        cursor.execute(
            """
            INSERT INTO learning_materials (
                title, category, course, format_label, description, author_name, resource_url
            ) VALUES (%s, %s, %s, %s, %s, %s, %s)
            """,
            data,
        )
        connection.commit()
        return {"title": data[0], "category": data[1], "author_name": data[5]}
    finally:
        connection.close()


def get_learning_materials() -> list[dict[str, Any]]:
    connection = get_connection()
    try:
        cursor = connection.cursor()
        rows = cursor.execute("SELECT * FROM learning_materials ORDER BY id DESC").fetchall()
        return [_row_to_dict(row) for row in rows]
    finally:
        connection.close()


def save_assignment(assignment: dict[str, Any]) -> dict[str, Any]:
    connection = get_connection()
    try:
        data = (
            assignment.get("student_name") or "",
            assignment.get("registration_number") or "",
            assignment.get("course") or "",
            assignment.get("assignment_title") or "",
            assignment.get("notes") or "",
            assignment.get("file_name") or "",
        )
        if isinstance(connection, sqlite3.Connection):
            cursor = connection.cursor()
            cursor.execute(
                """
                INSERT INTO assignments (
                    student_name, registration_number, course, assignment_title, notes, file_name
                ) VALUES (?, ?, ?, ?, ?, ?)
                """,
                data,
            )
            connection.commit()
            return {"student_name": data[0], "assignment_title": data[3], "course": data[2]}

        cursor = connection.cursor()
        cursor.execute(
            """
            INSERT INTO assignments (
                student_name, registration_number, course, assignment_title, notes, file_name
            ) VALUES (%s, %s, %s, %s, %s, %s)
            """,
            data,
        )
        connection.commit()
        return {"student_name": data[0], "assignment_title": data[3], "course": data[2]}
    finally:
        connection.close()


def get_assignments() -> list[dict[str, Any]]:
    connection = get_connection()
    try:
        cursor = connection.cursor()
        rows = cursor.execute("SELECT * FROM assignments ORDER BY id DESC").fetchall()
        return [_row_to_dict(row) for row in rows]
    finally:
        connection.close()
