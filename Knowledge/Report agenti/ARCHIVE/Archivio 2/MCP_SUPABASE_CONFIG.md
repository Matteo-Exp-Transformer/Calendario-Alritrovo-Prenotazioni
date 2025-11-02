# Configurazione MCP Supabase

**PER IL PROGETTO CORRETTO `dphuttzgdcerexunebct`**

## Configurazione Necessaria

### Opzione 1: Cursor Settings (GUI)
1. Vai in Cursor Settings (Ctrl+,)
2. Cerca "MCP" o "Supabase"  
3. Modifica configurazione con:

```
URL: https://dphuttzgdcerexunebct.supabase.co
API Key/Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwaHV0dHpnZGNlcmV4dW5lYmN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1MTI0NDMsImV4cCI6MjA3NzA4ODQ0M30.8OpmfjuZkT2vdSbOcr4fUeaKaKibuF4vdFLnNSk7h60
```

### Opzione 2: File Config
Crea/Modifica file config MCP in:
- `%APPDATA%\Cursor\User\settings.json` 
- O nelle impostazioni MCP di Cursor

```json
{
  "mcpServers": {
    "supabase": {
      "command": "...",
      "env": {
        "SUPABASE_URL": "https://dphuttzgdcerexunebct.supabase.co",
        "SUPABASE_ANON_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
      }
    }
  }
}
```

## Verifica
Dopo configurazione, riavvia Cursor e le query MCP useranno il progetto corretto.


