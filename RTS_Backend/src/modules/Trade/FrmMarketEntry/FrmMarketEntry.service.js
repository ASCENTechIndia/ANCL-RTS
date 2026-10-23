const repo = require("./FrmMarketEntry.repo");

// ============================================================
// GET BUSINESS PLACE
// ============================================================
const getBusinessPlaceService = async () => {
  return await repo.getBusinessPlaceRepo();
};

// ============================================================
// GET JALAN SHIL
// ============================================================
const getJalanShilService = async () => {
  return await repo.getJalanShilRepo();
};

// ============================================================
// GET ILLEGAL TYPE
// ============================================================
const getIllegalTypeService = async () => {
  return await repo.getIllegalTypeRepo();
};

// ============================================================
// GET APPLICANT TYPE
// ============================================================
const getApplicantTypeService = async (ulbId) => {
  if (!ulbId) {
    throw new Error("ULB ID is required.");
  }

  return await repo.getApplicantTypeRepo(ulbId);
};

// ============================================================
// GET WARD
// ============================================================
const getWardService = async (ulbId) => {
  if (!ulbId) {
    throw new Error("ULB ID is required.");
  }

  return await repo.getWardRepo(ulbId);
};

// ============================================================
// GET LICENSE TYPE
// ============================================================
const getLicenseTypeService = async () => {
  return await repo.getLicenseTypeRepo();
};

// ============================================================
// GET TRADE CATEGORY
// ============================================================
const getTradeCategoryService = async (licenseType) => {
  if (!licenseType) {
    throw new Error("License Type is required.");
  }

  return await repo.getTradeCategoryRepo(licenseType);
};

// ============================================================
// GET TRADE DETAILS
// ============================================================
const getTradeDetailsService = async (ulbId) => {
  if (!ulbId) {
    throw new Error("ULB ID is required.");
  }

  return await repo.getTradeDetailsRepo(ulbId);
};

// ============================================================
// GET DOCUMENT DETAILS
// ============================================================
const getDocumentDetailsService = async (serviceId, ulbId) => {
  if (!serviceId) {
    throw new Error("Service ID is required.");
  }

  if (!ulbId) {
    throw new Error("ULB ID is required.");
  }

  return await repo.getDocumentDetailsRepo(serviceId, ulbId);
};

// ============================================================
// GET SELF DECLARE DATA
// ============================================================
const getSelfDeclareDataService = async (serviceId) => {
  if (!serviceId) {
    throw new Error("Service ID is required.");
  }

  return await repo.getSelfDeclareDataRepo(serviceId);
};

// ============================================================
// GET TRADE TYPE DETAILS
// ============================================================
const getTradeTypeDetailsService = async (ulbId, tradeCategoryId, tradeTypeId) => {
  if (!ulbId) {
    throw new Error("ULB ID is required.");
  }

  if (!tradeCategoryId) {
    throw new Error("Trade Category ID is required.");
  }

  if (!tradeTypeId) {
    throw new Error("Trade Type ID is required.");
  }

  return await repo.getTradeTypeDetailsRepo(ulbId, tradeCategoryId, tradeTypeId);
};

// ============================================================
// GET APPLICATION DETAILS
// ============================================================
// ============================================================
// GET APPLICATION DETAILS
// ============================================================
const getApplicationDetailsService = async (applicationId, ulbId) => {
  if (!applicationId) {
    throw new Error("Application ID is required.");
  }

  if (!ulbId) {
    throw new Error("ULB ID is required.");
  }

  // ----------------------------------------------------------
  // APPLICATION MASTER
  // ----------------------------------------------------------
  const application = await repo.getApplicationDetailsRepo(applicationId, ulbId);

  // ----------------------------------------------------------
  // NO DATA
  // ----------------------------------------------------------
  if (!application || application.length === 0) {
    return {
      success: false,
      status: "NOT_FOUND",
      message: "Application details not found",
      data: null,
    };
  }

  // ----------------------------------------------------------
  // TRADE TYPE DETAILS
  // ----------------------------------------------------------
  const tradeTypeDetails = await repo.getApplicationTradeTypeDetailsRepo(applicationId, ulbId);

  // ----------------------------------------------------------
  // TRADE DETAILS
  // ----------------------------------------------------------
  const tradeDetails = await repo.getApplicationTradeDetailsRepo(applicationId);

  // ----------------------------------------------------------
  // DIRECTOR DETAILS
  // ----------------------------------------------------------
  const directorDetails = await repo.getApplicationDirectorDetailsRepo(applicationId);

  // ----------------------------------------------------------
  // DOCUMENT DETAILS
  // ----------------------------------------------------------
  const documentDetails = await repo.getApplicationDocumentDetailsRepo(applicationId, ulbId);

  // ----------------------------------------------------------
  // COMPLETE APPLICATION DATA
  // ----------------------------------------------------------
  return {
    success: true,
    status: "FOUND",
    message: "Application details fetched successfully",

    data: {
      application: application[0],
      tradeTypeDetails,
      tradeDetails,
      directorDetails,
      documentDetails,
    },
  };
};

