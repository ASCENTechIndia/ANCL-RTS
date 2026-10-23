const { executeQueryTMC } = require("../../db/queryExecutor");
const { withTxTMC } = require("../../db/tx");
const oracledb = require("oracledb");

const getRoadTypeListRepo = async () => {
  try {
     const query = `
  SELECT
    VAR_ROADTYPE_ENAME AS roadTypeName,
    NUM_ROADTYPE_ID AS roadTypeId
  FROM AORTS_ROADTYPE_MAS
  
`;

    const result = await executeQueryTMC(query, {});

    return {
      success: true,
      rows: result.rows || [],
    };
  } catch (error) {
    console.error("GET ROAD TYPE LIST REPO ERROR:", error);

    return {
      success: false,
      error: error.message,
    };
  }
};

const getWardListRepo = async (ulbId) => {
  try {
    console.log("Repo: Get Road Cutting Ward List", { ulbId });

    const ulbNumber = Number(ulbId);

    const binds = {
      ulbId: ulbNumber,
    };

    const conditions = ["ULBID = :ulbId"];

    let orderBy = "WARDNAME ASC";

    if ([1070, 1850].includes(ulbNumber)) {
      conditions.push("WARDID NOT IN (2041, 2042, 2043)");
      orderBy = "WARDID ASC";
    } else if (ulbNumber === 2) {
      conditions.push("WARDID <> 1281");
      orderBy = "WARDNAME ASC";
    }

    const query = `
  SELECT DISTINCT
    WARDNAME AS wardName,
    WARDID AS wardId
  FROM PROP.VW_WARD_MAS
  WHERE ${conditions.join(" AND ")}
  ORDER BY ${orderBy}
`;

    const result = await executeQueryTMC(query, binds);

    return {
      success: true,
      rows: result.rows || [],
    };
  } catch (error) {
    console.error("GET ROAD CUTTING WARD LIST REPO ERROR:", error);

    return {
      success: false,
      error: error.message,
    };
  }
};

const getRoadCuttingTypeListRepo = async () => {
  try {
    console.log("Repo: Get Road Cutting Type List");

    const query = `
  SELECT
    NUM_ROADCUTTINGTYPE_ID AS roadCuttingTypeId,
    VAR_ROADCUTTINGTYPE_NAME AS roadCuttingTypeName
  FROM AORTS_ROADCUTTINGTYPE
  ORDER BY VAR_ROADCUTTINGTYPE_NAME ASC
`;

    const result = await executeQueryTMC(query, {});

    return {
      success: true,
      rows: result.rows || [],
    };
  } catch (error) {
    console.error("GET ROAD CUTTING TYPE LIST REPO ERROR:", error);

    return {
      success: false,
      error: error.message,
    };
  }
};

const getPrabhagSamitiListRepo = async () => {
  try {
    console.log("Repo: Get Prabhag Samiti List");

    const query = `
  SELECT
    NUM_PRABHAG_ID AS prabhagId,
    VAR_PRABHAG_NAME AS prabhagName
  FROM AORTS_PRABHAGSAMITI
  ORDER BY VAR_PRABHAG_NAME ASC
`;

    const result = await executeQueryTMC(query, {});

    return {
      success: true,
      rows: result.rows || [],
    };
  } catch (error) {
    console.error("GET PRABHAG SAMITI LIST REPO ERROR:", error);

    return {
      success: false,
      error: error.message,
    };
  }
};

