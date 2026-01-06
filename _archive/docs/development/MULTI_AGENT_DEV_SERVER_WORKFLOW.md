# Multi-Agent Dev Server Workflow

**Data Creazione:** 2025-01-27  
**Problema Risolto:** Dev server non vede modifiche dopo "Apply" da worktree multi-agent

---

## 🔍 Problema Identificato

Quando agenti lavorano in parallelo su worktree separati e l'utente applica le modifiche:

1. ✅ Le modifiche vengono mergeate correttamente nel repository principale
2. ✅ Il terminale si aggiorna correttamente
3. ❌ **Il dev server Vite non rileva i cambiamenti** e continua a servire codice vecchio

### Cause Principali

1. **File Watcher di Vite non rileva cambiamenti dopo merge**
   - Vite usa file system events che potrebbero non funzionare correttamente su Windows dopo merge da worktree
   - Cache di Vite non si invalida automaticamente

2. **Cache Aggressiva**
   - Vite mantiene cache dei moduli compilati
   - Dopo merge, la cache potrebbe contenere ancora versioni vecchie

3. **Worktree Isolation**
   - I worktree sono directory separate
   - Il dev server nel repository principale potrebbe non monitorare correttamente i cambiamenti dopo merge

---

## ✅ Soluzione Implementata

### 1. Configurazione Vite Migliorata

Il file `vite.config.ts` è stato aggiornato con:

```typescript
server: {
  port: 5173,
  watch: {
    // Usa polling per rilevare cambiamenti su Windows (necessario per worktree)
    usePolling: true,
    interval: 500, // Controlla ogni 500ms
    ignored: ['**/node_modules/**', '**/.git/**', '**/.cursor/**', '**/.worktrees/**']
  },
  hmr: {
    overlay: true // Mostra errori HMR
  }
}
```

**Perché funziona:**
- `usePolling: true` forza Vite a controllare attivamente i file invece di affidarsi solo agli eventi del file system
- `interval: 500` controlla i file ogni 500ms, garantendo rilevamento rapido dei cambiamenti
- Ignora directory worktree per evitare conflitti

### 2. Configurazione Worktree Corretta

Il file `.cursor/worktrees.json` è già configurato correttamente secondo la guida Cursor:

- ✅ Usa array di comandi (non script esterni)
- ✅ Copia `.env.local` dal repository principale
- ✅ Installa dipendenze solo se necessario
- ✅ Supporta Windows e Unix

---

## 📋 Workflow Corretto

### Per l'Utente

1. **Avvia dev server nel repository principale:**
   ```bash
   cd C:\Users\matte.MIO\Documents\GitHub\Calendarbackup
   npm run dev
   ```
   ⚠️ **IMPORTANTE:** Il dev server DEVE essere nel repository principale, NON nei worktree!

2. **Lascia che gli agenti lavorino nei worktree:**
   - Cursor crea automaticamente worktree in `C:\Users\matte.MIO\.cursor\worktrees\Calendarbackup\`
   - Gli agenti lavorano in isolamento

3. **Quando un agente completa il lavoro:**
   - Clicca "Apply" per applicare le modifiche al repository principale
   - Cursor fa merge automatico

4. **Il dev server dovrebbe rilevare automaticamente i cambiamenti:**
   - Con la nuova configurazione, Vite usa polling e rileva i cambiamenti entro 500ms
   - HMR (Hot Module Replacement) aggiorna il browser automaticamente

### Se il Dev Server Non Rileva Cambiamenti

Se dopo "Apply" il dev server non rileva i cambiamenti:

1. **Forza refresh HMR:**
   - Apri browser console (F12)
   - Digita: `location.reload()`

2. **Riavvia dev server (se necessario):**
   ```bash
   # Nel terminale del dev server
   Ctrl+C
   npm run dev
   ```

3. **Clear cache Vite (ultima risorsa):**
   ```powershell
   Remove-Item -Recurse -Force node_modules/.vite
   npm run dev
   ```

---

## 🔧 Verifica Configurazione

### Checklist Pre-Start

Prima di avviare il dev server con multi-agent:

- [ ] Dev server è nel repository principale (non in worktree)
- [ ] `vite.config.ts` ha `usePolling: true` nella sezione `watch`
- [ ] `.cursor/worktrees.json` è presente e configurato correttamente
- [ ] Porta 5173 è disponibile (non in uso da altri processi)

### Verifica Script

Esegui questo comando per verificare che tutto sia configurato correttamente:

```powershell
# Verifica che dev server sia nel repo principale
$currentPath = Get-Location
if ($currentPath -like "*\.cursor\worktrees\*") {
    Write-Host "❌ ERRORE: Dev server è in un worktree!" -ForegroundColor Red
    Write-Host "Spostati nel repository principale:" -ForegroundColor Yellow
    Write-Host "cd C:\Users\matte.MIO\Documents\GitHub\Calendarbackup" -ForegroundColor Cyan
} else {
    Write-Host "✅ Dev server nel repository principale" -ForegroundColor Green
}

