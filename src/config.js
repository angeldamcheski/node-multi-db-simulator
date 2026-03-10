const path = require("path");

module.exports = {
  dbDirectory: path.join(__dirname, "..", "databases"),
  dbCount: 15,
  initialDocumentsPerDb: 250,
  updateIntervalMs: 5000,
  minDocsToUpdatePerTick: 1,
  maxDocsToUpdatePerTick: 80,
  dbPrefix: "source",
};
