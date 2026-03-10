const centralDb = require("./centralDatabase");

function printSyncStats() {
  console.log(
    "\n\x1b[35m====================================================\x1b[0m",
  );
  console.log(
    "\x1b[35m            SYNC ENGINE COLLECTION STATS            \x1b[0m",
  );
  console.log(
    "\x1b[35m====================================================\x1b[0m",
  );

  // 1. Get counts per source
  const counts = centralDb
    .prepare(
      `
        SELECT 
            source_system AS "Source", 
            COUNT(*) AS "Records",
            MAX(last_modified_at) AS "Latest Record Time"
        FROM synchronized_data 
        GROUP BY source_system
        ORDER BY source_system ASC
    `,
    )
    .all();

  // 2. Get the metadata (the high-water marks)
  const metadata = centralDb
    .prepare(
      `
        SELECT 
            source_id AS "Source", 
            last_successful_sync AS "Engine Bookmark"
        FROM sync_metadata
    `,
    )
    .all();

  if (counts.length === 0) {
    console.log("No data synced yet. Run 'npm start' first!");
  } else {
    console.log("\n[1] DATA COLLECTION SUMMARY");
    console.table(counts);

    console.log("\n[2] ENGINE BOOKMARKS (High-Water Marks)");
    console.table(metadata);
  }

  // Close the connection
  centralDb.close();
}

printSyncStats();
