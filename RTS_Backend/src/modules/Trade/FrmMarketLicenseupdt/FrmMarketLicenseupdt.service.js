const repo = require("./FrmMarketLicenseupdt.repo");

const { AppError } = require("../../../libs/errors");
const { ok } = require("../../../libs/response");

async function getApplicationTypesService({ ulbId }) {
  if (!ulbId) {
    throw new AppError("ULB ID is required", 400);
  }

  const result = await repo.getApplicationTypes({
    ulbId,
  });

  if (!result.success) {
    throw new AppError(result.error, 500);
  }

  return {
    success: true,
    rowCount: result.rows.length,
    rows: result.rows,
  };
}

async function getZonesService({ ulbId }) {
  if (!ulbId) {
    throw new AppError("ULB ID is required", 400);
  }

  const result = await repo.getZones({
    ulbId,
  });

  if (!result.success) {
    throw new AppError(result.error, 500);
  }

  return {
    success: true,
    rowCount: result.rows.length,
    rows: result.rows,
  };
}

async function getGendersService() {
  const result = await repo.getGenders();

  if (!result.success) {
    throw new AppError(result.error, 500);
  }

  return {
    success: true,
    rowCount: result.rows.length,
    rows: result.rows,
  };
}

async function getJalanshilService() {
  const result = await repo.getJalanshil();

  if (!result.success) {
    throw new AppError(result.error, 500);
  }

  return {
    success: true,
    rowCount: result.rows.length,
    rows: result.rows,
  };
}

async function getRelationsService() {
  const result = await repo.getRelations();

  if (!result.success) {
    throw new AppError(result.error, 500);
  }

  return {
    success: true,
    rowCount: result.rows.length,
    rows: result.rows,
  };
}

async function getDocumentsService({ serviceId, ulbId }) {
  if (!serviceId) {
    throw new AppError("Service ID is required", 400);
  }

  if (!ulbId) {
    throw new AppError("ULB ID is required", 400);
  }

  const result = await repo.getDocuments({
    serviceId,
    ulbId,
  });

  if (!result.success) {
    throw new AppError(result.error, 500);
  }

  return {
    success: true,
    rowCount: result.rows.length,
    rows: result.rows,
  };
}

async function getLicenseTypesService() {
  const result = await repo.getLicenseTypes();

  if (!result.success) {
    throw new AppError(result.error, 500);
  }

  return {
    success: true,
    rowCount: result.rows.length,
    rows: result.rows,
  };
}

async function getAdhikrtuttaService() {
  const result = await repo.getAdhikrtutta();

  if (!result.success) {
    throw new AppError(result.error, 500);
  }

  return {
    success: true,
    rowCount: result.rows.length,
    rows: result.rows,
  };
}

async function getApplicationStatusService() {
  const result = await repo.getApplicationStatus();

  if (!result.success) {
    throw new AppError(result.error, 500);
  }

  return {
    success: true,
    rowCount: result.rows.length,
    rows: result.rows,
  };
}

async function getMarketLicenseDetailsService(params) {
  const { licenseNo, ulbId } = params;

  if (!licenseNo) {
    throw new AppError("License Number is required", 400);
  }

  if (!ulbId) {
    throw new AppError("ULB ID is required", 400);
  }

  const result = await repo.getMarketLicenseDetails({
    licenseNo,
    ulbId,
  });

  if (!result.success) {
    throw new AppError(result.error, 500);
  }

  return {
    success: true,
    rowCount: result.rows.length,
    rows: result.rows,
  };
}

async function getDirectorNameService(params) {
  const { appliType, ulbId } = params;

  if (!appliType) {
    throw new AppError("Application Type is required", 400);
  }

  if (!ulbId) {
    throw new AppError("ULB ID is required", 400);
  }

  const result = await repo.getDirectorName({
    appliType,
    ulbId,
  });

  if (!result.success) {
    throw new AppError(result.error, 500);
  }

  return {
    success: true,
    rowCount: result.rows.length,
    rows: result.rows,
  };
}

async function getMarketApplicationTypesService(params) {
  const { ulbId } = params;

  if (!ulbId) {
    throw new AppError("ULB ID is required", 400);
  }

  const result = await repo.getMarketApplicationTypes({
    ulbId,
  });

  if (!result.success) {
    throw new AppError(result.error, 500);
  }

  return {
    success: true,
    rowCount: result.rows.length,
    rows: result.rows,
  };
}

