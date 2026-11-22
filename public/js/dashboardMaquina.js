const INTERVALO_MS = 5000;
const MAX_PONTOS = 30;
const MARGEM_ATENCAO = 5;
const ESCALA_REDE_PADRAO = 10; 
const COMPONENTES = { cpu: 1, disco: 2, ram: 3, rede: 4 };
 
let meuGrafico = null;
let timerPolling = null;
let idMaquina = null;
 
// ---------- utilitários ----------
function esc(texto) {
    return String(texto).replace(/[&<>"']/g, function (c) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
}
 
function fmt(n, casas) {
    n = Number(n);
    if (casas === undefined) casas = 1;
    return Number.isInteger(n) ? String(n) : n.toFixed(casas);
}
 
function sufixoDe(unidade) {
    return unidade === "%" ? "%" : " " + (unidade || "");
}
 
// ---------- inicialização ----------
async function inicializarDashboard() {
    idMaquina = sessionStorage.ID_MAQUINA;
 
    if (!idMaquina) {
        window.location.href = window.location.pathname.includes("Admin")
            ? "./cardsAdmin.html"
            : "./cardsUser.html";
        return;
    }
 
    document.getElementById("titulo-maquina").innerText =
        `Dashboard do Computador - Máquina ${idMaquina}`;
 
    ajustarRotuloRede();
    renderizarGraficoTelemetria();
 
    await carregarHistorico();
    await ciclo();
    timerPolling = setInterval(ciclo, INTERVALO_MS);
}
 
async function ciclo() {
    await atualizarTempoReal();
    await carregarAlertas();
}
 
// O Java mede tráfego (MB/s), não latência
function ajustarRotuloRede() {
    const valor = document.getElementById("valor-kpi-rede");
    if (!valor) return;
    const cartao = valor.closest(".cartao-metrica");
    const rotulo = cartao && cartao.querySelector(".info-titulo-metrica span");
    if (rotulo) rotulo.innerText = "Rede - Tráfego";
    valor.innerText = "--";
}
 
// ---------- KPIs ----------
function calcularStatus(valor, limite) {
    if (limite === null || limite === undefined) {
        return { classe: "etiqueta-normal", texto: "Normal" };
    }
    if (valor >= limite) return { classe: "etiqueta-critica", texto: "Crítico" };
    if (valor >= limite - MARGEM_ATENCAO) return { classe: "etiqueta-atencao", texto: "Atenção" };
    return { classe: "etiqueta-normal", texto: "Normal" };
}
 
function atualizarTooltip(chave, limite, sufixo) {
    const status = document.getElementById(`status-kpi-${chave}`);
    if (!status) return;
    const painel = status.parentElement.querySelector(".painel-tooltip-parametros");
    if (!painel) return;
 
    const tituloEl = painel.querySelector(".titulo-tooltip");
    const titulo = tituloEl ? tituloEl.innerText : "Parâmetros";
 
    let itens;
    if (limite === null || limite === undefined) {
        itens = `<div class="item-parametro"><span>Limite não configurado</span></div>`;
    } else {
        const atencao = limite - MARGEM_ATENCAO;
        itens = `
            <div class="item-parametro">
                <span class="ponto-etiqueta ponto-verde"></span>
                <span>Normal: &lt; ${fmt(atencao)}${sufixo}</span>
            </div>
            <div class="item-parametro">
                <span class="ponto-etiqueta ponto-amarelo"></span>
                <span>Atenção: ${fmt(atencao)}${sufixo} - ${fmt(limite)}${sufixo}</span>
            </div>
            <div class="item-parametro">
                <span class="ponto-etiqueta ponto-vermelho"></span>
                <span>Crítico: &ge; ${fmt(limite)}${sufixo}</span>
            </div>`;
    }
    painel.innerHTML = `<span class="titulo-tooltip">${esc(titulo)}</span>${itens}`;
}
 
function atualizarKPI(chave, item) {
    const ehPercentual = item.unidade_medida === "%";
    // % é arredondado em 1 casa; tráfego (MB/s) mantém o valor real para os cálculos
    const valor = ehPercentual ? Math.round(Number(item.valor) * 10) / 10 : Number(item.valor);
    const limite = item.limite === null || item.limite === undefined ? null : Number(item.limite);
    const sufixo = sufixoDe(item.unidade_medida);
 
    // Tráfego abaixo de 1 MB/s é mostrado em KB/s, senão aparece "0.00 MB/s"
    let textoValor;
    if (ehPercentual) {
        textoValor = `${fmt(valor, 1)}${sufixo}`;
    } else if (valor < 1) {
        textoValor = `${(valor * 1024).toFixed(1)} KB/s`;
    } else {
        textoValor = `${fmt(valor, 2)}${sufixo}`;
    }
    document.getElementById(`valor-kpi-${chave}`).innerText = textoValor;
 
    const barra = document.getElementById(`barra-kpi-${chave}`);
    if (barra) {
        const escala = item.unidade_medida === "%" ? 100 : (limite || ESCALA_REDE_PADRAO);
        barra.style.width = `${Math.min((valor / escala) * 100, 100)}%`;
    }
 
    const elStatus = document.getElementById(`status-kpi-${chave}`);
    if (elStatus) {
        const info = calcularStatus(valor, limite);
        elStatus.className = `etiqueta-estado ${info.classe}`;
        elStatus.innerHTML = `<i class="fa-solid fa-circle-info icone-info-etiqueta"></i> ${info.texto}`;
    }
 
    atualizarTooltip(chave, limite, sufixo);
}
 
async function atualizarTempoReal() {
    try {
        const resposta = await fetch(`/medidas/tempo-real/${idMaquina}`);
        if (!resposta.ok) throw new Error("HTTP " + resposta.status);
        const itens = await resposta.json();
 
        const porId = {};
        itens.forEach(function (i) { porId[i.id_componente] = i; });
 
        Object.keys(COMPONENTES).forEach(function (chave) {
            const item = porId[COMPONENTES[chave]];
            if (item) atualizarKPI(chave, item);
        });
 
        adicionarPontoGrafico(porId);
    } catch (erro) {
        console.error("Erro ao buscar tempo real:", erro);
    }
}
 
// ---------- gráfico ----------
function renderizarGraficoTelemetria() {
    const ctx = document.getElementById("graficoTelemetria").getContext("2d");
 
    const serie = function (rotulo, cor) {
        return {
            label: rotulo, data: [], borderColor: cor, backgroundColor: "transparent",
            tension: 0.3, borderWidth: 2, pointRadius: 0
        };
    };
 
    meuGrafico = new Chart(ctx, {
        type: "line",
        data: {
            labels: [],
            datasets: [serie("CPU", "#3B82F6"), serie("RAM", "#8B5CF6"), serie("Disco", "#10B981")]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            plugins: { legend: { display: false } },
            scales: {
                y: {
                    min: 0, max: 100,
                    ticks: { callback: function (v) { return v + "%"; }, stepSize: 25, color: "#94A3B8" },
                    grid: { color: "#F1F5F9" }
                },
                x: { ticks: { color: "#94A3B8", maxTicksLimit: 8 }, grid: { display: false } }
            }
        }
    });
}
 
async function carregarHistorico() {
    try {
        const resposta = await fetch(`/medidas/ultimas/${idMaquina}?limite=${MAX_PONTOS}`);
        if (!resposta.ok) throw new Error("HTTP " + resposta.status);
        const dados = await resposta.json();
 
        const base = dados.cpu.length ? dados.cpu : (dados.ram.length ? dados.ram : dados.disco);
        meuGrafico.data.labels = base.map(function (p) { return p.momento; });
        meuGrafico.data.datasets[0].data = dados.cpu.map(function (p) { return p.valor; });
        meuGrafico.data.datasets[1].data = dados.ram.map(function (p) { return p.valor; });
        meuGrafico.data.datasets[2].data = dados.disco.map(function (p) { return p.valor; });
        meuGrafico.update();
    } catch (erro) {
        console.error("Erro ao buscar histórico:", erro);
    }
}
 
function adicionarPontoGrafico(porId) {
    const referencia = porId[COMPONENTES.cpu] || porId[COMPONENTES.ram] || porId[COMPONENTES.disco];
    if (!referencia || !meuGrafico) return;
 
    const rotulos = meuGrafico.data.labels;
    if (rotulos[rotulos.length - 1] === referencia.momento) return; // ainda não chegou leitura nova
 
    const valorDe = function (id) {
        return porId[id] ? Math.round(Number(porId[id].valor) * 10) / 10 : null;
    };
 
    rotulos.push(referencia.momento);
    meuGrafico.data.datasets[0].data.push(valorDe(COMPONENTES.cpu));
    meuGrafico.data.datasets[1].data.push(valorDe(COMPONENTES.ram));
    meuGrafico.data.datasets[2].data.push(valorDe(COMPONENTES.disco));
 
    if (rotulos.length > MAX_PONTOS) {
        rotulos.shift();
        meuGrafico.data.datasets.forEach(function (d) { d.data.shift(); });
    }
    meuGrafico.update("none");
}
 
function filtrarMetrica(tipo, elementoBotao) {
    document.querySelectorAll(".btn-filtro").forEach(function (b) { b.classList.remove("ativo"); });
    elementoBotao.classList.add("ativo");
 
    const visiveis = { todos: [true, true, true], cpu: [true, false, false],
                       ram: [false, true, false], disco: [false, false, true] }[tipo];
    const legendas = ["legenda-cpu", "legenda-ram", "legenda-disco"];
 
    visiveis.forEach(function (visivel, i) {
        meuGrafico.setDatasetVisibility(i, visivel);
        document.getElementById(legendas[i]).style.display = visivel ? "inline-block" : "none";
    });
    meuGrafico.update();
}
 
// ---------- alertas ----------
function textoTempo(segundos, momento) {
    if (segundos < 60) return "Agora mesmo";
    if (segundos < 3600) return `Há ${Math.floor(segundos / 60)} min`;
    if (segundos < 86400) return `Há ${Math.floor(segundos / 3600)} h`;
    return momento;
}
 
async function carregarAlertas() {
    try {
        const resposta = await fetch(`/alertas/${idMaquina}`);
        if (!resposta.ok) throw new Error("HTTP " + resposta.status);
        renderizarAlertas(await resposta.json());
    } catch (erro) {
        console.error("Erro ao buscar alertas:", erro);
    }
}
 
function renderizarAlertas(alertas) {
    const elPainel = document.getElementById("lista-alertas");
    const elModal = document.getElementById("conteudo-modal-alertas");
 
    if (!alertas.length) {
        const vazio = `<p class="mensagem-alerta">Nenhum alerta registrado.</p>`;
        elPainel.innerHTML = vazio;
        elModal.innerHTML = vazio;
        return;
    }
 
    const configEstado = {
        critico: { classeModal: "etiqueta-critica", textoModal: "Crítico", classePonto: "alerta-critico" },
        atencao: { classeModal: "etiqueta-atencao", textoModal: "Atenção", classePonto: "alerta-atencao" }
    };
 
    let htmlPainel = "";
    let htmlModal = "";
 
    alertas.forEach(function (a, indice) {
        const estado = String(a.grau_alerta).toLowerCase().startsWith("cr") ? "critico" : "atencao";
        const conf = configEstado[estado];
        const sufixo = sufixoDe(a.unidade_medida);
        const limite = a.limite === null || a.limite === undefined ? "" : ` (limite ${fmt(a.limite)}${sufixo})`;
        const mensagem = esc(`${a.componente} em ${fmt(a.valor)}${sufixo}${limite}`);
        const tempo = esc(textoTempo(a.segundos_atras, a.momento));
 
        if (indice < 6) {
            htmlPainel += `
                <div class="item-alerta-historico" onclick="abrirModalHistorico()">
                    <div class="conteudo-alerta-item">
                        <span class="ponto-estado-alerta ${conf.classePonto}"></span>
                        <div>
                            <p class="mensagem-alerta">${mensagem}</p>
                            <span class="tempo-alerta">${tempo}</span>
                        </div>
                    </div>
                    <i class="fa-solid fa-chevron-right icone-seta-alerta"></i>
                </div>`;
        }
 
        htmlModal += `
            <div class="item-alerta-historico">
                <div class="conteudo-alerta-item">
                    <span class="ponto-estado-alerta ${conf.classePonto}"></span>
                    <div>
                        <p class="mensagem-alerta">${mensagem}</p>
                        <span class="tempo-alerta">${tempo}</span>
                    </div>
                </div>
                <span class="badge-modal ${conf.classeModal}">${conf.textoModal}</span>
            </div>`;
    });
 
    elPainel.innerHTML = htmlPainel;
    elModal.innerHTML = htmlModal;
}
 
// ---------- menu e modal (mantidos do original) ----------
function alternarMenuUsuario(event) {
    event.stopPropagation();
    document.getElementById("menu-dropdown-usuario").classList.toggle("ativo");
}
 
window.addEventListener("click", function () {
    const menu = document.getElementById("menu-dropdown-usuario");
    if (menu && menu.classList.contains("ativo")) menu.classList.remove("ativo");
});
 
function abrirModalHistorico() {
    document.getElementById("modal-historico").classList.add("ativo");
}
 
function fecharModalHistorico() {
    document.getElementById("modal-historico").classList.remove("ativo");
}
 
window.addEventListener("click", function (event) {
    const modal = document.getElementById("modal-historico");
    if (event.target === modal) fecharModalHistorico();
});
 