var alertaModel = require("../models/alertaModel");
 
function listarPorServidor(req, res) {
    var idServidor = Number(req.params.idServidor);
    if (!Number.isInteger(idServidor) || idServidor <= 0) {
        return res.status(400).json({ mensagem: "Servidor inválido." });
    }
 
    var limite = Math.min(Math.max(Number(req.query.limite) || 50, 1), 200);
 
    alertaModel.listarPorServidor(idServidor, limite)
        .then(function (resultado) { res.status(200).json(resultado); })
        .catch(function (erro) {
            console.log("Erro ao listar alertas:", erro);
            res.status(500).json({ mensagem: "Não foi possível listar os alertas." });
        });
}
 
module.exports = { listarPorServidor };
 