// ============================================================
// APPLICATION ENTRY
// ============================================================
const applicationEntryService = async (data) => {
  return await repo.applicationEntryRepo(data);
};

// ============================================================
// UPDATE DIRECTOR IMAGES SERVICE
// ============================================================
const updateDirectorImagesService = async (data) => {
  if (!data.appid) {
    throw new Error("Application ID is required.");
  }

  if (!data.files || data.files.length === 0) {
    throw new Error("Director image is required.");
  }

  return await repo.updateDirectorImagesRepo(data);
};

// ============================================================
// DOCUMENT INSERT SERVICE
// ============================================================
const documentInsertService = async (data) => {
  if (!data.appno) {
    return {
      success: false,
      errorMsg: "Application number is required",
    };
  }

  if (!data.file) {
    return {
      success: false,
      errorMsg: "Document file is required",
    };
  }

  return await repo.documentInsertRepo(data);
};

// ============================================================
// GET EXISTING LICENSE DETAILS
// ============================================================

// const getExistingLicenseDetailsService = async (oldLicencNo, ulbId) => {
//   if (!oldLicencNo) {
//     throw new Error("Old License Number is required.");
//   }

//   if (!ulbId) {
//     throw new Error("ULB ID is required.");
//   }

//   // ----------------------------------------------------------
//   // 1. Get latest application
//   // ----------------------------------------------------------

//   const applicationRows = await repo.getExistingLicenseDetailsRepo(oldLicencNo, ulbId);

//   if (!applicationRows || applicationRows.length === 0) {
//     return {
//       found: false,
//       message: "No Licence Found",
//       application: null,
//       tradeTypeDetails: [],
//       tradeDetails: [],
//       directorDetails: [],
//       documentDetails: [],
//     };
//   }

//   // ----------------------------------------------------------
//   // 2. Latest application
//   // ----------------------------------------------------------

//   const application = applicationRows[0];

//   const applicationId = application.NUM_APPLI_ID;

//   // ----------------------------------------------------------
//   // 3. Get dependent details
//   // ----------------------------------------------------------

//   const [tradeTypeDetails, tradeDetails, directorDetails, documentDetails] = await Promise.all([
//     repo.getExistingLicenseTradeTypeDetailsRepo(applicationId, ulbId),

//     repo.getExistingLicenseTradeDetailsRepo(applicationId, ulbId),

//     repo.getExistingLicenseDirectorDetailsRepo(applicationId, ulbId),

//     repo.getExistingLicenseDocumentDetailsRepo(applicationId, ulbId),
//   ]);

//   // ----------------------------------------------------------
//   // 4. Calculate total amount
//   // ----------------------------------------------------------

//   let totalAmount = 0;

//   for (const item of tradeTypeDetails) {
//     totalAmount += Number(item.RATE || 0);
//   }

//   // ----------------------------------------------------------
//   // 5. Return complete details
//   // ----------------------------------------------------------

//   return {
//     found: true,

//     application: {
//       ...application,
//       amount: totalAmount,
//     },

//     tradeTypeDetails,
//     tradeDetails,
//     directorDetails,
//     documentDetails,
//   };
// };

// ============================================================
// SEARCH LICENSE
// ============================================================

// ============================================================
// CHECK LICENSE CANCELLED
// ============================================================
// const checkLicenseCancelledService = async (oldLicencNo) => {
//   if (!oldLicencNo) {
//     throw new Error("License Number is required.");
//   }

//   const result = await repo.checkLicenseCancelledRepo(oldLicencNo);

