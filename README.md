# Persistent Counter

A small Node.js and Express app that stores a counter in PostgreSQL.

Docker Compose runs the app and database in separate containers.
A named volume preserves the database when containers are replaced.

## Technologies

- Node.js and Express
- PostgreSQL
- Docker and Docker Compose

## First-time setup

1. Open the project folder and start Docker Desktop.
2. Copy the example settings:

   ```bash
   cp .env.example .env
   ```

3. Set your database password in `.env` before the first startup.
4. Build and start the containers:

   ```bash
   docker compose up -d --build
   ```

5. Open http://localhost:3006 and click **Increase +1**.

## Test persistence

Note the counter's value, then restart the app:

```bash
docker compose restart app
```

Refresh the webpage. The value should remain unchanged.

Next, replace both containers:

```bash
docker compose down
docker compose up -d
```

Refresh again. The value should still remain unchanged.

Both tests passed during local verification.

## How it works

The app reads and updates the counter in PostgreSQL.
The database stores its files in the `counter_data` named volume.

At startup, the app creates the counter only if it does not already exist,
so an existing value is preserved.

## Useful commands

Check container status:

```bash
docker compose ps
```

Read app logs:

```bash
docker compose logs app
```

Stop and remove the containers while retaining data:

```bash
docker compose down
```

Adding `-v` to `docker compose down` deletes the named volume and its data.

## Configuration

`.env` is excluded from Git. `.env.example` provides a settings template.