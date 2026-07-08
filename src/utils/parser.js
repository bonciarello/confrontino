/**
 * Parser per testo strutturato di schede tecniche.
 * Estrae coppie chiave-valore da righe con vari formati:
 *   "RAM: 8GB", "RAM = 8GB", "RAM - 8GB", "RAM\t8GB", "RAM 8GB"
 */

// Separatori che indicano una coppia chiave:valore
const KV_SEPARATORS = /^(.+?)\s*[:=]\s*(.+)$/;

// Pattern per estrarre il valore numerico da una stringa con unità
// Es: "8GB", "6.7\"", "5000 mAh", "6.7\" OLED"
const NUMERIC_PATTERN = /^([\d.,]+)\s*(\S*)/;

// Unità dove "più basso = meglio"
const LOWER_IS_BETTER_UNITS = new Set([
  'g', 'gr', 'grammi', 'kg',           // peso
  'mm', 'cm',                           // spessore
  '€', '$', '£', '¥', 'eur', 'usd',    // prezzo
  'nm',                                  // processo produttivo (chip)
  'ms',                                  // latenza
]);

// Unità dove "più alto = meglio" (default implicito)
const HIGHER_IS_BETTER_UNITS = new Set([
  'gb', 'tb', 'mb',                      // memoria
  'mhz', 'ghz',                          // frequenza
  'mah', 'wh',                           // batteria
  'mp', 'mpx',                           // fotocamera
  'nits', 'nit',                         // luminosità
  'hz',                                  // refresh rate
  'ppi', 'dpi',                          // densità display
  'mbps', 'gbps',                        // velocità rete
  'w',                                    // potenza (carica)
  '"', 'pollici', 'inch', 'inches',     // dimensione schermo
  'core', 'cores',                        // core processore
  'bit',                                  // colore
  'fps',                                  // frame rate
]);

/**
 * Estrae le coppie chiave-valore da un blocco di testo.
 * @param {string} text - Il testo strutturato della scheda tecnica
 * @returns {Array<{key: string, rawValue: string, numericValue: number|null, unit: string|null, isNumeric: boolean, lowerIsBetter: boolean}>}
 */
export function parseSpecs(text) {
  const lines = text.split(/\r?\n/);
  const specs = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#') || line.startsWith('//')) continue;

    let key, value;

    // Prova col pattern chiave:valore
    const kvMatch = line.match(KV_SEPARATORS);
    if (kvMatch) {
      key = kvMatch[1].trim();
      value = kvMatch[2].trim();
    } else {
      // Fallback: split su 2+ spazi
      const parts = line.split(/\s{2,}/);
      if (parts.length >= 2) {
        key = parts[0].trim();
        value = parts.slice(1).join(' ').trim();
      } else {
        // Split su tab
        const tabParts = line.split('\t');
        if (tabParts.length >= 2) {
          key = tabParts[0].trim();
          value = tabParts.slice(1).join(' ').trim();
        } else {
          continue; // non è una coppia riconoscibile
        }
      }
    }

    // Normalizza la chiave: prima lettera maiuscola, rimuovi spazi extra
    key = normalizeKey(key);

    // Tenta estrazione numerica
    const numericInfo = extractNumeric(value);

    specs.push({
      key,
      rawValue: value,
      numericValue: numericInfo.numericValue,
      unit: numericInfo.unit,
      isNumeric: numericInfo.numericValue !== null,
      lowerIsBetter: numericInfo.lowerIsBetter,
    });
  }

  return specs;
}

/**
 * Normalizza una chiave per il confronto.
 */
function normalizeKey(key) {
  return key
    .replace(/[_\-\s]+/g, ' ')
    .trim()
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Tenta di estrarre un valore numerico dalla stringa.
 */
function extractNumeric(value) {
  // Pulisci il valore: rimuovi virgole usate come separatori migliaia
  // ma mantieni il punto come decimale
  const cleaned = value.replace(/[,]/g, m => {
    // Se c'è un punto decimale dopo, la virgola è separatore migliaia
    return '';
  }).trim();

  const match = cleaned.match(NUMERIC_PATTERN);
  if (!match) return { numericValue: null, unit: null, lowerIsBetter: false };

  const numStr = match[1];
  const unit = match[2] ? match[2].toLowerCase() : '';

  // Converti a numero
  let num = parseFloat(numStr);
  if (isNaN(num)) return { numericValue: null, unit: null, lowerIsBetter: false };

  // Applica moltiplicatori di unità (es. 1.5 TB = 1536 GB, ma teniamo il raw)
  // Non convertiamo le unità, manteniamo il valore così com'è per il confronto
  // La conversione tra unità simili la facciamo dopo

  const lowerIsBetter = LOWER_IS_BETTER_UNITS.has(unit);

  return { numericValue: num, unit, lowerIsBetter };
}

/**
 * Confronta due valori e determina quale è "migliore".
 * @param {number} a - Primo valore numerico
 * @param {number} b - Secondo valore numerico
 * @param {boolean} lowerIsBetter - Se true, il valore più basso è migliore
 * @returns {number} -1 se a è migliore, 1 se b è migliore, 0 se uguali
 */
export function compareNumeric(a, b, lowerIsBetter = false) {
  if (a === b) return 0;
  if (lowerIsBetter) {
    return a < b ? -1 : 1;
  }
  return a > b ? -1 : 1;
}
