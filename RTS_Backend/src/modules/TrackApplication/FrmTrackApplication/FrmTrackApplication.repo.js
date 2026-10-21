const oracledb = require("oracledb");

const { executeQueryTMC } = require("../../../db/queryExecutor");
const {  getConnectionTMC } = require("../../../config/db");

// ============================================================
// GET APPLICATION DETAILS
// ============================================================
const getApplicationDetailsRepo = async (userId, ulbId) => {
  const query = `
    SELECT
      APPLID,
      ULBID,
      SERVICEID,
      SERVICNAME,
      APPNO,
      NAME,
      MOBNO,
      EMAIL,
      APLIDT,
      APPLISTATUS
    FROM view_trackingdtl
    WHERE USERID = :userId
      AND ULBID = :ulbId
    ORDER BY APLIDT DESC
  `;

  const result = await executeQueryTMC(query, {
    userId,
    ulbId,
  });

  return result.rows || [];
};

// ============================================================
// GET APPLICATION DOCUMENTS
// ============================================================
const getApplicationDocumentsRepo = async (applino) => {
  let connection;

  try {
    connection = await getConnectionTMC();

    const query = `
      SELECT
        ROWNUM AS docId,
        var_appverifdoc_applino AS applino,
        var_appverifdoc_docname AS docname,
        dat_appverifdoc_instdt AS docdate,
        blob_appverifdoc_documentimg AS filebytes
      FROM prop.aoms_appverifdoc_det
      WHERE var_appverifdoc_applino = :applino

      UNION ALL

      SELECT
        ROWNUM AS docId,
        var_appverifdoc_applino AS applino,
        var_appverifdoc_docname AS docname,
        dat_appverifdoc_instdt AS docdate,
        blob_appverifdoc_documentimg AS filebytes
      FROM aorts_appverifdoc_det
      WHERE var_appverifdoc_applino = :applino
        AND var_appverifdoc_docname NOT IN ('CertificateORG')
    `;

    const result = await connection.execute(
      query,
      {
        applino,
      },
      {
        outFormat: oracledb.OUT_FORMAT_OBJECT,

        // IMPORTANT:
        // Fetch Oracle BLOB as Buffer
        fetchInfo: {
          FILEBYTES: {
            type: oracledb.BUFFER,
          },
        },
      },
    );

    const rows = result.rows || [];

    // ========================================================
    // BUFFER -> BASE64
    // ========================================================
    for (const row of rows) {
      if (Buffer.isBuffer(row.FILEBYTES) && row.FILEBYTES.length > 0) {
        row.filebytes = row.FILEBYTES.toString("base64");
      } else {
        row.filebytes = null;
      }

      delete row.FILEBYTES;
    }

    return rows;
  } catch (error) {
    console.error("GET APPLICATION DOCUMENTS REPO ERROR:", error);

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

const getAppealDetailsRepo = async (appno) => {
  let connection;

  try {
    connection = await getConnectionTMC();

    // ----------------------------------------------------------
    // 1. CHECK APPLICATION APPEAL DAYS
    // ----------------------------------------------------------
    const applicationQuery = `
      SELECT
        var_appliaction_recieptno AS receiptno,

        (
          TRUNC(SYSDATE) -
          TRUNC(dat_application_recieptdate) +
          (
            SELECT COUNT(date_holiday_appealdt)
            FROM admins.aoma_holiday_mas
            WHERE TRUNC(date_holiday_appealdt)
              BETWEEN TRUNC(dat_application_recieptdate)
              AND TRUNC(SYSDATE)
          )
        ) AS appealday,

        num_service_maxdays AS maxdays,
        num_service_daysSecAppeal AS daysSecAppeal

      FROM aorts_application_det

      INNER JOIN aorts_tmcservice_def
        ON num_service_serviceid = num_application_serviceid

      WHERE var_appliaction_recieptno IS NOT NULL
        AND var_application_status IN ('NW', 'IP')
        AND var_application_appno = :appno
    `;

    const applicationResult = await connection.execute(
      applicationQuery,
      {
        appno,
      },
      {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
      },
    );

    const applicationRows = applicationResult.rows || [];

    // ----------------------------------------------------------
    // DEFAULT RESPONSE
    // ----------------------------------------------------------
    const response = {
      firstAppealAvailable: false,
      secondAppealAvailable: false,
      firstAppealExists: false,
      secondAppealExists: false,
    };

    if (applicationRows.length === 0) {
      return response;
    }

    const application = applicationRows[0];

    // ----------------------------------------------------------
    // CHECK WHETHER FIRST APPEAL CAN BE RAISED
    // ----------------------------------------------------------
    if (Number(application.APPEALDAY || 0) > Number(application.MAXDAYS || 0)) {
      response.firstAppealAvailable = true;

      // --------------------------------------------------------
      // 2. CHECK FIRST APPEAL
      // --------------------------------------------------------
      const firstAppealQuery = `
        SELECT
          dat_appeal_insdt AS insdt,

          (
            TRUNC(SYSDATE) -
            TRUNC(dat_appeal_insdt) +
            (
              SELECT COUNT(date_holiday_appealdt)
              FROM admins.aoma_holiday_mas
              WHERE TRUNC(date_holiday_appealdt)
                BETWEEN TRUNC(dat_appeal_insdt)
                AND TRUNC(SYSDATE)
            )
          ) AS daySecAppeal

        FROM aorts_appeal_mas

        WHERE var_appeal_applicationno = :appno
          AND num_appeal_refappealealtyp = '1'
      `;

      const firstAppealResult = await connection.execute(
        firstAppealQuery,
        {
          appno,
        },
        {
          outFormat: oracledb.OUT_FORMAT_OBJECT,
        },
      );

      const firstAppealRows = firstAppealResult.rows || [];

      // --------------------------------------------------------
      // FIRST APPEAL DOES NOT EXIST
      // --------------------------------------------------------
      if (firstAppealRows.length === 0) {
        response.firstAppealAvailable = true;
        response.secondAppealAvailable = false;

        return response;
      }

      response.firstAppealExists = true;

      const firstAppeal = firstAppealRows[0];

      // --------------------------------------------------------
      // CHECK WHETHER SECOND APPEAL CAN BE RAISED
      // --------------------------------------------------------
      if (Number(firstAppeal.DAYSECAPPEAL || 0) > Number(application.DAYSSECAPPEAL || 0)) {
        response.secondAppealAvailable = true;
      }

      // --------------------------------------------------------
      // 3. CHECK SECOND APPEAL
      // --------------------------------------------------------
      const secondAppealQuery = `
        SELECT
          dat_appeal_updt AS insdt,

          (
            TRUNC(SYSDATE) -
            TRUNC(dat_appeal_updt) +
            (
              SELECT COUNT(date_holiday_appealdt)
              FROM admins.aoma_holiday_mas
              WHERE TRUNC(date_holiday_appealdt)
                BETWEEN TRUNC(dat_appeal_updt)
                AND TRUNC(SYSDATE)
            )
          ) AS daySecAppeal

        FROM aorts_appeal_mas

        WHERE var_appeal_applicationno = :appno
          AND num_appeal_refappealealtyp = '2'
      `;

      const secondAppealResult = await connection.execute(
        secondAppealQuery,
        {
          appno,
        },
        {
          outFormat: oracledb.OUT_FORMAT_OBJECT,
        },
      );

      const secondAppealRows = secondAppealResult.rows || [];

      if (secondAppealRows.length > 0) {
        response.secondAppealExists = true;
        response.secondAppealAvailable = false;
      }
    }
    console.log("response", response);
    return response;
  } catch (error) {
    console.error("GET APPEAL DETAILS REPO ERROR:", error);

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
// GET APPLICATION CERTIFICATE DOCUMENT
// ============================================================

const getApplicationCertificateRepo = async (applino) => {
  let connection;

  try {
    connection = await getConnectionTMC();

    const query = `
      SELECT
        ROWNUM AS docId,
        var_appverifdoc_applino AS applino,
        var_appverifdoc_docname AS docname,
        blob_appverifdoc_documentimg AS fileBytes
      FROM aorts_appverifdoc_det
      WHERE var_appverifdoc_applino = :applino
        AND var_appverifdoc_docname = 'CertificateORG'
    `;

    const result = await connection.execute(
      query,
      {
        applino,
      },
      {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
        fetchInfo: {
          FILEBYTES: {
            type: oracledb.BUFFER,
          },
        },
      },
    );

    if (!result.rows || result.rows.length === 0) {
      return [];
    }

    const rows = result.rows.map((row) => ({
      docId: row.DOCID,
      applino: row.APPLINO,
      docname: row.DOCNAME,
      fileBytes: Buffer.isBuffer(row.FILEBYTES) ? row.FILEBYTES.toString("base64") : null,
    }));

    return rows;
  } catch (error) {
    console.error("GET APPLICATION CERTIFICATE REPO ERROR:", error);

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
// GET PAYMENT FLAG SERVICE IDS
// ============================================================
const getPaymentFlagRepo = async () => {
  const query = `
    SELECT
      RTRIM(
        LISTAGG(num_service_serviceid || ',')
        WITHIN GROUP(ORDER BY num_service_serviceid),
        ','
      ) AS L_DOCSERVICEID
    FROM aorts_tmcservice_def
    WHERE var_service_payflag = 'Y'
  `;

  const result = await executeQueryTMC(query);

  return result.rows || [];
};

// ============================================================
// CHECK PAYMENT
// ============================================================
const checkPaymentRepo = async (applino) => {
  const query = `
    SELECT
      var_application_status
    FROM aorts_application_det
    WHERE var_application_appno = :applino
  `;

  const result = await executeQueryTMC(query, {
    applino,
  });

  return result.rows || [];
};

// ============================================================
// GET APPLICATION DETAILS FOR PAYMENT
// ============================================================
const getApplicationPaymentDetailsRepo = async (applino, isDocVerifyService) => {
  let query;

  if (isDocVerifyService) {
    query = `
      SELECT
        var_appl_appno,
        var_service_eng_name,
        var_appl_email,
        CASE
          WHEN var_appl_mobno = '0' THEN NULL
          ELSE var_appl_mobno
        END AS mobno,
        var_appl_firstname,
        var_appl_address,
        num_application_amount AS rate
      FROM aorts_applicant_infodet
      INNER JOIN aorts_tmcservice_def
        ON num_service_serviceid = num_appl_serviceid
      INNER JOIN aorts_application_det
        ON var_application_appno = var_appl_appno
      WHERE var_appl_appno = :applino
    `;
  } else {
    query = `
      SELECT
        var_appl_appno,
        var_service_eng_name,
        var_appl_email,
        CASE
          WHEN var_appl_mobno = '0' THEN NULL
          ELSE var_appl_mobno
        END AS mobno,
        var_appl_firstname,
        var_appl_address,
        num_service_rate AS rate
      FROM aorts_applicant_infodet
      INNER JOIN aorts_tmcservice_def
        ON num_service_serviceid = num_appl_serviceid
      WHERE var_appl_appno = :applino
    `;
  }

  const result = await executeQueryTMC(query, {
    applino,
  });

  return result.rows || [];
};

// ============================================================
// GET APPLICATION STEPS / TRACKING DETAILS
// ============================================================
const getApplicationStepsRepo = async (ulbId, applino, serviceId) => {
  // ----------------------------------------------------------
  // 1. Application Steps
  // ----------------------------------------------------------
  const stepsQuery = `
    SELECT
      det.num_applitrack_ulbid AS ULBID,
      det.var_applitrack_applno AS APPNO,
      mas.num_applstage_id AS stageid,
      mas.var_applstage_name AS step,
      det.var_applitrack_remark AS description,
      det.dat_applitrack_insdt AS datetime,
      NVL(det.var_applitrack_status, 'Pending') AS status
    FROM aorts_applstage_mas mas
    LEFT JOIN aorts_applitracking_det det
      ON mas.num_applstage_id = det.num_applitrack_stageid
     AND det.var_applitrack_applno = :applino
     AND det.num_applitrack_ulbid = :ulbId
    ORDER BY mas.num_applstage_id
  `;

  const stepsResult = await executeQueryTMC(stepsQuery, {
    ulbId,
    applino,
  });

  // ----------------------------------------------------------
  // 2. Get Department ID
  // ----------------------------------------------------------
  const departmentQuery = `
    SELECT
      num_service_deptid AS departmentId
    FROM aorts_tmcservice_def
    WHERE num_service_serviceid = :serviceId
  `;

  const departmentResult = await executeQueryTMC(departmentQuery, {
    serviceId,
  });

  console.log("stepsResult", stepsResult);

  return {
    steps: stepsResult.rows || [],
    departmentId: departmentResult.rows && departmentResult.rows.length > 0 ? departmentResult.rows[0].DEPARTMENTID : null,
  };
};

// ============================================================
// GET CERTIFICATE DATA
// ============================================================
const getCertificateDataRepo = async (serviceId, appNo, ulbId) => {
  let query = "";

  // ============================================================
  // SERVICE ID = 2
  // ============================================================
  if (serviceId === "2") {
    query =
      " select var_service_eng_name || '/' || var_service_mar_name servid,zonename zoneid, wardname, case when var_propassess_subcode is not null then var_propassess_propno||'/'||var_propassess_subcode else var_propassess_propno end  propno,var_propassess_subcode subcode, ";
    query += " var_propassess_appno appno,var_propassess_landholder landholder,var_propassess_structholder structholder, ";
    query += " var_propassess_owndtls owndtls,var_propassess_address address,var_propassess_flatno flatno,var_propassess_structure structure, ";
    query += " num_propassess_usagetype usagetype,var_propassess_consttype consttype,num_propassess_area area,num_propassess_lettingrate lettingrate, ";
    query += " num_propassess_rate rate,num_propassess_yeartax yeartax,var_propassess_assessyr assessyr,var_propassess_appliname appliname, ";
    query += " num_propassess_applimob applimob,var_propassess_appliemail appliemail, dat_propassess_insdate appdate, dat_applitrack_insdt authdate, var_propassess_javakno outno from aorts_propassess_mas ";
    query += " inner join aorts_tmcservice_def on num_service_serviceid = num_propassess_servid ";
    query += " inner join prop.vw_zonemas on num_propassess_zoneid = zoneid inner join aorts_applitracking_det on var_applitrack_applno= var_propassess_appno and num_applitrack_stageid=3 ";
    query += " where var_propassess_appno = '" + appNo + "' and ulbid = '" + ulbId + "' ";
  }

  // ============================================================
  // SERVICE ID = 43 OR 289
  // ============================================================
  else if (serviceId === "43" || serviceId === "289") {
    query = " select var_service_eng_name || '/' || var_service_mar_name servid,zonename zoneid, wardname, var_newtaxasses_appno appno, ";
    query += " var_propassess_appliname appliname, dat_newtaxasses_insdate appdate, var_newtaxasses_appliadd address, dat_applitrack_insdt authdate, VAR_NEWTAXASSES_JAVAKNO outno ";
    query += " from aorts_newtaxasses_mas ";
    query += " inner join aorts_tmcservice_def on num_service_serviceid = num_newtaxasses_servid ";
    query += " inner join prop.vw_zonemas on num_newtaxasses_zoneid = zoneid INNER JOIN aorts_applitracking_det ON var_applitrack_applno = var_newtaxasses_appno ";
    query += " where var_newtaxasses_appno = '" + appNo + "' and ulbid = '" + ulbId + "' ";
  }

  // ============================================================
  // SERVICE ID = 56, 291, 51, 100, 44
  // ============================================================
  else if (serviceId === "56" || serviceId === "291" || serviceId === "51" || serviceId === "100" || serviceId === "44") {
    query = "select var_service_eng_name || '/' || var_service_mar_name servid,zonename zoneid, wardname, ";
    query += " var_noduescert_appno appno, var_noduescert_appliname appliname,dat_noduescert_insdate appdate, var_noduescert_address address, ";
    query +=
      " case when var_noduescert_subcode is not null then var_noduescert_propno||'/'||var_noduescert_subcode else var_noduescert_propno end  propno, var_noduescert_subcode subcode,var_noduescert_owndtls owndtls, NUM_NODUESCERT_YEARTAX YEARTAX, dat_applitrack_insdt authdate, var_noduescert_javakno outno ";
    query += " from aorts_noduescert_mas";
    query += " inner join aorts_tmcservice_def on num_service_serviceid = num_noduescert_servid";
    query += " inner join prop.vw_zonemas on num_noduescert_zoneid = zoneid inner join aorts_applitracking_det on var_applitrack_applno=var_noduescert_appno and num_applitrack_stageid=3 ";
    query += " where var_noduescert_appno = '" + appNo + "' and ulbid = '" + ulbId + "' ";
  }

  // ============================================================
  // SERVICE ID = 4 OR 5
  // ============================================================
  else if (serviceId === "4" || serviceId === "5") {
    query = " SELECT var_service_eng_name || '/' || var_service_mar_name servid, ";
    query += " zonename zoneid, wardname, case when var_proptrans_subcode is not null then var_propassess_propno||'/'||var_proptrans_subcode else var_propassess_propno end propno, ";
    query += " var_proptrans_subcode subcode, var_proptrans_appno appno, ";
    query += " var_proptrans_landholder landholder, dat_proptrans_insdate appdate, ";
    query += " var_proptrans_structowner strucholder, ";
    query += " var_proptrans_oldownname ownername, var_proptrans_occupname occupname, ";
    query += " var_proptrans_areaofprop areaofprop, ";
    query += " var_proptrans_legalstatus legalstatus, var_proptrans_proptype proptype, ";
    query += " var_proptrans_address address, var_transfertype_name transfertype, ";
    query += " var_proptrans_newownname newownname, dat_applitrack_insdt authdate, VAR_PROPTRANS_JAVAKNO outno ";
    query += " FROM aorts_proptrans_mas ";
    query += " INNER JOIN aorts_tmcservice_def ";
    query += " ON num_service_serviceid = num_proptrans_servid ";
    query += " INNER JOIN prop.vw_zonemas ON num_proptrans_zoneid = zoneid ";
    query += " INNER JOIN prop.aoms_transfertype_mas ";
    query += " ON num_transfertype_id = num_proptrans_transtype  inner join aorts_applitracking_det on var_applitrack_applno=var_proptrans_appno and num_applitrack_stageid=3 ";
    query += " WHERE var_proptrans_appno = '" + appNo + "' ";
    query += " AND ulbid = '" + ulbId + "' ";
  }

  // ============================================================
  // SERVICE ID = 287 OR 46
  // ============================================================
  else if (serviceId === "287" || serviceId === "46") {
    query = " SELECT var_service_eng_name || '/' || var_service_mar_name servid, ";
    query += " zonename zoneid, wardname,case when var_taxexemption_subcode is not null then var_taxexemption_propno||'/'||var_taxexemption_subcode else var_taxexemption_propno end propno, ";
    query += " var_taxexemption_subcode subcode, var_taxexemption_appno appno, ";
    query += " var_taxexemption_landholder landholder, ";
    query += " dat_taxexemption_insdate appdate, ";
    query += " var_taxexemption_strucholder strucholder, ";
    query += " var_taxexemption_ownername ownername, ";
    query += " var_rebatetype_name exemptiontype, dat_applitrack_insdt authdate, VAR_TAXEXEMPTION_JAVAKNO outno ";
    query += " FROM aorts_taxexemption_mas ";
    query += " INNER JOIN aorts_tmcservice_def ";
    query += " ON num_service_serviceid = num_taxexemption_servid ";
    query += " INNER JOIN prop.vw_zonemas ON num_taxexemption_zoneid = zoneid ";
    query += " LEFT JOIN aorts_rebatetype_mas ";
    query += " ON num_rebatetype_id = var_taxexemption_exemptiontype ";
    query += " INNER JOIN aorts_applitracking_det on var_applitrack_applno=var_taxexemption_appno and num_applitrack_stageid=3 ";
    query += " WHERE var_taxexemption_appno = '" + appNo + "' ";
    query += " AND ulbid = '" + ulbId + "' ";
  }

  // ============================================================
  // SERVICE ID = 290
  // ============================================================
  else if (serviceId === "290") {
    query = " SELECT var_service_eng_name || '/' || var_service_mar_name servid, ";
    query += " zonename zoneid, wardname, var_propappeal_appno appno,";
    query += " var_propappeal_appliname appliname, dat_propappeal_insdate appdate,";
    query += " var_propappeal_address address, dat_applitrack_insdt authdate, VAR_PROPAPPEAL_JAVAKNO outno FROM aorts_tmcpropertyappeal_mas";
    query += " INNER JOIN aorts_tmcservice_def ON num_service_serviceid = num_propappeal_servid";
    query += " INNER JOIN prop.vw_zonemas ON num_propappeal_zoneid = zoneid inner join aorts_applitracking_det on var_applitrack_applno=var_propappeal_appno and num_applitrack_stageid=3 ";
    query += " where var_propappeal_appno = '" + appNo + "' and ulbid = '" + ulbId + "' ";
  }

  // ============================================================
  // SERVICE ID = 341
  // ============================================================
  else if (serviceId === "341") {
    query = " select OUTNO, AUTHDATE, CUSTNAME, CUSTADDRESS, YOUR, CONTEXTDATE, CUSTNO, SIZEOFORIGIN, ";
    query += " VENUEADDRESS, HOUSEHOLD, WTRCONSUMTION, FAMILYNO, WTRCONNAGREMNTDT, APRVNODT,";
    query += " MDFYPLNSIZ, ADITNMDFYSIZEDT from vw_chnginconsize ";
    query += " where appno = '" + appNo + "' and ULBID = '" + ulbId + "' ";
  }

  // ============================================================
  // SERVICE ID = 18
  // ============================================================
  else if (serviceId === "18") {
    query = " select OUTNO, AUTHDATE, CUSTMNAME, CUSTMADDRESS, YOUR, YOURDT, CUSTNO, NAMEOGHOLDER, ";
    query += " METRSIZE, VENUADDRESEVNT, HOUSEHOLD, AMMENDEDHOLDRNM, AMENDEDTRNSFRDT ";
    query += " from vw_wtrchnginowner ";
    query += " where APPNO = '" + appNo + "' and ULBID = '" + ulbId + "' ";
  }

  // ============================================================
  // SERVICE ID = 22
  // ============================================================
  else if (serviceId === "22") {
    query = " select OUTNO, AUTHDATE, CUSTMNAME, CUSTMADDRESS, YOUR, YOURDT, CUSTNO, METRSIZE, ";
    query += " VENUADDRESEVNT, HOUSEHOLD, REVISECATEGORY, RVISEDCTEGYDT ";
    query += " from vw_wtrchnginusg ";
    query += " where APPNO = '" + appNo + "' and ULBID = '" + ulbId + "' ";
  }

  // ============================================================
  // SERVICE ID = 27
  // ============================================================
  else if (serviceId === "27") {
    query = " select OUTNO, AUTHDATE, WTRCONNAME, MOBILENO, CUSTMADDRES, COMLTADDRESS, HOUSENO, ";
    query += " PRABHAGNO, WTRCUNSUPTION, NUMBRFAMILY, CONNAGREEMNTNODT, CATNODT, FAUSENTCONSIZE, ";
    query += " TWNTYFOURHR, MTRFAILURDT, METRRPRDT from vw_wtrfaultymtrcomln ";
    query += " where APPNO = '" + appNo + "' and ULBID = '" + ulbId + "' ";
  }

  // ============================================================
  // SERVICE ID = 26
  // ============================================================
  else if (serviceId === "26") {
    query = " select OUTNO, AUTHDATE, CUSTNAME, CUSTADDRESS, WORDNO, HOUSENO, PROPNO, WTRBILNO, ";
    query += " WTRBILRECORD, MRCHONWTRBILL, SOCITYWTRBIL, FULAMTRECIPTNO, PRABHGSAMITI, ";
    query += " PRABHGSAMITIDT, OUTSTDBLNCE from vw_wtrnodusecerti ";
    query += " where APPNO = '" + appNo + "' and ULBID = '" + ulbId + "' ";
  }

  // ============================================================
  // SERVICE ID = 24
  // ============================================================
  else if (serviceId === "24") {
    query = " select APPNO, OUTNO, AUTHDATE, NAMEADRESS, PLUMBLICSENO, RENEWLPERD, RENEWLPERDFRMDT, ";
    query += " RENEWLPERDTODT, APLIEMILID, APLIHOUSENO, LASTDTOFVALIDITYDT ";
    query += " from vw_wtrplumberlicense ";
    query += " where APPNO = '" + appNo + "' and ULBID = '" + ulbId + "' ";
  }

  // ============================================================
  // SERVICE ID = 21
  // ============================================================
  else if (serviceId === "21") {
    query = " select OUTNO, AUTHDATE, WTRCONNHOLDRNM, MOBNO, PLACEOFCONN, COMPLTADDRESS, HOUSENO, ";
    query += " PRABHAGNO, WTRUSAGE, NOFAMILY, WTRCONNAGRMNTDT, APROVDT, FOCENTCONNSIZE, ";
    query += " TWENTYFORHRDAY, RECONCTINGWTRCONNDT, BECOUSE, RMRK from vw_wtrrconnection ";
    query += " where APPNO = '" + appNo + "' and ULBID = '" + ulbId + "' ";
  }

  // ============================================================
  // SERVICE ID = 161
  // ============================================================
  else if (serviceId === "161") {
    query = " select OUTNO, AUTHDATE, WTRCONNHOLDRNM, MOBNO, PLACEOFCONN, COMPLTADDRESS, HOUSENO, ";
    query += " PRABHAGNO, WTRUSAGE, NOFAMILY, WTRCONNAGRMNTDT, APROVDT, FOCENTCONNSIZE, ";
    query += " TWENTYFORHRDAY, WTRCONNDT, INSTLMETRCONNDT, SUBCONNDT, SUBCONNME, DATOFTAPCUTTING, BECAUSE, RMRK from vw_wtrtempermntdisconn ";
    query += " where APPNO = '" + appNo + "' and ULBID = '" + ulbId + "' ";
  }

  // ============================================================
  // SERVICE ID = 28
  // ============================================================
  else if (serviceId === "28") {
    query = " select OUTNO, AUTHDATE, APLINAMME, APLIADRESS, YOUR, YOURDT, DOCWEREFOUND, STATCOMBINTN, ";
    query += " CONNBORKEN, PUNNATIVACTION ";
    query += " from vw_wtrunauthconncomplnt ";
    query += " where APPNO = '" + appNo + "' and ULBID = '" + ulbId + "' ";
  }

  // ============================================================
  // SERVICE ID = 29
  // ============================================================
  else if (serviceId === "29") {
    query = " select OUTNO, AUTHDATE, APLINAMME, APLIADRESS, YOUR, YOURDT, PROPERPRESSUR, MAINTAPPING, ";
    query += " WESTSTUCKMETR, SUPLYBNK, LOWDUETOSUTDOWN, DISRIBUTIONCHANL, COMPLNRESOLVED ";
    query += " from vw_wtrpresurecomplnt ";
    query += " where APPNO = '" + appNo + "' and ULBID = '" + ulbId + "' ";
  }

  // ============================================================
  // SERVICE ID = 30
  // ============================================================
  else if (serviceId === "30") {
    query = " select OUTNO, AUTHDATE, APLINAMME, APLIADRESS, YOUR, YOURDT, WTRSMPLCONNDT, WTRSMPLTESTINCONNDT, ";
    query += " CUSTNO, METRSIZE, VENUADDRSSMITNG, APROPRITWTERSMPLE, INPROPERWTRSMPLE ";
    query += " from vw_wtrqualitycomplnt ";
    query += " where APPNO = '" + appNo + "' and ULBID = '" + ulbId + "' ";
  }

  else if (["515", "516", "517", "518", "519", "520", "521"].includes(serviceId)) {
    query = " SELECT var_nocappli_applno AS APPLNO, dat_application_recieptdate AS RECEIPTDATE, ";
    query += " var_appliaction_recieptno AS RECEIPTNO, var_nocappli_certno AS CERTIFICATENO, ";
    query += " var_nocappli_fname || ' ' || var_nocappli_mname || ' ' || var_nocappli_lname AS APPLINAME, ";
    query += " var_nocappli_address AS APPLIADDRESS, num_nocappli_mobileno AS APPLIMOBILE, ";
    query += " num_nocappli_serviceid AS SERVICEID, var_service_eng_name AS SERVICEENGNAME, ";
    query += " var_service_mar_name AS SERVICEMARNAME, var_service_shrt_name AS SERVICESHORTNAME, ";
    query += " var_nocappli_nocdetails AS NOCDETAILS, var_nocappli_nocaddress AS NOCADDRESS, ";
    query += " dt_nocappli_insdt AS NOCINSDATE, dat_application_recieptdate AS APPLICATIONDATE ";
    query += " FROM aorts_nocapplication_def ";
    query += " INNER JOIN aorts_application_det ON var_application_appno = var_nocappli_applno ";
    query += " INNER JOIN aorts_tmcservice_def ON num_service_serviceid = num_nocappli_serviceid ";
    query += " WHERE var_application_appno = '" + appNo + "' ";
    query += " AND num_service_serviceid = '" + serviceId + "' ";
    query += " AND num_nocappli_ulbid = '" + ulbId + "' ";
  }

  // ============================================================
  // NO QUERY FOR SERVICE
  // ============================================================
  else {
    return [];
  }

  // console.log("Certificate Data Query:", query);

  const result = await executeQueryTMC(query);
  console.log("SQL query: ", query);
  console.log("SQL result: ", result);

  return result.rows || [];
};

// ============================================================
// GET RE-APPLY SERVICE DETAILS
// ============================================================
const getReApplyServiceDetailsRepo = async (serviceId) => {
  const query = `
    SELECT
      var_service_url,
      num_service_rate,
      var_service_eng_name
    FROM aorts_tmcservice_def
    WHERE num_service_serviceid = :serviceId
  `;

  const result = await executeQueryTMC(query, {
    serviceId,
  });

  return result.rows || [];
};


// ============================================================
// INSERT CERTIFICATE INTO aorts_appliCert_det (Your Custom Table)
// Matches CertificateInsert in DOTNET but uses your table
// ============================================================
const insertCertificateDocRepo = async (applino, userId, pdfBuffer) => {
  let connection;
  
  try {
    connection = await getConnectionTMC();
    
    const query = `
      INSERT INTO aorts_appliCert_det (
        num_cert_id,
        var_cert_applino,
        var_cert_docname,
        blob_cert_document,
        dat_cert_insdt,
        var_cert_insby
      ) VALUES (
        SEQ_AORTS_APPLICERT_DET.NEXTVAL,
        :applino,
        'CertificateORG',
        :pdfBuffer,
        SYSDATE,
        :userId
      )
    `;
    
    const result = await connection.execute(
      query,
      {
        applino,
        pdfBuffer,
        userId,
      },
      {
        autoCommit: true,
      }
    );
    
    return {
      success: true,
      rowsAffected: result.rowsAffected || 0,
    };
  } catch (error) {
    console.error("INSERT CERTIFICATE DOC REPO ERROR:", error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("ERROR CLOSING CONNECTION:", err.message);
      }
    }
  }
};

// ============================================================
// UPDATE CERTIFICATE STATUS - Matches AppcertificateUpd in DOTNET
// Updates tracking status for Certificate Generated stage
// ============================================================
const updateCertificateStatusRepo = async (serviceId, applino, userId) => {
  let connection;
  
  try {
    connection = await getConnectionTMC();
    
    // Update tracking status for Certificate Generated stage (stageid = 4)
    const query = `
      UPDATE aorts_applitracking_det
      SET var_applitrack_status = 'Done',
          dat_applitrack_updt = SYSDATE,
          var_applitrack_updtby = :userId
      WHERE var_applitrack_applno = :applino
        AND num_applitrack_stageid = 4
    `;
    
    const result = await connection.execute(
      query,
      {
        applino,
        userId,
      },
      {
        autoCommit: true,
      }
    );
    
    return {
      success: true,
      rowsAffected: result.rowsAffected || 0,
    };
  } catch (error) {
    console.error("UPDATE CERTIFICATE STATUS REPO ERROR:", error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("ERROR CLOSING CONNECTION:", err.message);
      }
    }
  }
};

// ============================================================
// GET CERTIFICATE FROM aorts_appliCert_det (Your Custom Table)
// ============================================================
const getCertificateDocRepo = async (applino) => {
  let connection;
  
  try {
    connection = await getConnectionTMC();
    
    const query = `
      SELECT
        num_cert_id AS certId,
        var_cert_applino AS applino,
        var_cert_docname AS docname,
        blob_cert_document AS filebytes,
        dat_cert_insdt AS insdt
      FROM aorts_appliCert_det
      WHERE var_cert_applino = :applino
        AND var_cert_docname = 'CertificateORG'
      ORDER BY dat_cert_insdt DESC
    `;
    
    const result = await connection.execute(
      query,
      {
        applino,
      },
      {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
        fetchInfo: {
          FILEBYTES: {
            type: oracledb.BUFFER,
          },
        },
      }
    );
    
    const rows = result.rows || [];
    
    // Convert BLOB to base64 for JSON response
    for (const row of rows) {
      if (Buffer.isBuffer(row.FILEBYTES) && row.FILEBYTES.length > 0) {
        row.filebytes = row.FILEBYTES.toString("base64");
      } else {
        row.filebytes = null;
      }
      delete row.FILEBYTES;
    }
    
    return rows;
  } catch (error) {
    console.error("GET CERTIFICATE DOC REPO ERROR:", error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("ERROR CLOSING CONNECTION:", err.message);
      }
    }
  }
};

// ============================================================
// GET DOCUMENT BY ID - Matches btnView_Click in DOTNET
// Fetches from ALL document tables
// ============================================================
const getDocumentByIdRepo = async (docId) => {
  let connection;
  
  try {
    connection = await getConnectionTMC();
    
    const query = `
      SELECT * FROM (
        SELECT
          ROWNUM AS docId,
          var_appverifdoc_applino AS applino,
          var_appverifdoc_docname AS docname,
          blob_appverifdoc_documentimg AS filebytes
        FROM prop.aoms_appverifdoc_det
        
        UNION ALL
        
        SELECT
          ROWNUM AS docId,
          var_appverifdoc_applino AS applino,
          var_appverifdoc_docname AS docname,
          blob_appverifdoc_documentimg AS filebytes
        FROM aorts_appverifdoc_det
        
        UNION ALL
        
        SELECT
          ROWNUM AS docId,
          var_cert_applino AS applino,
          var_cert_docname AS docname,
          blob_cert_document AS filebytes
        FROM aorts_appliCert_det
      ) WHERE docId = :docId
    `;
    
    const result = await connection.execute(
      query,
      {
        docId: Number(docId),
      },
      {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
        fetchInfo: {
          FILEBYTES: {
            type: oracledb.BUFFER,
          },
        },
      }
    );
    
    const rows = result.rows || [];
    
    for (const row of rows) {
      if (Buffer.isBuffer(row.FILEBYTES) && row.FILEBYTES.length > 0) {
        row.filebytes = row.FILEBYTES.toString("base64");
      } else {
        row.filebytes = null;
      }
      delete row.FILEBYTES;
    }
    
    return rows;
  } catch (error) {
    console.error("GET DOCUMENT BY ID REPO ERROR:", error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("ERROR CLOSING CONNECTION:", err.message);
      }
    }
  }
};

module.exports = {
  getApplicationDetailsRepo,
  getApplicationDocumentsRepo,
  getAppealDetailsRepo,
  getApplicationCertificateRepo,
  getPaymentFlagRepo,
  checkPaymentRepo,
  getApplicationPaymentDetailsRepo,
  getApplicationStepsRepo,
  getCertificateDataRepo,
  getReApplyServiceDetailsRepo,
  insertCertificateDocRepo,
  updateCertificateStatusRepo,
  getCertificateDocRepo,
  getDocumentByIdRepo,
};
