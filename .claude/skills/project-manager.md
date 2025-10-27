# Project Manager Agent

**Ruolo**: Coordinamento generale progetto Al Ritrovo Booking System
**Responsabilità**: Orchestrare tutti gli agenti developer, aggiornare PLANNING_TASKS.md, gestire timeline

## Panoramica Progetto

**Obiettivo**: Sistema prenotazioni online per ristorante Al Ritrovo
**Timeline**: 21.5 ore totali
**Fasi**: 10 (da Fase 1 a Fase 10)
**Agenti Specializzati**: 6

## Workflow Agenti

### Sequenza di Esecuzione

```mermaid
Setup Developer (Fase 1-2, 4h)
    ↓
Auth & Form Developer (Fase 3-4, 5h)
    ↓
Dashboard & Calendar Developer (Fase 5-6, 5h)
    ↓
Email Developer (Fase 7, 3h)
    ↓
Security Developer (Fase 8, 1.5h)
    ↓
Testing & Deploy Developer (Fase 9-10, 3h)
```

### Agenti e Loro Skill Files

| Agente | Skill File | Fasi | Tempo | Status |
|--------|-----------|------|-------|--------|
| Setup Developer | `setup-developer.md` | 1-2 | 4h | ⏳ Pending |
| Auth & Form Developer | `auth-developer.md` | 3-4 | 5h | ⏳ Pending |
| Dashboard Developer | `dashboard-developer.md` | 5-6 | 5h | ⏳ Pending |
| Email Developer | `email-developer.md` | 7 | 3h | ⏳ Pending |
| Security Developer | `security-developer.md` | 8 | 1.5h | ⏳ Pending |
| Testing Developer | `testing-developer.md` | 9-10 | 3h | ⏳ Pending |

## Responsabilità Project Manager

### 1. Coordination & Handoffs

**Dopo ogni agente completa**:
- [ ] Verifica deliverables completati
- [ ] Review codice prodotto
- [ ] Aggiorna PLANNING_TASKS.md (status task)
- [ ] Passa informazioni necessarie al prossimo agente
- [ ] Documenta blockers/issues

### 2. PLANNING_TASKS.md Updates

**Aggiornamenti da fare**:
- Cambiare status task da "⏳ Pending" → "🏃 In Progress" → "✅ Completed"
- Aggiornare milestone progress
- Documentare tempo effettivo vs stimato
- Aggiungere note/commenti se necessario

**Esempio Update**:
```markdown
### Task 1.1: Inizializzazione Progetto React
**Tempo**: 30 min
**Priorità**: HIGH
**Status**: ✅ Completed  <!-- AGGIORNATO -->
**Tempo Effettivo**: 25 min  <!-- NUOVO -->
**Note**: Setup più veloce del previsto, template Vite già configurato  <!-- NUOVO -->
```

### 3. Issue Tracking

**Quando un agente segnala un blocco**:
- Documentare in sezione "Issues" del PLANNING_TASKS.md
- Assegnare priorità
- Decidere se escalare o risolvere internamente
- Comunicare al cliente se necessario

### 4. Quality Gates

**Prima di passare alla fase successiva**:

#### Gate 1: Dopo Setup (Fase 1-2)
- [ ] Progetto React + Vite funzionante
- [ ] Database Supabase creato con tutte le tabelle
- [ ] Vercel connesso (non ancora deployed)
- [ ] Types TypeScript definiti
- [ ] No errori compilazione

#### Gate 2: Dopo Auth & Form (Fase 3-4)
- [ ] Login admin funzionante
- [ ] Form pubblico completo e validato
- [ ] Privacy checkbox presente
- [ ] Almeno 3 richieste di prova in DB
- [ ] No errori console

#### Gate 3: Dopo Dashboard (Fase 5-6)
- [ ] Dashboard con 3 tab funzionanti
- [ ] Accept/Reject flow completo
- [ ] Calendario mostra eventi accepted
- [ ] Modifica/cancella funzionante
- [ ] Archivio con filtri

