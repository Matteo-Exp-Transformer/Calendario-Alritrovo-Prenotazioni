# 🤖 Integrazione NotebookLM con Agenti

**Obiettivo**: Permettere agli agenti (Claude Code, Cursor, ecc.) di interrogare NotebookLM o i suoi documenti.

---

## ⚠️ Limitazioni Attuali

**NotebookLM NON ha:**
- ❌ API pubblica per interrogazione diretta
- ❌ Integrazione MCP (Model Context Protocol) nativa
- ❌ API REST per agenti esterni

**NotebookLM Enterprise HA:**
- ✅ API per creazione/gestione notebook
- ⚠️ Richiede Google Cloud Enterprise account
- ⚠️ API limitata a gestione, non interrogazione diretta

---

## 🎯 Soluzioni Pratiche (3 Opzioni)

### 🥇 **OPZIONE 1: Documenti Accessibili agli Agenti** (Consigliata)

**Idea**: Gli agenti leggono direttamente i file che NotebookLM analizza.

#### Come Funziona:

1. **NotebookLM** analizza i documenti del progetto
2. **Gli stessi documenti** sono nella cartella del progetto
3. **Gli agenti** li leggono direttamente tramite file system

#### Vantaggi:
- ✅ Funziona subito (niente setup)
- ✅ Agenti hanno già accesso ai file
- ✅ Sempre sincronizzati
- ✅ Gratuito

#### Configurazione:

**Step 1**: Crea cartella documenti centralizzata

```bash
# Crea cartella per documenti del progetto
mkdir -p docs/notebooklm-sources
```

**Step 2**: Copia file principali (stessi che carichi su NotebookLM)

```bash
# Script PowerShell per export
# export-for-notebooklm.ps1

$sourceFiles = @(
    "README_ALRITROVO.md",
    "Knowledge\PRD.md",
    "Knowledge\Report agenti\PROJECT_STATUS_CURRENT.md",
    "Knowledge\Report agenti\PROJECT_COMPLETION_FINAL.md",
    "supabase\SETUP_DATABASE.md",
    "Knowledge\Report agenti\ARCHITECTURE_CORRECT.md"
)

$destDir = "docs\notebooklm-sources"
New-Item -ItemType Directory -Force -Path $destDir

foreach ($file in $sourceFiles) {
    if (Test-Path $file) {
        Copy-Item $file -Destination $destDir -Force
        Write-Host "✅ Copiato: $file"
    }
}
```

**Step 3**: Aggiungi al CLAUDE.md riferimento alla cartella

```markdown
## Documentazione Progetto

La documentazione completa è in `docs/notebooklm-sources/`:
- README_ALRITROVO.md - Overview progetto
- PRD.md - Product Requirements
- PROJECT_STATUS_CURRENT.md - Stato attuale
- ARCHITECTURE_CORRECT.md - Architettura RLS
- SETUP_DATABASE.md - Setup database

Quando hai bisogno di informazioni sul progetto, leggi questi file.
```

**Risultato**: Gli agenti possono leggere i file direttamente e "simulare" NotebookLM!

---

### 🥈 **OPZIONE 2: MCP Server Personalizzato** (Avanzata)

**Idea**: Crea un server MCP che legge documenti e risponde come NotebookLM.

#### Come Funziona:

1. Crei un server MCP Node.js
2. Il server legge documenti dalla cartella
3. Usa AI embedding/semantic search per trovare risposte
4. Gli agenti chiamano il server MCP come tool

#### Vantaggi:
- ✅ Interfaccia simile a NotebookLM
- ✅ Semantic search intelligente
- ✅ Risposte contestualizzate

#### Svantaggi:
- ⚠️ Richiede sviluppo
- ⚠️ Richiede embeddings model (OpenAI, Cohere, etc.)
- ⚠️ Più complesso da mantenere

#### Esempio Struttura:

