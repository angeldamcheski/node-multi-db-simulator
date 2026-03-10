# Node Multi DB Simulator

Simple Node.js app that creates **multiple SQLite database files** and keeps randomly updating 1-2 rows to simulate real source systems for a Java sync application.

## What it does
- Creates multiple DB files in `./databases`
- Creates one simple `documents` table in each DB
- Seeds initial dummy data
- Randomly updates 1-2 documents at a fixed interval
- No APIs, no file storage, no extra complexity

## Table structure
```sql
CREATE TABLE documents (
  id TEXT PRIMARY KEY,
  document_number TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT NOT NULL,
  owner TEXT,
  amount REAL,
  created_at TEXT NOT NULL,
  last_modified_at TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1
);
```

## Install
```bash
npm install
```

## Run
Initialize databases and keep updating randomly:
```bash
npm start
```

Reset all DBs, reseed, and run one update tick only:
```bash
npm run reset
```

Run a single update tick without continuous loop:
```bash
npm run once
```

## Default behavior
- 3 DB files are created:
  - `source-1.db`
  - `source-2.db`
  - `source-3.db`
- 20 documents are inserted in each DB
- Every 5 seconds, 1 or 2 random documents are updated in one random DB

## Good for Java sync app
Your Spring Boot app can directly connect to the DB files and read the `documents` table from each source DB.
