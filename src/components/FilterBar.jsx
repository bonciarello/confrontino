import { useState, useRef, useEffect } from 'react';

export default function FilterBar({ filterText, setFilterText, totalRows, filteredRows }) {
  const inputRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);

  // Shortcut Ctrl/Cmd+F per attivare il filtro
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'f' && document.activeElement === document.body) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className={`filter-bar ${isFocused ? 'filter-bar--focused' : ''}`}>
      <label htmlFor="filter-input" className="filter-bar__label">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <circle cx="7" cy="7" r="5.25" stroke="currentColor" strokeWidth="1.5" />
          <path d="M11 11L14.5 14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        Filtra caratteristiche
      </label>
      <input
        ref={inputRef}
        id="filter-input"
        type="search"
        className="filter-bar__input"
        placeholder="es. RAM, batteria, display…"
        value={filterText}
        onChange={(e) => setFilterText(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        autoComplete="off"
      />
      {filterText && (
        <span className="filter-bar__count" aria-live="polite">
          {filteredRows} di {totalRows} righe
        </span>
      )}
      {filterText && (
        <button
          className="filter-bar__clear"
          onClick={() => {
            setFilterText('');
            inputRef.current?.focus();
          }}
          aria-label="Cancella filtro"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <circle cx="7" cy="7" r="6" fill="currentColor" opacity="0.15" />
            <path d="M4.5 4.5L9.5 9.5M9.5 4.5L4.5 9.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </div>
  );
}
