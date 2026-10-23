const oracledb = require("oracledb");
const { executeProcedureTMC } = require("../../../db/procedureExecutor");
const { executeQueryTMC } = require("../../../db/queryExecutor");

async function insertPropAppeal(params) {
  const {
    userId,
    ulbId,
    zoneId,
    serviceId,
    propNo,
    bilTaxNo,
    landHolder,
    structHolder,
    ownDetails,
    address,
    appliFName,
    appliMName,
    appliLName,
    mobile,
    email,
    aadhar,
    telephNo,
    objectType,
    objectDesc,
    taxDate,
    usageType,
    usageSubType,
    areaConstruct,
    annualTax,
    taxable,
    appSource,
  } = params;

  console.log("Insert Property Appeal:", {
    userId,
    ulbId,
    zoneId,
    serviceId,
    propNo,
    appliFName,
    appliMName,
    appliLName,
    appSource,
  });

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
    IN_OwnEngMName: ownDetails
      ? { val: ownDetails.slice(0, 500), type: oracledb.STRING, maxSize: 500 }
      : null,
    IN_OwnEngLName: ownDetails
      ? { val: ownDetails.slice(0, 500), type: oracledb.STRING, maxSize: 500 }
      : null,
    IN_OwnMraFName: ownDetails
      ? { val: ownDetails.slice(0, 500), type: oracledb.STRING, maxSize: 500 }
      : null,
    IN_OwnMraMName: ownDetails
      ? { val: ownDetails.slice(0, 500), type: oracledb.STRING, maxSize: 500 }
      : null,
    IN_OwnMraLName: ownDetails
      ? { val: ownDetails.slice(0, 500), type: oracledb.STRING, maxSize: 500 }
      : null,

    IN_ObjDesc: objectDesc || null,
    IN_DtTax: taxDate
      ? { val: new Date(taxDate), type: oracledb.DATE }
      : null,
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

  const result = await executeProcedureTMC({
    sql,
    binds,
  });

  if (!result.success) {
    throw new Error(result.error);
  }

  console.log(
    "Property Appeal Insert Result:",
    result
  );

  return result.outBinds;
}

async function fetchObjections() {
  const sql = `
    SELECT var_objection_name, num_objection_id
    FROM aorts_Objection_mas
  `;


  const result = await executeQueryTMC(sql);
  return result.rows || [];
}

module.exports = {
  insertPropAppeal, fetchObjections
};