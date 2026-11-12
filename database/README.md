# Database

`schema.sql` defines the PostgreSQL tables for campuses, resource inventory, learning materials, incoming requests, and allocation results. Learning-material categories are constrained to the seven resource types used by the dashboard. The current API prototype is stateless and does not yet read from or write to PostgreSQL; persistence is intentionally a follow-up integration step.

For local development, `docker compose up -d database` applies this schema on the first database startup. The development password in the compose file must be replaced before any shared or production deployment.