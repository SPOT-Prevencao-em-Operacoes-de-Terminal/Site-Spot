var express = require("express");
var router = express.Router();
var medidaController = require("../controllers/medidaController");
 
router.get("/tempo-real/:idServidor", function (req, res) {
    medidaController.buscarTempoReal(req, res);
});
 
router.get("/ultimas/:idServidor", function (req, res) {
    medidaController.buscarUltimas(req, res);
});
 
module.exports = router;
 