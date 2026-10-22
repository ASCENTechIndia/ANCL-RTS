const service = require("./FrmMarketEntry.service");
const asyncHandler = require("../../../libs/asyncHandler");
const { ok, fail } = require("../../../libs/response");

// ============================================================
// GET BUSINESS PLACE
// ============================================================
const getBusinessPlace = async (req, res, next) => {
  try {
    const data = await service.getBusinessPlaceService();

    return res.status(200).json({
      ok: true,
      message: "Business Place fetched successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET JALAN SHIL
// ============================================================
const getJalanShil = async (req, res, next) => {
  try {
    const data = await service.getJalanShilService();

    return res.status(200).json({
      ok: true,
      message: "Jalan Shil fetched successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET ILLEGAL TYPE
// ============================================================
const getIllegalType = async (req, res, next) => {
  try {
    const data = await service.getIllegalTypeService();

    return res.status(200).json({
      ok: true,
      message: "Illegal Type fetched successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET APPLICANT TYPE
// ============================================================
const getApplicantType = async (req, res, next) => {
  try {
    const { ulbId } = req.body;

    if (!ulbId) {
      return res.status(400).json({
        ok: false,
        message: "ULB ID is required",
      });
    }

    const data = await service.getApplicantTypeService(ulbId);

    return res.status(200).json({
      ok: true,
      message: "Applicant Type fetched successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET WARD
// ============================================================
const getWard = async (req, res, next) => {
  try {
    const { ulbId } = req.body;

    if (!ulbId) {
      return res.status(400).json({
        ok: false,
        message: "ULB ID is required",
      });
    }

    const data = await service.getWardService(ulbId);

    return res.status(200).json({
      ok: true,
      message: "Ward fetched successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET LICENSE TYPE
// ============================================================
const getLicenseType = async (req, res, next) => {
  try {
    const data = await service.getLicenseTypeService();

    return res.status(200).json({
      ok: true,
      message: "License Type fetched successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET TRADE CATEGORY
// ============================================================
const getTradeCategory = async (req, res, next) => {
  try {
    const { licenseType } = req.body;

    if (!licenseType) {
      return res.status(400).json({
        ok: false,
        message: "License Type is required",
      });
    }

    const data = await service.getTradeCategoryService(licenseType);

    return res.status(200).json({
      ok: true,
      message: "Trade Category fetched successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET TRADE DETAILS
// ============================================================
const getTradeDetails = async (req, res, next) => {
  try {
    const { ulbId } = req.body;

    if (!ulbId) {
      return res.status(400).json({
        ok: false,
        message: "ULB ID is required",
      });
    }

    const data = await service.getTradeDetailsService(ulbId);

    return res.status(200).json({
      ok: true,
      message: "Trade Details fetched successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET DOCUMENT DETAILS
// ============================================================
const getDocumentDetails = async (req, res, next) => {
  try {
    const { serviceId, ulbId } = req.body;

    if (!serviceId) {
      return res.status(400).json({
        ok: false,
        message: "Service ID is required",
      });
    }

    if (!ulbId) {
      return res.status(400).json({
        ok: false,
        message: "ULB ID is required",
      });
    }

    const data = await service.getDocumentDetailsService(serviceId, ulbId);

    return res.status(200).json({
      ok: true,
      message: "Document Details fetched successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET SELF DECLARE DATA
// ============================================================
const getSelfDeclareData = async (req, res, next) => {
  try {
    const { serviceId } = req.body;

    if (!serviceId) {
      return res.status(400).json({
        ok: false,
        message: "Service ID is required",
      });
    }

    const data = await service.getSelfDeclareDataService(serviceId);

    return res.status(200).json({
      ok: true,
      message: "Self Declare Data fetched successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET TRADE TYPE DETAILS
// ============================================================
const getTradeTypeDetails = async (req, res, next) => {
  try {
    const { ulbId, tradeCategoryId, tradeTypeId } = req.body;

    if (!ulbId) {
      return res.status(400).json({
        ok: false,
        message: "ULB ID is required",
      });
    }

    if (!tradeCategoryId) {
      return res.status(400).json({
        ok: false,
        message: "Trade Category ID is required",
      });
    }

    if (!tradeTypeId) {
      return res.status(400).json({
        ok: false,
        message: "Trade Type ID is required",
      });
    }

    const data = await service.getTradeTypeDetailsService(ulbId, tradeCategoryId, tradeTypeId);

    return res.status(200).json({
      ok: true,
      message: "Trade Type Details fetched successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET APPLICATION DETAILS
// ============================================================
const getApplicationDetails = async (req, res, next) => {
  try {
    const { applicationId, ulbId } = req.body;

    console.log("📥 Get Application Details", {
      applicationId,
      ulbId,
    });

    // --------------------------------------------------------
    // VALIDATION
    // --------------------------------------------------------
    if (!applicationId) {
      return res.status(400).json({
        ok: false,
        message: "Application ID is required",
      });
    }

    if (!ulbId) {
      return res.status(400).json({
        ok: false,
        message: "ULB ID is required",
      });
    }

    // --------------------------------------------------------
    // SERVICE
    // --------------------------------------------------------
    const result = await service.getApplicationDetailsService(applicationId, ulbId);

    // --------------------------------------------------------
    // NOT FOUND
    // --------------------------------------------------------
    if (result.status === "NOT_FOUND") {
      return res.status(404).json({
        ok: false,
        message: result.message,
        data: null,
      });
    }

    // --------------------------------------------------------
    // SUCCESS
    // --------------------------------------------------------
    return res.status(200).json({
      ok: true,
      message: result.message,
      status: result.status,
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// APPLICATION ENTRY - UPDATED FOR aomk_appli_ins
// ============================================================
const applicationEntry = async (req, res, next) => {
  try {
    const {
      userId,
      appid,
      appliNo,
      mode,
      oldLicencNo,

      shopName,
      panNo,
      contactNo,
      email,
      address,

      zoneId,
      wardId,
      isProd,
      ownSpace,
      agrmentWith,

      area,
      isCorpNOC,
      busStartYr,
      shopActNo,
      foodlicno,

      licDays,
      applitradeStr,
      applitradetypeStr,
      applidirectorStr,
      source,

      shopNameMar,
      placeOwnerName,
      placeOwnerAddress,

      fromDate,
      toDate,

      amount,
      licType,
      ulbId,
      ipAddress,
      licenseTypeId,
      arrearsAmount,
      serviceId,
      cfcRecno,
      // aomk_appli_ins specific parameters
      propNo,
      marketPropNo = "",
      category,
      trdBusinessType,
    } = req.body;

    // --------------------------------------------------------
    // VALIDATION - COMMON FOR ALL MODES
    // --------------------------------------------------------
    if (!userId) {
      return res.status(400).json({
        ok: false,
        message: "User ID is required",
      });
    }

    if (!ulbId) {
      return res.status(400).json({
        ok: false,
        message: "ULB ID is required",
      });
    }

    if (!shopName) {
      return res.status(400).json({
        ok: false,
        message: "Shop Name is required",
      });
    }

    if (!contactNo) {
      return res.status(400).json({
        ok: false,
        message: "Contact No is required",
      });
    }

    if (!address) {
      return res.status(400).json({
        ok: false,
        message: "Address is required",
      });
    }

    if (!wardId) {
      return res.status(400).json({
        ok: false,
        message: "Ward ID is required",
      });
    }

    if (!fromDate) {
      return res.status(400).json({
        ok: false,
        message: "From Date is required",
      });
    }

    if (!toDate) {
      return res.status(400).json({
        ok: false,
        message: "To Date is required",
      });
    }

    // --------------------------------------------------------
    // MODE 2 VALIDATION - Jwalan & Illegal
    // --------------------------------------------------------
    const modeNumber = Number(mode);
    
    if (modeNumber === 2) {
      if (!req.body.jwalan) {
        return res.status(400).json({
          ok: false,
          message: "Jwalan is required for Renewal",
        });
      }

      if (!req.body.illegal || Number(req.body.illegal) === 0) {
        return res.status(400).json({
          ok: false,
          message: "Illegal Property is required for Renewal",
        });
      }
    }

    // --------------------------------------------------------
    // SERVICE CALL
    // --------------------------------------------------------
    const result = await service.applicationEntryService({
      userId,
      appid,
      appliNo,
      mode: modeNumber,
      oldLicencNo,

      shopName,
      panNo,
      contactNo,
      email,
      address,

      zoneId,
      wardId,
      isProd,
      ownSpace,
      agrmentWith,

      area,
      isCorpNOC,
      busStartYr,
      shopActNo,
      foodlicno,

      licDays,
      applitradeStr,
      applitradetypeStr,
      applidirectorStr,
      source,

      shopNameMar,
      placeOwnerName,
      placeOwnerAddress,

      fromDate,
      toDate,

      amount,
      licType,
      ulbId,
      ipAddress,
      licenseTypeId,
      arrearsAmount,
      serviceId,
      cfcRecno,
      // aomk_appli_ins specific
      propNo: propNo || "",
      marketPropNo: marketPropNo || "",
    });

    // --------------------------------------------------------
    // SUCCESS
    // --------------------------------------------------------
    if (Number(result.errorCode) === 9999) {
      return res.status(200).json({
        ok: true,
        message: result.errorMsg,
        status: "SUCCESS",
        data: {
          appId: result.appId,
          appliNo: result.appliNo,
        },
      });
    }

    // --------------------------------------------------------
    // FAILURE
    // --------------------------------------------------------
    return res.status(200).json({
      ok: false,
      message: result.errorMsg,
      status: "FAILED",
      data: {
        errorCode: result.errorCode,
        appId: result.appId,
        appliNo: result.appliNo,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// UPDATE DIRECTOR IMAGES
// ============================================================
const updateDirectorImages = asyncHandler(async (req, res) => {
  const { appid, directorIds } = req.body;

  if (!appid) {
    throw new AppError("Application ID is required.", 400);
  }

  if (!req.files || req.files.length === 0) {
    throw new AppError("Director image is required.", 400);
  }

  const result = await service.updateDirectorImagesService({
    appid,
    directorIds,
    files: req.files,
  });

  if (!result.success) {
    throw new AppError(result.error, 500);
  }

  return ok(res, "Director images updated successfully.", result);
});

// ============================================================
// DOCUMENT INSERT
// ============================================================
const documentInsert = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError("Document file is required", 400);
  }

  const result = await service.documentInsertService({
    ...req.body,
    file: req.file,
  });

  if (!result.success) {
    throw new AppError(result.errorMsg || result.error || "Failed to insert document", 400);
  }

  return ok(res, result, "Document inserted successfully");
});

// ============================================================
// GET EXISTING LICENSE DETAILS
// ============================================================

// const getExistingLicenseDetails = asyncHandler(async (req, res) => {
//   const { oldLicencNo, ulbId } = req.body;

//   console.log("📥 Get Existing License Details", {
//     oldLicencNo,
//     ulbId,
//   });

//   if (!oldLicencNo) {
//     return res.status(400).json({
//       success: false,
//       message: "Old License Number is required.",
//     });
//   }

//   if (!ulbId) {
//     return res.status(400).json({
//       success: false,
//       message: "ULB ID is required.",
//     });
//   }

//   const result = await service.getExistingLicenseDetailsService(oldLicencNo, ulbId);

//   // --------------------------------------------------------
//   // License not found
//   // --------------------------------------------------------

//   if (!result.found) {
//     return res.status(404).json({
//       success: false,
//       message: "No Licence Found",
//       data: null,
//     });
//   }

//   // --------------------------------------------------------
//   // Success
//   // --------------------------------------------------------

//   return res.status(200).json({
//     success: true,
//     message: "Existing license details fetched successfully.",
//     data: result,
//   });
// });

// ============================================================
// SEARCH LICENSE
// ============================================================

// const checkLicenseCancelled = asyncHandler(async (req, res) => {
//   const { oldLicencNo } = req.body;

//   console.log("📥 Check License Cancelled", {
//     oldLicencNo,
//   });

//   const result = await service.checkLicenseCancelledService(oldLicencNo);

//   return res.status(200).json({
//     success: true,
//     cancelled: result.cancelled,
//     message: result.cancelled ? "License is Cancelled" : "License is not Cancelled",
//   });
// });


// ============================================================
// GET TRADE TYPE RATES
// ============================================================
// const getTradTypesRates = asyncHandler(async (req, res) => {
//   const {
//     tradeTypes,
//     fromDate,
//     toDate,
//     ulbId,
//   } = req.body;

//   console.log("📥 Get Trade Type Rates", {
//     tradeTypes,
//     fromDate,
//     toDate,
//     ulbId,
//   });

//   const data = await service.getTradTypesRatesService(
//     tradeTypes,
//     fromDate,
//     toDate,
//     ulbId
//   );

//   return res.status(200).json({
//     success: true,
//     message: "Trade type rates fetched successfully.",
//     data,
//   });
// });

// ============================================================
// GET TRADE TYPES BY CATEGORY
// ============================================================
// const getTradeTypesByCategory = asyncHandler(async (req, res) => {
//   const { categoryId, type } = req.body;

//   console.log("📥 Get Trade Types By Category", {
//     categoryId,
//     type,
//   });

//   const data = await service.getTradeTypesByCategoryService(
//     categoryId,
//     type
//   );

//   return res.status(200).json({
//     success: true,
//     message: "Trade types fetched successfully.",
//     data,
//   });
// });


// ============================================================
// GET TRADE CATEGORY BY JWALAN STATUS
// ============================================================
const getTradeCategoryByJwalan = asyncHandler(async (req, res) => {
  const {
    type,
  } = req.body;

  console.log("📥 Get Trade Category By Jwalan", {
    type,
  });

  const data =
    await service.getTradeCategoryByJwalanService(
      type
    );

  return res.status(200).json({
    success: true,
    message: "Trade category fetched successfully.",
    data,
  });
});


const getZoneByWard = asyncHandler(async (req, res) => {
  const { wardId, ulbId } = req.body;

  if (!wardId) {
    return res.status(400).json({
      ok: false,
      message: "Ward ID is required",
    });
  }

  if (!ulbId) {
    return res.status(400).json({
      ok: false,
      message: "ULB ID is required",
    });
  }

  const data = await service.getZoneByWardService(wardId, ulbId);

  return res.status(200).json({
    ok: true,
    message: "Zone fetched successfully",
    data,
  });
});

// ============================================================
// GET EXISTING LICENSE DETAILS (NEW)
// ============================================================
const getExistingLicenseDetails = asyncHandler(async (req, res) => {
  const { oldLicencNo, ulbId } = req.body;

  if (!oldLicencNo) {
    return res.status(400).json({
      ok: false,
      message: "Old License Number is required",
    });
  }

  if (!ulbId) {
    return res.status(400).json({
      ok: false,
      message: "ULB ID is required",
    });
  }

  const result = await service.getExistingLicenseDetailsService(oldLicencNo, ulbId);

  if (!result.found) {
    return res.status(404).json({
      ok: false,
      message: "No Licence Found",
      data: null,
    });
  }

  return res.status(200).json({
    ok: true,
    message: "Existing license details fetched successfully",
    data: result,
  });
});

// ============================================================
// CHECK LICENSE CANCELLED (NEW)
// ============================================================
const checkLicenseCancelled = asyncHandler(async (req, res) => {
  const { oldLicencNo } = req.body;

  if (!oldLicencNo) {
    return res.status(400).json({
      ok: false,
      message: "License Number is required",
    });
  }

  const cancelled = await service.checkLicenseCancelledService(oldLicencNo);

  return res.status(200).json({
    ok: true,
    cancelled,
    message: cancelled ? "License is Cancelled" : "License is not Cancelled",
  });
});


module.exports = {
  getBusinessPlace,
  getJalanShil,
  getIllegalType,
  getApplicantType,
  getWard,
  getZoneByWard, // NEW
  getLicenseType,
  getTradeCategory,
  getTradeDetails,
  getDocumentDetails,
  getSelfDeclareData,
  getApplicationDetails,
  getExistingLicenseDetails, // NEW
  checkLicenseCancelled, // NEW
  applicationEntry,
  updateDirectorImages,
  documentInsert,
  getTradeCategoryByJwalan,
};