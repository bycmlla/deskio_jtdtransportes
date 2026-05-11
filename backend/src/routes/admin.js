import { Router } from "express";
import { authMiddleware, adminOnly } from "../middleware/auth.js";
import {
  login,
  dashboard,
  listarChamados,
  detalhesChamado,
  alterarStatus,
  atribuirTecnico,
  adicionarObservacao,
  historicoChamado,
  listarSetoresAdmin,
  criarSetor,
  editarSetor,
  alterarStatusSetor,
  listarTecnicos,
} from "../controllers/adminController.js";
import {
  alterarStatusSolicitacaoEquipamento,
  baixarEquipamento,
  criarCategoriaEquipamento,
  criarEquipamento,
  editarEquipamento,
  entregarSolicitacaoEquipamento,
  historicoEquipamento,
  listarCategoriasEquipamentos,
  listarComputadores,
  listarEquipamentos,
  listarEquipamentosAlocados,
  listarMovimentacoesEquipamentos,
  listarSolicitacoesEquipamentos,
  registrarDevolucaoEquipamento,
  removerEquipamento,
} from "../controllers/equipamentosController.js";

const router = Router();

router.post("/login", login);
router.use(authMiddleware);

router.get("/dashboard", dashboard);
router.get("/chamados", listarChamados);
router.get("/chamados/:id", detalhesChamado);
router.patch("/chamados/:id/status", alterarStatus);
router.patch("/chamados/:id/tecnico", atribuirTecnico);
router.post("/chamados/:id/observacoes", adicionarObservacao);
router.get("/chamados/:id/historico", historicoChamado);
router.get("/tecnicos", listarTecnicos);

router.get("/setores", listarSetoresAdmin);
router.post("/setores", adminOnly, criarSetor);
router.patch("/setores/:id", adminOnly, editarSetor);
router.patch("/setores/:id/status", adminOnly, alterarStatusSetor);

router.get("/categorias-equipamentos", listarCategoriasEquipamentos);
router.post("/categorias-equipamentos", adminOnly, criarCategoriaEquipamento);

router.get("/equipamentos", listarEquipamentos);
router.post("/equipamentos", adminOnly, criarEquipamento);
router.patch("/equipamentos/:id", adminOnly, editarEquipamento);
router.patch("/equipamentos/:id/baixar", adminOnly, baixarEquipamento);
router.delete("/equipamentos/:id", adminOnly, removerEquipamento);
router.get("/equipamentos/:id/historico", historicoEquipamento);
router.get("/computadores", listarComputadores);
router.get("/movimentacoes-equipamentos", listarMovimentacoesEquipamentos);

router.get("/solicitacoes-equipamentos", listarSolicitacoesEquipamentos);
router.patch(
  "/solicitacoes-equipamentos/:id/status",
  alterarStatusSolicitacaoEquipamento,
);
router.post(
  "/solicitacoes-equipamentos/:id/entregar",
  entregarSolicitacaoEquipamento,
);

router.get("/equipamentos-alocados", listarEquipamentosAlocados);
router.patch(
  "/equipamentos-alocados/:id/devolver",
  registrarDevolucaoEquipamento,
);

export default router;