```typescript
// mcp-notebooklm-server/index.ts
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { readFile } from 'fs/promises';
import { glob } from 'glob';

const server = new Server({
  name: 'notebooklm-mcp',
  version: '1.0.0',
});

// Tool: query_project_docs
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [{
    name: 'query_project_docs',
    description: 'Query project documentation like NotebookLM',
    inputSchema: {
      type: 'object',
      properties: {
        question: {
          type: 'string',
          description: 'Question about the project'
        }
      }
    }
  }]
}));

// Implementazione semantic search...
```

**Nota**: Questa opzione richiede sviluppo significativo. Opzione 1 è molto più semplice.

---

### 🥉 **OPZIONE 3: Export Manuale da NotebookLM** (Workaround)

**Idea**: Esporti periodicamente risposte da NotebookLM e le salvi in file.

#### Come Funziona:

1. Fai domande a NotebookLM
2. Copi le risposte in file markdown
3. Gli agenti leggono questi file

#### Vantaggi:
- ✅ Sfrutta intelligenza di NotebookLM
- ✅ Nessuna configurazione tecnica

#### Svantaggi:
- ⚠️ Manuale, richiede tempo
- ⚠️ Non aggiornato in tempo reale
- ⚠️ Limitato alle domande che fai

#### Struttura:

```
docs/notebooklm-answers/
├── faq-project-overview.md
├── faq-architecture.md
├── faq-troubleshooting.md
└── faq-debugging.md
```

**Esempio contenuto**:
```markdown
# FAQ: Project Overview

## Q: Qual è lo stato attuale del progetto?
A: Il progetto è al 98% completato. Fasi 1-8 completate...

## Q: Come funziona il sistema di prenotazioni?
A: Il flusso è: Form pubblico → Pending → Accept/Reject → Calendar...
```

---

## 🚀 Implementazione Consigliata: OPZIONE 1

### Setup Completo

**Step 1**: Crea script export

```powershell
# scripts/export-docs-for-agents.ps1
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$destDir = Join-Path $projectRoot "docs\agent-knowledge"

New-Item -ItemType Directory -Force -Path $destDir | Out-Null

$docs = @(
    @{ src = "README_ALRITROVO.md"; name = "README.md" },
    @{ src = "Knowledge\PRD.md"; name = "PRD.md" },
    @{ src = "Knowledge\Report agenti\PROJECT_STATUS_CURRENT.md"; name = "PROJECT_STATUS.md" },
    @{ src = "Knowledge\Report agenti\PROJECT_COMPLETION_FINAL.md"; name = "COMPLETION_REPORT.md" },
    @{ src = "supabase\SETUP_DATABASE.md"; name = "DATABASE_SETUP.md" },
    @{ src = "Knowledge\Report agenti\ARCHITECTURE_CORRECT.md"; name = "ARCHITECTURE.md" },
    @{ src = "Knowledge\Report agenti\RLS_FIX_COMPLETE_FINAL.md"; name = "RLS_FIX.md" },
    @{ src = ".claude\skills\README.md"; name = "SKILLS.md" }
)

foreach ($doc in $docs) {
    $srcPath = Join-Path $projectRoot $doc.src
    $destPath = Join-Path $destDir $doc.name
    
    if (Test-Path $srcPath) {
        Copy-Item $srcPath $destPath -Force
        Write-Host "✅ $($doc.name)"
    } else {
        Write-Host "⚠️  Not found: $($doc.src)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "✅ Documenti esportati in: $destDir" -ForegroundColor Green
```

**Step 2**: Esegui script

```powershell
.\scripts\export-docs-for-agents.ps1
```

**Step 3**: Aggiorna CLAUDE.md

