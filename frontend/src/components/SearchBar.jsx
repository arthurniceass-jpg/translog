import { useRef } from "react";
import { Icon } from "./Icons";

export function SearchBar({ value, onChange, placeholder = "Buscar…" }) {
  const input = useRef(null);

  return (
    <div className="search">
      <Icon name="search" size={18} className="search-icon" />
      <input
        ref={input}
        type="search"
        className="input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
      />
      {value && (
        <button type="button" className="input-action" aria-label="Limpar busca" onClick={() => { onChange(""); input.current?.focus(); }}>
          <Icon name="x" size={16} />
        </button>
      )}
    </div>
  );
}
