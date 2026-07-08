import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

// Mock CSV export
vi.mock('../utils/csv', () => ({
  exportToCSV: vi.fn(),
}));

describe('App', () => {
  it('renders the header with app name', () => {
    render(<App />);
    expect(screen.getByText('Confrontino')).toBeInTheDocument();
  });

  it('renders device input cards initially', () => {
    render(<App />);
    const textareas = screen.getAllByRole('textbox');
    // Due textarea per i due dispositivi iniziali
    expect(textareas.length).toBeGreaterThanOrEqual(2);
  });

  it('shows add device button', () => {
    render(<App />);
    expect(screen.getByText('Aggiungi dispositivo')).toBeInTheDocument();
  });

  it('shows empty state message when no specs are entered', () => {
    render(<App />);
    // Non dovrebbe mostrare la tabella se nessun dato è inserito
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('allows adding a third device', () => {
    render(<App />);
    const addBtn = screen.getByText('Aggiungi dispositivo');
    fireEvent.click(addBtn);
    // Dovrebbero esserci 3 textarea ora
    const textareas = screen.getAllByRole('textbox');
    expect(textareas.length).toBeGreaterThanOrEqual(3);
  });

  it('shows comparison table when two devices have data', () => {
    render(<App />);

    const textareas = screen.getAllByRole('textbox');
    // I primi due sono le textarea delle specifiche
    const specsTextareas = textareas.filter(el => el.tagName === 'TEXTAREA');

    fireEvent.change(specsTextareas[0], { target: { value: 'RAM: 8GB\nBatteria: 4000 mAh' } });
    fireEvent.change(specsTextareas[1], { target: { value: 'RAM: 16GB\nBatteria: 5000 mAh' } });

    // La tabella dovrebbe apparire
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('Ram')).toBeInTheDocument();
    expect(screen.getByText('Batteria')).toBeInTheDocument();
  });

  it('shows filter bar when table is visible', () => {
    render(<App />);

    const textareas = screen.getAllByRole('textbox');
    const specsTextareas = textareas.filter(el => el.tagName === 'TEXTAREA');

    fireEvent.change(specsTextareas[0], { target: { value: 'RAM: 8GB' } });
    fireEvent.change(specsTextareas[1], { target: { value: 'RAM: 16GB' } });

    expect(screen.getByPlaceholderText('es. RAM, batteria, display…')).toBeInTheDocument();
  });

  it('shows export button when table is visible', () => {
    render(<App />);

    const textareas = screen.getAllByRole('textbox');
    const specsTextareas = textareas.filter(el => el.tagName === 'TEXTAREA');

    fireEvent.change(specsTextareas[0], { target: { value: 'RAM: 8GB' } });
    fireEvent.change(specsTextareas[1], { target: { value: 'RAM: 16GB' } });

    expect(screen.getByText('Esporta CSV')).toBeInTheDocument();
  });
});
