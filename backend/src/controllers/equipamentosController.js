import { Op } from "sequelize";
import sequelize from "../database.js";
import {
  Equipamento,
  EquipamentoAlocado,
  HistoricoEquipamento,
  Setor,
  SolicitacaoEquipamento,
  UsuarioAdmin,
} from "../models/index.js";

const STATUS_EQUIPAMENTO = [
  "Disponível",
  "Alocado",
  "Em manutenção",
  "Danificado",
  "Baixado",
];

const STATUS_SOLICITACAO = [
  "Pendente",
  "Aprovada",
  "Recusada",
  "Entregue",
  "Cancelada",
];

const STATUS_DEVOLUCAO = ["Disponível", "Em manutenção", "Danificado"];

function limparCPF(cpf) {
  return String(cpf || "").replace(/\D/g, "");
}

function normalizarVazio(valor) {
  const texto = String(valor || "").trim();
  return texto || null;
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

function limparWhatsApp(whatsapp) {
  return String(whatsapp || "").replace(/[\s\-\(\)]/g, "");
}

function validarWhatsApp(whatsapp) {
  return /^\+?[1-9]\d{7,14}$/.test(limparWhatsApp(whatsapp));
}

async function gerarProtocoloSolicitacao() {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const letras = "ABCDEFGHJKLMNPQRSTUVWXYZ";

  let tentativas = 0;
  while (tentativas < 100) {
    const seq = String(Math.floor(Math.random() * 9000) + 1000);
    const letra = letras[Math.floor(Math.random() * letras.length)];
    const protocolo = `EQ${yy}${mm}${dd}${seq}${letra}`;
    const existe = await SolicitacaoEquipamento.findOne({ where: { protocolo } });
    if (!existe) return protocolo;
    tentativas++;
  }

  throw new Error("Não foi possível gerar protocolo único");
}

async function registrarHistorico({
  equipamento_id,
  solicitacao_id = null,
  alocacao_id = null,
  usuario_id = null,
  tipo_evento,
  descricao,
  dados = null,
  transaction,
}) {
  return HistoricoEquipamento.create(
    {
      equipamento_id,
      solicitacao_id,
      alocacao_id,
      usuario_id,
      tipo_evento,
      descricao,
      dados,
      data_evento: new Date(),
    },
    { transaction },
  );
}

function montarPayloadEquipamento(body) {
  const numeroSerie = normalizarVazio(body.numero_serie);
  const quantidade = numeroSerie ? 1 : Number(body.quantidade || 1);

  return {
    nome: String(body.nome || "").trim(),
    categoria: String(body.categoria || "").trim(),
    numero_serie: numeroSerie,
    patrimonio: normalizarVazio(body.patrimonio),
    data_compra: normalizarVazio(body.data_compra),
    quantidade: Number.isFinite(quantidade) && quantidade > 0 ? quantidade : 1,
    status: body.status || "Disponível",
    observacoes: normalizarVazio(body.observacoes),
    data_atualizacao: new Date(),
  };
}

export async function criarSolicitacaoEquipamento(req, res) {
  try {
    const {
      solicitante_nome,
      solicitante_cpf,
      solicitante_whatsapp,
      setor_id,
      equipamento_solicitado,
      justificativa,
      observacoes,
    } = req.body;

    if (
      !solicitante_nome ||
      !solicitante_cpf ||
      !solicitante_whatsapp ||
      !setor_id ||
      !equipamento_solicitado ||
      !justificativa
    ) {
      return res.status(400).json({ error: "Todos os campos obrigatórios devem ser preenchidos" });
    }

    if (!validarCPF(solicitante_cpf)) {
      return res.status(400).json({ error: "CPF inválido" });
    }

    if (!validarWhatsApp(solicitante_whatsapp)) {
      return res.status(400).json({ error: "WhatsApp inválido" });
    }

    if (String(justificativa).trim().length < 10) {
      return res.status(400).json({
        error: "Justificativa deve ter no mínimo 10 caracteres",
      });
    }

    const setor = await Setor.findOne({ where: { id: setor_id, ativo: true } });
    if (!setor) {
      return res.status(400).json({ error: "Setor inválido ou inativo" });
    }

    const protocolo = await gerarProtocoloSolicitacao();
    const cpfLimpo = limparCPF(solicitante_cpf);
    const whatsappLimpo = limparWhatsApp(solicitante_whatsapp);

    const solicitacao = await SolicitacaoEquipamento.create({
      protocolo,
      solicitante_nome,
      solicitante_cpf: cpfLimpo,
      solicitante_whatsapp: whatsappLimpo,
      setor_id,
      equipamento_solicitado,
      justificativa,
      observacoes: normalizarVazio(observacoes),
      status: "Pendente",
      data_solicitacao: new Date(),
      data_atualizacao: new Date(),
    });

    return res.status(201).json({
      protocolo: solicitacao.protocolo,
      solicitante_nome: solicitacao.solicitante_nome,
      solicitante_cpf: solicitacao.solicitante_cpf,
      equipamento_solicitado: solicitacao.equipamento_solicitado,
      status: solicitacao.status,
      data_solicitacao: solicitacao.data_solicitacao,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
}

export async function listarEquipamentos(req, res) {
  try {
    const { status, categoria, busca } = req.query;
    const where = {};

    if (status) where.status = status;
    if (categoria) where.categoria = categoria;
    if (busca) {
      where[Op.or] = [
        { nome: { [Op.like]: `%${busca}%` } },
        { categoria: { [Op.like]: `%${busca}%` } },
        { numero_serie: { [Op.like]: `%${busca}%` } },
        { patrimonio: { [Op.like]: `%${busca}%` } },
      ];
    }

    const equipamentos = await Equipamento.findAll({
      where,
      order: [
        ["status", "ASC"],
        ["nome", "ASC"],
      ],
    });

    return res.json(equipamentos);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro interno" });
  }
}

export async function criarEquipamento(req, res) {
  const transaction = await sequelize.transaction();

  try {
    const payload = montarPayloadEquipamento(req.body);

    if (!payload.nome || !payload.categoria) {
      await transaction.rollback();
      return res.status(400).json({ error: "Nome e categoria são obrigatórios" });
    }

    if (!STATUS_EQUIPAMENTO.includes(payload.status)) {
      await transaction.rollback();
      return res.status(400).json({ error: "Status inválido" });
    }

    const equipamento = await Equipamento.create(
      {
        ...payload,
        data_criacao: new Date(),
      },
      { transaction },
    );

    await registrarHistorico({
      equipamento_id: equipamento.id,
      usuario_id: req.usuario.id,
      tipo_evento: "cadastro",
      descricao: `Equipamento "${equipamento.nome}" cadastrado no estoque`,
      dados: equipamento.toJSON(),
      transaction,
    });

    await transaction.commit();
    return res.status(201).json(equipamento);
  } catch (err) {
    await transaction.rollback();

    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ error: "Número de série já cadastrado" });
    }

    console.error(err);
    return res.status(500).json({ error: "Erro interno" });
  }
}

export async function editarEquipamento(req, res) {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const equipamento = await Equipamento.findByPk(id, { transaction });
    if (!equipamento) {
      await transaction.rollback();
      return res.status(404).json({ error: "Equipamento não encontrado" });
    }

    const anterior = equipamento.toJSON();
    const payload = montarPayloadEquipamento(req.body);

    if (!payload.nome || !payload.categoria) {
      await transaction.rollback();
      return res.status(400).json({ error: "Nome e categoria são obrigatórios" });
    }

    if (!STATUS_EQUIPAMENTO.includes(payload.status)) {
      await transaction.rollback();
      return res.status(400).json({ error: "Status inválido" });
    }

    await equipamento.update(payload, { transaction });

    let tipoEvento = "alteracao";
    let descricao = `Equipamento "${equipamento.nome}" atualizado`;

    if (anterior.status !== equipamento.status) {
      descricao = `Status alterado de "${anterior.status}" para "${equipamento.status}"`;

      if (equipamento.status === "Baixado") tipoEvento = "baixa";
      else if (equipamento.status === "Em manutenção") tipoEvento = "envio_manutencao";
      else if (anterior.status === "Em manutenção" && equipamento.status === "Disponível") {
        tipoEvento = "retorno_manutencao";
      }
    }

    await registrarHistorico({
      equipamento_id: equipamento.id,
      usuario_id: req.usuario.id,
      tipo_evento: tipoEvento,
      descricao,
      dados: { anterior, atual: equipamento.toJSON() },
      transaction,
    });

    await transaction.commit();
    return res.json(equipamento);
  } catch (err) {
    await transaction.rollback();

    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ error: "Número de série já cadastrado" });
    }

    console.error(err);
    return res.status(500).json({ error: "Erro interno" });
  }
}

