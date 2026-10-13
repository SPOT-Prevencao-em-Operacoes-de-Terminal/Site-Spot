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
                    console.log(`\nResultados encontrados: ${resultadoAutenticar.length}`);
                    console.log(`Resultados: ${JSON.stringify(resultadoAutenticar)}`); // transforma JSON em String

                    if (resultadoAutenticar.length == 1) {
                        console.log(resultadoAutenticar);

                        res.json({
                            id_usuario: resultadoAutenticar[0].id_usuario,
                            email: resultadoAutenticar[0].email,
                            nome: resultadoAutenticar[0].nome,
                            senha: resultadoAutenticar[0].senha,
                            fk_empresa: resultadoAutenticar[0].fk_empresa
                        });

                    } else if (resultadoAutenticar.length == 0) {
                        res.status(403).send("Email e/ou senha inválido(s)");
                    } else {
                        res.status(403).send("Mais de um usuário com o mesmo login e senha!");
                    }
                }
            ).catch(
                function (erro) {
                    console.log(erro);
                    console.log("\nHouve um erro ao realizar o login! Erro: ", erro.sqlMessage);
                    res.status(500).json(erro.sqlMessage);
                }
            );
    }

}

function cadastrar(req, res) {
    // Crie uma variável que vá recuperar os valores do arquivo cadastro.html
    var nome = req.body.nomeServer;
    var email = req.body.emailServer;
    var cargo = req.body.cargoServer;
    var cpf = req.body.cpfServer;
    var senha = req.body.senhaServer;
    var fkEmpresa = req.body.idEmpresaVincularServer;

    // Faça as validações dos valores
    if (nome == undefined) {
        res.status(400).send("Seu nome está undefined!");
    } else if (email == undefined) {
        res.status(400).send("Seu email está undefined!");
    } else if (cargo == undefined) {
        res.status(400).send("Seu cargo está undefined!");
    } else if (cpf == undefined) {
        res.status(400).send("Seu CPF está undefined!");
    } else if (senha == undefined) {
        res.status(400).send("Sua senha está undefined!");
    } else if (fkEmpresa == undefined) {
        res.status(400).send("Sua empresa a vincular está undefined!");
    } else {

        // Passe os valores como parâmetro e vá para o arquivo usuarioModel.js
        usuarioModel.cadastrar(nome, cargo, cpf, email, senha, fkEmpresa)
            .then(
                function (resultado) {
                    res.json(resultado);
                }
            ).catch(
                function (erro) {
                    console.log(erro);
                    console.log(
                        "\nHouve um erro ao realizar o cadastro! Erro: ",
                        erro.sqlMessage
                    );
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
        .then(function (resultado) {
            res.status(200).json(resultado);
        })
        .catch(function (erro) {
            console.log("Erro ao listar usuários:", erro);
            res.status(500).json({
                mensagem: "Não foi possível listar os usuários."
            });
        });
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
        .then(function () {
            res.status(200).json({
                mensagem: "Usuário atualizado com sucesso."
            });
        })
        .catch(function (erro) {
            console.log("Erro ao atualizar usuário:", erro);
            res.status(500).json({
                mensagem: "Não foi possível atualizar o usuário."
            });
        });
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
        .then(function (resultado) {
            if (resultado.affectedRows === 0) {
                return res.status(404).json({
                    mensagem: "Usuário não encontrado nesta empresa."
                });
            }

            res.status(200).json({
                mensagem: "Usuário excluído com sucesso."
            });
        })
        .catch(function (erro) {
            console.log("Erro ao excluir usuário:", erro);
            res.status(500).json({
                mensagem: "Não foi possível excluir o usuário."
            });
        });
}

module.exports = {
    autenticar,
    cadastrar,
    listarPorEmpresa,
    atualizarUsuario,
    excluirUsuario
};