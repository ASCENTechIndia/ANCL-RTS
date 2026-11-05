const { executeQueryTMC } = require("../../../db/queryExecutor");
const { executeProcedureTMC } = require("../../../db/procedureExecutor");

const oracledb = require("oracledb");

async function getNOCPurposeList() {
  const query = `
    SELECT
      var_nocpurpose_id,
      var_nocpurpose_name
    FROM fire.aofr_nocpurpose_mas
  `;

  return await executeQueryTMC(query, {});
}

async function getWardList(ulbID) {
  let query = "";

  if (["1670", "4"].includes(String(ulbID))) {
    query = `
      SELECT
        var_ward_name,
        num_ward_id
      FROM prop.aoms_ward_mas
      WHERE num_ward_ulbid = :ulbID
        AND var_ward_activeflag = 'Y'
      ORDER BY num_ward_orderby
    `;
  } else if (String(ulbID) === "2") {
    query = `
      SELECT DISTINCT
        wardname,
        wardid
      FROM prop.vw_ward_mas
      WHERE ulbid = :ulbID
        AND wardid <> '1281'
      ORDER BY wardname
    `;
  } else {
    query = `
      SELECT DISTINCT
        wardname,
        wardid
      FROM prop.vw_ward_mas
      WHERE ulbid = :ulbID
      ORDER BY wardname
    `;
  }

  return await executeQueryTMC(query, { ulbID });
}

// 2. Get Usage Type
async function getUsageTypeList() {
  const query = `
    SELECT
      var_usagetype_name,
      num_usagetype_id
    FROM prop.aoms_usagetype_mas
    ORDER BY num_usagetype_id
  `;

  return await executeQueryTMC(query, {});
}

// 3. Get Construction Type
async function getConstructionTypeList() {
  const query = `
    SELECT
      var_consttype_name,
      num_consttype_id
    FROM prop.aoms_consttype_mas
    ORDER BY num_consttype_id
  `;

  return await executeQueryTMC(query, {});
}

// 4. Get User Mobile Number
async function getUserMobileNumber(userUniqueId, ulbID) {
  const query = `
    SELECT
      num_user_mobileno
    FROM aorts_user_def
    WHERE num_user_uniqueid = :userUniqueId
      AND num_user_ulbID = :ulbID
  `;

  return await executeQueryTMC(query, {
    userUniqueId,
    ulbID,
  });
}

// 5. Get Water Sewerage Type
async function getWaterSewerageTypeList() {
  const query = `
    SELECT
      var_wtsewarage_name,
      num_wtsewarage_id
    FROM aorts_watersewaragertype_def
  `;

  return await executeQueryTMC(query, {});
}

async function getPrefilledApplicantDetails(params) {
  const { corpId, serviceId, userId, ulbID, appNo } = params;

  let query = `
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
      a.NUM_APPLICANT_FIRENOCPURPOSEID,
      a.var_appl_appnotemp,
      a.var_bdother_certissuetype
    FROM view_applicant_infodet a
    WHERE a.num_appl_corpid = :corpId
      AND a.num_appl_serviceid = :serviceId
      AND a.var_appl_userid = :userId
      AND a.num_appl_ulbid = :ulbID
  `;

  const binds = {
    corpId,
    serviceId,
    userId,
    ulbID,
  };

  if (!appNo || String(appNo).trim() === "") {
    query += ` AND a.var_appl_appno IS NULL `;
  } else {
    query += ` AND a.var_appl_appno = :appNo `;
    binds.appNo = appNo;
  }

  return await executeQueryTMC(query, binds);
}

