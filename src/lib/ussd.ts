/** Construit le code USSD à partir du modèle défini dans les variables d'environnement (jamais dans le code). */
export function buildUssd(operator: string | undefined, amount: number, reference: string, phone: string): string | null {
  if (!operator) return null;
  const tpl = process.env[`USSD_${operator}_TEMPLATE`];
  if (!tpl) return null;
  return tpl.split("{amount}").join(String(Math.round(amount))).split("{reference}").join(reference).split("{phone}").join(phone);
}
