var servidorModel = require("../models/servidorModel");

// --- Cadastro de máquina (grupo) ---
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

// --- Listagem dos cards com estado da máquina ---
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

function deletar(req, res) {
    var idServidor = req.params.idServidor;
    var fkEmpresa = req.body.fk_empresa || req.body.idEmpresa;

    if (!idServidor) {
        return res.status(400).send("O ID do servidor está indefinido!");
    }
    if (!fkEmpresa) {
        return res.status(400).send("A empresa do usuário (fk_empresa) não foi encontrada!");
    }

    servidorModel.deletar(idServidor, fkEmpresa)
        .then(function (resultado) {
            if (resultado.affectedRows === 0) {
                return res.status(404).send("Servidor não encontrado ou não pertence à sua empresa.");
            }
            res.status(200).json(resultado);
        })
        .catch(function (erro) {
            console.log("\nHouve um erro ao deletar o servidor! Erro: ", erro.sqlMessage || erro);
            res.status(500).json(erro.sqlMessage || erro);
        });
}

module.exports = {
    cadastrar,
    listarPorEmpresa,
    deletar
};
