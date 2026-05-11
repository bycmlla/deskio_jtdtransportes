import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../../services/api";
import PublicLayout from "../../../components/PublicLayout/PublicLayout";
import StatusBadge from "../../../components/ui/StatusBadge";
import Spinner from "../../../components/ui/Spinner";
import "./ListaChamados.css";

function limparCPF(cpf) {
  return String(cpf || "").replace(/\D/g, "");
}

function validarCPF(cpf) {
  const cpfLimpo = limparCPF(cpf);

  if (cpfLimpo.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpfLimpo)) return false;

  let soma = 0;

  for (let i = 0; i < 9; i++) {
    soma += Number(cpfLimpo[i]) * (10 - i);
  }

  let resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;

  if (resto !== Number(cpfLimpo[9])) return false;

  soma = 0;

  for (let i = 0; i < 10; i++) {
    soma += Number(cpfLimpo[i]) * (11 - i);
  }

  resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;

  return resto === Number(cpfLimpo[10]);
}

export default function ListaChamados() {
  const navigate = useNavigate();

  const [cpfInput, setCpfInput] = useState("");
  const [cpfConsulta, setCpfConsulta] = useState(
    sessionStorage.getItem("cpf_chamados") || ""
  );

  const [chamados, setChamados] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [erroCpf, setErroCpf] = useState("");
  const [erroBusca, setErroBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [pagina, setPagina] = useState(1);

  useEffect(() => {
    if (!cpfConsulta) return;

    setLoading(true);
    setErroBusca("");

    const params = new URLSearchParams({
      cpf: limparCPF(cpfConsulta),
      page: pagina,
      limit: 20,
    });

    if (filtroStatus) {
      params.append("status", filtroStatus);
    }

    api
      .get(`/chamados?${params}`)
      .then((r) => {
        setChamados(r.data.chamados);
        setTotal(r.data.total);
      })
      .catch((err) => {
        setChamados([]);
        setTotal(0);
        setErroBusca(
          err.response?.data?.error || "Erro ao buscar chamados."
        );
      })
      .finally(() => setLoading(false));
  }, [cpfConsulta, filtroStatus, pagina]);

  function handleConsultarChamados(e) {
    e.preventDefault();

    setErroCpf("");

    if (!validarCPF(cpfInput)) {
      setErroCpf("Informe um CPF válido.");
      return;
    }

    const cpfLimpo = limparCPF(cpfInput);

    sessionStorage.setItem("cpf_chamados", cpfLimpo);
    setCpfConsulta(cpfLimpo);
    setPagina(1);
  }

  function handleTrocarCpf() {
    sessionStorage.removeItem("cpf_chamados");
    setCpfConsulta("");
    setCpfInput("");
    setChamados([]);
    setTotal(0);
    setPagina(1);
    setFiltroStatus("");
    setErroBusca("");
    setErroCpf("");
  }

  const fmt = (dt) => new Date(dt).toLocaleDateString("pt-BR");

  const totalPaginas = Math.ceil(total / 20);

  if (!cpfConsulta) {
    return (
      <PublicLayout>
        <div className="page-header">
          <div>
            <h1 className="page-title">Consultar chamados</h1>

            <p className="page-subtitle">
              Informe seu CPF para visualizar apenas os chamados abertos por você.
            </p>
          </div>

          <Link to="/abrir-chamado" className="btn btn-primary">
            + Novo Chamado
          </Link>
        </div>

        <div className="card lista-chamados-cpf-card">
          <form onSubmit={handleConsultarChamados}>
            <div className="form-group">
              <label>CPF *</label>

              <input
                value={cpfInput}
                onChange={(e) => setCpfInput(e.target.value)}
                placeholder="000.000.000-00"
              />

              {erroCpf && <p className="error-msg">{erroCpf}</p>}
            </div>

            <button type="submit" className="btn btn-primary">
              Consultar meus chamados
            </button>
          </form>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Meus chamados</h1>

          <p className="page-subtitle">
            {total} chamado{total !== 1 ? "s" : ""} encontrado
            {total !== 1 ? "s" : ""}
          </p>
        </div>

        <Link to="/abrir-chamado" className="btn btn-primary">
          + Novo Chamado
        </Link>
      </div>

      <div className="filters-row lista-chamados-filters-row">
        <select
          className="lista-chamados-status-select"
          value={filtroStatus}
          onChange={(e) => {
            setFiltroStatus(e.target.value);
            setPagina(1);
          }}
        >
          <option value="">Todos os status</option>
          <option value="Aberto">Aberto</option>
          <option value="Em andamento">Em andamento</option>
          <option value="Fechado">Fechado</option>
        </select>

        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={handleTrocarCpf}
        >
          Trocar CPF
        </button>
      </div>

      <div className="card lista-chamados-table-card">
        {loading ? (
          <Spinner />
        ) : erroBusca ? (
          <div className="empty-state">
            <h3>Não foi possível consultar</h3>
            <p>{erroBusca}</p>
          </div>
        ) : chamados.length === 0 ? (
          <div className="empty-state">
            <h3>Nenhum chamado encontrado</h3>
            <p>Não existem chamados vinculados a este CPF.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Protocolo</th>
                  <th>Título</th>
                  <th>Status</th>
                  <th>Prioridade</th>
                  <th>Data de Abertura</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {chamados.map((chamado) => (
                  <tr
                    key={chamado.protocolo}
                    className="lista-chamados-row"
                    onClick={() =>
                      navigate(
                        `/chamado/${chamado.protocolo}?cpf=${limparCPF(
                          cpfConsulta
                        )}`
                      )
                    }
                  >
                    <td>
                      <span className="lista-chamados-protocolo">
                        {chamado.protocolo}
                      </span>
                    </td>

                    <td className="lista-chamados-titulo-cell">
                      <span className="lista-chamados-titulo">
                        {chamado.titulo}
                      </span>
                    </td>

                    <td>
                      <StatusBadge status={chamado.status} />
                    </td>

                    <td>{chamado.prioridade}</td>

                    <td className="lista-chamados-data">
                      {fmt(chamado.data_abertura)}
                    </td>

                    <td>
                      <Link
                        to={`/chamado/${chamado.protocolo}?cpf=${limparCPF(
                          cpfConsulta
                        )}`}
                        className="btn btn-ghost btn-sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPaginas > 1 && (
        <div className="lista-chamados-paginacao">
          <button
            className="btn btn-secondary btn-sm"
            disabled={pagina === 1}
            onClick={() => setPagina((paginaAtual) => paginaAtual - 1)}
          >
            ← Anterior
          </button>

          <span className="lista-chamados-paginacao-texto">
            {pagina} / {totalPaginas}
          </span>

          <button
            className="btn btn-secondary btn-sm"
            disabled={pagina === totalPaginas}
            onClick={() => setPagina((paginaAtual) => paginaAtual + 1)}
          >
            Próxima →
          </button>
        </div>
      )}
    </PublicLayout>
  );
}
