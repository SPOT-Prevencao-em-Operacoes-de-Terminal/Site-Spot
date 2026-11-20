var express = require("express");
var router = express.Router();

var contatoController = require("../controllers/contatoController");

// Recebendo os dados do HTML e direcionando para a função cadastrar de contatoController.js
router.post("/cadastrar", function (req, res) {
    contatoController.cadastrar(req, res);
});

// Recebendo o ID do usuário e direcionando para a função listar de contatoController.js
router.get("/listar/:idUsuario", function (req, res) {
    contatoController.listar(req, res);
});

// Recebendo o ID do usuário e o tipo de contato para atualizar
router.put("/editar/:idUsuario/:idTipoContato", function (req, res) {
    contatoController.atualizarContato(req, res);
});

// Recebendo o ID do usuário e o tipo de contato para excluir
router.delete("/excluir/:idUsuario/:idTipoContato", function (req, res) {
    contatoController.excluirContato(req, res);
});

module.exports = router;