
var medidaModel = require("../models/medidaModel");
 
var ID_CPU = 1, ID_DISCO = 2, ID_RAM = 3, ID_REDE = 4;
 
function idValido(valor) {
    var n = Number(valor);
    return Number.isInteger(n) && n > 0 ? n : null;
}
 
function buscarTempoReal(req, res) {
    var idServidor = idValido(req.params.idServidor);
    if (!idServidor) return res.status(400).json({ mensagem: "Servidor inválido." });
 
    medidaModel.buscarTempoReal(idServidor)
        .then(function (resultado) { res.status(200).json(resultado); })
        .catch(function (erro) {
            console.log("Erro ao buscar tempo real:", erro);
            res.status(500).json({ mensagem: "Não foi possível buscar as medidas." });
        });
}
 
function buscarUltimas(req, res) {
    var idServidor = idValido(req.params.idServidor);
    if (!idServidor) return res.status(400).json({ mensagem: "Servidor inválido." });
 
    var limite = Math.min(Math.max(Number(req.query.limite) || 20, 1), 100);
 
    Promise.all([
        medidaModel.buscarUltimas(idServidor, ID_CPU, limite),
        medidaModel.buscarUltimas(idServidor, ID_RAM, limite),
        medidaModel.buscarUltimas(idServidor, ID_DISCO, limite),
        medidaModel.buscarUltimas(idServidor, ID_REDE, limite)

    ])
        .then(function (series) {
            // o model devolve do mais novo ao mais antigo; o gráfico precisa do inverso
            res.status(200).json({
                cpu: series[0].reverse(),
                ram: series[1].reverse(),
                disco: series[2].reverse(),
                rede: series[3].reverse()
            });
        })
        .catch(function (erro) {
            console.log("Erro ao buscar últimas medidas:", erro);
            res.status(500).json({ mensagem: "Não foi possível buscar as medidas." });
        });
}
 
module.exports = { buscarTempoReal, buscarUltimas };
