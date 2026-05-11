import { DataTypes } from "sequelize";
import sequelize from "../database.js";

export const Setor = sequelize.define(
  "Setor",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nome: { type: DataTypes.STRING(100), allowNull: false },
    ativo: { type: DataTypes.BOOLEAN, defaultValue: true },
    data_criacao: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    data_atualizacao: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { timestamps: false, tableName: "setores" },
);

export const UsuarioAdmin = sequelize.define(
  "usuario_admin",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nome: { type: DataTypes.STRING(100), allowNull: false },
    email: { type: DataTypes.STRING(150), allowNull: false, unique: true },
    senha_hash: { type: DataTypes.STRING(255), allowNull: false },
    perfil: {
      type: DataTypes.ENUM("admin", "tecnico"),
      defaultValue: "tecnico",
    },
    ativo: { type: DataTypes.BOOLEAN, defaultValue: true },
    data_criacao: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { timestamps: false, tableName: "usuarios_admin" },
);

export const Chamado = sequelize.define(
  "Chamado",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    protocolo: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    empresa_nome: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    empresa_documento: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    setor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    solicitante_nome: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    solicitante_cpf: {
      type: DataTypes.STRING(11),
      allowNull: false,
    },

    solicitante_whatsapp: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    titulo: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    descricao: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    prioridade: {
      type: DataTypes.ENUM("Baixa", "Média", "Alta"),
      allowNull: false,
      defaultValue: "Baixa",
    },
    status: {
      type: DataTypes.ENUM("Aberto", "Em andamento", "Fechado"),
      defaultValue: "Aberto",
    },
    tecnico_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    data_abertura: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    data_inicio_atendimento: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    data_fechamento: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    data_atualizacao: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  { timestamps: false, tableName: "chamados" },
);

export const HistoricoChamado = sequelize.define(
  "historico_chamado",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    chamado_id: { type: DataTypes.INTEGER, allowNull: false },
    usuario_id: { type: DataTypes.INTEGER, allowNull: true },
    tipo_evento: { type: DataTypes.STRING(50), allowNull: false },
    descricao: { type: DataTypes.TEXT, allowNull: false },
    prioridade: {
      type: DataTypes.ENUM("Baixa", "Média", "Alta"),
      allowNull: true,
    },
    data_evento: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { timestamps: false, tableName: "historico_chamados" },
);

export const ObservacaoInterna = sequelize.define(
  "observacao_interna",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    chamado_id: { type: DataTypes.INTEGER, allowNull: false },
    usuario_id: { type: DataTypes.INTEGER, allowNull: false },
    observacao: { type: DataTypes.TEXT, allowNull: false },
    data_criacao: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { timestamps: false, tableName: "observacoes_internas" },
);

export const Equipamento = sequelize.define(
  "Equipamento",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nome: { type: DataTypes.STRING(150), allowNull: false },
    categoria: { type: DataTypes.STRING(100), allowNull: false },
    numero_serie: { type: DataTypes.STRING(100), allowNull: true, unique: true },
    patrimonio: { type: DataTypes.STRING(100), allowNull: true },
    data_compra: { type: DataTypes.DATEONLY, allowNull: true },
    quantidade: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    status: {
      type: DataTypes.ENUM(
        "Disponível",
        "Alocado",
        "Em manutenção",
        "Danificado",
        "Baixado",
      ),
      allowNull: false,
      defaultValue: "Disponível",
    },
    observacoes: { type: DataTypes.TEXT, allowNull: true },
    data_criacao: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    data_atualizacao: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { timestamps: false, tableName: "equipamentos" },
);

export const SolicitacaoEquipamento = sequelize.define(
  "SolicitacaoEquipamento",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    protocolo: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    solicitante_nome: { type: DataTypes.STRING(100), allowNull: false },
    solicitante_cpf: { type: DataTypes.STRING(11), allowNull: false },
    solicitante_whatsapp: { type: DataTypes.STRING(20), allowNull: false },
    setor_id: { type: DataTypes.INTEGER, allowNull: false },
    equipamento_solicitado: { type: DataTypes.STRING(150), allowNull: false },
    justificativa: { type: DataTypes.TEXT, allowNull: false },
    observacoes: { type: DataTypes.TEXT, allowNull: true },
    observacoes_admin: { type: DataTypes.TEXT, allowNull: true },
    status: {
      type: DataTypes.ENUM("Pendente", "Aprovada", "Recusada", "Entregue", "Cancelada"),
      allowNull: false,
      defaultValue: "Pendente",
    },
    equipamento_id: { type: DataTypes.INTEGER, allowNull: true },
    data_solicitacao: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    data_aprovacao: { type: DataTypes.DATE, allowNull: true },
    data_entrega: { type: DataTypes.DATE, allowNull: true },
    data_atualizacao: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { timestamps: false, tableName: "solicitacoes_equipamentos" },
);

