const Database = require("better-sqlite3");
const centralDb = new Database("./databases/central-hub.db");

centralDb.exec(`
DROP TABLE IF EXISTS synchronized_data;
DROP TABLE IF EXISTS sync_metadata;
`);

/*
Main synchronized data table
*/
centralDb.exec(`
CREATE TABLE synchronized_data (
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

/*
Metadata table for cursor tracking
*/
centralDb.exec(`
CREATE TABLE sync_metadata (
    source_system TEXT PRIMARY KEY,
    last_successful_sync TEXT,
    last_cursor_id TEXT
)
`);

module.exports = centralDb;
