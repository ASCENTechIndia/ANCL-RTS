const { executeProcedureTMC } = require("../../../db/procedureExecutor");
const { executeQueryTMC } = require("../../../db/queryExecutor");
const oracledb = require("oracledb");

async function insertNOCApplication(params) {
  const {
    userId,
    ulbId,
    serviceId,
    firstName,
    middleName,
    lastName,
    address,
    mobileNo,
    aadhaarNo,
    panCardNo,
    emailId,
    orgName,
    orgAddress,
    deptId,
    businessType,            
    businessDescription,     
    propertyNo,
    businessAddress,
    waterConnectionNo,
    permitFromDate,          
    permitToDate,            
    occupancyCertificateNo,
    roadType,
    roadLength,
    roadWidth,
    roadLengthWidth,
    excavationArea,
    excavationStartPoint,
    excavationEndPoint,
    latitude,
    longitude,
    hospitalName,
    healthAgencyNo,
    fixedArea,
    newHoarding,
    hoardingNumber,
    advertisingArea,
    numberOfDays,
    hoardingType,
    hoardingSubType,
    zoneId,
    businessLicenseNo,
    buildingPermissionProposalNo,
    licenseType,
  } = params;

  const toNum = (v) => {
    if (v === undefined || v === null || v === "") return null;
    const n = Number(v);
    return isNaN(n) ? null : n;
  };

  const sql = `
    BEGIN
      aorts_nocapplication_ins(
        :in_userid,
        :in_ulbID,
        :in_serviceid,
        :in_fname,
        :in_mname,
        :in_lname,
        :in_address,
        :in_mobileno,
        :in_adharno,
        :in_panno,
        :in_email,
        :in_orgname,
        :in_orgadress,
        :in_deptid,
        :in_noctypeid,
        :in_nocdetails,
        :in_propno,
        :in_nocaddress,
        :in_wtconnno,
        :in_nocpermino,
        :in_buildpermino,
        :in_occupcerno,
        :in_roadtype,
        :in_roadlength,
        :in_roadwidth,
        :in_roadlengwidth,
        :in_excavationshape,
        :in_exctionstrtpoint,
        :in_exctionendpoint,
        :in_Latitude,
        :in_Longitude,
        :in_clinicnm,
        :in_healthnocno,
        :in_mandpreq_area,
        :in_newhoardingid,
        :in_numbers,
        :in_advreq_area,
        :in_noofdays,
        :in_newhoardingtype,
        :in_newsubhoardingtype,
        :in_ZoneId,
        :out_errcode,
        :out_ErrMsg,
        :out_applino
      );
    END;
  `;

  const binds = {
    in_userid: String(userId || ""),
    in_ulbID: toNum(ulbId),
    in_serviceid: toNum(serviceId),
    in_fname: firstName || "",
    in_mname: middleName || "",
    in_lname: lastName || "",
    in_address: address || "",
    in_mobileno: toNum(mobileNo),
    in_adharno: aadhaarNo || "",
    in_panno: panCardNo || "",
    in_email: emailId || "",
    in_orgname: orgName || "",
    in_orgadress: orgAddress || "",
    in_deptid: toNum(deptId),
    in_noctypeid: toNum(businessType),
    in_nocdetails: businessDescription || "",
    in_propno: propertyNo || "",
    in_nocaddress: businessAddress || "",
    in_wtconnno: waterConnectionNo || "",
    in_nocpermino: businessLicenseNo || "",
    in_buildpermino: buildingPermissionProposalNo || "",
    in_occupcerno: occupancyCertificateNo || "",
    in_roadtype: roadType || "",
    in_roadlength: toNum(roadLength),
    in_roadwidth: toNum(roadWidth),
    in_roadlengwidth: toNum(roadLengthWidth),
    in_excavationshape: toNum(excavationArea),
    in_exctionstrtpoint: toNum(excavationStartPoint),
    in_exctionendpoint: toNum(excavationEndPoint),
    in_Latitude: latitude ? String(latitude) : "",   
    in_Longitude: longitude ? String(longitude) : "",
    in_clinicnm: hospitalName || "",
    in_healthnocno: healthAgencyNo || "",
    in_mandpreq_area: fixedArea || "",
    in_newhoardingid: toNum(newHoarding),
    in_numbers: toNum(hoardingNumber),
    in_advreq_area: advertisingArea || "",
    in_noofdays: toNum(numberOfDays),
    in_newhoardingtype: hoardingType || "",
    in_newsubhoardingtype: hoardingSubType || "",
    in_ZoneId: toNum(zoneId),

    out_errcode: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
    out_ErrMsg:  { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 500 },
    out_applino: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 200 },
  };

  const result = await executeProcedureTMC({ sql, binds });

  if (!result.success) {
    throw new Error(result.error);
  }

  console.log("binds", binds);
  console.log("NOC Application Insert Result:", result.outBinds);
  return result.outBinds;
}

