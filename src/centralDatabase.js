const Database = require("better-sqlite3");
const centralDb = new Database("./databases/central-hub.db");

centralDb.exec(`
    CREATE TABLE IF NOT EXISTS synchronized_data(
        id TEXT PRIMARY KEY,
        source_system TEXT NOT NULL,
        source_document_id TEXT NOT NULL,
        document_number TEXT,
        name TEXT,
        category TEXT,
        status TEXT,
        amount REAL,
        last_modified_at TEXT,
        synced_at TEXT NOT NULL,
        UNIQUE(source_system, source_document_id)
    )
`);
centralDb.exec(`
        CREATE TABLE IF NOT EXISTS sync_metadata(
        source_id TEXT PRIMARY KEY,
        last_successful_sync TEXT
    )
    `);
module.exports = centralDb;
