const repo = require("./FrmMarriageRgstn.repo");
const { AppError } = require("../../../libs/errors");

async function getZonesService(ulbId) {
  if (!ulbId) {
    throw new AppError("ULB ID is required", 400);
  }

  const result = await repo.getZones(ulbId);
  if (!result.success) {
    throw new AppError(result.error, 500);
  }

  return {
    success: true,
    rowCount: result.rows.length,
    rows: result.rows,
  };
}

async function getPreviousStatusService() {
  const result = await repo.getPreviousStatus();
  if (!result.success) {
    throw new AppError(result.error, 500);
  }
  return {
    success: true,
    rowCount: result.rows.length,
    rows: result.rows,
  };
}

async function getReligionListService() {
  const result = await repo.getReligionList();
  if (!result.success) {
    throw new AppError(result.error, 500);
  }
  return {
    success: true,
    rowCount: result.rows.length,
    rows: result.rows,
  };
}

async function getIDDocumentsService() {
  const result = await repo.getIDDocuments();
  if (!result.success) {
    throw new AppError(result.error, 500);
  }
  return {
    success: true,
    rowCount: result.rows.length,
    rows: result.rows,
  };
}

async function getAddressDocumentsService() {
  const result = await repo.getAddressDocuments();
  if (!result.success) {
    throw new AppError(result.error, 500);
  }
  return {
    success: true,
    rowCount: result.rows.length,
    rows: result.rows,
  };
}

async function getAgeDocumentsService() {
  const result = await repo.getAgeDocuments();
  if (!result.success) {
    throw new AppError(result.error, 500);
  }
  return {
    success: true,
    rowCount: result.rows.length,
    rows: result.rows,
  };
}

async function getRelationsService() {
  const result = await repo.getRelations();
  if (!result.success) {
    throw new AppError(result.error, 500);
  }
  return {
    success: true,
    rowCount: result.rows.length,
    rows: result.rows,
  };
}

async function getDocumentDefinitionsService(params) {
  const { corpId, serviceId, ulbId } = params;

  if (!corpId) {
    throw new AppError("Corp ID is required", 400);
  }
  if (!serviceId) {
    throw new AppError("Service ID is required", 400);
  }
  if (!ulbId) {
    throw new AppError("ULB ID is required", 400);
  }

  const result = await repo.getDocumentDefinitions({ corpId, serviceId, ulbId });
  if (!result.success) {
    throw new AppError(result.error, 500);
  }

  return {
    success: true,
    rowCount: result.rows.length,
    rows: result.rows,
  };
}

async function calculateAgeService(params) {
  const { marriageDate, birthDate } = params;

  if (!marriageDate) {
    throw new AppError("Marriage Date is required", 400);
  }
  if (!birthDate) {
    throw new AppError("Birth Date is required", 400);
  }

  const result = await repo.calculateAge(marriageDate, birthDate);
  if (!result.success) {
    throw new AppError(result.error, 500);
  }

  const age = result.rows.length > 0 ? parseInt(result.rows[0].AGE) : 0;

  return {
    success: true,
    age: age,
  };
}

