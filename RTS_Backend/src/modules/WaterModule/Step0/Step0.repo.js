const { executeQueryTMC } = require("../../../db/queryExecutor");
const { executeProcedureTMC } = require("../../../db/procedureExecutor");
const oracledb = require("oracledb");

async function getNocPurposes() {
    return executeQueryTMC(`
    SELECT var_nocpurpose_id, var_nocpurpose_name
    FROM fire.aofr_nocpurpose_mas
  `);
}

async function getVillages(ulbId) {
    return executeQueryTMC(`
    SELECT var_village_name, num_village_uniqueid
    FROM aorts_village_mas
    WHERE num_village_ulbid = :ulbId
      AND var_village_flag = 'Y'
    ORDER BY var_village_name
  `, { ulbId: String(ulbId) });
}

async function getZones({ ulbId, serviceId }) {
    let query = `
    SELECT DISTINCT wardname, wardid
    FROM prop.vw_ward_mas
    WHERE ulbid = :ulbId
  `;

    if (String(ulbId) === "2") {
        query += ` AND wardid <> 1281 ORDER BY wardname`;
    } else if (["1070", "1850"].includes(String(ulbId))) {
        if (["374", "512"].includes(String(serviceId))) {
            query += ` AND wardid IN (2041, 2042, 2043) ORDER BY wardid`;
        } else {
            query += ` AND wardid NOT IN (2041, 2042, 2043) ORDER BY wardid`;
        }
    } else {
        query += ` ORDER BY wardname`;
    }

    return executeQueryTMC(query, { ulbId: String(ulbId) });
}

async function getUserMobile({ userId, ulbId }) {
    return executeQueryTMC(`
    SELECT num_user_mobileno
    FROM aorts_user_def
    WHERE num_user_uniqueid = :userId
      AND num_user_ulbid = :ulbId
  `, { userId: String(userId), ulbId: String(ulbId) });
}

async function getHoardingPlaces() {
    return executeQueryTMC(`
    SELECT num_hoardingplace_id, var_hoardingplace_name
    FROM aorts_hoardingplace_mas
    WHERE var_hoardingplace_flag = 'Y'
    ORDER BY var_hoardingplace_name
  `);
}

async function getHoardingTypes() {
    return executeQueryTMC(`
    SELECT num_hoardingtype_id, var_hoardingtype_name
    FROM aorts_hoardingtype_mas
    WHERE var_hoardingtype_flag = 'Y'
    ORDER BY var_hoardingtype_name
  `);
}

async function getWaterSewerageTypes() {
    return executeQueryTMC(`
    SELECT num_wtsewarage_id, var_wtsewarage_name
    FROM aorts_watersewaragertype_def
    ORDER BY var_wtsewarage_name
  `);
}

async function getPrefilledApplicant(params) {
    const { corpId, serviceId, userId, ulbId } = params;

    return executeQueryTMC(`
    SELECT
      a.num_appl_id,
      a.num_appl_corpid,
      a.num_appl_serviceid,
      a.var_appl_appno,
      a.var_appl_userid,
      a.var_appl_firstname,
      a.var_appl_mfirstname,
      a.var_appl_middlename,
      a.var_appl_mmiddlename,
      a.var_appl_lastname,
      a.var_appl_mlastname,
      a.var_appl_mobno,
      a.var_appl_aadharno,
      a.var_appl_email,
      a.var_appl_address,
      a.var_appl_maddress,
      a.var_appl_purpose,
      a.var_appl_mpurpose,
      a.var_applicant_uiqueno,
      a.dat_application_insdate,
      a.num_application_zoneid,
      a.num_application_wardno,
      a.var_application_propertyno,
      a.num_application_propertyusage AS propertyusage,
      a.var_application_sellername AS sellername,
      a.var_application_transfertowhom AS transfertowhom,
      a.dat_application_agreementdate AS agreementdate,
      a.num_applicant_wtsewrgtypeid,
      a.num_applicant_firenocpurposeid,
      a.var_appl_appnotemp,
      a.var_bdother_certissuetype
    FROM view_applicant_infodet a
    WHERE a.num_appl_corpid = :corpId
      AND a.num_appl_serviceid = :serviceId
      AND a.var_appl_userid = :userId
      AND a.num_appl_ulbid = :ulbId
  `, {
        corpId: String(corpId),
        serviceId: String(serviceId),
        userId: String(userId),
        ulbId: String(ulbId),
    });
}

