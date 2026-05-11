import { useParams, useLocation, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../../services/api";
import PublicLayout from "../../../components/PublicLayout/PublicLayout";
import "./Confirmacao.css";

export default function Confirmacao() {
  const { protocolo } = useParams();
  const location = useLocation();
  const [dados, setDados] = useState(location.state || null);

  useEffect(() => {
    if (!dados) {
      api
        .get(`/chamados/${protocolo}`)
        .then((r) => setDados(r.data))
        .catch(() => {});
    }
  }, [protocolo, dados]);

  const protocoloAtual = protocolo || dados?.protocolo;

  const cpfAtual =
    location.state?.solicitante_cpf ||
    sessionStorage.getItem("cpf_chamados") ||
    "";

  return (
    <PublicLayout>
      <div className="confirmacao-container">
        <div className="confirmacao-icon">✓</div>

        <h1 className="confirmacao-title">Chamado Registrado!</h1>

        <p className="confirmacao-description">
          Sua solicitação foi recebida pela nossa equipe. Você receberá uma
          confirmação em seu WhatsApp. Nossa equipe técnica analisará sua
          solicitação e entrará em contato em breve.
        </p>

        <div className="card confirmacao-card">
          <div className="confirmacao-info-grid">
            <div>
              <p className="confirmacao-label">Protocolo</p>

              <p className="confirmacao-protocolo">{protocoloAtual}</p>
            </div>

            {dados?.solicitante_nome && (
              <div>
                <p className="confirmacao-label">Solicitante</p>

                <p>{dados.solicitante_nome}</p>
              </div>
            )}

            {dados?.titulo && (
              <div>
                <p className="confirmacao-label">Chamado</p>

                <p>{dados.titulo}</p>
              </div>
            )}
          </div>
        </div>

        <div className="confirmacao-actions">
          <Link
            to={`/chamado/${protocoloAtual}?cpf=${cpfAtual}`}
            className="btn btn-primary"
          >
            Acompanhar Chamado
          </Link>

          <Link to="/abrir-chamado" className="btn btn-secondary">
            Abrir Novo Chamado
          </Link>
        </div>

        <p className="confirmacao-footer-text">
          Guarde seu protocolo para consultas futuras
        </p>
      </div>
    </PublicLayout>
  );
}