//   const count = Number(result[0]?.ID || 0);

//   return {
//     cancelled: count > 0,
//   };
// };

// ============================================================
// GET TRADE TYPE RATES
// ============================================================
// const getTradTypesRatesService = async (tradeTypes, fromDate, toDate, ulbId) => {
//   if (!tradeTypes) {
//     throw new Error("Trade Types are required.");
//   }

//   if (!fromDate) {
//     throw new Error("From Date is required.");
//   }

//   if (!ulbId) {
//     throw new Error("ULB ID is required.");
//   }

//   return await repo.getTradTypesRatesRepo(tradeTypes, fromDate, toDate, ulbId);
// };

// ============================================================
// GET TRADE TYPES BY CATEGORY
// ============================================================
// const getTradeTypesByCategoryService = async (categoryId, type) => {
//   if (!categoryId) {
//     throw new Error("Trade Category is required.");
//   }

//   if (!type) {
//     throw new Error("Type is required.");
//   }

//   return await repo.getTradeTypesByCategoryRepo(categoryId, type);
// };

// ============================================================
// GET TRADE CATEGORY BY JWALAN STATUS
// ============================================================
const getTradeCategoryByJwalanService = async (type) => {

  if (!type) {
    throw new Error("Type is required.");
  }

  return await repo.getTradeCategoryByJwalanRepo(type);
};

const getZoneByWardService = async (wardId, ulbId) => {
  if (!wardId) throw new Error("Ward ID is required.");
  if (!ulbId) throw new Error("ULB ID is required.");
  return await repo.getZoneByWardRepo(wardId, ulbId);
};

// ============================================================
// GET EXISTING LICENSE DETAILS SERVICE (NEW)
// ============================================================
const getExistingLicenseDetailsService = async (oldLicencNo, ulbId) => {
  if (!oldLicencNo) throw new Error("Old License Number is required.");
  if (!ulbId) throw new Error("ULB ID is required.");

  // 1. Get latest application
  const applicationRows = await repo.getExistingLicenseDetailsRepo(oldLicencNo, ulbId);

  if (!applicationRows || applicationRows.length === 0) {
    return {
      found: false,
      message: "No Licence Found",
      application: null,
      tradeTypeDetails: [],
      tradeDetails: [],
      directorDetails: [],
      documentDetails: [],
    };
  }

  const application = applicationRows[0];
  const applicationId = application.NUM_APPLI_ID;

  // 2. Get dependent details
  const [tradeTypeDetails, tradeDetails, directorDetails, documentDetails] = await Promise.all([
    repo.getExistingLicenseTradeTypeDetailsRepo(applicationId, ulbId),
    repo.getExistingLicenseTradeDetailsRepo(applicationId, ulbId),
    repo.getExistingLicenseDirectorDetailsRepo(applicationId, ulbId),
    repo.getExistingLicenseDocumentDetailsRepo(applicationId, ulbId),
  ]);

  // 3. Calculate total amount
  let totalAmount = 0;
  for (const item of tradeTypeDetails) {
    totalAmount += Number(item.RATE || 0);
  }

  return {
    found: true,
    application: {
      ...application,
      amount: totalAmount,
    },
    tradeTypeDetails,
    tradeDetails,
    directorDetails,
    documentDetails,
  };
};

// ============================================================
// CHECK LICENSE CANCELLED SERVICE (NEW)
// ============================================================
const checkLicenseCancelledService = async (oldLicencNo) => {
  if (!oldLicencNo) throw new Error("License Number is required.");
  const result = await repo.checkLicenseCancelledRepo(oldLicencNo);
  const count = Number(result[0]?.ID || 0);
  return count > 0;
};

module.exports = {
  getBusinessPlaceService,
  getJalanShilService,
  getIllegalTypeService,
  getApplicantTypeService,
  getWardService,
  getZoneByWardService, // NEW
  getLicenseTypeService,
  getTradeCategoryService,
  getTradeDetailsService,
  getDocumentDetailsService,
  getSelfDeclareDataService,
  getApplicationDetailsService,
  getExistingLicenseDetailsService, // NEW
  checkLicenseCancelledService, // NEW
  applicationEntryService,
  updateDirectorImagesService,
  documentInsertService,
  getTradeCategoryByJwalanService,
};
