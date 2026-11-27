// Tela "Visão Geral dos Servidores" (cardsAdmin.html e cardsUser.html)
const INTERVALO_CARDS_MS = 10000;
const PAGINA_DASHBOARD = window.location.pathname.includes("cardsAdmin")
    ? "./dashboardAdmin.html"
    : "./dashboardUser.html";

let timerCards = null;

function limparSessao() {
    sessionStorage.clear();
}

function navegarParaDashboard(idMaquina) {
    sessionStorage.ID_MAQUINA = idMaquina;
    window.location.href = PAGINA_DASHBOARD;
}

function esc(texto) {
    return String(texto).replace(/[&<>"']/g, function (c) {
        return { "&": "&", "<": "<", ">": ">", '"': "'", "'": "'" }[c];
    });
}

function linhaMetrica(rotulo, valor) {
    const temValor = valor !== null && valor !== undefined;
    const largura = temValor ? Math.min(valor, 100) : 0;
    const texto = temValor ? valor + "%" : "--";
    return `
        <div class="linha-metrica">
            <span class="rotulo-metrica">${rotulo}</span>
            <div class="fundo-barra-progresso">
                <div class="preenchimento-barra-progresso" style="width: ${largura}%;"></div>
            </div>
            <span class="valor-metrica">${texto}</span>
        </div>`;
}

function exibirMaquinas() {
    carregarMaquinas();
    if (!timerCards) {
        timerCards = setInterval(carregarMaquinas, INTERVALO_CARDS_MS);
    }
}

async function carregarMaquinas() {
    const container = document.getElementById("grelha-maquinas");
    const idEmpresa = sessionStorage.ID_EMPRESA;

    if (!idEmpresa) {
        container.innerHTML = "<p>Sessão sem empresa. Faça login novamente.</p>";
        return;
    }

    try {
        const resposta = await fetch(`/servidores/listar/${idEmpresa}`);
        if (!resposta.ok) throw new Error("HTTP " + resposta.status);
        const maquinas = await resposta.json();

        const etiquetas = {
            normal: { classe: "etiqueta-normal", texto: "Normal" },
            atencao: { classe: "etiqueta-atencao", texto: "Atenção" },
            critico: { classe: "etiqueta-critica", texto: "Crítico" }
        };

        const ehAdmin = Boolean(document.getElementById("modal_exclusao_maquina"));

        let totalNormal = 0, totalAtencao = 0, totalCritico = 0;
        let html = "";

        maquinas.forEach(function (item) {
            let etiqueta;
            if (item.semDados) {
                etiqueta = { classe: "etiqueta-normal", texto: "Sem dados" };
            } else {
                etiqueta = etiquetas[item.estado] || etiquetas.normal;
                if (item.estado === "normal") totalNormal++;
                if (item.estado === "atencao") totalAtencao++;
                if (item.estado === "critico") totalCritico++;
            }

            const idNumerico = Number(item.id);
            const nome = esc(item.hostname || "Máquina " + idNumerico);
            const tituloCompleto = `${nome} (#${idNumerico})`;

            const botaoExcluir = ehAdmin
                ? `<button type="button" class="botao-excluir-maquina" title="Excluir máquina"
                       aria-label="Excluir ${tituloCompleto}"
                       data-id="${idNumerico}"
                       data-nome="${tituloCompleto}"
                       onclick="abrirModalExclusaoMaquina(event, this.dataset.id, this.dataset.nome)">
                       <i class="fa-solid fa-trash"></i>
                   </button>`
                : "";

            html += `
                <div class="cartao-maquina" onclick="navegarParaDashboard(${idNumerico})">
                    <div class="cabecalho-cartao">
                        <div class="info-maquina">
                            <i class="fa-solid fa-server icone-maquina"></i>
                            <h4>${tituloCompleto}</h4>
                        </div>
                        <div class="acoes-cabecalho-cartao">
                            <span class="etiqueta-estado ${etiqueta.classe}">
                                <span class="ponto-etiqueta"></span> ${etiqueta.texto}
                            </span>
                            ${botaoExcluir}
                        </div>
                    </div>
                    <div class="lista-metricas">
                        ${linhaMetrica("CPU", item.cpu)}
                        ${linhaMetrica("RAM", item.ram)}
                        ${linhaMetrica("Disco", item.disco)}
                    </div>
                </div>`;
        });

        container.innerHTML = html || "<p>Nenhuma máquina cadastrada para esta empresa.</p>";

        document.getElementById("indicador-total").innerText = maquinas.length;
        document.getElementById("indicador-normal").innerText = totalNormal;
        document.getElementById("indicador-atencao").innerText = totalAtencao;
        document.getElementById("indicador-critico").innerText = totalCritico;
        document.getElementById("data-atualizacao").innerText =
            new Date().toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
    } catch (erro) {
        console.error("Erro ao carregar máquinas:", erro);
    }
}