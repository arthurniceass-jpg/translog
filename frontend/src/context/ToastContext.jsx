import { useCallback, useMemo, useRef, useState } from "react";
import { ToastContext } from "./toast";
import { Icon } from "../components/Icons";

/** Avisos rápidos (sucesso/erro) no canto da tela. Uso: const toast = useToast(); toast.sucesso("Salvo!") */
export function ToastProvider({ children }) {
  const [itens, setItens] = useState([]);
  const seq = useRef(0);

  const remover = useCallback((id) => setItens((l) => l.filter((t) => t.id !== id)), []);
  const mostrar = useCallback(
    (tipo, texto) => {
      const id = ++seq.current;
      setItens((l) => [...l, { id, tipo, texto }]);
      setTimeout(() => remover(id), 4200);
    },
    [remover],
  );

  const api = useMemo(
    () => ({ sucesso: (t) => mostrar("success", t), erro: (t) => mostrar("danger", t) }),
    [mostrar],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {itens.map((t) => (
          <div key={t.id} className={"toast toast-" + t.tipo}>
            <Icon name={t.tipo === "success" ? "check" : "alert"} size={18} />
            <span>{t.texto}</span>
            <button className="toast-x" aria-label="Fechar" onClick={() => remover(t.id)}>
              <Icon name="x" size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
