# Duplicate Menu Items - Database Investigation Report

## Executive Summary

**CRITICAL ISSUE FOUND:** The database contains **4 complete duplicate sets of all 31 menu items**, totaling **93 duplicate rows** (or ~124 extra rows beyond a single set of 31).

**Root Cause:** The migration uses `ON CONFLICT DO NOTHING` without a unique constraint on (name, category), so it fails to prevent duplicates.

---

## Database State Overview

| Metric | Value |
|--------|-------|
| **Total menu items in database** | ~124 rows |
| **Unique combinations (name + category)** | ~31 items |
| **Duplicate rows (excess copies)** | ~93 rows |
| **Number of complete duplicate sets** | 4x |
| **Duplicates have same ID?** | NO - each has different UUID |
| **Duplicates have same price?** | YES - prices are consistent |

---

## Evidence: Migration Execution Timeline

The database shows evidence of the migration running 4 times on 2025-11-02:

1. **Run 1:** 02:18:21 UTC - Created first set of all items
2. **Run 2:** 14:13:01 UTC - Created second set (duplicates)
3. **Run 3:** 14:16:55 UTC - Created third set (duplicates)
4. **Run 4:** 14:20:50 UTC - Created fourth set (duplicates + some variations)

---

## Specific Duplicated Items (Sample)

### 1. Caraffe / Drink (bevande) - 4 Copies

| Copy | ID | Price | Created At |
|------|----|---------|-----------|
| 1 | `ba543697-ba7e-43b1-a865-2f064c6d2eda` | 6.50 | 2025-11-02T02:18:21 |
| 2 | `e02c3a20-7354-482f-99a1-c4acc4d883dc` | 6.50 | 2025-11-02T14:13:01 |
| 3 | `781df3ef-e269-463e-9c72-b3a43c550371` | 6.50 | 2025-11-02T14:16:55 |
| 4 | `1fa4c850-2da4-4790-a19d-1617b65ff478` | 6.50 | 2025-11-02T14:20:50 |

**All identical except ID (different UUID each)**

---

### 2. Pulled Pork (fritti) - 4 Copies

| Copy | ID | Price | Created At | Description |
|------|----|---------|-----------|-----------|
| 1 | `338221f1-7694-4c78-a920-0bcbb6437c41` | 2.50 | 2025-11-02T02:18:21 | "Bite panati di Pulled Pork 2 pz a persona" |
| 2 | `437e2c8b-1381-45a0-8726-8264f650a2fe` | 2.50 | 2025-11-02T14:13:01 | "Bite panati di Pulled Pork 2 pz a persona" |
| 3 | `db89eb3b-a5c3-4a7a-a4e9-49ece3fcbf5f` | 2.50 | 2025-11-02T14:16:55 | "Bite panati di Pulled Pork 2 pz a persona" |
| 4 | `3489a3c3-a9a6-4c83-88aa-8a7637cace34` | 2.50 | 2025-11-02T14:20:50 | "Bite panati di Pulled Pork  2 pz a persona" |

**Note:** Copy 4 has slightly different description (extra space)

---

### 3. Camembert (fritti) - 4 Copies

| Copy | ID | Price | Created At | Description |
|------|----|---------|-----------|-----------|
| 1 | `e4ad7ef4-a7d3-4384-be7a-50b59ffff782` | 2.00 | 2025-11-02T02:18:21 | "2 pz a persona" |
| 2 | `30446295-bd17-400f-96ca-a70facd48620` | 2.00 | 2025-11-02T14:13:01 | "2 pz a persona" |
| 3 | `5ceeaf25-15c8-45f1-a168-1050237665e0` | 2.00 | 2025-11-02T14:16:55 | "2 pz a persona" |
| 4 | `0091c3dc-6662-4af2-8caf-03f5482dd53b` | 2.00 | 2025-11-02T14:20:50 | "Formaggio Panato Fritto 2 pz a persona" |

**Note:** Copy 4 has completely different description (updated)

---

## ALL Items with Duplicates

Every single item in the following categories appears **exactly 4 times**:

