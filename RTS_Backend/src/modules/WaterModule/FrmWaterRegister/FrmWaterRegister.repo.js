const oracledb = require("oracledb");
const { executeQueryTMC } = require("../../../db/queryExecutor");
const { executeProcedureTMC } = require("../../../db/procedureExecutor");
const axios = require("axios");
const { encryptString, decryptString } = require("../../Dashboard/encrypt");

const getWardDropdownRepo = async ({ ulbid }) => {
    console.log("Repo: Fetch Ward Dropdown", { ulbid });
    const binds = { ulbid };

    const sql = `
        SELECT DISTINCT
            zonename AS WARDNAME,
            zoneid AS WARDID
        FROM prop.vw_zonemas
        WHERE ulbid = :ulbid
        ORDER BY zonename
    `;

    const result = await executeQueryTMC(sql, binds);

    if (!result || !result.success) {
        throw new Error(result?.error || "Failed to fetch ward dropdown");
    }
    return result.rows;
};

const getServiceDropdownRepo = async ({ rptMode }) => {
    console.log("Repo: Fetch Service Dropdown", { rptMode });
    const binds = {};

    const conditions = ["var_service_active = 'Y'"];
    let orderBy = "";
    if (Number(rptMode) !== 4) {orderBy = "ORDER BY num_service_serviceid"}

    const sql = `
         SELECT
            var_service_eng_name,
            num_service_serviceid
        FROM aorts_service_def
        WHERE ${conditions.join(" AND ")}
        ${orderBy}
    `;

    const result = await executeQueryTMC(sql, binds);
    if (!result || !result.success) {
        throw new Error(result?.error || "Failed to fetch service dropdown");
    }
    return result.rows;
};

const getDisconnectionDropdownRepo = async () => {
    console.log("Repo: Fetch Disconnection Dropdown");
    const sql = `
        SELECT DISTINCT
            var_disconn_name,
            num_disconn_id
        FROM water.aowt_disconnection_mas
    `;

    const result = await executeQueryTMC(sql, {});

    if (!result || !result.success) {
        throw new Error(result?.error || "Failed to fetch disconnection dropdown");
    }
    return result.rows;
};

const getUsageTypeDropdownRepo = async () => {
    console.log("Repo: Fetch Usage Type Dropdown");
    const sql = `
        SELECT DISTINCT
            var_usagetype_name,
            num_usagetype_id
        FROM water.aowt_usagetype_mas
    `;

    const result = await executeQueryTMC(sql, {});

    if (!result || !result.success) {
        throw new Error(result?.error || "Failed to fetch usage type dropdown");
    }
    return result.rows;
};

const getConnectionSizeDropdownRepo = async () => {
    console.log("Repo: Fetch Connection Size Dropdown");
    const sql = `
          SELECT DISTINCT
            var_connsize_name,
            num_connsize_id
        FROM water.aowt_connsize_mas
    `;

    const result = await executeQueryTMC(sql, {});

    if (!result || !result.success) {
        throw new Error(result?.error || "Failed to fetch connection size dropdown");
    }
    return result.rows;
};

const getWaterServiceNameRepo = async ({serviceId}) => {
    console.log("Repo: Fetch Water Service Name");
    const binds = {serviceId: serviceId};

    const sql = `
        SELECT
            var_service_eng_name
        FROM aorts_tmcservice_def
        WHERE num_service_serviceid = :serviceId
    `;

    const result = await executeQueryTMC(sql, binds);

    if (!result || !result.success) {
        throw new Error(result?.error || "Failed to fetch water service name");
    }

    return result.rows;
};

