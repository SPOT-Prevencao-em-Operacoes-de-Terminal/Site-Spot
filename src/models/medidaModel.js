
var database = require("../database/config");
 
// Última leitura de cada componente do servidor (KPIs e polling), já com o limite
function buscarTempoReal(idServidor) {
    var instrucaoSql = `
        SELECT l.fk_configComponente AS id_componente,
               c.nome, c.unidade_medida, l.valor, cf.limite,
               DATE_FORMAT(l.dia_hora, '%H:%i:%s') AS momento
        FROM leitura l
        JOIN componente c ON c.id_componente = l.fk_configComponente
        LEFT JOIN configuracao cf ON cf.fk_componente = l.fk_configComponente
                                 AND cf.fk_servidor = l.fk_configServidor
        WHERE l.id_leitura IN (
            SELECT MAX(id_leitura) FROM leitura
            WHERE fk_configServidor = ?
            GROUP BY fk_configComponente
        );
    `;
    return database.executar(instrucaoSql, [idServidor]);
}
 
// Últimas N leituras de UM componente (gráfico). Vem do mais novo para o mais antigo.
function buscarUltimas(idServidor, idComponente, limite) {
    var instrucaoSql = `
        SELECT valor, DATE_FORMAT(dia_hora, '%H:%i:%s') AS momento
        FROM leitura
        WHERE fk_configServidor = ? AND fk_configComponente = ?
        ORDER BY id_leitura DESC
        LIMIT ${Number(limite)};
    `;
    return database.executar(instrucaoSql, [idServidor, idComponente]);
}
 
module.exports = { buscarTempoReal, buscarUltimas };
 