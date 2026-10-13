const { executeQueryTMC } = require("../../../db/queryExecutor");
const { withTxTMC } = require("../../../db/tx");
const oracledb = require("oracledb");

// ============================================================
// GET USER PRABHAG LIST
// ============================================================
const getUserPrabhagListRepo = async (userId) => {
  try {
    const query = `
      SELECT
        RTRIM(
          LISTAGG(
            num_prabhguser_prabhagid || ','
          ) WITHIN GROUP (
            ORDER BY num_prabhguser_prabhagid
          ),
          ','
        ) AS dept
      FROM aorts_prabhguser_config
      WHERE VAR_PRABHGUSER_USERID = :userId
    `;

    const result = await executeQueryTMC(query, {
      userId,
    });

    return {
      success: true,
      prabhagList: result.rows?.[0]?.DEPT || "",
    };
  } catch (error) {
    console.error("GET USER PRABHAG LIST REPO ERROR:", error);

    return {
      success: false,
      error: error.message,
    };
  }
};

// ============================================================
// GET USER DEPARTMENT LIST
// ============================================================
const getUserDeptListRepo = async (userId) => {
  try {
    const query = `
      SELECT
        RTRIM(
          LISTAGG(
            num_deptuserconfig_deptid || ','
          ) WITHIN GROUP (
            ORDER BY num_deptuserconfig_deptid
          ),
          ','
        ) AS dept
      FROM aorts_deptuserconfig_mas
      WHERE var_deptuserconfig_userid = :userId
    `;

    const result = await executeQueryTMC(query, {
      userId,
    });

    return {
      success: true,
      deptList: result.rows?.[0]?.DEPT || "",
    };
  } catch (error) {
    console.error("GET USER DEPARTMENT LIST REPO ERROR:", error);

    return {
      success: false,
      error: error.message,
    };
  }
};

// ============================================================
// GET USER SECTOR LIST
// ============================================================
const getUserSectorListRepo = async (userId) => {
  try {
    const query = `
      SELECT
        RTRIM(
          LISTAGG(
            num_sector_sectorid || ','
          ) WITHIN GROUP (
            ORDER BY num_sector_sectorid
          ),
          ','
        ) AS sectorid
      FROM aorts_sector_config
      WHERE var_sector_userid = :userId
    `;

    const result = await executeQueryTMC(query, {
      userId,
    });

    return {
      success: true,
      sectorList: result.rows?.[0]?.SECTORID || "",
    };
  } catch (error) {
    console.error("GET USER SECTOR LIST REPO ERROR:", error);

    return {
      success: false,
      error: error.message,
    };
  }
};

// ============================================================
// GET APPLICATION AUTHORIZATION LIST
// ============================================================
const getApplicationAuthListRepo = async ({ userId, authMode, prabhagList, deptList, sectorList }) => {
  try {
    let query = `
      SELECT
        DEPTID,
        SERVICID,
        SERVICNAME,
        APLINO,
        APLIDT,
        APLINM,
        MOBNO,
        AADHARNO,
        EMAIL,
        ADDRESS,
        PROPERTYNO,
        ZONENAME,
        returnflag
      FROM vw_authservdtl
      WHERE 1 = 1
    `;

    const binds = {};

    // ========================================================
    // AUTH MODE CONDITIONS
    // ========================================================

    if (String(authMode) === "HODV") {
      query = `
        SELECT
          DEPTID,
          SERVICID,
          SERVICNAME,
          APLINO,
          APLIDT,
          APLINM,
          MOBNO,
          AADHARNO,
          EMAIL,
          ADDRESS,
          PROPERTYNO,
          ZONENAME,
          returnflag
        FROM vw_authservdtl
        WHERE 1 = 1
          AND SERVICID IN (460, 461, 41)
          AND hodveriyflag IS NULL
      `;
    } else if (String(authMode) === "CKV") {
      query += `
        AND CLERKAUTH IS NULL
        AND payflag = 'Y'
        AND status = 'CP'
      `;
    } else if (String(authMode) === "CK") {
      query += `
        AND CLERKAUTH IS NULL
        AND status IN ('NW', 'DL', 'VP')
      `;

      // Original .NET special condition
      if (deptList === "26") {
        query += `
          AND hodclerkid = :userId
          AND hodveriyflag = 'A'
        `;

        binds.userId = userId;
      }
    } else {
      query += `
        AND CLERKAUTH = 'CA'
        AND hoauth IS NULL
        AND status IN ('NW', 'DL', 'VP')
      `;
    }

    // ========================================================
    // PRABHAG FILTER
    // ========================================================

    // if (prabhagList) {
    //   query += `
    //     AND zoneid IN (${prabhagList})
    //   `;
    // }

    // ========================================================
    // DEPARTMENT FILTER
    // ========================================================

    if (deptList) {
      query += `
        AND DEPTID IN (${deptList})
      `;

      // ======================================================
      // SECTOR FILTER
      // ======================================================

      // if (String(authMode) !== "HODV") {
      //   if (sectorList) {
      //     query += `
      //       AND (
      //         DEPTID != 23
      //         OR sectorid IN (${sectorList})
      //       )
      //     `;
      //   }
      // }
    }

    console.log("================================================");
    console.log("APPLICATION AUTH LIST QUERY");
    console.log("================================================");
    console.log(query);
    console.log("BINDS:", binds);
    console.log("================================================");

    const result = await executeQueryTMC(query, binds);

    return {
      success: true,
      rows: result.rows || [],
      rowCount: result.rows?.length || 0,
    };
  } catch (error) {
    // console.error("GET APPLICATION AUTH LIST REPO ERROR:", error);

    return {
      success: false,
      error: error.message,
    };
  }
};

const getHodClerkListRepo = async ({ zoneId }) => {
  try {
    const query = `
      SELECT
        var_user_username AS username,
        num_user_userid AS userid
      FROM admins.aoma_user_def
      INNER JOIN aorts.aorts_deptuserconfig_mas
        ON var_deptuserconfig_userid = num_user_userid
       AND num_deptuserconfig_deptid = 26
      INNER JOIN aorts.aorts_prabhguser_config
        ON var_prabhguser_userid = num_user_userid
       AND num_prabhguser_prabhagid = :zoneId
    `;

    const result = await executeQueryTMC(query, {
      zoneId: Number(zoneId),
    });

    return {
      success: true,
      rows: result.rows || [],
      rowCount: result.rows?.length || 0,
    };
  } catch (error) {
    console.error("Repo: Get HOD Clerk List Error:", error);
    throw error;
  }
};

