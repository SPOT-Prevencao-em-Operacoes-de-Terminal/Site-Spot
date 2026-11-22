var info_contatoModel = require("../models/info_contatoModel");

function cadastrar(req, res) {
    var idUsuario = Number(req.body.idUsuario);
    var idTipoContato = Number(req.body.idTipoContato);
    var contato = req.body.contato;

    if (
        !Number.isInteger(idUsuario) || idUsuario <= 0 ||
        !Number.isInteger(idTipoContato) ||
        (idTipoContato !== 1 && idTipoContato !== 2) ||
        typeof contato !== "string" || contato.trim().length === 0
    ) {
        return res.status(400).json({
            mensagem: "Informe os dados válidos para cadastrar o contato."
        });
    }

    if (idTipoContato === 2) {
        var email = contato.trim();

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({
                mensagem: "Informe um e-mail válido."
            });
        }
    }

    if (idTipoContato === 1) {
        var telefone = contato.replace(/\D/g, "");

        if (telefone.length < 10 || telefone.length > 13) {
            return res.status(400).json({
                mensagem: "Informe um telefone válido."
            });
        }
    }

    info_contatoModel.cadastrar(
        idUsuario,
        idTipoContato,
        contato.trim()
    )
        .then(function (resultado) {
            res.status(201).json(resultado);
        })
        .catch(function (erro) {
            console.log("Erro ao cadastrar contato:", erro);
            res.status(500).json({
                mensagem: "Não foi possível cadastrar o contato."
            });
        });
}


function listar(req, res) {
    var idUsuario = Number(req.params.idUsuario);

    if (!Number.isInteger(idUsuario) || idUsuario <= 0) {
        return res.status(400).json({
            mensagem: "Identificador de usuário inválido."
        });
    }

    info_contatoModel.listar(idUsuario)
        .then(function (resultado) {
            res.status(200).json(resultado);
        })
        .catch(function (erro) {
            console.log("Erro ao listar contatos:", erro);
            res.status(500).json({
                mensagem: "Não foi possível listar os contatos."
            });
        });
}


function atualizarContato(req, res) {
    var idUsuario = Number(req.params.idUsuario);
    var idTipoContato = Number(req.params.idTipoContato);
    var contato = req.body.contato;

    if (
        !Number.isInteger(idUsuario) || idUsuario <= 0 ||
        !Number.isInteger(idTipoContato) ||
        (idTipoContato !== 1 && idTipoContato !== 2) ||
        typeof contato !== "string" || contato.trim().length === 0
    ) {
        return res.status(400).json({
            mensagem: "Informe os dados válidos para atualizar o contato."
        });
    }

    if (idTipoContato === 2) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contato.trim())) {
            return res.status(400).json({
                mensagem: "Informe um e-mail válido."
            });
        }
    }

    if (idTipoContato === 1) {
        var telefone = contato.replace(/\D/g, "");

        if (telefone.length < 10 || telefone.length > 13) {
            return res.status(400).json({
                mensagem: "Informe um telefone válido."
            });
        }
    }

    info_contatoModel.atualizarContato(
        idUsuario,
        idTipoContato,
        contato.trim()
    )
        .then(function (resultado) {
            if (resultado.affectedRows === 0) {
                return res.status(404).json({
                    mensagem: "Contato não encontrado."
                });
            }

            res.status(200).json({
                mensagem: "Contato atualizado com sucesso."
            });
        })
        .catch(function (erro) {
            console.log("Erro ao atualizar contato:", erro);
            res.status(500).json({
                mensagem: "Não foi possível atualizar o contato."
            });
        });
}


function excluirContato(req, res) {
    var idUsuario = Number(req.params.idUsuario);
    var idTipoContato = Number(req.params.idTipoContato);

    if (
        !Number.isInteger(idUsuario) || idUsuario <= 0 ||
        !Number.isInteger(idTipoContato) ||
        (idTipoContato !== 1 && idTipoContato !== 2)
    ) {
        return res.status(400).json({
            mensagem: "Identificadores inválidos."
        });
    }

    info_contatoModel.excluirContato(
        idUsuario,
        idTipoContato
    )
        .then(function (resultado) {
            if (resultado.affectedRows === 0) {
                return res.status(404).json({
                    mensagem: "Contato não encontrado."
                });
            }

            res.status(200).json({
                mensagem: "Contato excluído com sucesso."
            });
        })
        .catch(function (erro) {
            console.log("Erro ao excluir contato:", erro);
            res.status(500).json({
                mensagem: "Não foi possível excluir o contato."
            });
        });
}


module.exports = {
    cadastrar,
    listar,
    atualizarContato,
    excluirContato
};