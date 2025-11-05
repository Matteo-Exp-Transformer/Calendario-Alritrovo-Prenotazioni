# 📁 Organizzazione Progetto - Guida

Questo documento descrive la struttura organizzativa del progetto **Al Ritrovo Booking System** e come è stato riorganizzato per migliorare la navigabilità e la manutenibilità.

## 🎯 Obiettivi Riorganizzazione

1. **Pulizia Root Directory**: Rimuovere file temporanei e report dalla root
2. **Organizzazione Documentazione**: Centralizzare documentazione in `docs/`
3. **Organizzazione Scripts**: Categorizzare scripts per tipo di utilizzo
4. **Navigabilità**: Struttura intuitiva per umani e agenti AI
5. **Manutenibilità**: Separazione chiara tra attuale e storico

## 📊 Struttura Prima della Riorganizzazione

```
Calendarbackup/
├── [Molti file .md nella root]
├── FINAL_VERIFICATION_COMPLETE_REPORT.md
├── FINAL_MENU_VERIFICATION_REPORT.md
├── DESIRED_TIME_FLOW_ANALYSIS.md
├── VERIFICATION_SUMMARY.txt
├── SCREENSHOTS_MANIFEST.txt
├── setup-env.js
├── generate-pdf-env.js
├── query_menu.js
├── query_menu_check.sql
└── scripts/
    └── remove-acqua.*
```

## ✅ Struttura Dopo la Riorganizzazione

```
Calendarbackup/
├── README.md                    ⭐ NUOVO - Overview progetto
├── docs/
│   ├── README.md                ⭐ NUOVO - Indice documentazione
│   ├── agent-knowledge/         ✅ Mantenuto - Documentazione principale
│   ├── reports/                 ⭐ NUOVO - Report temporanei
│   │   ├── FINAL_VERIFICATION_COMPLETE_REPORT.md
│   │   ├── FINAL_MENU_VERIFICATION_REPORT.md
│   │   ├── DESIRED_TIME_FLOW_ANALYSIS.md
│   │   ├── VERIFICATION_SUMMARY.txt
│   │   └── SCREENSHOTS_MANIFEST.txt
│   └── development/            ⭐ NUOVO - Guide sviluppo
│       └── PROJECT_ORGANIZATION.md (questo file)
├── scripts/
│   ├── setup/                   ⭐ NUOVO
│   │   └── setup-env.js
│   ├── utility/                 ⭐ NUOVO
│   │   ├── query_menu.js
│   │   ├── generate-pdf-env.js
│   │   └── query_menu_check.sql
│   └── maintenance/            ⭐ NUOVO
│       ├── remove-acqua.js
│       └── remove-acqua.mjs
└── .cursor/
    └── Skills/                 ⭐ NUOVO
        └── PROJECT_NAVIGATION.md
```

## 📦 Movimenti File Effettuati

### File Report → `docs/reports/`
- ✅ `FINAL_VERIFICATION_COMPLETE_REPORT.md`
- ✅ `FINAL_MENU_VERIFICATION_REPORT.md`
- ✅ `DESIRED_TIME_FLOW_ANALYSIS.md`
- ✅ `VERIFICATION_SUMMARY.txt`
- ✅ `SCREENSHOTS_MANIFEST.txt`

### Scripts → `scripts/{category}/`
- ✅ `setup-env.js` → `scripts/setup/`
- ✅ `generate-pdf-env.js` → `scripts/utility/`
- ✅ `query_menu.js` → `scripts/utility/`
- ✅ `query_menu_check.sql` → `scripts/utility/`
- ✅ `scripts/remove-acqua.js` → `scripts/maintenance/`
- ✅ `scripts/remove-acqua.mjs` → `scripts/maintenance/`

## 📝 File Creati

### Documentazione
1. **`README.md`** (root)
   - Overview progetto
   - Quick start guide
   - Link a documentazione
   - Setup instructions

2. **`docs/README.md`**
   - Indice completo documentazione
   - Quick reference guide
   - Navigazione per categoria

3. **`docs/development/PROJECT_ORGANIZATION.md`** (questo file)
   - Guida struttura progetto
   - Storia riorganizzazione
   - Best practices

