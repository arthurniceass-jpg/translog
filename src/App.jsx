import { Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Veiculos } from "./pages/Veiculos";
import { VeiculoForm } from "./pages/VeiculoForm";
import { Motoristas } from "./pages/Motoristas";
import { MotoristaForm } from "./pages/MotoristaForm";
import { Ocorrencias } from "./pages/Ocorrencias";
import { OcorrenciaForm } from "./pages/OcorrenciaForm";
import { OcorrenciaDetalhe } from "./pages/OcorrenciaDetalhe";
import { Dashboard } from "./pages/Dashboard";
import { Historico } from "./pages/Historico";
import { Entrar } from "./pages/Entrar";
import { Cadastro } from "./pages/Cadastro";

export default function App() {
  return (
    <Routes>
      {/* Autenticação (tela cheia, sem sidebar) */}
      <Route path="/entrar" element={<Entrar />} />
      <Route path="/cadastro" element={<Cadastro />} />

      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />

        {/* Veículos */}
        <Route path="veiculos" element={<Veiculos />} />
        <Route path="veiculos/novo" element={<VeiculoForm />} />
        <Route path="veiculos/:id/editar" element={<VeiculoForm />} />

        {/* Motoristas */}
        <Route path="motoristas" element={<Motoristas />} />
        <Route path="motoristas/novo" element={<MotoristaForm />} />
        <Route path="motoristas/:id/editar" element={<MotoristaForm />} />

        {/* Ocorrências */}
        <Route path="ocorrencias" element={<Ocorrencias />} />
        <Route path="ocorrencias/nova" element={<OcorrenciaForm />} />
        <Route path="ocorrencias/:id" element={<OcorrenciaDetalhe />} />
        <Route path="ocorrencias/:id/editar" element={<OcorrenciaForm />} />

        {/* Verticais adicionais (5 integrantes) */}
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="historico" element={<Historico />} />

        {/* Rota desconhecida volta para o início */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
