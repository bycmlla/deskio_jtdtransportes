import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "../../../services/api";
import PublicLayout from "../../../components/PublicLayout/PublicLayout";
import "./SolicitarEquipamento.css";

const EQUIPAMENTOS = [
  "Mouse",
  "Teclado",
  "Monitor",
  "Notebook",
  "Headset",
  "Carregador",
  "Cabos",
  "Outro",
];

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

const schema = z.object({
  solicitante_nome: z.string().min(2, "Nome do solicitante obrigatório"),
  solicitante_cpf: z
    .string()
    .min(11, "CPF obrigatório")
    .refine((cpf) => validarCPF(cpf), "CPF inválido"),
  solicitante_whatsapp: z
    .string()
    .min(10, "WhatsApp inválido")
    .regex(/^[\d\s\+\-\(\)]{10,20}$/, "WhatsApp inválido"),
  setor_id: z.string().min(1, "Selecione um setor"),
  equipamento_solicitado: z.string().min(1, "Selecione o equipamento"),
  justificativa: z
    .string()
    .min(10, "Descreva a necessidade com no mínimo 10 caracteres"),
  observacoes: z.string().optional(),
});

export default function SolicitarEquipamento() {
  const navigate = useNavigate();
  const [setores, setSetores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    api
      .get("/setores")
      .then((r) => setSetores(r.data))
      .catch(() => {});
  }, []);

  async function onSubmit(data) {
    setLoading(true);
    setApiError("");

    const cpfLimpo = limparCPF(data.solicitante_cpf);

    try {
      const res = await api.post("/solicitacoes-equipamentos", {
        ...data,
        solicitante_cpf: cpfLimpo,
      });

      sessionStorage.setItem("cpf_equipamentos", cpfLimpo);

      navigate(`/equipamento/confirmacao/${res.data.protocolo}`, {
        state: {
          ...res.data,
          solicitante_cpf: cpfLimpo,
        },
      });
    } catch (err) {
      setApiError(
        err.response?.data?.error ||
          "Erro ao enviar solicitação. Tente novamente.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <PublicLayout>
      <div className="solicitar-equipamento-container">
        <div className="solicitar-equipamento-header">
          <h1 className="solicitar-equipamento-title">Solicitar Equipamento</h1>
          <p className="solicitar-equipamento-subtitle">
            Preencha os dados para registrar o pedido ao almoxarifado interno.
          </p>
        </div>

        {apiError && <div className="alert alert-error">{apiError}</div>}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="card solicitar-equipamento-card">
            <h3 className="solicitar-equipamento-section-title">
              Dados do Solicitante
            </h3>

            <div className="solicitar-equipamento-form-grid">
              <div className="form-group solicitar-equipamento-full-row">
                <label>Nome do Solicitante *</label>
                <input
                  {...register("solicitante_nome")}
                  placeholder="Seu nome completo"
                />
                {errors.solicitante_nome && (
                  <p className="error-msg">{errors.solicitante_nome.message}</p>
                )}
              </div>

              <div className="form-group">
                <label>CPF *</label>
                <input
                  {...register("solicitante_cpf")}
                  placeholder="000.000.000-00"
                />
                {errors.solicitante_cpf && (
                  <p className="error-msg">{errors.solicitante_cpf.message}</p>
                )}
              </div>

              <div className="form-group">
                <label>WhatsApp *</label>
                <input
                  {...register("solicitante_whatsapp")}
                  placeholder="(11) 99999-9999"
                />
                {errors.solicitante_whatsapp && (
                  <p className="error-msg">
                    {errors.solicitante_whatsapp.message}
                  </p>
                )}
              </div>

              <div className="form-group solicitar-equipamento-full-row">
                <label>Setor *</label>
                <select {...register("setor_id")}>
                  <option value="">Selecione o setor</option>
                  {setores.map((setor) => (
                    <option key={setor.id} value={setor.id}>
                      {setor.nome}
                    </option>
                  ))}
                </select>
                {errors.setor_id && (
                  <p className="error-msg">{errors.setor_id.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="card solicitar-equipamento-card">
            <h3 className="solicitar-equipamento-section-title">
              Dados da Solicitação
            </h3>

            <div className="form-group">
              <label>Equipamento solicitado *</label>
              <select {...register("equipamento_solicitado")}>
                <option value="">Selecione o equipamento</option>
                {EQUIPAMENTOS.map((equipamento) => (
                  <option key={equipamento} value={equipamento}>
                    {equipamento}
                  </option>
                ))}
              </select>
              {errors.equipamento_solicitado && (
                <p className="error-msg">
                  {errors.equipamento_solicitado.message}
                </p>
              )}
            </div>

            <div className="form-group">
              <label>Justificativa / descrição da necessidade *</label>
              <textarea
                {...register("justificativa")}
                rows={5}
                placeholder="Descreva a necessidade do equipamento, uso previsto e urgência."
              />
              {errors.justificativa && (
                <p className="error-msg">{errors.justificativa.message}</p>
              )}
            </div>

            <div className="form-group">
              <label>Observações</label>
              <textarea
                {...register("observacoes")}
                rows={3}
                placeholder="Informe detalhes adicionais, se houver."
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary solicitar-equipamento-submit"
            disabled={loading}
          >
            {loading ? "Enviando..." : "Enviar Solicitação"}
          </button>
        </form>
      </div>
    </PublicLayout>
  );
}
