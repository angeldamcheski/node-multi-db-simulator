const path = require("path");

module.exports = {
  dbDirectory: path.join(__dirname, "..", "databases"),
  dbCount: 15,
  initialDocumentsPerDb: 50,
  updateIntervalMs: 4000,
  minDocsToUpdatePerTick: 20,
  maxDocsToUpdatePerTick: 80,
  dbPrefix: "source",
};