const convertLobToBase64 = async (value) => {
  if (!value) {
    return null;
  }

  // Normal value
  if (Buffer.isBuffer(value)) {
    return value.toString("base64");
  }

  // Oracle LOB
  if (typeof value.on === "function") {
    return await new Promise((resolve, reject) => {
      const chunks = [];

      value.on("data", (chunk) => {
        chunks.push(chunk);
      });

      value.on("end", () => {
        resolve(Buffer.concat(chunks).toString("base64"));
      });

      value.on("error", reject);
    });
  }

  return value;
};

const convertLobsInRows = async (rows) => {
  if (!rows || rows.length === 0) {
    return [];
  }

  return await Promise.all(
    rows.map(async (row) => {
      const convertedRow = { ...row };

      for (const key of Object.keys(convertedRow)) {
        const value = convertedRow[key];

        if (value && (Buffer.isBuffer(value) || typeof value.on === "function")) {
          convertedRow[key] = await convertLobToBase64(value);
        }
      }

      return convertedRow;
    }),
  );
};

const getApplicationDetailsRepo = async ({ serviceId, appNo }) => {
  const service = String(serviceId);

  let query;
  let binds = { appNo };

  switch (service) {
    // ---------------------------------------------------------
    // 24, 25
    // ---------------------------------------------------------
    case "24":
    case "25":
      query = `
        SELECT
          num_plumlicense_id,
          num_plumlicense_ulbid,
          rtsno,
          applilname,
          mobno,
          panno,
          email,
          appliaddhar,
          address
        FROM aorts.vw_plumlicensedetails
        WHERE rtsno = :appNo
      `;
      break;

    // ---------------------------------------------------------
    // 18
    // ---------------------------------------------------------
    case "18":
      query = `
        SELECT
          num_wtapplidetail_id,
          num_wtapplidetail_ulbid,
          rtsno,
          connno,
          applilname,
          mobno,
          email,
          appliaddhar,
          appliaddress,
          currname,
          newname
        FROM aorts.vw_wtapplidetail
        WHERE rtsno = :appNo
      `;
      break;

    // ---------------------------------------------------------
    // 141
    // ---------------------------------------------------------
    case "141":
      query = `
        SELECT
          num_applientry_id,
          num_applientry_ulbid,
          var_applientry_rtsno,
          applilname,
          mobno,
          email,
          appliaddhar,
          usagetype,
          connsize
        FROM aorts.vw_wtapplientry
        WHERE var_applientry_rtsno = :appNo
      `;
      break;

    // ---------------------------------------------------------
    // 341, 21, 22
    // ---------------------------------------------------------
    case "341":
    case "21":
    case "22":
      query = `
        SELECT
          num_wtreg_id,
          num_wtreg_servid,
          var_service_eng_name,
          var_wtreg_consno,
          num_wtreg_ulbid,
          var_wtreg_rtsno,
          applilname,
          mobno,
          email,
          appliaddhar,
          usagetype,
          connsize,
          conaddress,
          curconsize,
          zonename
        FROM aorts.vw_wtregisteinfodet
        WHERE var_wtreg_rtsno = :appNo
      `;
      break;

    // ---------------------------------------------------------
    // 161
    // ---------------------------------------------------------
    case "161":
      query = `
        SELECT
          num_wtreg_id,
          num_wtreg_servid,
          var_service_eng_name,
          var_wtreg_consno,
          num_wtreg_ulbid,
          var_wtreg_rtsno,
          var_wtregister_appliname applilname,
          var_wtregister_applimobile mobno,
          var_wtregister_appliemail email,
          var_wtregister_appliaddhar appliaddhar,
          var_usagetype_name usagetype,
          num_connsize_size connsize,
          var_wtregister_conaddresssrch conaddress,
          var_wtregister_curconsizesrch curconsizesrch,
          wardname zonename,
          var_wtregister_UsageTypenewsrch UsageTypenewsrch
        FROM aorts.aorts_wtregister_infodet
        LEFT JOIN water.aowt_usagetype_mas
          ON num_wtreg_usageid = num_usagetype_id
        LEFT JOIN water.aowt_connsize_mas
          ON num_connsize_id = num_wtreg_connsizeid
        INNER JOIN aorts.aorts_tmcservice_def
          ON num_service_serviceid = num_wtreg_servid
        INNER JOIN aorts.aorts_application_det
          ON var_application_appno = var_wtreg_rtsno
        INNER JOIN prop.vw_ward_mas
          ON wardid = num_application_zoneid
        WHERE var_wtreg_rtsno = :appNo
      `;
      break;

    // ---------------------------------------------------------
    // 501,502,503,504,505,146,304,509
    // ---------------------------------------------------------
    case "501":
    case "502":
    case "503":
    case "504":
    case "505":
    case "146":
    case "304":
    case "509":
      query = `
        SELECT
          ulbid,
          appli_id,
          applino,
          oldlicencno,
          shopnameeng,
          shopnamemar,
          panno,
          contactno,
          email,
          address,
          arreasamt,
          fromdt,
          todt,
          amount,
          tradetypename,
          isprod,
          ownspace,
          placeownername,
          placeowneraddress,
          agrmentwith,
          area,
          iscorpnoc,
          licensetype_name,
          busstartyr,
          shopactno,
          foodlicno,
          jalanshil_name,
          illegal_name,
          propno,
          trade_type,
          trdbusinesstype
        FROM aorts.vw_mktservice
        WHERE applino = :appNo
      `;
      break;

    // ---------------------------------------------------------
    // 302, 500
    // ---------------------------------------------------------
    case "302":
    case "500":
      query = `
        SELECT
          appno,
          ulbid,
          licenseno,
          applname,
          mobile,
          email,
          aadhar,
          propno,
          address,
          licowner,
          licensetype,
          licfromdt,
          lictodt,
          businame,
          busitype,
          busiaddress,
          busicatagory,
          businesstype,
          rate,
          gender,
          jalanshil_name,
          trade_type
        FROM aorts.vw_mktcategory
        WHERE appno = :appNo
      `;
      break;

    // ---------------------------------------------------------
    // 306, 308, 309, 508, 307
    // ---------------------------------------------------------
    case "306":
    case "308":
    case "309":
    case "508":
    case "307":
      query = `
        SELECT
          id,
          appno,
          ulbid,
          licenseno,
          applname,
          mobile,
          email,
          aadhar,
          propno,
          address,
          licowner,
          licensetype,
          licfromdt,
          lictodt,
          businame,
          busitype,
          busiaddress,
          gender,
          newbusiname,
          trade_type
        FROM aorts.vw_mktsecondary
        WHERE appno = :appNo
      `;
      break;

    // ---------------------------------------------------------
    // 311
    // ---------------------------------------------------------
    case "311":
      query = `
        SELECT
          appno,
          ulbid,
          licenseno,
          applname,
          mobile,
          email,
          aadhar,
          propno,
          address,
          licowner,
          licensetype,
          licfromdt,
          lictodt,
          businame,
          busitype,
          busiaddress,
          gender,
          remark,
          relation_name,
          trade_type
        FROM aorts.vw_mktExpire
        WHERE appno = :appNo
      `;
      break;

    // ---------------------------------------------------------
    // 310
    // ---------------------------------------------------------
    case "310":
      query = `
        SELECT
          id,
          appno,
          ulbid,
          licenseno,
          applname,
          mobile,
          email,
          aadhar,
          propno,
          address,
          licowner,
          licensetype,
          licfromdt,
          lictodt,
          businame,
          busitype,
          gender,
          newbusiname,
          busiaddress,
          relation,
          licensetype_name,
          jalanshil,
          adhikrutta,
          tradecategory,
          closedt,
          trade_type
        FROM aorts.vw_licensecancel
        WHERE appno = :appNo
      `;
      break;

    default:
      throw new Error(`Application details not configured for Service ID ${serviceId}`);
  }

  const rows = await withTxTMC(async (connection) => {
    const result = await connection.execute(query, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
      autoCommit: false,
    });

    return await convertLobsInRows(result.rows || []);
  });

  // ---------------------------------------------------------
  // Additional queries required by specific services
  // ---------------------------------------------------------

  if (["501", "502", "503", "504", "505", "146", "304", "509"].includes(service) && rows.length > 0) {
    const appId = rows[0].APPLI_ID;
    console.log("appId", appId);

    const directoryQuery = `
      SELECT
        APPLIDIRECTOR_ID,
        APPLIDIRECTOR_NAME,
        ADDRESS,
        MOBILENO,
        EMAILID,
        GENDER,
        APPLITYPE_NAME,
        AADHAARNO,
        PHOTO
      FROM aorts.vw_mktdirectory
      WHERE APPLIID = :appId
    `;

    const typeQuery = `
      SELECT
        APPLIID,
        TRADETYPECAT,
        TRADETYPE,
        RATE
      FROM aorts.vw_type
      WHERE APPLIID = :appId
    `;

    const tradeQuery = `
      SELECT
        APPLIID,
        TRADENAME
      FROM aorts.vw_trade
      WHERE APPLIID = :appId
    `;
    console.log("tradeQuery", tradeQuery);
    console.log("typeQuery", typeQuery);
    console.log("directoryQuery", directoryQuery);

    const additionalDetails = await withTxTMC(async (connection) => {
      const [directory, tradeSwarup, trade] = await Promise.all([
        connection.execute(
          directoryQuery,
          { appId },
          {
            outFormat: oracledb.OUT_FORMAT_OBJECT,
            autoCommit: false,
          },
        ),

        connection.execute(
          typeQuery,
          { appId },
          {
            outFormat: oracledb.OUT_FORMAT_OBJECT,
            autoCommit: false,
          },
        ),

        connection.execute(
          tradeQuery,
          { appId },
          {
            outFormat: oracledb.OUT_FORMAT_OBJECT,
            autoCommit: false,
          },
        ),
      ]);

      const directoryRows = await convertLobsInRows(directory.rows || []);

      const tradeSwarupRows = await convertLobsInRows(tradeSwarup.rows || []);

      const tradeRows = await convertLobsInRows(trade.rows || []);

      return {
        directory: directoryRows,
        tradeSwarup: tradeSwarupRows,
        trade: tradeRows,
      };
    });

    return {
      main: rows,
      directory: additionalDetails.directory,
      tradeSwarup: additionalDetails.tradeSwarup,
      trade: additionalDetails.trade,
    };
  }

  // ---------------------------------------------------------
  // 308 - CP Trade Name
  // ---------------------------------------------------------

  if (service === "308" && rows.length > 0) {
    const appId = rows[0].ID;

    const query1 = `
      SELECT
        APPID,
        OLDNAME,
        AADHAR,
        NEWNAME,
        GENDER,
        ADDRESS,
        APPLITYPE_NAME
      FROM aorts.vw_cptradename
      WHERE APPID = :appId
    `;

    const cpTradeName = await withTxTMC(async (connection) => {
      const result1 = await connection.execute(
        query1,
        { appId },
        {
          outFormat: oracledb.OUT_FORMAT_OBJECT,
          autoCommit: false,
        },
      );

      return await convertLobsInRows(result1.rows || []);
    });

    return {
      main: rows,
      cpTradeName,
    };
  }

  // ---------------------------------------------------------
  // 309 - Director
  // 508 - Transfer
  // ---------------------------------------------------------

  if ((service === "309" || service === "508") && rows.length > 0) {
    const appId = rows[0].ID;

    let query1;

    if (service === "309") {
      query1 = `
        SELECT
          APPLIID,
          TRADEDIRECTOR_ID,
          DIRECTOR_NAME,
          ADDRESS,
          MOBILENO,
          EMAILID,
          PHOTO,
          AADHAARNO,
          APPLITYPE_NAME,
          GENDER
        FROM aorts.vw_mktdirector
        WHERE APPLIID = :appId
      `;
    } else {
      query1 = `
        SELECT
          APPLIID,
          TRADEDIRECTOR_ID,
          DIRECTOR_NAME,
          ADDRESS,
          MOBILENO,
          EMAILID,
          PHOTO,
          AADHAARNO,
          APPLITYPE_NAME,
          GENDER,
          RELATION,
          APPLISTAT,
          NEWNAME
        FROM aorts.vw_mkttransfer
        WHERE APPLIID = :appId
      `;
    }

    const additionalDetails = await withTxTMC(async (connection) => {
      const result1 = await connection.execute(
        query1,
        { appId },
        {
          outFormat: oracledb.OUT_FORMAT_OBJECT,
          autoCommit: false,
        },
      );

      return await convertLobsInRows(result1.rows || []);
    });

    return {
      main: rows,
      additionalDetails,
    };
  }

  return {
    main: rows,
  };
};

