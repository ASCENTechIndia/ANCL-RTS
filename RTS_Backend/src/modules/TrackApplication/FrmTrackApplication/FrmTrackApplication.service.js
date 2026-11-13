const repo = require("./FrmTrackApplication.repo");

// ============================================================
// GET APPLICATION DETAILS
// ============================================================
const getApplicationDetailsService = async (userId, ulbId) => {
  if (!userId) {
    throw new Error("User ID is required.");
  }

  if (!ulbId) {
    throw new Error("ULB ID is required.");
  }

  const data = await repo.getApplicationDetailsRepo(userId, ulbId);

  return {
    success: true,
    data,
  };
};

// ============================================================
// GET APPLICATION DOCUMENTS
// ============================================================
const getApplicationDocumentsService = async (applino) => {
  if (!applino) {
    throw new Error("Application Number is required.");
  }

  const data = await repo.getApplicationDocumentsRepo(applino);

  return {
    success: true,
    data,
  };
};

// ============================================================
// GET APPEAL DETAILS
// ============================================================
const getAppealDetailsService = async (appno) => {
  if (!appno) {
    throw new Error("Application Number is required.");
  }

  const data = await repo.getAppealDetailsRepo(appno);

  return {
    success: true,
    data,
  };
};

// ============================================================
// GET APPLICATION CERTIFICATE
// ============================================================

const getApplicationCertificateService = async (applino) => {
  if (!applino) {
    throw new Error("Application Number is required.");
  }

  const data = await repo.getApplicationCertificateRepo(applino);

  return {
    success: true,
    data,
  };
};

// ============================================================
// GET PAYMENT FLAG
// ============================================================
const getPaymentFlagService = async () => {
  const rows = await repo.getPaymentFlagRepo();

  return {
    success: true,
    data: rows.length > 0 ? rows[0].L_DOCSERVICEID || "" : "",
  };
};

// ============================================================
// CHECK PAYMENT
// ============================================================
const checkPaymentService = async (applino, serviceId) => {
  if (!applino) {
    throw new Error("Application Number is required.");
  }

  if (!serviceId) {
    throw new Error("Service ID is required.");
  }

  // Get services where document verification is required
  const flagRows = await repo.getPaymentFlagRepo();

  const docServiceIds = flagRows.length > 0 && flagRows[0].L_DOCSERVICEID ? flagRows[0].L_DOCSERVICEID.split(",") : [];

  console.log("docServiceIds", docServiceIds);
  let checkValue = true;

  // Same logic as:
  // if (docIds.Contains(serviceId))
  if (docServiceIds.includes(String(serviceId))) {
    const rows = await repo.checkPaymentRepo(applino);

    if (rows.length > 0 && rows[0].VAR_APPLICATION_STATUS === "CP") {
      checkValue = false;
    }
  }

  return {
    success: true,
    checkval: checkValue,
  };
};

// ============================================================
// GET APPLICATION PAYMENT DETAILS
// ============================================================
const getApplicationPaymentDetailsService = async (applino, serviceId) => {
  if (!applino) {
    throw new Error("Application Number is required.");
  }

  if (!serviceId) {
    throw new Error("Service ID is required.");
  }

  // Get document verification service IDs
  const flagRows = await repo.getPaymentFlagRepo();

  const docServiceIds = flagRows.length > 0 && flagRows[0].L_DOCSERVICEID ? flagRows[0].L_DOCSERVICEID.split(",") : [];

  const isDocVerifyService = docServiceIds.includes(String(serviceId));

  const rows = await repo.getApplicationPaymentDetailsRepo(applino, isDocVerifyService);

  if (!rows || rows.length === 0) {
    return {
      found: false,
      data: null,
    };
  }

  const row = rows[0];

  return {
    found: true,
    data: {
      appNo: row.VAR_APPL_APPNO,
      serviceName: row.VAR_SERVICE_ENG_NAME,
      email: row.VAR_APPL_EMAIL,
      contactNo: row.MOBNO,
      placeOwnerName: row.VAR_APPL_FIRSTNAME,
      address: row.VAR_APPL_ADDRESS,
      serviceRate: row.RATE,
    },
  };
};

// ============================================================
// GET APPLICATION STEPS / TRACKING DETAILS
// ============================================================
const getApplicationStepsService = async (ulbId, applino, serviceId) => {
  if (!ulbId) {
    throw new Error("ULB ID is required.");
  }

  if (!applino) {
    throw new Error("Application Number is required.");
  }

  if (!serviceId) {
    throw new Error("Service ID is required.");
  }

  const data = await repo.getApplicationStepsRepo(ulbId, applino, serviceId);

  return {
    success: true,
    data,
  };
};

