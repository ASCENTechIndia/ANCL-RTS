// const repo = require("./FrmWaterRegister.repo");

// const getWardDropdownService = async (payload) => {
//     console.log("Service: Fetch Ward Dropdown", payload);
//     const data = await repo.getWardDropdownRepo(payload);

//     if (!data || data.length === 0) {
//         return { success: false, message: "No data Found", data: [] };
//     }
//     return { success: true, count: data.length, data };
// };

// const getServiceDropdownService = async (payload) => {
//     console.log("Service: Fetch Service Dropdown", payload);
//     const data = await repo.getServiceDropdownRepo(payload);

//     if (!data || data.length === 0) {
//         return { success: false, message: "No data Found", data: [] };
//     }
//     return { success: true, count: data.length, data };
// };

// const getDisconnectionDropdownService = async () => {
//     console.log("Service: Fetch Disconnection Dropdown");
//     const data = await repo.getDisconnectionDropdownRepo();

//     if (!data || data.length === 0) {
//         return { success: false, message: "No data Found", data: [] };
//     }
//     return { success: true, count: data.length, data };
// };

// const getUsageTypeDropdownService = async () => {
//     console.log("Service: Fetch Usage Type Dropdown");
//     const data = await repo.getUsageTypeDropdownRepo();

//     if (!data || data.length === 0) {
//         return { success: false, message: "No data Found", data: [] };
//     }
//     return { success: true, count: data.length, data };
// };

// const getConnectionSizeDropdownService = async () => {
//     console.log("Service: Fetch Connection Size Dropdown");
//     const data = await repo.getConnectionSizeDropdownRepo();

//     if (!data || data.length === 0) {
//         return { success: false, message: "No data Found", data: [] };
//     }
//     return { success: true, count: data.length, data };
// };

// const getWaterServiceNameService = async (payload) => {
//     console.log("Service: Fetch Water Service Name");
//     const data = await repo.getWaterServiceNameRepo(payload);

//     if (!data || data.length === 0) {
//         return { success: false, message: "No data Found", data: [] };
//     }
//     return { success: true, count: data.length, data };
// };

// const getWaterDocumentsService = async (payload) => {
//     console.log("Service: Fetch Water Documents", payload);
//     const data = await repo.getWaterDocumentsRepo(payload);

//     if (!data || data.length === 0) {
//         return { success: false, message: "No data Found", data: [] };
//     }
//     return { success: true, count: data.length, data };
// };

// const getWaterRegisterDetailsService = async (payload) => {
//     console.log("Service: Fetch Water Register Details", payload);
//     const data = await repo.getWaterRegisterDetailsRepo(payload);

//     if (!data || data.length === 0) {
//         return { success: false, message: "No data Found", data: [] };
//     }
//     return { success: true, count: data.length, data };
// };

// const getServicePayFlagService = async (payload) => {
//     console.log("Service: Fetch Service Pay Flag");
//     const data = await repo.getServicePayFlagRepo(payload);

//     if (!data || data.length === 0) {
//         return { success: false, message: "No data Found", data: [] };
//     }
//     return { success: true, count: data.length, data };
// };

// const saveWaterRegisterService = async (payload) => {
//     console.log("Service: Save Water Register", payload);
//     const result = await repo.saveWaterRegisterRepo(payload);
//     console.log("Water Register Procedure Result:", result);
//     const errorCode = Number(result?.Out_ErrorCode);

//     if (errorCode !== 9999) {
//         return {
//             success: false,
//             errorCode: result?.Out_ErrorCode,
//             message: result?.Out_ErrorMsg || "Unable to save water register"
//         };
//     }

//     return {
//         success: true,
//         errorCode: result.Out_ErrorCode,
//         message: result.Out_ErrorMsg || "Water register saved successfully"
//     };
// };

// const uploadWaterDocumentService = async (payload) => {
//     console.log("Service: Upload Water Document",{corpid: payload.corpid, serviceid: payload.serviceid, appno: payload.appno, doctype: payload.doctype, documentid: payload.documentid});
//     const result = await repo.uploadWaterDocumentRepo(payload);

//     if (!result || !result.success) {
//         return {success: false, message: result?.error || "Failed to upload document"};
//     }
//     return {success: true, message: "Document uploaded successfully", rowsAffected: result.rowCount || 0};
// };