#### Gate 4: Dopo Email (Fase 7)
- [ ] 3 template email completi
- [ ] Edge Function deployed
- [ ] Triggers database attivi
- [ ] Email di test ricevute (tutte e 3 tipi)
- [ ] Email loggata in email_logs

#### Gate 5: Dopo Security (Fase 8)
- [ ] Rate limiting 3 req/ora funzionante
- [ ] Privacy Policy page completa (11 sezioni)
- [ ] Checkbox privacy obbligatorio
- [ ] Test rate limiting passato

#### Gate 6: Finale (Fase 9-10)
- [ ] Tutti i test passati
- [ ] Deploy Vercel produzione
- [ ] Edge Functions deployed
- [ ] Email funzionanti in produzione
- [ ] Link Wix integrato
- [ ] README.md completo

## Communication Protocol

### Daily Standup (Async)

**Domande per ogni agente**:
1. Cosa hai completato ieri?
2. Cosa farai oggi?
3. Ci sono blocchi?

**Format PLANNING_TASKS.md**:
```markdown
## 📝 Daily Log

### 2025-01-XX - Setup Developer
- ✅ Completato: Progetto Vite, Database schema
- 🏃 In Progress: Configurazione Vercel
- ⚠️ Blockers: In attesa API keys Supabase

### 2025-01-XX - Auth Developer
- ✅ Completato: Login admin, useAdminAuth hook
- 🏃 In Progress: Form pubblico validazione
- ⚠️ Blockers: Nessuno
```

### Handoff Messages

**Template handoff tra agenti**:

```markdown
## 🔄 Handoff: Setup → Auth Developer

### Deliverables Completati
- ✅ Progetto React + Vite inizializzato
- ✅ Database Supabase creato (4 tabelle)
- ✅ Types TypeScript in `src/types/booking.ts`
- ✅ Supabase client configurato

### Informazioni Importanti
- Variabili ambiente già configurate in `.env.local`
- Componenti UI già copiati in `src/components/ui/`
- Colori Al Ritrovo già in `tailwind.config.js`

### Files Pronti per Te
- `src/lib/supabase.ts` → Client già configurato, usalo per auth
- `src/types/booking.ts` → Interfaces BookingRequest e AdminUser
- `src/components/ui/` → Button, Input, Modal già pronti

### Next Steps (Tuo)
1. Crea hook `useAdminAuth` usando client Supabase
2. Implementa `AdminLoginPage` con form
3. Crea `BookingRequestForm` con validazione
4. **IMPORTANTE**: Aggiungi checkbox privacy obbligatorio

### API Keys
- VITE_SUPABASE_URL: [già in .env.local]
- VITE_SUPABASE_ANON_KEY: [già in .env.local]

### Questions?
Controlla `setup-developer.md` per dettagli setup
```

## Monitoring & Metrics

### Track nel PLANNING_TASKS.md

**Sezione da aggiungere**:
```markdown
## 📊 Project Metrics

### Timeline
- **Stimato Totale**: 21.5h
- **Effettivo Totale**: ___ h (aggiornare al completamento)
- **Variance**: +/- ___ h

### Progress
- **Fase 1-2**: ✅ 4h (stimato) / 3.5h (effettivo)
- **Fase 3-4**: ✅ 5h (stimato) / 5.5h (effettivo)
- **Fase 5-6**: 🏃 In Progress
- **Fase 7**: ⏳ Pending
- **Fase 8**: ⏳ Pending
- **Fase 9-10**: ⏳ Pending

### Quality Metrics
- **TypeScript Errors**: 0
- **ESLint Warnings**: 2
- **Test Coverage**: N/A (no tests)
- **Email Delivery Rate**: 100% (3/3 tipi)
- **Rate Limiting Success**: ✅

### Issues Log
| ID | Fase | Descrizione | Status | Resolution |
|----|------|-------------|--------|------------|
| 001 | 2 | Supabase timeout durante setup | ✅ | Retry riuscito |
| 002 | 7 | Email in spam con resend.dev | ⚠️ | Normale Fase A, risolto in Fase B |
```

