import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    setLoading(true);

    try {
      await login(email, senha);
      navigate("/admin");
    } catch (err) {
      setErro(err.response?.data?.error || "Credenciais inválidas");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <section className="login-left">
        <div className="login-container">
          <div className="login-header">
            <div className="login-logo">D</div>

            <h1 className="login-title">Deskio - JTD Transportes</h1>
            <p className="login-subtitle">Painel Administrativo</p>
          </div>

          <form className="card login-card" onSubmit={handleSubmit}>
            {erro && <div className="alert alert-error login-error">{erro}</div>}

            <div className="form-group">
              <label>E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@helpdesk.com"
                autoComplete="email"
              />
            </div>

            <div className="form-group login-password-field">
              <label>Senha</label>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Digite sua senha"
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary login-submit-button"
              disabled={loading}
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <p className="login-footer-text">
            Acesso restrito a usuários autorizados
          </p>
        </div>
      </section>

      <section className="login-right">
        <div className="blob-scene">
          <div className="blob blob-main"></div>
          <div className="blob blob-one"></div>
          <div className="blob blob-two"></div>
          <div className="blob blob-three"></div>

          <div className="blob-content">
            <span className="blob-eyebrow">Deskio - JTD Transportes</span>
            <h2>Gestão de chamados e equipamentos</h2>
            <p>
              Organize solicitações, acompanhe status e mantenha sua equipe de
              TI mais produtiva.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
