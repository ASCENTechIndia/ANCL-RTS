const { executeQueryTMC } = require("../../../db/queryExecutor");
const { withTxTMC } = require("../../../db/tx");
const oracledb = require("oracledb");


const getServiceNameRepo = async ({ serviceId }) => {
    console.log("Repo: Fetch Service Name", { serviceId });

    const binds = {serviceId: Number(serviceId)};

    const sql = `
        SELECT
            var_service_eng_name
        FROM aorts_tmcservice_def
        WHERE num_service_serviceid = :serviceId
    `;

    const result = await executeQueryTMC(sql, binds);

    if (!result || !result.success) {
        throw new Error(
            result?.error || "Failed to fetch service name"
        );
    }

    return result.rows;
};


const getNocPurposeRepo = async () => {
    console.log("Repo: Fetch NOC Purpose");

    const sql = `
        SELECT
            var_nocpurpose_name,
            var_nocpurpose_id
        FROM aofr_nocpurpose_mas
        ORDER BY var_nocpurpose_name
    `;

    const result = await executeQueryTMC(sql);

    if (!result || !result.success) {
        throw new Error(
            result?.error || "Failed to fetch NOC purpose"
        );
    }

    return result.rows;
};


const getWardsRepo = async (  ) => {
    

    const sql = `
        SELECT DISTINCT
            zonename AS wardname,
            zoneid AS wardid
        FROM prop.vw_zonemas
        ORDER BY zonename
    `;

    const result = await executeQueryTMC(sql);

    if (!result || !result.success) {
        throw new Error(
            result?.error || "Failed to fetch wards"
        );
    }

    return result.rows;
};


const getUserMobileRepo = async ({
    userUniqueId,
    ulbid,
}) => {
    console.log("Repo: Fetch User Mobile", {
        userUniqueId,
        ulbid,
    });

    const binds = {
        userUniqueId: Number(userUniqueId),
        ulbid: Number(ulbid),
    };

    const sql = `
        SELECT
            num_user_mobileno
        FROM aorts_user_def
        WHERE num_user_uniqueid = :userUniqueId
          AND num_user_ulbid = :ulbid
    `;

    const result = await executeQueryTMC(sql, binds);

    if (!result || !result.success) {
        throw new Error(
            result?.error || "Failed to fetch user mobile number"
        );
    }

    return result.rows;
};


const getWaterSewerageTypesRepo = async () => {
    console.log("Repo: Fetch Water Sewerage Types");

    const sql = `
        SELECT
            var_wtsewarage_name,
            num_wtsewarage_id
        FROM aorts_watersewaragertype_def
        ORDER BY var_wtsewarage_name
    `;

    const result = await executeQueryTMC(sql);

    if (!result || !result.success) {
        throw new Error(
            result?.error || "Failed to fetch water sewerage types"
        );
    }

    return result.rows;
};


const getWaterConsumerTypesRepo = async () => {
    console.log("Repo: Fetch Water Consumer Types");

    const sql = `
        SELECT
            var_wtrcons_name,
            num_wtrcons_id
        FROM aorts_wtrconsumertype_mas
        ORDER BY var_wtrcons_name
    `;

    const result = await executeQueryTMC(sql);

    if (!result || !result.success) {
        throw new Error(
            result?.error || "Failed to fetch water consumer types"
        );
    }

    return result.rows;
};


const getWaterMeterTypesRepo = async () => {
    console.log("Repo: Fetch Water Meter Types");

    const sql = `
        SELECT
            var_wtrmeter_name,
            num_wtrmeter_id
        FROM aorts_wtrmetertype_mas
        ORDER BY var_wtrmeter_name
    `;

    const result = await executeQueryTMC(sql);

    if (!result || !result.success) {
        throw new Error(
            result?.error || "Failed to fetch water meter types"
        );
    }

    return result.rows;
};


const getServiceDocumentsRepo = async ({
    serviceId,
    ulbid,
}) => {
    console.log("Repo: Fetch Service Documents", {
        serviceId,
        ulbid,
    });

    const binds = {
        serviceId: Number(serviceId),
        ulbid: Number(ulbid),
    };

    const sql = `
        SELECT
            d.num_doc_id AS DocId,
            d.var_doc_engname AS DocName,
            d.var_doc_engdocdesc AS engdocdesc,
            d.var_doc_type AS DocType,
            NULL AS noc_new,
            NULL AS noc_renewal,
            d.var_doc_active AS active
        FROM aorts_doc_def d

        INNER JOIN aorts_serv_doc_config sdc
            ON sdc.num_serdoc_servid = d.num_doc_serviceid
           AND sdc.num_serdoc_docid = d.num_doc_id

        INNER JOIN vw_services s
            ON s.num_service_serviceid = d.num_doc_serviceid

        WHERE d.num_doc_serviceid = :serviceId
          AND sdc.num_serdoc_ulbid = :ulbid
          AND s.var_service_active = 'Y'
    `;

    const result = await executeQueryTMC(sql, binds);

    if (!result || !result.success) {
        throw new Error(
            result?.error || "Failed to fetch service documents"
        );
    }

    return result.rows;
};

