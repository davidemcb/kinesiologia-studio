# 📊 Google Ads Dashboard

Una dashboard moderna e reattiva per visualizzare le metriche delle campagne Google Ads in tempo reale.

## ✨ Caratteristiche

- **📈 Metriche in tempo reale**: Impressioni, Click, Costo, CTR, CPC, Conversioni
- **📊 Grafici interattivi**: Visualizzazioni con Chart.js
- **📋 Tabella campagne**: Dettagli di tutte le campagne
- **🔄 Filtri temporali**: Dati ultimi 7, 30 o 90 giorni
- **📱 Responsive design**: Perfetto su desktop e mobile
- **🎨 UI moderna**: Gradiente viola/blu con animazioni

## 🚀 Quick Start

### 1. Configurazione API (primo setup)

Leggi [API_SETUP.md](./API_SETUP.md) per:
- Ottenere le credenziali Google Ads
- Configurare Google Cloud Project
- Impostare il file `.env`

### 2. Avviare il server

```bash
cd api
npm install
npm start
```

Vedrai:
```
Google Ads API server running on port 3000
```

### 3. Aprire il dashboard

Apri nel browser: `dashboard-ads.html`

Il dashboard caricherà automaticamente i dati dal server.

## 📁 Struttura del Progetto

```
.
├── api/
│   ├── server.js           # Server Express
│   ├── google-ads.js       # Client Google Ads API
│   ├── config.js           # Configurazione
│   ├── get-refresh-token.js # Helper per ottenere token
│   ├── package.json        # Dipendenze backend
│   └── .env                # Credenziali (non commitare!)
├── dashboard-ads.html      # Dashboard frontend
├── API_SETUP.md           # Guida setup completa
└── GOOGLE_ADS_README.md   # Questo file
```

## 📊 Cosa Puoi Visualizzare

### KPI Principali
- **Impressioni**: Quante volte il tuo annuncio è stato visto
- **Click**: Quanti click ricevuti
- **CTR**: Percentuale di click su impressioni
- **Costo**: Importo totale speso
- **CPC**: Costo medio per click
- **Conversioni**: Azioni completate (contatti, prenotazioni, etc.)

### Grafici
- Confronto Impressioni vs Click per campagna
- Distribuzione costo tra campagne

### Tabella Campagne
- Nome campagna
- Metriche dettagliate per ogni campagna
- Ordinabile e facilmente leggibile

## 🔌 API Endpoints

### `GET /api/health`
Verifica che il server sia attivo.

### `GET /api/summary?days=7`
Riepilogo completo con metriche e campagne.

**Parametri:**
- `days`: 7, 30 o 90 (default: 7)

**Risposta:**
```json
{
  "success": true,
  "data": {
    "period": { "startDate": "...", "endDate": "..." },
    "totalImpressions": 1250,
    "totalClicks": 45,
    "totalCost": 234.50,
    "totalConversions": 8,
    "averageCTR": 3.6,
    "averageCPC": 5.21,
    "totalCampaigns": 3,
    "campaigns": [...]
  }
}
```

### `GET /api/campaigns?days=7`
Lista di tutte le campagne con metriche.

### `GET /api/metrics?days=7`
Metriche di account grezze.

## 🎨 Personalizzazione

### Cambiare Colori

Nel file `dashboard-ads.html`, modifica il gradiente nella sezione `<style>`:

```css
body {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

### Aggiungere Metriche

Modifica la funzione `renderMetrics()` in `dashboard-ads.html`:

```javascript
<div class="metric-card">
    <div class="label">Nuova Metrica</div>
    <div class="value">${data.nuovaMetrica}</div>
</div>
```

### Cambiare Intervalli Temporali

In `dashboard-ads.html`, aggiungi nuove opzioni nel select:

```html
<option value="180">Ultimi 180 giorni</option>
```

## 🔐 Sicurezza

- **`.env` non commitato**: Aggiungi al `.gitignore`
- **Token privati**: Non condividere le credenziali
- **HTTPS in produzione**: Usa HTTPS su server pubblici
- **Rate limiting**: Implementa limiti di richieste

## 🐛 Problemi Comuni

### Errore CORS
- Assicurati che il server API sia in esecuzione su `http://localhost:3000`
- Il dashboard deve essere aperto da localhost

### "Invalid credentials"
- Verifica i valori nel file `.env`
- Assicurati che il Developer Token sia approvato
- Controlla che il Refresh Token sia valido

### Dati non caricati
- Apri la console del browser (F12)
- Verifica se ci sono errori di API
- Assicurati che il server sia in esecuzione

## 📖 Documentazione Completa

Leggi [API_SETUP.md](./API_SETUP.md) per:
- Configurazione dettagliata
- Troubleshooting avanzato
- Limiti e best practices

## 🚀 Deployment

### Heroku

```bash
heroku login
heroku create your-app-name
git push heroku main
```

### Vercel

```bash
npm i -g vercel
vercel
```

Imposta le variabili d'ambiente su Vercel.

### AWS/Azure/DigitalOcean

Similmente, aggiungi le variabili d'ambiente nel tuo servizio di hosting.

## 📝 Note

- Il dashboard update i dati automaticamente al caricamento
- Usa il bottone "Aggiorna" per refresh manuale
- Cambiare il periodo fa un nuovo caricamento

## 📞 Supporto

Per problemi:
1. Controlla [API_SETUP.md](./API_SETUP.md) sezione Troubleshooting
2. Verifica la console del browser (F12)
3. Controlla i log del server API

## 📄 Licenza

Creato per lo studio di kinesiologia. Uso libero.

---

**Versione:** 1.0.0  
**Ultimo aggiornamento:** 2 Settembre 2026  
**Autore:** Claude Code
