import express from "express";
import pg from "pg";

const { Pool } = pg;
const app = express();
const port = 3000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on("error", (error) => {
  console.error("Database connection error:", error.message);
});

// Read the saved counter and display the webpage.
app.get("/", async (req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT value FROM counter WHERE id = 1"
    );

    const count = result.rows[0].value;

    res.set("Cache-Control", "no-store");

    res.send(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Persistent Counter</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              text-align: center;
              padding: 60px 20px;
              background: #f8f5f6;
              color: #282024;
            }
            .count { font-size: 72px; margin: 24px; }
            button {
              background: #8b1538;
              color: white;
              border: none;
              border-radius: 8px;
              padding: 14px 28px;
              font-size: 18px;
              cursor: pointer;
            }
          </style>
        </head>
        <body>
          <h1>Persistent Counter</h1>
          <p class="count">${count}</p>
          <form action="/increment" method="POST">
            <button type="submit">Increase +1</button>
          </form>
        </body>
      </html>
    `);
  } catch (error) {
    next(error);
  }
});

// Increase the value stored in PostgreSQL.
app.post("/increment", async (req, res, next) => {
  try {
    await pool.query(
      "UPDATE counter SET value = value + 1 WHERE id = 1"
    );

    res.redirect(303, "/");
  } catch (error) {
    next(error);
  }
});

app.use((error, req, res, next) => {
  console.error("Request failed:", error.message);
  res.status(503).send("Cannot access the counter. Please try again.");
});

async function start() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS counter (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      value INTEGER NOT NULL DEFAULT 0
    )
  `);

  await pool.query(`
    INSERT INTO counter (id, value)
    VALUES (1, 0)
    ON CONFLICT (id) DO NOTHING
  `);

  app.listen(port, "0.0.0.0", () => {
    console.log("Persistent Counter listening on port " + port);
  });
}

start().catch((error) => {
  console.error("Could not start app:", error.message);
  process.exit(1);
});