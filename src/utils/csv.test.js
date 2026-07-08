import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exportToCSV } from './csv';

describe('exportToCSV', () => {
  beforeEach(() => {
    // Mock URL.createObjectURL and revokeObjectURL
    global.URL.createObjectURL = vi.fn(() => 'blob:mock');
    global.URL.revokeObjectURL = vi.fn();

    // Mock anchor click
    HTMLAnchorElement.prototype.click = vi.fn();
  });

  it('generates a CSV file with correct structure', () => {
    const rows = [
      {
        key: 'RAM',
        values: [
          { rawValue: '8 GB' },
          { rawValue: '16 GB' },
        ],
      },
      {
        key: 'Display',
        values: [
          { rawValue: '6.1"' },
          { rawValue: '6.7"' },
        ],
      },
    ];
    const deviceNames = ['iPhone 15', 'Galaxy S24'];

    // Intercetta appendChild per leggere il contenuto del blob
    const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation((el) => {
      // Leggi href dell'anchor
      return el;
    });

    const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => {});

    exportToCSV(rows, deviceNames);

    expect(global.URL.createObjectURL).toHaveBeenCalled();
    expect(HTMLAnchorElement.prototype.click).toHaveBeenCalled();
    expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock');

    appendChildSpy.mockRestore();
    removeChildSpy.mockRestore();
  });

  it('escapes values with commas and quotes', () => {
    const rows = [
      {
        key: 'Nome',
        values: [
          { rawValue: 'iPhone 15 "Pro"' },
        ],
      },
    ];
    const deviceNames = ['Dispositivo'];

    const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation((el) => {
      expect(el.download).toContain('confrontino-');
      expect(el.download).toContain('.csv');
      return el;
    });
    const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => {});

    exportToCSV(rows, deviceNames);

    appendChildSpy.mockRestore();
    removeChildSpy.mockRestore();
  });

  it('handles missing values gracefully', () => {
    const rows = [
      {
        key: 'RAM',
        values: [
          { rawValue: '8 GB' },
          null,
        ],
      },
    ];
    const deviceNames = ['A', 'B'];

    expect(() => exportToCSV(rows, deviceNames)).not.toThrow();
  });
});
