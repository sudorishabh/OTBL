# Docker Setup for OTBL Monorepo

This project is configured to run using Docker and Docker Compose. This setup includes the Next.js web application, the Express server, and a MySQL database.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Getting Started

1. **Build and start the containers:**

   ```bash
   docker-compose up --build
   ```

2. **Access the applications:**
   - **Web App:** [http://localhost:3000](http://localhost:3000)
   - **Server API:** [http://localhost:7200](http://localhost:7200)
   - **Database:** `localhost:3306` (Internal: `db:3306`)

## Running Migrations

Once the database container is up, you can run migrations from your host machine (if you have the dependencies installed) or via a temporary container.

### Option 1: From Host (Recommended)
Make sure your `.env` in `apps/server/.env` points to `localhost:3306`.
```bash
pnpm --filter server db:migrate
```

### Option 2: Inside Container
```bash
docker-compose exec server pnpm --filter server db:migrate
```

## Architecture Details

- **Monorepo Management:** Uses [Turborepo](https://turbo.build/)'s `prune` command to minimize Docker image sizes by only including necessary packages for each service.
- **Next.js Optimization:** The Web Dockerfile uses Next.js [Standalone Output](https://nextjs.org/docs/app/api-reference/next-config-js/output#standalone), resulting in much smaller images.
- **Pnpm:** Managed via Corepack within the containers.

## Environment Variables

Default environment variables are provided in `docker-compose.yml`. For production, you should create a `.env.production` file and reference it in your compose file or CI/CD pipeline.

- `DATABASE_URL`: Connection string for MySQL.
- `NEXT_PUBLIC_API_URL`: The URL where the frontend can reach the backend.
- `JWT_SECRET` & `JWT_REFRESH_SECRET`: Used for authentication.