```markdown
## 📚 Documentazione Progetto

La documentazione completa del progetto è disponibile in `docs/agent-knowledge/`:

**File Principali:**
- `README.md` - Overview progetto e quick start
- `PRD.md` - Product Requirements Document completo
- `PROJECT_STATUS.md` - Stato attuale (27 Gennaio 2025)
- `COMPLETION_REPORT.md` - Report completamento dettagliato
- `ARCHITECTURE.md` - Architettura RLS e client Supabase
- `DATABASE_SETUP.md` - Setup database e schema
- `RLS_FIX.md` - Fix RLS policies e troubleshooting
- `SKILLS.md` - Superpowers skills disponibili

**Quando hai bisogno di informazioni sul progetto:**
1. Leggi i file in `docs/agent-knowledge/`
2. Cerca informazioni specifiche nei file rilevanti
3. Cita il file di riferimento quando rispondi

**Esempi:**
- "Come funziona RLS?" → Leggi `ARCHITECTURE.md`
- "Qual è lo stato del progetto?" → Leggi `PROJECT_STATUS.md`
- "Come setup database?" → Leggi `DATABASE_SETUP.md`
```

**Step 4**: Aggiorna automaticamente (opzionale)

Aggiungi al `package.json`:

```json
{
  "scripts": {
    "export:docs": "powershell -File scripts/export-docs-for-agents.ps1"
  }
}
```

Esegui dopo ogni aggiornamento documentazione:
```bash
npm run export:docs
```

---

## 💡 Workflow Completo

### Per Te (Umano):

1. **Carica documenti su NotebookLM** → Per ricerca rapida e brainstorming
2. **Mantieni file in progetto** → Per accesso agenti
3. **Esegui export script** → Dopo aggiornamenti importanti

### Per Agenti:

1. **Leggono `CLAUDE.md`** → Vedono riferimento a `docs/agent-knowledge/`
2. **Leggono file rilevanti** → Quando hanno bisogno di info
3. **Cercano risposte** → Usando grep, read_file, codebase_search

### Per NotebookLM:

1. **Carichi documenti** → Per analisi e riassunti
2. **Interroghi** → Quando vuoi insight veloci
3. **Esporti risposte** → Se servono agli agenti (opzione 3)

---

## 🔄 Sincronizzazione

**Regola d'oro**: I file in `docs/agent-knowledge/` devono essere gli stessi che carichi su NotebookLM.

**Script di verifica** (opzionale):

```powershell
# scripts/verify-docs-sync.ps1
$notebooklmFiles = @(/* lista file caricati su NotebookLM */)
$agentFiles = Get-ChildItem "docs\agent-knowledge"

# Verifica che tutti i file siano presenti...
```

---

## 📊 Confronto Opzioni

| Opzione | Setup | Manutenzione | Funzionalità | Costo |
|---------|-------|--------------|--------------|-------|
| **1. File Accessibili** | ✅ Facile | ✅ Automatica | ⭐⭐⭐ | Gratis |
| **2. MCP Server** | ⚠️ Complesso | ⚠️ Manuale | ⭐⭐⭐⭐⭐ | $ (embeddings) |
| **3. Export Manuale** | ✅ Facile | ⚠️ Manuale | ⭐⭐ | Gratis |

**Raccomandazione**: Inizia con Opzione 1, passa a Opzione 2 solo se necessario.

---

## 🎯 Prossimi Passi

1. ✅ Crea script export (`scripts/export-docs-for-agents.ps1`)
2. ✅ Esegui export
3. ✅ Aggiorna `CLAUDE.md` con riferimento a `docs/agent-knowledge/`
4. ✅ Testa che gli agenti leggano i file correttamente
5. ⏳ (Opzionale) Sviluppa MCP server se serve semantic search avanzata

---

## 📝 Note Finali

**NotebookLM è utile per:**
- ✅ Ricerca rapida (interfaccia web)
- ✅ Brainstorming e domande esplorative
- ✅ Onboarding rapido

**Gli agenti accedono direttamente ai file per:**
- ✅ Lettura durante sviluppo
- ✅ Riferimenti durante coding
- ✅ Troubleshooting guidato

**Risultato**: NotebookLM e agenti lavorano insieme, ognuno con il proprio scopo! 🚀

---

**Data creazione**: 27 Gennaio 2025