async function getDirectorDetailsService(params) {
  const { appliId, ulbId } = params;

  if (!appliId) {
    throw new AppError("Application ID is required", 400);
  }

  if (!ulbId) {
    throw new AppError("ULB ID is required", 400);
  }

  const result = await repo.getDirectorDetails({
    appliId,
    ulbId,
  });

  if (!result.success) {
    throw new AppError(result.error, 500);
  }

  const cleanRows = result.rows.map((row) => ({
    directorId: row.DIRECTORID,
    adharno: row.ADHARNO,
    dirctorname: row.DIRCTORNAME,
    mobileno: row.MOBILENO,
    email: row.EMAIL,
    gender: row.GENDER,
    address: row.ADDRESS,
    applitypeid: row.APPLITYPEID,
    applitypename: row.APPLITYPENAME,
    voterId: row.VOTERID,
    imgDirectorImage: row.IMGDIRECTORIMAGE
      ? row.IMGDIRECTORIMAGE.toString("base64")
      : null,
  }));

  
  return {
    success: true,
    rowCount: cleanRows.length,
    rows: cleanRows,
  };
}

async function getMarketApplicationAddressService(params) {
  const { licenseNo, ulbId } = params;

  if (!licenseNo) {
    throw new AppError("License Number is required", 400);
  }

  if (!ulbId) {
    throw new AppError("ULB ID is required", 400);
  }

  const result = await repo.getMarketApplicationAddress({
    licenseNo,
    ulbId,
  });

  if (!result.success) {
    throw new AppError(result.error, 500);
  }

  return {
    success: true,
    rowCount: result.rows.length,
    rows: result.rows,
  };
}

async function getTradeTypeDetailsService(params) {
  const { appliId, ulbId } = params;

  if (!appliId) {
    throw new AppError("Application ID is required", 400);
  }

  if (!ulbId) {
    throw new AppError("ULB ID is required", 400);
  }

  const result = await repo.getTradeTypeDetails({
    appliId,
    ulbId,
  });

  if (!result.success) {
    throw new AppError(result.error, 500);
  }

  return {
    success: true,
    rowCount: result.rows.length,
    rows: result.rows,
  };
}

async function getTradeDetailsService(params) {
  const { appliId } = params;

  if (!appliId) {
    throw new AppError("Application ID is required", 400);
  }

  const result = await repo.getTradeDetails({
    appliId,
  });

  if (!result.success) {
    throw new AppError(result.error, 500);
  }

  return {
    success: true,
    rowCount: result.rows.length,
    rows: result.rows,
  };
}


async function getTradeDirectorIdService({ applicationId }) {
  if (!applicationId) {
    throw new AppError("Application ID is required", 400);
  }

  const result = await repo.getTradeDirectorId({
    applicationId,
  });

  if (!result.success) {
    throw new AppError(result.error, 500);
  }

  return {
    success: true,
    rowCount: result.rows.length,
    rows: result.rows,
  };
}


async function updateTradeDirectorImageService({
  directorId,
  applicationId,
  fileBuffer,
}) {
  if (!directorId) {
    throw new AppError("Director ID is required", 400);
  }

  if (!applicationId) {
    throw new AppError("Application ID is required", 400);
  }

  if (!fileBuffer || fileBuffer.length === 0) {
    throw new AppError("Director image is required", 400);
  }

  // Same 5 MB validation as your document upload
  if (fileBuffer.length > 5 * 1024 * 1024) {
    throw new AppError(
      "Director image should be less than 5MB",
      400
    );
  }

  const result = await repo.updateTradeDirectorImage({
    directorId,
    applicationId,
    fileBuffer,
  });

  if (!result.success) {
    throw new AppError(
      result.error || "Director image update failed",
      500
    );
  }

  return {
    success: true,
    message: "Director image updated successfully",
    rowsAffected: result.rowsAffected,
  };
}


async function getTradeTypesByCategoryService({ categoryId, categoryType }) {
  if (!categoryId) {
    throw new AppError("Category ID is required", 400);
  }

  const result = await repo.getTradeTypesByCategory({categoryId, categoryType});

  if (!result.success) {
    throw new AppError(result.error, 500);
  }

  return {
    success: true,
    rowCount: result.rows.length,
    rows: result.rows,
  };
}


async function getServiceInstructionsService({ serviceId }) {
  if (!serviceId) {
    throw new AppError("Service ID is required", 400);
  }

  const result = await repo.getServiceInstructions({
    serviceId,
  });

  if (!result.success) {
    throw new AppError(result.error, 500);
  }

  return {
    success: true,
    rowCount: result.rows.length,
    rows: result.rows,
  };
}


async function getTradeCategoriesService({ jwalanshilstat, categoryType }) {
  const result = await repo.getTradeCategories({
    jwalanshilstat, categoryType
  });

  if (!result.success) {
    throw new AppError(result.error, 500);
  }

  return {
    success: true,
    rowCount: result.rows.length,
    rows: result.rows,
  };
}

async function getSelfDeclarationService({ serviceId }) {
  if (!serviceId) {
    throw new AppError("Service ID is required", 400);
  }

  const result = await repo.getSelfDeclaration({
    serviceId,
  });

  if (!result.success) {
    throw new AppError(result.error, 500);
  }

  return {
    success: true,
    rowCount: result.rows.length,
    rows: result.rows,
  };
}