// 8. Insert New Tax Application
async function insertNewTaxApplication(params) {
  const {
    ulbID,
    corpId,
    serviceId,
    userId,
    firstName,
    firstNameM,
    middleName,
    middleNameM,
    lastName,
    lastNameM,
    mobileNo,
    aadharNo,
    email,
    address,
    addressM,
    purpose,
    purposeM,
    zoneId,
    wardNo,
    propertyNo,
    mode,
    propertyUsage,
    sellerName,
    transferToWhom,
    agreementDate,
    appNo,
    wtsewrgtypeid,
    nocpurposeid,
    regiNo,
    uniqueNo,
    appSource,
    deliveryFlag,
    oldstr,
  } = params;

  const sql = `
    BEGIN
      aorts_applicant_info_ins_new(
        :in_ulbid,
        :in_corpid,
        :in_serviceid,
        :in_userid,
        :in_firstname,
        :in_firstnameM,
        :in_middlename,
        :in_middlenameM,
        :in_lastname,
        :in_lastnameM,
        :in_mobileno,
        :in_adharno,
        :in_email,
        :in_address,
        :in_addressM,
        :in_purpose,
        :in_purposeM,
        :in_zoneid,
        :in_wardno,
        :in_propertyno,
        :in_mode,
        :in_PropertyUsage,
        :in_SellerName,
        :in_TransferToWhom,
        :in_AgreementDate,
        :in_AppNo,
        :in_wtsewrgtypeid,
        :in_nocpurposeid,
        :in_RegiNo,
        :in_UniqueNo,
        :in_appsource,
        :in_deliveryflag,
        :in_str,
        :out_AppNo,
        :out_errcode,
        :out_ErrMsg
      );
    END;
  `;

  const inputNumber = (value) => {
    if (value === null || value === undefined || value === "") {
      return {
        val: null,
        type: oracledb.NUMBER,
        dir: oracledb.BIND_IN,
      };
    }

    const num = Number(value);

    if (!Number.isFinite(num)) {
      throw new Error(`Invalid numeric bind value: ${value}`);
    }

    return {
      val: num,
      type: oracledb.NUMBER,
      dir: oracledb.BIND_IN,
    };
  };

  const inputString = (value) => ({
    val: value === null || value === undefined || value === "" ? null : String(value),
    type: oracledb.STRING,
    dir: oracledb.BIND_IN,
  });

  const inputDate = (value) => {
    if (!value) {
      return {
        val: null,
        type: oracledb.DB_TYPE_DATE,
        dir: oracledb.BIND_IN,
      };
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      throw new Error("Invalid Agreement Date");
    }

    return {
      val: date,
      type: oracledb.DB_TYPE_DATE,
      dir: oracledb.BIND_IN,
    };
  };

  const binds = {
    in_ulbid: inputNumber(ulbID),
    in_corpid: inputNumber(corpId),
    in_serviceid: inputNumber(serviceId),
    in_userid: inputNumber(userId),

    in_firstname: inputString(firstName),
    in_firstnameM: inputString(firstNameM),
    in_middlename: inputString(middleName),
    in_middlenameM: inputString(middleNameM),
    in_lastname: inputString(lastName),
    in_lastnameM: inputString(lastNameM),

    in_mobileno: inputNumber(mobileNo),
    in_adharno: inputString(aadharNo),
    in_email: inputString(email),
    in_address: inputString(address),
    in_addressM: inputString(addressM),
    in_purpose: inputString(purpose),
    in_purposeM: inputString(purposeM),

    in_zoneid: inputNumber(zoneId),
    in_wardno: inputNumber(wardNo),
    in_propertyno: inputString(propertyNo),
    in_mode: inputNumber(mode),
    in_PropertyUsage: inputNumber(propertyUsage),
    in_SellerName: inputString(sellerName),
    in_TransferToWhom: inputString(transferToWhom),
    in_AgreementDate: inputDate(agreementDate),
    in_AppNo: inputString(appNo),

    in_wtsewrgtypeid: inputNumber(wtsewrgtypeid),
    in_nocpurposeid: inputNumber(nocpurposeid),

    in_RegiNo: inputString(regiNo),
    in_UniqueNo: inputString(uniqueNo),
    in_appsource: inputString(appSource),
    in_deliveryflag: inputString(deliveryFlag),
    in_str: inputString(oldstr),

    out_AppNo: {
      dir: oracledb.BIND_OUT,
      type: oracledb.STRING,
      maxSize: 50,
    },

    out_errcode: {
      dir: oracledb.BIND_OUT,
      type: oracledb.NUMBER,
    },

    out_ErrMsg: {
      dir: oracledb.BIND_OUT,
      type: oracledb.STRING,
      maxSize: 500,
    },
  };

  const result = await executeProcedureTMC({ sql, binds });

  console.log("Result: ", result)

  if (!result.success) {
    throw new Error(result.error);
  }

  return result.outBinds;
}

// 9. Insert Karjat Module Application
async function insertKarjatModule(params) {
  const { userId, flag, requeststr, requestdtlsstr } = params;

  const sql = `
    BEGIN
      prop.aoms_AppliEnrty_karjat_ins(
        :in_UserId,
        :in_appliflag,
        :in_applidata,
        :in_applidtlsdata,
        :out_ErrorCode,
        :out_ErrorMsg,
        :out_str
      );
    END;
  `;

  const inputString = (value) => ({
    val: value === null || value === undefined ? "" : String(value),
    type: oracledb.STRING,
    dir: oracledb.BIND_IN,
  });

  const binds = {
    in_UserId: inputString(userId),
    in_appliflag: inputString(flag),
    in_applidata: inputString(requeststr),
    in_applidtlsdata: inputString(requestdtlsstr),

    out_ErrorCode: {
      dir: oracledb.BIND_OUT,
      type: oracledb.NUMBER,
    },

    out_ErrorMsg: {
      dir: oracledb.BIND_OUT,
      type: oracledb.STRING,
      maxSize: 500,
    },

    out_str: {
      dir: oracledb.BIND_OUT,
      type: oracledb.STRING,
      maxSize: 500,
    },
  };

  const result = await executeProcedureTMC({ sql, binds });

    console.log("Karjat Result: ", result)

  if (!result.success) {
    throw new Error(result.error);
  }

  return result.outBinds;
}