// const getConnectionDetailsService = async ({userId, consumerNo, ulbId}) => {
//     console.log("Service: Fetch Connection Details", {userId, consumerNo, ulbId});
//     const result = await repo.getConnectionDetailsRepo({userId, consumerNo, ulbId});
//     return result;
// };

// module.exports = {
//     getWardDropdownService,
//     getServiceDropdownService,
//     getDisconnectionDropdownService,
//     getUsageTypeDropdownService,
//     getConnectionSizeDropdownService,
//     getWaterServiceNameService,
//     getWaterDocumentsService,
//     getWaterRegisterDetailsService,
//     getServicePayFlagService,
//     saveWaterRegisterService,
//     uploadWaterDocumentService,
//     getConnectionDetailsService
// };

const repo = require("./FrmWaterRegister.repo");
const { AppError } = require("../../../libs/errors");

function getRows(result) {
  if (result?.success === false) {
    throw new AppError(result.error || "Database query failed", 500);
  }

  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.rows)) return result.rows;
  if (Array.isArray(result?.data)) return result.data;

  return [];
}

// 1. Ward List
async function getWardListService(payload) {
  const { ulbID } = payload;

  if (ulbID === undefined || ulbID === null || ulbID === "") {
    throw new AppError("ULB ID is required", 400);
  }

  const result = await repo.getWardList(ulbID);

  return {
    success: true,
    data: getRows(result),
  };
}

// 2. Service List
async function getServiceListService(payload) {
  const { ulbID, departmentId, mode } = payload;

  if (ulbID === undefined || ulbID === null || ulbID === "") {
    throw new AppError("ULB ID is required", 400);
  }

  if (Number(mode ?? 0) !== 4 && (departmentId === undefined || departmentId === null || departmentId === "")) {
    throw new AppError("Department ID is required", 400);
  }

  const result = await repo.getServiceList({
    ulbID,
    departmentId,
    mode: mode ?? 0,
  });

  return {
    success: true,
    data: getRows(result),
  };
}

// 3. Disconnection Types
async function getDisconnectionTypesService() {
  const result = await repo.getDisconnectionTypes();

  return {
    success: true,
    data: getRows(result),
  };
}

// 4. Usage Types
async function getUsageTypesService(payload) {
  const { ulbID } = payload;

  if (ulbID === undefined || ulbID === null || ulbID === "") {
    throw new AppError("ULB ID is required", 400);
  }

  const result = await repo.getUsageTypes(ulbID);

  return {
    success: true,
    data: getRows(result),
  };
}

// 5. Connection Sizes
async function getConnectionSizesService(payload) {
  const { ulbID } = payload;

  if (ulbID === undefined || ulbID === null || ulbID === "") {
    throw new AppError("ULB ID is required", 400);
  }

  const result = await repo.getConnectionSizes(ulbID);

  return {
    success: true,
    data: getRows(result),
  };
}

// Get Water Register Prefill Details
async function getWaterRegisterPrefillService(payload) {
  const { appliNo } = payload;

  if (!appliNo) {
    throw new AppError("Application number is required", 400);
  }

  const result = await repo.getWaterRegisterPrefill(appliNo);

  if (result?.success === false) {
    throw new AppError(result.error || "Failed to fetch Water Register details", 500);
  }

  const rows = Array.isArray(result) ? result : result?.rows || result?.data || [];

  if (rows.length === 0) {
    return {
      success: true,
      found: false,
      data: null,
    };
  }

  const row = rows[0];

  return {
    success: true,
    found: true,
    data: {
      serviceId: row.NUM_WTREG_SERVID ?? row.num_wtreg_servid,
      consumerNo: row.VAR_WTREG_CONSNO ?? row.var_wtreg_consno,
      disconnectionId: row.NUM_WTREG_DISCONNID ?? row.num_wtreg_disconnid,
      reason: row.VAR_WTREG_REASON ?? row.var_wtreg_reason,
      usageId: row.NUM_WTREG_USAGEID ?? row.num_wtreg_usageid,
      tariffRate: row.NUM_WTREG_TARIFrATE ?? row.num_wtreg_tarifrate,
      connectionSizeId: row.NUM_WTREG_CONNSIZEID ?? row.num_wtreg_connsizeid,
      remark: row.VAR_WTREG_REMARK ?? row.var_wtreg_remark,
      applicationNo: row.VAR_WTREG_RTSNO ?? row.var_wtreg_rtsno,
    },
  };
}

