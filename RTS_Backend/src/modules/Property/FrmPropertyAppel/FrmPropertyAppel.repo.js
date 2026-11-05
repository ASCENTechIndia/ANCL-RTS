const oracledb = require("oracledb");
const { executeProcedureTMC } = require("../../../db/procedureExecutor");
const { executeQueryTMC } = require("../../../db/queryExecutor");

async function fetchWards(ulbId) {
  const ulb = Number(ulbId);

  let sql = `
    SELECT DISTINCT wardname, wardid
    FROM prop.vw_ward_mas
    WHERE ulbid = :ulbId
  `;

  const binds = { ulbId: ulb };

  if (ulb === 2) {
    sql += ` AND wardid <> 1281`;
  }

  sql += ` ORDER BY wardname`;

  const result = await executeQueryTMC(sql, binds);
  return result.rows || [];
}

async function fetchUsageTypes() {
  const sql = `
    SELECT var_usagetype_name, num_usagetype_id
    FROM prop.aoms_usagetype_mas
  `;
  const result = await executeQueryTMC(sql);
  return result.rows || [];
}

async function fetchObjections() {
  const sql = `
    SELECT var_objection_name, num_objection_id
    FROM aorts_Objection_mas
  `;
  const result = await executeQueryTMC(sql);
  return result.rows || [];
}

async function fetchUsageSubTypes(usageTypeId) {
  const sql = `
    SELECT var_usagesubtype_name, num_usagesubtype_id
    FROM prop.aoms_usagesubtype_mas
    WHERE num_usagesubtype_usagetypeid = :usageTypeId
  `;
  const binds = { usageTypeId: Number(usageTypeId) };
  const result = await executeQueryTMC(sql, binds);
  return result.rows || [];
}

async function fetchServiceUrl(ulbId) {
  const sql = `
    SELECT var_igrulburl_apiurl AS clienturl
    FROM prop.vw_igrapiurl
    WHERE num_igrprop_ulbid = :ulbId
      AND var_igrulburl_code = 'RTS'
  `;
  const binds = { ulbId: Number(ulbId) };
  const result = await executeQueryTMC(sql, binds);

  if (!result.rows || result.rows.length === 0) return "444";
  const url = result.rows[0].CLIENTURL || result.rows[0].clienturl;
  return url && url.trim() !== "" ? url : "444";
}