const applicationAuthRepo = async ({ userId, applicationNo, status, reasonForReject, amount, mode, clerkId, tinyUrl }) => {
  try {
    const result = await withTxTMC(async (connection) => {
      const query = `
        BEGIN
          aorts_appliauththane_ins(
            :in_userid,
            :in_applicationno,
            :in_status,
            :in_ReasonForReject,
            :in_amount,
            :in_mode,
            :in_Clerkid,
            :in_tinyurl,
            :out_errcode,
            :out_ErrMsg
          );
        END;
      `;

      const getValueOrNull = (value) => {
        if (value === null || value === undefined || value === "") {
          return null;
        }
        return String(value);
      };

      const binds = {
        in_userid: String(userId || ""),
        in_applicationno: String(applicationNo || ""),
        in_status: String(status || ""),
        in_ReasonForReject: String(reasonForReject || ""),
        in_amount: Number(amount) || 0,
        in_mode: String(mode || ""),
        in_Clerkid: getValueOrNull(clerkId),
        in_tinyurl: getValueOrNull(tinyUrl),

        out_errcode: {
          dir: oracledb.BIND_OUT,
          type: oracledb.NUMBER,
        },

        out_ErrMsg: {
          dir: oracledb.BIND_OUT,
          type: oracledb.STRING,
          maxSize: 32767,
        },
      };

      console.log("================================================");
      console.log("APPLICATION AUTH PROCEDURE");
      console.log("================================================");
      console.log("Procedure: aorts_appliauth_ins");
      console.log("Binds:", {
        ...binds,
        in_Clerkid: binds.in_Clerkid,
        in_tinyurl: binds.in_tinyurl,
        out_errcode: "BIND_OUT",
        out_ErrMsg: "BIND_OUT",
      });
      console.log("================================================");

      const procedureResult = await connection.execute(query, binds, {
        autoCommit: false,
      });

      return procedureResult.outBinds;
    });

    console.log("APPLICATION AUTH PROCEDURE RESULT:", result);

    return {
      success: true,
      errorCode: result?.out_errcode,
      errorMsg: result?.out_ErrMsg,
    };
  } catch (error) {
    console.error("APPLICATION AUTH REPO ERROR:", error);

    return {
      success: false,
      errorCode: 1500,
      errorMsg: error.message,
    };
  }
};

