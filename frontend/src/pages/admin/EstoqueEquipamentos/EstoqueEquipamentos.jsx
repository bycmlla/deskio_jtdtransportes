import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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

const CATEGORIAS_COMPUTADOR = ["Notebook", "Desktop"];

const FORM_INICIAL = {
  nome: "",
  categoria: "",
  codigo_identificador: "",
  data_compra: "",
  quantidade: 1,
  status: "Disponível",
  setor_id: "",
  usuario: "",
  ip: "",
  estacao: "",
  processador: "",
  geracao: "",
  ssd: "",
  ram: "",
  observacoes: "",
};

function ehComputador(categoria) {
  return CATEGORIAS_COMPUTADOR.includes(String(categoria || "").trim());
}

function getCodigo(equipamento) {
  return (
    equipamento.codigo_identificador ||
    equipamento.numero_serie ||
    equipamento.patrimonio ||
    "-"
  );
}

function formatarData(data) {
  if (!data) return "-";
  if (/^\d{4}-\d{2}-\d{2}$/.test(data)) {
    const [ano, mes, dia] = data.split("-");
    return `${dia}/${mes}/${ano}`;
  }
  return new Date(data).toLocaleDateString("pt-BR");
}

function normalizarDataCompra(data) {
  if (!data) return "";
  const valor = String(data).trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) return null;

  const [ano, mes, dia] = valor.split("-").map(Number);
  const dataUtc = new Date(Date.UTC(ano, mes - 1, dia));
  const dataValida =
    dataUtc.getUTCFullYear() === ano &&
    dataUtc.getUTCMonth() === mes - 1 &&
    dataUtc.getUTCDate() === dia;

  return dataValida ? valor : null;
}

