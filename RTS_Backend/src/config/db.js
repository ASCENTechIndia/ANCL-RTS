const oracledb = require("oracledb");

async function getConnectionTMC() {
  try {
    const connection = await oracledb.getConnection({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECT_STRING_TMC,
    });

    return connection;
  } catch (err) {
    console.error("Oracle DB connection error:", err);
    throw err;
  }
}


module.exports = { getConnectionTMC};