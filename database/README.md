# Database

`schema.sql` uses MySQL syntax and defines additional resource-inventory, request, and allocation tables. The FastAPI backend connects to PostgreSQL through `DATABASE_URL` and creates its student, faculty, department, learning-material, and assignment tables at startup. The optimizer still works in memory and does not persist optimization results.

For local development, `docker compose up -d database` starts the MySQL service and applies `schema.sql`. Do not reuse the development credentials in a shared or production environment.