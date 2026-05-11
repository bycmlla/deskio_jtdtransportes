import { useEffect, useState } from "react";
import api from "../../../services/api";
import AdminLayout from "../../../components/AdminLayout/AdminLayout";
import Spinner from "../../../components/ui/Spinner";
import StatusBadge from "../../../components/ui/StatusBadge";
import "./EquipamentosAlocados.css";

const STATUS_DEVOLUCAO = ["Disponível", "Em manutenção", "Danificado"];

export default function EquipamentosAlocados() {
  const [alocados, setAlocados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acaoLoading, setAcaoLoading] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [filtros, setFiltros] = useState({
    status: "Alocado",
    busca: "",
  });
  const [devolucoes, setDevolucoes] = useState({});

  async function carregar() {
    setLoading(true);
    const params = new URLSearchParams();

    Object.entries(filtros).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });

    try {
      const r = await api.get(`/admin/equipamentos-alocados?${params}`);
      setAlocados(r.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
  }, [filtros]);

  function atualizarDevolucao(id, campo, valor) {
    setDevolucoes((atuais) => ({
      ...atuais,
      [id]: {
        destino_status: "Disponível",
        observacoes: "",
        ...(atuais[id] || {}),
        [campo]: valor,
      },
    }));
  }

  async function devolver(alocacao) {
    const dados = devolucoes[alocacao.id] || {
      destino_status: "Disponível",
      observacoes: "",
    };

    setAcaoLoading(true);
    setMensagem("");
    setErro("");

    try {
      await api.patch(`/admin/equipamentos-alocados/${alocacao.id}/devolver`, dados);
      setDevolucoes((atuais) => ({ ...atuais, [alocacao.id]: undefined }));
      await carregar();
      setMensagem("Devolução registrada com sucesso.");
    } catch (err) {
      setErro(err.response?.data?.error || "Erro ao registrar devolução.");
    } finally {
      setAcaoLoading(false);
    }
  }

  const fmt = (dt) => (dt ? new Date(dt).toLocaleDateString("pt-BR") : "-");

  return (
    <AdminLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Equipamentos Alocados</h1>
          <p className="page-subtitle">
            Equipamentos entregues aos colaboradores e registro de devoluções
          </p>
        </div>
      </div>

      {mensagem && <div className="alert alert-success">{mensagem}</div>}
      {erro && <div className="alert alert-error">{erro}</div>}

      <div className="card equipamentos-alocados-filtros-card">
        <div className="equipamentos-alocados-filtros-grid">
          <input
            placeholder="Buscar por colaborador ou CPF"
            value={filtros.busca}
            onChange={(e) =>
              setFiltros((atual) => ({ ...atual, busca: e.target.value }))
            }
          />

          <select
            value={filtros.status}
            onChange={(e) =>
              setFiltros((atual) => ({ ...atual, status: e.target.value }))
            }
          >
            <option value="Alocado">Alocados</option>
            <option value="Devolvido">Devolvidos</option>
          </select>
        </div>
      </div>

      <div className="card equipamentos-alocados-table-card">
        {loading ? (
          <Spinner />
        ) : alocados.length === 0 ? (
          <div className="empty-state">
            <h3>Nenhum equipamento encontrado</h3>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Colaborador</th>
                  <th>CPF</th>
                  <th>Setor</th>
                  <th>Equipamento</th>
                  <th>Série</th>
                  <th>Entrega</th>
                  <th>Status</th>
                  <th>Observações</th>
                  <th>Devolução</th>
                </tr>
              </thead>

              <tbody>
                {alocados.map((alocacao) => {
                  const devolucaoAtual = devolucoes[alocacao.id] || {
                    destino_status: "Disponível",
                    observacoes: "",
                  };

                  return (
                    <tr key={alocacao.id}>
                      <td className="equipamentos-alocados-primary">
                        {alocacao.colaborador_nome}
                      </td>
                      <td>{alocacao.colaborador_cpf}</td>
                      <td>{alocacao.setor?.nome || "-"}</td>
                      <td>
                        <div className="equipamentos-alocados-item">
                          <strong>{alocacao.equipamento?.nome || "-"}</strong>
                          <span>{alocacao.equipamento?.categoria || "-"}</span>
                        </div>
                      </td>
                      <td className="equipamentos-alocados-muted">
                        {alocacao.equipamento?.numero_serie || "-"}
                      </td>
                      <td className="equipamentos-alocados-muted">
                        {fmt(alocacao.data_entrega)}
                      </td>
                      <td>
                        <StatusBadge status={alocacao.status} />
                      </td>
                      <td className="equipamentos-alocados-observacoes">
                        {alocacao.observacoes || "-"}
                      </td>
                      <td>
                        {alocacao.status === "Alocado" ? (
                          <div className="equipamentos-alocados-devolucao">
                            <select
                              value={devolucaoAtual.destino_status}
                              onChange={(e) =>
                                atualizarDevolucao(
                                  alocacao.id,
                                  "destino_status",
                                  e.target.value,
                                )
                              }
                            >
                              {STATUS_DEVOLUCAO.map((status) => (
                                <option key={status} value={status}>
                                  {status}
                                </option>
                              ))}
                            </select>

                            <input
                              value={devolucaoAtual.observacoes}
                              onChange={(e) =>
                                atualizarDevolucao(
                                  alocacao.id,
                                  "observacoes",
                                  e.target.value,
                                )
                              }
                              placeholder="Observações"
                            />

                            <button
                              className="btn btn-primary btn-sm"
                              disabled={acaoLoading}
                              onClick={() => devolver(alocacao)}
                            >
                              Registrar
                            </button>
                          </div>
                        ) : (
                          <span className="equipamentos-alocados-muted">
                            {fmt(alocacao.data_devolucao)}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