async function submitTradeApplicationService(payload) {
  const {
    userid,

    licenseno,
    appfname,
    appmname,
    applname,
    mobile,
    email,
    aadhar,
    propno,
    address,
    remark,

    newbusiname,
    newownfname,
    newownmname,
    newownlname,

    newcofname,
    newcomname,
    newcolname,

    ulbid,
    servicename,

    businesstr,
    partnerstr,
    corrpartnerstr,

    appid,
    tradeaddrstr,
    tradechkstr,
    directorstr,

    rate,
    wardid,
    zoneid,
    // Servid,
    Source,
    // amount,

    // Gender,
    // Jwalan,
    // Relation,
    // Adhikrutta,
    // LicencType,
    // TradeType,

    // CloseDt,
    // LicOwner,
    // LicType,
    // LicFrmDt,
    // LicToDt,

    // BusiName,
    // BusiSwarup,
    // BusiAddr,
    // type,
  } = payload;


  if (!ulbid) {
    throw new AppError("ULB ID is required", 400);
  }

  if (!licenseno) {
    throw new AppError("License Number is required", 400);
  }

  if (!mobile) {
    throw new AppError("Mobile Number is required", 400);
  }

  if (String(mobile).length !== 10) {
    throw new AppError(
      "Mobile Number must be 10 digits",
      400
    );
  }

  if (email) {
    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      throw new AppError(
        "Invalid Email Address",
        400
      );
    }
  }


  const result = await repo.insertTradeApplication({
    userid,

    licenseno,
    appfname,
    appmname,
    applname,
    mobile,
    email,
    aadhar,
    propno,
    address,
    remark,

    newbusiname,
    newownfname,
    newownmname,
    newownlname,

    newcofname,
    newcomname,
    newcolname,

    ulbid,
    servicename,

    businesstr,
    partnerstr,
    corrpartnerstr,

    appid,
    tradeaddrstr,
    tradechkstr,
    directorstr,

    rate,
    wardid,
    zoneid,
    // Servid,
    Source,
    // amount,

    // Gender,
    // Jwalan,
    // Relation,
    // Adhikrutta,
    // LicencType,
    // TradeType,

    // CloseDt,
    // LicOwner,
    // LicType,
    // LicFrmDt,
    // LicToDt,

    // BusiName,
    // BusiSwarup,
    // BusiAddr,
    // type,
  });


  if (Number(result.out_ErrCode) !== 9999) {
    return {
      success: false,
      errorCode: result.out_ErrCode,
      message: result.out_ErrMsg || "Application submission failed",
      applicationId: result.out_AppliID || null,
      applicationNo: result.out_AppliNo || null,
    };
  }

  return {
    success: true,
    errorCode: result.out_ErrCode,
    message:
      result.out_ErrMsg ||
      "Application submitted successfully",

    applicationId: result.out_AppliID || null,
    applicationNo: result.out_AppliNo || null,
  };
}

async function insertTradeTypeLogService(payload) {
  const {
    orgId,
    id,
    appId,
    tradeType,
    tradeCat,
    rate,
    directorId,
    aadharNo,
    directorName,
    mobileNo,
    email,
    gender,
    address,
    appliType,
    servicee,
  } = payload;



  if (!orgId) {
    throw new AppError(
      "Organization/ULB ID is required",
      400
    );
  }

  if (!servicee) {
    throw new AppError(
      "Service is required",
      400
    );
  }


  const result = await repo.insertTradeTypeLog({
    orgId,
    id,
    appId,
    tradeType,
    tradeCat,
    rate,
    directorId,
    aadharNo,
    directorName,
    mobileNo,
    email,
    gender,
    address,
    appliType,
    servicee,
  });


  if (Number(result.Out_Errorcode) !== 9999) {
    return {
      success: false,
      errorCode: result.Out_Errorcode,
      message:
        result.Out_Errormsg ||
        "Trade type log insertion failed",
    };
  }

  return {
    success: true,
    errorCode: result.Out_Errorcode,
    message:
      result.Out_Errormsg ||
      "Trade type log inserted successfully",
  };
}




module.exports = {
  getApplicationTypesService,
  getZonesService,
  getGendersService,
  getJalanshilService,
  getRelationsService,
  getDocumentsService,
  getLicenseTypesService,
  getAdhikrtuttaService,
  getApplicationStatusService,
  getMarketLicenseDetailsService,
  getDirectorNameService,
  getMarketApplicationTypesService,
  getDirectorDetailsService,
  getMarketApplicationAddressService,
  getTradeTypeDetailsService,
  getTradeDetailsService,

  getTradeDirectorIdService,
  updateTradeDirectorImageService,
  getTradeTypesByCategoryService,
  getServiceInstructionsService,
  getTradeCategoriesService,
  getSelfDeclarationService,
  submitTradeApplicationService,
  insertTradeTypeLogService
};
