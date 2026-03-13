# Workflow branch e deploy Vercel

## Situazione

- **Vercel** è collegato a un branch (di solito `main`) e fa **deploy automatico** a ogni push.
- L’app in produzione deve restare **stabile**: niente deploy di work-in-progress.

## Strategia

| Branch | Ruolo | Deploy |
|--------|--------|--------|
| **main** | Produzione | Sì – ogni push su `main` triggera il deploy su Vercel |
| **layout-improvements** (o altro branch di sviluppo) | Modifiche estetiche, feature, refactor | No – lavori qui senza toccare la build in produzione |

## Come lavorare senza rompere la build

1. **Lavorare sempre su un branch diverso da `main`**
   - Esempio: sei già su `layout-improvements`. Fai qui tutte le modifiche estetiche e di sviluppo.
   - Oppure crea un nuovo branch:  
     `git checkout -b develop` (o `feature/estetico`, ecc.).

2. **Non fare push su `main`** finché le modifiche non sono pronte e testate.
   - Finché pushi solo su `layout-improvements` (o altro branch), Vercel **non** rifarà il deploy della produzione.

3. **Quando le modifiche sono pronte**
   - Merge (o PR) da `layout-improvements` → `main`.
   - Push di `main` → Vercel deploya la nuova versione.

## Comandi utili

```bash
# Verificare su quale branch sei
git branch

# Restare su layout-improvements (o il tuo branch di sviluppo)
git checkout layout-improvements

# Creare un nuovo branch di sviluppo da main (se parti da pulito)
git checkout main
git pull origin main
git checkout -b develop

# Inviare il branch di sviluppo al remote (backup, nessun deploy produzione)
git push -u origin layout-improvements
```

## Dati e Supabase: testare senza toccare l’app in produzione

Il **codice** è isolato per branch (main vs layout-improvements). I **dati** no: se in locale usi lo stesso progetto Supabase (stesso `.env.local`), l’app legge e scrive sullo stesso DB della produzione.

### Opzione A — Solo modifiche estetiche (zero rischio dati)

Se le modifiche sono **solo layout/CSS** (nav, card, colori, spacing, nessuna nuova logica che scrive in DB):

1. Lavora su `layout-improvements`, avvia in locale con `npm run dev`.
2. Usa l’app **solo in lettura**: naviga, guarda calendario, prenotazioni, archivio.
3. **Non fare** in locale: creare prenotazioni, approvare/rifiutare, cancellare, modificare impostazioni.

Così verifichi il look senza toccare i dati. Un click sbagliato su “Rifiuta” o “Crea prenotazione” scriverebbe comunque in produzione, quindi serve un po’ di attenzione.

### Opzione B — Ambiente Supabase separato (consigliato per test “pieni”)

Per testare anche azioni che scrivono in DB (nuove prenotazioni, rifiuti, ecc.) senza toccare nulla di reale:

1. **Crea un secondo progetto Supabase** (es. “Al Ritrovo Staging” o “Al Ritrovo Dev”) dal dashboard Supabase.
2. **Clona lo schema**: applica le stesse migrations del repo (`supabase/migrations/`) al progetto staging (es. da Supabase CLI o copiando le tabelle).
3. **In locale** sul branch `layout-improvements`: usa un `.env.local` che punta **solo** al progetto staging:
   - `VITE_SUPABASE_URL` = URL del progetto staging  
   - `VITE_SUPABASE_ANON_KEY` = anon key del progetto staging  
   - (e le altre chiavi necessarie, tutte del progetto staging)
4. **Vercel / produzione** continuano a usare le variabili d’ambiente del progetto Supabase **reale** (configurate nel dashboard Vercel). Il tuo `.env.local` non viene mai deployato (è in `.gitignore`).

Risultato: in locale su `layout-improvements` parli solo con Supabase staging; l’app in produzione (main) parla solo con Supabase produzione. Nessun dato reale viene toccato.

### Riepilogo

| Dove giri l’app | Quale Supabase | Rischio per i dati prod |
|------------------|-----------------|--------------------------|
| Locale, stesso `.env` della prod | Progetto reale | Sì, se fai azioni che scrivono |
| Locale, `.env.local` → progetto staging | Progetto staging | No |
| Vercel (branch main) | Progetto reale (env Vercel) | È la produzione |

## Riepilogo (branch + dati)

- **Produzione stabile**: Vercel deploya solo da `main`.
- **Sviluppo sicuro**: tutto il lavoro su `layout-improvements` (o `develop` / altro branch).
- **Dati al sicuro**: per modifiche solo estetiche, test in sola lettura; per test completi, usa un progetto Supabase staging e `.env.local` dedicato.
- **Go live**: merge nel branch collegato a Vercel (`main`) e push solo quando sei pronto.
