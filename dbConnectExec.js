const sql = require('mssql')
const espositoConfig = require('./config.js')

const config = {
    user: espositoConfig.DB.user,
    password: espositoConfig.DB.password,
    server: espositoConfig.DB.server,
    database: espositoConfig.DB.database,
}
async function executeQuery(aQuery){
    var connection = await sql.connect(config)
    var result = await connection.query(aQuery)

    return result.recordset
}
module.exports = {executeQuery: executeQuery}