/** Campo de busca controlado por estado (o valor vem do componente pai). */
export function SearchBar({ value, onChange, placeholder = "Buscar..." }) {
  return (
    <input
      type="search"
      className="input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label={placeholder}
    />
  );
}