function buildBirthDeathFilters({ registrationNo, eventDate, fatherName, motherName, }, dateColumn, registrationColumn, fatherColumn, motherColumn) {
    const conditions = [];
    const binds = {};

    if (registrationNo) {
        conditions.push(`${registrationColumn} = :registrationNo`);
        binds.registrationNo = String(registrationNo);
    }

    if (eventDate) {
        conditions.push(`${dateColumn} = TO_DATE(:eventDate, 'DD-MM-YYYY')`);
        binds.eventDate = String(eventDate);
    }

    if (fatherName) {
        conditions.push(`${fatherColumn} LIKE :fatherName`);
        binds.fatherName = `%${String(fatherName)}%`;
    }

    if (motherName) {
        conditions.push(`${motherColumn} LIKE :motherName`);
        binds.motherName = `%${String(motherName)}%`;
    }

    return { conditions, binds };
}

async function searchDeathDetails(params) {
    const { ulbId } = params;
    const { conditions, binds } = buildBirthDeathFilters(
        params,
        "dat_death_deathdate",
        "num_death_regno",
        "var_death_fathername",
        "var_death_monthername"
    );

    let query = `
    SELECT
      uniqueno AS "uniqueNo",
      num_death_regno AS regno,
      var_death_name AS name,
      CASE WHEN var_death_gender = 'M' THEN 'Male' ELSE 'Female' END AS gender,
      dat_death_deathdate AS "BNDdate",
      var_death_marmonthername AS mothername,
      var_death_marfathername AS fathername,
      num_death_noofcopies AS copies
    FROM birthdeath.aobd_death_def bd
    WHERE num_death_ulbid = :ulbId
  `;

    if (conditions.length) query += ` AND ${conditions.join(" AND ")}`;
    query += ` ORDER BY dat_death_deathdate DESC`;

    return executeQueryTMC(query, { ulbId: String(ulbId), ...binds });
}

async function searchBirthDetails(params) {
    const { ulbId } = params;
    const { conditions, binds } = buildBirthDeathFilters(
        params,
        "dat_birth_birthdate",
        "num_birth_regno",
        "var_birth_fathername",
        "var_birth_monthername"
    );

    let query = `
    SELECT
      uniqueno AS "uniqueNo",
      num_birth_regno AS regno,
      var_birth_name AS name,
      CASE WHEN var_birth_gender = 'M' THEN 'Male' ELSE 'Female' END AS gender,
      dat_birth_birthdate AS "BNDdate",
      var_birth_marmonthername AS mothername,
      var_birth_marfathername AS fathername,
      num_birth_noofcopies AS copies
    FROM birthdeath.aobd_birth_def bd
    WHERE num_birth_ulbid = :ulbId
  `;

    if (conditions.length) query += ` AND ${conditions.join(" AND ")}`;
    query += ` ORDER BY dat_birth_birthdate DESC`;

    return executeQueryTMC(query, { ulbId: String(ulbId), ...binds });
}

