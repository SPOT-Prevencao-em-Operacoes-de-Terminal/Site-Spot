
fetch('dados/faq.json')
    .then(function (resposta) {
        return resposta.json();
    })
    .then(function (perguntas) {
        let lista = document.getElementById('lista-perguntas');

        perguntas.forEach(function (item) {

            lista.innerHTML += `
                <div class="pergunta-faq">

                    <button class="botao-pergunta">
                        ${item.pergunta}
                        <span>+</span>
                    </button>

                    <div class="resposta-faq">
                        <p>${item.resposta}</p>
                    </div>

                </div>
            `;

        });

        let botoes = document.querySelectorAll('.botao-pergunta');

        botoes.forEach(function (botao) {

            botao.addEventListener('click', function () {

                let resposta = botao.nextElementSibling;

                resposta.classList.toggle('ativa');

                if (resposta.classList.contains('ativa')) {
                    botao.querySelector('span').innerHTML = '-';
                } else {
                    botao.querySelector('span').innerHTML = '+';
                }

            });

        });

    });
