const { getConnectionTMC } = require("../../../config/db");
const { executeProcedureTMC } = require("../../../db/procedureExecutor");
const { executeQueryTMC } = require("../../../db/queryExecutor");
const oracledb = require("oracledb");

async function getZones(ulbId) {
  let query = `
    SELECT DISTINCT wardname, wardid 
    FROM prop.vw_ward_mas 
    WHERE ulbid = :ulbId
  `;

  if (ulbId === "2") {
    query += ` AND wardid <> 1281`;
  }

  query += ` ORDER BY wardname`;

  return await executeQueryTMC(query, { ulbId: String(ulbId) });
}

async function getConnectionTypes() {
  const query = `
    SELECT var_conntype_name, num_conntype_id 
    FROM water.aowt_conntype_mas
  `;
  return await executeQueryTMC(query);
}

async function getConnectionSizes() {
  const query = `
    SELECT var_connsize_name, num_connsize_id 
    FROM water.aowt_connsize_mas
  `;
  return await executeQueryTMC(query);
}

async function getUsageTypes() {
  const query = `
    SELECT var_usagetype_name, num_usagetype_id 
    FROM water.aowt_usagetype_mas
  `;
  return await executeQueryTMC(query);
}

async function getUsageSubTypes(usageTypeId) {
  const query = `
    SELECT var_usagesubtype_name, num_usagesubtype_id 
    FROM water.aowt_usagesubtype_mas 
    WHERE num_usagesubtype_usgtypid = :usageTypeId
  `;
  return await executeQueryTMC(query, { usageTypeId: String(usageTypeId) });
}

async function getConnectionStatuses() {
  const query = `
    SELECT var_connstatus_name, num_connstatus_id 
    FROM water.aowt_connstatus_mas
  `;
  return await executeQueryTMC(query);
}

async function getBusinessCertificates() {
  const query = `
    SELECT var_businesscerti_name, num_businesscerti_id 
    FROM water.aowt_businesscerti_mas
  `;
  return await executeQueryTMC(query);
}

async function getDocumentDefinitions(params) {
  const { corpId, serviceId, ulbId } = params;

  const query = `
    SELECT 
      num_doc_id AS num_document_id,
      var_doc_engname AS var_document_name,
      var_doc_engdocdesc AS engdocdesc,
      var_doc_type AS type,
      NULL AS noc_new,
      NULL AS noc_renewal,
      var_doc_active AS active
    FROM aorts_doc_def
    INNER JOIN aorts_serv_doc_config 
      ON num_serdoc_servid = num_doc_serviceid 
      AND num_serdoc_docid = num_doc_id
    INNER JOIN vw_services 
      ON num_service_serviceid = num_doc_serviceid
    WHERE num_doc_corpid = :corpId
      AND num_doc_serviceid = :serviceId
      AND num_serdoc_ulbid = :ulbId
  `;

  return await executeQueryTMC(query, {
    corpId: String(corpId),
    serviceId: String(serviceId),
    ulbId: String(ulbId),
  });
}

async function getServicePaymentFlag(serviceId) {
  const query = `
    SELECT var_service_payflag 
    FROM aorts_service_def 
    WHERE num_service_serviceid = :serviceId
  `;
  return await executeQueryTMC(query, { serviceId: String(serviceId) });
}

async function getApplicationDetails(appNo) {
  const query = `
    SELECT 
      m.num_appliEntry_id,
      m.num_appliEntry_ulbid,
      m.var_appliEntry_Fname,
      m.var_appliEntry_Mname,
      m.var_appliEntry_Lname,
      m.num_appliEntry_MobNo,
      m.var_appliEntry_Email,
      m.num_appliEntry_Adharno,
      m.var_appliEntry_propno,
      m.var_appliEntry_resno,
      m.var_appliEntry_conFname,
      m.var_appliEntry_conMname,
      m.var_appliEntry_conLname,
      m.num_appliEntry_conMobNo,
      m.var_appliEntry_conEmail,
      m.num_appliEntry_ConAdharno,
      m.var_appliEntry_Conpropno,
      m.var_appliEntry_Conresno,
      m.var_appliEntry_cooFlag,
      m.var_appliEntry_cooFname1,
      m.var_appliEntry_cooMname1,
      m.var_appliEntry_cooLname1,
      m.var_appliEntry_cooFname2,
      m.var_appliEntry_cooMname2,
      m.var_appliEntry_cooLname2,
      m.num_appliEntry_contypeid,
      m.num_appliEntry_consizeid,
      m.num_appliEntry_usagetypeid,
      m.num_appliEntry_usagesubtypid,
      m.num_appliEntry_noofperson,
      m.num_appliEntry_nooffamily,
      m.num_appliEntry_noofConn,
      m.num_appliEntry_constatusid,
      m.num_appliEntry_busicertid,
      m.var_appliEntry_billtype,
      m.var_appliEntry_govpropflag,
      
      i.num_application_zoneid AS zoneId,
      i.var_appl_address AS address,
      i.VAR_APPL_MFIRSTNAME AS afNameMr,
      i.VAR_APPL_MMIDDLENAME AS amNameMr,
      i.VAR_APPL_MLASTNAME AS alNameMr,
      i.VAR_APPL_MADDRESS AS addressMr,
      i.VAR_APPL_PURPOSE AS remark,
      i.VAR_APPL_MPURPOSE AS reason
      
    FROM aorts_wtapplientry_mas m
    INNER JOIN AORTS_APPLICANT_INFODET i
      ON m.num_applientry_ulbid = i.num_appl_ulbid 
      AND m.var_applientry_rtsno = i.var_appl_appno
    WHERE m.var_applientry_rtsno = :appNo
  `;
  
  return await executeQueryTMC(query, { appNo: String(appNo) });
}

