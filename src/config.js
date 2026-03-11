const path = require("path");

module.exports = {
  dbDirectory: path.join(__dirname, "..", "databases"),
  dbCount: 15,
  initialDocumentsPerDb: 50,
  updateIntervalMs: 3000,
  minDocsToUpdatePerTick: 1,
  maxDocsToUpdatePerTick: 20,
  dbPrefix: "source",
};
