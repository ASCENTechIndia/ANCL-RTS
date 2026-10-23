const { executeQueryTMC } = require("../../../db/queryExecutor");
const { getConnectionTMC } = require("../../../config/db");
const { executeProcedureTMC } = require("../../../db/procedureExecutor");
const oracledb = require("oracledb");
const { lobToBuffer } = require("../../Dashboard/Dashboard.repo")

const getWardListRepo = async ({ ulbid }) => {
    console.log("Repo: Fetch Water Ward List", { ulbid });
    const binds = { ulbid: Number(ulbid) };
    const conditions = ["ulbid = :ulbid"];

    if (Number(ulbid) === 2) {
        conditions.push("wardid <> 1281");
    }

    const sql = `
        SELECT DISTINCT
            wardname AS WARDNAME,
            wardid AS WARDID
        FROM prop.vw_ward_mas
        WHERE ${conditions.join(" AND ")}
        ORDER BY wardname
    `;

    const result = await executeQueryTMC(sql, binds);

    if (!result || !result.success) {
        throw new Error(result?.error || "Failed to fetch water ward list");
    }

    return result.rows || [];
};

const getDocumentListRepo = async ({ ulbid, serviceId, corpId }) => {
    console.log("Repo: Fetch Water Document List", { ulbid, serviceId, corpId });
    const binds = { ulbid: Number(ulbid), serviceId: Number(serviceId), corpId: Number(corpId) };
    const conditions = ["num_doc_corpid = :corpId", "num_doc_serviceid = :serviceId", "num_serdoc_ulbid = :ulbid"];

    const sql = `
        SELECT
            num_doc_id AS DOCID,
            var_doc_engname AS DOCNAME,
            var_doc_engdocdesc AS ENGDOCDESC,
            var_doc_type AS DOCTYPE,
            NULL AS NOC_NEW,
            NULL AS NOC_RENEWAL,
            var_doc_active AS ACTIVE
        FROM aorts_doc_def
        INNER JOIN aorts_serv_doc_config
            ON num_serdoc_servid = num_doc_serviceid
           AND num_serdoc_docid = num_doc_id
        INNER JOIN vw_services
            ON num_service_serviceid = num_doc_serviceid
        WHERE ${conditions.join(" AND ")}
        ORDER BY num_doc_id
    `;

    const result = await executeQueryTMC(sql, binds);

    if (!result || !result.success) {
        throw new Error(result?.error || "Failed to fetch water document list");
    }
    return result.rows || [];
};

const getWaterApplicationDetailsRepo = async ({ applicationNo }) => {
    console.log("Repo: Fetch Water Application Details", { applicationNo });
    const binds = { applicationNo: String(applicationNo).trim() };

    const sql = `
        SELECT
            num_wtapplidetail_id,
            num_wtapplidetail_ulbid,
            var_wtapplidetail_connno,
            var_wtapplidetail_applifname,
            var_wtapplidetail_applimname,
            var_wtapplidetail_applilname,
            var_wtapplidetail_mobileno,
            var_wtapplidetail_email,
            var_wtapplidetail_adharno,
            var_wtapplidetail_propno,
            var_wtapplidetail_resino,
            var_wtapplidetail_currofname,
            var_wtapplidetail_curromname,
            var_wtapplidetail_currolname,
            var_wtapplidetail_currcofname,
            var_wtapplidetail_currcomname,
            var_wtapplidetail_currcolname,
            var_wtapplidetail_newofname,
            var_wtapplidetail_newomname,
            var_wtapplidetail_newolname,
            var_wtapplidetail_newcofname,
            var_wtapplidetail_newcomname,
            var_wtapplidetail_newcolname
        FROM aorts.aorts_wtapplidetail_mst
        INNER JOIN aorts.AORTS_APPLICANT_INFODET
            ON num_wtapplidetail_ulbid = num_appl_ulbid
           AND var_wtapplidetail_rtsno = var_appl_appno
        WHERE var_wtapplidetail_rtsno = :applicationNo
    `;

    const result = await executeQueryTMC(sql, binds);

    if (!result || !result.success) {
        throw new Error(result?.error || "Failed to fetch water application details");
    }
    return result.rows || [];
};