async function searchWaterConnection(connectionNo, ulbId) {
    return executeQueryTMC(`
    SELECT
      c.num_conn_ulbid,
      c.var_conn_connno AS connno,
      c.num_conn_bulituparea AS bulituparea,
      c.num_conn_connsizeid AS connsizeid,
      cs.connsizename AS connsizename,
      c.num_conn_connusageid AS connusageid,
      usg.usagetypename AS usagetypename,
      c.var_conn_ownername AS ownername,
      c.var_conn_address AS address,
      bd.payamt AS payamt
    FROM water.aowt_conn_mas c
    INNER JOIN water.vw_connsizeconfigmas cs
      ON cs.ulbid = c.num_conn_ulbid
      AND cs.connsizeid = c.num_conn_connsizeid
    INNER JOIN water.vw_usagetypemas usg
      ON usg.ulbid = c.num_conn_ulbid
      AND usg.usagetypeid = c.num_conn_connusageid
    LEFT JOIN water.view_billdemand bd
      ON bd.connid = c.num_conn_connid
      AND bd.ulbid = c.num_conn_ulbid
    WHERE c.var_conn_connno = :connectionNo
      AND c.num_conn_ulbid = :ulbId
  `, {
        connectionNo: String(connectionNo),
        ulbId: String(ulbId),
    });
}

// Standard applicant procedure: aorts_applicant_info_ins
async function insertApplicantInfo(params) {
    const sql = `
    BEGIN
      aorts_applicant_info_ins(
        :in_ulbid, :in_corpid, :in_serviceid, :in_userid,
        :in_firstname, :in_firstnameM, :in_middlename, :in_middlenameM,
        :in_lastname, :in_lastnameM, :in_mobileno, :in_adharno,
        :in_email, :in_address, :in_addressM, :in_purpose, :in_purposeM,
        :in_zoneid, :in_wardno, :in_propertyno, :in_mode,
        :in_PropertyUsage, :in_SellerName, :in_TransferToWhom,
        :in_AgreementDate, :in_AppNo, :in_wtsewrgtypeid, :in_nocpurposeid,
        :in_RegiNo, :in_UniqueNo, :in_appsource, :in_deliveryflag,
        :out_AppNo, :out_errcode, :out_ErrMsg
      );
    END;
  `;

    const binds = {
        in_ulbid: params.ulbId ? Number(params.ulbId) : null,
        in_corpid: params.corpId ? Number(params.corpId) : null,
        in_serviceid: params.serviceId ? Number(params.serviceId) : null,
        in_userid: params.userId ? Number(params.userId) : null,
        in_firstname: params.firstName || null,
        in_firstnameM: params.firstNameMr || params.firstNameMarathi || null,
        in_middlename: params.middleName || null,
        in_middlenameM: params.middleNameMr || params.middleNameMarathi || null,
        in_lastname: params.lastName || null,
        in_lastnameM: params.lastNameMr || params.lastNameMarathi || null,
        in_mobileno: params.mobileNo ? Number(params.mobileNo) : null,
        in_adharno: params.aadharNo || null,
        in_email: params.email || null,
        in_address: params.address || null,
        in_addressM: params.addressMr || params.addressMarathi || null,
        in_purpose: params.purpose || null,
        in_purposeM: params.purposeMr || params.purposeMarathi || null,
        in_zoneid: params.zoneId ? Number(params.zoneId) : null,
        in_wardno: params.wardNo ? Number(params.wardNo) : null,
        in_propertyno: params.propertyNo || null,
        in_mode: params.mode ? Number(params.mode) : null,
        in_PropertyUsage: params.propertyUsage ? Number(params.propertyUsage) : null,
        in_SellerName: params.sellerName || null,
        in_TransferToWhom: params.transferToWhom || null,
        in_AgreementDate: {
            val: params.agreementDate ? new Date(params.agreementDate) : null,
            type: oracledb.DATE,
            dir: oracledb.BIND_IN,
        },
        in_AppNo: params.appNo || null,
        in_wtsewrgtypeid: params.waterSewerageTypeId ? Number(params.waterSewerageTypeId) : null,
        in_nocpurposeid: params.nocPurposeId ? Number(params.nocPurposeId) : null,
        in_RegiNo: params.bndRegistrationNo || params.bndRegNo || params.registrationNo || null,
        in_UniqueNo: params.bndUniqueNo || params.uniqueNo || null,
        in_appsource: params.appSource || null,
        in_deliveryflag: params.deliveryFlag || "N",
        out_AppNo: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 500 },
        out_errcode: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        out_ErrMsg: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 4000 },
    };

    console.log("Calling Procedure: aorts_applicant_info_ins");
    return executeProcedureTMC({ sql, binds });
}

