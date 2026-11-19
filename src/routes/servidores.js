var express = require("express");
var router = express.Router();
var servidorController = require("../controllers/servidorController");
 
router.get("/listar/:idEmpresa", function (req, res) {
    servidorController.listarPorEmpresa(req, res);
});
 
module.exports = router;