const getWaterApplicationDocumentsRepo = async ({ applicationId }) => {
    console.log("Repo: Fetch Water Application Documents", { applicationId });

    let connection;

    try {
        connection = await getConnectionTMC();

        const binds = { applicationId: Number(applicationId) };

        const sql = `
            SELECT
                num_wtapplidoc_id,
                num_wtapplidoc_appliid AS APPLIID,
                num_wtapplidoc_docid AS DOCID,
                num_wtapplidoc_doctype AS FILEEXTENSION,
                blo_wtapplidoc_image AS FILEBYTS
            FROM aorts.aorts_wtapplidetaildoc_det
            WHERE num_wtapplidoc_appliid = :applicationId
            ORDER BY num_wtapplidoc_id
        `;

        const result = await connection.execute(sql, binds, { outFormat: oracledb.OUT_FORMAT_OBJECT });

        const documents = await Promise.all(
            (result.rows || []).map(async (row) => {
                let fileBuffer = null;

                if (row.FILEBYTS) {
                    if (Buffer.isBuffer(row.FILEBYTS)) {
                        fileBuffer = row.FILEBYTS;
                    } else {
                        fileBuffer = await lobToBuffer(row.FILEBYTS);
                    }
                }

                return { ...row, FILEBYTS: fileBuffer ? fileBuffer.toString("base64") : null };
            })
        );

        return documents;

    } catch (error) {
        console.error("GET WATER APPLICATION DOCUMENTS REPO ERROR:", error);
        throw error;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (closeError) {
                console.error("Error closing Water Application Documents connection:", closeError);
            }
        }
    }
};

const saveWaterApplicationRepo = async (payload) => {
    console.log("Repo: Save Water Application", payload);

    const sql = `
        BEGIN
            aorts_WTAppliDetail_ins(
                :IN_USERID,
                :IN_AppDetID,
                :in_ulbID,
                :IN_CONNNO,
                :IN_AppliFName,
                :IN_AppliMName,
                :IN_AppliLName,
                :IN_MobNO,
                :IN_EMAIL,
                :IN_AADHARNO,
                :IN_PROPNO,
                :IN_RESNO,
                :IN_CurrOFName,
                :IN_CurrOMName,
                :IN_CurrOLName,
                :IN_CurrCOFName,
                :IN_CurrCOMName,
                :IN_CurrCOLName,
                :IN_NewOFName,
                :IN_NewOMName,
                :IN_NewOLName,
                :IN_NewCOFName,
                :IN_NewCOMName,
                :IN_NewCOLName,
                :in_Docstring,
                :IN_ServId,
                :IN_ZoneId,
                :in_source,
                :in_str,
                :IN_AppliFNamemr,
                :IN_AppliMNamemr,
                :IN_AppliLNamemr,
                :IN_CurrOFNamemr,
                :IN_CurrOMNamemr,
                :IN_CurrOLNamemr,
                :IN_CurrCOFNamemr,
                :IN_CurrCOMNamemr,
                :IN_CurrCOLNamemr,
                :IN_NewOFNamemr,
                :IN_NewOMNamemr,
                :IN_NewOLNamemr,
                :IN_NewCOFNamemr,
                :IN_NewCOMNamemr,
                :IN_NewCOLNamemr,
                :out_errcode,
                :out_ErrMsg,
                :Out_DocStr,
                :out_AppliNo
            );
        END;
    `;

    const binds = {
        IN_USERID: String(payload.userId),
        IN_AppDetID: Number(payload.appDetId || 0),
        in_ulbID: Number(payload.ulbid),
        IN_CONNNO: payload.connectionNo || null,
        IN_AppliFName: payload.appliFName || null,
        IN_AppliMName: payload.appliMName || null,
        IN_AppliLName: payload.appliLName || null,
        IN_MobNO: payload.mobileNo || null,
        IN_EMAIL: payload.email || null,
        IN_AADHARNO: payload.aadharNo || null,
        IN_PROPNO: payload.propertyNo || null,
        IN_RESNO: payload.residenceNo || null,
        IN_CurrOFName: payload.currOFName || null,
        IN_CurrOMName: payload.currOMName || null,
        IN_CurrOLName: payload.currOLName || null,
        IN_CurrCOFName: payload.currCOFName || null,
        IN_CurrCOMName: payload.currCOMName || null,
        IN_CurrCOLName: payload.currCOLName || null,
        IN_NewOFName: payload.newOFName || null,
        IN_NewOMName: payload.newOMName || null,
        IN_NewOLName: payload.newOLName || null,
        IN_NewCOFName: payload.newCOFName || null,
        IN_NewCOMName: payload.newCOMName || null,
        IN_NewCOLName: payload.newCOLName || null,
        // in_Docstring: payload.docString || null,
        in_Docstring:
          payload.docString && String(payload.docString).trim() !== ""
            ? String(payload.docString).trim()
            : null,
        IN_ServId: Number(payload.serviceId),
        IN_ZoneId: Number(payload.zoneId || 0),
        in_source: payload.source || null,
        in_str: payload.inStr || null,
        IN_AppliFNamemr: payload.appliFNameMr || null,
        IN_AppliMNamemr: payload.appliMNameMr || null,
        IN_AppliLNamemr: payload.appliLNameMr || null,
        IN_CurrOFNamemr: payload.currOFNameMr || null,
        IN_CurrOMNamemr: payload.currOMNameMr || null,
        IN_CurrOLNamemr: payload.currOLNameMr || null,
        IN_CurrCOFNamemr: payload.currCOFNameMr || null,
        IN_CurrCOMNamemr: payload.currCOMNameMr || null,
        IN_CurrCOLNamemr: payload.currCOLNameMr || null,
        IN_NewOFNamemr: payload.newOFNameMr || null,
        IN_NewOMNamemr: payload.newOMNameMr || null,
        IN_NewOLNamemr: payload.newOLNameMr || null,
        IN_NewCOFNamemr: payload.newCOFNameMr || null,
        IN_NewCOMNamemr: payload.newCOMNameMr || null,
        IN_NewCOLNamemr: payload.newCOLNameMr || null,
        out_errcode: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        out_ErrMsg: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 4000 },
        Out_DocStr: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 4000 },
        out_AppliNo: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 1000 },
    };

    const result = await executeProcedureTMC({ sql, binds });

    if (!result || !result.success) {
        throw new Error(result?.error || "Failed to save water application");
    }

    return result.outBinds;
};

