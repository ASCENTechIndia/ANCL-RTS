const { executeQueryTMC } = require("../../../db/queryExecutor");
const { withTxTMC } = require("../../../db/tx");
const oracledb = require("oracledb");

// ============================================================
// GET WARD LIST
// ============================================================
const getWardListRepo = async (ulbId) => {
  try {
    const query = `
      SELECT DISTINCT
        wardname,
        wardid
      FROM prop.vw_ward_mas
      WHERE ulbid = :ulbId
      ORDER BY wardname
    `;

    const result = await executeQueryTMC(query, {
      ulbId: Number(ulbId),
    });

    return {
      success: true,
      rows: result.rows || [],
    };
  } catch (error) {
    console.error("GET WARD LIST REPO ERROR:", error);

    return {
      success: false,
      error: error.message,
    };
  }
};

// ============================================================
// GET SECTOR LIST
// ============================================================
const getSectorListRepo = async () => {
  try {
    const query = `
      SELECT
        var_sector_name AS sectorName,
        num_sector_id AS sectorId
      FROM aorts_sector_mst
      WHERE var_sector_active = 'Y'
      ORDER BY num_sector_id
    `;

    const result = await executeQueryTMC(query, {});

    return {
      success: true,
      rows: result.rows || [],
    };
  } catch (error) {
    console.error("GET SECTOR LIST REPO ERROR:", error);

    return {
      success: false,
      error: error.message,
    };
  }
};

// ============================================================
// GET DOCUMENT LIST
// ============================================================
const getDocumentListRepo = async (serviceId, ulbId) => {
  try {
    const query = `
      SELECT
        num_doc_id AS docId,
        var_doc_engname AS docName,
        var_doc_engdocdesc AS engdocdesc,
        var_doc_type AS docType,
        NULL AS noc_new,
        NULL AS noc_renewal,
        var_doc_active AS active

      FROM aorts.aorts_serv_doc_config

      INNER JOIN aorts.aorts_service_def
        ON num_service_serviceid = num_serdoc_servid

      INNER JOIN aorts.aorts_doc_def
        ON num_doc_id = num_serdoc_docid
        AND num_doc_serviceid = num_service_serviceid

      WHERE num_serdoc_servid = :serviceId
        AND var_service_active = 'Y'
        AND num_serdoc_ulbid = :ulbId
    `;

    const result = await executeQueryTMC(query, {
      serviceId: String(serviceId),
      ulbId: Number(ulbId),
    });

    return {
      success: true,
      rows: result.rows || [],
    };
  } catch (error) {
    console.error("GET DOCUMENT LIST REPO ERROR:", error);

    return {
      success: false,
      error: error.message,
    };
  }
};

// ============================================================
// INSERT SERVICE APPLICATION
// ============================================================
const insertServiceApplicationRepo = async (data) => {
  return await withTxTMC(async (connection) => {
    const result = await connection.execute(
      `
        BEGIN
          aorts_servApplication_ins(
            :IN_USERID,
            :IN_Serviceid,
            :IN_Appliname,
            :IN_Address,
            :IN_Mobile,
            :IN_Emailid,
            :IN_AadharNo,
            :IN_RefNo,
            :IN_Zoneid,
            :IN_Sectorid,
            :IN_Villageid,
            :IN_Locality,
            :IN_Landmark,
            :IN_Pincode,
            :in_source,
            :out_errcode,
            :out_ErrMsg,
            :out_applino
          );
        END;
      `,
      {
        IN_USERID: {
          dir: oracledb.BIND_IN,
          type: oracledb.STRING,
          val: data.userId,
        },

        IN_Serviceid: {
          dir: oracledb.BIND_IN,
          type: oracledb.NUMBER,
          val: Number(data.serviceId),
        },

        IN_Appliname: {
          dir: oracledb.BIND_IN,
          type: oracledb.STRING,
          val: data.applicationName,
        },

        IN_Address: {
          dir: oracledb.BIND_IN,
          type: oracledb.STRING,
          val: data.address,
        },

        IN_Mobile: {
          dir: oracledb.BIND_IN,
          type: oracledb.NUMBER,
          val: Number(data.mobile),
        },

        IN_Emailid: {
          dir: oracledb.BIND_IN,
          type: oracledb.STRING,
          val: data.email,
        },

        IN_AadharNo: {
          dir: oracledb.BIND_IN,
          type: oracledb.NUMBER,
          val: Number(data.aadharNo || 0),
        },

        IN_RefNo: {
          dir: oracledb.BIND_IN,
          type: oracledb.STRING,
          val: data.refNo || "",
        },

        IN_Zoneid: {
          dir: oracledb.BIND_IN,
          type: oracledb.NUMBER,
          val: Number(data.zoneId || 0),
        },

        IN_Sectorid: {
          dir: oracledb.BIND_IN,
          type: oracledb.NUMBER,
          val: Number(data.sectorId || 0),
        },

        IN_Villageid: {
          dir: oracledb.BIND_IN,
          type: oracledb.NUMBER,
          val: Number(data.villageId || 0),
        },

        IN_Locality: {
          dir: oracledb.BIND_IN,
          type: oracledb.STRING,
          val: data.locality || "",
        },

        IN_Landmark: {
          dir: oracledb.BIND_IN,
          type: oracledb.STRING,
          val: data.landmark || "",
        },

        IN_Pincode: {
          dir: oracledb.BIND_IN,
          type: oracledb.NUMBER,
          val: Number(data.pincode || 0),
        },

        in_source: {
          dir: oracledb.BIND_IN,
          type: oracledb.STRING,
          val: data.source || "WEB",
        },

        out_errcode: {
          dir: oracledb.BIND_OUT,
          type: oracledb.NUMBER,
        },

        out_ErrMsg: {
          dir: oracledb.BIND_OUT,
          type: oracledb.STRING,
          maxSize: 200,
        },

        out_applino: {
          dir: oracledb.BIND_OUT,
          type: oracledb.STRING,
          maxSize: 500,
        },
      },
    );

    const outBinds = result.outBinds;

    return {
      errCode: Number(outBinds.out_errcode),
      errMsg: outBinds.out_ErrMsg,
      applicationNo: outBinds.out_applino,
    };
  });
};

