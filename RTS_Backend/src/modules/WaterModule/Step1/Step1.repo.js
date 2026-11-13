const { getConnectionTMC } = require("../../../config/db");
const { executeProcedureTMC } = require("../../../db/procedureExecutor");
const { executeQueryTMC } = require("../../../db/queryExecutor");
const oracledb = require("oracledb");

// ---------------------------------------------------------------------------
// Helper: build BLOB bind
// ---------------------------------------------------------------------------
function blobBind(docBuffer) {
  const buffer =
    docBuffer && docBuffer.length > 0 ? Buffer.from(docBuffer) : Buffer.alloc(1);
  return {
    val: buffer,
    type: oracledb.BUFFER,
    dir: oracledb.BIND_IN,
    maxSize: buffer.length,
  };
}

// ---------------------------------------------------------------------------
// 1. Main document insert — aorts_appdoc_det (always runs)
// ---------------------------------------------------------------------------
async function insertMainDocument(params) {
  let connection;
  try {
    const { corpId, serviceId, appNo, docType, documentId, docBuffer } = params;
    connection = await getConnectionTMC();

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

    const binds = {
      corpId: Number(corpId),
      serviceId: Number(serviceId),
      appNo: String(appNo),
      docType: String(docType),
      documentId: Number(documentId),
      docBuffer: blobBind(docBuffer),
    };

    console.log("[insertMainDocument] appNo:", appNo, "size:", binds.docBuffer.maxSize);
    const result = await connection.execute(query, binds, { autoCommit: true });
    return { success: true, rowsAffected: result.rowsAffected };
  } catch (error) {
    console.error("[insertMainDocument] Error:", error);
    return { success: false, error: error.message };
  } finally {
    if (connection) {
      try { await connection.close(); } catch (e) { console.error(e); }
    }
  }
}

