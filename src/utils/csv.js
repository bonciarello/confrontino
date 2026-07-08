/**
 * Utilità per l'esportazione CSV.
 */

/**
 * Converte l'array di righe della tabella in CSV e scarica il file.
 * @param {Array<{key: string, values: Array<{rawValue: string, isBest: boolean}>}>} rows
 * @param {Array<string>} deviceNames
 */
export function exportToCSV(rows, deviceNames) {
  // Header: "Caratteristica", nome dispositivo 1, nome dispositivo 2, ...
  const headers = ['Caratteristica', ...deviceNames];

  // Righe dati
  const dataRows = rows.map(row => {
    const values = row.values.map(v => escapeCSV(v ? v.rawValue || '—' : '—'));
    return [escapeCSV(row.key), ...values];
  });

  // Costruisci contenuto CSV
  const csvLines = [
    headers.map(escapeCSV).join(','),
    ...dataRows.map(r => r.join(',')),
  ];

  const csvContent = csvLines.join('\n');
  const BOM = '\uFEFF'; // BOM per compatibilità Excel

  // Crea blob e trigger download
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `confrontino-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Escapa un valore per CSV.
 */
function escapeCSV(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}
