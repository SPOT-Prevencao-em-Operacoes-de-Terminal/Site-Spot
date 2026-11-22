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

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        const modal = document.getElementById("modal_cadastro_maquina");
        if (modal && modal.classList.contains("aberto")) {
            fecharModalCadastro();
        }
    }
});

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
                }, 1200);
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