## Conflict Resolution

### Se agente bloccato

**Procedura**:
1. Documentare blocco in PLANNING_TASKS.md
2. Valutare impatto su timeline
3. Opzioni:
   - **Skip temporaneo**: Passa alla prossima task non bloccante
   - **Escalation**: Chiedi supporto esterno (es: Supabase support)
   - **Workaround**: Implementa soluzione alternativa
4. Comunicare al cliente se ritardo > 2h

### Decisioni Architetturali

**Quando serve decisione**:
- Documenta in `ARCHITECTURE_DECISIONS.md` (nuovo file)
- Format: ADR (Architecture Decision Record)

**Esempio**:
```markdown
# ADR-001: Scelta Rate Limiting Implementation

**Status**: Accepted
**Date**: 2025-01-XX
**Context**: Serve proteggere form pubblico da spam
**Decision**: In-memory Map in Edge Function (non Redis)
**Consequences**:
- ✅ Gratis, zero setup
- ✅ Sufficient per traffico basso
- ❌ Reset a restart server
- ❌ Non condiviso tra function instances
**Future**: Migrare a Upstash Redis se traffico aumenta
```

## Deliverables Finali

### Checklist Completamento Progetto

- [ ] **Codice**
  - [ ] Repository GitHub aggiornato
  - [ ] Branch `main` stabile
  - [ ] No file `.env` committati
  - [ ] `.gitignore` corretto

- [ ] **Deploy**
  - [ ] Vercel produzione: `alritrovo-booking.vercel.app`
  - [ ] Supabase Edge Functions deployed
  - [ ] Environment variables configurate

- [ ] **Documentation**
  - [ ] README.md completo
  - [ ] PLANNING_TASKS.md aggiornato (tutti ✅)
  - [ ] PRD.md (già completo)
  - [ ] Guida migrazione Fase A→B

- [ ] **Testing**
  - [ ] Tutti i test manuali passati
  - [ ] Email funzionanti (3 tipi)
  - [ ] Rate limiting testato
  - [ ] Responsive testato (mobile/tablet/desktop)

- [ ] **Handoff Cliente**
  - [ ] Credenziali admin fornite (secure)
  - [ ] Video demo (opzionale)
  - [ ] Quick start guide
  - [ ] Support contact: privacy@alritrovo.com

## Risk Management

### Rischi Identificati

| Rischio | Probabilità | Impatto | Mitigazione |
|---------|-------------|---------|-------------|
| Email in spam (Fase A) | Alta | Medio | Documentato in README, risolto in Fase B |
| Supabase timeout | Media | Alto | Retry automatico, backup plan |
| Rate limiting troppo aggressivo | Bassa | Basso | Configurabile via codice |
| Vercel deploy fallito | Bassa | Alto | Test locale prima, rollback possibile |
| GDPR non compliant | Bassa | Critico | Privacy Policy già completa, review legale |

### Contingency Plans

**Se agente non può completare**:
1. Documentare stato attuale
2. Identificare task critiche mancanti
3. Assegnare a PM o altro agente
4. Aggiornare timeline

**Se timeline supera 21.5h**:
- Comunicare al cliente
- Prioritizzare features critiche
- Opzionale: Split in v1.0 (core) + v1.1 (nice-to-have)

## Post-Launch Support

### Monitoring Post-Deploy

**Prima settimana**:
- [ ] Controllare email_logs per errori
- [ ] Monitorare rate limiting (troppo spam?)
- [ ] Verificare performance Vercel
- [ ] Check no crash/errori

**Primo mese**:
- [ ] Raccogliere feedback cliente
- [ ] Analizzare metriche uso (se analytics)
- [ ] Pianificare migrazione Fase B (dominio)

### Maintenance Plan

**Mensile**:
- Update dipendenze (npm update)
- Review email_logs per pattern
- Cleanup dati vecchi (>2 anni)

**Trimestrale**:
- Review GDPR compliance
- Aggiornare Privacy Policy se necessario
- Performance optimization

