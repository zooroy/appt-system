# Timezone Conventions

This project serves Taiwan users (UTC+8). All times are stored in UTC in the database
and converted at the API/client layer. Do not rely on server timezone settings.

---

## Rules by data type

### `DateTime` (Prisma default) → PostgreSQL `TIMESTAMPTZ`

**Rule: Always UTC. No manual conversion needed.**

PostgreSQL stores `TIMESTAMPTZ` in UTC regardless of the session timezone.
JavaScript `Date` objects are timezone-aware. Pass them directly; let the runtime handle it.

```typescript
// ✅ Correct — let JS Date and TIMESTAMPTZ handle it
await prisma.booking.create({
  data: { startTime: new Date(isoString) }
});

// ✅ Correct — display in Taiwan time on the client
start.toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit", hour12: false })

// ❌ Wrong — manually offsetting a timestamp introduces double-conversion bugs
new Date(date.getTime() + 8 * 60 * 60_000)
```

### `DateTime @db.Date` → PostgreSQL `DATE`

**Rule: Always use an explicit `"YYYY-MM-DD"` string. Never use timestamp ranges.**

`DATE` has no timezone. When PostgreSQL casts a `TIMESTAMPTZ` to `DATE` for comparison,
it uses the session timezone — which differs between local (Asia/Taipei) and production (UTC).
This causes ±1 day bugs that are hard to reproduce.

```typescript
// ✅ Correct — derive the Taiwan date string and compare exactly
const taiwanDateStr = getTaiwanDateStr(date); // see helper below
await prisma.holiday.findFirst({
  where: { date: new Date(`${taiwanDateStr}T00:00:00.000Z`) },
});

// ❌ Wrong — timestamp range against a DATE column
await prisma.holiday.findFirst({
  where: { date: { gte: startOfDay, lte: endOfDay } },
});
```

---

## Writing date strings

### Receiving a date string from the client (e.g., `"2026-04-23"` from `<input type="date">`)

```typescript
// ✅ Parse as Taiwan midnight
const date = new Date(`${dateParam}T00:00:00+08:00`);
// → 2026-04-22T16:00:00.000Z  (correct UTC representation of Taiwan midnight)

// ❌ Wrong — parsed as UTC midnight, 8 hours off
const date = new Date(dateParam);
// → 2026-04-23T00:00:00.000Z
```

### Sending a date string from the client

```typescript
// ✅ Use local date parts — avoids UTC shift
const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

// ❌ Wrong — toISOString() converts to UTC first, shifts date by -8h
const dateStr = d.toISOString().split("T")[0];
```

### Computing "start of day" and "end of day" in UTC for a Taiwan date

```typescript
// ✅ Arithmetic from Taiwan midnight — server-timezone-independent
const startOfDay = new Date(`${dateStr}T00:00:00+08:00`);
const endOfDay   = new Date(startOfDay.getTime() + 24 * 60 * 60_000 - 1);
```

---

## Helper: extract Taiwan date string from a Taiwan-midnight Date

When `date` is already a Taiwan-midnight value (e.g., created with `+08:00`):

```typescript
// date = 2026-04-22T16:00:00Z (Taiwan midnight 4/23)
// +8h → 2026-04-23T00:00:00Z → split → "2026-04-23"
const taiwanDateStr = new Date(date.getTime() + 8 * 60 * 60_000)
  .toISOString()
  .split("T")[0];
```

---

## Checklist for new code touching dates

- [ ] Does the code use `setHours()` or `toISOString()` for date construction? → Replace with explicit `+08:00` or local `.getDate()` parts
- [ ] Is the Prisma field `@db.Date`? → Use exact string comparison, not timestamp ranges
- [ ] Is the date coming from a client `<input type="date">`? → Append `T00:00:00+08:00` on the server before passing to Prisma
- [ ] Is the date being sent from the client? → Use `getFullYear/getMonth/getDate`, not `toISOString()`
- [ ] Are you calling `new Date(dateString)` where `dateString` is `"YYYY-MM-DD"`? → This creates UTC midnight, not Taiwan midnight — add `+08:00`
