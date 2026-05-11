import { useEffect, useState } from "react";
import api from "../../../services/api";
import AdminLayout from "../../../components/AdminLayout/AdminLayout";
import Spinner from "../../../components/ui/Spinner";
import StatusBadge from "../../../components/ui/StatusBadge";
import "./EstoqueEquipamentos.css";

const STATUS_EQUIPAMENTO = [
  "Disponível",
  "Alocado",
  "Em manutenção",
  "Danificado",
  "Baixado",
];

const FORM_INICIAL = {
  nome: "",
  categoria: "",
  numero_serie: "",
  patrimonio: "",
  data_compra: "",
  quantidade: 1,
  status: "Disponível",
  observacoes: "",
};

export default function EstoqueEquipamentos() {
  const [equipamentos, setEquipamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [form, setForm] = useState(FORM_INICIAL);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [historico, setHistorico] = useState([]);
  const [equipamentoHistorico, setEquipamentoHistorico] = useState(null);
  const [loadingHistorico, setLoadingHistorico] = useState(false);
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
      const r = await api.get(`/admin/equipamentos?${params}`);
      setEquipamentos(r.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
  }, [filtros]);

  function atualizarForm(campo, valor) {
    setForm((atual) => ({
      ...atual,
      [campo]: valor,
    }));
  }

  function iniciarEdicao(equipamento) {
    setEditandoId(equipamento.id);
    setForm({
      nome: equipamento.nome || "",
      categoria: equipamento.categoria || "",
      numero_serie: equipamento.numero_serie || "",
      patrimonio: equipamento.patrimonio || "",
      data_compra: equipamento.data_compra || "",
      quantidade: equipamento.quantidade || 1,
      status: equipamento.status || "Disponível",
      observacoes: equipamento.observacoes || "",
    });
    setMensagem("");
    setErro("");
  }

  function limparForm() {
    setEditandoId(null);
    setForm(FORM_INICIAL);
  }

  async function salvarEquipamento(e) {
    e.preventDefault();
    setSalvando(true);
    setErro("");
    setMensagem("");

    try {
      if (editandoId) {
        await api.patch(`/admin/equipamentos/${editandoId}`, form);
        setMensagem("Equipamento atualizado com sucesso.");
      } else {
        await api.post("/admin/equipamentos", form);
        setMensagem("Equipamento cadastrado com sucesso.");
      }

      limparForm();
      await carregar();
    } catch (err) {
      setErro(err.response?.data?.error || "Erro ao salvar equipamento.");
    } finally {
      setSalvando(false);
    }
  }

  async function baixarEquipamento(equipamento) {
    const confirmou = window.confirm(
      `Baixar o equipamento "${equipamento.nome}" do estoque?`,
    );
    if (!confirmou) return;

    try {
      await api.patch(`/admin/equipamentos/${equipamento.id}/baixar`, {
        observacoes: equipamento.observacoes,
      });
      await carregar();
      setMensagem("Equipamento baixado.");
    } catch (err) {
      setErro(err.response?.data?.error || "Erro ao baixar equipamento.");
    }
  }

  async function removerEquipamento(equipamento) {
    const confirmou = window.confirm(
      `Remover "${equipamento.nome}" do estoque? O registro será baixado para preservar o histórico.`,
    );
    if (!confirmou) return;

    try {
      await api.delete(`/admin/equipamentos/${equipamento.id}`);
      await carregar();
      setMensagem("Equipamento removido do estoque disponível.");
    } catch (err) {
      setErro(err.response?.data?.error || "Erro ao remover equipamento.");
    }
  }

  async function abrirHistorico(equipamento) {
    setEquipamentoHistorico(equipamento);
    setHistorico([]);
    setLoadingHistorico(true);

    try {
      const r = await api.get(`/admin/equipamentos/${equipamento.id}/historico`);
      setHistorico(r.data);
    } finally {
      setLoadingHistorico(false);
    }
  }

  const fmt = (dt) => (dt ? new Date(dt).toLocaleDateString("pt-BR") : "-");
  const fmtDataHora = (dt) =>
    dt ? new Date(dt).toLocaleString("pt-BR") : "-";

  return (
    <AdminLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Estoque de Equipamentos</h1>
          <p className="page-subtitle">
            Itens disponíveis, alocados, em manutenção, danificados ou baixados
          </p>
        </div>
      </div>

      {mensagem && <div className="alert alert-success">{mensagem}</div>}
      {erro && <div className="alert alert-error">{erro}</div>}

      <div className="estoque-layout">
        <div className="estoque-main">
          <div className="card estoque-filtros-card">
            <div className="estoque-filtros-grid">
              <input
                placeholder="Buscar por nome, categoria, série ou patrimônio"
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
                {STATUS_EQUIPAMENTO.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="card estoque-table-card">
            {loading ? (
              <Spinner />
            ) : equipamentos.length === 0 ? (
              <div className="empty-state">
                <h3>Nenhum equipamento encontrado</h3>
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Equipamento</th>
                      <th>Categoria</th>
                      <th>Série</th>
                      <th>Patrimônio</th>
                      <th>Compra</th>
                      <th>Qtd.</th>
                      <th>Status</th>
                      <th>Ações</th>
                    </tr>
                  </thead>

                  <tbody>
                    {equipamentos.map((equipamento) => (
                      <tr key={equipamento.id}>
                        <td className="estoque-equipamento-nome">
                          {equipamento.nome}
                        </td>
                        <td>{equipamento.categoria}</td>
                        <td className="estoque-muted">
                          {equipamento.numero_serie || "-"}
                        </td>
                        <td className="estoque-muted">
                          {equipamento.patrimonio || "-"}
                        </td>
                        <td className="estoque-muted">
                          {fmt(equipamento.data_compra)}
                        </td>
                        <td>{equipamento.quantidade}</td>
                        <td>
                          <StatusBadge status={equipamento.status} />
                        </td>
                        <td>
                          <div className="estoque-actions">
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => iniciarEdicao(equipamento)}
                            >
                              Editar
                            </button>
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => abrirHistorico(equipamento)}
                            >
                              Histórico
                            </button>
                            <button
                              className="btn btn-ghost btn-sm estoque-danger"
                              onClick={() => baixarEquipamento(equipamento)}
                              disabled={equipamento.status === "Baixado"}
                            >
                              Baixar
                            </button>
                            <button
                              className="btn btn-ghost btn-sm estoque-danger"
                              onClick={() => removerEquipamento(equipamento)}
                              disabled={equipamento.status === "Baixado"}
                            >
                              Remover
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {equipamentoHistorico && (
            <div className="card estoque-historico-card">
              <div className="estoque-historico-header">
                <div>
                  <h3>Histórico</h3>
                  <p>{equipamentoHistorico.nome}</p>
                </div>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setEquipamentoHistorico(null)}
                >
                  Fechar
                </button>
              </div>

              {loadingHistorico ? (
                <Spinner />
              ) : historico.length === 0 ? (
                <div className="empty-state">
                  <h3>Nenhuma movimentação registrada</h3>
                </div>
              ) : (
                <div className="estoque-historico-list">
                  {historico.map((item) => (
                    <div key={item.id} className="estoque-historico-item">
                      <div>
                        <strong>{item.descricao}</strong>
                        <span>
                          {item.usuario?.nome || "Sistema"} -{" "}
                          {fmtDataHora(item.data_evento)}
                        </span>
                      </div>
                      <small>{item.tipo_evento}</small>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <aside className="card estoque-form-card">
          <h3 className="estoque-form-title">
            {editandoId ? "Editar Equipamento" : "Cadastrar Equipamento"}
          </h3>

          <form onSubmit={salvarEquipamento}>
            <div className="form-group">
              <label>Nome do equipamento *</label>
              <input
                value={form.nome}
                onChange={(e) => atualizarForm("nome", e.target.value)}
                placeholder="Ex: Monitor Dell 24"
              />
            </div>

            <div className="form-group">
              <label>Categoria *</label>
              <input
                value={form.categoria}
                onChange={(e) => atualizarForm("categoria", e.target.value)}
                placeholder="Ex: Monitor, Notebook, Acessório"
              />
            </div>

            <div className="form-group">
              <label>Número de série</label>
              <input
                value={form.numero_serie}
                onChange={(e) => atualizarForm("numero_serie", e.target.value)}
                placeholder="Serial do equipamento"
              />
            </div>

            <div className="form-group">
              <label>Patrimônio</label>
              <input
                value={form.patrimonio}
                onChange={(e) => atualizarForm("patrimonio", e.target.value)}
                placeholder="Código interno"
              />
            </div>

            <div className="estoque-form-grid">
              <div className="form-group">
                <label>Data de compra</label>
                <input
                  type="date"
                  value={form.data_compra}
                  onChange={(e) => atualizarForm("data_compra", e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Quantidade</label>
                <input
                  type="number"
                  min="1"
                  value={form.quantidade}
                  onChange={(e) => atualizarForm("quantidade", e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Status</label>
              <select
                value={form.status}
                onChange={(e) => atualizarForm("status", e.target.value)}
              >
                {STATUS_EQUIPAMENTO.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Observações</label>
              <textarea
                rows={4}
                value={form.observacoes}
                onChange={(e) => atualizarForm("observacoes", e.target.value)}
                placeholder="Informações adicionais"
              />
            </div>

            <button
              className="btn btn-primary estoque-submit"
              type="submit"
              disabled={salvando || !form.nome.trim() || !form.categoria.trim()}
            >
              {salvando ? "Salvando..." : editandoId ? "Salvar Alterações" : "Cadastrar"}
            </button>

            {editandoId && (
              <button
                className="btn btn-ghost estoque-cancel-button"
                type="button"
                onClick={limparForm}
              >
                Cancelar edição
              </button>
            )}
          </form>
        </aside>
      </div>
    </AdminLayout>
  );
}
