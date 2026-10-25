var usuarioModel = require("../models/usuarioModel");

function autenticar(req, res) {
    var email = req.body.emailServer;
    var senha = req.body.senhaServer;

    if (email == undefined) {
        res.status(400).send("Seu email está undefined!");
    } else if (senha == undefined) {
        res.status(400).send("Sua senha está indefinida!");
    } else {
        usuarioModel.autenticar(email, senha)
            .then(
                function (resultadoAutenticar) {
                    console.log("Resultados encontrados: " + resultadoAutenticar.length);

                    if (resultadoAutenticar.length == 1) {
                        res.json({
                            id_usuario: resultadoAutenticar[0].id_usuario,
                            email: resultadoAutenticar[0].email,
                            nome: resultadoAutenticar[0].nome,
                            cargo: resultadoAutenticar[0].cargo,
                            fk_empresa: resultadoAutenticar[0].fk_empresa
                        });
                    } else {
                        res.status(403).send("Email e/ou senha inválido(s)");
                    }
                }
            ).catch(
                function (erro) {
                    console.log(erro);
                    console.log("Houve um erro ao realizar o login!", erro.sqlMessage);
                    res.status(500).json(erro.sqlMessage);
                }
            );
    }
}

function cadastrar(req, res) {
    var nome = req.body.nomeServer;
    var email = req.body.emailServer;
    var cargo = req.body.cargoServer;
    var cpf = req.body.cpfServer;
    var fkEmpresa = req.body.idEmpresaVincularServer;

    if (nome == undefined) {
        res.status(400).send("Seu nome está undefined!");
    } else if (email == undefined) {
        res.status(400).send("Seu email está undefined!");
    } else if (cargo == undefined) {
        res.status(400).send("Seu cargo está undefined!");
    } else if (cpf == undefined) {
        res.status(400).send("Seu CPF está undefined!");
    } else if (fkEmpresa == undefined) {
        res.status(400).send("Sua empresa a vincular está undefined!");
    } else {
        usuarioModel.cadastrar(nome, cargo, cpf, email, fkEmpresa)
            .then(
                function (resultado) {
                    res.status(201).json(resultado);
                }
            ).catch(
                function (erro) {
                    console.log(erro);
                    console.log("Houve um erro ao realizar o cadastro!", erro.sqlMessage);
                    res.status(500).json(erro.sqlMessage);
                }
            );
    }
}

function listarPorEmpresa(req, res) {
    var idEmpresa = Number(req.params.idEmpresa);

    if (!Number.isInteger(idEmpresa) || idEmpresa <= 0) {
        return res.status(400).json({
            mensagem: "Identificador de empresa inválido."
        });
    }

    usuarioModel.listarPorEmpresa(idEmpresa)
        .then(
            function (resultado) {
                res.status(200).json(resultado);
            }
        ).catch(
            function (erro) {
                console.log("Erro ao listar usuários:", erro);
                res.status(500).json({
                    mensagem: "Não foi possível listar os usuários."
                });
            }
        );
}

function atualizarUsuario(req, res) {
    var idUsuario = Number(req.params.idUsuario);
    var idEmpresa = Number(req.body.idEmpresa);
    var nome = req.body.nome;
    var email = req.body.email;

    if (
        !Number.isInteger(idUsuario) || idUsuario <= 0 ||
        !Number.isInteger(idEmpresa) || idEmpresa <= 0 ||
        typeof nome !== "string" || nome.trim().length === 0 ||
        typeof email !== "string" ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
        return res.status(400).json({
            mensagem: "Informe um nome e um e-mail válidos."
        });
    }

    usuarioModel.atualizarUsuario(
        idUsuario,
        nome.trim(),
        email.trim(),
        idEmpresa
    )
        .then(
            function () {
                res.status(200).json({
                    mensagem: "Usuário atualizado com sucesso."
                });
            }
        ).catch(
            function (erro) {
                console.log("Erro ao atualizar usuário:", erro);
                res.status(500).json({
                    mensagem: "Não foi possível atualizar o usuário."
                });
            }
        );
}

function excluirUsuario(req, res) {
    var idUsuario = Number(req.params.idUsuario);
    var idEmpresa = Number(req.body.idEmpresa);

    if (
        !Number.isInteger(idUsuario) || idUsuario <= 0 ||
        !Number.isInteger(idEmpresa) || idEmpresa <= 0
    ) {
        return res.status(400).json({
            mensagem: "Identificador inválido."
        });
    }

    usuarioModel.excluirUsuario(idUsuario, idEmpresa)
        .then(
            function (resultado) {
                if (resultado.affectedRows === 0) {
                    return res.status(404).json({
                        mensagem: "Usuário não encontrado nesta empresa."
                    });
                }

                res.status(200).json({
                    mensagem: "Usuário desativado com sucesso."
                });
            }
        ).catch(
            function (erro) {
                console.log("Erro ao desativar usuário:", erro);
                res.status(500).json({
                    mensagem: "Não foi possível desativar o usuário."
                });
            }
        );
}


function ativar(req, res) {
    var email = req.body.emailServer;
    var codigo = req.body.codigoServer;
    var senha = req.body.senhaServer;
    var confirmacao = req.body.confirmacaoSenhaServer;

    if (!email || !codigo || !senha || !confirmacao) {
        return res.status(400).send("Preencha todos os campos.");
    }

    if (codigo.length !== 6) {
        return res.status(400).send("Digite os 6 caracteres do código.");
    }

    if (senha.length < 8 || !/[!@#$%&*]/.test(senha)) {
        return res.status(400).send(
            "A senha deve ter pelo menos 8 caracteres e um caractere especial."
        );
    }

    if (senha !== confirmacao) {
        return res.status(400).send("As senhas não coincidem.");
    }

    usuarioModel.ativar(email.trim(), codigo.toUpperCase(), senha)
        .then(function (resultado) {
            if (!resultado) {
                return res.status(400).send(
                    "E-mail ou código inválido, expirado ou conta já ativada."
                );
            }

            res.status(200).send("Conta ativada com sucesso!");
        })
        .catch(function (erro) {
            console.log("Erro ao ativar usuário:", erro);
            res.status(500).send("Não foi possível ativar a conta.");
        });
}


module.exports = {
    autenticar,
    cadastrar,
    listarPorEmpresa,
    atualizarUsuario,
    excluirUsuario,
    ativar
};
