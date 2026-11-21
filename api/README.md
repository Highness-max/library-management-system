# 📚 PLP Library Management System — API

A production-shaped **Library Management System** backend built with **NestJS + TypeScript + Prisma + PostgreSQL**.

> Part of the PLP Full-Stack Software Engineering program — Week 1 deliverable (Design & Migrate Your Library Schema).

---

## 🚀 Quick Start

```bash
# 1) Clone & install
git clone https://github.com/<your-org>/library-management-system.git
cd library-management-system/api
npm install

# 2) Database — either local (Docker) or hosted (Neon/Supabase)
docker compose -f ../docker-compose.yml up -d
#    then set DATABASE_URL in .env to:
#    postgresql://library:library@localhost:5432/library_db?schema=public

# 3) Prepare schema
cp .env.example .env
npx prisma migrate dev --name init
npx prisma generate

# 4) Seed data (idempotent — safe to re-run)
npx prisma db seed

# 5) Run
npm run start:dev
```

Open **Prisma Studio** to browse data visually:

```bash
npx prisma studio
```

---

## 🧠 Schema Decisions

### Why does `Book` reference `Genre` via a foreign key instead of embedding it?

We deliberately chose the **relational** approach (`Book.genreId → Genre.id`) over embedding (like MongoDB would do). Four decisive reasons:

1. **Single source of truth for a genre.** "African Literature" exists exactly once in `Genre`. Every book references that row. If we rename it → `UPDATE Genre SET name = ... WHERE id = ...` — one write, zero risk of drift. An embedded document model would require updating every single book document, and any failure would leave **duplicate, divergent versions** of the same genre across the catalog.

2. **Referential integrity is enforced by the database.** A foreign key means Postgres itself rejects a book insert if it points to a non-existent genre. Embedding shifts that responsibility to application code, which is exactly where silent bugs live.

3. **The query planner can index it.** `@@index([genreId])` makes "give me all African Literature books" an **O(log n)** index lookup. Embedded arrays of genre strings can't be indexed as efficiently, and the query shape is clumsier.

4. **Genres are a first-class entity.** They have their own `slug` (used in URLs like `/books?genre=african-literature`), their own timestamps, and will gain their own admin CRUD in Week 2. In a document model, genres would be a **string field** on books — impossible to enrich without denormalization.

**The trade-off we accepted:** joins are needed to fetch a book _with_ its genre. Prisma's `include: { genre: true }` makes that a one-liner, and Postgres's join is trivially cheap at this scale.

We also chose **`onDelete: Restrict`** on the `Genre → Book` relation: you _cannot_ delete a genre while it still has books, which protects the catalog from orphaned references. Reviews, which have no meaning without their parent book, use `onDelete: Cascade` instead — matching the semantics of each relationship rather than blindly picking one rule.

### Prisma vs. a document database (stretch reflection)

The biggest surprise was **`prisma migrate dev` as a first-class workflow**. With MongoDB, schema "changes" happen implicitly as documents are written — a field that used to be a `string` silently becomes a `number` the moment someone saves it. Prisma's migration history means every schema change is a **reviewable, replayable, versioned commit** — the database can never silently drift from your code, which is a fundamental shift in what "safe deployment" means.

### Other design choices

| Choice                                                                  | Rationale                                                                 |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `Int @id @default(autoincrement())`                                     | Simple, human-readable, aligns with PLP course material.                  |
| `createdAt` + `updatedAt` on every model                                | Auditing, sorting, and future soft-delete support.                        |
| `@@index` on FKs and hot columns (`title`, `author`, `availableCopies`) | Search performance on `/books?q=...` in Week 3.                           |
| `Book.isbn @unique`                                                     | Catalog integrity — one record per ISBN.                                  |
| `Review @@unique([bookId, userId])`                                     | One review per user per book (DB-enforced, not app-enforced).             |
| Forward-designed `BorrowRequest`, `Booking`, `StudySpace`               | Week 5–6 need them; designing now avoids migration churn before demo day. |

---

## 📊 ERD

```mermaid
erDiagram
    USER ||--o{ REVIEW : writes
    USER ||--o{ BORROW_REQUEST : makes
    USER ||--o{ BOOKING : makes
    GENRE ||--o{ BOOK : contains
    BOOK ||--o{ REVIEW : receives
    BOOK ||--o{ BORROW_REQUEST : requested_in
    STUDY_SPACE ||--o{ BOOKING : reserved_for

    USER {
        int id PK
        string email UK
        string name
        enum role "PATRON | LIBRARIAN"
        datetime createdAt
        datetime updatedAt
    }
    GENRE {
        int id PK
        string name UK
        string slug UK
    }
    BOOK {
        int id PK
        string title
        string author
        string isbn UK
        int totalCopies
        int availableCopies
        int genreId FK
    }
    REVIEW {
        int id PK
        int rating
        string comment
        int bookId FK
        int userId FK
    }
    BORROW_REQUEST {
        int id PK
        enum status
        int userId FK
        int bookId FK
    }
    STUDY_SPACE {
        int id PK
        string name
        int capacity
    }
    BOOKING {
        int id PK
        int userId FK
        int spaceId FK
        datetime startTime
        datetime endTime
    }
```

---

## 🗺️ 6-Week Roadmap

| Week | Deliverable                         | Status            |
| ---- | ----------------------------------- | ----------------- |
| 1    | Schema + Prisma + Seed              | ✅ This repo      |
| 2    | CRUD APIs, DTOs, Auth, Guards       | ⏳ Next           |
| 3    | React catalog, debounced search     | ⏳                |
| 4    | Reading list + booking UI           | ⏳                |
| 5    | Borrow tracking + booking conflicts | ⏳ (schema ready) |
| 6    | Tests, deployment, capstone         | ⏳                |

---

## 📜 Scripts

```bash
npm run start:dev          # NestJS watch mode
npm run build              # Compile to dist/
npx prisma migrate dev     # Apply schema changes
npx prisma db seed         # Run prisma/seed.ts
npx prisma studio          # Visual DB browser
```