const getWaterDocumentsRepo = async ({ ulbid, serviceId }) => {
    console.log("Repo: Fetch Water Documents", {ulbid, serviceId});

    const binds = {ulbid, serviceId};

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
        WHERE num_doc_serviceid = :serviceId
          AND num_serdoc_ulbid = :ulbid
    `;

    const result = await executeQueryTMC(sql, binds);

    if (!result || !result.success) {
        throw new Error( result?.error || "Failed to fetch water documents");
    }
    return result.rows;
};

const getWaterRegisterDetailsRepo = async ({ rtsno }) => {
    console.log("Repo: Fetch Water Register Details", { rtsno });
    const binds = {rtsno};

    const sql = `
        SELECT
            num_wtreg_servid,
            var_wtreg_consno,
            num_wtreg_disconnid,
            var_wtreg_reason,
            num_wtreg_usageid,
            num_wtreg_tarifrate,
            num_wtreg_connsizeid,
            var_wtreg_remark,
            var_wtreg_rtsno
        FROM aorts_wtregister_infodet
        WHERE var_wtreg_rtsno = :rtsno
    `;

    const result = await executeQueryTMC(sql, binds);

    if (!result || !result.success) {
        throw new Error(result?.error || "Failed to fetch water register details");
    }
    return result.rows;
};


const getServicePayFlagRepo = async ({serviceId}) => {
    console.log("Repo: Fetch Service Pay Flag");

    const binds = {serviceId};

    const sql = `
        SELECT
            var_service_payflag
        FROM aorts.aorts_tmcservice_def
        WHERE num_service_serviceid = :serviceId
    `;

    const result = await executeQueryTMC(sql, binds);

    if (!result || !result.success) {
        throw new Error(result?.error || "Failed to fetch service pay flag");
    }
    return result.rows;
};

const saveWaterRegisterRepo = async ({
  userId,
  wtregId,
  servId,
  consNo,
  disConId,
  reason,
  usageTypeId,
  tarifRate,
  connSize,
  remark,
  ulbid,
  zoneId,
  source,
  ownerName,
  usageType,
  detAppliName,
  detAddress,
  inStr,
}) => {
  console.log("Repo: Save Water Register", {
    userId,
    wtregId,
    servId,
    consNo,
    ulbid,
    zoneId,
  });

  const nameParts = String(detAppliName || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  const firstName = nameParts[0] || "";
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";
  const middleName =
    nameParts.length > 2 ? nameParts.slice(1, -1).join(" ") : "";

  const sql = `
      BEGIN
          aorts_wtregister_info_ins(
              :in_UserId,
              :in_wtregId,
              :in_ServId,
              :in_consNo,
              :in_DisConId,
              :in_Reason,
              :in_UsagtypId,
              :in_tarifrate,
              :in_connsize,
              :in_Remark,
              :in_ulbid,
              :IN_ZoneId,
              :in_source,
              :in_ownername,
              :in_usagetype,
              :in_str,
              :in_firstname,
              :in_middlename,
              :in_lastname,
              :in_appaddress,
              :in_firstnamemr,
              :in_middlenamemr,
              :in_lastnamemr,
              :in_addressmr,
              :in_Remarkmar,
              :in_Reasonmar,
              :Out_ErrorCode,
              :Out_ErrorMsg
          );
      END;
  `;

  const binds = {
    in_UserId: String(userId),
    in_wtregId: Number(wtregId ?? 0),
    in_ServId: Number(servId),
    in_consNo: consNo,
    in_DisConId:
      disConId !== undefined && disConId !== null && disConId !== ""
        ? { val: Number(disConId), type: oracledb.NUMBER }
        : { val: null, type: oracledb.NUMBER },
    in_Reason: reason ?? null,
    in_UsagtypId:
      usageTypeId !== undefined &&
      usageTypeId !== null &&
      usageTypeId !== ""
        ? { val: Number(usageTypeId), type: oracledb.NUMBER }
        : { val: null, type: oracledb.NUMBER },
    in_tarifrate:
      tarifRate !== undefined && tarifRate !== null && tarifRate !== ""
        ? { val: Number(tarifRate), type: oracledb.NUMBER }
        : { val: null, type: oracledb.NUMBER },
    in_connsize:
      connSize !== undefined && connSize !== null && connSize !== ""
        ? { val: Number(connSize), type: oracledb.NUMBER }
        : { val: null, type: oracledb.NUMBER },
    in_Remark: remark ?? null,
    in_ulbid: { val: Number(ulbid), type: oracledb.NUMBER },
    IN_ZoneId: { val: Number(zoneId), type: oracledb.NUMBER },
    in_source: source ?? null,
    in_ownername: ownerName ?? null,
    in_usagetype: usageType ?? null,

    in_str: inStr ?? null,

    in_firstname: firstName,
    in_middlename: middleName,
    in_lastname: lastName,
    in_appaddress: detAddress ?? null,

    in_firstnamemr: firstName,
    in_middlenamemr: middleName,
    in_lastnamemr: lastName,
    in_addressmr: detAddress ?? null,
    in_Remarkmar: remark ?? null,
    in_Reasonmar: reason ?? null,

    Out_ErrorCode: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
    Out_ErrorMsg: {
      dir: oracledb.BIND_OUT,
      type: oracledb.STRING,
      maxSize: 4000,
    },
  };

  console.log("Water Register Procedure Binds:", {
    ...binds,
    Out_ErrorCode: "BIND_OUT",
    Out_ErrorMsg: "BIND_OUT",
  });

  const result = await executeProcedureTMC({ sql, binds });

  console.log("Water Register Procedure Result:", result);

  if (!result || !result.success) {
    throw new Error(result?.error || "Failed to execute water register procedure");
  }

  return result.outBinds;
};

const uploadWaterDocumentRepo = async ({corpid, serviceid, appno, doctype, documentid, fileBuffer}) => {
    console.log("Repo: Upload Water Document", { corpid, serviceid, appno, documentid, fileSize: fileBuffer?.length});

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
            :corpid,
            :serviceid,
            :appno,
            :doctype,
            :documentid,
            :BLOBDocImage
        )
    `;

    const binds = {
        corpid: Number(corpid),
        serviceid: Number(serviceid),
        appno,
        doctype: (() => {
            const ext = String(doctype || "").trim().toUpperCase();
            if (ext === "PDF") return "P";
            if (ext === "JPG" || ext === "JPEG") return "J";
            if (ext === "PNG") return "N";
            return ext.slice(0, 2) || "S";
        })(),
        documentid: Number(documentid),
        BLOBDocImage: {type: oracledb.BLOB, dir: oracledb.BIND_IN, val: fileBuffer}
    };

    const result = await executeQueryTMC(sql, binds, {autoCommit: true});

    if (!result || !result.success) {
        throw new Error(result?.error || "Failed to upload water document");
    }
    return result;
};

