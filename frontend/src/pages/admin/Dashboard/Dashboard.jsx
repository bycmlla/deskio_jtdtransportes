import { useEffect, useState } from "react";
import api from "../../../services/api";
import AdminLayout from "../../../components/AdminLayout/AdminLayout";
import Spinner from "../../../components/ui/Spinner";
import { Link } from "react-router-dom";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import "./Dashboard.css";

function Stat({ label, value, color, link, suffix = "" }) {
  const content = (
    <div className="card stat-card" style={{ "--stat-color": color }}>
      <p className="stat-label">{label}</p>
      <p className="stat-value">
        {value}
        {suffix}
      </p>
    </div>
  );

  if (!link) return content;

  return (
    <Link to={link} className="stat-link">
      {content}
    </Link>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/admin/dashboard")
      .then((r) => setStats(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <Spinner />
      </AdminLayout>
    );
  }

  const statusColors = {
    Abertos: "#F97316",
    "Em andamento": "#2563EB",
    Fechados: "#22C55E",
  };

  const chamadosPorSetor = stats.chamadosPorSetor || [];
  const chamadosPorDia = stats.chamadosPorDia || [];
  const statusDistribuicao = stats.statusDistribuicao || [];

  return (
    <AdminLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            Visão geral do sistema de chamados
          </p>
        </div>

        <Link to="/admin/chamados" className="btn btn-primary">
          Ver Todos os Chamados
        </Link>
      </div>

      <div className="stats-grid">
        <Stat
          label="Total de Chamados"
          value={stats.total}
          color="var(--text)"
          link="/admin/chamados"
        />

        <Stat
          label="Abertos"
          value={stats.abertos}
          color="var(--warning)"
          link="/admin/chamados?status=Aberto"
        />

        <Stat
          label="Em Andamento"
          value={stats.emAndamento}
          color="var(--accent)"
          link="/admin/chamados?status=Em andamento"
        />

        <Stat
          label="Fechados"
          value={stats.fechados}
          color="var(--success)"
          link="/admin/chamados?status=Fechado"
        />

        <Stat
          label="Taxa de Fechamento"
          value={stats.taxaFechamento}
          suffix="%"
          color="var(--success)"
        />

        <Stat
          label="Média por Dia"
          value={stats.mediaChamadosPorDia}
          color="var(--accent)"
        />

        <Stat
          label="Abertos Hoje"
          value={stats.abertosHoje}
          color="var(--warning)"
          link="/admin/chamados"
        />

        <Stat
          label="Tempo Médio de Fechamento"
          value={stats.tempoMedioFechamentoHoras}
          suffix="h"
          color="var(--danger)"
        />
      </div>

      <div className="dashboard-charts-grid">
        <div className="card dashboard-chart-card">
          <div className="dashboard-card-header">
            <h3 className="dashboard-card-title">Chamados por Setor</h3>
            <p className="dashboard-card-subtitle">
              Quantidade total de chamados agrupados por setor
            </p>
          </div>

          {chamadosPorSetor.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chamadosPorSetor}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="setor" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="total" name="Chamados" fill="#2563EB" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="empty-message">Nenhum chamado registrado</p>
          )}
        </div>

        <div className="card dashboard-chart-card">
          <div className="dashboard-card-header">
            <h3 className="dashboard-card-title">Distribuição por Status</h3>
            <p className="dashboard-card-subtitle">
              Proporção entre chamados abertos, em andamento e fechados
            </p>
          </div>

          {stats.total > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusDistribuicao}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={65}
                  outerRadius={100}
                  paddingAngle={4}
                  label
                >
                  {statusDistribuicao.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={statusColors[entry.name] || "#6B7280"}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="empty-message">Nenhum chamado registrado</p>
          )}
        </div>

        <div className="card dashboard-chart-card">
          <div className="dashboard-card-header">
            <h3 className="dashboard-card-title">% Fechados por Setor</h3>
            <p className="dashboard-card-subtitle">
              Percentual de chamados finalizados dentro de cada setor
            </p>
          </div>

          {chamadosPorSetor.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chamadosPorSetor}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="setor" />
                <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                <Tooltip formatter={(value) => `${value}%`} />
                <Bar
                  dataKey="porcentagemFechados"
                  name="% Fechados"
                  fill="#22C55E"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="empty-message">Nenhum chamado registrado</p>
          )}
        </div>

        <div className="card dashboard-chart-card">
          <div className="dashboard-card-header">
            <h3 className="dashboard-card-title">Chamados por Dia</h3>
            <p className="dashboard-card-subtitle">
              Volume diário dos últimos 14 dias
            </p>
          </div>

          {chamadosPorDia.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chamadosPorDia}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="data" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="total"
                  name="Chamados"
                  stroke="#2563EB"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="empty-message">Nenhum chamado registrado</p>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
