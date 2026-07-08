import { describe, it, expect } from 'vitest';
import { parseSpecs, compareNumeric } from './parser';

describe('parseSpecs', () => {
  it('parses colon-separated key:value pairs', () => {
    const input = `RAM: 8GB
Display: 6.7" OLED
Processore: Snapdragon 8 Gen 3`;
    const result = parseSpecs(input);
    expect(result).toHaveLength(3);
    expect(result[0]).toMatchObject({ key: 'Ram', rawValue: '8GB', isNumeric: true });
    expect(result[1]).toMatchObject({ key: 'Display', rawValue: '6.7" OLED', isNumeric: true });
    expect(result[2]).toMatchObject({ key: 'Processore', rawValue: 'Snapdragon 8 Gen 3' });
  });

  it('parses equals-separated key=value pairs', () => {
    const input = `RAM = 16 GB
Storage = 512 GB`;
    const result = parseSpecs(input);
    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({ key: 'Ram', rawValue: '16 GB', isNumeric: true });
    expect(result[1]).toMatchObject({ key: 'Storage', rawValue: '512 GB', isNumeric: true });
  });

  it('parses tab-separated pairs', () => {
    const input = `RAM\t8GB\nDisplay\t6.1"`;
    const result = parseSpecs(input);
    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({ key: 'Ram', rawValue: '8GB' });
  });

  it('skips empty lines and comments', () => {
    const input = `# Scheda tecnica
RAM: 8GB

// Commento
Batteria: 5000 mAh`;
    const result = parseSpecs(input);
    expect(result).toHaveLength(2);
  });

  it('extracts numeric values with units', () => {
    const result = parseSpecs('RAM: 8GB');
    expect(result[0]).toMatchObject({
      numericValue: 8,
      unit: 'gb',
      isNumeric: true,
    });
  });

  it('detects lower-is-better units (weight, price)', () => {
    const weightResult = parseSpecs('Peso: 232 g');
    expect(weightResult[0].lowerIsBetter).toBe(true);

    const priceResult = parseSpecs('Prezzo: 999 €');
    expect(priceResult[0].lowerIsBetter).toBe(true);
  });

  it('detects higher-is-better units (RAM, battery)', () => {
    const ramResult = parseSpecs('RAM: 8 GB');
    expect(ramResult[0].lowerIsBetter).toBe(false);

    const battResult = parseSpecs('Batteria: 5000 mAh');
    expect(battResult[0].lowerIsBetter).toBe(false);
  });

  it('handles non-numeric values correctly', () => {
    const result = parseSpecs('Marca: Samsung');
    expect(result[0]).toMatchObject({
      isNumeric: false,
      numericValue: null,
      unit: null,
    });
  });

  it('normalizes key names', () => {
    const result = parseSpecs('display_size: 6.7"');
    expect(result[0].key).toBe('Display Size');
  });

  it('handles multiple spaces between key and value', () => {
    const result = parseSpecs('RAM     8GB');
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ key: 'Ram', rawValue: '8GB' });
  });

  it('handles values with leading commas/decimals', () => {
    const result = parseSpecs('Display: 6.7"');
    expect(result[0].numericValue).toBe(6.7);
  });

  it('returns empty array for empty input', () => {
    expect(parseSpecs('')).toHaveLength(0);
    expect(parseSpecs('   \n  \n  ')).toHaveLength(0);
  });
});

describe('compareNumeric', () => {
  it('higher is better: 16 > 8', () => {
    expect(compareNumeric(16, 8, false)).toBe(-1); // a is better
    expect(compareNumeric(8, 16, false)).toBe(1);  // b is better
  });

  it('lower is better: 200g > 230g', () => {
    expect(compareNumeric(200, 230, true)).toBe(-1); // a is better (lighter)
    expect(compareNumeric(230, 200, true)).toBe(1);  // b is better (lighter)
  });

  it('equal values return 0', () => {
    expect(compareNumeric(8, 8, false)).toBe(0);
    expect(compareNumeric(8, 8, true)).toBe(0);
  });
});
