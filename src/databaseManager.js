const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const config = require('./config');

function ensureDbDirectory() {
  fs.mkdirSync(config.dbDirectory, { recursive: true });
}

function getDbPath(index) {
  return path.join(config.dbDirectory, `${config.dbPrefix}-${index}.db`);
}

function openDatabase(index) {
  ensureDbDirectory();
  const dbPath = getDbPath(index);
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  return db;
}

function initSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS documents (
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

    CREATE INDEX IF NOT EXISTS idx_documents_last_modified_at
    ON documents(last_modified_at);

    CREATE INDEX IF NOT EXISTS idx_documents_status
    ON documents(status);
  `);
}

function clearDocuments(db) {
  db.exec('DELETE FROM documents');
}

function insertDocument(db, document) {
  const stmt = db.prepare(`
    INSERT INTO documents (
      id,
      document_number,
      name,
      category,
      status,
      owner,
      amount,
      created_at,
      last_modified_at,
      version
    ) VALUES (
      @id,
      @document_number,
      @name,
      @category,
      @status,
      @owner,
      @amount,
      @created_at,
      @last_modified_at,
      @version
    )
  `);

  stmt.run(document);
}

function getAllDocuments(db) {
  return db.prepare('SELECT * FROM documents ORDER BY document_number').all();
}

function getRandomDocuments(db, limit) {
  return db.prepare('SELECT * FROM documents ORDER BY RANDOM() LIMIT ?').all(limit);
}

function updateDocument(db, document) {
  const stmt = db.prepare(`
    UPDATE documents
    SET
      name = @name,
      category = @category,
      status = @status,
      owner = @owner,
      amount = @amount,
      last_modified_at = @last_modified_at,
      version = @version
    WHERE id = @id
  `);

  stmt.run(document);
}

function countDocuments(db) {
  const row = db.prepare('SELECT COUNT(*) AS count FROM documents').get();
  return row.count;
}

module.exports = {
  ensureDbDirectory,
  getDbPath,
  openDatabase,
  initSchema,
  clearDocuments,
  insertDocument,
  getAllDocuments,
  getRandomDocuments,
  updateDocument,
  countDocuments,
};
