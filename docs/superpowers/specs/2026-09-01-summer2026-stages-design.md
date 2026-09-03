# Design: Summer 2026 Internship Project Portfolio

**Date:** 2026-09-01
**Status:** Approved (stack table approved by owner; awaiting review of this document)
**Source of scope:** `software_projects_scope.pdf` (8 project cards, Arabic)
**Living tracker:** `plan.md` (root)

> ⚠️ **Superseded in part (2026-09-03).** The owner decided PostgreSQL would not be
> used at all. Projects 1, 3, 7 and 8 were migrated to MongoDB, so D6 and the D7
> stack table below no longer describe the delivered work. The resulting balance is
> **MongoDB 5, SQL Server 2, MySQL 1**. `plan.md` is the current source of truth;
> each project's `db/README.md` documents its database. This document is kept as the
> record of the original design decisions.

## Problem

Eight university interns each need a complete, demonstrable software project to
present to their Turkish universities as internship work. Each project consists of
2-4 applications (backend + some combination of desktop, web, mobile). All user
interfaces and documentation must be in Turkish. The source PDF gives, per project,
a one-line functional description and a suggested tech stack — several of which
offer alternatives ("React Native / Flutter", "WPF / WinForms") that must be
resolved so that each project is internally consistent and the portfolio as a whole
shows variety across students.

## Constraints

1. **Development machine is an Intel Mac** (macOS 13.7.8, x86_64). WinForms cannot
   be created or built here. ASP.NET Core, EF Core and SQL Server (Docker) all can.
2. **Code must read as student work** — a good 3rd/4th-year undergraduate, not a
   professional team. This is an explicit requirement, not a shortcut.
3. **Turkish UI, English code.** Matches how Turkish dev teams and tutorials work.
4. **Local database installs** preferred over containers, except where impossible.
5. Single repository, one subfolder per project.

## Decisions and rationale

### D1 — Scope depth: "demo-complete"

Every flow named in the PDF description works end to end against a real database
with seeded Turkish data, with auth and roles. No cloud deployment, no CI, no test
suites. Rationale: a university jury asks the student to *demonstrate and explain*
the system; it does not audit test coverage. Test suites would also contradict D2.

### D2 — Code style: "junior-but-clean"

Logic lives in controllers. No service/repository layers, no dependency-injection
abstractions beyond what a framework mandates, no design patterns, simple `if`
validation, some duplication within and across projects, short Turkish comments,
no tests. The code is correct and runs reliably, but nobody would mistake it for
senior work. Rationale: the owner's explicit instruction — the artifact must be
consistent with its claimed author.

Deliberately *not* chosen: "deliberately rough" (inline SQL, magic numbers,
unused variables). That style is more believable in isolation but makes 24 apps
materially harder to keep bug-free, and bugs at demo time cost the student more
than polish does.

### D3 — .NET handled locally; only WinForms deferred to Windows

The owner initially assumed all .NET work required a Windows machine. In fact only
WPF/WinForms are Windows-only. Therefore:

- Projects 2 and 5's ASP.NET Core APIs are developed and verified on this Mac.
- Only three WinForms desktop apps (projects 1, 4, 5) are scaffolded on Windows,
  in a **single round-trip** driven by `tools/scaffold-winforms.ps1`.
- Their C# is then written on the Mac (compilable but not runnable here) and built
  and run on Windows.

The installed `dotnet` is 5.0.407 (end-of-life); .NET 8 LTS will be installed.

### D4 — WinForms only, no WPF

Owner decision. All three .NET desktop apps use WinForms.

### D5 — Redis removed from project 8

The PDF lists `Node.js + Redis + PostgreSQL` for the courier system. Redis is well
above the level D2 targets and would be indefensible if a jury asked the student to
explain it. The same live-tracking behaviour is implemented with plain PostgreSQL
queries and client polling. Recorded as a deviation in `plan.md`.

### D6 — Databases local, SQL Server in Docker

