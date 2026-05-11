import { useParams, Link, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../../services/api";
import PublicLayout from "../../../components/PublicLayout/PublicLayout";
import StatusBadge from "../../../components/ui/StatusBadge";
import Spinner from "../../../components/ui/Spinner";
import "./DetalhesChamado.css";

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

export default function DetalhesChamado() {
  const { protocolo } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const cpfUrl = searchParams.get("cpf") || "";
  const cpfSalvo = sessionStorage.getItem("cpf_chamados") || "";

  const [cpfInput, setCpfInput] = useState("");
  const [cpfConsulta, setCpfConsulta] = useState(cpfUrl || cpfSalvo);

  const [chamado, setChamado] = useState(null);
  const [loading, setLoading] = useState(Boolean(cpfUrl || cpfSalvo));
  const [erro, setErro] = useState("");
  const [erroCpf, setErroCpf] = useState("");

  useEffect(() => {
    if (!cpfConsulta) return;

    setLoading(true);
    setErro("");

    const cpfLimpo = limparCPF(cpfConsulta);

    api
      .get(`/chamados/${protocolo}?cpf=${cpfLimpo}`)
      .then((r) => {
        setChamado(r.data);
        sessionStorage.setItem("cpf_chamados", cpfLimpo);
      })
      .catch((err) => {
        setErro(
          err.response?.data?.error ||
            "Chamado não encontrado para este CPF."
        );
      })
      .finally(() => setLoading(false));
  }, [protocolo, cpfConsulta]);

  function handleConsultarChamado(e) {
    e.preventDefault();

    setErroCpf("");

    if (!validarCPF(cpfInput)) {
      setErroCpf("Informe um CPF válido.");
      return;
    }

    const cpfLimpo = limparCPF(cpfInput);

    sessionStorage.setItem("cpf_chamados", cpfLimpo);
    setSearchParams({ cpf: cpfLimpo });
    setCpfConsulta(cpfLimpo);
  }

  const fmt = (dt) => (dt ? new Date(dt).toLocaleString("pt-BR") : "—");

  if (!cpfConsulta) {
    return (
      <PublicLayout>
        <div className="empty-state">
          <h3>Confirme seu CPF</h3>

          <p>Para visualizar este chamado, informe o CPF usado na abertura.</p>

          <form onSubmit={handleConsultarChamado}>
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
              Consultar chamado
            </button>
          </form>

          <Link to="/chamados" className="btn btn-secondary detalhes-chamado-voltar">
            Ver meus chamados
          </Link>
        </div>
      </PublicLayout>
    );
  }

  if (loading) {
    return (
      <PublicLayout>
        <Spinner />
      </PublicLayout>
    );
  }

  if (erro) {
    return (
      <PublicLayout>
        <div className="empty-state">
          <h3>Chamado não encontrado</h3>

          <p>{erro}</p>

          <Link to="/chamados" className="btn btn-primary detalhes-chamado-voltar">
            Voltar
          </Link>
        </div>
      </PublicLayout>
    );
  }

  const dadosChamado = [
    { label: "Solicitante", value: chamado.solicitante_nome },
    { label: "Setor", value: chamado.setor },
    { label: "Prioridade", value: chamado.prioridade },
    { label: "Data de Abertura", value: fmt(chamado.data_abertura) },
    {
      label: "Técnico Responsável",
      value: chamado.tecnico || "Ainda não atribuído",
    },
  ];

  return (
    <PublicLayout>
      <div className="detalhes-chamado-container">
        <div className="detalhes-chamado-header">
          <div>
            <p className="detalhes-chamado-label">Protocolo</p>

            <h1 className="detalhes-chamado-protocolo">
              {chamado.protocolo}
            </h1>
          </div>

          <StatusBadge status={chamado.status} />
        </div>

        <div className="card detalhes-chamado-card">
          <h2 className="detalhes-chamado-titulo">{chamado.titulo}</h2>

          <div className="detalhes-chamado-info-grid">
            {dadosChamado.map(({ label, value }) => (
              <div key={label}>
                <p className="detalhes-chamado-info-label">{label}</p>

                <p
                  className={
                    value === "Ainda não atribuído"
                      ? "detalhes-chamado-info-value detalhes-chamado-info-value-empty"
                      : "detalhes-chamado-info-value"
                  }
                >
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="card detalhes-chamado-description-card">
          <h3 className="detalhes-chamado-section-title">Descrição</h3>

          <p className="detalhes-chamado-description">{chamado.descricao}</p>
        </div>

        <div className="detalhes-chamado-actions">
          <Link to="/chamados" className="btn btn-secondary">
            ← Ver meus chamados
          </Link>

          <Link to="/abrir-chamado" className="btn btn-primary">
            Abrir Novo Chamado
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}
