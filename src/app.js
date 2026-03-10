const { syncAllSources } = require("./syncEngine");
// Run every 30 seconds
const SYNC_INTERVAL = 30000;

console.log("Data Synchronization Service Started...");

setInterval(async () => {
  await syncAllSources();
}, SYNC_INTERVAL);