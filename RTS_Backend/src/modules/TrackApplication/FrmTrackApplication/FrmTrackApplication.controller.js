const asyncHandler = require("../../../libs/asyncHandler");
const service = require("./FrmTrackApplication.service");
const { ok, fail } = require("../../../libs/response");
const path = require("path");
const { AppError } = require("../../../libs/errors");

const { ExtractOfPropertyReportHelper } = require("../../../utils/pdfHelper/FrmTrackApplication");
const { getCorporationDetailsService } = require("../../Dashboard/Dashboard.service");
const FrmServiceCertificatePdfHelper = require("../../../utils/pdfHelper/FrmServiceCertificatePdfHelper");

// ============================================================
// GET APPLICATION DETAILS
// ============================================================
const getApplicationDetails = asyncHandler(async (req, res) => {
  const { userId, ulbId } = req.body;

  console.log("📥 Get Track Application Details", {
    userId,
    ulbId,
  });

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "User ID is required.",
      data: null,
    });
  }

  if (!ulbId) {
    return res.status(400).json({
      success: false,
      message: "ULB ID is required.",
      data: null,
    });
  }

  const result = await service.getApplicationDetailsService(userId, ulbId);

  return res.status(200).json({
    success: true,
    message: "Application details fetched successfully.",
    data: result.data,
  });
});

// ============================================================
// GET APPLICATION DOCUMENTS
// ============================================================
const getApplicationDocuments = asyncHandler(async (req, res) => {
  const { applino } = req.body;

  console.log("📥 Get Application Documents", {
    applino,
  });

  if (!applino) {
    return res.status(400).json({
      success: false,
      message: "Application Number is required.",
      data: null,
    });
  }

  const result = await service.getApplicationDocumentsService(applino);

  return res.status(200).json({
    success: true,
    message: "Application documents fetched successfully.",
    data: result.data,
  });
});

// ============================================================
// GET APPEAL DETAILS
// ============================================================
const getAppealDetails = asyncHandler(async (req, res) => {
  const { appno } = req.body;

  console.log("📥 Get Appeal Details", {
    appno,
  });

  if (!appno) {
    return res.status(400).json({
      success: false,
      message: "Application Number is required.",
      data: null,
    });
  }

  const result = await service.getAppealDetailsService(appno);

  return res.status(200).json({
    success: true,
    message: "Appeal details fetched successfully.",
    data: result.data,
  });
});

// ============================================================
// GET APPLICATION CERTIFICATE
// ============================================================

const getApplicationCertificate = asyncHandler(async (req, res) => {
  const { applino } = req.body;

  console.log("📥 Get Application Certificate", {
    applino,
  });

  const result = await service.getApplicationCertificateService(applino);
  console.log({result: result.data})
  if (!result.data || result.data.length === 0) {
    return res.status(404).json({
      success: false,
      message: "Certificate not found",
      data: null,
    });
  }

  return res.status(200).json({
    success: true,
    message: "Application certificate fetched successfully",
    data: result.data,
  });
});

// ============================================================
// GET PAYMENT FLAG
// ============================================================
const getPaymentFlag = asyncHandler(async (req, res) => {
  const result = await service.getPaymentFlagService();

  return res.status(200).json({
    success: true,
    message: "Payment flag fetched successfully.",
    data: result.data,
  });
});
// ============================================================
// CHECK PAYMENT
// ============================================================
const checkPayment = asyncHandler(async (req, res) => {
  const { applino, serviceId } = req.body;

  console.log("📥 Check Payment", {
    applino,
    serviceId,
  });

  if (!applino) {
    return res.status(400).json({
      success: false,
      message: "Application Number is required.",
    });
  }

  if (!serviceId) {
    return res.status(400).json({
      success: false,
      message: "Service ID is required.",
    });
  }

  const result = await service.checkPaymentService(applino, serviceId);

  return res.status(200).json({
    success: true,
    message: "Payment status checked successfully.",
    data: result.checkval,
  });
});

