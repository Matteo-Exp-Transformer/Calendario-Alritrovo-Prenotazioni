// Script per organizzare i test in categorie
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const e2eDir = path.join(__dirname, '../../e2e');
const organizedDir = path.join(__dirname, '../../e2e/organized');

// Mappatura test -> categoria
const testCategories = {
  // Booking Flow - Flusso prenotazione utente
  'booking-flow': [
    '01-booking-flow.spec.ts',
  ],

  // Admin CRUD - Operazioni admin (accept, reject, edit, delete, create)
  'admin-crud': [
    '02-accept-booking.spec.ts',
    '03-reject-booking.spec.ts',
    '04-edit-booking-calendar.spec.ts',
    '05-delete-booking-calendar.spec.ts',
    '11-admin-booking-insertion.spec.ts',
    'comprehensive-admin-flow-test.spec.ts',
  ],

  // Calendar - Funzionalità calendario
  'calendar': [
    '05-test-morning-booking.spec.ts',
    '13-test-calendar-and-collapse-cards.spec.ts',
    '15-test-view-in-calendar-from-archive.spec.ts',
  ],

  // Menu - Test selezione menu
  'menu': [
    '07-menu-field.spec.ts',
    'test-menu-selection-limits.spec.ts',
    'test-menu-auto-deselection.spec.ts',
    'test-menu-no-bis-primi.spec.ts',
    'verify-menu-limits-implementation.spec.ts',
    'final-menu-verification.spec.ts',
    'verify-menu-fresh.spec.ts',
    'final-duplicate-verification.spec.ts',
  ],

  // Validation - Validazione form
  'validation': [
    '16-test-email-phone-validation.spec.ts',
  ],

  // UI Visual - Test visual e layout
  'ui-visual': [
    'final-visual-verification-simple.spec.ts',
    '10-test-modal-two-columns.spec.ts',
    'visual-check.spec.ts',
    'visual-admin-check.spec.ts',
    'visual-form-layout-test.spec.ts',
    'final-snapshot.spec.ts',
    'test-admin-ui-modernization.spec.ts',
    'test-header-layout.spec.ts',
    'test-header-spacing-and-fonts.spec.ts',
    'test-admin-header-modifications.spec.ts',
    'test-card-borders.spec.ts',
    'test-dashboard-buttons.spec.ts',
    'test-logout-button.spec.ts',
    'test-logout-position.spec.ts',
    'test-user-info-position.spec.ts',
  ],

  // Archive - Test archivio
  'archive': [
    '06-archive-filters.spec.ts',
    'test-archive-cards.spec.ts',
  ],

  // Time Slots - Test time slots
  'time-slots': [
    '08-test-afternoon-booking.spec.ts',
    '14-test-time-slot-assignment.spec.ts',
    'bugfix-time-slot-collapse-cards.spec.ts',
    'test-collapse-cards.spec.ts',
  ],

  // Mobile - Test responsive mobile
  'mobile': [
    '09-test-modal-mobile-size.spec.ts',
    'test-archive-mobile.spec.ts',
    'mobile-test.spec.ts',
    'quick-mobile-test.spec.ts',
    'test-time-input-00-30-mobile.spec.ts',
  ],

  // Obsolete - Test obsoleti/debug/duplicati
  'obsolete': [
    'debug-menu-issue.spec.ts',
    'test-collapse-cards-colors.spec.ts',
    'test-collapse-cards-internal-colors.spec.ts',
    'test-collapse-cards-internal-colors-fixed.spec.ts',
    'test-inspect-collapse-card-structure.spec.ts',
    'test-primi-mutual-exclusion.spec.ts',
    'test-bevande-mutual-exclusion.spec.ts',
    'test-time-input-00-30.spec.ts',
    'test-rinfresco-laurea-complete.spec.ts',
    'test-rinfresco-laurea-database-verification.spec.ts',
    'test-duplicate-booking-requests.spec.ts',
    'test-duplicate-booking-simple.spec.ts',
  ],
};

// Funzione per spostare file
function moveTestFile(sourceFile, destCategory) {
  const sourcePath = path.join(e2eDir, sourceFile);
  const destDir = path.join(organizedDir, destCategory);
  const destPath = path.join(destDir, sourceFile);

  if (!fs.existsSync(sourcePath)) {
    console.log(`⚠️  File non trovato: ${sourceFile}`);
    return false;
  }

  // Crea cartella destinazione se non esiste
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  // Sposta file
  fs.copyFileSync(sourcePath, destPath);
  console.log(`✅ ${sourceFile} -> ${destCategory}/`);
  return true;
}

// Organizza tutti i test
console.log('📁 Organizzazione test...\n');

let moved = 0;
let skipped = 0;

for (const [category, files] of Object.entries(testCategories)) {
  console.log(`\n📂 Categoria: ${category}`);
  for (const file of files) {
    if (moveTestFile(file, category)) {
      moved++;
    } else {
      skipped++;
    }
  }
}

console.log(`\n✅ Completato: ${moved} file organizzati, ${skipped} file non trovati`);
console.log(`\n📁 Struttura creata in: e2e/organized/`);

