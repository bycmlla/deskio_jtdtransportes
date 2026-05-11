import { Link } from "react-router-dom";
import PublicLayout from "../../../components/PublicLayout/PublicLayout";
import "./Inicio.css";

export default function Inicio() {
  return (
    <PublicLayout>
      <div className="inicio-container">
        <div className="inicio-header">
          <h1 className="inicio-title">Deskio - JTD Transportes</h1>
          <p className="inicio-subtitle">Escolha o tipo de atendimento</p>
        </div>

        <div className="inicio-options">
          <Link to="/abrir-chamado" className="inicio-option-card">
            <span className="inicio-option-icon">CH</span>
            <span className="inicio-option-content">
              <strong>Abrir Chamado</strong>
              <small>Suporte de TI</small>
            </span>
          </Link>

          <Link to="/solicitar-equipamento" className="inicio-option-card">
            <span className="inicio-option-icon">EQ</span>
            <span className="inicio-option-content">
              <strong>Solicitar Equipamento</strong>
              <small>Mouse, teclado, monitor, notebook e acessórios</small>
            </span>
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}
