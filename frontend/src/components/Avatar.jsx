import { iniciais } from "../lib/format";

export function Avatar({ nome, small = false }) {
  return <span className={"avatar" + (small ? " avatar-sm" : "")} aria-hidden="true">{iniciais(nome)}</span>;
}
