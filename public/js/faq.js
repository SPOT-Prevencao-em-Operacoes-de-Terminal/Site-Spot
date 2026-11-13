
// FAQ - Perguntas Frequentes

fetch('./faq.json')
    .then(function (resposta) {
        if (!resposta.ok) {
            throw new Error("Não foi possível carregar o FAQ.");
        }

        return resposta.json();
    })
    .then(function (perguntas) {

        var lista = document.getElementById("lista-perguntas");

        perguntas.forEach(function (item) {

            lista.innerHTML += `
                <div class="pergunta-faq">

                    <button type="button" class="botao-pergunta">
                        ${item.pergunta}
                    </button>

                    <div class="resposta-faq">
                        <p>${item.resposta}</p>
                    </div>

                </div>
            `;

        });

        var botoes = document.querySelectorAll(".botao-pergunta");

        botoes.forEach(function (botao) {

            botao.addEventListener("click", function () {

                var resposta = botao.nextElementSibling;

                resposta.classList.toggle("ativa");

            });

        });

    })
    .catch(function (erro) {
        console.log("Erro ao carregar as perguntas:", erro);
    });
