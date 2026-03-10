const Database = require("better-sqlite3");
const centralDb = require("./centralDatabase");
const path = require("path");
const config = require("./config");
const crypto = require("crypto");

let isSyncing = false;
async function syncAllSources() {
  if (isSyncing) {
    console.log(
      `\x1b[33m[SYNC] Skipping cycle: Previous sync still in progress.\x1b[0m`,
    );
  }
  isSyncing = true;
  const startTime = Date.now();
  console.log(`\x1b[34m[ENGINE] Starting global sync cycle...\x1b[0m`);
  try {
    for (let i = 1; i <= config.dbCount; i++) {
      const sourceName = `${config.dbPrefix}-${i}`;
      const dbPath = path.join(config.dbDirectory, `${sourceName}.db`);
      if (!require("fs").existsSync(dbPath)) continue;
      try {
        await syncSingleSource(sourceName, dbPath);
      } catch (error) {
        console.error(
          `\x1b[31m[ERROR] Failed to sync ${sourceName}:\x1b[0m`,
          error.message,
        );
      }
    }
  } finally {
    isSyncing = false;
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(
      `\x1b[34m[ENGINE] Global Sync Cycle Finished in ${duration}s.\x1b[0m`,
    );
  }
}

async function syncSingleSource(sourceName, dbPath) {
  const sourceDb = new Database(dbPath, { readonly: true });
  const meta = centralDb
    .prepare(
      "SELECT last_successful_sync FROM sync_metadata WHERE source_id = ?",
    )
    .get(sourceName);
  let currentCursor = meta
    ? meta.last_successful_sync
    : "1970-01-01T00:00:00.000Z";

  const batchSize = 100;
  let totalSynced = 0;

  while (true) {
    const rows = sourceDb
      .prepare(
        `
                SELECT * FROM documents
                WHERE last_modified_at > ?
                ORDER BY last_modified_at ASC
                LIMIT ? 
            `,
      )
      .all(currentCursor, batchSize);
    if (rows.length === 0) break;

    const upsert = centralDb.prepare(`
            INSERT INTO synchronized_data (
            id, source_system, source_document_id, document_number, name, category, status, amount, last_modified_at, synced_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(source_system, source_document_id) DO UPDATE SET
            name = excluded.name,
            category = excluded.category,
            status = excluded.status,
            amount = excluded.amount,
            last_modified_at = excluded.last_modified_at,
            synced_at = excluded.synced_at
        `);
    const transaction = centralDb.transaction((data) => {
      for (const row of data) {
        upsert.run(
          crypto.randomUUID(),
          sourceName,
          row.id,
          row.document_number,
          row.name,
          row.category,
          row.status,
          row.amount,
          row.last_modified_at,
          new Date().toISOString(),
        );
      }
    });
    transaction(rows);
    currentCursor = rows[rows.length - 1].last_modified_at;
    totalSynced += rows.length;
    if (rows.length < batchSize) break;
  }
  centralDb
    .prepare(
      `
        INSERT INTO sync_metadata (source_id, last_successful_sync)
        VALUES(?, ?)
        ON CONFLICT(source_id) DO UPDATE SET last_successful_sync = excluded.last_successful_sync
    `,
    )
    .run(sourceName, currentCursor);

  if (totalSynced > 0) {
    console.log(
      `\x1b[32m[SYNC]\x1b[0m ${sourceName}: Processed ${totalSynced} changes.]`,
    );
  }
  sourceDb.close();
}
module.exports = { syncAllSources, syncSingleSource };
