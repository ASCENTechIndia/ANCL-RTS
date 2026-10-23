const { executeQueryTMC } = require("../../../db/queryExecutor");
const { executeProcedureTMC } = require("../../../db/procedureExecutor");
const oracledb = require("oracledb");

const getEducationDropdownRepo = async () => {
    console.log("Repo: Fetch Plumber Education Dropdown");

    const sql = `
        SELECT
            var_wtreducation_name AS EDUCATIONNAME,
            num_wtreducation_id AS EDUCATIONID
        FROM aorts_wtreducation_mas
        ORDER BY var_wtreducation_name
    `;

    const result = await executeQueryTMC(sql, {});

    if (!result || !result.success) {
        throw new Error(result?.error || "Failed to fetch education dropdown");
    }
    return result.rows;
};

const savePlumberLicenseRepo = async ({userId, licenseId, appliFName, appliMName, appliLName, mobNo, email, address, panNo, education, tectQuali, businessName, tradeLicenceNo, ulbid, servid, zoneId, source, detAppliName, detMobile, detAadhaar, detEmail, detAddress}) => {
    console.log("Repo: Save Plumber License", {userId, ulbid, servid, zoneId});

    const sql = `
        BEGIN
            aorts_plumberlicense_ins(
                :in_UserID,
                :in_LicenseId,
                :in_AppliFName,
                :in_AppliMName,
                :in_AppliLName,
                :in_MobNo,
                :in_Email,
                :in_Address,
                :in_PanNo,
                :in_Education,
                :in_TectQuali,
                :in_BusinessName,
                :in_TradeLicenceNo,
                :in_ulbid,
                :in_servid,
                :IN_ZoneId,
                :in_source,
                :in_detAppliName,
                :in_detMobile,
                :in_detAadhaar,
                :in_detEmail,
                :in_detAddress,
                :out_Errcode,
                :out_ErrMsg,
                :out_appno
            );
        END;
    `;

    const binds = {
        in_UserID: userId,
        in_LicenseId: licenseId ?? 0,
        in_AppliFName: appliFName,
        in_AppliMName: appliMName,
        in_AppliLName: appliLName,
        in_MobNo: mobNo,
        in_Email: email,
        in_Address: address,
        in_PanNo: panNo,
        in_Education: education,
        in_TectQuali: tectQuali,
        in_BusinessName: businessName,
        in_TradeLicenceNo: tradeLicenceNo || null,
        in_ulbid: ulbid,
        in_servid: servid,
        IN_ZoneId: zoneId,
        in_source: source,
        in_detAppliName: detAppliName,
        in_detMobile: detMobile,
        in_detAadhaar: detAadhaar,
        in_detEmail: detEmail,
        in_detAddress: detAddress,
        out_Errcode: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        out_ErrMsg: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 4000 },
        out_appno: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 200 },
    };

    const result = await executeProcedureTMC({sql, binds});

    if (!result.success) {
        throw new Error(result.error);
    }
    return result.outBinds;
};


const renewPlumberLicenseRepo = async ({
    userId,
    licenseId,
    tradeLicenceNo,
    ulbid,
    servid,
    source,
    renewdt,
    fromdt,
    todt,
    appliFName,
    appliMName,
    appliLName,
    detMobile,
    detEmail,
    detAddress,
    zoneid,
    appliDOB,
    appliScndMobNo,
    appliEducation,
    appliLcnDate,
    appliFNameMar,
    appliMNameMar,
    appliLNameMar,
    detAddressMar,
}) => {
    // Prevent NULL or empty strings for optional text parameters.
    const textOrDot = (value) =>
        value == null || String(value).trim() === "."
            ? "."
            : String(value).trim() || ".";

    const sql = `
        BEGIN
            aorts_plumberlicrenew_ins(
                :in_UserID,
                :in_LicenseId,
                :in_TradeLicenceNo,
                :in_ulbid,
                :in_servid,
                :in_source,
                :in_renewdt,
                :in_fromdt,
                :in_todt,
                :in_AppliFName,
                :in_AppliMName,
                :in_AppliLName,
                :in_detMobile,
                :in_detEmail,
                :in_detAddress,
                :in_zoneid,
                :in_AppliDOB,
                :in_Appliscndmobno,
                :in_Applieducation,
                :in_applilcndate,
                :in_AppliFNamemar,
                :in_AppliMNamemar,
                :in_AppliLNamemar,
                :in_detAddressmar,
                :out_Errcode,
                :out_ErrMsg,
                :out_appno
            );
        END;
    `;

    const binds = {
        in_UserID: userId,
        in_LicenseId: licenseId ?? 0,
        in_TradeLicenceNo: tradeLicenceNo,
        in_ulbid: ulbid,
        in_servid: servid,
        in_source: source,

        in_renewdt: renewdt,
        in_fromdt: fromdt,
        in_todt: todt,

        in_AppliFName: textOrDot(appliFName),
        in_AppliMName: textOrDot(appliMName),
        in_AppliLName: textOrDot(appliLName),

        in_detMobile: detMobile,
        in_detEmail: textOrDot(detEmail),
        in_detAddress: textOrDot(detAddress),

        in_zoneid: zoneid,

        // DATE parameters must contain valid dates or NULL.
        // Do not pass "." or 0 as a date.
        in_AppliDOB: appliDOB || null,
        in_Appliscndmobno: appliScndMobNo ?? 0,
        in_Applieducation: textOrDot(appliEducation),
        in_applilcndate: appliLcnDate || null,

        // Critical fix: never pass NULL for Marathi name fields.
        in_AppliFNamemar: textOrDot(appliFNameMar),
        in_AppliMNamemar: textOrDot(appliMNameMar),
        in_AppliLNamemar: textOrDot(appliLNameMar),
        in_detAddressmar: textOrDot(detAddressMar),

        out_Errcode: {
            dir: oracledb.BIND_OUT,
            type: oracledb.NUMBER,
        },

        out_ErrMsg: {
            dir: oracledb.BIND_OUT,
            type: oracledb.STRING,
            maxSize: 4000,
        },

        out_appno: {
            dir: oracledb.BIND_OUT,
            type: oracledb.STRING,
            maxSize: 200,
        },
    };

    try {
        console.log("Renew Plumber License Bind Values:", {
            in_UserID: binds.in_UserID,
            in_LicenseId: binds.in_LicenseId,
            in_TradeLicenceNo: binds.in_TradeLicenceNo,
            in_ulbid: binds.in_ulbid,
            in_servid: binds.in_servid,
            in_AppliFNamemar: binds.in_AppliFNamemar,
            in_AppliMNamemar: binds.in_AppliMNamemar,
            in_AppliLNamemar: binds.in_AppliLNamemar,
            in_detAddressmar: binds.in_detAddressmar,
        });

        const result = await executeProcedureTMC({ sql, binds });

        console.log("Renew Plumber License Oracle Result:", {
            success: result?.success,
            error: result?.error,
            outBinds: result?.outBinds,
        });

        if (!result?.success) {
            throw new Error(
                result?.error || "Oracle procedure execution failed"
            );
        }

        const outBinds = result.outBinds || {};

        if (Number(outBinds.out_Errcode) !== 9999) {
            throw new Error(
                outBinds.out_ErrMsg ||
                    `Plumber license renewal failed. Error code: ${outBinds.out_Errcode}`
            );
        }

        return outBinds;
    } catch (error) {
        console.error("Renew Plumber License Repository Error:", {
            message: error.message,
            code: error.code,
        });

        throw error;
    }
};



module.exports = {
    getEducationDropdownRepo,
    savePlumberLicenseRepo,
    renewPlumberLicenseRepo,
};