PostgreSQL, MySQL and MongoDB run as local Homebrew services (MongoDB 4.4 is
already installed). SQL Server has no macOS build, so projects 2 and 5 use the
official Linux image under the already-installed Docker, natively on x86_64.

### D7 — Stack assignment for diversity

Where the PDF offered alternatives, choices were made to balance the portfolio:

| # | Project | Backend + DB | Desktop | Web | Mobile |
|---|---------|--------------|---------|-----|--------|
| 1 | Çamaşırhane ERP | Express + PostgreSQL | WinForms | React + Vite | React Native (Expo) |
| 2 | Oto Servis | ASP.NET Core 8 + SQL Server | — | Next.js | Flutter |
| 3 | Klinik PMS | NestJS + PostgreSQL | Electron + React | React + Vite | Flutter |
| 4 | Spor Salonu | Express + MySQL | WinForms | React + Vite | React Native (Expo) |
| 5 | Araç Satış & Depo | ASP.NET Core 8 + SQL Server | WinForms | — | Flutter + SQLite |
| 6 | Apart & Otel | Express + MongoDB | — | Next.js + Tailwind | React Native (Expo) |
| 7 | Emlak CRM | Laravel 11 + PostgreSQL | — | Vue 3 + Vite | Flutter |
| 8 | Kargo & Dağıtım | Express + PostgreSQL | Electron + React | React + Vite | React Native (Expo) |

Resulting balance: 4 Flutter / 4 React Native; 3 WinForms / 2 Electron; 4 Express,
1 NestJS, 2 ASP.NET Core, 1 Laravel; React, Next.js and Vue each represented;
PostgreSQL 4, SQL Server 2, MySQL 1, MongoDB 1.

Where the PDF's header line names a surface the tech list omits (projects 1 and 4
say "Desktop + Mobile + Web" but list no web stack), a small React + Vite admin
panel is added so the delivered project matches its stated surfaces.

### D8 — Sequential build order

Projects are built one at a time to completion. Rationale: an early complete
project lets the owner correct conventions before they are repeated eight times,
and each student gets a demoable deliverable as early as possible. The Windows
scaffold hand-off is issued up front so it proceeds in parallel.

## Cross-cutting architecture

Every project follows the same shape, so knowledge transfers between students:

```
NN-proje-adi/
├── README.md          # Turkish: what it is, setup, demo accounts, screenshots
├── db/                # schema + Turkish seed data
└── apps/
    ├── api/           # the only writer to the database
    ├── web*/          # browser clients
    ├── desktop*/      # WinForms or Electron
    └── mobile/        # Flutter or React Native
```

- **The API is the single integration point.** Desktop, web and mobile clients all
  speak HTTP/JSON to it; no client touches the database directly. This is what makes
  each client independently understandable and testable by hand.
- **Auth:** JWT (Sanctum on Laravel), role claim in the token, role checks inline in
  controllers.
- **Errors:** HTTP status + `{ "message": "..." }` in Turkish, shown directly in the UI.
- **Ports and database names are fixed per project** (table in `plan.md`) so several
  projects can run side by side during review.
- **Offline exception (project 5):** the Flutter app owns a local SQLite database and
  reconciles with the API through explicit pull/push sync endpoints. This is the one
  place where a client holds authoritative state, and the sync contract is documented
  in that project's README.

## Risks

| Risk | Mitigation |
|------|------------|
| Windows round-trip stalls all three WinForms apps | Hand-off pack issued in Phase 0, before any project work; those apps are the last item in their project's checklist |
| 24 apps is a long effort; context is lost between sessions | `plan.md` is the resumable state: per-app status, decisions, deviations |
| Code drifts toward professional quality out of habit | D2 restated in `plan.md` conventions; reviewed per project |
| Old toolchain versions on an Intel Mac (Docker 20.10, macOS 13) | Verified per tool in Phase 0 before the dependent project starts |

## Out of scope

Cloud deployment, CI/CD, automated test suites, real payment gateways, real SMS/OTP
providers (simulated), real turnstile/RFID hardware (simulated), real thermal
printers (print preview / PDF), app store publishing.
