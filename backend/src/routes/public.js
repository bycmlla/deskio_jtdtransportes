import { Router } from "express";
import {
  criarChamado,
  buscarChamadoPorProtocolo,
  listarChamadosPublicos,
} from "../controllers/chamadosPublicController.js";
import { criarSolicitacaoEquipamento } from "../controllers/equipamentosController.js";
import { Setor } from "../models/index.js";

const router = Router();

router.post("/chamados", criarChamado);
router.get("/chamados", listarChamadosPublicos);
router.get("/chamados/:protocolo", buscarChamadoPorProtocolo);
router.post("/solicitacoes-equipamentos", criarSolicitacaoEquipamento);
router.get("/setores", async (req, res) => {
  try {
    const setores = await Setor.findAll({
      where: { ativo: true },
      attributes: ["id", "nome"],
      order: [["nome", "ASC"]],
    });
    return res.json(setores);
  } catch (err) {
    return res.status(500).json({ error: "Erro interno" });
  }
});

export default router;
