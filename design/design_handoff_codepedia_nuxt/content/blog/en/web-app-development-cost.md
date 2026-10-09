---
title: Web app development cost: why quotes vary so much
description: What goes into the price of a web app, how it's estimated by module, what it costs after launch, and how to avoid paying for features you won't use.
slug: web-app-development-cost
lang: en
alt: cat-costa-o-aplicatie-web
category: COST
keyword: web app development cost
date: 2027-01-06
updated: 2027-01-06
author: CODEPEDIA team
service: aplicatie-web
case: startica-app
readingTime: 6
---

> **In short.** A web app starts at €2,000 for a simple tool with one role, and at €5,000 for an operations app with roles, reports and integrations. Price is calculated per module, not per screen. The biggest cost driver is business rules: who may do what, and what happens when something goes wrong.

## Why there's no fixed price

"How much does an app cost?" is like "how much does a house cost?". It depends on the rooms, who lives there and what utilities it needs. In an app, rooms are modules, residents are roles, and utilities are integrations.

## How we estimate, by module

| Module | What it does | Complexity |
|---|---|---|
| Accounts and roles | Login, permissions, invites | Low – medium |
| Lists and records | Customers, products, orders, with filters | Low each |
| Status workflows | Order → in progress → delivered, with rules | Medium |
| Online payments | Cards, confirmations, refunds | Medium |
| Reports | Totals, margins, Excel/PDF export | Medium |
| Notifications | Email, SMS, messaging | Low |
| External integrations | Accounting, couriers, APIs | Medium – high |
| Offline / mobile mode | Working without internet, sync | High |

The modules add up to the estimate. The [Startica](/en/projects/startica-app) kindergarten app had 7: children, groups, attendance, payments, expenses, SMS and an accounting report.

## Hidden cost drivers

### Business rules
"Sellers can't see the purchase price." "A paid order can't be deleted." Each rule is easy to say, but has to be built, tested and checked on every screen.

### Failure cases
What if the payment succeeds and the connection drops? What if two people edit the same order? Cheap apps only handle the happy path.

### Data migration
Moving years of spreadsheet data, with duplicates and mixed formats, can take a full week.

## Running costs after launch

| Cost | Amount |
|---|---|
| Hosting and database | €0–50 / month, in your account |
| Maintenance (updates, backups, monitoring) | optional, monthly |
| New features | in stages, on request |

## How to pay only for what you use

- **Start with the module that hurts most.** The rest comes once the app is in use.
- **Postpone complex reports.** In the first months, an Excel export is usually enough.
- **Use existing services** for email, SMS and payments instead of building them.
- **Ask for a per-module estimate**, not a lump sum, so you can cut from the list.

See also [when to replace Excel with an app](/en/blog/replace-excel-with-web-app) and [how much a website costs](/en/blog/how-much-does-a-website-cost).

## Frequently asked questions

### How long does it take to build a web app?
Between 3 and 12 weeks for most business apps. We ship in stages, with a test version every two weeks.

### Is the price fixed?
Yes, for the module list agreed in the proposal. New features that come up along the way are estimated separately, before we build them.

### Who owns the code?
You do. Code, database and hosting live in your accounts from day one.

---

Want a per-module estimate for your app? [Tell us what it needs to do](/en/contact?service=web-app) and get the list within 24 hours.
