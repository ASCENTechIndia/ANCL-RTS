const oracledb = require("oracledb");
const { executeProcedureTMC } = require("../../../db/procedureExecutor");
const { executeQueryTMC } = require("../../../db/queryExecutor");

async function insertNewTaxAssessment(params) {
  const {
    userId,
    zoneId,
    serviceId,
    appliName,
    appliAdd,
    propConstrFlag,
    propUsageFlag,
    permisCertNo,
    parvanaCertNo,
    parvanaDate,
    propTypeFlag,
    sectorNo,
    remarkSurvey,
    prabhagKarType,
    vikasAppealNo,
    propOwnName,
    vikasName,
    taxesReceipt,
    appSource,
    ulbid,
  } = params;

  console.log("Insert New Tax Assessment:", {
    userId,
    zoneId,
    serviceId,
    appliName,
    appSource,
  });

  const sql = `
    BEGIN
      aorts_NewTaxAsses_ins(
        :IN_USERID,
        :IN_Zoneid,
        :IN_Serviceid,
        :IN_AppliName,
        :IN_AppliAdd,
        :IN_propconstrflag,
        :IN_propusageflag,
        :IN_permiscertino,
        :IN_parvanacertino,
        :IN_parvanadate,
        :IN_proptypeflag,
        :IN_sectorno,
        :IN_remarksurvey,
        :IN_prabhagkartype,
        :IN_vikasappealno,
        :IN_propownname,
        :IN_vikasname,
        :IN_taxesreceipt,
        :in_source,
        :in_ulbid,
        :out_errcode,
        :out_ErrMsg,
        :out_applino
      );
    END;
  `;

  const binds = {
    IN_USERID: userId,
    IN_Zoneid: { val: Number(zoneId), type: oracledb.NUMBER },
    IN_Serviceid: { val: Number(serviceId), type: oracledb.NUMBER },


    IN_AppliName: appliName,
    IN_AppliAdd: appliAdd,
    IN_propconstrflag: propConstrFlag || null,
    IN_propusageflag: propUsageFlag || null,
    IN_permiscertino: permisCertNo || null,
    IN_parvanacertino: parvanaCertNo || null,
    IN_parvanadate: parvanaDate
      ? { val: new Date(parvanaDate), type: oracledb.DATE }
      : null,
    IN_proptypeflag: propTypeFlag || null,
    IN_sectorno: sectorNo || null,
    IN_remarksurvey: remarkSurvey || null,
    IN_prabhagkartype: prabhagKarType !== undefined
      ? { val: Number(prabhagKarType), type: oracledb.NUMBER }
      : null,
    IN_vikasappealno: vikasAppealNo || null,
    IN_propownname: propOwnName || null,
    IN_vikasname: vikasName || null,
    IN_taxesreceipt: taxesReceipt || null,
    in_source: appSource,
    in_ulbid: ulbid,

    out_errcode: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
    out_ErrMsg: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 1000 },
    out_applino: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 500 },
  };

  const result = await executeProcedureTMC({ sql, binds });

  if (!result.success) {
    throw new Error(result.error);
  }

  console.log("New Tax Assessment Insert Result:", result.outBinds);

  return result.outBinds;
}


async function fetchWardsByUlb(ulbid) {
  const sql = `
    SELECT wardname, wardid
    FROM prop.vw_zonemas
    WHERE ULBID = :ulbid
  `;

  const binds = {
    ulbid: Number(ulbid),
  };

  const result = await executeQueryTMC(sql, binds);

  if (!result.success) {
    throw new Error(result.error);
  }

  return result.rows || [];
}

module.exports = { insertNewTaxAssessment ,fetchWardsByUlb };
