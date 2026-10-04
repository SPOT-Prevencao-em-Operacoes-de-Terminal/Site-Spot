var contatoModel = require("../models/contatoModel");

function cadastrar(req, res) {

    var nome = req.body.nomeServer;
    var email = req.body.emailServer;
    var telefone = req.body.telefoneServer;
    var nomeEmpresa = req.body.nomeEmpresaServer;

    if (nome == undefined) {
        res.status(400).send("Seu nome está undefined!");
    } else if (email == undefined) {
        res.status(400).send("Seu email está undefined!");
    } else if (telefone == undefined) {
        res.status(400).send("Seu telefone está undefined!");
    } else if (nomeEmpresa == undefined) {
        res.status(400).send("O nome da empresa está undefined!");
    } else {

        contatoModel.cadastrar(nome, email, telefone, nomeEmpresa)
            .then(function (resultado) {
                res.json(resultado);
            })
            .catch(function (erro) {
                console.log(erro);
                console.log(
                    "\nHouve um erro ao realizar o cadastro do contato! Erro: ",
                    erro.sqlMessage
                );
                res.status(500).json(erro.sqlMessage);
            });
    }
}

module.exports = {
    cadastrar
};