const saveApplicantInfoRepo = async (payload) => {
    console.log("Repo: Save Applicant Information", {
        ulbid: payload.in_ulbid,
        corpid: payload.in_corpid,
        serviceid: payload.in_serviceid,
        userid: payload.in_userid,
        mode: payload.in_mode,
    });

    try {
        const result = await withTxTMC(async (connection) => {

            const result = await connection.execute(
                `
                BEGIN
                    AORTS.aorts_applicant_info_ins(
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
                        :out_AppNo,
                        :out_errcode,
                        :out_ErrMsg
                    );
                END;
                `,
                // :in_consumertypeid,
                //          :in_metertypeid,
                {
                    // --------------------------------
                    // IN PARAMETERS
                    // --------------------------------

                    in_ulbid: payload.in_ulbid,
                    in_corpid: payload.in_corpid,
                    in_serviceid: payload.in_serviceid,
                    in_userid: payload.in_userid,

                    in_firstname: payload.in_firstname,
                    in_firstnameM: payload.in_firstnameM,

                    in_middlename: payload.in_middlename,
                    in_middlenameM: payload.in_middlenameM,

                    in_lastname: payload.in_lastname,
                    in_lastnameM: payload.in_lastnameM,

                    in_mobileno: payload.in_mobileno,
                    in_adharno: payload.in_adharno,
                    in_email: payload.in_email,

                    in_address: payload.in_address,
                    in_addressM: payload.in_addressM,

                    in_purpose: payload.in_purpose,
                    in_purposeM: payload.in_purposeM,

                    in_zoneid: payload.in_zoneid,
                    in_wardno: payload.in_wardno,
                    in_propertyno: payload.in_propertyno,

                    in_mode: payload.in_mode,

                    in_PropertyUsage: payload.in_PropertyUsage,
                    in_SellerName: payload.in_SellerName,
                    in_TransferToWhom: payload.in_TransferToWhom,

                    in_AgreementDate: payload.in_AgreementDate
            ? new Date(`${payload.in_AgreementDate}T00:00:00`)
            : null,
                    in_AppNo: payload.in_AppNo,

                    in_wtsewrgtypeid: payload.in_wtsewrgtypeid,
                    in_nocpurposeid: payload.in_nocpurposeid,

                    in_RegiNo: payload.in_RegiNo,
                    in_UniqueNo: payload.in_UniqueNo,

                    in_appsource: payload.in_appsource,
                    in_deliveryflag: payload.in_deliveryflag,

                    // in_consumertypeid: payload.in_consumertypeid || NULL,
                    // in_metertypeid: payload.in_metertypeid,

                    // --------------------------------
                    // OUT PARAMETERS
                    // --------------------------------

                    out_AppNo: {
                        dir: oracledb.BIND_OUT,
                        type: oracledb.STRING,
                        maxSize: 200
                    },

                    out_errcode: {
                        dir: oracledb.BIND_OUT,
                        type: oracledb.NUMBER
                    },

                    out_ErrMsg: {
                        dir: oracledb.BIND_OUT,
                        type: oracledb.STRING,
                        maxSize: 4000
                    }
                }
            );

            console.log("payload: ", payload);
            console.log("Procedure OUT Binds:", result.outBinds);

            return result.outBinds;
        });

        return result;

    } catch (err) {
        console.error(
            "❌ Save Applicant Information Repo Error:",
            err
        );

        throw err;
    }
};