async function getServiceFields({ serviceId, deptId, ulbId }) {
  const query = `
    SELECT 
       s.num_service_serviceid      AS ServId,
       s.var_service_eng_name       AS ServName,
       s.num_service_deptid         AS ServDept,
       s.var_service_mar_name       AS ServNameMar,
       f.num_fld_id                 AS FieldId,
       f.var_fld_name               AS FieldName,
       f.var_fld_shortname          AS FieldShortName
    FROM aorts_tmcservice_def s
    INNER JOIN admins.aoms_dept_mas d
            ON d.num_dept_id = s.num_service_deptid
    INNER JOIN aorts_nocfields_config fc
            ON fc.num_fldconf_serviceid = s.num_service_serviceid
          AND fc.num_fldconf_deptid    = s.num_service_deptid
          AND fc.num_fldconf_ulbid     = :ulbId
    INNER JOIN aorts_nocfields_mas f
            ON f.num_fld_id = fc.num_fldconf_fieldid
    WHERE s.num_service_deptid = :deptId
      AND s.num_service_serviceid = :serviceId
  `;

  const bindParams = {
    serviceId: String(serviceId),
    deptId: String(deptId),
    ulbId: String(ulbId),
  };

  console.log("Service Fields Query:", query);
  console.log("Bind Params:", bindParams);

  const result = await executeQueryTMC(query, bindParams);
  console.log("result : ", result);
  return result;
}


const getBusinessTypeDropdownRepo = async ({ ulbid }) => {
    console.log("Repo: Fetch Business Type Dropdown", {  });

    const binds = {  };

    const sql = `
        SELECT
            num_bustyp_id AS BUSTYPID,
            var_bustyp_name AS BUSTYPNAME
        FROM AORTS_NOCBUSINESSTYP_MAS
   
        ORDER BY var_bustyp_name
    `;

    const result = await executeQueryTMC(sql, binds);

    if (!result || !result.success) {
        throw new Error(
            result?.error || "Failed to fetch business type dropdown"
        );
    }

    return result.rows;
};

const getRoadTypeDropdownRepo = async ({ ulbid }) => {
    console.log("Repo: Fetch Road Type Dropdown", { ulbid });

    const binds = { ulbid };

    const sql = `
        SELECT
            num_roadtype_id AS ROADTYPEID,
            var_roadtype_name AS ROADTYPENAME
        FROM AORTS_NOCROADTYPE_MAS
        WHERE num_roadtype_ulbid = :ulbid
        ORDER BY var_roadtype_name
    `;

    const result = await executeQueryTMC(sql, binds);

    console.log("result", result);

    if (!result || !result.success) {
        throw new Error(
            result?.error || "Failed to fetch road type dropdown"
        );
    }

    return result.rows;
};

module.exports = {
  insertNOCApplication,
  getServiceFields,
  getBusinessTypeDropdownRepo,
  getRoadTypeDropdownRepo,
};