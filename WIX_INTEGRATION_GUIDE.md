# Guida Integrazione Sistema Prenotazioni con Wix

## 📋 Panoramica

Hai un sistema di prenotazioni React completo sviluppato per "Al Ritrovo" e vuoi integrarlo nel tuo sito Wix. Questo documento descrive le opzioni disponibili e i passaggi da seguire.

---

## 🔍 Analisi del Sistema Attuale

### Stack Tecnologico
- **Frontend**: React + Vite + TypeScript
- **Backend**: Supabase (PostgreSQL + Auth)
- **Calendar**: FullCalendar
- **Email**: Resend API
- **Styling**: TailwindCSS

### Funzionalità Implementate
✅ Form pubblico prenotazioni  
✅ Calendario interattivo  
✅ Dashboard admin  
✅ Notifiche email automatiche  
✅ Sistema di archiviazione  
✅ Filtri e ricerca  

---

## 🚀 Opzioni di Integrazione con Wix

### **Opzione 1: Embed via iframe (Raccomandata) 🏆**

**Vantaggi**:
- Sviluppo già completo
- Nessuna modifica al sistema
- Aggiornamenti automatici
- Totalmente funzionale
- Hosting e performance gestiti indipendentemente

**Svantaggi**:
- Design potrebbe non integrarsi perfettamente con Wix
- Potrebbe sembrare un po' "staccato" dal sito

**Implementazione**:
1. Deploy del sistema React su Vercel/Netlify
2. Aggiunta elemento "Incorpora" (Embed) in Wix
3. Inserimento URL dell'app nel widget

---

### **Opzione 2: Sostituzione Modulo Wix con URL Redirect** 🔄

**Vantaggi**:
- Design pulito
- Branding consistente
- Controllo UI/UX completo

**Svantaggi**:
- Redirect verso sito esterno
- Possibile confusione utenti

**Implementazione**:
1. Cambio pulsante prenotazione nel sito Wix
2. Redirect verso URL esterno (es: `booking.alritrovo.com`)
3. Torna al sito dopo prenotazione

---

### **Opzione 3: Sezione Dedicata su Subdominio** 🌐

**Vantaggi**:
- Separazione completa funzionalità
- URL dedicato: `prenota.alritrovo.com`
- SEO ottimizzato
- Link diretto dal menu Wix

**Svantaggi**:
- Configurazione DNS necessaria
- Navigazione tra domini

---

## 🛠️ Implementazione Pratica - Opzione 1 (Consigliata)

### STEP 1: Deploy dell'Applicazione

#### A. Setup Vercel
```bash
# Nel terminal, esegui:
npx vercel login
npx vercel --prod
```