async function getCorporationCode(ulbID) {
  const sql = `
        SELECT var_corporation_code AS corporation_code
        FROM admins.aoma_corporation_mas
        WHERE 1=1
        AND num_corporation_id = :ulbID
    `;

  const binds = {
    ulbID: Number(ulbID),
  };

  const result = await executeQueryTMC(sql, binds);

  console.log("Corporation Query Result:", result);

  return result;
}

async function updateAMCNoDuesAmount({ appNo, payAmount, ulbID }) {
  const sql = `
        UPDATE aorts.aorts_application_det
        SET num_application_amount = :payAmount
        WHERE var_application_appno = :appNo
        AND num_application_ulbid = :ulbID
    `;

  const binds = {
    payAmount: Number(payAmount),
    appNo: String(appNo),
    ulbID: Number(ulbID),
  };

  return await executeQueryTMC(sql, binds);
}

async function getAMCNoDuesApplicationDetails({ appNo, serviceId, ulbID }) {
  const sql = `
        SELECT
            a.var_application_appno AS appno,
            b.var_application_propertyno AS propertyno,
            b.dat_application_insdate AS applidate,
            w.wardname AS wardname,
            a.num_application_amount AS amount
        FROM aorts_application_det a
        INNER JOIN aorts_applicant_infodet b
            ON b.var_appl_appno = a.var_application_appno
            AND b.num_appl_ulbid = a.num_application_ulbid
        INNER JOIN aorts_user_def c
            ON c.num_user_uniqueid = a.var_application_userid
        LEFT JOIN prop.vw_ward_mas w
            ON w.ulbid = a.num_application_ulbid
            AND w.wardid = a.num_application_zoneid
        WHERE a.var_application_appno = :appNo
        AND a.num_application_serviceid = :serviceId
        AND a.num_application_ulbid = :ulbID
        ORDER BY a.var_application_appno DESC
    `;

  const binds = {
    appNo: String(appNo),
    serviceId: Number(serviceId),
    ulbID: Number(ulbID),
  };

  return await executeQueryTMC(sql, binds);
}

async function searchBNDRecords({ serviceId, registrationNo, bndDate, fatherName, motherName }) {
  let sql = "";
  let conditions = ["1=1"];
  const binds = {};

  if (Number(serviceId) === 15) {
    sql = `
            SELECT
                uniqueno AS uniqueNo,
                num_death_regno AS regno,
                var_death_name AS name,
                CASE
                    WHEN var_death_gender = 'M' THEN 'Male'
                    ELSE 'Female'
                END AS gender,
                dat_death_deathdate AS BNDdate,
                var_death_monthername AS mothername,
                var_death_fathername AS fathername,
                num_death_noofcopies AS copies
            FROM birthdeath.aobd_death_def bd
            WHERE 1=1
        `;

    if (registrationNo) {
      conditions.push("num_death_regno = :registrationNo");
      binds.registrationNo = registrationNo;
    }

    if (bndDate) {
      conditions.push("TRUNC(dat_death_deathdate) = TO_DATE(:bndDate, 'YYYY-MM-DD')");
      binds.bndDate = bndDate;
    }

    if (fatherName) {
      conditions.push("var_death_fathername LIKE :fatherName");
      binds.fatherName = `%${fatherName}%`;
    }

    if (motherName) {
      conditions.push("var_death_monthername LIKE :motherName");
      binds.motherName = `%${motherName}%`;
    }
  } else if (Number(serviceId) === 14) {
    sql = `
            SELECT
                uniqueno AS uniqueNo,
                num_birth_regno AS regno,
                var_birth_name AS name,
                CASE
                    WHEN var_birth_gender = 'M' THEN 'Male'
                    ELSE 'Female'
                END AS gender,
                dat_birth_birthdate AS BNDdate,
                var_birth_monthername AS mothername,
                var_birth_fathername AS fathername,
                num_birth_noofcopies AS copies
            FROM birthdeath.aobd_birth_def bd
            WHERE 1=1
        `;

    if (registrationNo) {
      conditions.push("num_birth_regno = :registrationNo");
      binds.registrationNo = registrationNo;
    }

    if (bndDate) {
      conditions.push("TRUNC(dat_birth_birthdate) = TO_DATE(:bndDate, 'YYYY-MM-DD')");
      binds.bndDate = bndDate;
    }

    if (fatherName) {
      conditions.push("var_birth_fathername LIKE :fatherName");
      binds.fatherName = `%${fatherName}%`;
    }

    if (motherName) {
      conditions.push("var_birth_monthername LIKE :motherName");
      binds.motherName = `%${motherName}%`;
    }
  }

  sql += ` AND ${conditions.slice(1).join(" AND ")}`;

  return await executeQueryTMC(sql, binds);
}

module.exports = {
  getNOCPurposeList,
  getWardList,
  getUsageTypeList,
  getConstructionTypeList,
  getUserMobileNumber,
  getWaterSewerageTypeList,
  getPrefilledApplicantDetails,
  insertNewTaxApplication,
  insertKarjatModule,
  getCorporationCode,
  updateAMCNoDuesAmount,
  getAMCNoDuesApplicationDetails,
  executeProcedureTMC,
  searchBNDRecords
};
