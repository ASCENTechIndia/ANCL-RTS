const repo = require("./FrmPropertyAppel.repo");
const { AppError } = require("../../../libs/errors");

async function submitPropAppealService(payload) {
    const {
        userId,
        ulbId,
        zoneId,
        serviceId,
        propNo,
        bilTaxNo,
        landHolder,
        structHolder,
        ownDetails,
        address,
        appliFName,
        appliMName,
        appliLName,
        mobile,
        email,
        aadhar,
        telephNo,
        objectType,
        objectDesc,
        taxDate,
        usageType,
        usageSubType,
        areaConstruct,
        annualTax,
        taxable,
        appSource,
    } = payload;

    // Basic validations
    if (!userId) {
        throw new AppError("User ID is required", 400);
    }

    if (!zoneId) {
        throw new AppError("Zone ID is required", 400);
    }

    if (!serviceId) {
        throw new AppError("Service ID is required", 400);
    }

    if (!propNo) {
        throw new AppError("Property Number is required", 400);
    }

    if (!address) {
        throw new AppError("Address is required", 400);
    }

    if (!ulbId) {
        throw new AppError("ULB ID is required", 400);
    }

    if (!appliFName) {
        throw new AppError("Applicant First Name is required", 400);
    }

    if (!bilTaxNo) {
        throw new AppError("Bill/Tax Notice No is required", 400);
    }

    const result = await repo.insertPropAppeal({
        userId,
        ulbId,
        zoneId,
        serviceId,
        propNo,
        bilTaxNo,
        landHolder,
        structHolder,
        ownDetails,
        address,
        appliFName,
        appliMName,
        appliLName,
        mobile,
        email,
        aadhar,
        telephNo,
        objectType,
        objectDesc,
        taxDate,
        usageType,
        usageSubType,
        areaConstruct,
        annualTax,
        taxable,
        appSource,
    });

    if (Number(result.out_errcode) !== 9999) {
        return {
            success: false,
            errorCode: result.out_errcode,
            message: result.out_ErrMsg,
        };
    }

    const rawMsg = result.out_ErrMsg || "";
    const appNoMatch = rawMsg.match(/Appli\s*no\s*:\s*(.+)$/i);
    const applicationNo = appNoMatch ? appNoMatch[1].trim() : null;

    const message = rawMsg.split("$")[0] || "Property Appeal submitted successfully";

    return {
        success: true,
        errorCode: result.out_errcode,
        message,
        applicationNo,
        redirectTo: "FrmPropAppealSummary",
    };
}

async function getObjectionsService() {
  const rows = await repo.fetchObjections();

  if (!rows || rows.length === 0) {
    return { success: true, objections: [] };
  }

  if (rows[0] && rows[0].VAR_OBJECTION_NAME !== undefined) {
    return {
      success: true,
      objections: rows.map(r => ({
        objectionName: r.VAR_OBJECTION_NAME.trim(),
        objectionId: r.NUM_OBJECTION_ID
      }))
    };
  }

  return {
    success: true,
    objections: rows.map(r => ({
      objectionName: r[0].trim(),
      objectionId: r[1]
    }))
  };
}

module.exports = {
    submitPropAppealService, getObjectionsService
};