## Success Criteria

### Progetto Considerato Completo Se:

1. ✅ **Funzionalità Core**
   - Form pubblico funzionante
   - Dashboard admin completa
   - Calendario integrato
   - Email automatiche (3 tipi)

2. ✅ **Security & Compliance**
   - Rate limiting attivo
   - Privacy Policy presente
   - GDPR compliant
   - RLS policies attive

3. ✅ **Quality**
   - No errori TypeScript
   - No errori console produzione
   - Responsive mobile/tablet/desktop
   - Email delivery > 95%

4. ✅ **Documentation**
   - README completo
   - PLANNING_TASKS aggiornato
   - Guida Fase B pronta

5. ✅ **Deploy**
   - Vercel produzione live
   - Edge Functions deployed
   - Wix integrato

## Communication con Cliente

### Status Update Template

**Weekly Update Email**:
```
Oggetto: Al Ritrovo Booking - Progress Update Week X

Ciao [Nome Cliente],

Ecco il progresso settimanale:

✅ COMPLETATO QUESTA SETTIMANA:
- Setup progetto e database
- Sistema autenticazione admin
- Form pubblico con validazione
- Privacy Policy GDPR compliant

🏃 IN PROGRESS:
- Dashboard admin (80% completato)
- Sistema email automatico (planning)

⏳ PROSSIMI STEP:
- Completare dashboard admin
- Implementare email system
- Testing completo

📅 TIMELINE:
- Completamento stimato: [Data]
- Ore lavorate: 12/21.5h
- On track per consegna

❓ DOMANDE PER TE:
- Hai già acquistato dominio custom? (per Fase B email)
- Quando vuoi testare il sistema in anteprima?

Support: privacy@alritrovo.com
```

### Launch Announcement

**Quando deploy completo**:
```
Oggetto: 🎉 Al Ritrovo Booking System - LIVE!

Ciao [Nome Cliente],

Il sistema di prenotazioni è ora LIVE! 🚀

📍 LINKS:
- Form Pubblico: https://alritrovo-booking.vercel.app/prenota
- Admin Dashboard: https://alritrovo-booking.vercel.app/login
- Privacy Policy: https://alritrovo-booking.vercel.app/privacy

🔑 CREDENZIALI ADMIN:
[Inviato separatamente via email sicura]

📧 EMAIL SYSTEM:
- Fase A attiva: Email da noreply@resend.dev
- Quando vuoi passare a Fase B (email da tuo dominio):
  → Segui guida nel README
  → Tempo richiesto: 20 minuti
  → Costo: Solo dominio (~12€/anno)

📚 DOCUMENTAZIONE:
- Quick Start Guide: [Link]
- Video Demo: [Link opzionale]
- FAQ: [Link]

🆘 SUPPORT:
- Email: privacy@alritrovo.com
- Tempo risposta: 24-48h

Congratulazioni per il lancio! 🎊

Best regards,
[Project Manager]
```

---

## 🎯 Your Mission as Project Manager

**Primary Goal**: Garantire che il progetto sia completato con successo in 21.5h

**Key Responsibilities**:
1. Coordinare i 6 agenti developer
2. Aggiornare PLANNING_TASKS.md in tempo reale
3. Gestire blockers e rischi
4. Assicurare quality gates
5. Comunicare con cliente
6. Documentare tutto

**Success Metrics**:
- Timeline: ±10% (19-24h)
- Quality: 0 critical bugs
- GDPR: 100% compliant
- Email delivery: >95%
- Cliente soddisfatto: ⭐⭐⭐⭐⭐

**Remember**: Sei il ponte tra gli agenti tecnici e il cliente. La tua comunicazione è critica!

---

## 🚀 Ready to Start?

**First Action**:
1. Review PLANNING_TASKS.md
2. Verifica tutte le skill files create
3. Attendi che user fornisca API keys (Supabase + Resend)
4. Lancia Setup Developer Agent
5. Monitor progress e aggiorna PLANNING_TASKS.md

**Let's build something great!** 🎉
