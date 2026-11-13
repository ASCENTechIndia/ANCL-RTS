const repo = require("./Step1.repo");
const { AppError } = require("../../../libs/errors");

// ---------------------------------------------------------------------------
// Constants mirroring the legacy C# conditions
// ---------------------------------------------------------------------------

// ULBs where the extra prop/water inserts apply (Karjat etc.)
const KARJAT_ULBS = ["1890", "1150"];

// Service IDs that trigger the prop.aoms_rtsdoc_det insert
const PROP_SERVICE_IDS = [
  "5", "44", "45", "46", "48", "49", "51", "52", "58", "61", "133",
];

// Service IDs that trigger the water.aowt_rtsdoc_det insert
const WATER_SERVICE_IDS = [
  "23", "26", "27", "28", "29", "30", "66", "19", "21", "22", "91", "196", "24", "25",
];

// Fire NOC Final services
const FIRE_SERVICE_IDS = ["12", "13"];

// ---------------------------------------------------------------------------
// Unified document upload — decides which inserts to run
// ---------------------------------------------------------------------------
async function uploadDocumentService(params) {
  const {
    corpId,
    serviceId,
    appNo,
    docType,
    documentId,
    ulbId,
    userId,
    fileBuffer,
  } = params;

  // Basic validation
  if (!serviceId) throw new AppError("Service ID is required", 400);
  if (!appNo) throw new AppError("Application Number is required", 400);
  if (!docType) throw new AppError("Document Type is required", 400);
  if (!documentId) throw new AppError("Document ID is required", 400);
  if (!ulbId) throw new AppError("ULB ID is required", 400);
  if (!fileBuffer || fileBuffer.length === 0)
    throw new AppError("Document file is required", 400);
  if (fileBuffer.length > 5 * 1024 * 1024)
    throw new AppError("Document size should be less than 5MB", 400);

  const sUlbId = String(ulbId);
  const sServiceId = String(serviceId);
  const insertedTables = [];

  try {
    // =======================================================================
    // 1) ALWAYS: main document insert into aorts_appdoc_det
    //    (matches obj.DocumentInsert(...) in legacy code — always runs)
    // =======================================================================
    const mainResult = await repo.insertMainDocument({
      corpId: Number(corpId),
      serviceId: Number(serviceId),
      appNo,
      docType,
      documentId: Number(documentId),
      docBuffer: fileBuffer,
    });

    if (!mainResult.success) {
      throw new AppError(mainResult.error || "Main document insert failed", 500);
    }
    insertedTables.push("aorts_appdoc_det");

    // =======================================================================
    // 2) CONDITIONAL — Karjat ULBs (1890, 1150)
    // =======================================================================
    if (KARJAT_ULBS.includes(sUlbId)) {
      // 2a) PROP insert — only for certain service IDs
      if (PROP_SERVICE_IDS.includes(sServiceId)) {
        const propResult = await repo.insertPropDoc({
          corpId: Number(corpId),
          serviceId: Number(serviceId),
          appNo,
          docType,
          documentId: Number(documentId),
          docBuffer: fileBuffer,
        });

        if (!propResult.success) {
          throw new AppError(propResult.error || "Prop document insert failed", 500);
        }
        insertedTables.push("prop.aoms_rtsdoc_det");
      }

      // 2b) WATER insert — only for certain service IDs
      if (WATER_SERVICE_IDS.includes(sServiceId)) {
        const waterResult = await repo.insertWaterDoc({
          corpId: Number(corpId),
          serviceId: Number(serviceId),
          appNo,
          docType,
          documentId: Number(documentId),
          docBuffer: fileBuffer,
        });

        if (!waterResult.success) {
          throw new AppError(waterResult.error || "Water document insert failed", 500);
        }
        insertedTables.push("water.aowt_rtsdoc_det");
      }
    }

    // =======================================================================
    // 3) CONDITIONAL — Fire NOC Final (serviceId 12 or 13)
    //    Legacy code looks up num_appentry_id by AppNo first.
    // =======================================================================
    if (FIRE_SERVICE_IDS.includes(sServiceId)) {
      // Look up Fire Application ID from fire.aofr_appentry_mas
      const fireLookup = await repo.getFireApplicationId({ appNo });

      if (!fireLookup.success) {
        throw new AppError(fireLookup.error || "Fire application lookup failed", 500);
      }

      if (fireLookup.rows.length > 0) {
        const fireApplId = fireLookup.rows[0].NUM_APPENTRY_ID;

        const fireResult = await repo.insertFireDoc({
          appId: fireApplId,
          docType,
          documentId: Number(documentId),
          userId,
          ulbId,
          docBuffer: fileBuffer,
        });

        if (!fireResult.success) {
          throw new AppError(fireResult.error || "Fire document insert failed", 500);
        }
        insertedTables.push("fire.aofr_appdoc_det");
      } else {
        // No fire application found — log but don't fail the whole request
        console.warn(
          `[uploadDocumentService] No fire.aofr_appentry_mas row for AppNo=${appNo}; skipping fire insert.`
        );
      }
    }

    return {
      success: true,
      message: "Document uploaded successfully",
      insertedTables,
    };
  } catch (error) {
    console.error("[uploadDocumentService] Error:", error);
    throw error instanceof AppError
      ? error
      : new AppError(error.message || "Document upload failed", 500);
  }
}

// ---------------------------------------------------------------------------
// Procedure service (unchanged, separate)
// ---------------------------------------------------------------------------
async function callApplicationInsService(params) {
  const {
    ulbId,
    corpid,
    serviceid,
    zoneid,
    userid,
    noofcopy,
    appno,
    marriageDate,
    mode,
  } = params;

  if (!ulbId) throw new AppError("ULB ID is required", 400);
  if (!corpid) throw new AppError("Corp ID is required", 400);
  if (!serviceid) throw new AppError("Service ID is required", 400);
  if (!userid) throw new AppError("User ID is required", 400);
  if (!mode) throw new AppError("Mode is required", 400);

  const result = await repo.callApplicationIns({
    ulbId,
    corpid,
    serviceid,
    zoneid: zoneid || null,
    userid,
    noofcopy: noofcopy || 1,
    appno: appno || null,
    marriageDate: marriageDate || null,
    mode,
  });

  if (!result.success) {
    throw new AppError(result.error || "Application insert procedure failed", 500);
  }

  const outBinds = result.outBinds || {};
  const errCode = Number(outBinds.out_errcode);

  // 9999 = success in this procedure
  if (errCode !== 9999) {
    throw new AppError(
      outBinds.out_ErrMsg || `Procedure failed with code ${errCode}`,
      400
    );
  }

  return {
    success: true,
    errCode,
    message: outBinds.out_ErrMsg,
    applicationNo: outBinds.out_ErrMsg,
  };
}

module.exports = {
  uploadDocumentService,
  callApplicationInsService,
};