// Birth/Death applicant procedure: aorts_bndapplicant_ins
async function insertBndApplicantInfo(params) {
    const sql = `
    BEGIN
      aorts_bndapplicant_ins(
        :in_ulbid, :in_corpid, :in_serviceid, :in_userid,
        :in_firstname, :in_firstnameM, :in_middlename, :in_middlenameM,
        :in_lastname, :in_lastnameM, :in_mobileno, :in_adharno,
        :in_email, :in_address, :in_addressM, :in_purpose, :in_purposeM,
        :in_zoneid, :in_wardno, :in_propertyno, :in_mode,
        :in_PropertyUsage, :in_SellerName, :in_TransferToWhom,
        :in_AgreementDate, :in_AppNo, :in_wtsewrgtypeid, :in_nocpurposeid,
        :in_RegiNo, :in_UniqueNo, :in_appsource, :in_deliveryflag,
        :in_bndREGNO, :in_bndNAME, :in_bndGENDER, :in_bndDATE,
        :in_bndMNAME, :in_bndFNAME, :in_CERTISSUETYPE,
        :out_AppNo, :out_errcode, :out_ErrMsg
      );
    END;
  `;

    const binds = {
        in_ulbid: params.ulbId ? Number(params.ulbId) : null,
        in_corpid: params.corpId ? Number(params.corpId) : null,
        in_serviceid: params.serviceId ? Number(params.serviceId) : null,
        in_userid: params.userId ? Number(params.userId) : null,
        in_firstname: params.firstName || null,
        in_firstnameM: params.firstNameMr || params.firstNameMarathi || null,
        in_middlename: params.middleName || null,
        in_middlenameM: params.middleNameMr || params.middleNameMarathi || null,
        in_lastname: params.lastName || null,
        in_lastnameM: params.lastNameMr || params.lastNameMarathi || null,
        in_mobileno: params.mobileNo ? Number(params.mobileNo) : null,
        in_adharno: params.aadharNo || null,
        in_email: params.email || null,
        in_address: params.address || null,
        in_addressM: params.addressMr || params.addressMarathi || null,
        in_purpose: params.purpose || null,
        in_purposeM: params.purposeMr || params.purposeMarathi || null,
        in_zoneid: params.zoneId ? Number(params.zoneId) : null,
        in_wardno: params.wardNo ? Number(params.wardNo) : null,
        in_propertyno: params.propertyNo || null,
        in_mode: params.mode ? Number(params.mode) : null,
        in_PropertyUsage: params.propertyUsage ? Number(params.propertyUsage) : null,
        in_SellerName: params.sellerName || null,
        in_TransferToWhom: params.transferToWhom || null,
        in_AgreementDate: {
            val: params.agreementDate ? new Date(params.agreementDate) : null,
            type: oracledb.DATE,
            dir: oracledb.BIND_IN,
        },
        in_AppNo: params.appNo || null,
        in_wtsewrgtypeid: params.waterSewerageTypeId ? Number(params.waterSewerageTypeId) : null,
        in_nocpurposeid: params.nocPurposeId ? Number(params.nocPurposeId) : null,
        in_RegiNo: params.bndRegistrationNo || params.bndRegNo || params.registrationNo || null,
        in_UniqueNo: params.bndUniqueNo || params.uniqueNo || null,
        in_appsource: params.appSource || null,
        in_deliveryflag: params.deliveryFlag || "N",
        in_bndREGNO: params.bndREGNO || params.bndRegNo || params.bndRegistrationNo || params.registrationNo || null,
        in_bndNAME: params.bndNAME ?? params.bndName ?? null,
        in_bndGENDER: params.bndGENDER ?? params.bndGender ?? null,
        in_bndDATE: {
            val: params.bndDATE || params.bndDate ? new Date(params.bndDATE || params.bndDate) : null,
            type: oracledb.DATE,
            dir: oracledb.BIND_IN,
        },
        in_bndMNAME: params.bndMNAME ?? params.bndMotherName ?? null,
        in_bndFNAME: params.bndFNAME ?? params.bndFatherName ?? null,
        in_CERTISSUETYPE: params.CERTISSUETYPE || params.certificateType || null,
        out_AppNo: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 500 },
        out_errcode: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        out_ErrMsg: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 4000 },
    };

    console.log("Calling Procedure: aorts_bndapplicant_ins");
    return executeProcedureTMC({ sql, binds });
}

