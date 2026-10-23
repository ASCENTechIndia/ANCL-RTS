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

const savePlumberLicenseRepo = async ({ userId, licenseId, appliFName, appliMName, appliLName, mobNo, email, address, panNo, education, tectQuali, businessName, tradeLicenceNo, ulbid, servid, zoneId, source, detAppliName, detMobile, detAadhaar, detEmail, detAddress, appliDob, secondMobNo, appliFNameMar, appliMNameMar, appliLNameMar, addressMar }) => {

  console.log("Repo: Save Plumber License", { userId, ulbid, servid, zoneId });

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
        :in_applidob,
        :in_applisecndmobno,
        :in_AppliFNameMar,
        :in_AppliMNameMar,
        :in_AppliLNameMar,
        :in_AddressMar,
        :out_Errcode,
        :out_ErrMsg,
        :out_appno
      );
    END;
  `;

  const toOracleDate = (value) => {
    if (!value) return null;

    const date = new Date(`${value}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
      throw new Error(`Invalid applicant DOB: ${value}`);
    }

    return date;
  };

  const binds = {
    in_UserID: userId,
    in_LicenseId: licenseId ?? 0,
    in_AppliFName: appliFName,
    in_AppliMName: appliMName,
    in_AppliLName: appliLName,
    in_MobNo: mobNo,
    in_Email: email || null,
    in_Address: address,
    in_PanNo: panNo,
    in_Education: education,
    in_TectQuali: tectQuali,
    in_BusinessName: businessName,
    in_TradeLicenceNo: tradeLicenceNo,
    in_ulbid: ulbid,
    in_servid: servid,
    IN_ZoneId: zoneId,
    in_source: source,

    // Additional procedure parameters
    in_applidob: {
      val: toOracleDate(appliDob),
      type: oracledb.DATE,
      dir: oracledb.BIND_IN,
    },
    in_applisecndmobno: secondMobNo ?? null,
    in_AppliFNameMar: appliFName || null,
    in_AppliMNameMar: appliMName || null,
    in_AppliLNameMar: appliLName || null,
    in_AddressMar: address || null,

    // Output parameters
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

  const result = await executeProcedureTMC({ sql, binds });

  if (!result.success) {
    throw new Error(result.error);
  }

  return result.outBinds;
};

const renewPlumberLicenseRepo = async ({ userId, licenseId, tradeLicenceNo, ulbid, servid, source, renewdt, fromdt, todt, appliFName, appliMName, appliLName, detMobile, detAadhaar, detEmail, detAddress }) => {
  console.log("Repo: Renew Plumber License", { userId, licenseId, tradeLicenceNo, ulbid, servid });

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
    in_TradeLicenceNo: tradeLicenceNo,
    in_ulbid: ulbid,
    in_servid: servid,
    in_source: source,
    in_renewdt: renewdt,
    in_fromdt: fromdt,
    in_todt: todt,
    in_AppliFName: appliFName,
    in_AppliMName: appliMName,
    in_AppliLName: appliLName,
    in_detMobile: detMobile,
    in_detAadhaar: detAadhaar,
    in_detEmail: detEmail,
    in_detAddress: detAddress,
    out_Errcode: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
    out_ErrMsg: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 4000 },
    out_appno: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 200 },
  };

  const result = await executeProcedureTMC({ sql, binds });

  if (!result.success) {
    throw new Error(result.error);
  }

  return result.outBinds;
};

module.exports = {
  getEducationDropdownRepo,
  savePlumberLicenseRepo,
  renewPlumberLicenseRepo,
};