// ---------------------------------------------------------------------------
// 2. prop.aoms_rtsdoc_det insert (Karjat + prop services)
// ---------------------------------------------------------------------------
async function insertPropDoc(params) {
  let connection;
  try {
    const { corpId, serviceId, appNo, docType, documentId, docBuffer } = params;
    connection = await getConnectionTMC();

    const query = `
      INSERT INTO prop.aoms_rtsdoc_det (
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

    const binds = {
      corpId: Number(corpId),
      serviceId: Number(serviceId),
      appNo: String(appNo),
      docType: String(docType),
      documentId: Number(documentId),
      docBuffer: blobBind(docBuffer),
    };

    console.log("[insertPropDoc] appNo:", appNo, "size:", binds.docBuffer.maxSize);
    const result = await connection.execute(query, binds, { autoCommit: true });
    return { success: true, rowsAffected: result.rowsAffected };
  } catch (error) {
    console.error("[insertPropDoc] Error:", error);
    return { success: false, error: error.message };
  } finally {
    if (connection) {
      try { await connection.close(); } catch (e) { console.error(e); }
    }
  }
}

// ---------------------------------------------------------------------------
// 3. water.aowt_rtsdoc_det insert (Karjat + water services)
// ---------------------------------------------------------------------------
async function insertWaterDoc(params) {
  let connection;
  try {
    const { corpId, serviceId, appNo, docType, documentId, docBuffer } = params;
    connection = await getConnectionTMC();

    const query = `
      INSERT INTO water.aowt_rtsdoc_det (
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

    const binds = {
      corpId: Number(corpId),
      serviceId: Number(serviceId),
      appNo: String(appNo),
      docType: String(docType),
      documentId: Number(documentId),
      docBuffer: blobBind(docBuffer),
    };

    console.log("[insertWaterDoc] appNo:", appNo, "size:", binds.docBuffer.maxSize);
    const result = await connection.execute(query, binds, { autoCommit: true });
    return { success: true, rowsAffected: result.rowsAffected };
  } catch (error) {
    console.error("[insertWaterDoc] Error:", error);
    return { success: false, error: error.message };
  } finally {
    if (connection) {
      try { await connection.close(); } catch (e) { console.error(e); }
    }
  }
}

// ---------------------------------------------------------------------------
// 4. fire.aofr_appentry_mas lookup — get num_appentry_id by AppNo
// ---------------------------------------------------------------------------
async function getFireApplicationId(params) {
  const { appNo } = params;

  const query = `
    SELECT num_appentry_id
    FROM fire.aofr_appentry_mas
    WHERE var_appentry_appno = :appNo
  `;

  console.log("[getFireApplicationId] appNo:", appNo);
  return await executeQueryTMC(query, { appNo: String(appNo) });
}

// ---------------------------------------------------------------------------
// 5. fire.aofr_appdoc_det insert (fire NOC final)
// ---------------------------------------------------------------------------
async function insertFireDoc(params) {
  let connection;
  try {
    const { appId, docType, documentId, userId, ulbId, docBuffer } = params;
    connection = await getConnectionTMC();

    const query = `
      INSERT INTO fire.aofr_appdoc_det (
        num_appdoc_id,
        var_appdoc_appid,
        var_appdoc_doctype,
        num_appdoc_documentid,
        blob_appdoc_documentimg,
        var_appdoc_userid,
        dat_appdoc_insdate,
        var_appdoc_remark,
        var_appdoc_remark2,
        num_appdoc_ulbid
      ) VALUES (
        fire.seq_doc.nextval,
        :appId,
        :docType,
        :documentId,
        :docBuffer,
        :userId,
        sysdate,
        NULL,
        NULL,
        :ulbId
      )
    `;

    const binds = {
      appId: String(appId),
      docType: String(docType),
      documentId: Number(documentId),
      docBuffer: blobBind(docBuffer),
      userId: String(userId),
      ulbId: String(ulbId),
    };

    console.log("[insertFireDoc] appId:", appId, "size:", binds.docBuffer.maxSize);
    const result = await connection.execute(query, binds, { autoCommit: true });
    return { success: true, rowsAffected: result.rowsAffected };
  } catch (error) {
    console.error("[insertFireDoc] Error:", error);
    return { success: false, error: error.message };
  } finally {
    if (connection) {
      try { await connection.close(); } catch (e) { console.error(e); }
    }
  }
}

// ---------------------------------------------------------------------------
// 6. Procedure aorts_application_ins
// ---------------------------------------------------------------------------
async function callApplicationIns(params) {
  const {
    ulbId, corpid, serviceid, zoneid, userid, noofcopy, appno, marriageDate, mode,
  } = params;

  console.log("[callApplicationIns]", {
    ulbId, corpid, serviceid, zoneid, userid, noofcopy, appno, marriageDate, mode,
  });

  const sql = `
    BEGIN
      aorts_application_ins(
        :in_ulbID,
        :in_corpid,
        :in_serviceid,
        :in_zoneid,
        :in_userid,
        :in_noofcopy,
        :in_appno,
        :in_MarraigeDate,
        :in_mode,
        :out_errcode,
        :out_ErrMsg
      );
    END;
  `;

  const binds = {
    in_ulbID: Number(ulbId),
    in_corpid: Number(corpid),
    in_serviceid: Number(serviceid),
    in_zoneid: zoneid != null ? Number(zoneid) : null,
    in_userid: Number(userid),
    in_noofcopy: noofcopy != null ? Number(noofcopy) : null,
    in_appno: appno || null,
    in_MarraigeDate: marriageDate ? new Date(marriageDate) : null,
    in_mode: Number(mode),

    out_errcode: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
    out_ErrMsg: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 2000 },
  };

  const result = await executeProcedureTMC({ sql, binds });

  if (!result.success) {
    return { success: false, error: result.error };
  }

  console.log("[callApplicationIns] outBinds:", result.outBinds);
  return { success: true, outBinds: result.outBinds };
}

module.exports = {
  insertMainDocument,
  insertPropDoc,
  insertWaterDoc,
  getFireApplicationId,
  insertFireDoc,
  callApplicationIns,
};