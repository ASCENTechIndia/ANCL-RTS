const repo = require("./FrmPropertyAppel.repo");
const { AppError } = require("../../../libs/errors");

const mapWard = (r) => ({
  wardId: r.WARDID ?? r.wardid,
  wardName: (r.WARDNAME ?? r.wardname)?.trim(),
});

const mapUsageType = (r) => ({
  usageTypeId: r.NUM_USAGETYPE_ID ?? r.num_usagetype_id,
  usageTypeName: (r.VAR_USAGETYPE_NAME ?? r.var_usagetype_name)?.trim(),
});

const mapObjection = (r) => ({
  objectionId: r.NUM_OBJECTION_ID ?? r.num_objection_id,
  objectionName: (r.VAR_OBJECTION_NAME ?? r.var_objection_name)?.trim(),
});

const mapUsageSubType = (r) => ({
  usageSubTypeId: r.NUM_USAGESUBTYPE_ID ?? r.num_usagesubtype_id,
  usageSubTypeName: (r.VAR_USAGESUBTYPE_NAME ?? r.var_usagesubtype_name)?.trim(),
});

async function getWardsService(ulbId) {
  if (!ulbId) throw new AppError("ULB ID is required", 400);
  const rows = await repo.fetchWards(ulbId);
  return rows.map(mapWard);
}

async function getUsageTypesService() {
  const rows = await repo.fetchUsageTypes();
  return rows.map(mapUsageType);
}

async function getObjectionsService() {
  const rows = await repo.fetchObjections();
  return rows.map(mapObjection);
}

async function getUsageSubTypesService(usageTypeId) {
  if (!usageTypeId) throw new AppError("Usage Type ID is required", 400);
  const rows = await repo.fetchUsageSubTypes(usageTypeId);
  return rows.map(mapUsageSubType);
}

async function getServiceUrlService(ulbId) {
  if (!ulbId) throw new AppError("ULB ID is required", 400);
  const url = await repo.fetchServiceUrl(ulbId);
  return { clientUrl: url };
}

async function submitPropAppealService(payload) {
  const {
    userId, ulbId, zoneId, serviceId, propNo, bilTaxNo,
    landHolder, structHolder, ownDetails, address,
    appliFName, appliMName, appliLName,
    mobile, email, aadhar, telephNo,
    objectType, objectDesc, taxDate,
    usageType, usageSubType, areaConstruct, annualTax, taxable,
    appSource,
    ownEngFName, ownEngMName, ownEngLName,
    ownMraFName, ownMraMName, ownMraLName,
  } = payload;

  if (!userId) throw new AppError("User ID is required", 400);
  if (!ulbId) throw new AppError("ULB ID is required", 400);
  if (!zoneId) throw new AppError("Zone ID is required", 400);
  if (!serviceId) throw new AppError("Service ID is required", 400);
  if (!propNo) throw new AppError("Property Number is required", 400);
  if (!address) throw new AppError("Address is required", 400);
  if (!appliFName) throw new AppError("Applicant First Name is required", 400);
  if (!bilTaxNo) throw new AppError("Bill/Tax Notice No is required", 400);

   const result = await repo.insertPropAppeal({
    userId, ulbId, zoneId, serviceId, propNo, bilTaxNo,
    landHolder, structHolder, ownDetails, address,
    appliFName, appliMName, appliLName,
    mobile, email, aadhar, telephNo,
    objectType, objectDesc, taxDate,
    usageType, usageSubType, areaConstruct, annualTax, taxable,
    appSource,
    ownEngFName, ownEngMName, ownEngLName,
    ownMraFName, ownMraMName, ownMraLName,
  });

  const errCode = Number(result.out_errcode);
  const errMsg = result.out_ErrMsg || "";

  if (errCode !== 9999) {
    return {
      success: false,
      errorCode: errCode,
      message: errMsg,
    };
  }

  const arr = errMsg.split(":");
  const rtsApplicationNo = arr.length > 1 ? arr[1].trim() : null;

  const KARJAT_ULBS = ["1890", "1150"];
  const KARJAT_SERVICES = [
    "97", "3", "5", "44", "45", "46", "48", "49",
    "51", "52", "58", "61", "133",
  ];

  try {
    if (
      KARJAT_ULBS.includes(String(ulbId)) &&
      KARJAT_SERVICES.includes(String(serviceId))
    ) {
      const requeststr = [
        String(ulbId), String(serviceId), rtsApplicationNo, String(userId),
        appliFName, appliFName, appliMName || "", appliMName || "",
        appliLName || "", appliLName || "",
        mobile || "", email || "", aadhar || "",
        address || "", address || "",
        ".", ".", zoneId, 0, propNo,
        "", "", "", "", rtsApplicationNo, "", "", "", "",
        String(ulbId), appSource || "WEB", "N",
      ].join("~");

      let formattedTaxDate = "";
      if (taxDate) {
        const d = new Date(taxDate);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const seconds = String(d.getSeconds()).padStart(2, '0');
        formattedTaxDate = `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
      }

      const requestdtlsstr = [
        String(serviceId), String(ulbId),
        appliFName, appliMName || "", appliLName || "",
        mobile || "", email || "", aadhar || "", telephNo || "",
        objectType, bilTaxNo, address || "",
        ownDetails || "", ownDetails || "", ownDetails || "",
        ownDetails || "", ownDetails || "", ownDetails || "",
        objectDesc || "",
        formattedTaxDate,
        usageType || 0, usageSubType || 0,
        areaConstruct || null, annualTax || null, taxable || null,
        String(userId), propNo, rtsApplicationNo,
      ].join("~");

      const karjatResult = await repo.insertKarjatModule({
        userId,
        flag: "AppliEntry",
        applidata: requeststr,
        applidtlsdata: requestdtlsstr,
      });

      console.log(" karjatResult: ", karjatResult);

      if (Number(karjatResult.out_ErrorCode) !== 9999) {
        return {
          success: false,
          errorCode: karjatResult.out_ErrorCode,
          message:
            karjatResult.out_ErrorMsg ||
            "Karjat module insertion failed",
        };
      }
    } else {
      const requeststr = [
        String(userId), zoneId, serviceId, String(ulbId),
        "10001", appliFName, appliFName, appliMName || "",
        appliMName || "", appliLName || "", appliLName || "",
        mobile || "", aadhar || "", email || "",
        address || "", address || "", null, null, zoneId, 0,
        propNo, "", "", "", "", rtsApplicationNo,
        "", "", "", "", appSource || "WEB", "N", "",
      ].join("~");

      const rtsResult = await repo.insertRtsApplicantDetails({
        userId,
        flag: "AppliEntry",
        applidata: requeststr,
      });

      if (Number(rtsResult.out_ErrorCode) !== 9999) {
        return {
          success: false,
          errorCode: rtsResult.out_ErrorCode,
          message:
            rtsResult.out_ErrorMsg ||
            "RTS applicant details insertion failed",
        };
      }
    }
  } catch (err) {
    console.error("Secondary insert failed:", err.message);
  }

  const message =
    errMsg.split("$")[0] || "Property Appeal submitted successfully";

    console.log("message: ", message)

  return {
    success: true,
    errorCode: errCode,
    message,
    applicationNo: rtsApplicationNo,
    redirectTo: "FrmPropAppealSummary",
  };
}

module.exports = {
  getWardsService,
  getUsageTypesService,
  getObjectionsService,
  getUsageSubTypesService,
  getServiceUrlService,
  submitPropAppealService,
};