// Water applicant procedure: aorts_applicant_info_wtr_ins
async function insertWaterApplicantInfo(params) {
    const sql = `
    BEGIN
      aorts_applicant_info_wtr_ins(
        :in_ulbid, :in_corpid, :in_serviceid, :in_userid,
        :in_firstname, :in_firstnameM, :in_middlename, :in_mmiddlename,
        :in_lastname, :in_lastnameM, :in_mobileno, :in_adharno,
        :in_email, :in_address, :in_addressM, :in_purpose, :in_purposeM,
        :in_zoneid, :in_wardno, :in_propertyno, :in_mode,
        :in_PropertyUsage, :in_SellerName, :in_TransferToWhom,
        :in_AgreementDate, :in_AppNo, :in_wtsewrgtypeid, :in_nocpurposeid,
        :in_RegiNo, :in_UniqueNo, :in_appsource, :in_deliveryflag,
        :in_conno, :in_usagetyp, :in_consize, :in_buiduparea,
        :in_wtrownrname, :in_wtraddress,
        :out_AppNo, :out_errcode, :out_ErrMsg
      );
    END;
  `;

    const binds = {
        in_ulbid: params.ulbId ? Number(params.ulbId) : null,
        in_corpid: params.corpId ? Number(params.corpId) : null,
        in_serviceid: params.serviceId ? Number(params.serviceId) : null,
        in_userid: params.userId ? Number(params.userId) : null,
        in_firstname: params.firstName || null,
        in_firstnameM: params.firstNameMr || params.firstNameMarathi || null,
        in_middlename: params.middleName || null,
        in_middlenameM: params.middleNameMr || params.middleNameMarathi || null,
        in_lastname: params.lastName || null,
        in_lastnameM: params.lastNameMr || params.lastNameMarathi || null,
        in_mobileno: params.mobileNo ? Number(params.mobileNo) : null,
        in_adharno: params.aadharNo || null,
        in_email: params.email || null,
        in_address: params.address || null,
        in_addressM: params.addressMr || params.addressMarathi || null,
        in_purpose: params.purpose || null,
        in_purposeM: params.purposeMr || params.purposeMarathi || null,
        in_zoneid: params.zoneId ? Number(params.zoneId) : null,
        in_wardno: params.wardNo ? Number(params.wardNo) : null,
        in_propertyno: params.propertyNo || null,
        in_mode: params.mode ? Number(params.mode) : null,
        in_PropertyUsage: params.propertyUsage ? Number(params.propertyUsage) : null,
        in_SellerName: params.sellerName || null,
        in_TransferToWhom: params.transferToWhom || null,
        in_AgreementDate: {
            val: params.agreementDate ? new Date(params.agreementDate) : null,
            type: oracledb.DATE,
            dir: oracledb.BIND_IN,
        },
        in_AppNo: params.appNo || null,
        in_wtsewrgtypeid: params.waterSewerageTypeId ? Number(params.waterSewerageTypeId) : null,
        in_nocpurposeid: params.nocPurposeId ? Number(params.nocPurposeId) : null,
        in_RegiNo: params.bndRegistrationNo || params.bndRegNo || params.registrationNo || null,
        in_UniqueNo: params.bndUniqueNo || params.uniqueNo || null,
        in_appsource: params.appSource || null,
        in_deliveryflag: params.deliveryFlag || "N",
        in_conno: params.in_conno || params.connectionNo || null,
        in_usagetyp: params.in_usagetyp || params.usageType || null,
        in_consize: params.in_consize || params.connectionSize || null,
        in_buiduparea: params.in_buiduparea || params.builtUpArea || null,
        in_wtrownrname: params.in_wtrownrname || params.waterOwnerName || params.ownerName || null,
        in_wtraddress: params.in_wtraddress || params.waterAddress || null,
        out_AppNo: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 500 },
        out_errcode: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        out_ErrMsg: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 4000 },
    };

    console.log("Calling Procedure: aorts_applicant_info_wtr_ins");
    return executeProcedureTMC({ sql, binds });
}