export async function baixarEquipamento(req, res) {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { observacoes } = req.body || {};
    const equipamento = await Equipamento.findByPk(id, { transaction });

    if (!equipamento) {
      await transaction.rollback();
      return res.status(404).json({ error: "Equipamento não encontrado" });
    }

    if (equipamento.status === "Alocado") {
      await transaction.rollback();
      return res.status(400).json({
        error: "Equipamento alocado precisa ser devolvido antes da baixa",
      });
    }

    await equipamento.update(
      {
        status: "Baixado",
        observacoes: normalizarVazio(observacoes) || equipamento.observacoes,
        data_atualizacao: new Date(),
      },
      { transaction },
    );

    await registrarHistorico({
      equipamento_id: equipamento.id,
      usuario_id: req.usuario.id,
      tipo_evento: "baixa",
      descricao: `Equipamento "${equipamento.nome}" baixado do estoque`,
      dados: { observacoes: normalizarVazio(observacoes) },
      transaction,
    });

    await transaction.commit();
    return res.json(equipamento);
  } catch (err) {
    await transaction.rollback();
    console.error(err);
    return res.status(500).json({ error: "Erro interno" });
  }
}

export async function removerEquipamento(req, res) {
  return baixarEquipamento(req, res);
}

export async function historicoEquipamento(req, res) {
  try {
    const { id } = req.params;
    const historico = await HistoricoEquipamento.findAll({
      where: { equipamento_id: id },
      include: [
        { model: UsuarioAdmin, as: "usuario", attributes: ["nome"] },
        { model: SolicitacaoEquipamento, as: "solicitacao", attributes: ["protocolo"] },
      ],
      order: [["data_evento", "DESC"]],
    });

    return res.json(historico);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro interno" });
  }
}

