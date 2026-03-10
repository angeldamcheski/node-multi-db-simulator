const Database = require("better-sqlite3");
const db = new Database("./databases/central-hub.db");
const rowCount = db
  .prepare("SELECT COUNT(*) as count FROM synchronized_data")
  .get();
console.log(`Total records in Central DB: ${rowCount.count}`);
const sample = db
  .prepare(
    "SELECT source_system, document_number FROM synchronized_data LIMIT 5",
  )
  .all();
console.table(sample);
