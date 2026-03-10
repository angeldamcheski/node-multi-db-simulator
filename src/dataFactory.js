const crypto = require('crypto');

const categories = ['INVOICE', 'CONTRACT', 'REQUEST', 'REPORT', 'MEMO'];
const statuses = ['NEW', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'ARCHIVED'];
const owners = ['Ana', 'Mark', 'Elena', 'Petar', 'Sara', 'Bojan', 'Ivana', 'Nikola'];
const adjectives = ['Alpha', 'Blue', 'Central', 'Delta', 'Prime', 'Global', 'Rapid', 'Core'];
const nouns = ['Document', 'Case', 'Record', 'Entry', 'Dossier', 'File', 'Request', 'Report'];

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function randomAmount() {
  return Number((Math.random() * 10000 + 100).toFixed(2));
}

function nowIso() {
  return new Date().toISOString();
}

function randomName() {
  return `${pickRandom(adjectives)} ${pickRandom(nouns)}`;
}

function randomDocumentNumber(sourceIndex, sequence) {
  return `SRC${String(sourceIndex).padStart(2, '0')}-DOC-${String(sequence).padStart(5, '0')}`;
}

function createDocument(sourceIndex, sequence) {
  const timestamp = nowIso();
  return {
    id: crypto.randomUUID(),
    document_number: randomDocumentNumber(sourceIndex, sequence),
    name: randomName(),
    category: pickRandom(categories),
    status: pickRandom(statuses),
    owner: pickRandom(owners),
    amount: randomAmount(),
    created_at: timestamp,
    last_modified_at: timestamp,
    version: 1,
  };
}

function createUpdatePayload(existingDocument) {
  const updated = { ...existingDocument };
  const fieldsToTouch = ['name', 'category', 'status', 'owner', 'amount'];
  const numberOfFields = Math.floor(Math.random() * 3) + 1;
  const shuffled = [...fieldsToTouch].sort(() => Math.random() - 0.5).slice(0, numberOfFields);

  for (const field of shuffled) {
    switch (field) {
      case 'name':
        updated.name = randomName();
        break;
      case 'category':
        updated.category = pickRandom(categories);
        break;
      case 'status':
        updated.status = pickRandom(statuses);
        break;
      case 'owner':
        updated.owner = pickRandom(owners);
        break;
      case 'amount':
        updated.amount = randomAmount();
        break;
      default:
        break;
    }
  }

  updated.version = Number(existingDocument.version) + 1;
  updated.last_modified_at = nowIso();
  return updated;
}

module.exports = {
  createDocument,
  createUpdatePayload,
  nowIso,
};