# Verifica configurazione Vite
$viteConfig = Get-Content vite.config.ts -Raw
if ($viteConfig -match "usePolling:\s*true") {
    Write-Host "✅ Vite configurato con polling" -ForegroundColor Green
} else {
    Write-Host "⚠️  Vite potrebbe non rilevare cambiamenti da worktree" -ForegroundColor Yellow
}

# Verifica porta
$portInUse = netstat -ano | findstr ":5173"
if ($portInUse) {
    Write-Host "✅ Porta 5173 in uso (dev server attivo)" -ForegroundColor Green
} else {
    Write-Host "ℹ️  Porta 5173 disponibile" -ForegroundColor Cyan
}
```

---

## 🚨 Troubleshooting

### Problema: Dev Server Non Rileva Cambiamenti

**Sintomi:**
- Modifiche applicate correttamente nel repository principale
- File sul disco sono corretti
- Browser mostra ancora codice vecchio

**Soluzione 1: Verifica Polling**
```powershell
# Verifica che vite.config.ts abbia usePolling: true
Select-String -Path vite.config.ts -Pattern "usePolling"
```

**Soluzione 2: Restart Dev Server**
```bash
# Nel terminale del dev server
Ctrl+C
npm run dev
```

**Soluzione 3: Clear Cache**
```powershell
Remove-Item -Recurse -Force node_modules/.vite
npm run dev
```

### Problema: Dev Server in Worktree

**Sintomi:**
- Dev server avviato in directory worktree
- Modifiche non si riflettono nel browser

**Soluzione:**
```bash
# Ferma dev server
Ctrl+C

# Vai al repository principale
cd C:\Users\matte.MIO\Documents\GitHub\Calendarbackup

# Riavvia dev server
npm run dev
```

### Problema: Porta 5173 Occupata

**Sintomi:**
- Errore "Port 5173 is already in use"

**Soluzione:**
```powershell
# Trova processo che usa porta 5173
$process = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
if ($process) {
    Stop-Process -Id $process -Force
    Write-Host "Processo fermato" -ForegroundColor Green
}

# Riavvia dev server
npm run dev
```

---

## 📚 Riferimenti

- **Guida Cursor Worktree:** [Cursor Documentation - Parallel Agents](https://docs.cursor.com)
- **Vite File Watching:** [Vite Config - Server Options](https://vitejs.dev/config/server-options.html)
- **Git Worktree:** [Git Worktree Documentation](https://git-scm.com/docs/git-worktree)

---

## ✅ Best Practices

1. **Sempre avviare dev server nel repository principale**
   - Non avviare dev server nei worktree
   - Un solo dev server per repository

2. **Usa "Apply" invece di merge manuale**
   - Cursor gestisce automaticamente il merge
   - Evita conflitti

3. **Monitora il terminale del dev server**
   - Dovresti vedere messaggi HMR quando i file cambiano
   - Se non vedi messaggi, potrebbe esserci un problema

4. **Se possibile, usa un solo agente alla volta**
   - Riduce complessità
   - Evita conflitti di merge

5. **Commit spesso**
   - Committa le modifiche prima di applicare da worktree
   - Facilita rollback se necessario

---

**Ultimo Aggiornamento:** 2025-01-27  
**Versione Configurazione:** 1.0

