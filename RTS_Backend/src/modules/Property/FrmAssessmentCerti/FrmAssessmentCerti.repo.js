const { getConnectionTMC } = require("../../../config/db");
const { executeProcedureTMC } = require("../../../db/procedureExecutor");
const { executeQueryTMC } = require("../../../db/queryExecutor");
const oracledb = require("oracledb");

async function getDocumentDefinitions(params) {
  const { serviceId, ulbId } = params;

  const query = `
    SELECT 
      num_doc_id AS DocId, 
      var_doc_engname AS DocName, 
      var_doc_engdocdesc AS engdocdesc, 
      var_doc_type AS DocType,
      NULL AS noc_new,
      NULL AS noc_renewal,
      var_doc_active AS active 
    FROM aorts_doc_def 
    INNER JOIN aorts_serv_doc_config 
      ON num_serdoc_servid = num_doc_serviceid 
      AND num_serdoc_docid = num_doc_id  
    INNER JOIN vw_services 
      ON num_service_serviceid = num_doc_serviceid 
    WHERE num_doc_serviceid = :serviceId 
      AND num_serdoc_ulbid = :ulbId
      AND var_service_active = 'Y'
  `;

  const bindParams = {
    serviceId: String(serviceId),
    ulbId: String(ulbId),
  };

  console.log("Document Definitions Query:", query);
  console.log("Bind Params:", bindParams);

  return await executeQueryTMC(query, bindParams);
}

async function getServicePaymentFlag(serviceId) {
  const query = `
     SELECT var_service_payflag 
    FROM aorts_service_def 
    WHERE num_service_serviceid = :serviceId
  `;

  const bindParams = {
    serviceId: String(serviceId),
  };

  console.log("Service Payment Flag Query:", query);
  console.log("Bind Params:", bindParams);

  return await executeQueryTMC(query, bindParams);
}

async function getMahaServiceId(params) {
  const { serviceId, mahaUlbId } = params;

  const query = `
    SELECT 
      var_mahaservcon_maxdayeng AS maxdays, 
      num_mahaservcon_mahaservid AS service_mahaid 
    FROM aorts_mahaservcon_mas 
    WHERE num_mahaservcon_serviceid = :serviceId 
      AND num_mahaservcon_mahaulbid = :mahaUlbId
  `;

  const bindParams = {
    serviceId: String(serviceId),
    mahaUlbId: String(mahaUlbId),
  };

  console.log("Maha Service ID Query:", query);
  console.log("Bind Params:", bindParams);

  return await executeQueryTMC(query, bindParams);
}

async function insertAssessmentApplication(params) {
  const {
    userId,
    zoneId,
    serviceId,
    propNo,
    subCode,
    landHolder,
    structHolder,
    ownDetails,
    address,
    flatNo,
    structure,
    usageType,
    constType,
    area,
    lettingRate,
    rate,
    yearTax,
    assessmentYear,
    applicantName,
    mobile,
    email,
    appSource,
  } = params;

  console.log("Insert Assessment Application:", {
    userId,
    zoneId,
    serviceId,
    propNo,
    applicantName,
    appSource,
  });

  const sql = `
    BEGIN
      aorts_propassess_ins(
        :in_userId,
        :in_zoneId,
        :in_serviceId,
        :in_propNo,
        :in_subCode,
        :in_landHolder,
        :in_structHolder,
        :in_ownDetails,
        :in_address,
        :in_flatNo,
        :in_structure,
        :in_usageType,
        :in_constType,
        :in_area,
        :in_lettingRate,
        :in_rate,
        :in_yearTax,
        :in_assessmentYear,
        :in_applicantName,
        :in_mobile,
        :in_email,
        :in_appSource,
        :out_errcode,
        :out_errMsg,
        :out_applino
      );
    END;
  `;

  const binds = {
    in_userId: userId,
    in_zoneId: zoneId,
    in_serviceId: serviceId,
    in_propNo: propNo,
    in_subCode: subCode || null,
    in_landHolder: landHolder || null,
    in_structHolder: structHolder || null,
    in_ownDetails: ownDetails || null,
    in_address: address || null,
    in_flatNo: flatNo || null,
    in_structure: structure || null,
    in_usageType: usageType || null,
    in_constType: constType || null,
    in_area: area || null,
    in_lettingRate: lettingRate || null,
    in_rate: rate || null,
    in_yearTax: yearTax || null,
    in_assessmentYear: assessmentYear || null,
    in_applicantName: applicantName || null,
    in_mobile: mobile || null,
    in_email: email || null,
    in_appSource: appSource || "",

    out_errcode: {
      dir: oracledb.BIND_OUT,
      type: oracledb.NUMBER,
    },
    out_errMsg: {
      dir: oracledb.BIND_OUT,
      type: oracledb.STRING,
      maxSize: 500,
    },
    out_applino: {
      dir: oracledb.BIND_OUT,
      type: oracledb.STRING,
      maxSize: 500,
    },
  };

  const result = await executeProcedureTMC({ sql, binds });

  if (!result.success) {
    throw new Error(result.error);
  }

  console.log("Assessment Application Insert Result:", result.outBinds);

  return result.outBinds;
}

