import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-cream to-warm-beige">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 md:p-12">
          {/* Header */}
          <div className="mb-8 pb-6 border-b-2 border-warm-wood/20">
            <Link 
              to="/prenota" 
              className="inline-flex items-center gap-2 text-warm-orange hover:text-warm-wood-dark transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Torna al form di prenotazione</span>
            </Link>
            <h1 className="text-4xl font-serif font-bold text-warm-wood-dark mb-2">
              Privacy Policy
            </h1>
            <p className="text-sm text-gray-600">
              Ultimo aggiornamento: 29 Ottobre 2025
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none space-y-8">
            {/* Section 1 */}
            <section>
              <h2 className="text-2xl font-serif font-bold text-warm-wood-dark mb-4">
                1. Titolare del Trattamento dei Dati
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Il titolare del trattamento dei dati personali è:
              </p>
              <div className="bg-warm-cream/50 border-l-4 border-warm-wood p-4 rounded-lg mb-4">
                <p className="font-bold text-warm-wood-dark text-lg">Al Ritrovo</p>
                <p className="text-gray-700">Via degli Orefici, 4 - Bologna</p>
                <p className="text-gray-700">40124 Bologna (BO), Italia</p>
                <p className="text-gray-700 mt-2">
                  Email: <a href="mailto:info@alritrovo.com" className="text-warm-orange hover:underline font-semibold">
                    info@alritrovo.com
                  </a>
                </p>
              </div>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-2xl font-serif font-bold text-warm-wood-dark mb-4">
                2. Finalità del Trattamento dei Dati
              </h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                I dati personali raccolti tramite il form di prenotazione saranno trattati esclusivamente per:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Gestire e confermare le vostre prenotazioni presso il nostro ristorante</li>
                <li>Comunicare con voi per confermare, modificare o annullare le prenotazioni</li>
                <li>Assicurare la gestione ottimale del servizio di ristorazione</li>
                <li>Inviare eventuali comunicazioni relative alla vostra prenotazione</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-2xl font-serif font-bold text-warm-wood-dark mb-4">
                3. Tipologie di Dati Raccolti
              </h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                Raccogliamo i seguenti dati personali:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Nome completo</strong> - necessario per identificare la prenotazione</li>
                <li><strong>Indirizzo email</strong> - per inviare conferme e comunicazioni</li>
                <li><strong>Numero di telefono</strong> (facoltativo) - per contatti urgenti</li>
                <li><strong>Data e ora</strong> della prenotazione desiderata</li>
                <li><strong>Numero di ospiti</strong> e tipo di evento</li>
                <li><strong>Note speciali</strong> (facoltative) - intolleranze, preferenze alimentari, ecc.</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-2xl font-serif font-bold text-warm-wood-dark mb-4">
                4. Base Giuridica del Trattamento
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Il trattamento dei vostri dati personali si basa sul consenso esplicito che rilasciate 
                compilando e inviando il form di prenotazione, nonché sulla necessità di eseguire 
                misure precontrattuali su vostra richiesta (art. 6, par. 1, lett. a) e b) del GDPR).
              </p>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-2xl font-serif font-bold text-warm-wood-dark mb-4">
                5. Conservazione dei Dati
              </h2>
              <p className="text-gray-700 leading-relaxed">
                I dati saranno conservati per il tempo strettamente necessario alle finalità sopra indicate. 
                In particolare, i dati relativi alle prenotazioni saranno conservati per un periodo massimo 
                di 2 anni dalla data della prenotazione, salvo obblighi di legge che richiedano una conservazione 
                più prolungata.
              </p>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="text-2xl font-serif font-bold text-warm-wood-dark mb-4">
                6. Comunicazione e Diffusione dei Dati
              </h2>
              <p className="text-gray-700 leading-relaxed">
                I vostri dati personali non saranno diffusi né comunicati a terzi, salvo nei seguenti casi:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-3">
                <li>Quando la comunicazione sia necessaria per l'esecuzione del contratto di servizio</li>
                <li>Quando la comunicazione sia imposta per obbligo di legge</li>
                <li>A prestatori di servizi che operano come responsabili del trattamento (es. servizi di hosting, email)</li>
              </ul>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="text-2xl font-serif font-bold text-warm-wood-dark mb-4">
                7. Diritti dell'Interessato
              </h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                Ai sensi degli articoli 15-22 del GDPR, avete diritto a:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Accesso</strong> ai dati personali</li>
                <li><strong>Rettifica</strong> dei dati inesatti</li>
                <li><strong>Cancellazione</strong> dei dati ("diritto all'oblio")</li>
                <li><strong>Limitazione</strong> del trattamento</li>
                <li><strong>Portabilità</strong> dei dati</li>
                <li><strong>Opposizione</strong> al trattamento</li>
                <li>Revocare il consenso in qualsiasi momento</li>
                <li>Proporre reclamo all'Autorità Garante per la protezione dei dati personali</li>
              </ul>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className="text-2xl font-serif font-bold text-warm-wood-dark mb-4">
                8. Modalità di Esercizio dei Diritti
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Per esercitare i vostri diritti, potete rivolgerci scrivendo a:{' '}
                <a href="mailto:info@alritrovo.com" className="text-warm-orange hover:underline font-semibold">
                  info@alritrovo.com
                </a>
              </p>
            </section>

            {/* Section 9 */}
            <section>
              <h2 className="text-2xl font-serif font-bold text-warm-wood-dark mb-4">
                9. Sicurezza dei Dati
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Adottiamo misure tecniche e organizzative appropriate per proteggere i vostri dati personali 
                contro la perdita, l'alterazione, la divulgazione o l'accesso non autorizzato. I dati sono 
                memorizzati su server sicuri e protetti da firewall e crittografia SSL/TLS.
              </p>
            </section>

            {/* Footer */}
            <div className="mt-12 pt-8 border-t-2 border-warm-wood/20">
              <p className="text-sm text-gray-500 italic text-center">
                Questa Privacy Policy è parte integrante dei termini di utilizzo del servizio di prenotazione.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