Oppure:
1. Vai su [vercel.com](https://vercel.com)
2. Connetti repository GitHub
3. Deploy automatico

**URL generato**: `https://alritrovo-booking.vercel.app`

#### B. Configurazione Variabili Ambiente
In Vercel Dashboard:
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY
- RESEND_API_KEY
- SENDER_EMAIL
- SENDER_NAME

### STEP 2: Integrazione in Wix

#### A. Accedi all'Editor Wix
1. Vai su [manage.wix.com](https://manage.wix.com)
2. Login con: `perilbusiness3@gmail.com`
3. Seleziona il tuo sito
4. Clicca "Modifica sito"

#### B. Aggiungi Elemento Embed
1. Clicca **"Aggiungi"** nel menu sinistro
2. Seleziona **"Incorpora"** → **"Sito o widget"**
3. Inserisci URL: `https://alritrovo-booking.vercel.app`
4. Posiziona l'elemento nella pagina desiderata
5. Resize: `width: 100%`, `height: 800px` o `auto`

#### C. Personalizza
- Nascosti scrollbar se necessario
- Aggiungi border o shadow
- Responsive per mobile

---

## 🎨 Customizzazione Design per Wix

### Adattamento Colori
Nel file `tailwind.config.js`:
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        // Adatta al brand del sito Wix
        'brand-primary': '#COLORE_PRI_HEADER',
        'brand-secondary': '#COLORE_SEC_HEADER',
      }
    }
  }
}
```

### Iframe Styling in Wix
Usa CSS custom in Wix:
```css
iframe {
  border: none;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
```

---

## 🔗 Opzione Alternativa: Pulsante Prenota

Se preferisci solo un pulsante che porta al sistema:

### In Wix Editor:
1. Aggiungi **"Pulsante"** nella pagina
2. Testo: "Prenota un Tavolo"
3. Link: `https://alritrovo-booking.vercel.app/prenota`
4. Apri in: Nuova scheda

### Variante Popup:
1. Usa elemento **"Popup"** in Wix
2. Embed sistema dentro popup
3. Bottone trigger: "Prenota Ora"
4. Design senza bordi/scroll

---

## 📱 Responsive Design

Il sistema è già responsive per:
- Desktop (1920px+)
- Tablet (768px - 1920px)
- Mobile (< 768px)

**Test raccomandato**: 
- Visualizza pagina Wix in modalità mobile
- Verifica embed su iPhone/Android

---

## 🔒 Sicurezza e Privacy

### Already Implemented:
✅ RLS policies attive  
✅ Rate limiting (configurabile)  
✅ GDPR consenso cookies  
✅ Email tracking trasparente  

### Per Deploy Produzione:
⚠️ **Aggiungi DNS record per email custom**:
```
TXT: v=spf1 include:_spf.google.com ~all
```

---

## 🧪 Testing Post-Integrazione

### Checklist:
- [ ] Accedi a Wix Editor
- [ ] Aggiungi elemento Embed
- [ ] Inserisci URL deploy
- [ ] Test form prenotazione
- [ ] Verifica email ricevuta
- [ ] Test su mobile
- [ ] Test admin dashboard

---

## 📊 Monitoring e Analytics

### Tracking Integrazione:
1. **Google Analytics**: Aggiungi tracking code in Wix
2. **Supabase Dashboard**: Monitora database
3. **Vercel Analytics**: Performance tracking

### Metriche da Monitorare:
- Conversioni prenotazioni
- Tempo caricamento iframe
- Errori 404/500
- User engagement

---

## 🚨 Troubleshooting Comune

### Problema: Iframe non carica
**Soluzione**: Verifica URL è HTTPS e non bloccato

### Problema: Design diverso su mobile
**Soluzione**: Aggiungi `width: 100vw; height: 100vh;` allo style

### Problema: Scroll interno dell'iframe
**Soluzione**: Rimuovi overflow:hidden, aggiungi padding

### Problema: Cookie/Session persi
**Soluzione**: Configura CORS su Supabase

---

## 💰 Costi

### Attuali (Fase Sviluppo):
- Vercel: FREE (hobby)
- Supabase: FREE tier
- Resend: 3000 email/mese FREE

### Produzione (100+ prenotazioni/mese):
- Vercel: FREE (fino a 100GB bandwidth)
- Supabase Pro: ~$25/mese
- Resend: FREE fino a 3k email

**Totale: $25/mese** (esclusi hosting sito Wix)

---

## 📚 Risorse Aggiuntive

### Documentazione Wix:
- [Aggiungere codice personalizzato](https://support.wix.com/it/article/editor-wix-aggiungere-un-elemento-personalizzato-al-tuo-sito)
- [Incorpora sito o widget](https://support.wix.com/it/article/editor-wix-incorporare-un-sito-o-un-widget)

### Deploy Guide:
- [Vercel Docs](https://vercel.com/docs)
- [Netlify Docs](https://docs.netlify.com/)

### Progetto:
- Repository: `src/App.tsx`
- Database: Supabase Dashboard
- Migrations: `supabase/migrations/`

---

## ✅ Checklist Finale Pre-Go-Live

- [ ] Deploy su Vercel completato
- [ ] URL testato e funzionante
- [ ] Variabili ambiente configurate
- [ ] Embed aggiunto in Wix
- [ ] Test prenotazione funziona
- [ ] Test email ricevuta
- [ ] Mobile responsive verificato
- [ ] Analytics configurati
- [ ] Backup database creato
- [ ] Documentazione admin inviata

---

## 🎯 Prossimi Passi

1. **Deploy**: `npm run build && vercel --prod`
2. **Test**: Prenota test sul sito Wix
3. **Monitora**: Controlla Supabase Dashboard
4. **Itera**: Ottimizza design se necessario

---

## 📞 Support

### Problemi tecnici:
- Controlla `dist/` build è corretta
- Verifica console browser per errori
- Check Supabase logs

### Customizzazioni richieste:
- Modifica `src/App.tsx`
- Re-deploy con `vercel --prod`
- Refresha pagina Wix

---

**Autore**: Sistema di prenotazioni Al Ritrovo  
**Versione**: 1.0.0  
**Data**: Dicembre 2024  
**Status**: ✅ Pronto per produzione

