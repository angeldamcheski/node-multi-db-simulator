const { initializeDatabases, runSingleUpdateTick, startSimulation } = require('./simulator');

const args = process.argv.slice(2);
const reset = args.includes('--reset');
const once = args.includes('--once');

initializeDatabases({ reset });

if (once) {
  runSingleUpdateTick();
  process.exit(0);
}

startSimulation();
