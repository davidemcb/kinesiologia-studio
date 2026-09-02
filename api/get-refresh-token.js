const { google } = require('googleapis');
const readline = require('readline');
const fs = require('fs');
require('dotenv').config();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_ADS_CLIENT_ID,
  process.env.GOOGLE_ADS_CLIENT_SECRET,
  'http://localhost:3000/callback' // Redirect URI
);

const scopes = ['https://www.googleapis.com/auth/adwords'];

function getAuthUrl() {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
  });
  console.log('\n🔓 Autorizza l\'applicazione:');
  console.log('Apri questo URL nel tuo browser:');
  console.log(authUrl);
  console.log('\n');
}

async function getRefreshToken(authCode) {
  try {
    const { credentials } = await oauth2Client.getToken(authCode);
    console.log('\n✅ Refresh Token ottenuto con successo!\n');
    console.log('Copia questo valore nel tuo file .env:');
    console.log('GOOGLE_ADS_REFRESH_TOKEN=' + credentials.refresh_token);
    console.log('\n');
  } catch (error) {
    console.error('❌ Errore nell\'ottenimento del token:', error.message);
  }
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log('🔐 Google Ads Refresh Token Generator\n');

if (!process.env.GOOGLE_ADS_CLIENT_ID || !process.env.GOOGLE_ADS_CLIENT_SECRET) {
  console.error('❌ Errore: GOOGLE_ADS_CLIENT_ID o GOOGLE_ADS_CLIENT_SECRET non trovati in .env');
  process.exit(1);
}

getAuthUrl();

rl.question('Incolla il codice di autorizzazione qui: ', (authCode) => {
  getRefreshToken(authCode).then(() => {
    rl.close();
  });
});
