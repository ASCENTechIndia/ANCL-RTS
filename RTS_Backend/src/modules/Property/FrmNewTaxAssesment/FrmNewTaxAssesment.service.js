const repo = require("./FrmNewTaxAssesment.repo");
const { AppError } = require("../../../libs/errors");

async function submitNewTaxAssessmentService(payload) {
  const {
    userId,
    zoneId,
    serviceId,
    appliName,
    appliAdd,
    propConstrFlag,
    propUsageFlag,
    permisCertNo,
    parvanaCertNo,
    parvanaDate,
    propTypeFlag,
    sectorNo,
    remarkSurvey,
    prabhagKarType,
    vikasAppealNo,
    propOwnName,
    vikasName,
    taxesReceipt,
    appSource,
    ulbid,
  } = payload;

  if (!userId) throw new AppError("User ID is required", 400);
  if (!zoneId) throw new AppError("Zone ID is required", 400);
  if (!serviceId) throw new AppError("Service ID is required", 400);
  if (!appliName) throw new AppError("Applicant Name is required", 400);
  if (!appliAdd) throw new AppError("Applicant Address is required", 400);

  const appResult = await repo.insertNewTaxAssessment({
    userId,
    zoneId,
    serviceId,
    appliName,
    appliAdd,
    propConstrFlag,
    propUsageFlag,
    permisCertNo,
    parvanaCertNo,
    parvanaDate,
    propTypeFlag,
    sectorNo,
    remarkSurvey,
    prabhagKarType,
    vikasAppealNo,
    propOwnName,
    vikasName,
    taxesReceipt,
    appSource,
    ulbid,
  });

  if (Number(appResult.out_errcode) !== 9999) {
    return {
      success: false,
      errorCode: appResult.out_errcode,
      message: appResult.out_ErrMsg,
    };
  }

  const applicationNo = appResult.out_applino;
  const parts = appResult.out_ErrMsg.split("$");
  const message = parts[0] || "Assessment submitted successfully";

  return {
    success: true,
    errorCode: appResult.out_errcode,
    message: message,
    applicationNo: applicationNo,
  };
}

async function getWardsByUlbService(ulbid) {
  if (!ulbid) throw new AppError("ULBID is required", 400);

  const rows = await repo.fetchWardsByUlb(ulbid);

  if (!rows || rows.length === 0) {
    return { success: true, wards: [] };
  }

  if (rows[0] && rows[0].WARDNAME !== undefined) {
    return {
      success: true,
      wards: rows.map(r => ({
        wardName: r.WARDNAME.trim(),
        wardId: r.WARDID
      }))
    };
  }

  return {
    success: true,
    wards: rows.map(r => ({
      wardName: r[0].trim(),
      wardId: r[1]
    }))
  };
}


module.exports = { submitNewTaxAssessmentService , getWardsByUlbService };