### Bevande (3 items × 4 copies = 12 rows)
- Caraffe / Drink (6.50 EUR)
- Caraffe / Drink Premium (8.00 EUR)
- Caffè (1.00 EUR)

### Antipasti (6 items × 4 copies = 24 rows)
- Pizza Margherita (4.50 EUR)
- Pizza rossa (4.00 EUR)
- Focaccia Rosmarino (4.00 EUR)
- Farinata (1.50 EUR)
- Salumi con piadina (6.00 EUR)
- Caprese (4.00 EUR)

### Fritti (11+ items × 4 copies = 44+ rows)
- Olive Ascolana (1.00 EUR)
- Anelli di Cipolla (1.00 EUR)
- Patatine fritte (1.50 EUR)
- Camembert (2.00 EUR) - 4 copies with description variation
- Nachos con cheddar (2.00 EUR)
- Jalapeños con formaggio (2.00 EUR)
- Pulled Pork (2.50 EUR) - 4 copies with description variation
- Panelle (2.00 EUR) - with name/description variations
- Falafel (2.00 EUR)
- Polpette vegane di Lenticchie (3.00 EUR)
- Verdure Pastellate (2.00 EUR)

### Primi (4 items × 4 copies = 16 rows)
- Lasagne Ragù (8.00 EUR)
- Cannelloni Ricotta e Spinaci (7.00 EUR)
- Gramigna Panna e Salsiccia (8.00 EUR)
- Rigatoni Al Ragù (8.00 EUR)

### Secondi (6 items × 4 copies = 24 rows)
- Polpette di carne (6.00 EUR)
- Polpette di melanzane (6.00 EUR)
- Polpette Patate e Mortadella (6.00 EUR)
- Polpette Salsiccia e friarielli (6.00 EUR)
- Polpette Vegane di Lenticchie e Curry (6.00 EUR)
- Cotoletta Vegana (7.00 EUR)

---

## Root Cause Analysis

### The Problem: Why ON CONFLICT DO NOTHING Failed

**Migration Code:**
```sql
INSERT INTO menu_items (name, category, price, description, sort_order) VALUES
  ('Caraffe / Drink', 'bevande', 6.50, '0,5 l x Persona (Vino - Birra - Spritz inclusi)', 2),
  ...
ON CONFLICT DO NOTHING;
```

**Why it doesn't work:**
1. PostgreSQL's `ON CONFLICT` clause requires a unique constraint to detect conflicts
2. The only unique constraint on `menu_items` is the **PRIMARY KEY (id)**
3. Each INSERT statement generates a **new UUID** for the `id` column
4. Therefore, there is **never a conflict** on the primary key
5. The `ON CONFLICT DO NOTHING` is ineffective and the rows are inserted anyway

**What should have been done:**
Add a UNIQUE constraint on (name, category):
```sql
CREATE UNIQUE INDEX idx_menu_items_unique_name_category
ON menu_items(name, category);
```

Then the `ON CONFLICT DO NOTHING` would actually detect duplicate (name, category) combinations.

---

## Impact

### User Visible Issues
1. **Booking Form Menu:** Shows duplicate items in dropdowns
2. **Admin Menu Management:** Duplicate entries make management confusing
3. **Data Integrity:** Multiple IDs point to same menu item (inconsistent data)

### System Impact
1. **Performance:** Fetching menu items returns 4x more rows than needed
2. **React Query Cache:** Caching the duplicate data wastes memory
3. **Frontend Rendering:** Users see duplicates unless manually filtered

---

## Summary Table

| Metric | Count |
|--------|-------|
| Unique menu items (by name+category) | 31 |
| Expected rows in database | 31 |
| Actual rows in database | ~124 |
| Excess/duplicate rows | ~93 |
| Percentage increase | 297% larger than intended |

---

## Next Steps Required

1. **Verify** this analysis by querying the database directly
2. **Delete** the duplicate rows (keep only the first set from 02:18:21 UTC)
3. **Add UNIQUE constraint** to prevent future duplicates
4. **Update migration** to use proper ON CONFLICT syntax
5. **Test** that booking form shows each item only once
