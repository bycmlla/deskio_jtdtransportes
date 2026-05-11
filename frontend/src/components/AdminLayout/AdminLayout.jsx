import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./AdminLayout.css";
import DashboardIcon from "../../assets/icons/dashboard.png";
import ChamadosIcon from "../../assets/icons/chamados.png";
import SetoresIcon from "../../assets/icons/setor.png";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: DashboardIcon },
  { to: "/admin/chamados", label: "Chamados", icon: ChamadosIcon },
  { to: "/admin/equipamentos", label: "Estoque Equip.", icon: SetoresIcon },
  { to: "/admin/solicitacoes-equipamentos", label: "Solicitações Equip.", icon: ChamadosIcon },
  { to: "/admin/equipamentos-alocados", label: "Equip. Alocados", icon: SetoresIcon },
  { to: "/admin/setores", label: "Setores", icon: SetoresIcon },
];

export default function AdminLayout({ children }) {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  function handleLogout() {
    logout();
    navigate("/admin/login");
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <div className="admin-brand">
            <div className="admin-brand-logo">D</div>

            <div>
              <div className="admin-brand-title">Deskio - JTD Transportes</div>
              <div className="admin-brand-subtitle">Painel Admin</div>
            </div>
          </div>
        </div>

        <nav className="admin-nav">
          {navItems.map((item) => {
            const active =
              location.pathname === item.to ||
              (item.to !== "/admin" && location.pathname.startsWith(item.to));

            return (
              <Link
                key={item.to}
                to={item.to}
                className={active ? "admin-nav-link active" : "admin-nav-link"}
              >
                <img
                  src={item.icon}
                  alt={item.label}
                  className="admin-nav-icon"
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="admin-user-box">
          <div className="admin-user-info">
            <p className="admin-user-name">{usuario?.nome}</p>
            <p className="admin-user-role">{usuario?.perfil}</p>
          </div>

          <button
            onClick={handleLogout}
            className="btn btn-ghost btn-sm admin-logout-button"
          >
            Sair
          </button>
        </div>
      </aside>

      <main className="admin-main">{children}</main>
    </div>
  );
}
