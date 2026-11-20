// =========================================================
// VARIÁVEIS
// =========================================================

var contatos = [];
var idEmEdicao = null;
var idParaExcluir = null;

// IDs da tabela tipo_contato
var TIPOS_CONTATO = {
    telefone: 1,
    email: 2
};

// =========================================================
// IDENTIFICAÇÃO DO USUÁRIO
// =========================================================

function obterIdUsuario() {

    // Ajuste as chaves caso seu sessao.js utilize outros nomes.
    var idUsuario = sessionStorage.getItem("id_usuario");

    if (!idUsuario) {
        idUsuario = sessionStorage.getItem("idUsuario");
    }

    if (!idUsuario) {
        idUsuario = sessionStorage.getItem("ID_USUARIO");
    }

    return Number(idUsuario);
}


// =========================================================
// CARREGAR CONTATOS DO BANCO
// =========================================================

function carregarContatos() {

    var idUsuario = obterIdUsuario();

    if (!Number.isInteger(idUsuario) || idUsuario <= 0) {
        alert("Não foi possível identificar o usuário logado.");
        return;
    }

fetch(`/info_contato/listar/${idUsuario}`)
        .then(function (resposta) {

            if (!resposta.ok) {
                throw new Error("Erro ao buscar os contatos.");
            }

            return resposta.json();
        })
        .then(function (dados) {

            contatos = dados.map(function (item) {

                return {
                    id: item.idtipo_contato,
                    tipo: item.tipo_contato.toLowerCase() === "e-mail"
                        || item.tipo_contato.toLowerCase() === "email"
                        ? "email"
                        : "telefone",
                    valor: item.contatocol
                };
            });

            renderizarContatos();
        })
        .catch(function (erro) {

            console.log("Erro ao carregar contatos:", erro);

            document.getElementById("lista-contatos").innerHTML =
                "<p>Não foi possível carregar os contatos.</p>";
        });
}


// =========================================================
// RENDERIZAR CONTATOS
// =========================================================

function renderizarContatos() {

    const lista = document.getElementById("lista-contatos");

    lista.innerHTML = "";

    if (contatos.length === 0) {

        lista.innerHTML = `
            <p class="mensagem-contatos-vazios">
                Nenhuma informação de contato cadastrada.
            </p>
        `;

        return;
    }

    contatos.forEach(function (contato) {

        const ehEmail = contato.tipo === "email";

        const icone = ehEmail
            ? "fa-envelope"
            : "fa-phone";

        const titulo = ehEmail
            ? "E-mail"
            : "Telefone";

        const descricao = ehEmail
            ? "Contato eletrônico"
            : "Contato telefônico";

        const classeIcone = ehEmail
            ? "icone-email"
            : "icone-telefone";

        // Proteção básica para exibição de dados vindos do banco.
        const valorSeguro = escaparHTML(contato.valor);

        lista.innerHTML += `
            <div class="cartao-contato" data-id="${contato.id}">

                <div class="topo-cartao-contato">

                    <div class="info-titulo-contato">

                        <div class="icone-tipo-contato ${classeIcone}">
                            <i class="fa-solid ${icone}"></i>
                        </div>

                        <div>

                            <span class="titulo-tipo-contato">
                                ${titulo}
                            </span>

                            <span class="descricao-tipo-contato">
                                ${descricao}
                            </span>

                        </div>

                    </div>

                    <span class="etiqueta-contato">
                        <i class="fa-solid fa-circle-check"></i>
                        Cadastrado
                    </span>

                </div>

                <div class="valor-contato">
                    ${valorSeguro}
                </div>

                <div class="acoes-contato">

                    <button class="btn-editar-contato"
                        onclick="editarContato(${contato.id})">

                        <i class="fa-solid fa-pen"></i>
                        Editar

                    </button>

                    <button class="btn-excluir-contato"
                        onclick="excluirContato(${contato.id})">

                        <i class="fa-solid fa-trash"></i>
                        Excluir

                    </button>

                </div>

            </div>
        `;
    });
}


// =========================================================
// ESCAPAR HTML
// =========================================================

function escaparHTML(valor) {

    return String(valor)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}


// =========================================================
// ABRIR MODAL PARA CADASTRAR
// =========================================================

function abrirModalContato() {

    idEmEdicao = null;

    document.getElementById("form-contato").reset();

    document.getElementById("tipo-contato").disabled = false;

    document.getElementById("titulo-modal-contato")
        .innerText = "Adicionar contato";

    document.getElementById("mensagem-validacao")
        .innerText = "";

    document.getElementById("valor-contato-form")
        .placeholder = "Digite sua informação";

    document.getElementById("modal-contato")
        .classList.add("ativo");
}


// =========================================================
// EDITAR CONTATO
// =========================================================

function editarContato(id) {

    const contato = contatos.find(function (item) {
        return item.id === id;
    });

    if (!contato) {
        return;
    }

    idEmEdicao = contato.id;

    document.getElementById("tipo-contato").value =
        contato.tipo;

    // Impede a troca do tipo de contato durante a edição.
    // A PK do banco é composta pelo tipo e usuário.
    document.getElementById("tipo-contato").disabled = true;

    document.getElementById("valor-contato-form").value =
        contato.valor;

    document.getElementById("titulo-modal-contato")
        .innerText = "Editar contato";

    document.getElementById("mensagem-validacao")
        .innerText = "";

    document.getElementById("modal-contato")
        .classList.add("ativo");
}


