
var database = require("../database/config");
 
// Cards da tela de servidores: último valor de CPU (1), Disco (2) e RAM (3) + limites
function listarPorEmpresa(idEmpresa) {
    var instrucaoSql = `
        SELECT s.id_servidor, s.hostname,
            (SELECT l.valor FROM leitura l WHERE l.fk_configServidor = s.id_servidor
                AND l.fk_configComponente = 1 ORDER BY l.id_leitura DESC LIMIT 1) AS cpu,
            (SELECT l.valor FROM leitura l WHERE l.fk_configServidor = s.id_servidor
                AND l.fk_configComponente = 3 ORDER BY l.id_leitura DESC LIMIT 1) AS ram,
            (SELECT l.valor FROM leitura l WHERE l.fk_configServidor = s.id_servidor
                AND l.fk_configComponente = 2 ORDER BY l.id_leitura DESC LIMIT 1) AS disco,
            (SELECT cf.limite FROM configuracao cf WHERE cf.fk_servidor = s.id_servidor
                AND cf.fk_componente = 1) AS limite_cpu,
            (SELECT cf.limite FROM configuracao cf WHERE cf.fk_servidor = s.id_servidor
                AND cf.fk_componente = 3) AS limite_ram,
            (SELECT cf.limite FROM configuracao cf WHERE cf.fk_servidor = s.id_servidor
                AND cf.fk_componente = 2) AS limite_disco
        FROM servidor s
        WHERE s.fk_empresa = ?
        ORDER BY s.id_servidor;
    `;
    return database.executar(instrucaoSql, [idEmpresa]);
}
 
module.exports = { listarPorEmpresa };
 