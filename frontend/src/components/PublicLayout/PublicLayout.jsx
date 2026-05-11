import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import "./PublicLayout.css";

export default function PublicLayout({ children }) {
  const navigate = useNavigate();
  const [protocolo, setProtocolo] = useState("");

  function handleBusca(e) {
    e.preventDefault();

    if (protocolo.trim()) {
      navigate(`/chamado/${protocolo.trim().toUpperCase()}`);
    }
  }

  return (
    <div className="public-layout">
      <header className="public-header">
        <Link to="/" className="public-brand">
          <div className="public-brand-logo">D</div>

          <span className="public-brand-title">
            Deskio - JTD Transportes
          </span>
        </Link>

        <div className="public-header-actions">
          <form onSubmit={handleBusca} className="public-search-form">
            <input
              value={protocolo}
              onChange={(e) => setProtocolo(e.target.value)}
              placeholder="Buscar protocolo..."
              className="public-search-input"
            />

            <button type="submit" className="btn btn-secondary btn-sm">
              Buscar
            </button>
          </form>

          <Link to="/chamados" className="btn btn-ghost btn-sm">
            Meus Chamados
          </Link>

          <Link to="/solicitar-equipamento" className="btn btn-secondary btn-sm">
            Solicitar Equipamento
          </Link>

          <Link to="/abrir-chamado" className="btn btn-primary btn-sm">
            Novo Chamado
          </Link>
        </div>
      </header>

      <main className="public-main">{children}</main>

      <footer className="public-footer">
        Deskio - JTD Transportes - Sistema de Suporte
      </footer>
    </div>
  );
}