const saveApplicationVerificationDocumentRepo = async ({ulbid, applino, userid, documents}) => {
  try {
    const result = await withTxTMC(async (connection) => {
      const deleteQuery = `
        DELETE FROM aorts_appverifdoc_det
        WHERE num_appVerifdoc_ulbid = :ulbid
          AND var_appVerifdoc_appliNo = :applino
          AND var_appVerifdoc_docname = 'CertificateORG'
      `;

      const deleteResult = await connection.execute(deleteQuery, {ulbid: String(ulbid), applino: String(applino)}, {autoCommit: false});
      const deletedRows = deleteResult.rowsAffected || 0;

      console.log("Existing CertificateORG documents deleted:",deletedRows);

      let insertedRows = 0;

      for (const document of documents) {
        const insertQuery = `
          INSERT INTO aorts_appverifdoc_det(num_appVerifdoc_ulbid, var_appVerifdoc_appliNo, var_appVerifdoc_docname, blob_appVerifdoc_documentimg, var_appVerifdoc_instby, dat_appVerifdoc_instdt)
          VALUES(:ulbid, :applino, :docname, :docbyte, :userid, SYSDATE)
        `;

        const insertResult = await connection.execute(insertQuery,
          {
            ulbid: String(ulbid),
            applino: String(applino),
            docname: document.docname,
            docbyte: {val: document.docbyte, type: oracledb.BLOB},
            userid: String(userid),
          },
          {
            autoCommit: false,
          }
        );

        insertedRows += insertResult.rowsAffected || 0;
        console.log(`Document ${document.originalname} inserted:`,insertResult.rowsAffected);
      }

      return {deletedRows, insertedRows,};
    });

    return {
      success: true,
      message: "Application verification documents saved successfully.",
      ...result,
    };
  } catch (error) {
    console.error("SAVE APPLICATION VERIFICATION DOCUMENT REPO ERROR:",error);
    return {
      success: false,
      error: error.message,
    };
  }
};

