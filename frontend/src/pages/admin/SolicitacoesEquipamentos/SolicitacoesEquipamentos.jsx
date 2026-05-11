import { useEffect, useState } from "react";
import api from "../../../services/api";
import AdminLayout from "../../../components/AdminLayout/AdminLayout";
import Spinner from "../../../components/ui/Spinner";
import StatusBadge from "../../../components/ui/StatusBadge";
import "./SolicitacoesEquipamentos.css";

const STATUS_SOLICITACAO = [
  "Pendente",
  "Aprovada",
  "Recusada",
  "Entregue",
  "Cancelada",
];

export default function SolicitacoesEquipamentos() {
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [equipamentosDisponiveis, setEquipamentosDisponiveis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acaoLoading, setAcaoLoading] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [entregas, setEntregas] = useState({});
  const [filtros, setFiltros] = useState({
    status: "",
    busca: "",
  });

  async function carregar() {
    setLoading(true);
    const params = new URLSearchParams();

    Object.entries(filtros).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });

    try {
      const [solicitacoesRes, equipamentosRes] = await Promise.all([
        api.get(`/admin/solicitacoes-equipamentos?${params}`),
        api.get("/admin/equipamentos?status=Disponível"),
      ]);

      setSolicitacoes(solicitacoesRes.data);
      setEquipamentosDisponiveis(equipamentosRes.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
  }, [filtros]);

  async function alterarStatus(solicitacao, status) {
    setAcaoLoading(true);
    setMensagem("");
    setErro("");

    try {
      await api.patch(`/admin/solicitacoes-equipamentos/${solicitacao.id}/status`, {
        status,
      });
      await carregar();
      setMensagem(`Solicitação ${status.toLowerCase()} com sucesso.`);
    } catch (err) {
      setErro(err.response?.data?.error || "Erro ao alterar solicitação.");
    } finally {
      setAcaoLoading(false);
    }
  }

  async function entregar(solicitacao) {
    const equipamentoId = entregas[solicitacao.id];

    if (!equipamentoId) {
      setErro("Selecione um equipamento disponível para entregar.");
      return;
    }

    setAcaoLoading(true);
    setMensagem("");
    setErro("");

    try {
      await api.post(`/admin/solicitacoes-equipamentos/${solicitacao.id}/entregar`, {
        equipamento_id: equipamentoId,
      });
      setEntregas((atuais) => ({ ...atuais, [solicitacao.id]: "" }));
      await carregar();
      setMensagem("Equipamento entregue e alocado ao colaborador.");
    } catch (err) {
      setErro(err.response?.data?.error || "Erro ao entregar equipamento.");
    } finally {
      setAcaoLoading(false);
    }
  }

  const fmt = (dt) => (dt ? new Date(dt).toLocaleDateString("pt-BR") : "-");

  return (
    <AdminLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Solicitações de Equipamentos</h1>
          <p className="page-subtitle">
            Pedidos feitos pelos colaboradores e fluxo de aprovação
          </p>
        </div>
      </div>

      {mensagem && <div className="alert alert-success">{mensagem}</div>}
      {erro && <div className="alert alert-error">{erro}</div>}

      <div className="card solicitacoes-equipamentos-filtros-card">
        <div className="solicitacoes-equipamentos-filtros-grid">
          <input
            placeholder="Buscar por protocolo, solicitante, CPF ou equipamento"
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
            <option value="">Todos os status</option>
            {STATUS_SOLICITACAO.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="card solicitacoes-equipamentos-table-card">
        {loading ? (
          <Spinner />
        ) : solicitacoes.length === 0 ? (
          <div className="empty-state">
            <h3>Nenhuma solicitação encontrada</h3>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Protocolo</th>
                  <th>Solicitante</th>
                  <th>CPF</th>
                  <th>WhatsApp</th>
                  <th>Setor</th>
                  <th>Equipamento</th>
                  <th>Status</th>
                  <th>Solicitada em</th>
                  <th>Ações</th>
                </tr>
              </thead>

              <tbody>
                {solicitacoes.map((solicitacao) => (
                  <tr key={solicitacao.id}>
                    <td className="solicitacoes-equipamentos-protocolo">
                      {solicitacao.protocolo}
                    </td>
                    <td className="solicitacoes-equipamentos-primary">
                      {solicitacao.solicitante_nome}
                    </td>
                    <td>{solicitacao.solicitante_cpf}</td>
                    <td>{solicitacao.solicitante_whatsapp}</td>
                    <td>{solicitacao.setor?.nome || "-"}</td>
                    <td>
                      <div className="solicitacoes-equipamentos-item">
                        <strong>{solicitacao.equipamento_solicitado}</strong>
                        <span>{solicitacao.justificativa}</span>
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={solicitacao.status} />
                    </td>
                    <td className="solicitacoes-equipamentos-data">
                      {fmt(solicitacao.data_solicitacao)}
                    </td>
                    <td>
                      <div className="solicitacoes-equipamentos-actions">
                        {solicitacao.status === "Pendente" && (
                          <>
                            <button
                              className="btn btn-ghost btn-sm solicitacoes-equipamentos-success"
                              disabled={acaoLoading}
                              onClick={() => alterarStatus(solicitacao, "Aprovada")}
                            >
                              Aprovar
                            </button>
                            <button
                              className="btn btn-ghost btn-sm solicitacoes-equipamentos-danger"
                              disabled={acaoLoading}
                              onClick={() => alterarStatus(solicitacao, "Recusada")}
                            >
                              Recusar
                            </button>
                          </>
                        )}

                        {solicitacao.status === "Aprovada" && (
                          <div className="solicitacoes-equipamentos-entrega">
                            <select
                              value={entregas[solicitacao.id] || ""}
                              onChange={(e) =>
                                setEntregas((atuais) => ({
                                  ...atuais,
                                  [solicitacao.id]: e.target.value,
                                }))
                              }
                            >
                              <option value="">Selecionar equipamento</option>
                              {equipamentosDisponiveis.map((equipamento) => (
                                <option key={equipamento.id} value={equipamento.id}>
                                  {equipamento.nome}
                                  {equipamento.numero_serie
                                    ? ` - ${equipamento.numero_serie}`
                                    : ""}
                                  {equipamento.patrimonio
                                    ? ` - Patr. ${equipamento.patrimonio}`
                                    : ""}
                                </option>
                              ))}
                            </select>

                            <button
                              className="btn btn-primary btn-sm"
                              disabled={acaoLoading}
                              onClick={() => entregar(solicitacao)}
                            >
                              Entregar
                            </button>
                          </div>
                        )}

                        {["Pendente", "Aprovada"].includes(solicitacao.status) && (
                          <button
                            className="btn btn-ghost btn-sm solicitacoes-equipamentos-danger"
                            disabled={acaoLoading}
                            onClick={() => alterarStatus(solicitacao, "Cancelada")}
                          >
                            Cancelar
                          </button>
                        )}

                        {solicitacao.equipamento && (
                          <span className="solicitacoes-equipamentos-entregue">
                            {solicitacao.equipamento.nome}
                          </span>
                        )}
                      </div>
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
