
var servidorModel = require("../models/servidorModel");
 
var MARGEM_ATENCAO = 5; // mesma regra do script Python (limite - 5)
 
function nivel(valor, limite) {
    if (valor === null || valor === undefined || limite === null || limite === undefined) return 0;
    if (valor >= limite) return 2;                  // crítico
    if (valor >= limite - MARGEM_ATENCAO) return 1; // atenção
    return 0;                                       // normal
}
 
function arredondar(v) {
    return v === null || v === undefined ? null : Math.round(v * 10) / 10;
}
 
function listarPorEmpresa(req, res) {
    var idEmpresa = Number(req.params.idEmpresa);
 
    if (!Number.isInteger(idEmpresa) || idEmpresa <= 0) {
        return res.status(400).json({ mensagem: "Empresa inválida." });
    }
 
    servidorModel.listarPorEmpresa(idEmpresa)
        .then(function (linhas) {
            var servidores = linhas.map(function (s) {
                var pior = Math.max(
                    nivel(s.cpu, s.limite_cpu),
                    nivel(s.ram, s.limite_ram),
                    nivel(s.disco, s.limite_disco)
                );
                return {
                    id: s.id_servidor,
                    hostname: s.hostname,
                    cpu: arredondar(s.cpu),
                    ram: arredondar(s.ram),
                    disco: arredondar(s.disco),
                    semDados: s.cpu === null && s.ram === null && s.disco === null,
                    estado: ["normal", "atencao", "critico"][pior]
                };
            });
            res.status(200).json(servidores);
        })
        .catch(function (erro) {
            console.log("Erro ao listar servidores:", erro);
            res.status(500).json({ mensagem: "Não foi possível listar os servidores." });
        });
}
 
module.exports = { listarPorEmpresa };
 