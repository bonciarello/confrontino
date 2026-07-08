import { useState, useMemo } from 'react';
import Header from './components/Header';
import DeviceInput from './components/DeviceInput';
import FilterBar from './components/FilterBar';
import ComparisonTable from './components/ComparisonTable';
import { exportToCSV } from './utils/csv';
import { parseSpecs } from './utils/parser';

export default function App() {
  const [devices, setDevices] = useState([
    { name: '', specs: '' },
    { name: '', specs: '' },
  ]);
  const [filterText, setFilterText] = useState('');

  // Dispositivi con dati inseriti
  const activeDevices = useMemo(
    () => devices.filter(d => d.specs.trim().length > 0),
    [devices]
  );

  const hasData = activeDevices.length >= 2;

  // Pre-calcola i dati per l'export CSV
  const handleExport = () => {
    const allDevices = activeDevices.map((d, i) => ({
      name: d.name || `Dispositivo ${i + 1}`,
      specs: parseSpecs(d.specs),
    }));

    const keyMap = new Map();
    for (const device of allDevices) {
      for (const spec of device.specs) {
        if (!keyMap.has(spec.key)) {
          keyMap.set(spec.key, []);
        }
      }
    }

    const rows = [];
    for (const [key] of keyMap) {
      const values = allDevices.map(dev => {
        const match = dev.specs.find(s => s.key === key);
        return match || null;
      });
      rows.push({ key, values });
    }

    exportToCSV(rows, allDevices.map(d => d.name));
  };

  return (
    <div className="app">
      <Header />
      <main className="app-main">
        <DeviceInput devices={devices} setDevices={setDevices} />

        {hasData && (
          <>
            <div className="toolbar">
              <FilterBar
                filterText={filterText}
                setFilterText={setFilterText}
                totalRows={0}
                filteredRows={0}
              />
              <button
                className="export-btn"
                onClick={handleExport}
                title="Esporta in CSV"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M8 1V11M8 11L4 7M8 11L12 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M2 13H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                Esporta CSV
              </button>
            </div>
            <ComparisonTable devices={activeDevices} filterText={filterText} />
          </>
        )}

        {!hasData && devices.some(d => d.specs.trim().length > 0) && (
          <div className="table-empty" role="status">
            <div className="table-empty__icon">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
                <rect x="8" y="14" width="32" height="24" rx="2" stroke="currentColor" strokeWidth="1.5" />
                <line x1="8" y1="20" x2="40" y2="20" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </div>
            <p className="table-empty__title">Inserisci almeno due dispositivi</p>
            <p className="table-empty__desc">
              Incolla le schede tecniche di almeno due dispositivi per visualizzare la tabella comparativa.
              Usa il pulsante &ldquo;Carica esempio&rdquo; per vedere subito come funziona.
            </p>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>Confrontino — Confronto schede tecniche per dispositivi</p>
        <p className="app-footer__hint">
          Suggerimento: premi <kbd>Ctrl+F</kbd> per filtrare le caratteristiche
        </p>
      </footer>
    </div>
  );
}