const uploadWaterApplicationDocumentRepo = async ({ corpId, serviceId, applicationNo, documentType, documentId, fileBuffer }) => {
    console.log("Repo: Upload Water Application Document", { corpId, serviceId, applicationNo, documentType, documentId });

    const sql = `
        INSERT INTO aorts_appdoc_det (
            num_appdoc_corpid,
            num_appdoc_serviceid,
            var_appdoc_appno,
            var_appdoc_doctype,
            num_appdoc_documentid,
            blob_appdoc_documentimg
        )
        VALUES (
            :corpId,
            :serviceId,
            :applicationNo,
            :documentType,
            :documentId,
            :BLOBDocImage
        )
    `;

    const binds = {
        corpId: Number(corpId),
        serviceId: Number(serviceId),
        applicationNo: String(applicationNo).trim(),
        // documentType: String(documentType).trim(),
        documentType: (() => {
          const ext = String(documentType || "").trim().toUpperCase();
          if (ext === "PDF") return "P";
          if (ext === "JPG" || ext === "JPEG") return "J";
          if (ext === "PNG") return "N";
          return ext.slice(0, 2) || "S";
        })(),
        documentId: Number(documentId),
        BLOBDocImage: fileBuffer,
    };

    const result = await executeQueryTMC(sql, binds, { autoCommit: true });
    console.log({ result, binds })
    if (!result || !result.success) {
        throw new Error(result?.error || "Failed to upload application document");
    }

    return {
        success: true,
        rowsAffected: result.rowsAffected || 0,
    };
};

module.exports = {
    getWardListRepo,
    getDocumentListRepo,
    getWaterApplicationDetailsRepo,
    getWaterApplicationDocumentsRepo,
    saveWaterApplicationRepo,
    uploadWaterApplicationDocumentRepo,
};