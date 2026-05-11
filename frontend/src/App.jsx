import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

import Inicio from './pages/public/Inicio/Inicio';
import AbrirChamado from './pages/public/AbrirChamado/AbrirChamado';
import Confirmacao from './pages/public/Confirmacao/Confirmacao';
import ConfirmacaoEquipamento from './pages/public/ConfirmacaoEquipamento/ConfirmacaoEquipamento';
import DetalhesChamado from './pages/public/DetalhesChamado/DetalhesChamado';
import ListaChamados from './pages/public/ListaChamados/ListaChamados';
import SolicitarEquipamento from './pages/public/SolicitarEquipamento/SolicitarEquipamento';

import Login from './pages/admin/Login/Login';
import Dashboard from './pages/admin/Dashboard/Dashboard';
import ListaChamadosAdmin from './pages/admin/ListaChamadosAdmin/ListaChamadosAdmin';
import DetalhesChamadoAdmin from './pages/admin/DetalhesChamadoAdmin/DetalhesChamadoAdmin';
import Setores from './pages/admin/Setores/Setores';
import EstoqueEquipamentos from './pages/admin/EstoqueEquipamentos/EstoqueEquipamentos';
import SolicitacoesEquipamentos from './pages/admin/SolicitacoesEquipamentos/SolicitacoesEquipamentos';
import EquipamentosAlocados from './pages/admin/EquipamentosAlocados/EquipamentosAlocados';
import Computadores from './pages/admin/Computadores/Computadores';
import MovimentacoesEquipamentos from './pages/admin/MovimentacoesEquipamentos/MovimentacoesEquipamentos';

function PrivateRoute({ children }) {
  const { usuario } = useAuth();
  return usuario ? children : <Navigate to="/admin/login" replace />;
}

function PublicOnlyRoute({ children }) {
  const { usuario } = useAuth();
  return !usuario ? children : <Navigate to="/admin" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/abrir-chamado" element={<AbrirChamado />} />
          <Route path="/chamado/confirmacao/:protocolo" element={<Confirmacao />} />
          <Route path="/equipamento/confirmacao/:protocolo" element={<ConfirmacaoEquipamento />} />
          <Route path="/chamado/:protocolo" element={<DetalhesChamado />} />
          <Route path="/chamados" element={<ListaChamados />} />
          <Route path="/solicitar-equipamento" element={<SolicitarEquipamento />} />

          <Route path="/admin/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
          <Route path="/admin" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/admin/chamados" element={<PrivateRoute><ListaChamadosAdmin /></PrivateRoute>} />
          <Route path="/admin/chamados/:id" element={<PrivateRoute><DetalhesChamadoAdmin /></PrivateRoute>} />
          <Route path="/admin/equipamentos" element={<PrivateRoute><EstoqueEquipamentos /></PrivateRoute>} />
          <Route path="/admin/solicitacoes-equipamentos" element={<PrivateRoute><SolicitacoesEquipamentos /></PrivateRoute>} />
          <Route path="/admin/equipamentos-alocados" element={<PrivateRoute><EquipamentosAlocados /></PrivateRoute>} />
          <Route path="/admin/computadores" element={<PrivateRoute><Computadores /></PrivateRoute>} />
          <Route path="/admin/movimentacoes-equipamentos" element={<PrivateRoute><MovimentacoesEquipamentos /></PrivateRoute>} />
          <Route path="/admin/almoxarifado" element={<Navigate to="/admin/almoxarifado/estoque" replace />} />
          <Route path="/admin/almoxarifado/estoque" element={<PrivateRoute><EstoqueEquipamentos /></PrivateRoute>} />
          <Route path="/admin/almoxarifado/solicitacoes" element={<PrivateRoute><SolicitacoesEquipamentos /></PrivateRoute>} />
          <Route path="/admin/almoxarifado/alocados" element={<PrivateRoute><EquipamentosAlocados /></PrivateRoute>} />
          <Route path="/admin/almoxarifado/computadores" element={<PrivateRoute><Computadores /></PrivateRoute>} />
          <Route path="/admin/almoxarifado/movimentacoes" element={<PrivateRoute><MovimentacoesEquipamentos /></PrivateRoute>} />
          <Route path="/admin/setores" element={<PrivateRoute><Setores /></PrivateRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
