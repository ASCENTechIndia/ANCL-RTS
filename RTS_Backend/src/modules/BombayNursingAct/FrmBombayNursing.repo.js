const { executeQueryTMC } = require("../../db/queryExecutor");
const { executeProcedureTMC } = require("../../db/procedureExecutor");

const oracledb = require("oracledb");

const getServiceListRepo = async ({ ulbID }) => {
  // console.log("Repo: Fetch Bombay Nursing Service List", { ulbID });

  const sql = `
        SELECT
            CASE
                WHEN var_serv_dispname IS NULL
                THEN var_service_eng_name
                ELSE var_serv_dispname
            END AS displayname,
            num_service_serviceid
        FROM aorts_service_def
        INNER JOIN aorts_service_config
            ON num_serv_servid = num_service_serviceid
           AND num_serv_deptid = num_service_deptid
        WHERE num_serv_ulbid = :ulbID
        ORDER BY num_service_serviceid
    `;
  // console.log("query :", sql);
  const result = await executeQueryTMC(sql, {
    ulbID: Number(ulbID),
  });
  // console.log("result :", result);

  if (!result || !result.success) {
    throw new Error(result?.error || "Failed to fetch Bombay Nursing service list");
  }

  console.log("Repo: Bombay Nursing Service List", result.rows);

  return result.rows;
};

async function getWardListRepo({ ulbID }) {
  console.log("Repo: Fetch Ward List", { ulbID });

  let sql = `
        SELECT DISTINCT
            wardname,
            wardid
        FROM prop.vw_ward_mas
        WHERE ulbid = :ulbID
    `;

  if (String(ulbID) === "2") {
    sql += ` AND wardid <> 1281`;
  }

  sql += ` ORDER BY wardname`;

  console.log("Ward List Query:", sql);

  const result = await executeQueryTMC(sql, {
    ulbID: Number(ulbID),
  });

  console.log("Ward List Result:", result);

  if (!result || !result.success) {
    throw new Error(result?.error || "Failed to fetch Ward List");
  }

  return result.rows;
}

async function insertNursingRepo(data) {
  console.log("Repo: Insert Bombay Nursing Application", data);

  const sql = `
        BEGIN
            aorts_nursing_ins(
                :IN_USERID,
                :IN_ServId,
                :in_ulbID,
                :IN_AppliFName,
                :IN_AppliMName,
                :IN_AppliLName,
                :IN_MobNO,
                :IN_EMAIL,
                :IN_AADHARNO,
                :IN_PROPNO,
                :IN_RESNO,
                :IN_Instname,
                :IN_Instaddr,
                :IN_hospital,
                :IN_hmobile,
                :IN_hemail,
                :IN_ptxno,
                :IN_wttaxno,
                :IN_firenoc,
                :IN_nocdoc,
                :IN_haddress,
                :IN_Zone,
                :IN_source,
                :out_errcode,
                :out_ErrMsg,
                :out_AppliNo
            );
        END;
    `;

  const binds = {
    IN_USERID: String(data.userId || ""),
    IN_ServId: Number(data.servId),
    in_ulbID: Number(data.ulbID),

    IN_AppliFName: String(data.appliFName),
    IN_AppliMName: String(data.appliMName),
    IN_AppliLName: String(data.appliLName),
    IN_MobNO: String(data.appliMobNo),
    IN_EMAIL: String(data.appliEmailId),
    IN_AADHARNO: String(data.appliAadNo),

    IN_PROPNO: {
      val: data.appliPropNo ? String(data.appliPropNo) : null,
      type: oracledb.STRING,
      dir: oracledb.BIND_IN,
    },

    IN_RESNO: String(data.appliResNo),
    IN_Instname: String(data.instName || ""),
    IN_Instaddr: String(data.instAddr || ""),

    // Hospital details
    IN_hospital: String(data.hospName),
    IN_hmobile: {
      val: Number(data.hospMob),
      type: oracledb.NUMBER,
      dir: oracledb.BIND_IN,
    },
    IN_hemail: String(data.hosEmail),

    // Tax and NOC details
    IN_ptxno: String(data.ptaxno),
    IN_wttaxno: String(data.wtTaxno),
    IN_firenoc: String(data.firenoc),
    IN_nocdoc: String(data.nocDoc),
    IN_haddress: String(data.address),

    IN_Zone: Number(data.zoneId),
    IN_source: String(data.appSource),

    out_errcode: {
      dir: oracledb.BIND_OUT,
      type: oracledb.NUMBER,
    },

    out_ErrMsg: {
      dir: oracledb.BIND_OUT,
      type: oracledb.STRING,
      maxSize: 5000000,
    },

    out_AppliNo: {
      dir: oracledb.BIND_OUT,
      type: oracledb.STRING,
      maxSize: 5000000,
    },
  };

  const result = await executeProcedureTMC({
    sql,
    binds,
  });

  if (!result.success) {
    throw new Error(result.error);
  }

  console.log("Bombay Nursing Procedure Result:", result.outBinds);

  return result;
}

module.exports = {
  getServiceListRepo,
  getWardListRepo,
  insertNursingRepo,
};
