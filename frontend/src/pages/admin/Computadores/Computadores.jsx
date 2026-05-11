import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../../../services/api";
import AdminLayout from "../../../components/AdminLayout/AdminLayout";
import Spinner from "../../../components/ui/Spinner";
import StatusBadge from "../../../components/ui/StatusBadge";
import "./Computadores.css";

function getCodigo(equipamento) {
  return (
    equipamento.codigo_identificador ||
    equipamento.numero_serie ||
    equipamento.patrimonio ||
    "-"
  );
}

export default function Computadores() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [computadores, setComputadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    busca: "",
    status: "",
  });

  const equipamentoId = searchParams.get("equipamento") || "";

  async function carregar() {
    setLoading(true);
    const params = new URLSearchParams();

    if (equipamentoId) params.append("id", equipamentoId);
    Object.entries(filtros).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });

    try {
      const r = await api.get(`/admin/computadores?${params}`);
      setComputadores(r.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
  }, [filtros, equipamentoId]);

  function limparDetalhe() {
    setSearchParams({});
  }

  return (
    <AdminLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Computadores</h1>
          <p className="page-subtitle">
            Notebooks e desktops cadastrados no almoxarifado
          </p>
        </div>

        <Link to="/admin/almoxarifado/estoque" className="btn btn-secondary">
          Voltar ao Estoque
        </Link>
      </div>

      <div className="card computadores-filtros-card">
        <div className="computadores-filtros-grid">
          <input
            placeholder="Buscar por código, usuário, IP, estação ou processador"
            value={filtros.busca}
            disabled={Boolean(equipamentoId)}
            onChange={(e) =>
              setFiltros((atual) => ({ ...atual, busca: e.target.value }))
            }
          />

          <select
            value={filtros.status}
            disabled={Boolean(equipamentoId)}
            onChange={(e) =>
              setFiltros((atual) => ({ ...atual, status: e.target.value }))
            }
          >
            <option value="">Todos os status</option>
            <option value="Disponível">Disponível</option>
            <option value="Alocado">Alocado</option>
            <option value="Em manutenção">Em manutenção</option>
            <option value="Danificado">Danificado</option>
            <option value="Baixado">Baixado</option>
          </select>

          {equipamentoId && (
            <button
              className="btn btn-ghost btn-sm"
              type="button"
              onClick={limparDetalhe}
            >
              Ver todos
            </button>
          )}
        </div>
      </div>

      <div className="card computadores-table-card">
        {loading ? (
          <Spinner />
        ) : computadores.length === 0 ? (
          <div className="empty-state">
            <h3>Nenhum computador encontrado</h3>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Categoria</th>
                  <th>Código identificador</th>
                  <th>Setor</th>
                  <th>Usuário</th>
                  <th>IP</th>
                  <th>Estação</th>
                  <th>Processador</th>
                  <th>Geração</th>
                  <th>SSD</th>
                  <th>RAM</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {computadores.map((computador) => (
                  <tr key={computador.id}>
                    <td className="computadores-primary">{computador.categoria}</td>
                    <td className="computadores-code">{getCodigo(computador)}</td>
                    <td>{computador.setor?.nome || "-"}</td>
                    <td>{computador.usuario || "-"}</td>
                    <td>{computador.ip || "-"}</td>
                    <td>{computador.estacao || "-"}</td>
                    <td>{computador.processador || "-"}</td>
                    <td>{computador.geracao || "-"}</td>
                    <td>{computador.ssd || "-"}</td>
                    <td>{computador.ram || "-"}</td>
                    <td>
                      <StatusBadge status={computador.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
