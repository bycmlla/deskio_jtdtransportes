import { Link, useLocation, useParams } from "react-router-dom";
import PublicLayout from "../../../components/PublicLayout/PublicLayout";
import "./ConfirmacaoEquipamento.css";

export default function ConfirmacaoEquipamento() {
  const { protocolo } = useParams();
  const location = useLocation();
  const dados = location.state || {};

  return (
    <PublicLayout>
      <div className="confirmacao-equipamento-container">
        <div className="confirmacao-equipamento-icon">OK</div>

        <h1 className="confirmacao-equipamento-title">
          Solicitação Registrada!
        </h1>

        <p className="confirmacao-equipamento-description">
          O pedido foi enviado para análise do administrador.
        </p>

        <div className="card confirmacao-equipamento-card">
          <div className="confirmacao-equipamento-info-grid">
            <div>
              <p className="confirmacao-equipamento-label">Protocolo</p>
              <p className="confirmacao-equipamento-protocolo">{protocolo}</p>
            </div>

            {dados?.solicitante_nome && (
              <div>
                <p className="confirmacao-equipamento-label">Solicitante</p>
                <p>{dados.solicitante_nome}</p>
              </div>
            )}

            {dados?.equipamento_solicitado && (
              <div>
                <p className="confirmacao-equipamento-label">Equipamento</p>
                <p>{dados.equipamento_solicitado}</p>
              </div>
            )}

            {dados?.status && (
              <div>
                <p className="confirmacao-equipamento-label">Status</p>
                <p>{dados.status}</p>
              </div>
            )}
          </div>
        </div>

        <div className="confirmacao-equipamento-actions">
          <Link to="/solicitar-equipamento" className="btn btn-primary">
            Nova Solicitação
          </Link>

          <Link to="/" className="btn btn-secondary">
            Voltar ao Início
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}