// ============================================================
// GET CERTIFICATE DATA
// ============================================================
const getCertificateDataService = async (serviceId, appNo, ulbId) => {
  if (!serviceId) {
    throw new Error("Service ID is required.");
  }

  if (!appNo) {
    throw new Error("Application Number is required.");
  }

  if (!ulbId) {
    throw new Error("ULB ID is required.");
  }

  const data = await repo.getCertificateDataRepo(serviceId, appNo, ulbId);

  return {
    success: true,
    data,
  };
};
// ============================================================
// GET RE-APPLY SERVICE DETAILS
// ============================================================
const getReApplyServiceDetailsService = async (serviceId) => {
  if (!serviceId) {
    throw new Error("Service ID is required.");
  }

  const rows = await repo.getReApplyServiceDetailsRepo(serviceId);

  if (!rows || rows.length === 0) {
    return {
      found: false,
      message: "Service details not found",
      data: null,
    };
  }

  const service = rows[0];

  let serviceUrl = service.VAR_SERVICE_URL;

  // Same logic as C#:
  // if URL contains @ -> use &
  // otherwise -> use ?
  let redirectUrl = "";

  if (serviceUrl.includes("@")) {
    redirectUrl = `${serviceUrl}&Type=RA`;
  } else {
    redirectUrl = `${serviceUrl}?Type=RA`;
  }

  return {
    found: true,
    data: {
      serviceId: serviceId,
      serviceName: service.VAR_SERVICE_ENG_NAME,
      serviceRate: service.NUM_SERVICE_RATE,
      serviceUrl: serviceUrl,
      redirectUrl: redirectUrl,
    },
  };
};

// ============================================================
// INSERT CERTIFICATE DOCUMENT SERVICE
// ============================================================
const insertCertificateDocService = async (applino, userId, pdfBuffer) => {
  if (!applino) {
    throw new Error("Application Number is required.");
  }
  if (!userId) {
    throw new Error("User ID is required.");
  }
  if (!pdfBuffer) {
    throw new Error("PDF buffer is required.");
  }

  const result = await repo.insertCertificateDocRepo(applino, userId, pdfBuffer);

  return {
    success: true,
    data: result,
  };
};

// ============================================================
// UPDATE CERTIFICATE STATUS SERVICE
// ============================================================
const updateCertificateStatusService = async (serviceId, applino, userId) => {
  if (!serviceId) {
    throw new Error("Service ID is required.");
  }
  if (!applino) {
    throw new Error("Application Number is required.");
  }
  if (!userId) {
    throw new Error("User ID is required.");
  }

  const result = await repo.updateCertificateStatusRepo(serviceId, applino, userId);

  return {
    success: true,
    data: result,
  };
};

// ============================================================
// GET CERTIFICATE DOCUMENT SERVICE
// ============================================================
const getCertificateDocService = async (applino) => {
  if (!applino) {
    throw new Error("Application Number is required.");
  }

  const result = await repo.getCertificateDocRepo(applino);

  return {
    success: true,
    data: result,
  };
};

// ============================================================
// GET DOCUMENT BY ID SERVICE
// ============================================================
const getDocumentByIdService = async (docId) => {
  if (!docId) {
    throw new Error("Document ID is required.");
  }

  const result = await repo.getDocumentByIdRepo(docId);

  return {
    success: true,
    data: result,
  };
};

// ============================================================
// GENERATE AND DOWNLOAD CERTIFICATE SERVICE (Complete Flow)
// ============================================================
const generateAndDownloadCertificateService = async (applino, serviceId, userId, ulbId) => {
  if (!applino) {
    throw new Error("Application Number is required.");
  }
  if (!serviceId) {
    throw new Error("Service ID is required.");
  }
  if (!userId) {
    throw new Error("User ID is required.");
  }
  if (!ulbId) {
    throw new Error("ULB ID is required.");
  }

  // 1. Check if certificate already exists in your custom table
  const existingCert = await repo.getCertificateDocRepo(applino);
  
  if (existingCert && existingCert.length > 0) {
    return {
      success: true,
      exists: true,
      data: existingCert[0],
    };
  }

  const certData = await repo.getCertificateDataRepo(serviceId, applino, ulbId);
  
  if (!certData || certData.length === 0) {
    return {
      success: false,
      exists: false,
      message: "Certificate data not found for this application.",
    };
  }
  
  return {
    success: true,
    exists: false,
    data: certData,
  };
};

const generateCertificateReportService = async (payload) => {
  const { serviceId, appNo, ulbId } = payload;

  if (!serviceId) {
    throw new Error("Service ID is required.");
  }

  if (!appNo) {
    throw new Error("Application Number is required.");
  }

  if (!ulbId) {
    throw new Error("ULB ID is required.");
  }

  const rows = await repo.getCertificateDataRepo(serviceId, appNo, ulbId);

  console.log("Certificate Data From Repo:", rows);

  if (!rows || rows.length === 0) {
    return {
      status: "FAILED",
      data: [],
      message: "No Record Found For Print",
    };
  }

  return {
    status: "SUCCESS",
    data: rows,
    message: "Certificate data fetched successfully",
  };
};

module.exports = {
  getApplicationDetailsService,
  getApplicationDocumentsService,
  getAppealDetailsService,
  getApplicationCertificateService,
  getPaymentFlagService,
  checkPaymentService,
  getApplicationPaymentDetailsService,
  getApplicationStepsService,
  getCertificateDataService,
  getReApplyServiceDetailsService,
  insertCertificateDocService,
  updateCertificateStatusService,
  getCertificateDocService,
  getDocumentByIdService,
  generateAndDownloadCertificateService,
  generateCertificateReportService

};
