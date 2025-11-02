// Script per configurare le variabili d'ambiente
const fs = require('fs');

const envContent = `VITE_SUPABASE_URL=https://dphuttzgdcerexunebct.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwaHV0dHpnZGNlcmV4dW5lYmN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1MTI0NDMsImV4cCI6MjA3NzA4ODQ0M30.8OpmfjuZkT2vdSbOcr4fUeaKaKibuF4vdFLnNSk7h60
`;

fs.writeFileSync('.env.local', envContent);
console.log('✅ File .env.local creato con successo!');