export async function listarSolicitacoesEquipamentos(req, res) {
  try {
    const { status, busca } = req.query;
    const where = {};

    if (status) where.status = status;
    if (busca) {
      const cpfBusca = limparCPF(busca);
      const or = [
        { protocolo: { [Op.like]: `%${busca}%` } },
        { solicitante_nome: { [Op.like]: `%${busca}%` } },
        { equipamento_solicitado: { [Op.like]: `%${busca}%` } },
      ];
      if (cpfBusca) or.push({ solicitante_cpf: { [Op.like]: `%${cpfBusca}%` } });
      where[Op.or] = or;
    }

    const solicitacoes = await SolicitacaoEquipamento.findAll({
      where,
      include: [
        { model: Setor, as: "setor", attributes: ["nome"] },
        { model: Equipamento, as: "equipamento" },
      ],
      order: [["data_solicitacao", "DESC"]],
    });

    return res.json(solicitacoes);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro interno" });
  }
}

export async function alterarStatusSolicitacaoEquipamento(req, res) {
  try {
    const { id } = req.params;
    const { status, observacoes_admin } = req.body;

    if (!STATUS_SOLICITACAO.includes(status) || status === "Entregue") {
      return res.status(400).json({ error: "Status inválido para esta ação" });
    }

    const solicitacao = await SolicitacaoEquipamento.findByPk(id);
    if (!solicitacao) {
      return res.status(404).json({ error: "Solicitação não encontrada" });
    }

    const updates = {
      status,
      observacoes_admin: normalizarVazio(observacoes_admin) || solicitacao.observacoes_admin,
      data_atualizacao: new Date(),
    };

    if (status === "Aprovada" && !solicitacao.data_aprovacao) {
      updates.data_aprovacao = new Date();
    }

    await solicitacao.update(updates);
    return res.json(solicitacao);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro interno" });
  }
}

