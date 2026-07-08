import { useState, useMemo } from 'react';
import { parseSpecs, compareNumeric } from '../utils/parser';

const DEVICE_COLORS = ['#2255E8', '#E87700', '#0D9488', '#7C3AED'];

export default function ComparisonTable({ devices, filterText = '' }) {
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  // Elabora i dati: parse specs per ogni dispositivo
  const allRows = useMemo(() => {
    const allDevices = devices.map((d, i) => ({
      name: d.name || `Dispositivo ${i + 1}`,
      specs: parseSpecs(d.specs),
      index: i,
    }));

    // Raccogli tutte le chiavi uniche nell'ordine di apparizione
    const keyMap = new Map();
    for (const device of allDevices) {
      for (const spec of device.specs) {
        if (!keyMap.has(spec.key)) {
          keyMap.set(spec.key, []);
        }
      }
    }

    // Per ogni chiave, raccogli il valore di ogni dispositivo
    const rows = [];
    for (const [key] of keyMap) {
      const values = allDevices.map(dev => {
        const match = dev.specs.find(s => s.key === key);
        return match || null;
      });

      // Determina se lowerIsBetter per questa chiave
      let lowerIsBetter = false;
      for (const v of values) {
        if (v && v.isNumeric) {
          lowerIsBetter = v.lowerIsBetter;
          break;
        }
      }

      // Trova il valore "migliore" tra quelli numerici
      const numericValues = values
        .map((v, i) => (v && v.isNumeric ? { ...v, deviceIndex: i } : null))
        .filter(Boolean);

      let bestIndices = new Set();
      if (numericValues.length >= 2) {
        let bestVal = numericValues[0].numericValue;
        for (let i = 1; i < numericValues.length; i++) {
          const cmp = compareNumeric(numericValues[i].numericValue, bestVal, lowerIsBetter);
          if (cmp === -1) {
            bestVal = numericValues[i].numericValue;
          }
        }
        for (const nv of numericValues) {
          if (nv.numericValue === bestVal) {
            bestIndices.add(nv.deviceIndex);
          }
        }
      }

      rows.push({
        key,
        values,
        bestIndices,
      });
    }

    return {
      rows,
      deviceNames: allDevices.map(d => d.name),
    };
  }, [devices]);

  // Filtraggio
  const filteredRows = useMemo(() => {
    const filter = filterText.toLowerCase().trim();
    if (!filter) return allRows.rows;
    return allRows.rows.filter(row =>
      row.key.toLowerCase().includes(filter) ||
      row.values.some(v => v && v.rawValue.toLowerCase().includes(filter))
    );
  }, [allRows.rows, filterText]);

  // Ordinamento
  const sortedRows = useMemo(() => {
    if (sortColumn === null) return filteredRows;
    const sorted = [...filteredRows].sort((a, b) => {
      const valA = a.values[sortColumn];
      const valB = b.values[sortColumn];

      if (valA?.isNumeric && valB?.isNumeric) {
        const diff = valA.numericValue - valB.numericValue;
        return sortDirection === 'asc' ? diff : -diff;
      }

      const strA = valA?.rawValue || '';
      const strB = valB?.rawValue || '';
      const cmp = strA.localeCompare(strB, 'it', { numeric: true });
      return sortDirection === 'asc' ? cmp : -cmp;
    });
    return sorted;
  }, [filteredRows, sortColumn, sortDirection]);

  const handleSort = (colIndex) => {
    if (sortColumn === colIndex) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortColumn(null);
        setSortDirection('asc');
      }
    } else {
      setSortColumn(colIndex);
      setSortDirection('asc');
    }
  };

  if (allRows.rows.length === 0) {
    return (
      <div className="table-empty" role="status">
        <div className="table-empty__icon">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
            <rect x="8" y="14" width="32" height="24" rx="2" stroke="currentColor" strokeWidth="1.5" />
            <line x1="8" y1="20" x2="40" y2="20" stroke="currentColor" strokeWidth="1.5" />
            <line x1="16" y1="14" x2="16" y2="8" stroke="currentColor" strokeWidth="1.5" />
            <line x1="32" y1="14" x2="32" y2="8" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="24" cy="30" r="1.5" fill="currentColor" />
          </svg>
        </div>
        <p className="table-empty__title">Nessun dato da confrontare</p>
        <p className="table-empty__desc">
          Incolla almeno due schede tecniche nei pannelli qui sopra per generare la tabella comparativa.
        </p>
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      {/* Righello di precisione decorativo */}
      <div className="table-ruler" aria-hidden="true">
        {Array.from({ length: 25 }, (_, i) => (
          <span key={i} className={`tick ${i % 5 === 0 ? 'tick--major' : ''}`} />
        ))}
      </div>

      <div className="table-scroll" role="region" aria-label="Tabella comparativa" tabIndex={0}>
        <table className="comparison-table">
          <thead>
            <tr>
              <th className="th-key" scope="col">
                <span className="th-label">Caratteristica</span>
              </th>
              {allRows.deviceNames.map((name, i) => (
                <th
                  key={i}
                  scope="col"
                  className={`th-device ${sortColumn === i ? 'th-device--sorted' : ''}`}
                  style={{ '--device-color': DEVICE_COLORS[i] }}
                >
                  <button
                    className="th-sort-btn"
                    onClick={() => handleSort(i)}
                    aria-label={`Ordina per ${name}`}
                  >
                    <span className="th-dot" style={{ background: DEVICE_COLORS[i] }} aria-hidden="true" />
                    {name}
                    <span className="th-sort-arrow" aria-hidden="true">
                      {sortColumn === i ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
                    </span>
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row, rowIdx) => (
              <tr key={row.key} className={rowIdx % 2 === 0 ? 'tr-even' : 'tr-odd'}>
                <td className="td-key">
                  <span className="key-name">{row.key}</span>
                </td>
                {row.values.map((val, colIdx) => (
                  <td
                    key={colIdx}
                    className={`td-value ${row.bestIndices.has(colIdx) ? 'td-value--best' : ''}`}
                    style={{
                      '--device-color': DEVICE_COLORS[colIdx],
                    }}
                  >
                    {val ? (
                      <>
                        <span className={`value-text ${val.isNumeric ? 'value-text--numeric' : ''}`}>
                          {val.isNumeric ? (
                            <>
                              <span className="value-number">{val.numericValue}</span>
                              {val.unit && <span className="value-unit">{val.unit}</span>}
                            </>
                          ) : (
                            val.rawValue
                          )}
                        </span>
                        {row.bestIndices.has(colIdx) && row.bestIndices.size < row.values.filter(v => v?.isNumeric).length && (
                          <span className="best-badge" aria-label="Migliore">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                              <path d="M6 1L7.5 4.5L11 5L8.5 7.5L9 11L6 9.5L3 11L3.5 7.5L1 5L4.5 4.5L6 1Z" fill="currentColor" />
                            </svg>
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="value-text value-text--missing">—</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="table-footer" aria-live="polite">
        <p className="table-footer__text">
          {allRows.rows.length} caratteristiche a confronto
          {filterText && ` — ${sortedRows.length} visibili`}
        </p>
      </div>
    </div>
  );
}
