# Export Documenti per Agenti
# Copia i file principali del progetto in docs/agent-knowledge/
# per permettere agli agenti di accedere facilmente alla documentazione

$projectRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$destDir = Join-Path $projectRoot "docs\agent-knowledge"

Write-Host ""
Write-Host "📚 Export Documenti per Agenti" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan
Write-Host ""

# Crea directory se non esiste
New-Item -ItemType Directory -Force -Path $destDir | Out-Null

# Lista documenti da esportare (stessi che carichi su NotebookLM)
$docs = @(
    @{ src = "README_ALRITROVO.md"; name = "README.md"; desc = "Overview progetto" },
    @{ src = "Knowledge\PRD.md"; name = "PRD.md"; desc = "Product Requirements" },
    @{ src = "Knowledge\Report agenti\PROJECT_STATUS_CURRENT.md"; name = "PROJECT_STATUS.md"; desc = "Stato attuale" },
    @{ src = "Knowledge\Report agenti\PROJECT_COMPLETION_FINAL.md"; name = "COMPLETION_REPORT.md"; desc = "Report completamento" },
    @{ src = "supabase\SETUP_DATABASE.md"; name = "DATABASE_SETUP.md"; desc = "Setup database" },
    @{ src = "Knowledge\Report agenti\ARCHITECTURE_CORRECT.md"; name = "ARCHITECTURE.md"; desc = "Architettura RLS" },
    @{ src = "Knowledge\Report agenti\RLS_FIX_COMPLETE_FINAL.md"; name = "RLS_FIX.md"; desc = "Fix RLS policies" },
    @{ src = "Knowledge\Report agenti\PHASE_8_COMPLETED.md"; name = "PHASE_8_SECURITY.md"; desc = "Fase 8 Security" },
    @{ src = "Knowledge\Report agenti\FINAL_TESTING_REPORT.md"; name = "TESTING_REPORT.md"; desc = "Report testing" },
    @{ src = ".claude\skills\README.md"; name = "SKILLS.md"; desc = "Superpowers skills" },
    @{ src = "e2e\README.md"; name = "TESTING_SETUP.md"; desc = "Setup testing Playwright" }
)

$copied = 0
$missing = 0

Write-Host "Copia file in: $destDir" -ForegroundColor Gray
Write-Host ""

foreach ($doc in $docs) {
    $srcPath = Join-Path $projectRoot $doc.src
    $destPath = Join-Path $destDir $doc.name
    
    if (Test-Path $srcPath) {
        Copy-Item $srcPath $destPath -Force
        Write-Host "✅ $($doc.name.PadRight(25)) - $($doc.desc)" -ForegroundColor Green
        $copied++
    } else {
        Write-Host "⚠️  $($doc.name.PadRight(25)) - NON TROVATO: $($doc.src)" -ForegroundColor Yellow
        $missing++
    }
}

Write-Host ""
Write-Host "📊 Risultato:" -ForegroundColor Cyan
Write-Host "   ✅ Copiati: $copied" -ForegroundColor Green
if ($missing -gt 0) {
    Write-Host "   ⚠️  Mancanti: $missing" -ForegroundColor Yellow
}
Write-Host ""
Write-Host "📖 I file sono disponibili per gli agenti in:" -ForegroundColor Cyan
Write-Host "   $destDir" -ForegroundColor White
Write-Host ""
Write-Host "💡 Gli agenti possono leggere questi file usando:" -ForegroundColor Cyan
Write-Host "   - read_file tool" -ForegroundColor White
Write-Host "   - codebase_search tool" -ForegroundColor White
Write-Host "   - grep tool" -ForegroundColor White
Write-Host ""

