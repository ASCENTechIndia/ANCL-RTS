const repo = require("./FrmNoDuesCerti.repo");
const { AppError } = require("../../../libs/errors");

async function submitNoDuesCertificateApplicationService(payload) {
  const {
    userId,
    zoneId,
    serviceId,
    propNo,
    subCode,
    landHolder,
    structHolder,
    ownDetails,
    address,
    appliname,
    mobile,
    email,
    taxAmount,
    aadharNo,
    appSource,
    ulbid
  } = payload;

  // Validation
  if (!userId) throw new AppError("User ID is required", 400);
  if (!zoneId) throw new AppError("Zone ID is required", 400);
  if (!serviceId) throw new AppError("Service ID is required", 400);
  if (!propNo) throw new AppError("Property Number is required", 400);
  if (!appliname) throw new AppError("Applicant Name is required", 400);
  if (!mobile) throw new AppError("Mobile Number is required", 400);
  if (String(mobile).length !== 10) throw new AppError("Mobile Number must be 10 digits", 400);
  if (!email) throw new AppError("Email ID is required", 400);

  const emailRegex = /^([\w\.\-]+)@([\w\-]+)((\.(\w){2,3})+)$/;
  if (!emailRegex.test(email)) throw new AppError("Invalid Email Address", 400);

  if (aadharNo && String(aadharNo).length !== 12) {
    throw new AppError("Aadhar Number must be 12 digits", 400);
  }

  const appResult = await repo.insertNoDuesCertificateApplication({
    userId,
    zoneId,
    serviceId,
    propNo,
    subCode: subCode || "",
    landHolder: landHolder || "",
    structHolder: structHolder || "",
    ownDetails: ownDetails || "",
    address: address || "",
    appliname,
    mobile,
    email,
    taxAmount: taxAmount || 0,
    aadharNo: aadharNo || 0,
    appSource: appSource || "WEB",
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
  const message = parts[0] || "Application submitted successfully";

  return {
    success: true,
    errorCode: appResult.out_errcode,
    message: message,
    applicationNo: applicationNo,
  };
}

module.exports = {
  submitNoDuesCertificateApplicationService,
};