async function submitMarriageRegistrationService(payload) {
  const {
    ulbId,
    userId,
    corpId,
    serviceId,

    // Tab 1: Application Entry
    zoneId,
    appliFname,
    appliMname,
    appliLname,
    appliMobile,
    appliAddre,
    regDate,
    mrrgDate,
    placeEng,
    placeMar,
    documentIds,
    deliveryFlag,
    appSource,

    // Tab 2: Husband Details
    hefname,
    hemname,
    helname,
    hmfname,
    hmmname,
    hmlname,
    headdress,
    hmaddress,
    hMobile,
    hmstatus,
    hphysichall,
    hbirthdt,
    hbirthreligion,
    hadopreligion,
    hemail,
    hiddoc,
    haddresdoc,
    hagedoc,
    haadharno,

    // Tab 3: Wife Details
    wefname,
    wemname,
    welname,
    wmfname,
    wmmname,
    wmlname,
    weaddress,
    wmaddress,
    wMobile,
    wmstatus,
    wphysichall,
    wbirthdt,
    wbirthreligion,
    wadopreligion,
    wemail,
    widdoc,
    waddresdoc,
    wagedoc,
    waadharno,

    // Tab 4: Witness 1
    w1efname,
    w1emname,
    w1elname,
    w1mfname,
    w1mmname,
    w1mlname,
    w1docid,
    w1relationid,
    w1mobileno,
    w1eaddre,
    w1maddre,
    w1birthdt,

    // Tab 5: Witness 2
    w2efname,
    w2emname,
    w2elname,
    w2mfname,
    w2mmname,
    w2mlname,
    w2docid,
    w2relationid,
    w2mobileno,
    w2eaddre,
    w2maddre,
    w2birthdt,

    // Tab 6: Witness 3
    w3efname,
    w3emname,
    w3elname,
    w3mfname,
    w3mmname,
    w3mlname,
    w3docid,
    w3relationid,
    w3mobileno,
    w3eaddre,
    w3maddre,
    w3birthdt,

    // Tab 7: Priest Details
    prefname,
    premname,
    prelname,
    prmfname,
    prmmname,
    prmlname,
    prage,
    prreligion,
    preaddress,
    prmaddress,

    // Images
    husPhoto,
    husThumb,
    wifePhoto,
    wifeThumb,
    wit1Photo,
    wit1Thumb,
    wit2Photo,
    wit2Thumb,
    wit3Photo,
    wit3Thumb,
    husIdDoc,
    husAddDoc,
    husAgeDoc,
    wifeIdDoc,
    wifeAddDoc,
    wifeAgeDoc,

    // Grid Documents
    gridDocuments,
  } = payload;

  // ==================== VALIDATIONS ====================

  // Tab 1 Validations
  if (!zoneId || zoneId === "0") {
    throw new AppError("Please Select Zone", 400);
  }
  if (!appliFname) {
    throw new AppError("Please enter applicant first name", 400);
  }
  if (!appliMname) {
    throw new AppError("Please enter applicant middle name", 400);
  }
  if (!appliLname) {
    throw new AppError("Please enter applicant last name", 400);
  }
  if (!appliMobile) {
    throw new AppError("Please enter mobile number", 400);
  }
  if (String(appliMobile).length < 10) {
    throw new AppError("Please Enter Valid Applicant Contact Number", 400);
  }
  if (!regDate) {
    throw new AppError("Please Select Registration date", 400);
  }
  if (!mrrgDate) {
    throw new AppError("Please Select Marriage date", 400);
  }
  const mrrgDateObj = new Date(mrrgDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (mrrgDateObj > today) {
    throw new AppError("Marriage Date Cannot be greater than System Date", 400);
  }
  if (!placeEng) {
    throw new AppError("English Marriage Place Cannot be blank", 400);
  }
  if (!placeMar) {
    throw new AppError("Marathi Marriage Place Cannot be blank", 400);
  }

  // Tab 2 Validations
  if (!hefname) {
    throw new AppError("Groom First Name cannot be blank", 400);
  }
  if (!hemname) {
    throw new AppError("Groom Middle Name cannot be blank", 400);
  }
  if (!helname) {
    throw new AppError("Groom Last Name cannot be blank", 400);
  }
  if (!hmfname) {
    throw new AppError("Groom First Name in Marathi cannot be blank", 400);
  }
  if (!hmmname) {
    throw new AppError("Groom Middle Name in Marathi cannot be blank", 400);
  }
  if (!hmlname) {
    throw new AppError("Groom Last Name in Marathi cannot be blank", 400);
  }
  if (!headdress) {
    throw new AppError("Groom Address in English cannot be blank", 400);
  }
  if (!hmaddress) {
    throw new AppError("Groom Address in Marathi cannot be blank", 400);
  }
  if (!haadharno) {
    throw new AppError("Groom Aadhar Card Number cannot be blank", 400);
  }
  if (String(haadharno).length < 12) {
    throw new AppError("Please Enter 12 Digit Groom Aadhar Card Number", 400);
  }
  if (!hMobile) {
    throw new AppError("Groom Contact Number cannot be blank", 400);
  }
  if (String(hMobile).length < 10) {
    throw new AppError("Please Enter Valid Groom Contact Number", 400);
  }
  if (!hbirthdt) {
    throw new AppError("Please Select Birth Date", 400);
  }
  // if (!hmstatus || hmstatus === "0") {
  //   throw new AppError("Please Select Previous Status", 400);
  // }
  if (!hbirthreligion || hbirthreligion === "0") {
    throw new AppError("Please Select Religion by birth", 400);
  }
  if (!hadopreligion || hadopreligion === "0") {
    throw new AppError("Please Select Religion by adoption", 400);
  }
  if (!hiddoc || hiddoc === "0") {
    throw new AppError("Please Select ID Document", 400);
  }
  if (!haddresdoc || haddresdoc === "0") {
    throw new AppError("Please Select Address Document", 400);
  }
  if (!hagedoc || hagedoc === "0") {
    throw new AppError("Please Select Age Document", 400);
  }

  // Tab 3 Validations
  if (!wefname) {
    throw new AppError("Bride First Name cannot be blank", 400);
  }
  if (!wemname) {
    throw new AppError("Bride Middle Name cannot be blank", 400);
  }
  if (!welname) {
    throw new AppError("Bride Last Name cannot be blank", 400);
  }
  if (!wmfname) {
    throw new AppError("Bride First Name in Marathi cannot be blank", 400);
  }
  if (!wmmname) {
    throw new AppError("Bride Middle Name in Marathi cannot be blank", 400);
  }
  if (!wmlname) {
    throw new AppError("Bride Last Name in Marathi cannot be blank", 400);
  }
  if (!weaddress) {
    throw new AppError("Bride Address in English cannot be blank", 400);
  }
  if (!wmaddress) {
    throw new AppError("Bride Address in Marathi cannot be blank", 400);
  }
  if (!wMobile) {
    throw new AppError("Bride Contact Number cannot be blank", 400);
  }
  if (String(wMobile).length < 10) {
    throw new AppError("Please Enter Valid Bride Contact Number", 400);
  }
  if (!wbirthdt) {
    throw new AppError("Please Select Bride Birth Date", 400);
  }
  // if (!wmstatus || wmstatus === "0") {
  //   throw new AppError("Please Select Previous Status", 400);
  // }
  if (!wbirthreligion || wbirthreligion === "0") {
    throw new AppError("Please Select Religion by birth", 400);
  }
  if (!wadopreligion || wadopreligion === "0") {
    throw new AppError("Please Select Religion by adoption", 400);
  }
  if (!widdoc || widdoc === "0") {
    throw new AppError("Please Select ID Document", 400);
  }
  if (!waddresdoc || waddresdoc === "0") {
    throw new AppError("Please Select Address Document", 400);
  }
  if (!wagedoc || wagedoc === "0") {
    throw new AppError("Please Select Age Document", 400);
  }
  if (waadharno && String(waadharno).length > 0 && String(waadharno).length < 12) {
    throw new AppError("Please Enter 12 Digit Aadhar No", 400);
  }

  // Tab 4 - Witness 1 Validations
  if (!w1efname) {
    throw new AppError("First Name in English cannot be blank", 400);
  }
  if (!w1emname) {
    throw new AppError("Middle Name in English cannot be blank", 400);
  }
  if (!w1elname) {
    throw new AppError("Last Name in English cannot be blank", 400);
  }
  if (!w1mfname) {
    throw new AppError("First Name in Marathi cannot be blank", 400);
  }
  if (!w1mmname) {
    throw new AppError("Middle Name in Marathi cannot be blank", 400);
  }
  if (!w1mlname) {
    throw new AppError("Last Name in Marathi cannot be blank", 400);
  }
  if (!w1docid || w1docid === "0") {
    throw new AppError("Please select Document", 400);
  }
  if (!w1relationid || w1relationid === "0") {
    throw new AppError("Please select Relation", 400);
  }
  if (!w1mobileno) {
    throw new AppError("Mobile Number cannot be blank", 400);
  }
  if (String(w1mobileno).length !== 10) {
    throw new AppError("Enter Valid Mobile Number", 400);
  }
  if (!w1birthdt) {
    throw new AppError("Please Select Birth Date", 400);
  }
  if (!w1eaddre) {
    throw new AppError("Address in English cannot be blank", 400);
  }
  if (!w1maddre) {
    throw new AppError("Address in Marathi cannot be blank", 400);
  }

  // Tab 5 - Witness 2 Validations
  if (!w2efname) {
    throw new AppError("First Name in English cannot be blank", 400);
  }
  if (!w2emname) {
    throw new AppError("Middle Name in English cannot be blank", 400);
  }
  if (!w2elname) {
    throw new AppError("Last Name in English cannot be blank", 400);
  }
  if (!w2mfname) {
    throw new AppError("First Name in Marathi cannot be blank", 400);
  }
  if (!w2mmname) {
    throw new AppError("Middle Name in Marathi cannot be blank", 400);
  }
  if (!w2mlname) {
    throw new AppError("Last Name in Marathi cannot be blank", 400);
  }
  if (!w2docid || w2docid === "0") {
    throw new AppError("Please select Document", 400);
  }
  if (!w2relationid || w2relationid === "0") {
    throw new AppError("Please select Relation", 400);
  }
  if (!w2mobileno) {
    throw new AppError("Mobile Number cannot be blank", 400);
  }
  if (String(w2mobileno).length !== 10) {
    throw new AppError("Enter Valid Mobile Number", 400);
  }
  if (!w2birthdt) {
    throw new AppError("Please Select Birth Date", 400);
  }
  if (!w2eaddre) {
    throw new AppError("Address in English cannot be blank", 400);
  }
  if (!w2maddre) {
    throw new AppError("Address in Marathi cannot be blank", 400);
  }

  // Tab 6 - Witness 3 Validations
  if (!w3efname) {
    throw new AppError("First Name in English cannot be blank", 400);
  }
  if (!w3emname) {
    throw new AppError("Middle Name in English cannot be blank", 400);
  }
  if (!w3elname) {
    throw new AppError("Last Name in English cannot be blank", 400);
  }
  if (!w3mfname) {
    throw new AppError("First Name in Marathi cannot be blank", 400);
  }
  if (!w3mmname) {
    throw new AppError("Middle Name in Marathi cannot be blank", 400);
  }
  if (!w3mlname) {
    throw new AppError("Last Name in Marathi cannot be blank", 400);
  }
  if (!w3docid || w3docid === "0") {
    throw new AppError("Please select Document", 400);
  }
  if (!w3relationid || w3relationid === "0") {
    throw new AppError("Please select Relation", 400);
  }
  if (!w3mobileno) {
    throw new AppError("Mobile Number cannot be blank", 400);
  }
  if (String(w3mobileno).length !== 10) {
    throw new AppError("Enter Valid Mobile Number", 400);
  }
  if (!w3birthdt) {
    throw new AppError("Please Select Birth Date", 400);
  }
  if (!w3eaddre) {
    throw new AppError("Address in English cannot be blank", 400);
  }
  if (!w3maddre) {
    throw new AppError("Address in Marathi cannot be blank", 400);
  }

  // Tab 7 - Priest Validations
  if (!prefname) {
    throw new AppError("First Name cannot be blank", 400);
  }
  if (!prelname) {
    throw new AppError("Last Name cannot be blank", 400);
  }
  if (!prmfname) {
    throw new AppError("Marathi First Name cannot be blank", 400);
  }
  if (!prmlname) {
    throw new AppError("Marathi Last Name cannot be blank", 400);
  }
  if (!prage) {
    throw new AppError("Age cannot be blank", 400);
  }
  if (!prreligion || prreligion === "0") {
    throw new AppError("Please Select Religion", 400);
  }
  if (!preaddress) {
    throw new AppError("English Address cannot be blank", 400);
  }
  if (!prmaddress) {
    throw new AppError("Marathi Address cannot be blank", 400);
  }

  // Calculate Husband Age
  const ageResult = await repo.calculateAge(mrrgDate, hbirthdt);
  if (!ageResult.success) {
    throw new AppError("Error calculating age", 500);
  }
  const hAge = ageResult.rows.length > 0 ? parseInt(ageResult.rows[0].AGE) : 0;
  if (hAge < 21) {
    throw new AppError("Age must be 21 Yr or greater. Please enter a valid Date of Birth", 400);
  }

  // Calculate Wife Age
  const wifeAgeResult = await repo.calculateAge(mrrgDate, wbirthdt);
  if (!wifeAgeResult.success) {
    throw new AppError("Error calculating age", 500);
  }
  const wAge = wifeAgeResult.rows.length > 0 ? parseInt(wifeAgeResult.rows[0].AGE) : 0;
  if (wAge < 18) {
    throw new AppError("Age must be 18 Yr or greater. Please enter a valid Date of Birth", 400);
  }

  // Calculate Witness 1 Age
  const w1AgeResult = await repo.calculateAge(mrrgDate, w1birthdt);
  if (!w1AgeResult.success) {
    throw new AppError("Error calculating age", 500);
  }
  const w1Age = w1AgeResult.rows.length > 0 ? parseInt(w1AgeResult.rows[0].AGE) : 0;
  if (w1Age < 18) {
    throw new AppError("Age must be 18 Yr or greater. Please enter a valid Date of Birth", 400);
  }

  // Calculate Witness 2 Age
  const w2AgeResult = await repo.calculateAge(mrrgDate, w2birthdt);
  if (!w2AgeResult.success) {
    throw new AppError("Error calculating age", 500);
  }
  const w2Age = w2AgeResult.rows.length > 0 ? parseInt(w2AgeResult.rows[0].AGE) : 0;
  if (w2Age < 18) {
    throw new AppError("Age must be 18 Yr or greater. Please enter a valid Date of Birth", 400);
  }

  // Calculate Witness 3 Age
  const w3AgeResult = await repo.calculateAge(mrrgDate, w3birthdt);
  if (!w3AgeResult.success) {
    throw new AppError("Error calculating age", 500);
  }
  const w3Age = w3AgeResult.rows.length > 0 ? parseInt(w3AgeResult.rows[0].AGE) : 0;
  if (w3Age < 18) {
    throw new AppError("Age must be 18 Yr or greater. Please enter a valid Date of Birth", 400);
  }

  // Check Grid Documents
  if (!documentIds || documentIds.length === 0) {
    throw new AppError("Please Upload Atleast One Document", 400);
  }

  // ==================== INSERT APPLICATION ====================

  const docIdStr = documentIds.join("#");

  const insertResult = await repo.insertMarriageRegistration({
    userId,
    mrrgdtlid: null,
    appliFname,
    appliMname,
    appliLname,
    appliMobile: Number(appliMobile),
    appliAddre,
    regDate: new Date(regDate),
    mrrgDate: new Date(mrrgDate),
    placeEng,
    placeMar,
    mode: 1,
    str: docIdStr,
    ulbId,
    hefname,
    hemname,
    helname,
    hmfname,
    hmmname,
    hmlname,
    headdress,
    hmaddress,
    hMobile: Number(hMobile),
    hmstatus: Number(hmstatus),
    hphysichall: Number(hphysichall || 0),
    hage: hAge,
    hbirthreligion: Number(hbirthreligion),
    hadopreligion: Number(hadopreligion),
    hemail: hemail || null,
    hiddoc: Number(hiddoc),
    haddresdoc: Number(haddresdoc),
    hagedoc: Number(hagedoc),
    hMode: 1,
    hbirthdt: new Date(hbirthdt),
    haadharno: Number(haadharno),
    wefname,
    wemname,
    welname,
    wmfname,
    wmmname,
    wmlname,
    weaddress,
    wmaddress,
    wMobile: Number(wMobile),
    wmstatus: Number(wmstatus),
    wphysichall: Number(wphysichall || 0),
    wage: wAge,
    wbirthreligion: Number(wbirthreligion),
    wadopreligion: Number(wadopreligion),
    wemail: wemail || null,
    widdoc: Number(widdoc),
    waddresdoc: Number(waddresdoc),
    wagedoc: Number(wagedoc),
    wMode: 0,
    wbirthdt: new Date(wbirthdt),
    waadharno: waadharno ? Number(waadharno) : null,
    w1EFNAME: w1efname,
    w1EMNAME: w1emname,
    w1ELNAME: w1elname,
    w1MFNAME: w1mfname,
    w1MMNAME: w1mmname,
    w1MLNAME: w1mlname,
    w1DOCID: Number(w1docid),
    w1RELATIONID: Number(w1relationid),
    w1MOBILENO: Number(w1mobileno),
    w1AGE: w1Age,
    w1EADDRE: w1eaddre,
    w1MADDRE: w1maddre,
    w1MODE: 1,
    w1WITNESS_NO: 1,
    w1birthdt: new Date(w1birthdt),
    w2EFNAME: w2efname,
    w2EMNAME: w2emname,
    w2ELNAME: w2elname,
    w2MFNAME: w2mfname,
    w2MMNAME: w2mmname,
    w2MLNAME: w2mlname,
    w2DOCID: Number(w2docid),
    w2RELATIONID: Number(w2relationid),
    w2MOBILENO: Number(w2mobileno),
    w2AGE: w2Age,
    w2EADDRE: w2eaddre,
    w2MADDRE: w2maddre,
    w2MODE: 1,
    w2WITNESS_NO: 2,
    w2birthdt: new Date(w2birthdt),
    w3EFNAME: w3efname,
    w3EMNAME: w3emname,
    w3ELNAME: w3elname,
    w3MFNAME: w3mfname,
    w3MMNAME: w3mmname,
    w3MLNAME: w3mlname,
    w3DOCID: Number(w3docid),
    w3RELATIONID: Number(w3relationid),
    w3MOBILENO: Number(w3mobileno),
    w3AGE: w3Age,
    w3EADDRE: w3eaddre,
    w3MADDRE: w3maddre,
    w3MODE: 1,
    w3WITNESS_NO: 3,
    w3birthdt: new Date(w3birthdt),
    pRefname: prefname,
    pRemname: premname,
    pRelname: prelname,
    pRmfname: prmfname,
    pRmmname: prmmname,
    pRmlname: prmlname,
    pRage: Number(prage),
    pRreligion: Number(prreligion),
    pReaddress: preaddress,
    pRmaddress: prmaddress,
    source: appSource || "WEB",
    deliveryflag: deliveryFlag || null,
    zoneId: Number(zoneId),
  });

  if (!insertResult.success || Number(insertResult.outBinds.out_ErrorCode) === -100) {
    const errorCode = insertResult.outBinds?.out_ErrorCode;
    const errorMsg = insertResult.outBinds?.out_ErrorMsg || "Application submission failed";

    if (errorCode === -100) {
      const parts = errorMsg.split("$");
      return {
        success: true,
        errorCode: errorCode,
        message: parts[0] || errorMsg,
        applicationNo: insertResult.outBinds?.out_AppliNo,
        mrrgdtlid: insertResult.outBinds?.out_Mrrgdtlid,
        mrrgid: insertResult.outBinds?.out_Mrrgid,
        formId: insertResult.outBinds?.out_Formid,
        payFlag: "Y",
        redirectTo: "FrmAppliFee",
      };
    }
    throw new AppError(errorMsg || "Application submission failed", 500);
  }

  const outBinds = insertResult.outBinds;
  const applicationNo = outBinds.out_AppliNo;
  const mrrgdtlid = outBinds.out_Mrrgdtlid;
  const mrrgid = outBinds.out_Mrrgid;
  const formId = outBinds.out_Formid;

  // ==================== UPDATE IMAGES ====================

  // Husband Images
  if (husPhoto || husThumb) {
    await repo.updateMrgImages({
      mrrgdtlidId: mrrgdtlid,
      flag: "H",
      imgPhoto: husPhoto || null,
      imgThumb: husThumb || null,
    });

    await repo.updateMrgModImages({
      mrrgdtlidId: mrrgid,
      flag: "H",
      imgPhoto: husPhoto || null,
      imgThumb: husThumb || null,
    });
  }

  // Wife Images
  if (wifePhoto || wifeThumb) {
    await repo.updateMrgImages({
      mrrgdtlidId: mrrgdtlid,
      flag: "W",
      imgPhoto: wifePhoto || null,
      imgThumb: wifeThumb || null,
    });

    await repo.updateMrgModImages({
      mrrgdtlidId: mrrgid,
      flag: "W",
      imgPhoto: wifePhoto || null,
      imgThumb: wifeThumb || null,
    });
  }

  // Witness 1 Images
  if (wit1Photo || wit1Thumb) {
    await repo.addUpdateImage({
      mrrgdtlidId: mrrgdtlid,
      witnessNumber: 1,
      imagePhoto: wit1Photo || null,
      imageThumb: wit1Thumb || null,
    });

    await repo.addUpdateMrgImage({
      mrrgdtlidId: mrrgid,
      witnessNumber: 1,
      imagePhoto: wit1Photo || null,
      imageThumb: wit1Thumb || null,
    });
  }

  if (wit2Photo || wit2Thumb) {
    await repo.addUpdateImage({
      mrrgdtlidId: mrrgdtlid,
      witnessNumber: 2,
      imagePhoto: wit2Photo || null,
      imageThumb: wit2Thumb || null,
    });

    await repo.addUpdateMrgImage({
      mrrgdtlidId: mrrgid,
      witnessNumber: 2,
      imagePhoto: wit2Photo || null,
      imageThumb: wit2Thumb || null,
    });
  }

  // Witness 3 Images
  if (wit3Photo || wit3Thumb) {
    await repo.addUpdateImage({
      mrrgdtlidId: mrrgdtlid,
      witnessNumber: 3,
      imagePhoto: wit3Photo || null,
      imageThumb: wit3Thumb || null,
    });

    await repo.addUpdateMrgImage({
      mrrgdtlidId: mrrgid,
      witnessNumber: 3,
      imagePhoto: wit3Photo || null,
      imageThumb: wit3Thumb || null,
    });
  }

  // ==================== UPLOAD HUSBAND DOCUMENTS ====================

  if (husIdDoc) {
    await repo.uploadDoc({
      mrrgdtlid: mrrgdtlid,
      mrrgdocid: Number(hiddoc),
      mrrgdoc: husIdDoc,
      flag: "BR",
      user: userId,
      ulbid: ulbId,
      mrrgdocflag: "IdDoc",
    });
  }

  if (husAddDoc) {
    await repo.uploadDoc({
      mrrgdtlid: mrrgdtlid,
      mrrgdocid: Number(haddresdoc),
      mrrgdoc: husAddDoc,
      flag: "BR",
      user: userId,
      ulbid: ulbId,
      mrrgdocflag: "AddDoc",
    });
  }

  if (husAgeDoc) {
    await repo.uploadDoc({
      mrrgdtlid: mrrgdtlid,
      mrrgdocid: Number(hagedoc),
      mrrgdoc: husAgeDoc,
      flag: "BR",
      user: userId,
      ulbid: ulbId,
      mrrgdocflag: "AgDoc",
    });
  }

  // ==================== UPLOAD WIFE DOCUMENTS ====================

  if (wifeIdDoc) {
    await repo.uploadDoc({
      mrrgdtlid: mrrgdtlid,
      mrrgdocid: Number(widdoc),
      mrrgdoc: wifeIdDoc,
      flag: "GR",
      user: userId,
      ulbid: ulbId,
      mrrgdocflag: "IdDoc",
    });
  }

  if (wifeAddDoc) {
    await repo.uploadDoc({
      mrrgdtlid: mrrgdtlid,
      mrrgdocid: Number(waddresdoc),
      mrrgdoc: wifeAddDoc,
      flag: "GR",
      user: userId,
      ulbid: ulbId,
      mrrgdocflag: "AddDoc",
    });
  }

  if (wifeAgeDoc) {
    await repo.uploadDoc({
      mrrgdtlid: mrrgdtlid,
      mrrgdocid: Number(wagedoc),
      mrrgdoc: wifeAgeDoc,
      flag: "GR",
      user: userId,
      ulbid: ulbId,
      mrrgdocflag: "AgDoc",
    });
  }

  // ==================== UPLOAD GRID DOCUMENTS ====================

  if (gridDocuments && gridDocuments.length > 0) {
    for (const doc of gridDocuments) {
      if (doc.fileBuffer && doc.fileBuffer.length > 0 && doc.docId) {
        try {
          let buffer;
          if (Buffer.isBuffer(doc.fileBuffer)) {
            buffer = doc.fileBuffer;
          } else if (doc.fileBuffer instanceof ArrayBuffer) {
            buffer = Buffer.from(new Uint8Array(doc.fileBuffer));
          } else if (typeof doc.fileBuffer === 'string') {
            if (doc.fileBuffer.startsWith('data:')) {
              const base64Data = doc.fileBuffer.split(',')[1];
              buffer = Buffer.from(base64Data, 'base64');
            } else {
              buffer = Buffer.from(doc.fileBuffer, 'base64');
            }
          } else {
            buffer = Buffer.from(doc.fileBuffer);
          }

          // Insert into aorts_appdoc_det
          const connection = require("oracledb");
          const { getConnectionTMC } = require("../../../config/db");
          const conn = await getConnectionTMC();

          const insertQuery = `
            INSERT INTO aorts_appdoc_det (
              num_appdoc_corpid,
              num_appdoc_serviceid,
              var_appdoc_appno,
              var_appdoc_doctype,
              num_appdoc_documentid,
              blob_appdoc_documentimg
            ) VALUES (
              :corpId,
              :serviceId,
              :appNo,
              :docType,
              :documentId,
              :docBuffer
            )
          `;

          await conn.execute(
            insertQuery,
            {
              corpId: Number(corpId),
              serviceId: Number(serviceId),
              appNo: applicationNo,
              docType: "S",
              documentId: Number(doc.docId),
              docBuffer: { val: buffer, type: connection.BUFFER, dir: connection.BIND_IN },
            },
            { autoCommit: true }
          );
          await conn.close();

          // Update Marriage Module Document Details
          const updateQuery = `
            UPDATE mrrg.AOMM_MRRGDOC_DET 
            SET blob_mrrgdoc_documentimg = :docBuffer 
            WHERE num_mrrgdoc_mrrgid = :mrrgid 
              AND num_mrrgdoc_docid = :documentId
          `;
          const conn2 = await getConnectionTMC();
          await conn2.execute(
            updateQuery,
            {
              docBuffer: { val: buffer, type: connection.BUFFER, dir: connection.BIND_IN },
              mrrgid: mrrgid,
              documentId: Number(doc.docId),
            },
            { autoCommit: true }
          );
          await conn2.close();

        } catch (error) {
          console.error("Grid Document Upload Error:", error);
        }
      }
    }
  }

  // ==================== GET PAYMENT FLAG ====================

  const paymentResult = await repo.getServicePaymentFlag(serviceId);
  let payFlag = "N";
  if (paymentResult.success && paymentResult.rows.length > 0) {
    payFlag = paymentResult.rows[0].VAR_SERVICE_PAYFLAG || "N";
  }

  const message = outBinds.out_ErrorMsg || "Application submitted successfully";

  return {
    success: true,
    errorCode: outBinds.out_ErrorCode,
    message: message,
    applicationNo: applicationNo,
    mrrgdtlid: mrrgdtlid,
    mrrgid: mrrgid,
    formId: formId,
    payFlag: payFlag,
    redirectTo: payFlag === "N" ? "FrmMarriageRgstn" : "FrmAppliFee",
  };
}

async function getMarriageDataService(applicationNo) {
  if (!applicationNo) {
    throw new AppError("Application Number is required", 400);
  }

  const result = await repo.getMarriageData(applicationNo);
  if (!result.success) {
    throw new AppError(result.error, 500);
  }

  if (result.rows.length === 0) {
    throw new AppError("Application not found", 404);
  }

  const row = result.rows[0];

  // Get documents
  const docResult = await repo.getMarriageDocuments(row.MRRGDTLID);
  const documents = docResult.success ? docResult.rows : [];

  return {
    success: true,
    data: {
      applicationEntry: {
        mrrgdtlid: row.MRRGDTLID,
        applfname: row.APPLFNAME,
        applmname: row.APPLMNAME,
        appllname: row.APPLNAME,
        applmobno: row.APPLMOBNO,
        appladdress: row.APPLADDRESS,
        regdate: row.REGDATE,
        mrrgdate: row.MRRGDATE,
        mrrgplaceeng: row.MRRGPLACEENG,
        mrrgplacemar: row.MRRGPLACEMAR,
        rtsappno: row.RTSAPPNO,
      },
      husband: {
        efname: row.HUSB_EFNAME,
        emname: row.HUSB_EMNAME,
        elname: row.HUSB_ELNAME,
        mfname: row.HUSB_MFNAME,
        mmname: row.HUSB_MMNAME,
        mlname: row.HUSB_MLNAME,
        eaddre: row.HUSB_EADDRE,
        maddre: row.HUSB_MADDRE,
        mobileno: row.HUSB_MOBILENO,
        mstatus: row.HUSB_MSTATUS,
        physichall: row.HUSB_PHYSICHALL,
        age: row.HUSB_AGE,
        birthreligion: row.HUSB_BIRTHRELIGION,
        adopreligion: row.HUSB_ADOPRELIGION,
        email: row.HUSB_EMAIL,
        iddoc: row.HUSB_IDDOC,
        addresdoc: row.HUSB_ADDRESDOC,
        agedoc: row.HUSB_AGEDOC,
        birthdt: row.HUSB_BIRTHDT,
        aadharno: row.HUSB_AADHARNO,
      },
      wife: {
        efname: row.WIFE_EFNAME,
        emname: row.WIFE_EMNAME,
        elname: row.WIFE_ELNAME,
        mfname: row.WIFE_MFNAME,
        mmname: row.WIFE_MMNAME,
        mlname: row.WIFE_MLNAME,
        eaddre: row.WIFE_EADDRE,
        maddre: row.WIFE_MADDRE,
        mobileno: row.WIFE_MOBILENO,
        mstatus: row.WIFE_MSTATUS,
        physichall: row.WIFE_PHYSICHALL,
        age: row.WIFE_AGE,
        birthreligion: row.WIFE_BIRTHRELIGION,
        adopreligion: row.WIFE_ADOPRELIGION,
        email: row.WIFE_EMAIL,
        iddoc: row.WIFE_IDDOC,
        addresdoc: row.WIFE_ADDRESDOC,
        agedoc: row.WIFE_AGEDOC,
        birthdt: row.WIFE_BIRTHDT,
        aadharno: row.WIFE_AADHARNO,
      },
      witness1: {
        efname: row.WITN1_EFNAME,
        emname: row.WITN1_EMNAME,
        mfname: row.WITN1_MFNAME,
        mmname: row.WITN1_MMNAME,
        mlname: row.WITN1_MLNAME,
        docid: row.WITN1_DOCID,
        relationid: row.WITN1_RELATIONID,
        mobileno: row.WITN1_MOBILENO,
        age: row.WITN1_AGE,
        eaddre: row.WITN1_EADDRE,
        maddre: row.WITN1_MADDRE,
        birthdate: row.WITN1_BIRTHDATE,
      },
      witness2: {
        efname: row.WITN2_EFNAME,
        emname: row.WITN2_EMNAME,
        elname: row.WITN2_ELNAME,
        mfname: row.WITN2_MFNAME,
        mmname: row.WITN2_MMNAME,
        mlname: row.WITN2_MLNAME,
        docid: row.WITN2_DOCID,
        relationid: row.WITN2_RELATIONID,
        mobileno: row.WITN2_MOBILENO,
        age: row.WITN2_AGE,
        eaddre: row.WITN2_EADDRE,
        maddre: row.WITN2_MADDRE,
        birthdate: row.WITN2_BIRTHDATE,
      },
      witness3: {
        efname: row.WITN3_EFNAME,
        emname: row.WITN3_EMNAME,
        elname: row.WITN3_ELNAME,
        mfname: row.WITN3_MFNAME,
        mmname: row.WITN3_MMNAME,
        mlname: row.WITN3_MLNAME,
        docid: row.WITN3_DOCID,
        relationid: row.WITN3_RELATIONID,
        mobileno: row.WITN3_MOBILENO,
        age: row.WITN3_AGE,
        eaddre: row.WITN3_EADDRE,
        birthdate: row.WITN3_BIRTHDATE,
      },
      priest: {
        efname: row.PRIEST_EFNAME,
        emname: row.PRIEST_EMNAME,
        elname: row.PRIEST_ELNAME,
        mfname: row.PRIEST_MFNAME,
        mmname: row.PRIEST_MMNAME,
        mlname: row.PRIEST_MLNAME,
        age: row.PRIEST_AGE,
        religionid: row.PRIEST_RELIGIONID,
        eaddre: row.PRIEST_EADDRE,
        maddre: row.PRIEST_MADDRE,
      },
      images: {
        husbpic: row.HUSBPIC ? row.HUSBPIC.toString('base64') : null,
        husbthumb: row.HUSBTHUMB ? row.HUSBTHUMB.toString('base64') : null,
        wifepic: row.WIFEPIC ? row.WIFEPIC.toString('base64') : null,
        wifethumb: row.WIFETHUMB ? row.WIFETHUMB.toString('base64') : null,
        wit1pic: row.WIT1PIC ? row.WIT1PIC.toString('base64') : null,
        wit1thumb: row.WIT1THUMB ? row.WIT1THUMB.toString('base64') : null,
        wit2pic: row.WIT2PIC ? row.WIT2PIC.toString('base64') : null,
        wit2thumb: row.WIT2THUMB ? row.WIT2THUMB.toString('base64') : null,
        wit3pic: row.WIT3PIC ? row.WIT3PIC.toString('base64') : null,
        wit3thumb: row.WIT3THUMB ? row.WIT3THUMB.toString('base64') : null,
      },
      documents: documents.map(d => ({
        docId: d.NUM_MARRIAGE_MRRGDOCID,
        docBlob: d.BLOB_MARRIAGE_MRRGDOC ? d.BLOB_MARRIAGE_MRRGDOC.toString('base64') : null,
      })),
    },
  };
}

async function getServicePaymentFlagService(serviceId) {
  if (!serviceId) {
    throw new AppError("Service ID is required", 400);
  }

  const result = await repo.getServicePaymentFlag(serviceId);
  if (!result.success) {
    throw new AppError(result.error, 500);
  }

  return {
    success: true,
    rowCount: result.rows.length,
    rows: result.rows,
  };
}

async function uploadHusbandImagesService(params) {
  const { mrrgdtlidId, mrrgid, photoFile, thumbFile } = params;

  if (!mrrgdtlidId) {
    throw new AppError("Marriage Detail ID is required", 400);
  }
  if (!mrrgid) {
    throw new AppError("Marriage ID is required", 400);
  }

  const result1 = await repo.updateMrgImages({
    mrrgdtlidId: mrrgdtlidId,
    flag: "H",
    imgPhoto: photoFile || null,
    imgThumb: thumbFile || null,
  });

  const result2 = await repo.updateMrgModImages({
    mrrgdtlidId: mrrgid,
    flag: "H",
    imgPhoto: photoFile || null,
    imgThumb: thumbFile || null,
  });

  if (!result1.success || !result2.success) {
    throw new AppError("Failed to upload husband images", 500);
  }

  return { success: true, message: "Husband images uploaded successfully" };
}

async function uploadWifeImagesService(params) {
  const { mrrgdtlidId, mrrgid, photoFile, thumbFile } = params;

  if (!mrrgdtlidId) {
    throw new AppError("Marriage Detail ID is required", 400);
  }
  if (!mrrgid) {
    throw new AppError("Marriage ID is required", 400);
  }

  const result1 = await repo.updateMrgImages({
    mrrgdtlidId: mrrgdtlidId,
    flag: "W",
    imgPhoto: photoFile || null,
    imgThumb: thumbFile || null,
  });

  const result2 = await repo.updateMrgModImages({
    mrrgdtlidId: mrrgid,
    flag: "W",
    imgPhoto: photoFile || null,
    imgThumb: thumbFile || null,
  });

  if (!result1.success || !result2.success) {
    throw new AppError("Failed to upload wife images", 500);
  }

  return { success: true, message: "Wife images uploaded successfully" };
}

async function uploadWitnessImagesService(params) {
  const { mrrgdtlidId, mrrgid, witnessNumber, photoFile, thumbFile } = params;

  if (!mrrgdtlidId) {
    throw new AppError("Marriage Detail ID is required", 400);
  }
  if (!mrrgid) {
    throw new AppError("Marriage ID is required", 400);
  }
  if (!witnessNumber || ![1, 2, 3].includes(Number(witnessNumber))) {
    throw new AppError("Valid Witness Number (1, 2, or 3) is required", 400);
  }

  const result1 = await repo.addUpdateImage({
    mrrgdtlidId: mrrgdtlidId,
    witnessNumber: Number(witnessNumber),
    imagePhoto: photoFile || null,
    imageThumb: thumbFile || null,
  });

  const result2 = await repo.addUpdateMrgImage({
    mrrgdtlidId: mrrgid,
    witnessNumber: Number(witnessNumber),
    imagePhoto: photoFile || null,
    imageThumb: thumbFile || null,
  });

  if (!result1.success || !result2.success) {
    throw new AppError(`Failed to upload witness ${witnessNumber} images`, 500);
  }

  return { success: true, message: `Witness ${witnessNumber} images uploaded successfully` };
}

async function uploadBeforeMarriageDocService(params) {
  const { mrrgdtlid, mrrgdocid, mrrgdoc, flag, user, ulbid, mrrgdocflag } = params;

  if (!mrrgdtlid) {
    throw new AppError("Marriage Detail ID is required", 400);
  }
  if (!mrrgdocid) {
    throw new AppError("Document ID is required", 400);
  }
  if (!flag) {
    throw new AppError("Flag (BR/GR) is required", 400);
  }
  if (!mrrgdocflag) {
    throw new AppError("Document flag (IdDoc/AddDoc/AgDoc) is required", 400);
  }
  if (!mrrgdoc || mrrgdoc.length === 0) {
    throw new AppError("Document file is required", 400);
  }

  const result = await repo.uploadDoc({
    mrrgdtlid: mrrgdtlid,
    mrrgdocid: Number(mrrgdocid),
    mrrgdoc: mrrgdoc,
    flag: flag,
    user: user,
    ulbid: ulbid,
    mrrgdocflag: mrrgdocflag,
  });

  if (!result.success) {
    throw new AppError("Failed to upload document", 500);
  }

  return { success: true, message: "Document uploaded successfully" };
}

async function uploadGridDocumentService(params) {
  const { corpId, serviceId, appNo, docType, documentId, fileBuffer } = params;

  if (!corpId) {
    throw new AppError("Corp ID is required", 400);
  }
  if (!serviceId) {
    throw new AppError("Service ID is required", 400);
  }
  if (!appNo) {
    throw new AppError("Application Number is required", 400);
  }
  if (!documentId) {
    throw new AppError("Document ID is required", 400);
  }
  if (!fileBuffer || fileBuffer.length === 0) {
    throw new AppError("Document file is required", 400);
  }

  const result = await repo.insertAppDoc({
    corpId,
    serviceId,
    appNo,
    docType: docType || "S",
    documentId,
    docBuffer: fileBuffer,
  });

  if (!result.success) {
    throw new AppError(result.error || "Document upload failed", 500);
  }

  return { success: true, message: "Document uploaded successfully" };
}

module.exports = {
  getZonesService,
  getPreviousStatusService,
  getReligionListService,
  getIDDocumentsService,
  getAddressDocumentsService,
  getAgeDocumentsService,
  getRelationsService,
  getDocumentDefinitionsService,
  calculateAgeService,
  submitMarriageRegistrationService,
  getMarriageDataService,
  getServicePaymentFlagService,
  uploadHusbandImagesService,
  uploadWifeImagesService,
  uploadWitnessImagesService,
  uploadBeforeMarriageDocService,
  uploadGridDocumentService,
};