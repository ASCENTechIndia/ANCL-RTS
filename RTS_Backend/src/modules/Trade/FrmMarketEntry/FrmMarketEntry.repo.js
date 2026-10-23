const { executeQueryTMC } = require("../../../db/queryExecutor");
const oracledb = require("oracledb");
const { withTxTMC } = require("../../../db/tx");
const { getConnectionTMC } = require("../../../config/db");

// ============================================================
// GET BUSINESS PLACE
// ============================================================
const getBusinessPlaceRepo = async () => {
  const query = `
    SELECT
      var_busiplace_name,
      num_busiplace_id
    FROM aorts_busiplace_mas
  `;

  const result = await executeQueryTMC(query);
  return result.rows || [];
};

// ============================================================
// GET JALAN SHIL
// ============================================================
const getJalanShilRepo = async () => {
  const query = `
    SELECT
      var_jalanshil_name,
      var_jalanshil_code
    FROM aorts_jalanshil_mas
  `;

  const result = await executeQueryTMC(query);

  return result.rows || [];
};

// ============================================================
// GET ILLEGAL TYPE
// ============================================================
const getIllegalTypeRepo = async () => {
  const query = `
    SELECT
      var_illegal_name,
      num_illegal_id
    FROM aorts_illegal_mas
  `;

  const result = await executeQueryTMC(query);

  return result.rows || [];
};

// ============================================================
// GET APPLICANT TYPE
// ============================================================
const getApplicantTypeRepo = async (ulbId) => {
  const query = `
      SELECT
      var_applitype_name,
      num_applitype_id
    FROM  market.aomk_applitype_mas
    WHERE num_applitype_ulbid = :ulbId
      AND var_applitype_flag = 'Y'
  `;

  const result = await executeQueryTMC(query, {
    ulbId,
  });

  return result.rows || [];
};

// ============================================================
// GET WARD
// ============================================================
const getWardRepo = async (ulbId) => {
  const query = `
     SELECT DISTINCT
      wardname,
      wardid
    FROM prop.vw_zonemas
    WHERE ulbid = :ulbId
  `;

  const result = await executeQueryTMC(query, {
    ulbId,
  });

  return result.rows || [];
};

// ============================================================
// GET LICENSE TYPE
// ============================================================
const getLicenseTypeRepo = async () => {
  const query = `
    SELECT
      var_licensetype_name,
      num_licensetype_id
    FROM market.aomk_licensetype_mas
  `;

  const result = await executeQueryTMC(query);

  return result.rows || [];
};

// ============================================================
// GET TRADE CATEGORY
// ============================================================
const getTradeCategoryRepo = async (licenseType) => {
  const query = `
    SELECT
      var_tradecategory_name,
      num_tradecategory_id
    FROM     market.aomk_tradecatconfig_mas
    INNER JOIN market.aomk_tradecategory_mas
      ON num_tradecategory_id = num_tradecatconf_tradecatid
    WHERE var_tradecategory_flag = 'Y'
      AND num_tradecategory_id = :licenseType
  `;
  console.log("query :", query);
  const result = await executeQueryTMC(query, {
    licenseType,
  });

  return result.rows || [];
};

// ============================================================
// GET TRADE DETAILS
// ============================================================
const getTradeDetailsRepo = async (ulbId) => {
  const query = `
     SELECT
      num_trade_id AS tradeid,
      var_trade_name AS tradename,
      'N' AS flag
    FROM market.aomk_trade_mas 
    WHERE var_trade_flag = 'Y'
      AND num_trade_ulbid = :ulbId
  `;

  const result = await executeQueryTMC(query, {
    ulbId,
  });

  return result.rows || [];
};

