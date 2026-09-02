# Setup Google Ads Dashboard API

Questa guida spiega come configurare il dashboard Google Ads e ottenere le credenziali necessarie.

## 📋 Prerequisiti

- Node.js v14+ installato
- Un account Google Ads attivo
- Accesso a Google Cloud Console

## 🔐 Fase 1: Ottenere le Credenziali Google Ads

### 1.1 Developer Token

1. Accedi a [Google Ads](https://ads.google.com)
2. Clicca su **Strumenti e impostazioni** ⚙️ → **Impostazioni account**
3. Vai su **Accesso API e autorizzazioni** → **API Center**
4. Richiedi un **Developer Token**
   - Motivo: "Personal development"
   - Descrizione: "Google Ads Dashboard"
5. **Nota**: L'approvazione richiede 24-48 ore

### 1.2 Google Cloud Project

1. Vai su [Google Cloud Console](https://console.cloud.google.com)
2. Crea un nuovo progetto:
   - Clicca su **Crea progetto**
   - Nome: "Google Ads Dashboard"
3. Abilita le API:
   - Vai su **API e servizi** → **Libreria**
   - Cerca "Google Ads API"
   - Clicca **Attiva**

### 1.3 OAuth 2.0 Credentials

1. In Google Cloud Console, vai a **API e servizi** → **Credenziali**
2. Clicca **Crea credenziali** → **ID client OAuth 2.0**
3. Tipo di applicazione: **Applicazione desktop**
4. Scarica il file JSON
5. Copia i seguenti valori dal file scaricato:
   - `client_id`
   - `client_secret`

### 1.4 Customer ID

1. In Google Ads, vai su **Strumenti e impostazioni** ⚙️
2. Cerca **ID account**
3. Copia il tuo Customer ID (es: 123-456-7890)

### 1.5 Refresh Token

Dopo aver configurato il tutto, esegui il seguente script per ottenere il Refresh Token:

```bash
cd api
node get-refresh-token.js
```

Seguire le istruzioni per fare il login e ottenere il token.

## 🚀 Fase 2: Configurazione del Progetto

### 2.1 Installare dipendenze

```bash
# Backend API
cd api
npm install

# Torna alla root
cd ..
```

### 2.2 Configurare le variabili d'ambiente

1. Copia `.env.example` a `.env`:
```bash
cp .env.example .env
```

2. Modifica `.env` con i tuoi dati:
```
GOOGLE_ADS_CUSTOMER_ID=123-456-7890
GOOGLE_ADS_DEVELOPER_TOKEN=your_token_here
GOOGLE_ADS_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_ADS_CLIENT_SECRET=your_client_secret_here
GOOGLE_ADS_REFRESH_TOKEN=your_refresh_token_here
PORT=3000
NODE_ENV=development
```

## ▶️ Fase 3: Avviare il Server

```bash
cd api
npm start
```

Il server sarà disponibile su: `http://localhost:3000`

## 📊 Fase 4: Accedere al Dashboard

1. Apri il file `dashboard-ads.html` nel browser
2. Se il server è in esecuzione, vedrai i dati caricati automaticamente
3. Puoi cambiare il periodo (7, 30, 90 giorni)

## 🔍 Endpoint API Disponibili

### GET `/api/health`
Verifica che il server sia attivo.

**Risposta:**
```json
{
  "status": "ok",
  "message": "Google Ads API server is running"
}
```

### GET `/api/summary?days=7`
Ottiene il riepilogo delle metriche di account.

**Parametri:**
- `days`: numero di giorni (default: 7)

**Risposta:**
```json
{
  "success": true,
  "data": {
    "period": { "startDate": "2024-08-26", "endDate": "2024-09-02" },
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

### GET `/api/campaigns?days=7`
Ottiene i dettagli di tutte le campagne.

### GET `/api/metrics?days=7`
Ottiene le metriche di account grezze.

## 🐛 Troubleshooting

### "Error: Invalid credentials"
- Verifica che i valori in `.env` siano corretti
- Assicurati che il Developer Token sia approvato
- Controlla che il Refresh Token sia valido

### "CORS error"
- Il backend deve essere in esecuzione su `http://localhost:3000`
- Apri il dashboard localmente, non tramite HTTPS

### "API not enabled"
- Vai su Google Cloud Console
- Assicurati che "Google Ads API" sia abilitata
- Potrebbero servire alcuni minuti per l'attivazione

### "Customer ID not found"
- Verifica che il Customer ID sia nel formato corretto (123-456-7890)
- Non usare dashes extra o spazi

## 📝 Note Importanti

- **Non commitare `.env`**: Aggiungi `.env` al `.gitignore`
- **Sicurezza**: Questi token danno accesso al tuo account Google Ads. Mantienili privati!
- **Limiti API**: Google Ads API ha limiti di rate limiting. Usa il caching dove possibile.
- **Sandbox**: Per testare senza rischi, usa Google Ads API Sandbox

## 📚 Risorse Aggiuntive

- [Google Ads API Documentation](https://developers.google.com/google-ads/api)
- [google-ads-api npm](https://github.com/Opteo/google-ads-api)
- [Google Cloud Console](https://console.cloud.google.com)

---

**Fatto con ❤️ per il vostro studio di kinesiologia**