export default function EstoqueEquipamentos() {
  const [equipamentos, setEquipamentos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [setores, setSetores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [criandoCategoria, setCriandoCategoria] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [form, setForm] = useState(FORM_INICIAL);
  const [novaCategoria, setNovaCategoria] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [historico, setHistorico] = useState([]);
  const [equipamentoHistorico, setEquipamentoHistorico] = useState(null);
  const [loadingHistorico, setLoadingHistorico] = useState(false);
  const [filtros, setFiltros] = useState({
    status: "",
    busca: "",
  });

  const categoriaComputador = ehComputador(form.categoria);

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

  async function carregarApoio() {
    const [categoriasRes, setoresRes] = await Promise.all([
      api.get("/admin/categorias-equipamentos"),
      api.get("/admin/setores"),
    ]);

    setCategorias(categoriasRes.data);
    setSetores(setoresRes.data);
  }

  useEffect(() => {
    carregarApoio().catch(() => {});
  }, []);

  useEffect(() => {
    carregar();
  }, [filtros]);

  function atualizarForm(campo, valor) {
    setForm((atual) => {
      const proximo = {
        ...atual,
        [campo]: valor,
      };

      if (campo === "categoria" && !ehComputador(valor)) {
        proximo.setor_id = "";
        proximo.usuario = "";
        proximo.ip = "";
        proximo.estacao = "";
        proximo.processador = "";
        proximo.geracao = "";
        proximo.ssd = "";
        proximo.ram = "";
      }

      if (campo === "codigo_identificador" && valor.trim()) {
        proximo.quantidade = 1;
      }

      return proximo;
    });
  }

  function iniciarEdicao(equipamento) {
    setEditandoId(equipamento.id);
    setForm({
      nome: equipamento.nome || "",
      categoria: equipamento.categoria || "",
      codigo_identificador: getCodigo(equipamento) === "-" ? "" : getCodigo(equipamento),
      data_compra: equipamento.data_compra || "",
      quantidade: equipamento.quantidade || 1,
      status: equipamento.status || "Disponível",
      setor_id: equipamento.setor_id || "",
      usuario: equipamento.usuario || "",
      ip: equipamento.ip || "",
      estacao: equipamento.estacao || "",
      processador: equipamento.processador || "",
      geracao: equipamento.geracao || "",
      ssd: equipamento.ssd || "",
      ram: equipamento.ram || "",
      observacoes: equipamento.observacoes || "",
    });
    setMensagem("");
    setErro("");
  }

  function limparForm() {
    setEditandoId(null);
    setForm(FORM_INICIAL);
  }

  async function criarCategoria() {
    if (!novaCategoria.trim()) return;

    setCriandoCategoria(true);
    setErro("");
    setMensagem("");

    try {
      const r = await api.post("/admin/categorias-equipamentos", {
        nome: novaCategoria.trim(),
      });

      await carregarApoio();
      setForm((atual) => ({ ...atual, categoria: r.data.nome }));
      setNovaCategoria("");
      setMensagem("Categoria cadastrada com sucesso.");
    } catch (err) {
      setErro(err.response?.data?.error || "Erro ao criar categoria.");
    } finally {
      setCriandoCategoria(false);
    }
  }

  function montarPayload() {
    const dataCompra = normalizarDataCompra(form.data_compra);

    if (dataCompra === null) {
      setErro("Data de compra inválida. Use o formato YYYY-MM-DD.");
      return null;
    }

    const payload = {
      ...form,
      data_compra: dataCompra || null,
      quantidade: form.codigo_identificador.trim() ? 1 : form.quantidade,
    };

    if (!ehComputador(form.categoria)) {
      payload.setor_id = null;
      payload.usuario = "";
      payload.ip = "";
      payload.estacao = "";
      payload.processador = "";
      payload.geracao = "";
      payload.ssd = "";
      payload.ram = "";
    }

    return payload;
  }

  async function salvarEquipamento(e) {
    e.preventDefault();
    setSalvando(true);
    setErro("");
    setMensagem("");

    const payload = montarPayload();
    if (!payload) {
      setSalvando(false);
      return;
    }

    try {
      if (editandoId) {
        await api.patch(`/admin/equipamentos/${editandoId}`, payload);
        setMensagem("Equipamento atualizado com sucesso.");
      } else {
        await api.post("/admin/equipamentos", payload);
        setMensagem("Equipamento cadastrado com sucesso.");
      }

      limparForm();
      await carregar();
      await carregarApoio();
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

  const fmtDataHora = (dt) =>
    dt ? new Date(dt).toLocaleString("pt-BR") : "-";

  return (
    <AdminLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Estoque</h1>
          <p className="page-subtitle">
            Almoxarifado interno de equipamentos
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
                placeholder="Buscar por nome, categoria, código, usuário ou IP"
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
                      <th>Código identificador</th>
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
                        <td className="estoque-muted">{getCodigo(equipamento)}</td>
                        <td className="estoque-muted">
                          {formatarData(equipamento.data_compra)}
                        </td>
                        <td>{equipamento.quantidade}</td>
                        <td>
                          <StatusBadge status={equipamento.status} />
                        </td>
                        <td>
                          <div className="estoque-actions">
                            {ehComputador(equipamento.categoria) && (
                              <Link
                                className="btn btn-secondary btn-sm"
                                to={`/admin/almoxarifado/computadores?equipamento=${equipamento.id}`}
                              >
                                Ver computador
                              </Link>
                            )}
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
              <select
                value={form.categoria}
                onChange={(e) => atualizarForm("categoria", e.target.value)}
              >
                <option value="">Selecione uma categoria</option>
                {categorias.map((categoria) => (
                  <option key={categoria.id} value={categoria.nome}>
                    {categoria.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="estoque-nova-categoria">
              <input
                value={novaCategoria}
                onChange={(e) => setNovaCategoria(e.target.value)}
                placeholder="Nova categoria"
              />
              <button
                className="btn btn-secondary btn-sm"
                type="button"
                disabled={criandoCategoria || !novaCategoria.trim()}
                onClick={criarCategoria}
              >
                Criar
              </button>
            </div>

            <div className="form-group">
              <label>Código identificador</label>
              <input
                value={form.codigo_identificador}
                onChange={(e) =>
                  atualizarForm("codigo_identificador", e.target.value)
                }
                placeholder="Código único do equipamento"
              />
            </div>

            <div className="estoque-form-grid">
              <div className="form-group">
                <label>Data de compra</label>
                <input
                  type="date"
                  min="1900-01-01"
                  max="9999-12-31"
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
                  disabled={Boolean(form.codigo_identificador.trim())}
                  onChange={(e) => atualizarForm("quantidade", e.target.value)}
                />
              </div>
            </div>

            {categoriaComputador && (
              <div className="estoque-computador-fields">
                <h4>Dados do computador</h4>

                <div className="form-group">
                  <label>Setor</label>
                  <select
                    value={form.setor_id}
                    onChange={(e) => atualizarForm("setor_id", e.target.value)}
                  >
                    <option value="">Selecione o setor</option>
                    {setores.map((setor) => (
                      <option key={setor.id} value={setor.id}>
                        {setor.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Usuário</label>
                  <input
                    value={form.usuario}
                    onChange={(e) => atualizarForm("usuario", e.target.value)}
                    placeholder="Responsável pelo computador"
                  />
                </div>

                <div className="estoque-form-grid">
                  <div className="form-group">
                    <label>IP</label>
                    <input
                      value={form.ip}
                      onChange={(e) => atualizarForm("ip", e.target.value)}
                      placeholder="Ex: 192.168.0.10"
                    />
                  </div>

                  <div className="form-group">
                    <label>Estação</label>
                    <input
                      value={form.estacao}
                      onChange={(e) => atualizarForm("estacao", e.target.value)}
                      placeholder="Ex: JTD-TI-01"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Processador</label>
                  <input
                    value={form.processador}
                    onChange={(e) => atualizarForm("processador", e.target.value)}
                    placeholder="Ex: Intel Core i5"
                  />
                </div>

                <div className="estoque-form-grid">
                  <div className="form-group">
                    <label>Geração</label>
                    <input
                      value={form.geracao}
                      onChange={(e) => atualizarForm("geracao", e.target.value)}
                      placeholder="Ex: 11ª"
                    />
                  </div>

                  <div className="form-group">
                    <label>SSD</label>
                    <input
                      value={form.ssd}
                      onChange={(e) => atualizarForm("ssd", e.target.value)}
                      placeholder="Ex: 256 GB"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>RAM</label>
                  <input
                    value={form.ram}
                    onChange={(e) => atualizarForm("ram", e.target.value)}
                    placeholder="Ex: 8 GB"
                  />
                </div>
              </div>
            )}

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
              {salvando
                ? "Salvando..."
                : editandoId
                  ? "Salvar Alterações"
                  : "Cadastrar"}
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