// ============================================================
// GET DOCUMENT DETAILS
// ============================================================
const getDocumentDetailsRepo = async (serviceId, ulbId) => {
  const query = `
    SELECT
      num_doc_id AS docid,
      var_doc_engname AS doctypename,
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

  const result = await executeQueryTMC(query, {
    serviceId,
    ulbId,
  });

  return result.rows || [];
};

// ============================================================
// GET SELF DECLARE DATA
// ============================================================
const getSelfDeclareDataRepo = async (serviceId) => {
  const query = `
    SELECT
      num_selfdeclare_id AS id,
      var_selfdeclare_desc AS MESSAGE
    FROM aorts_selfdeclare_mas
    WHERE num_selfdeclare_servid = :serviceId
  `;

  const result = await executeQueryTMC(query, {
    serviceId,
  });

  return result.rows || [];
};

// ============================================================
// GET TRADE TYPE DETAILS
// ============================================================
const getTradeTypeDetailsRepo = async (ulbId, tradeCategoryId, tradeTypeId) => {
  const query = `
    SELECT
      num_rate_tradetypename AS tradetype,
      num_rate_id AS tradetypeid,
      0 AS Rate,
      'N' AS flag
    FROM  market.aomk_tradetype_mas  
    INNER JOIN  market.aomk_tradecategory_mas  
      ON aomk_tradetype_tradecategoryid = num_tradecategory_id
     AND aomk_tradetype_ulbid = num_tradecategory_ulbid
    INNER JOIN market.aomk_rate_mas
      ON num_rate_tradetypeid = num_tradetype_id
     AND num_rate_ulbid = aomk_tradetype_ulbid
    WHERE var_tradetype_flag = 'Y'
      AND aomk_tradetype_ulbid = :ulbId
      AND num_tradecategory_id = :tradeCategoryId
      AND num_tradetype_id = :tradeTypeId
  `;

  const result = await executeQueryTMC(query, {
    ulbId,
    tradeCategoryId,
    tradeTypeId,
  });

  return result.rows || [];
};

// ============================================================
// GET APPLICATION DETAILS
// ============================================================
const getApplicationDetailsRepo = async (applicationId, ulbId) => {
  const query = `
    SELECT
      var_appli_applino,
      var_appli_applidt,
      var_appli_oldlicencno,
      var_appli_shopname,
      var_appli_panno,
      num_appli_contactno,
      var_appli_email,
      var_appli_address,
      num_appli_zoneid,
      num_appli_wardid,
      var_appli_isprod,
      var_appli_ownspace,
      var_appli_agrmentwith,
      num_appli_area,
      var_appli_iscorpnoc,
      num_appli_busstartyr,
      var_appli_shopactno,
      var_appli_foodlicno,
      num_appli_licdays,
      var_appli_shopnamemar,
      var_appli_placeownername,
      var_appli_placeowneraddress,
      dat_appli_fromdt,
      dat_appli_todt,
      NVL(num_appli_amount, 0) AS amount,
      num_appli_licensetypeid
    FROM market.aomk_appli_mas
    WHERE num_appli_id = :applicationId
      AND num_appli_ulbid = :ulbId
  `;
  //console.log("Query :", query);

  const result = await executeQueryTMC(query, {
    applicationId,
    ulbId,
  });
  // console.log("result :", result);
  return result.rows || [];
};

// ============================================================
// GET APPLICATION TRADE TYPE DETAILS
// ============================================================
// const getApplicationTradeTypeDetailsRepo = async (applicationId, ulbId) => {
//   const query = `
//     SELECT
//       num_applitradetype_id,
//       num_applitradetype_appliid,
//       num_applitradetype_trdtypid,
//       NVL(num_applitrade_traderate, 0) AS Rate,
//       num_rate_tradetypename AS tradetype,
//       num_rate_id AS tradetypeid
//     FROM aomk_applitradetyp_det
//     INNER JOIN aomk_rate_mas
//       ON num_rate_id = num_applitradetype_trdtypid
//      AND num_rate_ulbid = num_applitradetyp_ulbid
//     WHERE num_applitradetype_appliid = :applicationId
//       AND num_applitradetyp_ulbid = :ulbId
//   `;

//   const result = await executeQueryTMC(query, {
//     applicationId,
//     ulbId,
//   });

//   return result.rows || [];
// };

// ============================================================
// GET APPLICATION TRADE DETAILS
// ============================================================
// const getApplicationTradeDetailsRepo = async (applicationId) => {
//   const query = `
//     SELECT
//       num_applitrade_id,
//       num_applitrade_appliid,
//       num_applitrade_tradeid
//     FROM aomk_applitrade_det
//     WHERE num_applitrade_appliid = :applicationId
//   `;

//   const result = await executeQueryTMC(query, {
//     applicationId,
//   });

//   return result.rows || [];
// };

// ============================================================
// GET APPLICATION DIRECTOR DETAILS
// ============================================================
// const getApplicationDirectorDetailsRepo = async (applicationId) => {
//   let connection;

//   try {
//     connection = await getConnectionTMC();

//     const query = `
//       SELECT
//         num_applidirector_id AS directorId,
//         num_applidirector_aadhaarno AS adharno,
//         var_applidirector_name AS dirctorname,
//         Var_AppliDirector_VoterId AS VoterId,
//         num_applidirector_mobileno AS mobileno,
//         var_applidirector_emailid AS email,
//         var_applidirector_gender AS gender,
//         var_applidirector_address AS address,
//         num_applidirector_applitype AS applitypeid,
//         var_applitype_name AS applitypename,
//         blo_applitype_photo AS imgDirectorImage
//       FROM aomk_applidirector_det
//       INNER JOIN aomk_applitype_mas
//         ON num_applitype_id = num_applidirector_applitype
//        AND num_applidirector_ulbid = num_applitype_ulbid
//       WHERE num_applidirector_appliid = :applicationId
//     `;

//     const result = await connection.execute(
//       query,
//       {
//         applicationId,
//       },
//       {
//         outFormat: oracledb.OUT_FORMAT_OBJECT,

//         fetchInfo: {
//           IMGDIRECTORIMAGE: {
//             type: oracledb.BUFFER,
//           },
//         },
//       },
//     );

//     const rows = result.rows || [];

//     // --------------------------------------------------------
//     // Convert Director Image BLOB -> Base64
//     // --------------------------------------------------------
//     for (const row of rows) {
//       if (Buffer.isBuffer(row.IMGDIRECTORIMAGE) && row.IMGDIRECTORIMAGE.length > 0) {
//         row.imgDirectorImage = row.IMGDIRECTORIMAGE.toString("base64");
//       } else {
//         row.imgDirectorImage = null;
//       }

//       delete row.IMGDIRECTORIMAGE;
//     }

//     return rows;
//   } catch (error) {
//     console.error("GET APPLICATION DIRECTOR DETAILS REPO ERROR:", error);

//     throw error;
//   } finally {
//     if (connection) {
//       try {
//         await connection.close();
//       } catch (error) {
//         console.error("ERROR CLOSING ANCL CONNECTION:", error);
//       }
//     }
//   }
// };

// ============================================================
// GET APPLICATION DOCUMENT DETAILS
// ============================================================
// const getApplicationDocumentDetailsRepo = async (applicationId, ulbId) => {
//   let connection;

//   try {
//     connection = await getConnectionTMC();

//     const query = `
//       SELECT
//         docid AS primaryDocId,
//         num_applidoc_appliid AS AppliId,
//         docid AS docId,
//         var_applidoc_doctype AS FileType,
//         blo_applidoc_image AS filebyte,
//         doctypename
//       FROM view_document_mas
//       LEFT JOIN aomk_applidoc_det
//         ON docid = num_applidoc_docid
//        AND num_applidoc_appliid = :applicationId
//       WHERE ulbid = :ulbId
//     `;

//     const result = await connection.execute(
//       query,
//       {
//         applicationId,
//         ulbId,
//       },
//       {
//         outFormat: oracledb.OUT_FORMAT_OBJECT,

//         fetchInfo: {
//           FILEBYTE: {
//             type: oracledb.BUFFER,
//           },
//         },
//       },
//     );

//     const rows = result.rows || [];

//     // --------------------------------------------------------
//     // Convert Document BLOB -> Base64
//     // --------------------------------------------------------
//     for (const row of rows) {
//       if (Buffer.isBuffer(row.FILEBYTE) && row.FILEBYTE.length > 0) {
//         row.filebyte = row.FILEBYTE.toString("base64");
//       } else {
//         row.filebyte = null;
//       }

//       delete row.FILEBYTE;
//     }

//     return rows;
//   } catch (error) {
//     console.error("GET APPLICATION DOCUMENT DETAILS REPO ERROR:", error);

//     throw error;
//   } finally {
//     if (connection) {
//       try {
//         await connection.close();
//       } catch (error) {
//         console.error("ERROR CLOSING ANCL CONNECTION:", error);
//       }
//     }
//   }
// };

// ============================================================
// APPLICATION ENTRY
// ============================================================
const applicationEntryRepo = async (data) => {
  try {
    const fromDate = data.fromDate ? new Date(`${data.fromDate}T00:00:00`) : null;
    const toDate = data.toDate ? new Date(`${data.toDate}T00:00:00`) : null;
    console.log({data})
    const result = await withTxTMC(async (conn) => {
      const res = await conn.execute(
        `
        BEGIN
          market.aomk_appli_ins(
            :In_UserId,
            :In_Appid,
            :In_AppliNo,
            :In_Mode,
            :In_OldLicencNo,

            :In_ShopName,
            :In_PANNo,
            :In_ContactNo,
            :In_Email,
            :In_Address,
            :In_ZoneId,
            :In_WardId,
            :In_IsProd,
            :In_OwnSpace,
            :In_Agrmentwith,
            :In_Area,
            :In_IsCorpNOC,
            :In_BusStartYr,
            :In_ShopActNo,
            :In_foodlicno,
            :In_LicDays,

            :In_Applitrade_Str,
            :In_Applitradetype_Str,
            :In_Applidirector_Str,
            :In_Source,

            :In_ShopNameMar,
            :In_PlaceOwnerName,
            :In_PlaceOwnerAddress,

            :In_FromDate,
            :In_ToDate,
            :in_amount,
            :in_lictype,
            :In_OrgId,
            :in_ipaddr,
            :in_licensetypeid,
            :in_arreasamt,
            :in_Servid,
            :in_CFCRecno,
            :in_PropNo,
            :in_MarketPropNo,

            :Out_Errorcode,
            :Out_Errormsg,
            :Out_Appid,
            :Out_AppliNo
          );
        END;
        `,
        {
          // ==================================================
          // INPUT PARAMETERS
          // ==================================================
          In_UserId: data.userId,
          In_Appid: data.appid,
          In_AppliNo: data.appliNo,
          In_Mode: data.mode,
          In_OldLicencNo: data.oldLicencNo || null,

          In_ShopName: data.shopName,
          In_PANNo: data.panNo,
          In_ContactNo: data.contactNo,
          In_Email: data.email && data.email.trim() !== "" ? data.email : null,
          In_Address: data.address,

          In_ZoneId: data.zoneId,
          In_WardId: data.wardId,
          In_IsProd: data.isProd,
          In_OwnSpace: data.ownSpace,
          In_Agrmentwith: data.agrmentWith,
          In_Area: data.area,
          In_IsCorpNOC: data.isCorpNOC,
          In_BusStartYr: data.busStartYr,
          In_ShopActNo: data.shopActNo && data.shopActNo.trim() !== "" ? data.shopActNo : null,
          In_foodlicno: data.foodlicno && data.foodlicno.trim() !== "" ? data.foodlicno : null,
          In_LicDays: data.licDays,

          In_Applitrade_Str: data.applitradeStr,
          In_Applitradetype_Str: data.applitradetypeStr,
          In_Applidirector_Str: data.applidirectorStr,
          In_Source: data.source,

          In_ShopNameMar: data.shopNameMar,
          In_PlaceOwnerName: data.placeOwnerName,
          In_PlaceOwnerAddress: data.placeOwnerAddress,

          In_FromDate: fromDate,
          In_ToDate: toDate,
          in_amount: data.amount,
          in_lictype: data.licType,
          In_OrgId: data.ulbId,
          in_ipaddr: data.ipAddress,
          in_licensetypeid: data.licenseTypeId,
          in_arreasamt: data.arrearsAmount,
          in_Servid: data.serviceId,
          in_CFCRecno: data.cfcRecno,
          in_PropNo: data.propNo,
          in_MarketPropNo: data.marketPropNo || "",

          // ==================================================
          // OUTPUT PARAMETERS
          // ==================================================
          Out_Errorcode: {
            dir: oracledb.BIND_OUT,
            type: oracledb.NUMBER,
          },
          Out_Errormsg: {
            dir: oracledb.BIND_OUT,
            type: oracledb.STRING,
            maxSize: 2000,
          },
          Out_Appid: {
            dir: oracledb.BIND_OUT,
            type: oracledb.NUMBER,
          },
          Out_AppliNo: {
            dir: oracledb.BIND_OUT,
            type: oracledb.STRING,
            maxSize: 2000,
          },
        },
      );

      console.log("applicationEntryRepo:", res);
      return res.outBinds;
    });

    console.log({result})

    return {
      success: true,
      errorCode: result.Out_Errorcode,
      errorMsg: result.Out_Errormsg,
      appid: result.Out_Appid,
      appliNo: result.Out_AppliNo,
    };
  } catch (err) {
    console.error("APPLICATION ENTRY REPO ERROR:", err);
    return {
      success: false,
      error: err.message,
    };
  }
};

// ============================================================
// UPDATE DIRECTOR IMAGE
// ============================================================
const updateDirectorImagesRepo = async (data) => {
  try {
    const result = await withTxTMC(async (conn) => {
      let updatedCount = 0;

      const directorIds = Array.isArray(data.directorIds) ? data.directorIds : [data.directorIds];

      for (let i = 0; i < data.files.length; i++) {
        const file = data.files[i];
        const directorId = directorIds[i];

        // Skip invalid file/director
        if (!directorId || !file || !file.buffer) {
          continue;
        }

        const query = `
           UPDATE market.aomk_applidirector_det
          SET blo_applitype_photo = :BlobDirectorImg
          WHERE num_applidirector_id = :directorId
            AND num_applidirector_appliid = :appid
        `;

        const result = await conn.execute(
          query,
          {
            BlobDirectorImg: {
              dir: oracledb.BIND_IN,
              type: oracledb.BLOB,
              val: file.buffer,
            },

            directorId: Number(directorId),
            appid: Number(data.appid),
          },
          {
            autoCommit: false,
          },
        );

        updatedCount += result.rowsAffected || 0;
      }

      return {
        updatedCount,
      };
    });

    return {
      success: true,
      updatedCount: result.updatedCount,
    };
  } catch (err) {
    console.error("UPDATE DIRECTOR IMAGES REPO ERROR:", err);

    return {
      success: false,
      error: err.message,
    };
  }
};
// DOCUMENT INSERT
// ============================================================
const documentInsertRepo = async (data) => {
  try {
    const result = await withTxTMC(async (conn) => {
      const sql = `
        INSERT INTO aorts_appdoc_det
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
          :corpId,
          :serviceId,
          :appNo,
          :docType,
          :documentId,
          :documentImage
        )
      `;

      const result = await conn.execute(
        sql,
        {
          corpId: data.corpId || 10001,

          serviceId: data.serviceId,

          appNo: data.appno,

          docType: data.doctype,

          documentId: data.documentid,

          documentImage: {
            dir: oracledb.BIND_IN,
            type: oracledb.BLOB,
            val: data.file.buffer,
          },
        },
        {
          autoCommit: false,
        },
      );

      return {
        rowsAffected: result.rowsAffected || 0,
      };
    });

    return {
      success: true,
      rowsAffected: result.rowsAffected,
    };
  } catch (err) {
    console.error("DOCUMENT INSERT REPO ERROR:", err);

    return {
      success: false,
      error: err.message,
    };
  }
};

// ============================================================
// GET EXISTING LICENSE DETAILS
// ============================================================
// const getExistingLicenseDetailsRepo = async (oldLicencNo, ulbId) => {
//   const query = `
//     SELECT
//       num_appli_id,
//       var_appli_applino,
//       var_appli_applidt,
//       var_appli_oldlicencno,
//       var_appli_shopname,
//       var_appli_panno,
//       num_appli_contactno,
//       var_appli_email,
//       var_appli_address,
//       num_appli_zoneid,
//       num_appli_wardid,
//       var_appli_isprod,
//       var_appli_ownspace,
//       var_appli_agrmentwith,
//       num_appli_area,
//       var_appli_iscorpnoc,
//       num_appli_busstartyr,
//       var_appli_shopactno,
//       var_appli_foodlicno,
//       num_appli_licdays,
//       var_appli_shopnamemar,
//       var_appli_placeownername,
//       var_appli_placeowneraddress,
//       dat_appli_fromdt,
//       dat_appli_todt,
//       NVL(num_appli_amount, 0) AS amount,
//       num_appli_licensetypeid
//     FROM aomk_appli_mas
//     WHERE var_appli_oldlicencno = :oldLicencNo
//       AND num_appli_ulbid = :ulbId
//     ORDER BY num_appli_id DESC
//   `;

//   const result = await executeQueryTMC(query, {
//     oldLicencNo,
//     ulbId,
//   });
//   console.log("getExistingLicenseDetailsRepo result :", result);
//   return result.rows || [];
// };

// ============================================================
// GET EXISTING LICENSE TRADE TYPE DETAILS
// ============================================================

// const getExistingLicenseTradeTypeDetailsRepo = async (applicationId, ulbId) => {
//   const query = `
//     SELECT
//       num_applitradetype_id,
//       num_applitradetype_appliid,
//       num_applitradetype_trdtypid,
//       NVL(num_applitrade_traderate, 0) AS Rate,
//       num_rate_tradetypename AS tradetype,
//       num_rate_id AS tradetypeid
//     FROM aomk_applitradetyp_det
//     INNER JOIN aomk_rate_mas
//       ON num_rate_id = num_applitradetype_trdtypid
//      AND num_rate_ulbid = num_applitradetyp_ulbid
//     WHERE num_applitradetype_appliid = :applicationId
//       AND num_applitradetyp_ulbid = :ulbId
//   `;

//   const result = await executeQueryTMC(query, {
//     applicationId,
//     ulbId,
//   });

//   console.log("getExistingLicenseTradeTypeDetailsRepo result :", result);

//   return result.rows || [];
// };

// ============================================================
// GET EXISTING LICENSE TRADE DETAILS
// ============================================================

// const getExistingLicenseTradeDetailsRepo = async (applicationId, ulbId) => {
//   const query = `
//     SELECT
//       num_applitrade_id,
//       num_applitrade_appliid,
//       num_applitrade_tradeid
//     FROM aomk_applitrade_det
//     WHERE num_applitrade_appliid = :applicationId
//       AND num_applitrade_ulbid = :ulbId
//   `;

//   const result = await executeQueryTMC(query, {
//     applicationId,
//     ulbId,
//   });

//   console.log("getExistingLicenseTradeDetailsRepo result :", result);

//   return result.rows || [];
// };

// ============================================================
// GET EXISTING LICENSE DIRECTOR DETAILS
// ============================================================

// const getExistingLicenseDirectorDetailsRepo = async (applicationId, ulbId) => {
//   let connection;

//   try {
//     connection = await getConnectionTMC();

//     const query = `
//       SELECT
//         num_applidirector_id AS directorId,
//         num_applidirector_aadhaarno AS adharno,
//         var_applidirector_name AS dirctorname,
//         Var_AppliDirector_VoterId AS VoterId,
//         num_applidirector_mobileno AS mobileno,
//         var_applidirector_emailid AS email,
//         var_applidirector_gender AS gender,
//         var_applidirector_address AS address,
//         num_applidirector_applitype AS applitypeid,
//         var_applitype_name AS applitypename,
//         blo_applitype_photo AS imgDirectorImage
//       FROM aomk_applidirector_det
//       INNER JOIN aomk_applitype_mas
//         ON num_applitype_id = num_applidirector_applitype
//        AND num_applidirector_ulbid = num_applitype_ulbid
//       WHERE num_applidirector_appliid = :applicationId
//         AND num_applidirector_ulbid = :ulbId
//     `;

//     const result = await connection.execute(
//       query,
//       {
//         applicationId,
//         ulbId,
//       },
//       {
//         outFormat: oracledb.OUT_FORMAT_OBJECT,

//         // Oracle BLOB -> Buffer
//         fetchInfo: {
//           IMGDIRECTORIMAGE: {
//             type: oracledb.BUFFER,
//           },
//         },
//       },
//     );

//     const rows = result.rows || [];
//     console.log("getExistingLicenseDirectorDetailsRepo result :", rows);

//     for (const row of rows) {
//       if (Buffer.isBuffer(row.IMGDIRECTORIMAGE) && row.IMGDIRECTORIMAGE.length > 0) {
//         row.imgDirectorImage = row.IMGDIRECTORIMAGE.toString("base64");
//       } else {
//         row.imgDirectorImage = null;
//       }

//       delete row.IMGDIRECTORIMAGE;
//     }

//     return rows;
//   } catch (error) {
//     console.error("GET EXISTING LICENSE DIRECTOR DETAILS ERROR:", error);

//     throw error;
//   } finally {
//     if (connection) {
//       try {
//         await connection.close();
//       } catch (error) {
//         console.error("ERROR CLOSING ANCL CONNECTION:", error.message);
//       }
//     }
//   }
// };

// ============================================================
// GET EXISTING LICENSE DOCUMENT DETAILS
// ============================================================

// const getExistingLicenseDocumentDetailsRepo = async (applicationId, ulbId) => {
//   let connection;

//   try {
//     connection = await getConnectionTMC();

//     const query = `
//       SELECT
//         docid AS primaryDocId,
//         num_applidoc_appliid AS AppliId,
//         docid AS docId,
//         var_applidoc_doctype AS FileType,
//         blo_applidoc_image AS filebyte,
//         doctypename
//       FROM view_document_mas
//       LEFT JOIN aomk_applidoc_det
//         ON docid = num_applidoc_docid
//        AND num_applidoc_appliid = :applicationId
//       WHERE ulbid = :ulbId
//     `;

//     const result = await connection.execute(
//       query,
//       {
//         applicationId,
//         ulbId,
//       },
//       {
//         outFormat: oracledb.OUT_FORMAT_OBJECT,

//         // Oracle BLOB -> Buffer
//         fetchInfo: {
//           FILEBYTE: {
//             type: oracledb.BUFFER,
//           },
//         },
//       },
//     );

//     const rows = result.rows || [];
//     console.log("getExistingLicenseDocumentDetailsRepo result :", rows);
//     for (const row of rows) {
//       if (Buffer.isBuffer(row.FILEBYTE) && row.FILEBYTE.length > 0) {
//         row.filebyte = row.FILEBYTE.toString("base64");
//       } else {
//         row.filebyte = null;
//       }

//       delete row.FILEBYTE;
//     }

//     return rows;
//   } catch (error) {
//     console.error("GET EXISTING LICENSE DOCUMENT DETAILS ERROR:", error);

//     throw error;
//   } finally {
//     if (connection) {
//       try {
//         await connection.close();
//       } catch (error) {
//         console.error("ERROR CLOSING ANCL CONNECTION:", error.message);
//       }
//     }
//   }
// };

// const checkLicenseCancelledRepo = async (oldLicencNo) => {
//   const query = `
//     SELECT COUNT(num_trade_id) AS id
//     FROM aomk_tradeservice_mas
//     WHERE var_trade_servicename = 'TLC'
//       AND var_trade_licenseno = :oldLicencNo
//   `;

//   const result = await executeQueryTMC(query, {
//     oldLicencNo,
//   });

//   return result.rows || [];
// };

// ============================================================
// GET TRADE TYPE RATES
// ============================================================
// const getTradTypesRatesRepo = async (tradeTypes, fromDate, toDate, ulbId) => {
//   const query = `
//     SELECT
//       num_rate_id,
//       SUM(num_rate_rate) AS tradType_rate
//     FROM aomk_rate_mas
//     WHERE num_rate_id IN (${tradeTypes})
//       AND (
//         TRUNC(dat_rate_fromdate) >= :fromDate
//         OR dat_rate_todate IS NULL
//       )
//       AND num_rate_ulbid = :ulbId
//     GROUP BY num_rate_id
//   `;

//   const result = await executeQueryTMC(query, {
//     fromDate,
//     ulbId,
//   });

//   return result.rows || [];
// };

// ============================================================
// GET TRADE TYPES BY CATEGORY
// ============================================================

// const getTradeTypesByCategoryRepo = async (categoryId, type) => {
//   const query = `
//     SELECT
//       var_tradetype_name,
//       num_categorytype_catgtypid
//     FROM aorts_categorytype_confg
//     INNER JOIN aorts_tradecategory_mas
//       ON num_tradecategory_id = num_categorytype_catgryid
//     INNER JOIN aorts_tradetypes_mas
//       ON num_tradetype_id = num_categorytype_catgtypid
//      AND aomk_tradetype_tradecategoryid = num_categorytype_catgryid
//     WHERE var_tradetype_flag = 'Y'
//       AND num_categorytype_catgryid = :categoryId
//       AND var_categorytype_type = :type
//   `;

//   const result = await executeQueryTMC(query, {
//     categoryId,
//     type,
//   });

//   return result.rows || [];
// };

// ============================================================
// GET TRADE CATEGORY BY JWALAN STATUS
// ============================================================
const getTradeCategoryByJwalanRepo = async (type) => {
  const query = `
     SELECT
      var_tradecategory_name,
      num_tradecategory_id
    FROM  market.aomk_tradecatconfig_mas
    INNER JOIN market.aomk_tradecategory_mas  
      ON num_tradecategory_id = num_tradecatconf_tradecatid
    WHERE var_tradecategory_flag = 'Y'
      AND num_tradecategory_id = :type
  `;

  const result = await executeQueryTMC(query, {
    type,
  });

  return result.rows || [];
};

const getZoneByWardRepo = async (wardId, ulbId) => {
  const query = `
      SELECT DISTINCT
      zonename,
      zoneid
    FROM prop.vw_zonemas
    WHERE wardid = :wardId
      AND ulbid = :ulbId
  `;

  const result = await executeQueryTMC(query, { wardId, ulbId });
  return result.rows || [];
};

// ============================================================
// GET EXISTING LICENSE DETAILS REPO (NEW)
// ============================================================
const getExistingLicenseDetailsRepo = async (oldLicencNo, ulbId) => {
  const query = `
   SELECT
      num_appli_id,
      var_appli_applino,
      var_appli_applidt,
      var_appli_oldlicencno,
      var_appli_shopname,
      var_appli_panno,
      num_appli_contactno,
      var_appli_email,
      var_appli_address,
      num_appli_zoneid,
      num_appli_wardid,
      var_appli_isprod,
      var_appli_ownspace,
      var_appli_agrmentwith,
      num_appli_area,
      var_appli_iscorpnoc,
      num_appli_busstartyr,
      var_appli_shopactno,
      var_appli_foodlicno,
      num_appli_licdays,
      var_appli_shopnamemar,
      var_appli_placeownername,
      var_appli_placeowneraddress,
      dat_appli_fromdt,
      dat_appli_todt,
      NVL(num_appli_amount, 0) AS amount,
      num_appli_licensetypeid
    FROM market.aomk_appli_mas
    WHERE var_appli_oldlicencno = :oldLicencNo
      AND num_appli_ulbid = :ulbId
    ORDER BY num_appli_id DESC
  `;

  const result = await executeQueryTMC(query, { oldLicencNo, ulbId });
  return result.rows || [];
};

// ============================================================
// GET EXISTING LICENSE TRADE TYPE DETAILS REPO (NEW)
// ============================================================
const getExistingLicenseTradeTypeDetailsRepo = async (applicationId, ulbId) => {
  const query = `
    SELECT
      num_applitradetype_id,
      num_applitradetype_appliid,
      num_applitradetype_trdtypid,
      NVL(num_applitrade_traderate, 0) AS Rate,
      num_rate_tradetypename AS tradetype,
      num_rate_id AS tradetypeid
    FROM market.aomk_applitradetyp_det
    INNER JOIN market.aomk_rate_mas
      ON num_rate_id = num_applitradetype_trdtypid
     AND num_rate_ulbid = num_applitradetyp_ulbid
    WHERE num_applitradetype_appliid = :applicationId
      AND num_applitradetyp_ulbid = :ulbId
  `;

  const result = await executeQueryTMC(query, { applicationId, ulbId });
  return result.rows || [];
};

// ============================================================
// GET EXISTING LICENSE TRADE DETAILS REPO (NEW)
// ============================================================
const getExistingLicenseTradeDetailsRepo = async (applicationId, ulbId) => {
  const query = `
     SELECT
      num_applitrade_id,
      num_applitrade_appliid,
      num_applitrade_tradeid
    FROM market.aomk_applitrade_det
    WHERE num_applitrade_appliid = :applicationId
      AND num_applitrade_ulbid = :ulbId
  `;

  const result = await executeQueryTMC(query, { applicationId, ulbId });
  return result.rows || [];
};

// ============================================================
// GET EXISTING LICENSE DIRECTOR DETAILS REPO (NEW)
// ============================================================
const getExistingLicenseDirectorDetailsRepo = async (applicationId, ulbId) => {
  let connection;

  try {
    connection = await getConnectionTMC();

    const query = `
         SELECT
        num_applidirector_id AS directorId,
        num_applidirector_aadhaarno AS adharno,
        var_applidirector_name AS dirctorname,
        Var_AppliDirector_VoterId AS VoterId,
        num_applidirector_mobileno AS mobileno,
        var_applidirector_emailid AS email,
        var_applidirector_gender AS gender,
        var_applidirector_address AS address,
        num_applidirector_applitype AS applitypeid,
        var_applitype_name AS applitypename,
        blo_applitype_photo AS imgDirectorImage
      FROM market.aomk_applidirector_det
      INNER JOIN  market.aomk_applitype_mas
        ON num_applitype_id = num_applidirector_applitype
       AND num_applidirector_ulbid = num_applitype_ulbid
      WHERE num_applidirector_appliid = :applicationId
        AND num_applidirector_ulbid = :ulbId
    `;

    const result = await connection.execute(
      query,
      { applicationId, ulbId },
      {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
        fetchInfo: {
          IMGDIRECTORIMAGE: { type: oracledb.BUFFER },
        },
      },
    );

    const rows = result.rows || [];

    for (const row of rows) {
      if (Buffer.isBuffer(row.IMGDIRECTORIMAGE) && row.IMGDIRECTORIMAGE.length > 0) {
        row.imgDirectorImage = row.IMGDIRECTORIMAGE.toString("base64");
      } else {
        row.imgDirectorImage = null;
      }
      delete row.IMGDIRECTORIMAGE;
    }

    return rows;
  } catch (error) {
    console.error("GET EXISTING LICENSE DIRECTOR DETAILS ERROR:", error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (error) {
        console.error("ERROR CLOSING ANCL CONNECTION:", error.message);
      }
    }
  }
};

// ============================================================
// GET EXISTING LICENSE DOCUMENT DETAILS REPO (NEW)
// ============================================================
const getExistingLicenseDocumentDetailsRepo = async (applicationId, ulbId) => {
  let connection;

  try {
    connection = await getConnectionTMC();

    const query = `
      SELECT
        docid AS primaryDocId,
        num_applidoc_appliid AS AppliId,
        docid AS docId,
        var_applidoc_doctype AS FileType,
        blo_applidoc_image AS filebyte,
        doctypename
      FROM market.view_document_mas
      LEFT JOIN market.aomk_applidoc_det
        ON docid = num_applidoc_docid
       AND num_applidoc_appliid = :applicationId
      WHERE ulbid = :ulbId
    
    `;

    const result = await connection.execute(
      query,
      { applicationId, ulbId },
      {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
        fetchInfo: {
          FILEBYTE: { type: oracledb.BUFFER },
        },
      },
    );

    const rows = result.rows || [];

    for (const row of rows) {
      if (Buffer.isBuffer(row.FILEBYTE) && row.FILEBYTE.length > 0) {
        row.filebyte = row.FILEBYTE.toString("base64");
      } else {
        row.filebyte = null;
      }
      delete row.FILEBYTE;
    }

    return rows;
  } catch (error) {
    console.error("GET EXISTING LICENSE DOCUMENT DETAILS ERROR:", error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (error) {
        console.error("ERROR CLOSING ANCL CONNECTION:", error.message);
      }
    }
  }
};

// ============================================================
// CHECK LICENSE CANCELLED REPO (NEW)
// ============================================================
const checkLicenseCancelledRepo = async (oldLicencNo) => {
  const query = `
     SELECT COUNT(num_trade_id) AS id
    FROM market.aomk_tradeservice_mas
    WHERE var_trade_servicename = 'TLC'
      AND var_trade_licenseno = :oldLicencNo
  `;

  const result = await executeQueryTMC(query, { oldLicencNo });
  return result.rows || [];
};

module.exports = {
  getBusinessPlaceRepo,
  getJalanShilRepo,
  getIllegalTypeRepo,
  getApplicantTypeRepo,
  getWardRepo,
  getZoneByWardRepo, // NEW
  getLicenseTypeRepo,
  getTradeCategoryRepo,
  getTradeDetailsRepo,
  getDocumentDetailsRepo,
  getSelfDeclareDataRepo,
  getApplicationDetailsRepo,
  getExistingLicenseDetailsRepo, // NEW
  getExistingLicenseTradeTypeDetailsRepo, // NEW
  getExistingLicenseTradeDetailsRepo, // NEW
  getExistingLicenseDirectorDetailsRepo, // NEW
  getExistingLicenseDocumentDetailsRepo, // NEW
  checkLicenseCancelledRepo, // NEW
  applicationEntryRepo,
  updateDirectorImagesRepo,
  documentInsertRepo,
  getTradeCategoryByJwalanRepo,
};
