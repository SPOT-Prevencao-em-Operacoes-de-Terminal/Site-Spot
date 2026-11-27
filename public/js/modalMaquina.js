/* =========================================
   CONTROLE DO MODAL DE CADASTRO DE MÁQUINA
   ========================================= */

function abrirModalCadastro(event) {
    if (event) event.preventDefault();

    const modal = document.getElementById("modal_cadastro_maquina");
    const form = document.getElementById("form_cadastro_maquina");

    if (form) form.reset();
    limparFeedbackModal();

    if (modal) {
        modal.classList.add("aberto");
        document.getElementById("input_hostname")?.focus();
    }
}

function fecharModalCadastro() {
    const modal = document.getElementById("modal_cadastro_maquina");
    if (modal) {
        modal.classList.remove("aberto");
    }
    limparFeedbackModal();
}

function fecharModalAoClicarFora(event) {
    if (event.target.id === "modal_cadastro_maquina") {
        fecharModalCadastro();
    }
}

function aplicarMascaraMac(input) {
    let valorLimpo = input.value.replace(/[^0-9A-Fa-f]/g, "").toUpperCase();
    valorLimpo = valorLimpo.slice(0, 12);

    const pares = valorLimpo.match(/.{1,2}/g);
    input.value = pares ? pares.join(":") : "";
}

function exibirFeedbackModal(mensagem, tipo) {
    const box = document.getElementById("feedback_modal_maquina");
    if (!box) return;

    box.textContent = mensagem;
    box.className = `alerta-modal ${tipo}`;
    box.style.display = "block";
}

function limparFeedbackModal() {
    const box = document.getElementById("feedback_modal_maquina");
    if (!box) return;

    box.style.display = "none";
    box.textContent = "";
}

function prepararEnvioMaquina(event) {
    event.preventDefault();
    limparFeedbackModal();

    const hostname = document.getElementById("input_hostname").value.trim();
    const sistemaOperacional = document.getElementById("input_so").value.trim();
    const localizacao = document.getElementById("input_localizacao").value.trim();
    const uuid = document.getElementById("input_uuid").value.trim();
    const macAddress = document.getElementById("input_mac").value.trim();
    const fkEmpresa = sessionStorage.ID_EMPRESA || sessionStorage.FK_EMPRESA;

    if (!hostname || !sistemaOperacional || !localizacao || !uuid) {
        exibirFeedbackModal("Preencha todos os campos obrigatórios marcados com *.", "erro");
        return;
    }

    if (!fkEmpresa) {
        exibirFeedbackModal("Sessão da empresa não identificada. Faça login novamente.", "erro");
        return;
    }

    if (macAddress !== "") {
        const regexMac = /^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/;
        if (!regexMac.test(macAddress)) {
            exibirFeedbackModal("MAC Address inválido. Use o formato XX:XX:XX:XX:XX:XX ou deixe em branco.", "erro");
            return;
        }
    }

    const botaoSubmit = event.target.querySelector('button[type="submit"]');
    if (botaoSubmit) botaoSubmit.disabled = true;

    fetch("/servidores/cadastrar", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            hostname: hostname,
            sistema_operacional: sistemaOperacional,
            localizacao: localizacao,
            UUID: uuid,
            macAddress: macAddress || null,
            fk_empresa: fkEmpresa
        })
    })
        .then(function (resposta) {
            if (resposta.ok) {
                exibirFeedbackModal("Máquina cadastrada com sucesso!", "sucesso");
                setTimeout(() => {
                    fecharModalCadastro();
                    if (typeof carregarMaquinas === "function") {
                        carregarMaquinas();
                    }
                }, 1000);
            } else {
                resposta.text().then((texto) => {
                    exibirFeedbackModal(texto || "Erro ao cadastrar a máquina.", "erro");
                });
            }
        })
        .catch(function (erro) {
            console.error("Erro na requisição:", erro);
            exibirFeedbackModal("Falha de comunicação com o servidor.", "erro");
        })
        .finally(function () {
            if (botaoSubmit) botaoSubmit.disabled = false;
        });
}

/* =========================================
   CONTROLE DO MODAL DE EXCLUSÃO DE MÁQUINA
   ========================================= */

let idMaquinaParaExcluir = null;

function abrirModalExclusaoMaquina(event, idServidor, nomeMaquina) {
    if (event) event.stopPropagation();

    idMaquinaParaExcluir = idServidor;

    const modal = document.getElementById("modal_exclusao_maquina");
    const spanNome = document.getElementById("nome_maquina_exclusao");

    if (spanNome) spanNome.textContent = nomeMaquina;
    limparFeedbackExclusao();

    if (modal) {
        modal.classList.add("aberto");
    }
}

function fecharModalExclusaoMaquina() {
    const modal = document.getElementById("modal_exclusao_maquina");
    if (modal) {
        modal.classList.remove("aberto");
    }
    idMaquinaParaExcluir = null;
    limparFeedbackExclusao();
}

function fecharModalExclusaoMaquinaFora(event) {
    if (event.target.id === "modal_exclusao_maquina") {
        fecharModalExclusaoMaquina();
    }
}

function exibirFeedbackExclusao(mensagem, tipo) {
    const box = document.getElementById("feedback_modal_exclusao");
    if (!box) return;

    box.textContent = mensagem;
    box.className = `alerta-modal ${tipo}`;
    box.style.display = "block";
}

function limparFeedbackExclusao() {
    const box = document.getElementById("feedback_modal_exclusao");
    if (!box) return;

    box.style.display = "none";
    box.textContent = "";
}

function confirmarExclusaoMaquina() {
    if (!idMaquinaParaExcluir) return;

    const fkEmpresa = sessionStorage.ID_EMPRESA || sessionStorage.FK_EMPRESA;
    if (!fkEmpresa) {
        exibirFeedbackExclusao("Sessão da empresa não identificada. Faça login novamente.", "erro");
        return;
    }

    const botaoConfirmar = document.getElementById("btn_confirmar_exclusao_maquina");
    if (botaoConfirmar) botaoConfirmar.disabled = true;

    fetch(`/servidores/deletar/${encodeURIComponent(idMaquinaParaExcluir)}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            fk_empresa: fkEmpresa
        })
    })
        .then(function (resposta) {
            if (resposta.ok) {
                exibirFeedbackExclusao("Máquina excluída com sucesso!", "sucesso");
                setTimeout(() => {
                    fecharModalExclusaoMaquina();
                    if (typeof carregarMaquinas === "function") {
                        carregarMaquinas();
                    }
                }, 1000);
            } else {
                resposta.text().then((texto) => {
                    exibirFeedbackExclusao(texto || "Não foi possível excluir a máquina.", "erro");
                });
            }
        })
        .catch(function (erro) {
            console.error("Erro ao excluir máquina:", erro);
            exibirFeedbackExclusao("Falha de comunicação com o servidor.", "erro");
        })
        .finally(function () {
            if (botaoConfirmar) botaoConfirmar.disabled = false;
        });
}

/* =========================================
   ATALHO TECLA ESC PARA AMBOS OS MODAIS
   ========================================= */

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        const modalCadastro = document.getElementById("modal_cadastro_maquina");
        if (modalCadastro && modalCadastro.classList.contains("aberto")) {
            fecharModalCadastro();
        }

        const modalExclusao = document.getElementById("modal_exclusao_maquina");
        if (modalExclusao && modalExclusao.classList.contains("aberto")) {
            fecharModalExclusaoMaquina();
        }
    }
});