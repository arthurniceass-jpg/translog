import { Icon } from "./Icons";

/** Campo de busca controlado por estado (o valor vem do componente pai). */
export function SearchBar({ value, onChange, placeholder = "Buscar..." }) {
  return (
    <div className="search">
      <Icon name="search" size={18} />
      <input
        type="search"
        className="input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
      />
    </div>
  );
}
