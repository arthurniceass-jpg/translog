import { createContext, useContext } from "react";

export const DataContext = createContext(null);

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData deve ser usado dentro de <DataProvider>");
  return ctx;
}
