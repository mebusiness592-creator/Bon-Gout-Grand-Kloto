// Vérifie la configuration : npm run check:env  (lit .env.local, ou les variables du système)
import fs from "node:fs";
const env = { ...process.env };
for (const file of [".env.local", ".env"]) {
  if (!fs.existsSync(file)) continue;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_a-z]+)\s*=\s*(.*)\s*$/);
    if (m && !(m[1] in env)) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
let errors = 0, warns = 0;
const ok = (m) => console.log("  OK       " + m);
const ko = (m) => { errors++; console.log("  MANQUE   " + m); };
const wa = (m) => { warns++; console.log("  ATTENTION " + m); };
const has = (k) => Boolean(env[k] && String(env[k]).trim());

console.log("\n== Obligatoire ==");
has("MONGODB_URI") ? (/^mongodb(\+srv)?:\/\//.test(env.MONGODB_URI) ? ok("MONGODB_URI") : ko("MONGODB_URI : format invalide (mongodb+srv://…)")) : ko("MONGODB_URI");
has("AUTH_SECRET") ? (env.AUTH_SECRET.length >= 32 ? ok("AUTH_SECRET") : ko("AUTH_SECRET : 32 caractères minimum")) : ko("AUTH_SECRET");
for (const k of ["CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"]) has(k) ? ok(k) : ko(k + " (photos/vidéos)");

console.log("\n== Paiement mobile USSD ==");
for (const op of ["TMoney", "Flooz"]) {
  const k = `USSD_${op}_TEMPLATE`;
  if (!has(k)) { wa(`${k} non défini : ${op} affichera « code non configuré »`); continue; }
  const t = env[k].trim();
  if (!/^\*[0-9*{}a-z]+#$/.test(t)) { ko(`${k} : doit commencer par * et finir par # (chiffres, *, {amount}, {phone})`); continue; }
  if (/\{reference\}/.test(t)) { ko(`${k} : {reference} n'est pas utilisable (un code USSD ne peut contenir que des chiffres)`); continue; }
  const unknown = [...t.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).filter((v) => !["amount", "phone"].includes(v));
  if (unknown.length) { ko(`${k} : variables inconnues ${unknown.join(", ")}`); continue; }
  if (!t.includes("{amount}")) wa(`${k} : pas de {amount} → le client devra saisir le montant lui-même`);
  const sample = t.split("{amount}").join("2500").split("{phone}").join("90000000");
  ok(`${k} → exemple pour 2500 FCFA : ${sample}`);
}
console.log("  (le format est vérifié ici ; seul un test réel avec TMoney / Flooz confirme que le code est le bon)");

console.log("\n== OneSignal (notifications push) ==");
const app = env.NEXT_PUBLIC_ONESIGNAL_APP_ID || env.ONESIGNAL_APP_ID;
app ? (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(app) ? ok("App ID (format UUID)") : ko("App ID : doit ressembler à xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx")) : wa("NEXT_PUBLIC_ONESIGNAL_APP_ID non défini (push désactivé)");
if (has("ONESIGNAL_REST_API_KEY")) {
  const k = env.ONESIGNAL_REST_API_KEY;
  if (k.startsWith("os_v2_org_")) ko("ONESIGNAL_REST_API_KEY : c'est une clé d'ORGANISATION. Il faut la clé REST de l'APPLICATION (os_v2_app_…)");
  else ok("ONESIGNAL_REST_API_KEY");
} else wa("ONESIGNAL_REST_API_KEY non défini (push désactivé)");
if (!has("NEXT_PUBLIC_SITE_URL")) wa("NEXT_PUBLIC_SITE_URL non défini (liens des notifications push)");

console.log(`\n${errors} erreur(s), ${warns} avertissement(s).\n`);
process.exit(errors ? 1 : 0);