export const EquipamentoAlocado = sequelize.define(
  "EquipamentoAlocado",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    equipamento_id: { type: DataTypes.INTEGER, allowNull: false },
    solicitacao_id: { type: DataTypes.INTEGER, allowNull: true },
    colaborador_nome: { type: DataTypes.STRING(100), allowNull: false },
    colaborador_cpf: { type: DataTypes.STRING(11), allowNull: false },
    colaborador_whatsapp: { type: DataTypes.STRING(20), allowNull: true },
    setor_id: { type: DataTypes.INTEGER, allowNull: false },
    data_entrega: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    data_devolucao: { type: DataTypes.DATE, allowNull: true },
    status: {
      type: DataTypes.ENUM("Alocado", "Devolvido"),
      allowNull: false,
      defaultValue: "Alocado",
    },
    observacoes: { type: DataTypes.TEXT, allowNull: true },
  },
  { timestamps: false, tableName: "equipamentos_alocados" },
);

export const HistoricoEquipamento = sequelize.define(
  "HistoricoEquipamento",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    equipamento_id: { type: DataTypes.INTEGER, allowNull: false },
    solicitacao_id: { type: DataTypes.INTEGER, allowNull: true },
    alocacao_id: { type: DataTypes.INTEGER, allowNull: true },
    usuario_id: { type: DataTypes.INTEGER, allowNull: true },
    tipo_evento: { type: DataTypes.STRING(60), allowNull: false },
    descricao: { type: DataTypes.TEXT, allowNull: false },
    dados: { type: DataTypes.JSON, allowNull: true },
    data_evento: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { timestamps: false, tableName: "historico_equipamentos" },
);

Chamado.belongsTo(Setor, { foreignKey: "setor_id", as: "setor" });
Chamado.belongsTo(UsuarioAdmin, { foreignKey: "tecnico_id", as: "tecnico" });
HistoricoChamado.belongsTo(UsuarioAdmin, {
  foreignKey: "usuario_id",
  as: "usuario",
});
ObservacaoInterna.belongsTo(UsuarioAdmin, {
  foreignKey: "usuario_id",
  as: "usuario",
});
SolicitacaoEquipamento.belongsTo(Setor, { foreignKey: "setor_id", as: "setor" });
SolicitacaoEquipamento.belongsTo(Equipamento, {
  foreignKey: "equipamento_id",
  as: "equipamento",
});
EquipamentoAlocado.belongsTo(Equipamento, {
  foreignKey: "equipamento_id",
  as: "equipamento",
});
EquipamentoAlocado.belongsTo(SolicitacaoEquipamento, {
  foreignKey: "solicitacao_id",
  as: "solicitacao",
});
EquipamentoAlocado.belongsTo(Setor, { foreignKey: "setor_id", as: "setor" });
HistoricoEquipamento.belongsTo(Equipamento, {
  foreignKey: "equipamento_id",
  as: "equipamento",
});
HistoricoEquipamento.belongsTo(SolicitacaoEquipamento, {
  foreignKey: "solicitacao_id",
  as: "solicitacao",
});
HistoricoEquipamento.belongsTo(EquipamentoAlocado, {
  foreignKey: "alocacao_id",
  as: "alocacao",
});
HistoricoEquipamento.belongsTo(UsuarioAdmin, {
  foreignKey: "usuario_id",
  as: "usuario",
});

export default {
  Setor,
  UsuarioAdmin,
  Chamado,
  HistoricoChamado,
  ObservacaoInterna,
  Equipamento,
  SolicitacaoEquipamento,
  EquipamentoAlocado,
  HistoricoEquipamento,
};
