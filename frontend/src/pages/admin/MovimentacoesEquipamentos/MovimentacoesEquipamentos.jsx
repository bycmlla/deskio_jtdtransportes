import { useEffect, useState } from "react";
import api from "../../../services/api";
import AdminLayout from "../../../components/AdminLayout/AdminLayout";
import Spinner from "../../../components/ui/Spinner";
import "./MovimentacoesEquipamentos.css";

function getCodigo(equipamento) {
  return (
    equipamento?.codigo_identificador ||
    equipamento?.numero_serie ||
    equipamento?.patrimonio ||
    "-"
  );
}

export default function MovimentacoesEquipamentos() {
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/admin/movimentacoes-equipamentos")
      .then((r) => setMovimentacoes(r.data))
      .finally(() => setLoading(false));
  }, []);

  const fmt = (dt) => (dt ? new Date(dt).toLocaleString("pt-BR") : "-");

  return (
    <AdminLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Movimentações</h1>
          <p className="page-subtitle">
            Histórico geral dos equipamentos do almoxarifado
          </p>
        </div>
      </div>

      <div className="card movimentacoes-table-card">
        {loading ? (
          <Spinner />
        ) : movimentacoes.length === 0 ? (
          <div className="empty-state">
            <h3>Nenhuma movimentação registrada</h3>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Equipamento</th>
                  <th>Código identificador</th>
                  <th>Evento</th>
                  <th>Descrição</th>
                  <th>Usuário</th>
                  <th>Solicitação</th>
                </tr>
              </thead>

              <tbody>
                {movimentacoes.map((mov) => (
                  <tr key={mov.id}>
                    <td className="movimentacoes-muted">{fmt(mov.data_evento)}</td>
                    <td className="movimentacoes-primary">
                      {mov.equipamento?.nome || "-"}
                    </td>
                    <td className="movimentacoes-code">
                      {getCodigo(mov.equipamento)}
                    </td>
                    <td>{mov.tipo_evento}</td>
                    <td>{mov.descricao}</td>
                    <td>{mov.usuario?.nome || "Sistema"}</td>
                    <td>{mov.solicitacao?.protocolo || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