async function insertPropAppeal(params) {
  const {
    userId, ulbId, zoneId, serviceId, propNo, bilTaxNo,
    landHolder, structHolder, ownDetails, address,
    appliFName, appliMName, appliLName,
    mobile, email, aadhar, telephNo,
    objectType, objectDesc, taxDate,
    usageType, usageSubType, areaConstruct, annualTax, taxable,
    appSource,
    ownEngFName, ownEngMName, ownEngLName,
    ownMraFName, ownMraMName, ownMraLName,
  } = params;

  const sql = `
    BEGIN
      aorts_PropertyAppel_ins(
        :IN_USERID,
        :IN_propaplId,
        :in_ulbID,
        :IN_AppliFName,
        :IN_AppliMName,
        :IN_AppliLName,
        :IN_MobNO,
        :IN_EMAIL,
        :IN_AADHARNO,
        :IN_TELEPNO,
        :IN_Objection,
        :IN_BilTaxNo,
        :IN_Address,
        :IN_OwnEngFName,
        :IN_OwnEngMName,
        :IN_OwnEngLName,
        :IN_OwnMraFName,
        :IN_OwnMraMName,
        :IN_OwnMraLName,
        :IN_ObjDesc,
        :IN_DtTax,
        :IN_Usagesty,
        :IN_Usagesubty,
        :IN_areaconstruct,
        :IN_annualtax,
        :IN_taxable,
        :IN_PropNo,
        :IN_SERVICEID,
        :IN_Zoneid,
        :in_source,
        :out_errcode,
        :out_ErrMsg
      );
    END;
  `;

  const binds = {
    IN_USERID: String(userId),
    IN_propaplId: { val: null, type: oracledb.NUMBER },
    in_ulbID: { val: Number(ulbId), type: oracledb.NUMBER },
    IN_AppliFName: appliFName || null,
    IN_AppliMName: appliMName || "-",
    IN_AppliLName: appliLName || "-",
    IN_MobNO: mobile ? String(mobile) : null,
    IN_EMAIL: email || null,
    IN_AADHARNO: aadhar ? String(aadhar) : null,
    IN_TELEPNO: telephNo || null,
    IN_Objection:
      objectType !== undefined && objectType !== null && objectType !== ""
        ? { val: Number(objectType), type: oracledb.NUMBER }
        : null,
    IN_BilTaxNo: bilTaxNo || null,
    IN_Address: address || null,
    IN_OwnEngFName: ownDetails
      ? { val: ownDetails.slice(0, 500), type: oracledb.STRING, maxSize: 500 }
      : null,
    IN_OwnEngFName: ownEngFName ? { val: ownEngFName.slice(0, 500), type: oracledb.STRING, maxSize: 500 } : null,
    IN_OwnEngMName: ownEngMName ? { val: ownEngMName.slice(0, 500), type: oracledb.STRING, maxSize: 500 } : null,
    IN_OwnEngLName: ownEngLName ? { val: ownEngLName.slice(0, 500), type: oracledb.STRING, maxSize: 500 } : null,
    IN_OwnMraFName: ownMraFName ? { val: ownMraFName.slice(0, 500), type: oracledb.STRING, maxSize: 500 } : null,
    IN_OwnMraMName: ownMraMName ? { val: ownMraMName.slice(0, 500), type: oracledb.STRING, maxSize: 500 } : null,
    IN_OwnMraLName: ownMraLName ? { val: ownMraLName.slice(0, 500), type: oracledb.STRING, maxSize: 500 } : null,
    IN_ObjDesc: objectDesc || null,
    IN_DtTax: taxDate ? { val: new Date(taxDate), type: oracledb.DATE } : null,
    IN_Usagesty:
      usageType !== undefined && usageType !== null && usageType !== ""
        ? { val: Number(usageType), type: oracledb.NUMBER }
        : null,
    IN_Usagesubty:
      usageSubType !== undefined && usageSubType !== null && usageSubType !== ""
        ? { val: Number(usageSubType), type: oracledb.NUMBER }
        : null,
    IN_areaconstruct: areaConstruct != null ? String(areaConstruct) : null,
    IN_annualtax: annualTax != null ? String(annualTax) : null,
    IN_taxable: taxable != null ? String(taxable) : null,
    IN_PropNo: propNo || null,
    IN_SERVICEID: { val: Number(serviceId), type: oracledb.NUMBER },
    IN_Zoneid: { val: Number(zoneId), type: oracledb.NUMBER },
    in_source: appSource || null,
    out_errcode: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
    out_ErrMsg: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 4000 },
  };

  const result = await executeProcedureTMC({ sql, binds });
  console.log("Result: ", result)
  console.log("binds: ", binds)
  if (!result.success) throw new Error(result.error);
  return result.outBinds;
}

async function insertKarjatModule({
  userId,
  flag,
  applidata,
  applidtlsdata,
}) {
  const sql = `
    BEGIN
      prop.aoms_AppliEnrty_karjat_ins(
        :in_UserId,
        :in_appliflag,
        :in_applidata,
        :in_applidtlsdata,
        :out_ErrorCode,
        :out_ErrorMsg,
        :out_str
      );
    END;
  `;

  const binds = {
    in_UserId: String(userId),
    in_appliflag: flag,
    in_applidata: applidata,
    in_applidtlsdata: applidtlsdata,
    out_ErrorCode: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
    out_ErrorMsg: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 500 },
    out_str: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 500 },
  };

  const result = await executeProcedureTMC({ sql, binds });
  console.log("Karjat Result: ", result)
  console.log("Karjat binds: ", binds)
  if (!result.success) throw new Error(result.error);
  return result.outBinds;
}

async function insertRtsApplicantDetails({ userId, flag, applidata }) {
  const sql = `
    BEGIN
      prop.aoms_RTSAppliDetails_ins(
        :in_UserId,
        :in_appliflag,
        :in_applidata,
        :out_ErrorCode,
        :out_ErrorMsg,
        :out_str
      );
    END;
  `;

  const binds = {
    in_UserId: String(userId),
    in_appliflag: flag,
    in_applidata: applidata,
    out_ErrorCode: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
    out_ErrorMsg: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 500 },
    out_str: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 500 },
  };

  const result = await executeProcedureTMC({ sql, binds });
  if (!result.success) throw new Error(result.error);
  return result.outBinds;
}

module.exports = {
  fetchWards,
  fetchUsageTypes,
  fetchObjections,
  fetchUsageSubTypes,
  fetchServiceUrl,
  insertPropAppeal,
  insertKarjatModule,
  insertRtsApplicantDetails,
};