// Save Water Register Application
const saveWaterRegisterService = async (payload) => {
  const { userId, wtregId, servId, consNo, disConId, reason, usageTypeId, tarifRate, connSize, remark, ulbid, zoneId, source, ownerName, usageType, inStr, firstName, middleName, lastName, appAddress, firstNameMr, middleNameMr, lastNameMr, addressMr, remarkMar, reasonMar } =
    payload;

  // Required validations
  if (!userId) {
    throw new AppError("User ID is required", 400);
  }

  if (!servId) {
    throw new AppError("Service ID is required", 400);
  }

  if (!ulbid) {
    throw new AppError("ULB ID is required", 400);
  }

  if (!zoneId || Number(zoneId) === 0) {
    throw new AppError("Zone ID is required", 400);
  }

  if (!remark || String(remark).trim() === "") {
    throw new AppError("Please Enter Remark", 400);
  }

  // Validate numeric values
  const numericFields = {
    userId,
    servId,
    ulbid,
    zoneId,
    wtregId,
  };

  for (const [key, value] of Object.entries(numericFields)) {
    if (value !== undefined && value !== null && value !== "" && !Number.isFinite(Number(value))) {
      throw new AppError(`Invalid ${key}`, 400);
    }
  }

  // Execute stored procedure
  const result = await repo.saveWaterRegisterRepo({
    userId,
    wtregId,
    servId,
    consNo,
    disConId,
    reason,
    usageTypeId,
    tarifRate,
    connSize,
    remark,
    ulbid,
    zoneId,
    source,
    ownerName,
    usageType,
    inStr,
    firstName,
    middleName,
    lastName,
    appAddress,
    firstNameMr,
    middleNameMr,
    lastNameMr,
    addressMr,
    remarkMar,
    reasonMar,
  });

  const errorCode = Number(result?.Out_ErrorCode);
  const errorMsg = result?.Out_ErrorMsg || "";

  if (errorCode !== 9999) {
    throw new AppError(errorMsg || "Water Register application submission failed", 400);
  }

  return {
    success: true,
    errorCode,
    message: errorMsg,
  };
};

