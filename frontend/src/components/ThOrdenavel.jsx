/** Cabeçalho de tabela clicável para ordenar (use com o hook useOrdenacao). */
export function ThOrdenavel({ coluna, ordem, onOrdenar, children }) {
  const ativa = ordem?.coluna === coluna;
  const direcao = ativa ? ordem.direcao : null;
  const ariaSort = direcao === "asc" ? "ascending" : direcao === "desc" ? "descending" : "none";
  const seta = direcao === "asc" ? "▲" : direcao === "desc" ? "▼" : "↕";

  return (
    <th aria-sort={ariaSort}>
      <button type="button" className={"th-sort" + (ativa ? " on" : "")} onClick={() => onOrdenar(coluna)}>
        {children}
        <span className="th-seta" aria-hidden="true">{seta}</span>
      </button>
    </th>
  );
}