async function getApplicationDocuments(appliId) {
  const query = `
    SELECT 
      num_wtapplientdoc_id,
      num_wtapplientdoc_appliid AS appliid,
      num_wtapplientdoc_docid AS DocId,
      num_wtapplientdoc_doctype AS FileExtension,
      blo_wtapplientdoc_image AS FileByts
    FROM aorts_wtapplientrydoc_det
    WHERE num_wtapplientdoc_appliid = :appliId
  `;
  return await executeQueryTMC(query, { appliId: String(appliId) });
}

async function insertDocument(params) {
  const { corpId, serviceId, appNo, docType, documentId, docBuffer } = params;

  const query = `
    INSERT INTO aorts_appdoc_det (
      num_appdoc_corpid,
      num_appdoc_serviceid,
      var_appdoc_appno,
      var_appdoc_doctype,
      num_appdoc_documentid,
      blob_appdoc_documentimg
    ) VALUES (
      :corpId,
      :serviceId,
      :appNo,
      :docType,
      :documentId,
      :docBuffer
    )
  `;

  const connection = await getConnectionTMC();
  try {
    const result = await connection.execute(
      query,
      {
        corpId: Number(corpId),
        serviceId: Number(serviceId),
        appNo: String(appNo),
        docType: String(docType),
        documentId: Number(documentId),
        docBuffer: {
          val: Buffer.from(docBuffer),
          type: oracledb.BUFFER,
          dir: oracledb.BIND_IN,
        },
      },
      { autoCommit: true }
    );
    return { success: true, rowsAffected: result.rowsAffected };
  } catch (error) {
    console.error("insertDocument Error:", error);
    return { success: false, error: error.message };
  } finally {
    await connection.close();
  }
}