// =========================================================
// VALIDAR CONTATO
// =========================================================

function validarContato(tipo, valor) {

    const mensagem = document.getElementById("mensagem-validacao");

    mensagem.innerText = "";

    if (!tipo || !valor) {

        mensagem.innerText = "Preencha todos os campos.";

        return false;
    }

    // VALIDAÇÃO DE EMAIL
    if (tipo === "email") {

        const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

        if (!regexEmail.test(valor)) {

            mensagem.innerText = "Digite um e-mail válido, como suporte@gmail.com";

            return false;
        }
    }

    // VALIDAÇÃO DE TELEFONE
    if (tipo === "telefone") {

        const numeros = valor.replace(/\D/g, "");

        if (numeros.length < 10 || numeros.length > 13) {

            mensagem.innerText =
                "Digite um telefone válido com DDD.";

            return false;
        }
    }

    return true;
}


// =========================================================
// SALVAR CONTATO (CADASTRAR OU EDITAR)
// =========================================================

function salvarContato(event) {

    event.preventDefault();

    const tipo = document.getElementById("tipo-contato").value;

    const valor = document.getElementById("valor-contato-form")
        .value.trim();

    if (!validarContato(tipo, valor)) {
        return;
    }

    const idUsuario = obterIdUsuario();

    if (!Number.isInteger(idUsuario) || idUsuario <= 0) {

        alert("Não foi possível identificar o usuário.");

        return;
    }

    const idTipoContato = TIPOS_CONTATO[tipo];

    // =====================================================
    // CADASTRAR
    // =====================================================

    if (idEmEdicao === null) {

        fetch("/info_contato/cadastrar", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                idUsuario: idUsuario,
                idTipoContato: idTipoContato,
                contato: valor

            })

        })
            .then(function (resposta) {

                if (!resposta.ok) {
                    throw new Error("Não foi possível cadastrar o contato.");
                }

                return resposta.json();
            })
            .then(function () {

                fecharModalContato();

                carregarContatos();

            })
            .catch(function (erro) {

                console.log("Erro ao cadastrar contato:", erro);

                alert("Não foi possível cadastrar o contato. Verifique se esse tipo de contato já está cadastrado.");
            });

    }

    // =====================================================
    // EDITAR
    // =====================================================

    else {

        fetch(`/info_contato/editar/${idUsuario}/${idEmEdicao}`, {
            method: "PUT",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                contato: valor

            })

        })
            .then(function (resposta) {

                if (!resposta.ok) {
                    throw new Error("Não foi possível atualizar o contato.");
                }

                return resposta.json();
            })
            .then(function () {

                fecharModalContato();

                carregarContatos();

            })
            .catch(function (erro) {

                console.log("Erro ao atualizar contato:", erro);

                alert("Não foi possível atualizar o contato.");
            });
    }
}


// =========================================================
// EXCLUIR CONTATO
// =========================================================

function excluirContato(id) {

    idParaExcluir = id;

    document.getElementById("modal-exclusao")
        .classList.add("ativo");
}


// =========================================================
// CONFIRMAR EXCLUSÃO
// =========================================================

function confirmarExclusao() {

    if (idParaExcluir === null) {
        return;
    }

    const idUsuario = obterIdUsuario();

    if (!Number.isInteger(idUsuario) || idUsuario <= 0) {

        alert("Não foi possível identificar o usuário.");

        return;
    }

    fetch(`/info_contato/excluir/${idUsuario}/${idParaExcluir}`, {
        method: "DELETE"

    })
        .then(function (resposta) {

            if (!resposta.ok) {
                throw new Error("Não foi possível excluir o contato.");
            }

            return resposta.json();
        })
        .then(function () {

            idParaExcluir = null;

            fecharModalExclusao();

            carregarContatos();

        })
        .catch(function (erro) {

            console.log("Erro ao excluir contato:", erro);

            alert("Não foi possível excluir o contato.");
        });
}


// =========================================================
// FECHAR MODAIS
// =========================================================

function fecharModalContato() {

    document.getElementById("modal-contato")
        .classList.remove("ativo");

    document.getElementById("tipo-contato").disabled = false;

    idEmEdicao = null;
}


function fecharModalExclusao() {

    document.getElementById("modal-exclusao")
        .classList.remove("ativo");

    idParaExcluir = null;
}


// =========================================================
// ALTERAR PLACEHOLDER
// =========================================================

document.getElementById("tipo-contato")
    .addEventListener("change", function () {

        const campo = document.getElementById(
            "valor-contato-form"
        );

        const mensagem = document.getElementById(
            "mensagem-validacao"
        );

        mensagem.innerText = "";

        if (this.value === "email") {

            campo.placeholder = "exemplo@gmail.com";

        } else if (this.value === "telefone") {

            campo.placeholder = "(11) 99999-9999";

        }
    });


// =========================================================
// FECHAR MODAL AO CLICAR FORA
// =========================================================

window.addEventListener("click", function (event) {

    const modalContato = document.getElementById(
        "modal-contato"
    );

    const modalExclusao = document.getElementById(
        "modal-exclusao"
    );

    if (event.target === modalContato) {

        fecharModalContato();

    }

    if (event.target === modalExclusao) {

        fecharModalExclusao();

    }

});


// =========================================================
// INICIALIZAÇÃO
// =========================================================

carregarContatos();