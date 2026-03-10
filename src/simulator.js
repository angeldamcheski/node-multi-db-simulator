const config = require("./config");
const crypto = require("crypto");
const {
  openDatabase,
  initSchema,
  clearDocuments,
  insertDocument,
  getRandomDocuments,
  updateDocument,
  countDocuments,
} = require("./databaseManager");
const { createDocument, createUpdatePayload } = require("./dataFactory");

function initializeDatabases({ reset = false } = {}) {
  for (let i = 1; i <= config.dbCount; i += 1) {
    const db = openDatabase(i);
    initSchema(db);

    if (reset) {
      clearDocuments(db);
    }

    const count = countDocuments(db);
    const time = new Date().toISOString();

    if (count === 0) {
      for (
        let sequence = 1;
        sequence <= config.initialDocumentsPerDb;
        sequence += 1
      ) {
        insertDocument(db, createDocument(i, sequence));
      }
      console.log(
        `\x1b[32m[SEED]\x1b[0m ${time} Seeded ${config.initialDocumentsPerDb} documents in source-${i}.db`,
      );
    } else {
      console.log(
        `\x1b[33m[SEED]\x1b[0m ${time} source-${i}.db already contains ${count} documents`,
      );
    }

    db.close();
  }
}

function runSingleUpdateTick() {
  const dbIndex = Math.floor(Math.random() * config.dbCount) + 1;
  const db = openDatabase(dbIndex);
  initSchema(db);

  const docsToUpdate =
    Math.floor(
      Math.random() *
        (config.maxDocsToUpdatePerTick - config.minDocsToUpdatePerTick + 1),
    ) + config.minDocsToUpdatePerTick;

  const selectedDocuments = getRandomDocuments(db, docsToUpdate);

  if (selectedDocuments.length === 0) {
    console.log(
      `\x1b[33m${new Date().toISOString()} source-${dbIndex}.db has no data to update\x1b[0m`,
    );
    db.close();
    return;
  }

  for (const document of selectedDocuments) {
    const updated = createUpdatePayload(document);
    updateDocument(db, updated);
    const time = new Date().toISOString();

    console.log(
      `\x1b[90m${time}\x1b[0m ` + // timestamp (gray)
        `\x1b[36m[UPDATE]\x1b[0m ` + // action (cyan)
        `\x1b[32m${document.document_number}\x1b[0m ` + // document number (green)
        `in \x1b[35msource-${dbIndex}.db\x1b[0m ` + // database (magenta)
        `→ version \x1b[33m${updated.version}\x1b[0m`, // version (yellow)
    );
  }

  db.close();
}

function startSimulation() {
  console.log(
    `\x1b[36m[SIMULATOR]\x1b[0m ${new Date().toISOString()} Random update loop started. Interval: ${config.updateIntervalMs}ms`,
  );
  setInterval(runSingleUpdateTick, config.updateIntervalMs);

  setInterval(() => {
    const dbIndex = Math.floor(Math.random() * config.dbCount) + 1;
    const db = openDatabase(dbIndex);

    // NEW DOCUMENT
    maybeCreateDocument(db, dbIndex);
  }, config.updateIntervalMs);
}

function maybeCreateDocument(db, dbIndex) {
  const chance = Math.random();

  // 30% chance to create a new document
  if (chance > 0.4) return;

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  const docNumber = crypto.randomUUID();
  const name = `Generated Document ${docNumber}`;
  const category = ["FINANCE", "LEGAL", "HR", "OPERATIONS"][
    Math.floor(Math.random() * 4)
  ];

  const status = "ACTIVE";

  const owner = ["john", "anna", "maria", "alex", "david"][
    Math.floor(Math.random() * 5)
  ];

  const amount = (Math.random() * 10000).toFixed(2);

  db.prepare(
    `
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
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
  ).run(id, docNumber, name, category, status, owner, amount, now, now, 1);

  console.log(
    `\x1b[90m${now}\x1b[0m \x1b[32m[CREATE]\x1b[0m ${docNumber} in \x1b[35msource-${dbIndex}.db\x1b[0m`,
  );
}

module.exports = {
  initializeDatabases,
  runSingleUpdateTick,
  startSimulation,
};