export async function entregarSolicitacaoEquipamento(req, res) {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { equipamento_id, observacoes } = req.body;

    const solicitacao = await SolicitacaoEquipamento.findByPk(id, { transaction });
    if (!solicitacao) {
      await transaction.rollback();
      return res.status(404).json({ error: "Solicitação não encontrada" });
    }

    if (["Recusada", "Cancelada", "Entregue"].includes(solicitacao.status)) {
      await transaction.rollback();
      return res.status(400).json({ error: "Solicitação não permite entrega" });
    }

    const equipamento = await Equipamento.findOne({
      where: { id: equipamento_id, status: "Disponível" },
      transaction,
    });

    if (!equipamento) {
      await transaction.rollback();
      return res.status(400).json({ error: "Equipamento indisponível para entrega" });
    }

    const alocacao = await EquipamentoAlocado.create(
      {
        equipamento_id: equipamento.id,
        solicitacao_id: solicitacao.id,
        colaborador_nome: solicitacao.solicitante_nome,
        colaborador_cpf: solicitacao.solicitante_cpf,
        colaborador_whatsapp: solicitacao.solicitante_whatsapp,
        setor_id: solicitacao.setor_id,
        data_entrega: new Date(),
        status: "Alocado",
        observacoes: normalizarVazio(observacoes),
      },
      { transaction },
    );

    await equipamento.update(
      { status: "Alocado", data_atualizacao: new Date() },
      { transaction },
    );

    await solicitacao.update(
      {
        status: "Entregue",
        equipamento_id: equipamento.id,
        data_aprovacao: solicitacao.data_aprovacao || new Date(),
        data_entrega: new Date(),
        observacoes_admin: normalizarVazio(observacoes) || solicitacao.observacoes_admin,
        data_atualizacao: new Date(),
      },
      { transaction },
    );

    await registrarHistorico({
      equipamento_id: equipamento.id,
      solicitacao_id: solicitacao.id,
      alocacao_id: alocacao.id,
      usuario_id: req.usuario.id,
      tipo_evento: "entrega",
      descricao: `Equipamento entregue para ${solicitacao.solicitante_nome}`,
      dados: {
        colaborador_nome: solicitacao.solicitante_nome,
        colaborador_cpf: solicitacao.solicitante_cpf,
        observacoes: normalizarVazio(observacoes),
      },
      transaction,
    });

    await transaction.commit();
    return res.status(201).json({ solicitacao, equipamento, alocacao });
  } catch (err) {
    await transaction.rollback();
    console.error(err);
    return res.status(500).json({ error: "Erro interno" });
  }
}

export async function listarEquipamentosAlocados(req, res) {
  try {
    const { status = "Alocado", busca } = req.query;
    const where = {};

    if (status) where.status = status;
    if (busca) {
      const cpfBusca = limparCPF(busca);
      const or = [
        { colaborador_nome: { [Op.like]: `%${busca}%` } },
      ];
      if (cpfBusca) or.push({ colaborador_cpf: { [Op.like]: `%${cpfBusca}%` } });
      where[Op.or] = or;
    }

    const alocados = await EquipamentoAlocado.findAll({
      where,
      include: [
        { model: Equipamento, as: "equipamento" },
        { model: Setor, as: "setor", attributes: ["nome"] },
        { model: SolicitacaoEquipamento, as: "solicitacao", attributes: ["protocolo"] },
      ],
      order: [["data_entrega", "DESC"]],
    });

    return res.json(alocados);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro interno" });
  }
}

export async function registrarDevolucaoEquipamento(req, res) {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { destino_status, observacoes } = req.body;

    if (!STATUS_DEVOLUCAO.includes(destino_status)) {
      await transaction.rollback();
      return res.status(400).json({ error: "Status de devolução inválido" });
    }

    const alocacao = await EquipamentoAlocado.findByPk(id, {
      include: [{ model: Equipamento, as: "equipamento" }],
      transaction,
    });

    if (!alocacao) {
      await transaction.rollback();
      return res.status(404).json({ error: "Alocação não encontrada" });
    }

    if (alocacao.status !== "Alocado") {
      await transaction.rollback();
      return res.status(400).json({ error: "Equipamento já devolvido" });
    }

    await alocacao.update(
      {
        status: "Devolvido",
        data_devolucao: new Date(),
        observacoes: normalizarVazio(observacoes) || alocacao.observacoes,
      },
      { transaction },
    );

    await alocacao.equipamento.update(
      {
        status: destino_status,
        data_atualizacao: new Date(),
      },
      { transaction },
    );

    let tipoEvento = "devolucao";
    if (destino_status === "Em manutenção") tipoEvento = "envio_manutencao";
    if (destino_status === "Danificado") tipoEvento = "marcado_danificado";

    await registrarHistorico({
      equipamento_id: alocacao.equipamento_id,
      solicitacao_id: alocacao.solicitacao_id,
      alocacao_id: alocacao.id,
      usuario_id: req.usuario.id,
      tipo_evento: tipoEvento,
      descricao: `Equipamento devolvido por ${alocacao.colaborador_nome} e marcado como ${destino_status}`,
      dados: {
        colaborador_nome: alocacao.colaborador_nome,
        colaborador_cpf: alocacao.colaborador_cpf,
        destino_status,
        observacoes: normalizarVazio(observacoes),
      },
      transaction,
    });

    await transaction.commit();
    return res.json({ alocacao, equipamento: alocacao.equipamento });
  } catch (err) {
    await transaction.rollback();
    console.error(err);
    return res.status(500).json({ error: "Erro interno" });
  }
}
