const {
  initializeDatabases,
  runSingleUpdateTick,
  startSimulation,
} = require("./simulator");
const { syncAllSources } = require("./syncEngine");

const args = process.argv.slice(2);
const reset = args.includes("--reset");
const once = args.includes("--once");

initializeDatabases({ reset });

if (once) {
  runSingleUpdateTick();
  process.exit(0);
}

startSimulation();
// const SYNC_INTERVAL = 3000;
// console.log(
//   `\x1b[34m[SYSTEM]\x1b[0m Sync Service scheduled for every ${SYNC_INTERVAL / 1000}s`,
// );
// setInterval(async () => {
//   await syncAllSources();
// }, SYNC_INTERVAL);
