const asyncHandler = require("../../../libs/asyncHandler");
const { AppError } = require("../../../libs/errors");

const service = require("./FrmAfterTransactionTMC.service");

const { AfterTransactionReportHelper } = require("../../../utils/pdfHelper/FrmAfterTransactionTMC");

const { getCorporationDetailsService } = require("../../Dashboard/Dashboard.service");

const path = require("path");

// ============================================================
// GENERATE PAYMENT ACKNOWLEDGEMENT PDF
// ============================================================

const generatePaymentAcknowledgement = asyncHandler(async (req, res) => {

  const filters = req.body;

  // ----------------------------------------------------------
  // VALIDATION
  // ----------------------------------------------------------

  if (!filters.serviceId) {
    throw new AppError("serviceId is required", 400);
  }

  if (!filters.appNo) {
    throw new AppError("appNo is required", 400);
  }

  if (!filters.ulbId) {
    throw new AppError("ulbId is required", 400);
  }

  // ----------------------------------------------------------
  // 1. GET PAYMENT ACKNOWLEDGEMENT DATA
  // ----------------------------------------------------------

  const serviceResult = await service.getPaymentAcknowledgementService({
    serviceId: Number(filters.serviceId),
    appNo: filters.appNo,
  });


  if (!serviceResult || serviceResult.status !== "SUCCESS" || !Array.isArray(serviceResult.data) || serviceResult.data.length === 0) {
    return res.status(404).json({
      success: false,
      message: serviceResult?.message || "Payment acknowledgement details not found.",
    });
  }

  const row = serviceResult.data[0];

  // ----------------------------------------------------------
  // 2. GET CORPORATION NAME + LOGO
  // ----------------------------------------------------------

  const corporationResponse = await getCorporationDetailsService({
    corporationId: Number(filters.ulbId),
  });
  const corporationData = corporationResponse?.data || {};

  const corporation = corporationData?.corporation || {};
  const corporationName = corporation?.VAR_CORPORATION_NAME || "";
  let ulbLogo = "";

  if (corporationData?.logo) {
    ulbLogo = `data:image/png;base64,${corporationData.logo}`;
  }

  const pdf = await AfterTransactionReportHelper({
    row,
    corporationName,
    logo: ulbLogo || path.join(process.cwd(), "public", "tmclogo.jpg"),
  });
  // ----------------------------------------------------------
  // 5. VALIDATE PDF
  // ----------------------------------------------------------

  if (!pdf || !pdf.filePath) {
    return res.status(500).json({
      success: false,
      message: "PDF generation failed",
    });
  }

  // ----------------------------------------------------------
  // 6. PDF URL
  // ----------------------------------------------------------

  const baseUrl = `${req.protocol}://${req.get("host")}`;

  const pdfUrl = `${baseUrl}/pdf/${path.basename(pdf.filePath)}`;

  // ----------------------------------------------------------
  // 7. RESPONSE
  // ----------------------------------------------------------

  return res.status(200).json({
    success: true,
    message: "Payment Acknowledgement PDF Generated Successfully",
    fileName: pdf.fileName,
    pdfUrl,
    serviceId: Number(filters.serviceId),
    appNo: filters.appNo,
    ulbId: Number(filters.ulbId),
  });
});

module.exports = {
  generatePaymentAcknowledgement,
};
