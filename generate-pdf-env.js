// Script per generare la variabile d'ambiente VITE_MENU_PDF_BASE64
const fs = require('fs');
const path = require('path');

const pdfPath = path.join(__dirname, 'Menu_regolamento_al_ritrovo-1-1.pdf');

try {
  // Leggi il file PDF
  const pdfBuffer = fs.readFileSync(pdfPath);
  
  // Converti in base64
  const pdfBase64 = pdfBuffer.toString('base64');
  
  // Controlla se .env.local esiste già
  let envContent = '';
  if (fs.existsSync('.env.local')) {
    envContent = fs.readFileSync('.env.local', 'utf-8');
  }
  
  // Aggiorna o aggiungi la variabile VITE_MENU_PDF_BASE64
  if (envContent.includes('VITE_MENU_PDF_BASE64=')) {
    // Sostituisci il valore esistente
    envContent = envContent.replace(
      /VITE_MENU_PDF_BASE64=.*$/m,
      `VITE_MENU_PDF_BASE64=${pdfBase64}`
    );
  } else {
    // Aggiungi la nuova variabile
    envContent += `\nVITE_MENU_PDF_BASE64=${pdfBase64}\n`;
  }
  
  // Scrivi il file .env.local
  fs.writeFileSync('.env.local', envContent);
  
  console.log('✅ PDF base64 aggiunto a .env.local con successo!');
  console.log(`📊 Dimensione base64: ${(pdfBase64.length / 1024).toFixed(2)} KB`);
  
} catch (error) {
  console.error('❌ Errore:', error.message);
  process.exit(1);
}