const getMenuDetailsRepo = async ({ serviceId, appNo, authMode }) => {
  try {
    return await withTxTMC(async (connection) => {
      // ---------------------------------------------------------
      // 1. APPLICATION DETAILS
      // ---------------------------------------------------------
      const applicationQuery = `
        SELECT
          SERVICID,
          SERVICNAME,
          APLINO,
          APLIDT,
          APLINM,
          MOBNO,
          AADHARNO,
          EMAIL,
          ADDRESS,
          PROPERTYNO,
          ZONENAME,
          AMOUNT,
          PURPOSE,
          CONS_NAME,
          METER_NAME,
          HODREMARK,
          HOAUTH,
          SECTOR_NAME,
          VILLAGE_NAME,
          LOCALITY,
          LANDMARK,
          PINCODE,
          REFNO,
          ZONEID
        FROM vw_authservdtl
        WHERE SERVICID = :serviceId
          AND APLINO = :appNo
      `;

      const applicationResult = await connection.execute(
        applicationQuery,
        {
          serviceId: Number(serviceId),
          appNo: appNo,
        },
        {
          outFormat: oracledb.OUT_FORMAT_OBJECT,
          autoCommit: false,
        },
      );

      const applicationRows = applicationResult.rows || [];

      if (applicationRows.length === 0) {
        return {
          success: false,
          status: "NOT_FOUND",
          message: "No record found",
          data: null,
        };
      }

      // ---------------------------------------------------------
      // 2. DOCUMENT DETAILS
      // ---------------------------------------------------------
      let documentQuery = `
        SELECT
          num_appdoc_documentid AS "docId",
          var_doc_engname AS "docName",
          var_doc_engname AS "filename",
          blob_appdoc_documentimg AS "fileBytes",
          '.PDF' AS "fileExtension",
          'Citizen' AS "docType",
          CASE
            WHEN VAR_APPDOC_VRFYFLAG IS NULL THEN 'N'
            ELSE 'Y'
          END AS "vrfyFlag"
        FROM aorts_appdoc_det
        LEFT JOIN aorts_doc_def
          ON num_doc_serviceid = num_appdoc_serviceid
         AND num_appdoc_documentid = num_doc_id
        WHERE var_appdoc_appno = :appNo
      `;

      const documentBinds = {
        appNo: appNo,
      };

      // ---------------------------------------------------------
      // 3. HO DOCUMENTS
      // Legacy code adds Clerk documents only for HO mode
      // ---------------------------------------------------------
      if (String(authMode) === "HO" || String(authMode) === "CK") {
        documentQuery += `
          UNION ALL

          SELECT
            ROWNUM AS "docId",
            var_appverifdoc_docname AS "docName",
            var_appverifdoc_docname AS "filename",
            blob_appverifdoc_documentimg AS "fileBytes",
            '.pdf' AS "fileExtension",
            'Clerk' AS "docType",
            'Y' AS "vrfyFlag"
          FROM aorts_appverifdoc_det
          WHERE var_appverifdoc_applino = :appNo
        `;
      }

      const documentResult = await connection.execute(documentQuery, documentBinds, {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
        autoCommit: false,
      });

      const documentRows = documentResult.rows || [];

      // ---------------------------------------------------------
      // 4. CONVERT BLOB → BASE64 WHILE CONNECTION IS OPEN
      // ---------------------------------------------------------
      const documents = await convertLobsInRows(documentRows);

      return {
        success: true,
        status: "SUCCESS",
        message: "Menu details fetched successfully",
        data: {
          application: applicationRows[0],
          documents,
        },
      };
    });
  } catch (error) {
    console.error("Repo: Get Menu Details Error:", error);

    return {
      success: false,
      status: "FAILED",
      message: error.message,
    };
  }
};

const certificateDataRepo = async ({ userId, applino, serviceid, applidata }) => {
  try {
    const result = await withTxTMC(async (connection) => {
      const query = `
        BEGIN
          aorts_wtrcertificatedata_ins(
            :in_UserId,
            :in_applino,
            :in_serviceid,
            :in_applidata,
            :out_ErrorCode,
            :out_ErrorMsg
          );
        END;
      `;

      const binds = {
        in_UserId: String(userId || ""),
        in_applino: String(applino || ""),
        in_serviceid: String(serviceid || ""),
        in_applidata: String(applidata || ""),
        out_ErrorCode: {
          dir: oracledb.BIND_OUT,
          type: oracledb.NUMBER,
        },
        out_ErrorMsg: {
          dir: oracledb.BIND_OUT,
          type: oracledb.STRING,
          maxSize: 500,
        },
      };

      console.log("================================================");
      console.log("CERTIFICATE DATA PROCEDURE");
      console.log("================================================");
      console.log("Procedure: aorts_wtrcertificatedata_ins");
      console.log("Binds:", {
        in_UserId: binds.in_UserId,
        in_applino: binds.in_applino,
        in_serviceid: binds.in_serviceid,
        in_applidata: binds.in_applidata,
        out_ErrorCode: "BIND_OUT",
        out_ErrorMsg: "BIND_OUT",
      });
      console.log("================================================");

      const procedureResult = await connection.execute(query, binds, {
        autoCommit: false,
      });

      return procedureResult.outBinds;
    });

    console.log("CERTIFICATE DATA PROCEDURE RESULT:", result);

    return {
      success: true,
      errorCode: result?.out_ErrorCode,
      errorMsg: result?.out_ErrorMsg,
    };
  } catch (error) {
    console.error("CERTIFICATE DATA REPO ERROR:", error);

    return {
      success: false,
      errorCode: 1500,
      errorMsg: error.message,
    };
  }
};

const updateDocumentFlagRepo = async ({ appNo, docId }) => {
  try {
    const result = await withTxTMC(async (connection) => {
      const query = `
        UPDATE aorts_appdoc_det
        SET var_appdoc_vrfyflag = 'Y'
        WHERE var_appdoc_appno = :appNo
          AND num_appdoc_documentid = :docId
      `;

      const binds = {
        appNo: String(appNo),
        docId: Number(docId),
      };

      console.log("================================================");
      console.log("UPDATE DOCUMENT FLAG");
      console.log("================================================");
      console.log("Query:", query);
      console.log("Binds:", binds);
      console.log("================================================");

      const updateResult = await connection.execute(query, binds, {
        autoCommit: false,
      });

      console.log("Rows affected:", updateResult.rowsAffected);

      return {
        rowsAffected: updateResult.rowsAffected || 0,
      };
    });

    return {
      success: true,
      rowsAffected: result.rowsAffected,
      message: "Document flag updated successfully.",
    };
  } catch (error) {
    console.error("UPDATE DOCUMENT FLAG REPO ERROR:", error);

    return {
      success: false,
      error: error.message,
    };
  }
};

