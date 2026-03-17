# Docker Setup for OTBL Monorepo

This project is configured to run using Docker and Docker Compose with a single entry point (the Web application).

## Architecture

- **Single Entry Point**: The frontend (Next.js) runs on port **3000**.
- **Internal Proxy**: All requests to `/trpc/*` are automatically proxied from the frontend to the backend server internally within the Docker network.
- **External Database**: MySQL is expected to be external. By default, the server attempts to connect to `host.docker.internal:3306` (your host machine's MySQL).

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- An external MySQL database.

## Configuration

Before running, ensure your `DATABASE_URL` is correct. You can set it in your host environment or modify the `docker-compose.yml`.

Default: `mysql://root:password@host.docker.internal:3306/otbl`

## Getting Started

1. **Build and start the containers:**

   ```bash
   docker-compose up --build
   ```

2. **Access the application:**
   - **Web App**: [http://localhost:3000](http://localhost:3000)
   - **Server API**: Accessed internally via proxy (not exposed to host).

## Running Migrations

Since the database is external, you should run migrations from your host machine:

```bash
pnpm --filter server db:migrate
```

Ensure your `apps/server/.env` file has the correct `DATABASE_URL` for your host environment (e.g., `localhost:3306`).
