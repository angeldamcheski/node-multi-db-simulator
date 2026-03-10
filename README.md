# Data Synchronization Service

## Overview

The Data Synchronization Service is responsible for collecting data from multiple source databases and consolidating it into a single central database.  
The service ensures that only changed data is synchronized, providing efficient and scalable data consolidation.

The system is designed to support multiple independent source databases and maintain information about the origin of each synchronized record.

---

# Architecture

The synchronization process consists of three main components:

- **Schedulers**
- **Manual API Trigger**
- **Synchronizer Engine**

---

# Scheduler Execution

The system supports **scheduled synchronization jobs**.

Users should be able to configure a scheduler that executes the synchronization process at defined intervals, for example:

- every 5 minutes
- every 30 minutes
- every hour

During each execution cycle, the scheduler processes **all source databases sequentially (one by one)** rather than loading all databases simultaneously.

This approach ensures that:

- only one source database is processed at a time
- memory usage remains controlled
- the system avoids loading large datasets from multiple databases simultaneously
- synchronization remains stable and scalable

Example execution flow:

Scheduler Run:

1. Read data from **Source DB 1**
2. Synchronize changes to the **Central DB**
3. Move to **Source DB 2**
4. Synchronize changes
5. Continue until all configured source databases are processed

This ensures **smart and controlled synchronization** without overwhelming system memory.

---

# Manual API Trigger

In addition to scheduled execution, the service must expose an **API endpoint** that allows synchronization to be triggered manually.

Example use cases:

- manual data refresh
- administrative operations
- external system integrations
- testing and debugging

Example endpoint:

`POST /sync/run`

Optional endpoints may include:
`POST /sync/run/{source}`
`POST /sync/run/all`

---

# Incremental Synchronization

The synchronization service must only process **data that has changed since the last synchronization**.

This significantly improves performance and avoids unnecessary database processing.

Possible change detection strategies include:

- `last_modified_at` timestamp

The synchronization process should therefore:

- **insert new records**
- **update modified records**
- **skip unchanged records**

---

# Pagination and Memory Efficiency

To ensure scalability and prevent memory overload, the synchronizer must read source data using **pagination**.

Large datasets should never be loaded entirely into memory.

Recommended approaches:

- `LIMIT / OFFSET`
- cursor-based pagination
- batch processing

Example batch size:
`100 – 1000 records per batch`

This ensures:

- stable memory usage
- faster processing
- improved scalability

---

# Synchronizer Logic

The synchronizer component is responsible for:

1. Connecting to multiple source databases
2. Reading data from each source database
3. Processing records in **paginated batches**
4. Synchronizing data into the **central database**

During synchronization, the system must track **where each record originated from**.

The central database should therefore store:

- `source_system`
- `source_document_id`

This ensures:

- proper traceability
- conflict prevention
- easier debugging

---

# Logging

The system must implement **strong logging using Logback**.

A dedicated log configuration should be provided with a **custom log file** specifically for synchronization activities.

Logging should include:

### Synchronization lifecycle

- synchronization start
- synchronization finish
- scheduler execution

### Source database processing

- source database being processed
- number of records read
- inserted records
- updated records
- number of inserted records
- number of updated records

### Errors and warnings

- connection failures
- synchronization errors
- data conflicts

Example log output:
2026-03-09 14:12:01 [SYNC] Starting synchronization for source-3
2026-03-09 14:12:02 [SYNC] Read 500 records (batch 1)
2026-03-09 14:12:03 [SYNC] Inserted 120 records
2026-03-09 14:12:03 [SYNC] Updated 45 records
2026-03-09 14:12:03 [SYNC] Skipped 335 records
2026-03-09 14:12:04 [SYNC] Synchronization completed

Proper logging ensures:

- easier monitoring
- better debugging
- full auditability of synchronization activities

---

# Key Design Goals

The synchronization service is designed to provide:

- **efficient incremental synchronization**
- **memory-safe batch processing**
- **scalable multi-source integration**
- **traceable data origin**
- **strong operational logging**

This ensures the system can handle large datasets and multiple source systems reliably.