async function insertAppDocument({
  CorpId,
  ServiceId,
  AppNo,
  DocType,
  DocumentId,
  fileBuffer,
}) {
  return withTxTMC(async (connection) => {

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
        :CorpId,
        :ServiceId,
        :AppNo,
        :DocType,
        :DocumentId,
        :BLOBDocImage
      )
    `;

    const result = await connection.execute(
      sql,
      {
        CorpId: {
          dir: oracledb.BIND_IN,
          type: oracledb.NUMBER,
          val: Number(CorpId),
        },

        ServiceId: {
          dir: oracledb.BIND_IN,
          type: oracledb.NUMBER,
          val: Number(ServiceId),
        },

        AppNo: {
          dir: oracledb.BIND_IN,
          type: oracledb.STRING,
          val: AppNo,
        },

        DocType: {
          dir: oracledb.BIND_IN,
          type: oracledb.STRING,
          val: DocType,
        },

        DocumentId: {
          dir: oracledb.BIND_IN,
          type: oracledb.NUMBER,
          val: Number(DocumentId),
        },

        BLOBDocImage: {
          dir: oracledb.BIND_IN,
          type: oracledb.BLOB,
          val: fileBuffer,
        },
      }
    );

    return {
      out_errorcode: 0,
      out_errormsg: "SUCCESS",
      app_no: AppNo,
      doc_id: DocumentId,
      rows_affected: result.rowsAffected,
    };
  });
}

const searchBirthDeathDetailsRepo = async ({serviceId, registrationNo, birthDeathDate, fatherName, motherName}) => {
    const normalizedServiceId = Number(serviceId);

    if ( !registrationNo && !birthDeathDate && !fatherName && !motherName ) {
        throw new Error( "Please Enter Reg.no OR Date OR Father Name OR Mother Name" );
    }

    const conditions = [];
    const binds = {};

    let sql = "";
    let header = "";

    if ([15, 343].includes(normalizedServiceId)) {
        header = "Death Details";
        sql = `
            SELECT
                uniqueno AS "uniqueNo",
                num_death_regno AS "regno",
                var_death_name AS "name",
                CASE
                    WHEN var_death_gender = 'M' THEN 'Male'
                    ELSE 'Female'
                END AS "gender",
                dat_death_deathdate AS "BNDdate",
                var_death_monthername AS "mothername",
                var_death_fathername AS "fathername",
                num_death_noofcopies AS "copies"
            FROM birthdeath.aobd_death_def bd
        `;

        if (registrationNo) {
            conditions.push("num_death_regno = :registrationNo");
            binds.registrationNo = registrationNo;
        }

        if (birthDeathDate) {
            conditions.push("TRUNC(dat_death_deathdate) = TRUNC(TO_DATE(:birthDeathDate, 'YYYY-MM-DD'))");
            binds.birthDeathDate = birthDeathDate;
        }

        if (fatherName) {
            conditions.push("UPPER(var_death_fathername) LIKE UPPER(:fatherName)");
            binds.fatherName = `%${fatherName}%`;
        }

        if (motherName) {
            conditions.push("UPPER(var_death_monthername) LIKE UPPER(:motherName)");
            binds.motherName = `%${motherName}%`;
        }
    } else if ([14, 342].includes(normalizedServiceId)) {
        header = "Birth Details";
        sql = `
            SELECT
                uniqueno AS "uniqueNo",
                num_birth_regno AS "regno",
                var_birth_name AS "name",
                CASE
                    WHEN var_birth_gender = 'M' THEN 'Male'
                    ELSE 'Female'
                END AS "gender",
                dat_birth_birthdate AS "BNDdate",
                var_birth_monthername AS "mothername",
                var_birth_fathername AS "fathername",
                num_birth_noofcopies AS "copies"
            FROM birthdeath.aobd_birth_def bd
        `;

        if (registrationNo) {
            conditions.push("num_birth_regno = :registrationNo");
            binds.registrationNo = registrationNo;
        }

        if (birthDeathDate) {
            conditions.push("TRUNC(dat_birth_birthdate) = TRUNC(TO_DATE(:birthDeathDate, 'YYYY-MM-DD'))");
            binds.birthDeathDate = birthDeathDate;
        }

        if (fatherName) {
            conditions.push("UPPER(var_birth_fathername) LIKE UPPER(:fatherName)");
            binds.fatherName = `%${fatherName}%`;
        }

        if (motherName) {
            conditions.push("UPPER(var_birth_monthername) LIKE UPPER(:motherName)");
            binds.motherName = `%${motherName}%`;
        }
    } else {
        throw new Error("Invalid service ID");
    }

    if (conditions.length > 0) {
        sql += ` WHERE ${conditions.join(" AND ")}`;
    }

    const result = await executeQueryTMC(sql, binds);
    console.log({result:result, sql, binds})
    return {
        header,
        rows: result.rows,
    };
};

module.exports = {
    getServiceNameRepo,
    getNocPurposeRepo,
    getWardsRepo,
    getUserMobileRepo,
    getWaterSewerageTypesRepo,
    getWaterConsumerTypesRepo,
    getWaterMeterTypesRepo,
    getServiceDocumentsRepo,
    saveApplicantInfoRepo,
    insertAppDocument,
    searchBirthDeathDetailsRepo
};