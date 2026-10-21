const dotenv = require("dotenv");
dotenv.config();

function must(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

module.exports = {
  PORT: process.env.PORT || 5001,

  // 🔥 ORACLE CONFIG
  DB_USER: must("DB_USER"),
  DB_PASSWORD: must("DB_PASSWORD"),
  DB_CONNECT_STRING_TMC: must("DB_CONNECT_STRING_TMC"),
  // DB_CONNECT_STRING_ANCL: must("DB_CONNECT_STRING_ANCL"),

  JWT_SECRET: must("JWT_SECRET"),
  JWT_REFRESH_SECRET : must("JWT_REFRESH_SECRET"),
  NODE_ENV: process.env.NODE_ENV || "development",
};