// ============================================================
// INSERT APPLICATION DOCUMENT
// ============================================================
const uploadServiceDocumentsRepo = async ({ corpid, serviceId, appNo, documents }) => {
  try {
    console.log("Repo: Multiple Document Insert");

    console.log({
      corpid,
      serviceId,
      appNo,
      documentCount: documents?.length || 0,
    });

    if (!documents || documents.length === 0) {
      throw new Error("No documents received.");
    }

    return await withTxTMC(async (connection) => {
      const query = `
        INSERT INTO aorts.aorts_appdoc_det
        (
          num_appdoc_corpid,
          num_appdoc_serviceid,
          var_appdoc_appno,
          var_appdoc_doctype,
          num_appdoc_documentid,
          blob_appdoc_documentimg
        )
        VALUES
        (
          :corpid,
          :serviceId,
          :appNo,
          :docType,
          :documentId,
          :documentBuffer
        )
      `;

      const insertedDocuments = [];

      for (const document of documents) {
        if (!document.buffer || document.buffer.length === 0) {
          throw new Error(`Document ${document.documentId} is empty.`);
        }

        await connection.execute(
          query,
          {
            corpid: {
              dir: oracledb.BIND_IN,
              type: oracledb.NUMBER,
              val: Number(corpid),
            },

            serviceId: {
              dir: oracledb.BIND_IN,
              type: oracledb.NUMBER,
              val: Number(serviceId),
            },

            appNo: {
              dir: oracledb.BIND_IN,
              type: oracledb.STRING,
              val: appNo,
            },

            docType: {
              dir: oracledb.BIND_IN,
              type: oracledb.STRING,
              val: document.docType || "",
            },

            documentId: {
              dir: oracledb.BIND_IN,
              type: oracledb.NUMBER,
              val: Number(document.documentId),
            },

            documentBuffer: {
              dir: oracledb.BIND_IN,
              type: oracledb.BLOB,
              val: document.buffer,
            },
          },
          {
            autoCommit: false,
          },
        );

        insertedDocuments.push({
          documentId: Number(document.documentId),
          docType: document.docType || "",
          fileName: document.fileName || "",
        });
      }

      return {
        status: "SUCCESS",
        message: "All documents inserted successfully.",
        applicationNo: appNo,
        documentCount: insertedDocuments.length,
        documents: insertedDocuments,
      };
    });
  } catch (error) {
    console.error("UPLOAD SERVICE DOCUMENTS REPO ERROR:", error);

    throw error;
  }
};


const getVillageListRepo = async (sectorId) => {
  try {
    const query = `
      SELECT
        var_village_name AS villageName,
        num_village_id AS villageId
      FROM aorts_village_mst
      WHERE var_village_active = 'Y'
        AND num_sector_id = :sectorId
      ORDER BY num_village_id
    `;

    const result = await executeQueryTMC(query, {
      sectorId: Number(sectorId),
    });

    return {
      success: true,
      rows: result.rows || [],
    };
  } catch (error) {
    console.error("GET VILLAGE LIST REPO ERROR:", error);

    return {
      success: false,
      error: error.message,
    };
  }
};

module.exports = {
  getWardListRepo,
  getSectorListRepo,
  getDocumentListRepo,
  insertServiceApplicationRepo,
  uploadServiceDocumentsRepo,
  getVillageListRepo,
};