async function insertWaterApplication(params) {
  const {
    userId,
    ulbId,
    zoneId,
    serviceId,
    appSource,
    afName,
    amName,
    alName,
    mobileNo,
    email,
    aadharNo,
    propNo,
    resNo,
    address,
    afNameMr,
    amNameMr,
    alNameMr,
    addressMr,
    conFName,
    conMName,
    conLName,
    conMobNo,
    conEmail,
    conAadharNo,
    conPropNo,
    conResNo,
    conFNameMr,
    conMNameMr,
    conLNameMr,
    cooFlag,
    cooFName1,
    cooMName1,
    cooLName1,
    cooFName2,
    cooMName2,
    cooLName2,
    cooAddress,
    cooAddressMr,
    connType,
    connSize,
    usageType,
    usageSubType,
    noOfPerson,
    noOfFamily,
    noOfConn,
    connStatus,
    busiCert,
    billingType,
    govPropFlag,
    remark,
    reason,
    docString,
  } = params;

  // ====== FIX: Safe number conversion helper ======
  const toNumber = (value) => {
    if (value === null || value === undefined || value === '') {
      return null;
    }
    const num = Number(value);
    return isNaN(num) ? null : num;
  };

  // ====== FIX: Convert userId to number safely ======
  const numericUserId = toNumber(userId) || 0;

  console.log("Original userId:", userId);
  console.log("Converted numericUserId:", numericUserId);

  const sql = `
    BEGIN
      aorts_WTAppliEntry_ins(
        :IN_USERID,
        :IN_AppID,
        :in_ulbID,
        :IN_AppliFName,
        :IN_AppliMName,
        :IN_AppliLName,
        :IN_MobNO,
        :IN_EMAIL,
        :IN_AADHARNO,
        :IN_PROPNO,
        :IN_RESNO,
        :IN_CONFName,
        :IN_CONMName,
        :IN_CONLName,
        :IN_CONMobNO,
        :IN_CONEMAIL,
        :IN_CONAADHARNO,
        :IN_CONPROPNO,
        :IN_CONRESNO,
        :IN_COOFLAG,
        :IN_COOFName1,
        :IN_COOMName1,
        :IN_COOLName1,
        :IN_COOFName2,
        :IN_COOMName2,
        :IN_COOLName2,
        :IN_CONTYPEID,
        :IN_CONSIZEID,
        :IN_USAGETYPEID,
        :IN_USAGESUBTYID,
        :IN_NOOFPERSON,
        :IN_NOOFFAMILY,
        :IN_NOOFCON,
        :IN_CONSTATUSID,
        :IN_BUSICERTID,
        :IN_BILLINGTYPE,
        :IN_GOVPROPFLAG,
        :in_Docstring,
        :IN_ZoneId,
        :in_source,
        :in_ServId,
        :in_ownername,
        :in_usagetype,
        :in_detAppliName,
        :in_detMobile,
        :in_detAadhaar,
        :in_detEmail,
        :in_detAddress,
        :out_errcode,
        :out_ErrMsg,
        :Out_DocStr,
        :out_AppliNo
      );
    END;
  `;

  const fullName = `${afName || ''} ${amName || ''} ${alName || ''}`.trim();

  const binds = {
    // ====== FIXED: Use numericUserId instead of Number(userId) ======
    IN_USERID: numericUserId,  // <-- FIXED
    IN_AppID: 0,
    in_ulbID: toNumber(ulbId),
    IN_AppliFName: afName || null,
    IN_AppliMName: amName || null,
    IN_AppliLName: alName || null,
    IN_MobNO: mobileNo || null,
    IN_EMAIL: email || null,
    IN_AADHARNO: aadharNo || null,
    IN_PROPNO: propNo || null,
    IN_RESNO: resNo || null,
    IN_CONFName: conFName || null,
    IN_CONMName: conMName || null,
    IN_CONLName: conLName || null,
    IN_CONMobNO: conMobNo || null,
    IN_CONEMAIL: conEmail || null,
    IN_CONAADHARNO: conAadharNo || null,
    IN_CONPROPNO: conPropNo || null,
    IN_CONRESNO: conResNo || null,
    IN_COOFLAG: cooFlag || null,
    IN_COOFName1: cooFName1 || null,
    IN_COOMName1: cooMName1 || null,
    IN_COOLName1: cooLName1 || null,
    IN_COOFName2: cooFName2 || null,
    IN_COOMName2: cooMName2 || null,
    IN_COOLName2: cooLName2 || null,
    IN_CONTYPEID: toNumber(connType),
    IN_CONSIZEID: toNumber(connSize),
    IN_USAGETYPEID: toNumber(usageType),
    IN_USAGESUBTYID: toNumber(usageSubType),
    IN_NOOFPERSON: toNumber(noOfPerson),
    IN_NOOFFAMILY: toNumber(noOfFamily),
    IN_NOOFCON: toNumber(noOfConn),
    IN_CONSTATUSID: toNumber(connStatus),
    IN_BUSICERTID: toNumber(busiCert),
    IN_BILLINGTYPE: billingType || null,
    IN_GOVPROPFLAG: govPropFlag || null,
    in_Docstring: docString || null,
    IN_ZoneId: toNumber(zoneId),
    in_source: appSource || "WEB",
    in_ServId: toNumber(serviceId),
    in_ownername: fullName || null,
    in_usagetype: null,
    in_detAppliName: fullName || null,
    in_detMobile: mobileNo || null,
    in_detAadhaar: aadharNo || null,
    in_detEmail: email || null,
    in_detAddress: address || null,

    // ====== OUTPUT PARAMETERS ======
    out_errcode: {
      dir: oracledb.BIND_OUT,
      type: oracledb.NUMBER,
    },
    out_ErrMsg: {
      dir: oracledb.BIND_OUT,
      type: oracledb.STRING,
      maxSize: 500,
    },
    Out_DocStr: {
      dir: oracledb.BIND_OUT,
      type: oracledb.STRING,
      maxSize: 500,
    },
    out_AppliNo: {
      dir: oracledb.BIND_OUT,
      type: oracledb.STRING,
      maxSize: 500,
    },
  };

  console.log("=== DEBUG: Procedure Call ===");
  console.log("IN_USERID (Number):", numericUserId);
  console.log("in_ulbID:", toNumber(ulbId));
  console.log("in_ServId:", toNumber(serviceId));
  console.log("Full Name:", fullName);
  console.log("=============================");

  const result = await executeProcedureTMC({ sql, binds });
  console.log("Result: ", result);
  return result;
}

module.exports = {
  getZones,
  getConnectionTypes,
  getConnectionSizes,
  getUsageTypes,
  getUsageSubTypes,
  getConnectionStatuses,
  getBusinessCertificates,
  getDocumentDefinitions,
  getServicePaymentFlag,
  getApplicationDetails,
  getApplicationDocuments,
  insertDocument,
  insertWaterApplication,
};