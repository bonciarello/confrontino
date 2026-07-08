import { useState } from 'react';

const DEVICE_COLORS = [
  { name: 'Blu Cobalto', color: '#2255E8', bg: '#EBF0FD' },
  { name: 'Ambra', color: '#E87700', bg: '#FFF5EB' },
  { name: 'Verde Salvia', color: '#0D9488', bg: '#EBF7F6' },
  { name: 'Viola', color: '#7C3AED', bg: '#F3EEFF' },
];

const INITIAL_PLACEHOLDERS = [
  `Marca: Samsung
Modello: Galaxy S24 Ultra
Display: 6.8" Dynamic AMOLED 2X
Risoluzione: 3120 x 1440 px
RAM: 12 GB
Storage: 256 GB
Processore: Snapdragon 8 Gen 3
Batteria: 5000 mAh
Peso: 232 g
Fotocamera: 200 MP`,
  `Marca: Apple
Modello: iPhone 15 Pro Max
Display: 6.7" OLED Super Retina XDR
Risoluzione: 2796 x 1290 px
RAM: 8 GB
Storage: 256 GB
Processore: A17 Pro
Batteria: 4441 mAh
Peso: 221 g
Fotocamera: 48 MP`,
];

export default function DeviceInput({ devices, setDevices }) {
  const [activeInput, setActiveInput] = useState(null);

  const addDevice = () => {
    if (devices.length >= 4) return;
    setDevices([...devices, { name: '', specs: '' }]);
  };

  const removeDevice = (index) => {
    const newDevices = devices.filter((_, i) => i !== index);
    // Rinomina i dispositivi rimanenti
    const renamed = newDevices.map((d, i) => ({
      ...d,
      name: d.name || `Dispositivo ${i + 1}`,
    }));
    setDevices(renamed);
  };

  const updateDevice = (index, field, value) => {
    const newDevices = [...devices];
    newDevices[index] = { ...newDevices[index], [field]: value };
    setDevices(newDevices);
  };

  const insertExample = (index) => {
    const exampleIdx = index % INITIAL_PLACEHOLDERS.length;
    updateDevice(index, 'specs', INITIAL_PLACEHOLDERS[exampleIdx]);
    if (!devices[index].name || devices[index].name === `Dispositivo ${index + 1}`) {
      const defaultNames = ['Galaxy S24 Ultra', 'iPhone 15 Pro Max'];
      updateDevice(index, 'name', defaultNames[exampleIdx] || `Dispositivo ${index + 1}`);
    }
  };

  return (
    <section className="device-inputs" aria-label="Inserimento schede tecniche">
      <div className="inputs-header">
        <h2 className="inputs-title">Incolla le schede tecniche</h2>
        <p className="inputs-subtitle">
          Aggiungi fino a 4 dispositivi e incolla i dati nel formato che preferisci —
          funziona con <code>Chiave: Valore</code>, <code>Chiave = Valore</code> o testo tabellare.
        </p>
      </div>

      <div className="inputs-grid">
        {devices.map((device, index) => (
          <div
            key={index}
            className={`input-card ${activeInput === index ? 'input-card--active' : ''}`}
            style={{
              '--card-accent': DEVICE_COLORS[index].color,
              '--card-accent-bg': DEVICE_COLORS[index].bg,
            }}
          >
            <div className="input-card__header">
              <div className="input-card__chip" style={{ background: DEVICE_COLORS[index].color }}>
                {index + 1}
              </div>
              <label htmlFor={`device-name-${index}`} className="sr-only">
                Nome dispositivo {index + 1}
              </label>
              <input
                id={`device-name-${index}`}
                type="text"
                className="input-card__name"
                placeholder={`Dispositivo ${index + 1}`}
                value={device.name}
                onChange={(e) => updateDevice(index, 'name', e.target.value)}
                onFocus={() => setActiveInput(index)}
                maxLength={40}
              />
              {devices.length > 2 && (
                <button
                  className="input-card__remove"
                  onClick={() => removeDevice(index)}
                  aria-label={`Rimuovi ${device.name || 'Dispositivo ' + (index + 1)}`}
                  title="Rimuovi dispositivo"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              )}
            </div>

            <label htmlFor={`device-specs-${index}`} className="sr-only">
              Specifiche tecniche {device.name || `dispositivo ${index + 1}`}
            </label>
            <textarea
              id={`device-specs-${index}`}
              className="input-card__textarea"
              placeholder={`Processore: Snapdragon 8 Gen 3\nRAM: 12 GB\nDisplay: 6.8" AMOLED\nBatteria: 5000 mAh\nFotocamera: 200 MP\n…`}
              value={device.specs}
              onChange={(e) => updateDevice(index, 'specs', e.target.value)}
              onFocus={() => setActiveInput(index)}
              rows={8}
              spellCheck={false}
            />

            <button
              type="button"
              className="input-card__example-btn"
              onClick={() => insertExample(index)}
            >
              Carica esempio
            </button>
          </div>
        ))}

        {devices.length < 4 && (
          <button
            className="add-device-btn"
            onClick={addDevice}
            aria-label="Aggiungi un altro dispositivo"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 3" />
              <path d="M10 6V14M6 10H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span>Aggiungi dispositivo</span>
          </button>
        )}
      </div>
    </section>
  );
}