// ============================================================
// GET APPLICATION PAYMENT DETAILS
// ============================================================
const getApplicationPaymentDetails = asyncHandler(async (req, res) => {
  const { applino, serviceId } = req.body;

  console.log("📥 Get Application Payment Details", {
    applino,
    serviceId,
  });

  if (!applino) {
    return res.status(400).json({
      success: false,
      message: "Application Number is required.",
    });
  }

  if (!serviceId) {
    return res.status(400).json({
      success: false,
      message: "Service ID is required.",
    });
  }

  const result = await service.getApplicationPaymentDetailsService(applino, serviceId);

  if (!result.found) {
    return res.status(404).json({
      success: false,
      message: "Application payment details not found.",
      data: null,
    });
  }

  return res.status(200).json({
    success: true,
    message: "Application payment details fetched successfully.",
    data: result.data,
  });
});

// ============================================================
// GET APPLICATION STEPS / TRACKING DETAILS
// ============================================================
const getApplicationSteps = asyncHandler(async (req, res) => {
  const { ulbId, applino, serviceId } = req.body;

  console.log("📥 Get Application Steps", {
    ulbId,
    applino,
    serviceId,
  });

  const data = await service.getApplicationStepsService(ulbId, applino, serviceId);

  return ok(res, data, "Application steps fetched successfully");
});

// ============================================================
// GET CERTIFICATE DATA
// ============================================================
const getCertificateData = async (req, res, next) => {
  try {
    const { serviceId, appNo, ulbId } = req.body;

    console.log("📥 Get Certificate Data", {
      serviceId,
      appNo,
      ulbId,
    });

    if (!serviceId) {
      return res.status(400).json({
        success: false,
        message: "Service ID is required.",
      });
    }

    if (!appNo) {
      return res.status(400).json({
        success: false,
        message: "Application Number is required.",
      });
    }

    if (!ulbId) {
      return res.status(400).json({
        success: false,
        message: "ULB ID is required.",
      });
    }

    const result = await service.getCertificateDataService(serviceId, appNo, ulbId);

    return res.status(200).json({
      success: true,
      message: "Certificate data fetched successfully.",
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET RE-APPLY SERVICE DETAILS
// ============================================================
const getReApplyServiceDetails = asyncHandler(async (req, res) => {
  const { serviceId } = req.body;

  console.log("📥 Get Re-Apply Service Details", {
    serviceId,
  });

  const result = await service.getReApplyServiceDetailsService(serviceId);

  if (!result.found) {
    return res.status(404).json({
      success: false,
      message: result.message,
      data: null,
    });
  }

  return res.status(200).json({
    success: true,
    message: "Re-apply service details fetched successfully.",
    data: result.data,
  });
});

// ============================================================
// INSERT CERTIFICATE DOCUMENT
// ============================================================
const insertCertificateDoc = asyncHandler(async (req, res) => {
  const { applino, userId, pdfBuffer } = req.body;

  console.log("📥 Insert Certificate Document", { applino, userId });

  if (!applino) {
    return res.status(400).json({
      success: false,
      message: "Application Number is required.",
    });
  }

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "User ID is required.",
    });
  }

  if (!pdfBuffer) {
    return res.status(400).json({
      success: false,
      message: "PDF buffer is required.",
    });
  }

  const result = await service.insertCertificateDocService(applino, userId, pdfBuffer);

  return res.status(200).json({
    success: true,
    message: "Certificate document inserted successfully.",
    data: result.data,
  });
});

// ============================================================
// UPDATE CERTIFICATE STATUS
// ============================================================
const updateCertificateStatus = asyncHandler(async (req, res) => {
  const { serviceId, applino, userId } = req.body;

  console.log("📥 Update Certificate Status", { serviceId, applino, userId });

  if (!serviceId) {
    return res.status(400).json({
      success: false,
      message: "Service ID is required.",
    });
  }

  if (!applino) {
    return res.status(400).json({
      success: false,
      message: "Application Number is required.",
    });
  }

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "User ID is required.",
    });
  }

  const result = await service.updateCertificateStatusService(serviceId, applino, userId);

  return res.status(200).json({
    success: true,
    message: "Certificate status updated successfully.",
    data: result.data,
  });
});