const insertRoadCuttingRepo = async (data) => {
try {

const sql = `
  BEGIN
    AORTS.AORTS_ROADCUTTING_INS(
      :IN_USERID,
      :IN_SERVID,
      :IN_ROADC_ID,
      :IN_ULBID,
      :IN_APPLIFNAME,
      :IN_APPLIMNAME,
      :IN_APPLILNAME,
      :IN_MOBNO,
      :IN_EMAIL,
      :IN_AADHARNO,
      :IN_PROPNO,
      :IN_RESNO,
      :IN_ROADTYPE,
      :IN_ROADLEN,
      :IN_ROADWIDTH,
      :IN_ROADLENWID,
      :IN_ROAD_EXACSIZE,
      :IN_ROAD_EXACSTART,
      :IN_ROAD_EXACEND,
      :IN_LATITUDE,
      :IN_LONGITUDE,
      :IN_ZONE,
      :IN_SOURCE,
      :IN_PRABHAG,
      :IN_ROADCUTTYPE,
      :IN_ROADCUTREASON,
      :IN_ROAD_VCEXACSTART,
      :IN_ROAD_VCEXACEND,
      :OUT_ERRCODE,
      :OUT_ERRMSG,
      :OUT_APPLINO
    );
  END;
`;

const binds = {
  IN_USERID: String(data.userId),
  IN_SERVID: Number(data.serviceId),
  IN_ROADC_ID: Number(data.roadCuttingId || 0),
  IN_ULBID: Number(data.ulbId),

  IN_APPLIFNAME: String(data.appliFName || "").trim(),
  IN_APPLIMNAME: String(data.appliMName || "").trim(),
  IN_APPLILNAME: String(data.appliLName || "").trim(),

  IN_MOBNO: String(data.mobile || ""),
  IN_EMAIL: String(data.email || "").trim(),
  IN_AADHARNO: String(data.aadharNo || ""),

  IN_PROPNO: String(data.propNo || "").trim(),
  IN_RESNO: String(data.resNo || "").trim(),

  IN_ROADTYPE: Number(data.roadType),
  IN_ROADLEN: Number(data.roadLength),
  IN_ROADWIDTH: Number(data.roadWidth),
  IN_ROADLENWID: Number(data.roadLengthWidth),

  IN_ROAD_EXACSIZE: Number(data.excavationSize),
  IN_ROAD_EXACSTART: Number(data.excavationStart || 0),
  IN_ROAD_EXACEND: Number(data.excavationEnd || 0),

  IN_LATITUDE: Number(data.latitude),
  IN_LONGITUDE: Number(data.longitude),

  IN_ZONE: Number(data.zoneId || 0),
  IN_SOURCE: String(data.source || "WEB"),

  IN_PRABHAG:
    data.prabhagId !== undefined &&
    data.prabhagId !== null &&
    data.prabhagId !== ""
      ? { val: Number(data.prabhagId), type: oracledb.NUMBER }
      : null,

  IN_ROADCUTTYPE:
    data.roadCutTypeId !== undefined &&
    data.roadCutTypeId !== null &&
    data.roadCutTypeId !== ""
      ? { val: Number(data.roadCutTypeId), type: oracledb.NUMBER }
      : null,

  IN_ROADCUTREASON:
    data.roadCutReason && String(data.roadCutReason).trim() !== ""
      ? {
          val: String(data.roadCutReason).trim().slice(0, 500),
          type: oracledb.STRING,
          maxSize: 500,
        }
      : null,

  IN_ROAD_VCEXACSTART:
    data.vcStartPoint !== undefined &&
    data.vcStartPoint !== null &&
    data.vcStartPoint !== ""
      ? { val: String(data.vcStartPoint).slice(0, 100), type: oracledb.STRING, maxSize: 100 }
      : null,

  IN_ROAD_VCEXACEND:
    data.vcEndPoint !== undefined &&
    data.vcEndPoint !== null &&
    data.vcEndPoint !== ""
      ? { val: String(data.vcEndPoint).slice(0, 100), type: oracledb.STRING, maxSize: 100 }
      : null,

  OUT_ERRCODE: {
    dir: oracledb.BIND_OUT,
    type: oracledb.NUMBER,
  },

  OUT_ERRMSG: {
    dir: oracledb.BIND_OUT,
    type: oracledb.STRING,
    maxSize: 2000,
  },

  OUT_APPLINO: {
    dir: oracledb.BIND_OUT,
    type: oracledb.STRING,
    maxSize: 500,
  },
};

console.log("Road Cutting Procedure Input:", {
  ...binds,
  OUT_ERRCODE: "OUT",
  OUT_ERRMSG: "OUT",
  OUT_APPLINO: "OUT",
});

const result = await withTxTMC(async (connection) => {
  const executionResult = await connection.execute(
    sql,
    binds,
    {
      autoCommit: false,
    },
  );

  return executionResult;
});

console.log(
  "Road Cutting Procedure Output:",
  result.outBinds,
);

const outBinds = result.outBinds || {};

const errCode = Number(outBinds.OUT_ERRCODE || 0);
const errMsg = outBinds.OUT_ERRMSG || "";
const applicationNo = outBinds.OUT_APPLINO || "";

return {
  success: errCode === 9999,
  errCode,
  errMsg,
  applicationNo,
};


} catch (error) {

console.error("INSERT ROAD CUTTING REPO ERROR:");
console.error(error);

return {
  success: false,
  errCode: 1500,
  errMsg:
    error.message || "Failed to save Road Cutting application.",
  applicationNo: "",
};


}
};



module.exports = {
  getRoadTypeListRepo,
  getWardListRepo,
  getRoadCuttingTypeListRepo,
  getPrabhagSamitiListRepo,
  insertRoadCuttingRepo,
};