const getCertificateDataRepo = async ({ serviceId, appNo }) => {
  try {
    return await withTxTMC(async (connection) => {
      let query = "";
      let binds = {
        appNo: appNo,
      };

      switch (String(serviceId)) {
        // =====================================================
        // 22 - Change In Usage
        // =====================================================
        case "22":
          query = `
            SELECT
              REGID,
              SERVID,
              CONSNO,
              DISCONNID,
              REASON,
              USAGEID,
              TARIFRATE,
              CONNSIZEID,
              WTREMARK,
              INSBY,
              INSDT,
              RTSNO,
              ULBID,
              APPLISTATUS,
              APPLIAPPRSTATUS,
              APPLIAPPRREMARK,
              APPLIAPPRBY,
              APPLIAPPRDATE,
              DOCSTATUS,
              DOCREMARK,
              DOCBY,
              DOCDATE,
              APPLINAME,
              APPLIMOBILE,
              APPLIEMAIL,
              APPLIADDHAR,
              APPLIADDRESS,
              CONADDRESSSRCH,
              OWNERNAMESRCH,
              CURCONSIZESRCH,
              USAGETYPENEWSRCH,
              ERLDISDT,
              VISHAY,
              SANDHARBH,
              WATERUSAGE,
              CONNPLACE,
              HOUSENO,
              FAMCOUNT,
              APPLDATE,
              ACCPDATE,
              WATERTIMING,
              CONNRECONNDT,
              METERDT,
              SUBMETERDT,
              FULLNAME,
              METERCUTTINGDT,
              BECOUSE,
              REMMARK,
              USGNAME,
              OUTNO,
              AUTHDT,
              CONNSIZE,
              ZONENM
            FROM vw_watrconsize
            WHERE RTSNO = :appNo
          `;
          break;

        // =====================================================
        // 341 - Change In Connection Size
        // =====================================================
        case "341":
          query = `
            SELECT
              REGID,
              SERVID,
              CONSNO,
              DISCONNID,
              REASON,
              USAGEID,
              TARIFRATE,
              CONNSIZEID,
              WTREMARK,
              INSBY,
              INSDT,
              RTSNO,
              ULBID,
              APPLISTATUS,
              APPLIAPPRSTATUS,
              APPLIAPPRREMARK,
              APPLIAPPRBY,
              APPLIAPPRDATE,
              DOCSTATUS,
              DOCREMARK,
              DOCBY,
              DOCDATE,
              APPLINAME,
              APPLIMOBILE,
              APPLIEMAIL,
              APPLIADDHAR,
              APPLIADDRESS,
              CONADDRESSSRCH,
              OWNERNAMESRCH,
              CURCONSIZESRCH,
              USAGETYPENEWSRCH,
              ERLDISDT,
              VISHAY,
              SANDHARBH,
              WATERUSAGE,
              CONNPLACE,
              HOUSENO,
              FAMCOUNT,
              APPLDATE,
              ACCPDATE,
              WATERTIMING,
              CONNRECONNDT,
              METERDT,
              SUBMETERDT,
              FULLNAME,
              METERCUTTINGDT,
              BECOUSE,
              REMMARK,
              USGNAME,
              OUTNO,
              AUTHDT,
              CONNSIZE,
              ZONENM
            FROM vw_watrconsize
            WHERE RTSNO = :appNo
          `;
          break;

        // =====================================================
        // 18 - Change Owner
        // =====================================================
        case "18":
          query = `
            SELECT
              OUTNO,
              AUTHDT,
              ID,
              ULBID,
              CONNNO,
              APLINAME,
              MOBILENO,
              EMAIL,
              ADHARNO,
              PROPNO,
              RESINO,
              CURRONAME,
              CURRCONAME,
              NEWONAME,
              NEWCONAME,
              INSBY,
              INSDATE,
              RTSNO,
              APPLIAPPRSTATUS,
              APPLIAPPRREMARK,
              DOCSTATUS,
              DOCREMARK,
              APPLIAPPRBY,
              APPLIAPPRDATE,
              DOCDATE,
              DOCBY,
              APPLSTATUS,
              APPLINAME,
              APPLIMOBILE,
              APPLIEMAIL,
              APPLIADDHAR,
              APPLIADDRESS,
              VISHAY,
              SHANDHARB,
              METERTYPE,
              BCHOUSEHOLD,
              ACCEPTDATE
            FROM view_wtrchangownertyp
            WHERE RTSNO = :appNo
          `;
          break;

        // =====================================================
        // 21 - Water Reconnection
        // =====================================================
        case "21":
          query = `
            SELECT
              REGID,
              SERVID,
              CONSNO,
              DISCONNID,
              REASON,
              USAGEID,
              TARIFRATE,
              CONNSIZEID,
              WTREMARK,
              INSBY,
              INSDT,
              RTSNO,
              ULBID,
              APPLISTATUS,
              APPLIAPPRSTATUS,
              APPLIAPPRREMARK,
              APPLIAPPRBY,
              APPLIAPPRDATE,
              DOCSTATUS,
              DOCREMARK,
              DOCBY,
              DOCDATE,
              APPLINAME,
              APPLIMOBILE,
              APPLIEMAIL,
              APPLIADDHAR,
              APPLIADDRESS,
              CONADDRESSSRCH,
              OWNERNAMESRCH,
              CURCONSIZESRCH,
              USAGETYPENEWSRCH,
              ERLDISDT,
              VISHAY,
              SANDHARBH,
              WATERUSAGE,
              CONNPLACE,
              HOUSENO,
              FAMCOUNT,
              APPLDATE,
              ACCPDATE,
              WATERTIMING,
              CONNRECONNDT,
              METERDT,
              SUBMETERDT,
              FULLNAME,
              METERCUTTINGDT,
              BECOUSE,
              REMMARK,
              USGNAME,
              OUTNO,
              AUTHDT,
              CONNSIZE,
              ZONENM
            FROM vw_watrconsize
            WHERE RTSNO = :appNo
          `;
          break;

        // =====================================================
        // 24 - Water Plumber License
        // =====================================================
        case "24":
          query = `
            SELECT
              ID,
              RTSNO,
              APPLILNAME,
              MOBNO,
              PANNO,
              EMAIL,
              APPLIADDHAR,
              ADDRESS,
              LICENSENO,
              APPLICOL1,
              APPLICOL2,
              ACTPDT,
              OUTNO,
              AUTHDT
            FROM vw_wtrplmbr
            WHERE RTSNO = :appNo
          `;
          break;

        // =====================================================
        // 25
        // Legacy code has no certificate query
        // =====================================================
        case "25":
          return {
            success: true,
            status: "NO_TEMPLATE",
            message: "No certificate data query configured for service 25",
            data: [],
          };

        // =====================================================
        // 26 - Water No Dues Certificate
        // =====================================================
        case "26":
          query = `
            SELECT
              OUTNO,
              AUTHDATE,
              WTRCONNAME,
              MOBILENO,
              CUSTMADDRES,
              APPNO,
              VISHAY,
              HANDHARB,
              HOUSENO,
              WATERUSAGE,
              FMLYMEMCOUNT,
              APPLIEDDT,
              ACCEPTDT,
              CONNTYPE,
              WATERTIMING,
              METERNOWRKDT,
              METERWRKDT,
              DEPTVERF,
              DOCVALID,
              STATECOMB,
              CONNBROKEN,
              PUNTVACTION,
              SPLRIGHTPRESRE,
              OBSTRUCTIONTAP,
              GARBAGESTUCK,
              SUFFICIENTWTRSUPPLY,
              LOWWTRPRESRE,
              CUSTCHANNEL,
              CMPLTSTATUS,
              SMPLCOLLDT,
              SMPLTESTDT,
              METERTYPE,
              CHEMICALTEST,
              FREECHLORINE,
              PH,
              TURBIDITY,
              CHLORIDE,
              HARDNESS,
              PRABHAGID,
              PRABHAGNAME,
              ULBID,
              CONNECTIONNO
            FROM vw_wtrfaultymtrcomln
            WHERE APPNO = :appNo
          `;
          break;

        // =====================================================
        // 27 - Faulty Meter Complaint
        // =====================================================
        case "27":
          query = `
            SELECT
              OUTNO,
              AUTHDATE,
              WTRCONNAME,
              MOBILENO,
              CUSTMADDRES,
              APPNO,
              VISHAY,
              HANDHARB,
              HOUSENO,
              WATERUSAGE,
              FMLYMEMCOUNT,
              APPLIEDDT,
              ACCEPTDT,
              CONNTYPE,
              WATERTIMING,
              METERNOWRKDT,
              METERWRKDT,
              DEPTVERF,
              DOCVALID,
              STATECOMB,
              CONNBROKEN,
              PUNTVACTION,
              SPLRIGHTPRESRE,
              OBSTRUCTIONTAP,
              GARBAGESTUCK,
              SUFFICIENTWTRSUPPLY,
              LOWWTRPRESRE,
              CUSTCHANNEL,
              CMPLTSTATUS,
              SMPLCOLLDT,
              SMPLTESTDT,
              METERTYPE,
              CHEMICALTEST,
              FREECHLORINE,
              PH,
              TURBIDITY,
              CHLORIDE,
              HARDNESS,
              PRABHAGID,
              PRABHAGNAME,
              ULBID,
              CONNECTIONNO
            FROM vw_wtrfaultymtrcomln
            WHERE APPNO = :appNo
          `;
          break;

        // =====================================================
        // 28 - Unauthorized Connection Complaint
        // =====================================================
        case "28":
          query = `
            SELECT
              OUTNO,
              AUTHDATE,
              WTRCONNAME,
              MOBILENO,
              CUSTMADDRES,
              APPNO,
              VISHAY,
              HANDHARB,
              HOUSENO,
              WATERUSAGE,
              FMLYMEMCOUNT,
              APPLIEDDT,
              ACCEPTDT,
              CONNTYPE,
              WATERTIMING,
              METERNOWRKDT,
              METERWRKDT,
              DEPTVERF,
              DOCVALID,
              STATECOMB,
              CONNBROKEN,
              PUNTVACTION,
              SPLRIGHTPRESRE,
              OBSTRUCTIONTAP,
              GARBAGESTUCK,
              SUFFICIENTWTRSUPPLY,
              LOWWTRPRESRE,
              CUSTCHANNEL,
              CMPLTSTATUS,
              SMPLCOLLDT,
              SMPLTESTDT,
              METERTYPE,
              CHEMICALTEST,
              FREECHLORINE,
              PH,
              TURBIDITY,
              CHLORIDE,
              HARDNESS,
              PRABHAGID,
              PRABHAGNAME,
              ULBID,
              CONNECTIONNO
            FROM vw_wtrfaultymtrcomln
            WHERE APPNO = :appNo
          `;
          break;

        // =====================================================
        // 29 - Water Pressure Complaint
        // =====================================================
        case "29":
          query = `
            SELECT
              OUTNO,
              AUTHDATE,
              WTRCONNAME,
              MOBILENO,
              CUSTMADDRES,
              APPNO,
              VISHAY,
              HANDHARB,
              HOUSENO,
              WATERUSAGE,
              FMLYMEMCOUNT,
              APPLIEDDT,
              ACCEPTDT,
              CONNTYPE,
              WATERTIMING,
              METERNOWRKDT,
              METERWRKDT,
              DEPTVERF,
              DOCVALID,
              STATECOMB,
              CONNBROKEN,
              PUNTVACTION,
              SPLRIGHTPRESRE,
              OBSTRUCTIONTAP,
              GARBAGESTUCK,
              SUFFICIENTWTRSUPPLY,
              LOWWTRPRESRE,
              CUSTCHANNEL,
              CMPLTSTATUS,
              SMPLCOLLDT,
              SMPLTESTDT,
              METERTYPE,
              CHEMICALTEST,
              FREECHLORINE,
              PH,
              TURBIDITY,
              CHLORIDE,
              HARDNESS,
              PRABHAGID,
              PRABHAGNAME,
              ULBID,
              CONNECTIONNO
            FROM vw_wtrfaultymtrcomln
            WHERE APPNO = :appNo
          `;
          break;

        // =====================================================
        // 30 - Water Quality Complaint
        // =====================================================
        case "30":
          query = `
            SELECT
              OUTNO,
              AUTHDATE,
              WTRCONNAME,
              MOBILENO,
              CUSTMADDRES,
              APPNO,
              VISHAY,
              HANDHARB,
              HOUSENO,
              WATERUSAGE,
              FMLYMEMCOUNT,
              APPLIEDDT,
              ACCEPTDT,
              CONNTYPE,
              WATERTIMING,
              METERNOWRKDT,
              METERWRKDT,
              DEPTVERF,
              DOCVALID,
              STATECOMB,
              CONNBROKEN,
              PUNTVACTION,
              SPLRIGHTPRESRE,
              OBSTRUCTIONTAP,
              GARBAGESTUCK,
              SUFFICIENTWTRSUPPLY,
              LOWWTRPRESRE,
              CUSTCHANNEL,
              CMPLTSTATUS,
              SMPLCOLLDT,
              SMPLTESTDT,
              METERTYPE,
              CHEMICALTEST,
              FREECHLORINE,
              PH,
              TURBIDITY,
              CHLORIDE,
              HARDNESS,
              PRABHAGID,
              PRABHAGNAME,
              ULBID,
              CONNECTIONNO
            FROM vw_wtrfaultymtrcomln
            WHERE APPNO = :appNo
          `;
          break;

        // =====================================================
        // 161 - Temporary Disconnection
        // =====================================================
        case "161":
          query = `
            SELECT
              REGID,
              SERVID,
              CONSNO,
              DISCONNID,
              REASON,
              USAGEID,
              TARIFRATE,
              CONNSIZEID,
              WTREMARK,
              INSBY,
              INSDT,
              RTSNO,
              ULBID,
              APPLISTATUS,
              APPLIAPPRSTATUS,
              APPLIAPPRREMARK,
              APPLIAPPRBY,
              APPLIAPPRDATE,
              DOCSTATUS,
              DOCREMARK,
              DOCBY,
              DOCDATE,
              APPLINAME,
              APPLIMOBILE,
              APPLIEMAIL,
              APPLIADDHAR,
              APPLIADDRESS,
              CONADDRESSSRCH,
              OWNERNAMESRCH,
              CURCONSIZESRCH,
              USAGETYPENEWSRCH,
              ERLDISDT,
              VISHAY,
              SANDHARBH,
              WATERUSAGE,
              CONNPLACE,
              HOUSENO,
              FAMCOUNT,
              APPLDATE,
              ACCPDATE,
              WATERTIMING,
              CONNRECONNDT,
              METERDT,
              SUBMETERDT,
              FULLNAME,
              METERCUTTINGDT,
              BECOUSE,
              REMMARK,
              USGNAME,
              OUTNO,
              AUTHDT,
              CONNSIZE,
              ZONENM
            FROM vw_wtrtmpdisc
            WHERE RTSNO = :appNo
          `;
          break;

        // =====================================================
        // 23
        // Legacy code has no certificate query
        // =====================================================
        case "23":
          return {
            success: true,
            status: "NO_TEMPLATE",
            message: "No certificate data query configured for service 23",
            data: [],
          };

        // =====================================================
        // 141
        // Legacy code has no certificate query
        // =====================================================
        case "141":
          return {
            success: true,
            status: "NO_TEMPLATE",
            message: "No certificate data query configured for service 141",
            data: [],
          };

        // =====================================================
        // DEFAULT
        // =====================================================
        default:
          return {
            success: false,
            status: "INVALID_SERVICE",
            message: `Certificate data query not configured for service ID ${serviceId}`,
            data: [],
          };
      }

      // ---------------------------------------------------------
      // Execute query
      // ---------------------------------------------------------
      const result = await connection.execute(query, binds, {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
        autoCommit: false,
      });

      const rows = result.rows || [];
      console.log("result", rows);

      return {
        success: true,
        status: rows.length > 0 ? "SUCCESS" : "NOT_FOUND",
        message: rows.length > 0 ? "Certificate data fetched successfully" : "No record found for certificate",
        data: rows,
        rowCount: rows.length,
      };
    });
  } catch (error) {
    console.error("Repo: Get Certificate Data Error:", error);

    return {
      success: false,
      status: "FAILED",
      message: error.message,
      data: [],
    };
  }
};

