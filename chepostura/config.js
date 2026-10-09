/* Collegamento a Supabase. Finche' i due valori sono vuoti l'Area riservata gira
   in versione dimostrativa, con pazienti di esempio salvati solo in questo browser.
   Dove trovarli: Supabase > Project Settings > API.
   La "anon public key" e' fatta per stare in una pagina pubblica: la sicurezza la
   fanno le regole del database. La chiave "service_role" NON va mai messa qui. */
window.AREA_CONFIG = {
  supabaseUrl: '',
  supabaseAnonKey: ''
};
