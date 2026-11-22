/**
 * Construit le code USSD à partir du modèle des variables d'environnement (jamais dans le code).
 * Variables de modèle : {amount} (montant entier en FCFA) et {phone} (numéro du client, chiffres uniquement).
 * Un code USSD ne contient que des chiffres, * et # : on refuse tout résultat qui sortirait de ce format.
 */
export function buildUssd(operator: string | undefined, amount: number, _reference: string, phone: string): string | null {
  void _reference;
  if (!operator) return null;
  const tpl = process.env[`USSD_${operator}_TEMPLATE`];
  if (!tpl) return null;
  const code = tpl.trim().split("{amount}").join(String(Math.round(amount))).split("{phone}").join(phone.replace(/\D/g, ""));
  return /^\*[0-9*]+#$/.test(code) ? code : null;
}