// ============================================================
// GET CERTIFICATE DOCUMENT
// ============================================================
const getCertificateDoc = asyncHandler(async (req, res) => {
  const { applino } = req.body;

  console.log("📥 Get Certificate Document", { applino });

  if (!applino) {
    return res.status(400).json({
      success: false,
      message: "Application Number is required.",
    });
  }

  const result = await service.getCertificateDocService(applino);

  return res.status(200).json({
    success: true,
    message: "Certificate document fetched successfully.",
    data: result.data,
  });
});

// ============================================================
// DOWNLOAD DOCUMENT BY ID - Matches btnView_Click in DOTNET
// ============================================================
const downloadDocumentById = asyncHandler(async (req, res) => {
  const { docId } = req.body;

  console.log("📥 Download Document", { docId });

  if (!docId) {
    return res.status(400).json({
      success: false,
      message: "Document ID is required.",
    });
  }

  const result = await service.getDocumentByIdService(docId);

  if (!result.data || result.data.length === 0) {
    return res.status(404).json({
      success: false,
      message: "Document not found.",
    });
  }

  const doc = result.data[0];

  if (!doc.filebytes) {
    return res.status(404).json({
      success: false,
      message: "Document file not found.",
    });
  }

  // Convert base64 to buffer
  const pdfBuffer = Buffer.from(doc.filebytes, "base64");
  const filename = `${doc.docname || "Document"}_${docId}.pdf`;

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
  res.setHeader("Content-Length", pdfBuffer.length);

  return res.send(pdfBuffer);
});

// ============================================================
// GENERATE AND DOWNLOAD CERTIFICATE - Complete Flow
// Matches NOCCerti() + lnkstatus_Click in DOTNET
// ============================================================
const generateAndDownloadCertificate = asyncHandler(async (req, res) => {
  const { applino, serviceId, userId, ulbId } = req.body;

  console.log("📥 Generate and Download Certificate", { applino, serviceId, userId, ulbId });

  if (!applino) {
    return res.status(400).json({
      success: false,
      message: "Application Number is required.",
    });
  }

  if (!serviceId) {
    return res.status(400).json({
      success: false,
      message: "Service ID is required.",
    });
  }

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "User ID is required.",
    });
  }

  if (!ulbId) {
    return res.status(400).json({
      success: false,
      message: "ULB ID is required.",
    });
  }

  // 1. Check if certificate already exists in custom table
  const existingCert = await service.getCertificateDocService(applino);

  if (existingCert.data && existingCert.data.length > 0) {
    const cert = existingCert.data[0];
    if (cert.filebytes) {
      const pdfBuffer = Buffer.from(cert.filebytes, "base64");
      const filename = `Certificate_${applino}.pdf`;

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
      res.setHeader("Content-Length", pdfBuffer.length);

      return res.send(pdfBuffer);
    }
  }

  // 2. Get certificate data from service-specific tables
  const certDataResult = await service.getCertificateDataService(serviceId, applino, ulbId);

  if (!certDataResult.data || certDataResult.data.length === 0) {
    return res.status(404).json({
      success: false,
      message: "Certificate data not found for this application.",
    });
  }

  // 3. Generate PDF (you need to implement this with your PDF library)
  // This should generate PDF with QR code, data, etc.
  // For now, using a placeholder - you need to implement actual PDF generation
  const pdfBuffer = await generateCertificatePDF(certDataResult.data, serviceId);

  if (!pdfBuffer) {
    return res.status(500).json({
      success: false,
      message: "Failed to generate certificate PDF.",
    });
  }

  // 4. Insert certificate document into custom table
  await service.insertCertificateDocService(applino, userId, pdfBuffer);

  // 5. Update certificate status (tracking)
  await service.updateCertificateStatusService(serviceId, applino, userId);

  // 6. Download the certificate
  const filename = `Certificate_${applino}.pdf`;

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
  res.setHeader("Content-Length", pdfBuffer.length);

  return res.send(pdfBuffer);
});

const generateCertificatePDF = async (certData, serviceId) => {
  console.log("Generating PDF for service:", serviceId, "with data:", certData);
  const placeholderBuffer = Buffer.from("PDF content placeholder", "utf-8");
  return placeholderBuffer;
};

