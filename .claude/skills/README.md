# Superpowers Skills - Calendario Al Ritrovo

**Migrazione completata il:** $(Get-Date -Format "yyyy-MM-dd")

## 🚀 Cosa sono le Superpowers Skills?

Le **Superpowers Skills** sono una libreria completa di metodologie e processi strutturati per lo sviluppo software. Forniscono workflow obbligatori e comprovati per:

- ✅ **Test-Driven Development (TDD)** - Scrivere test prima, sempre
- 🐛 **Debugging Sistematico** - 4 fasi obbligatorie prima di proporre fix
- 📋 **Planning e Brainstorming** - Workflow strutturati per design e implementazione
- ✅ **Verifica Prima di Completare** - Evidenze prima di affermazioni

## 📚 Skills Principali per Test e Debug

### Per il Debugging Sistematico:

1. **`systematic-debugging/`** ⭐ USA QUESTO
   - 4 fasi obbligatorie: Root Cause → Pattern → Hypothesis → Implementation
   - Nessun fix senza root cause investigation
   - Obbligatorio per ogni bug, test failure, o comportamento inaspettato

2. **`root-cause-tracing/`**
   - Tracciamento a ritroso nel call stack
   - Trova il trigger originale, non solo il sintomo
   - Script `find-polluter.sh` incluso

3. **`verification-before-completion/`**
   - Verifica prima di dichiarare "completato"
   - Nessuna affermazione senza evidenze
   - Esegui comandi e leggi output

### Per Migliorare i Test:

4. **`test-driven-development/`** ⭐ USA QUESTO
   - RED-GREEN-REFACTOR obbligatorio
   - Test deve fallire prima di passare
   - Nessun codice production senza test che falliva prima

5. **`condition-based-waiting/`**
   - Pattern per test asincroni affidabili
   - Sostituisce timeout arbitrari con polling condizionale
   - Esempio TypeScript incluso

6. **`testing-anti-patterns/`**
   - Errori comuni da evitare nei test
   - Pattern negativi e come evitarli

## 🔄 Workflow Completo di Sviluppo

### Brainstorming → Planning → Execution

1. **`brainstorming/`**
   - Dialogo collaborativo per raffinare idee
   - Una domanda alla volta, design incrementale
   - Genera documentazione design

2. **`writing-plans/`**
   - Crea piani di implementazione dettagliati
   - Task bite-sized (2-5 minuti ciascuno)
   - Path esatti, codice completo, comandi di verifica

3. **`executing-plans/`** o **`subagent-driven-development/`**
   - Esegue piani in batch con checkpoint
   - O usa subagent per ogni task con code review

### Git e Branch Management

- **`using-git-worktrees/`** - Workspace isolati per feature
- **`finishing-a-development-branch/`** - Workflow per completare lavoro

## 📋 Skills Disponibili (20 totali)

```
brainstorming/                    - Design collaborativo
condition-based-waiting/          - Test asincroni affidabili
defense-in-depth/                 - Validazione multi-layer
dispatching-parallel-agents/      - Workflow con agenti paralleli
executing-plans/                  - Esecuzione batch con checkpoint
finishing-a-development-branch/   - Completamento branch/PR
receiving-code-review/            - Gestire feedback review
requesting-code-review/           - Richiedere code review
root-cause-tracing/               - Tracciamento bug a ritroso
sharing-skills/                   - Come condividere skills
subagent-driven-development/      - Sviluppo con subagent
systematic-debugging/             - Debugging in 4 fasi ⭐
test-driven-development/          - TDD obbligatorio ⭐
testing-anti-patterns/            - Errori comuni da evitare
testing-skills-with-subagents/    - Testare skills con subagent
using-git-worktrees/              - Workspace isolati git
using-superpowers/                - Introduzione al sistema ⭐
verification-before-completion/   - Verifica prima di completare ⭐
writing-plans/                    - Creare piani implementazione
writing-skills/                   - Come creare nuove skills
```

## 🎯 Come Usare le Skills

### Per Claude Code:

Le skills sono automaticamente disponibili. Claude le carica quando rileva task rilevanti.

**Comandi disponibili** (se installato come plugin):
- `/superpowers:brainstorm` - Brainstorming design
- `/superpowers:write-plan` - Crea piano implementazione
- `/superpowers:execute-plan` - Esegui piano

### Per Cursor:

Le skills sono in `.cursor/Skills/` e vengono caricate automaticamente.

## ⚠️ Regole Importanti

### 1. Skills Obbligatorie

Se una skill esiste per il tuo task, **DEVI usarla**. Non è opzionale.

Dalla skill `using-superpowers`:
> "If you think there is even a 1% chance a skill might apply to what you are doing, you ABSOLUTELY MUST read the skill."

### 2. Test-Driven Development

**SEMPRE** scrivi il test prima:
- RED: Scrivi test, fallisce
- GREEN: Codice minimale per farlo passare
- REFACTOR: Pulisci mantenendo test verde

Nessuna eccezione senza permesso esplicito.

### 3. Debugging Sistematico

**SEMPRE** trova root cause prima di proporre fix:
1. Root Cause Investigation
2. Pattern Analysis
3. Hypothesis Testing
4. Implementation

Nessun "quick fix" senza investigazione.

### 4. Verifica Prima di Completare

**SEMPRE** esegui comandi di verifica prima di dichiarare completato:
- Test passing? → Esegui `npm test`, leggi output
- Build success? → Esegui build, verifica exit code
- Bug fixed? → Esegui test originale, verifica passa

Nessuna affermazione senza evidenze.

## 🔄 Backup Vecchie Skills

Le vecchie skills sono state salvate in:
```
.skills-backup/
├── claude-skills-YYYYMMDD-HHMMSS/
│   ├── bugfix-developer.md
│   ├── debug-developer.md
│   ├── mcp-testing-guide.md
│   └── ...
└── cursor-skills-YYYYMMDD-HHMMSS/
    └── ...
```

Se servono, sono disponibili nel backup.

## 📖 Riferimenti

- **Superpowers Main**: `superpowers-main/` - Sorgente originale
- **Documentazione**: Vedi `superpowers-main/README.md`
- **Release Notes**: `superpowers-main/RELEASE-NOTES.md`

## 🚀 Quick Start

**Hai un bug da fixare?**
1. Usa `systematic-debugging/` - Trova root cause
2. Usa `test-driven-development/` - Scrivi test prima
3. Usa `verification-before-completion/` - Verifica fix

**Stai implementando una feature?**
1. Usa `brainstorming/` - Raffina design
2. Usa `writing-plans/` - Crea piano dettagliato
3. Usa `executing-plans/` o `subagent-driven-development/` - Implementa

**Stai debuggando?**
1. Usa `systematic-debugging/` - Processo obbligatorio
2. Usa `root-cause-tracing/` - Se errore profondo nel stack
3. Usa `verification-before-completion/` - Prima di dire "fatto"

---

**💡 Le skills sono ora le tue metodologie principali. Usale sempre quando applicabile!**

