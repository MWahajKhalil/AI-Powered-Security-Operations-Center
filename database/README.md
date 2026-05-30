# Database Layer

This directory handles structural storage for our application metadata.

## Components
- **SQLite Database**: A lightweight relational database containing:
  - **Tool Audit Logs**: History of all tools called, by whom, when, with which args, and outcomes.
  - **Investigation Sessions**: Historical session records of threat hunts.
- **Migrations / Schemas**: SQL or ORM definition files detailing database layout.