const generateCertificateReport = asyncHandler(async (req, res) => {
  console.log("Request: Generate Certificate Report");
  console.log("Request Body:", req.body);

  const filters = req.body;

  // ------------------------------------------------------
  // Validation
  // ------------------------------------------------------

  if (!filters.serviceId) {
    throw new AppError("serviceId is required", 400);
  }

  if (!filters.appNo) {
    throw new AppError("appNo is required", 400);
  }

  if (!filters.ulbId) {
    throw new AppError("ulbId is required", 400);
  }

  // ------------------------------------------------------
  // 1. Get Certificate Data
  // ------------------------------------------------------

  const serviceResult = await service.generateCertificateReportService(filters);

  console.log("Certificate Service Result:", serviceResult);

  if (!serviceResult || serviceResult.status !== "SUCCESS" || !serviceResult.data || serviceResult.data.length === 0) {
    return res.status(404).json({
      success: false,
      message: serviceResult?.message || "No Record Found For Print",
    });
  }

  const reportData = serviceResult.data;
  console.log("reportData: ", reportData);

  // ------------------------------------------------------
  // 2. Get Corporation Information
  // ------------------------------------------------------

  const corporationResponse = await getCorporationDetailsService({
    corporationId: filters.ulbId,
  });

  const corporationData = corporationResponse?.data || {};

  const corporation = corporationData?.corporation || {};

  const corporationName = corporation?.VAR_CORPORATION_NAME || "";

  let ulbLogo = "";

  if (corporationData?.logo) {
    ulbLogo = `data:image/png;base64,${corporationData.logo}`;
  }

  // ------------------------------------------------------
  // 3. Generate PDF
  // ------------------------------------------------------

  let pdf;

  if (["840", "841", "842", "843", "844", "845", "846"].includes(filters.serviceId)) {
    pdf = await FrmServiceCertificatePdfHelper({
      rows: reportData,
      corporationName: corporationName || "",
      ulbLogo: ulbLogo || path.join(process.cwd(), "public", "tmclogo.jpg"),
      serviceId: filters.serviceId,
      appNo: filters.appNo,
      ulbId: filters.ulbId,
    });
  } else {
    pdf = await ExtractOfPropertyReportHelper({
      rows: reportData,
      corporationName: corporationName || "",
      ulbLogo: ulbLogo || path.join(process.cwd(), "public", "tmclogo.jpg"),
      reportName: "मालमत्ता कर उतारा",
      serviceId: filters.serviceId,
      appNo: filters.appNo,
      ulbId: filters.ulbId,
    });
  }

  // ------------------------------------------------------
  // 4. Validate PDF
  // ------------------------------------------------------

  if (!pdf || !pdf.filePath) {
    return res.status(500).json({
      success: false,
      message: "PDF generation failed",
    });
  }

  // ------------------------------------------------------
  // 5. Construct PDF URL
  // ------------------------------------------------------

  console.log({ URL: process.env.BASE_URL })
  // const pdfUrl = `${baseUrl}/pdf/${path.basename(pdf.filePath)}`;
  const pdfUrl = `${process.env.BASE_URL}/pdf/${path.basename(
    pdf.filePath
  )}`;
  // ------------------------------------------------------
  // 6. Return Response
  // ------------------------------------------------------

  return res.json({
    success: true,
    message: "PDF Generated Successfully",
    fileName: pdf.fileName,
    pdfUrl,
    serviceId: filters.serviceId,
    appNo: filters.appNo,
  });
});

module.exports = {
  getApplicationDetails,
  getApplicationDocuments,
  getAppealDetails,
  getApplicationCertificate,
  getPaymentFlag,
  checkPayment,
  getApplicationPaymentDetails,
  getApplicationSteps,
  getCertificateData,
  getReApplyServiceDetails,
  insertCertificateDoc,
  updateCertificateStatus,
  getCertificateDoc,
  downloadDocumentById,
  generateAndDownloadCertificate,
  generateCertificateReport,
};