async function insertImcApplication(params) {
    const {
        userId, serviceId, orgId, applicationNo, partPlanSize, tpScheme,
        village, sanctionedDP, ep, draftDP, rdbPartSize, mode,
    } = params;

    const sql = `
    BEGIN
      aorts_imcappli_ins(
        :In_Userid, :In_serviceid, :In_orgid, :In_applino,
        :In_partplansize, :In_TPScheme, :In_Village, :In_SanctionedDP,
        :In_EP, :In_DraftDP, :In_rdbpartsize, :in_mode,
        :Out_Errorcode, :Out_Errormsg
      );
    END;
  `;

    const binds = {
        In_Userid: userId == null ? null : String(userId),
        In_serviceid: serviceId === "" || serviceId == null ? null : Number(serviceId),
        In_orgid: orgId === "" || orgId == null ? null : Number(orgId),
        In_applino: applicationNo || null,
        In_partplansize: partPlanSize || null,
        In_TPScheme: tpScheme || null,
        In_Village: village || null,
        In_SanctionedDP: sanctionedDP || null,
        In_EP: ep || null,
        In_DraftDP: draftDP || null,
        In_rdbpartsize: rdbPartSize || null,
        in_mode: mode === "" || mode == null ? null : Number(mode),
        Out_Errorcode: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        Out_Errormsg: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 4000 },
    };

    return executeProcedureTMC({ sql, binds });
}

const insertPropertyApplicationDetails = async (params) => {
  const result = await executeProcedureTMC(
    `BEGIN
       prop.aoms_RTSAppliDetails_ins(
         :in_UserId,
         :in_appliflag,
         :in_applidata,
         :out_ErrorCode,
         :out_ErrorMsg,
         :out_str
       );
     END;`,
    {
      in_UserId: params.userId,
      in_appliflag: params.appliFlag,
      in_applidata: params.appliData,

      out_ErrorCode: {
        dir: oracledb.BIND_OUT,
        type: oracledb.NUMBER,
      },
      out_ErrorMsg: {
        dir: oracledb.BIND_OUT,
        type: oracledb.STRING,
        maxSize: 4000,
      },
      out_str: {
        dir: oracledb.BIND_OUT,
        type: oracledb.STRING,
        maxSize: 4000,
      },
    }
  );

  return result;
};

module.exports = {
    getNocPurposes,
    getVillages,
    getZones,
    getUserMobile,
    getHoardingPlaces,
    getHoardingTypes,
    getWaterSewerageTypes,
    getPrefilledApplicant,
    searchBirthDetails,
    searchDeathDetails,
    searchWaterConnection,
    insertApplicantInfo,
    insertBndApplicantInfo,
    insertWaterApplicantInfo,
    insertImcApplication,
    insertPropertyApplicationDetails
};