const getConnectionDetailsRepo = async ({ userId, consumerNo }) => {
    console.log("Repo: Fetch Connection Details", { userId, consumerNo });

    if (!userId) throw new Error("User ID is required");
    if (!consumerNo) throw new Error("Consumer No is required");

    const clientUrl = process.env.TMC_IGR_URL;

    if (!clientUrl) {
        throw new Error("TMC_IGR_URL is not configured");
    }

    const plainRequest = JSON.stringify({
        jsonData: [
            {
                user_id: String(userId),
                propno: String(consumerNo),
            },
        ],
    });

    console.log("TMC Plain Request:", plainRequest);
    const encryptedRequest = encryptString(plainRequest, {key: process.env.ORACLE_ENCRYPTION_KEY});

    const requestBody = JSON.stringify({jsonData: [{encr_request: encryptedRequest}]});

    console.log("TMC Encrypted Request:", requestBody);
    let response;

    try {
        response = await axios.post(clientUrl, requestBody, {
            headers: {
                "Content-Type": "application/json",
            },
            timeout: 30000,
            validateStatus: () => true,
        });
    } catch (error) {
        console.error("TMC Request Error:", error.message);
        throw new Error("Unable to connect to TMC connection service");
    }

    console.log("TMC Response Status:", response.status);
    console.log("TMC Response:", response.data);

    const encryptedResponse = response?.data?.jsonData?.[0]?.encr_request || response?.data?.Response;

    if (!encryptedResponse) {
        console.error( "Invalid TMC response:", response.data);
        throw new Error( `Invalid TMC response. HTTP ${response.status}`);
    }

    console.log("Encrypted TMC Response:", encryptedResponse);
    let decryptedResponse;

    try {
        decryptedResponse = decryptString(
            encryptedResponse,
            {key: process.env.ORACLE_ENCRYPTION_KEY}
        );
    } catch (error) {
        console.error("TMC Response Decryption Failed:", error.message);
        throw new Error("Unable to decrypt TMC connection details");
    }
    console.log( "TMC Decrypted Response:", decryptedResponse
    );

    try {
        return JSON.parse(decryptedResponse);
    } catch {
        return decryptedResponse;
    }
};

module.exports = {
    getWardDropdownRepo,
    getServiceDropdownRepo,
    getDisconnectionDropdownRepo,
    getUsageTypeDropdownRepo,
    getConnectionSizeDropdownRepo,
    getWaterServiceNameRepo,
    getWaterDocumentsRepo,
    getWaterRegisterDetailsRepo,
    getServicePayFlagRepo,
    saveWaterRegisterRepo,
    uploadWaterDocumentRepo,
    getConnectionDetailsRepo
};