var express = require("express");
var router = express.Router();
var alertaController = require("../controllers/alertaController");
 
router.get("/:idServidor", function (req, res) {
    alertaController.listarPorServidor(req, res);
});
 
module.exports = router;
 