### Skills
4. **`.cursor/Skills/PROJECT_NAVIGATION.md`**
   - Skill per orientarsi nel progetto
   - Mappa completa file e cartelle
   - Quick navigation guide

## 🗂️ Categorizzazione Cartelle

### `docs/`
**Scopo**: Documentazione organizzata per tipo

- `agent-knowledge/` - Documentazione per agenti AI (fonte principale)
- `reports/` - Report temporanei e verifiche
- `development/` - Guide di sviluppo e best practices

### `scripts/`
**Scopo**: Scripts organizzati per categoria

- `setup/` - Scripts di setup iniziale
- `utility/` - Scripts utility e query
- `maintenance/` - Scripts di manutenzione

### `.cursor/Skills/`
**Scopo**: Skills per navigazione progetto

- `PROJECT_NAVIGATION.md` - Skill mappatura progetto

## 🎯 Convenzioni Adottate

### Naming
- File markdown: `UPPERCASE.md` per documentazione principale
- File scripts: `kebab-case.js` per scripts
- Cartelle: `kebab-case` per cartelle

### Organizzazione
- **Feature-based** per codice (`src/features/{feature}/`)
- **Type-based** per documentazione (`docs/{type}/`)
- **Category-based** per scripts (`scripts/{category}/`)

### Separazione
- **Attuale**: `docs/agent-knowledge/` (documentazione attuale)
- **Storico**: `Knowledge/` (knowledge base storica)
- **Report**: `docs/reports/` (report temporanei)

## 📚 Come Usare la Nuova Struttura

### Per Sviluppatori
1. Codice sorgente: `src/`
2. Documentazione: `docs/agent-knowledge/`
3. Scripts: `scripts/{category}/`
4. Test: `e2e/` e `tests/`

### Per Agenti AI
1. Skill navigazione: `.cursor/Skills/PROJECT_NAVIGATION.md`
2. Documentazione: `docs/agent-knowledge/`
3. Stato progetto: `docs/agent-knowledge/PROJECT_STATUS.md`
4. Architettura: `docs/agent-knowledge/ARCHITECTURE.md`

### Per Report e Verifiche
1. Report completati: `docs/reports/`
2. Screenshot test: `e2e/screenshots/`
3. Report test: `docs/agent-knowledge/TESTING_REPORT.md`

## ✅ Benefici Riorganizzazione

1. **Root Directory Pulita**: Solo file di configurazione essenziali
2. **Navigabilità Migliorata**: Struttura intuitiva e categorizzata
3. **Separazione Chiarita**: Attuale vs storico vs temporaneo
4. **Manutenibilità**: Facile trovare e organizzare nuovi file
5. **Documentazione Centralizzata**: Un solo punto di riferimento

## 🔄 Mantenimento

### Quando Aggiungere File

**Nuovo Componente:**
- Feature: `src/features/{feature}/components/`
- Condiviso: `src/components/`

**Nuovo Script:**
- Setup: `scripts/setup/`
- Utility: `scripts/utility/`
- Maintenance: `scripts/maintenance/`

**Nuova Documentazione:**
- Per agenti: `docs/agent-knowledge/`
- Report: `docs/reports/`
- Guide: `docs/development/`

### Quando Aggiornare

- **`PROJECT_STATUS.md`**: Quando stato progetto cambia
- **`PROJECT_NAVIGATION.md`**: Quando struttura cartelle cambia
- **`README.md`**: Quando setup o struttura principale cambia
- **`docs/README.md`**: Quando documentazione viene aggiunta/rimossa

## 📝 Note Importanti

- **Non modificare**: `superpowers-main/` (skills library esterna)
- **Mantenere**: `Knowledge/` come archivio storico
- **Aggiornare**: `docs/agent-knowledge/` come documentazione attuale
- **Archiviare**: File obsoleti in `Knowledge/ARCHIVE/`

## 🎯 Prossimi Passi

1. ✅ Riorganizzazione completata
2. ⏳ Verifica che tutti i link funzionino
3. ⏳ Aggiorna riferimenti nei file spostati (se necessario)
4. ⏳ Documenta pattern di organizzazione per futuro sviluppo

---

**Data Riorganizzazione**: Gennaio 2025
**Status**: ✅ Completato