const generateNocCertificateRepo = async ({ userId, ulbId, serviceId, appNo }) => {
  try {
    const result = await withTxTMC(async (connection) => {
      const query = `
        BEGIN
          AORTS_NOCCERTIFICATE_INS(
            :in_userid,
            :in_ulbid,
            :in_serviceid,
            :in_appno,
            :out_certificateno,
            :out_errcode,
            :out_errmsg
          );
        END;
      `;

      const binds = {
        in_userid: String(userId || ""),
        in_ulbid: Number(ulbId) || 0,
        in_serviceid: Number(serviceId) || 0,
        in_appno: String(appNo || ""),
        out_certificateno: {
          dir: oracledb.BIND_OUT,
          type: oracledb.STRING,
          maxSize: 100,
        },
        out_errcode: {
          dir: oracledb.BIND_OUT,
          type: oracledb.NUMBER,
        },
        out_errmsg: {
          dir: oracledb.BIND_OUT,
          type: oracledb.STRING,
          maxSize: 500,
        },
      };

      console.log("================================================");
      console.log("GENERATE NOC CERTIFICATE PROCEDURE");
      console.log("Procedure: AORTS_NOCCERTIFICATE_INS");
      console.log("Binds:", {
        in_userid: binds.in_userid,
        in_ulbid: binds.in_ulbid,
        in_serviceid: binds.in_serviceid,
        in_appno: binds.in_appno,
      });
      console.log("================================================");

      const procedureResult = await connection.execute(query, binds, {
        autoCommit: false,
      });

      return procedureResult.outBinds;
    });

    console.log("GENERATE NOC CERTIFICATE RESULT:", result);

    return {
      success: true,
      certificateNo: result?.out_certificateno,
      errorCode: result?.out_errcode,
      errorMsg: result?.out_errmsg,
    };
  } catch (error) {
    console.error("GENERATE NOC CERTIFICATE REPO ERROR:", error);

    return {
      success: false,
      errorCode: 1500,
      errorMsg: error.message,
    };
  }
};

module.exports = {
  getUserPrabhagListRepo,
  getUserDeptListRepo,
  getUserSectorListRepo,
  getApplicationAuthListRepo,
  getHodClerkListRepo,
  getApplicationDetailsRepo,
  applicationAuthRepo,
  saveApplicationVerificationDocumentRepo,
  getMenuDetailsRepo,
  certificateDataRepo,
  updateDocumentFlagRepo,
  getCertificateDataRepo,
  generateNocCertificateRepo
};