async function insertDocument(params) {
  let connection;

  try {
    const { corpId, serviceId, appNo, docType, documentId, docBuffer } = params;

    connection = await getConnectionTMC();

    const buffer = docBuffer && docBuffer.length > 0 ? Buffer.from(docBuffer) : Buffer.alloc(1);

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

    const bindParams = {
      corpId: Number(corpId),
      serviceId: Number(serviceId),
      appNo: String(appNo),
      docType: String(docType),
      documentId: Number(documentId),
      docBuffer: {
        val: buffer,
        type: oracledb.BUFFER,
        dir: oracledb.BIND_IN,
        maxSize: buffer.length
      }
    };

    console.log("Insert Document Query:", query);
    console.log("DocId:", documentId, "DocType:", docType, "AppNo:", appNo, "Size:", buffer.length);

    const result = await connection.execute(query, bindParams, {
      autoCommit: true,
    });

    console.log("result: ", result);

    return {
      success: true,
      rowsAffected: result.rowsAffected,
    };
  } catch (error) {
    console.error("insertDocument Error:", error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
}

async function insertMahaOnlineData(params) {
  const {
    ulbId,
    requestString,
    responseString,
    trackId,
    applicationId,
    serviceId,
    methodName,
    encryptedFinalString,
    mahaUlbId,
    districtId,
  } = params;

  if (!requestString || requestString === "") {
    throw new Error("requestString is required and cannot be empty");
  }

  if (!responseString || responseString === "") {
    throw new Error("responseString is required and cannot be empty");
  }

  console.log("Insert Maha Online Data:", {
    ulbId,
    trackId,
    applicationId,
    serviceId,
    methodName,
    requestString: requestString.substring(0, 100) + "...",
    responseString: responseString.substring(0, 100) + "...",
    encryptedFinalString: encryptedFinalString ? encryptedFinalString.substring(0, 50) + "..." : "null",
    mahaUlbId,
    districtId,
  });

  const sql = `
    BEGIN
      aorts_MahaOndata_Ins(
        :in_ulbid,
        :in_requeststring,
        :in_responsestring,
        :in_trackid,
        :in_applicationid,
        :in_serviceid,
        :in_methodname,
        :in_encryptedFinalString,
        :in_mahaulbid,
        :in_districtid,
        :out_errorcode,
        :out_errormsg
      );
    END;
  `;

  const binds = {
    in_ulbid: Number(ulbId),
    in_requeststring: requestString,
    in_responsestring: responseString,
    in_trackid: Number(trackId) || 0,
    in_applicationid: String(applicationId),
    in_serviceid: Number(serviceId),
    in_methodname: methodName || "SetAppStatus",
    in_encryptedFinalString: encryptedFinalString || "N/A",
    in_mahaulbid: Number(mahaUlbId),
    in_districtid: Number(districtId) || 0,

    out_errorcode: {
      dir: oracledb.BIND_OUT,
      type: oracledb.NUMBER,
    },
    out_errormsg: {
      dir: oracledb.BIND_OUT,
      type: oracledb.STRING,
      maxSize: 500,
    },
  };

  const result = await executeProcedureTMC({ sql, binds });

  if (!result.success) {
    throw new Error(result.error);
  }

  console.log("Maha Online Insert Result:", result.outBinds);
  if (result.outBinds && result.outBinds.out_errorcode !== 9999) {
    throw new Error(result.outBinds.out_errormsg || "Maha Online insert failed");
  }

  return result.outBinds;
}

module.exports = {
  getDocumentDefinitions,
  getServicePaymentFlag,
  getMahaServiceId,
  insertAssessmentApplication,
  insertDocument,
  insertMahaOnlineData,
};