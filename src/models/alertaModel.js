
var database = require("../database/config");
 
function listarPorServidor(idServidor, limite) {
    var instrucaoSql = `
        SELECT a.id_alerta, a.grau_alerta, c.nome AS componente, c.unidade_medida,
               l.valor, cf.limite,
               DATE_FORMAT(l.dia_hora, '%d/%m %H:%i:%s') AS momento,
               TIMESTAMPDIFF(SECOND, l.dia_hora, NOW()) AS segundos_atras
        FROM alerta a
        JOIN leitura l ON l.id_leitura = a.fk_leitura
        JOIN componente c ON c.id_componente = l.fk_configComponente
        LEFT JOIN configuracao cf ON cf.fk_componente = l.fk_configComponente
                                 AND cf.fk_servidor = l.fk_configServidor
        WHERE l.fk_configServidor = ?
        ORDER BY a.id_alerta DESC
        LIMIT ${Number(limite)};
    `;
    return database.executar(instrucaoSql, [idServidor]);
}
 
module.exports = { listarPorServidor };
 