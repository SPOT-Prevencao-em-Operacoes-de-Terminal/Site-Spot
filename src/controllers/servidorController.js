var servidorModel = require("../models/servidorModel");

function cadastrar(req, res) {
    var hostname = req.body.hostname;
    var sistemaOperacional = req.body.sistema_operacional;
    var fkEmpresa = req.body.fk_empresa;
    var localizacao = req.body.localizacao;
    var macAddress = req.body.macAddress;
    var uuid = req.body.UUID;

    if (!hostname) {
        return res.status(400).send("O hostname está indefinido!");
    }
    if (!sistemaOperacional) {
        return res.status(400).send("O sistema operacional está indefinido!");
    }
    if (!localizacao) {
        return res.status(400).send("A localização está indefinida!");
    }
    if (!uuid) {
        return res.status(400).send("O UUID está indefinido!");
    }
    if (!fkEmpresa) {
        return res.status(400).send("A empresa do usuário (fk_empresa) não foi encontrada!");
    }

    servidorModel.cadastrar(hostname, sistemaOperacional, fkEmpresa, localizacao, macAddress, uuid)
        .then(function (resultado) {
            res.status(201).json(resultado);
        })
        .catch(function (erro) {
            console.log("\nHouve um erro ao realizar o cadastro do servidor! Erro: ", erro.sqlMessage || erro);
            res.status(500).json(erro.sqlMessage || erro);
        });
}

module.exports = {
    cadastrar
};