// Karjat Water Register Module Insert
const moduleInsertKarjatWaterService = async (payload) => {
  const {
    ulbID,
    corpId,
    serviceId,
    appNo,
    userId,

    firstName,
    firstNameMr,
    middleName,
    middleNameMr,
    lastName,
    lastNameMr,

    appAddress,
    addressMr,
    zoneId,
    consumerNo,
    appSource,

    disConId,
    reason,
    usageTypeId,
    tarifRate,
    connSize,
    remark,

    ownerName,
    address,
    remarkMar,
    reasonMar,
  } = payload;

  // Validate ULB
  if (!["1890", "1150"].includes(String(ulbID))) {
    throw new AppError("Karjat module is not applicable for this ULB", 400);
  }

  // Validate Service ID
  const allowedServiceIds = ["19", "21", "22", "91", "196"];

  if (!allowedServiceIds.includes(String(serviceId))) {
    throw new AppError("Karjat module is not applicable for this Service ID", 400);
  }

  if (!appNo) {
    throw new AppError("Application number is required", 400);
  }

  if (!userId) {
    throw new AppError("User ID is required", 400);
  }

  if (corpId === undefined || corpId === null || corpId === "") {
    throw new AppError("Corporation ID is required", 400);
  }

  if (zoneId === undefined || zoneId === null || zoneId === "") {
    throw new AppError("Zone ID is required", 400);
  }

  // Equivalent to C# string.Join("~", object[])
  // Null and undefined values become empty strings.
  const joinValues = (values) => values.map((value) => (value === null || value === undefined ? "" : String(value))).join("~");

  // Applicant details - exactly 32 positions
  const requeststr = joinValues([
    corpId, // 1  num_appl_corpid
    serviceId, // 2  num_appl_serviceid
    appNo, // 3  var_appl_appno
    userId, // 4  var_appl_userid
    firstName, // 5  var_appl_firstname
    firstNameMr, // 6  var_appl_mfirstname
    middleName, // 7  var_appl_middlename
    middleNameMr, // 8  var_appl_mmiddlename
    lastName, // 9  var_appl_lastname
    lastNameMr, // 10 var_appl_mlastname
    0, // 11 var_appl_mobno
    0, // 12 var_appl_aadharno
    "", // 13 var_appl_email
    appAddress, // 14 var_appl_address
    addressMr, // 15 var_appl_maddress
    ".", // 16 var_appl_purpose
    ".", // 17 var_appl_mpurpose
    zoneId, // 18 num_application_zoneid
    "", // 19 num_application_wardno
    consumerNo, // 20 var_application_propertyno
    "", // 21 num_application_propertyusage
    "", // 22 var_application_sellername
    "", // 23 var_application_transfertowhom
    "", // 24 dat_application_agreementdate
    appNo, // 25 var_appl_appnotemp
    "", // 26 num_APPLICANT_wtsewrgtypeid
    "", // 27 NUM_APPLICANT_FIRENOCPURPOSEID
    "", // 28 var_applicant_regno
    "", // 29 var_applicant_uiqueno
    ulbID, // 30 num_appl_ulbid
    appSource, // 31 var_appl_appsource
    "N", // 32 var_appl_deliverystatus
  ]);

  // Water details - exactly 22 positions
  const requestdtlsstr = joinValues([
    serviceId, // 1  num_wtreg_servid
    consumerNo, // 2  var_wtreg_consno
    disConId, // 3  num_wtreg_disconnid
    reason, // 4  var_wtreg_reason
    usageTypeId, // 5  num_wtreg_usageid
    tarifRate, // 6  num_wtreg_tarifrate
    connSize, // 7  num_wtreg_connsizeid
    remark, // 8  var_wtreg_remark
    userId, // 9  var_wtreg_insby
    ulbID, // 10 num_wtreg_ulbid
    ownerName, // 11 VAR_WTREG_CONSNAME
    address, // 12 VAR_WTREG_CONSADDRESS
    firstName, // 13 var_wtreg_aplifirstname
    firstNameMr, // 14 var_wtreg_aplifirstnamemr
    middleName, // 15 var_wtreg_aplimidlename
    middleNameMr, // 16 var_wtreg_aplimidlenamemr
    lastName, // 17 var_wtreg_aplilastname
    lastNameMr, // 18 var_wtreg_aplilastnamemr
    appAddress, // 19 var_wtreg_apliadressname
    addressMr, // 20 var_wtreg_apliadressnamemr
    remarkMar, // 21 VAR_WTREG_APPLIAPPRREMARKMAR
    reasonMar, // 22 var_wtreg_reasonmar
  ]);

  const flag = "AppliEntry";

  const result = await repo.moduleInsertKarjatWaterRepo({
    userId,
    flag,
    requeststr,
    requestdtlsstr,
  });

  const errorCode = Number(result?.OUT_ERRORCODE ?? result?.out_ErrorCode);
  const errorMsg = result?.OUT_ERRORMSG ?? result?.out_ErrorMsg ?? "";
  const outStr = result?.OUT_STR ?? result?.out_str ?? null;

  if (errorCode !== 9999) {
    throw new AppError(errorMsg || "Karjat Water Register application insertion failed", 400);
  }

  return {
    success: true,
    errorCode,
    errorMsg,
    outStr,
  };
};

// Get Block List
const getBlockListService = async (payload) => {
  const { ulbID, zoneID, wardID } = payload;

  if (!ulbID) {
    throw new AppError("ULB ID is required", 400);
  }

  if (!zoneID || Number(zoneID) === 0) {
    throw new AppError("Please select valid Zone", 400);
  }

  if (!wardID || Number(wardID) === 0) {
    throw new AppError("Please select valid Ward", 400);
  }

  const result = await repo.getBlockList({
    ulbID,
    zoneID,
    wardID,
  });

  if (result?.success === false) {
    throw new AppError(result.error || "Failed to fetch Block list", 500);
  }

  const rows = Array.isArray(result) ? result : result?.rows || result?.data || [];

  return {
    success: true,
    data: rows,
  };
};

const getConnectionDetailsService = async ({userId, consumerNo, ulbId}) => {
    console.log("Service: Fetch Connection Details", {userId, consumerNo, ulbId});
    const result = await repo.getConnectionDetailsRepo({userId, consumerNo, ulbId});
    return result;
};

module.exports = {
  getWardListService,
  getServiceListService,
  getDisconnectionTypesService,
  getUsageTypesService,
  getConnectionSizesService,
  getWaterRegisterPrefillService,
  saveWaterRegisterService,
  moduleInsertKarjatWaterService,
  getBlockListService,
  getConnectionDetailsService,
};
