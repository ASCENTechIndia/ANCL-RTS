const repo = require("./FrmWaterAppliEntry.repo");
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

async function getConnectionTypesService() {
  const result = await repo.getConnectionTypes();
  if (!result.success) {
    throw new AppError(result.error, 500);
  }
  return {
    success: true,
    rowCount: result.rows.length,
    rows: result.rows,
  };
}

async function getConnectionSizesService() {
  const result = await repo.getConnectionSizes();
  if (!result.success) {
    throw new AppError(result.error, 500);
  }
  return {
    success: true,
    rowCount: result.rows.length,
    rows: result.rows,
  };
}

async function getUsageTypesService() {
  const result = await repo.getUsageTypes();
  if (!result.success) {
    throw new AppError(result.error, 500);
  }
  return {
    success: true,
    rowCount: result.rows.length,
    rows: result.rows,
  };
}

async function getUsageSubTypesService(usageTypeId) {
  if (!usageTypeId) {
    throw new AppError("Usage Type ID is required", 400);
  }

  const result = await repo.getUsageSubTypes(usageTypeId);
  if (!result.success) {
    throw new AppError(result.error, 500);
  }

  return {
    success: true,
    rowCount: result.rows.length,
    rows: result.rows,
  };
}

async function getConnectionStatusesService() {
  const result = await repo.getConnectionStatuses();
  if (!result.success) {
    throw new AppError(result.error, 500);
  }
  return {
    success: true,
    rowCount: result.rows.length,
    rows: result.rows,
  };
}

async function getBusinessCertificatesService() {
  const result = await repo.getBusinessCertificates();
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

  if (!corpId) throw new AppError("Corp ID is required", 400);
  if (!serviceId) throw new AppError("Service ID is required", 400);
  if (!ulbId) throw new AppError("ULB ID is required", 400);

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

async function getApplicationDetailsService(applicationNo) {
  if (!applicationNo) {
    throw new AppError("Application Number is required", 400);
  }

  const result = await repo.getApplicationDetails(applicationNo);
  
  if (!result.success) {
    throw new AppError(result.error, 500);
  }

  if (result.rows.length === 0) {
    throw new AppError("Application not found", 404);
  }

  const row = result.rows[0];

  return {
    success: true,
    data: {
      applicationId: row.NUM_APPLIENTRY_ID,
      ulbId: row.NUM_APPLIENTRY_ULBID,
      
      // Applicant Details
      afName: row.VAR_APPLIENTRY_FNAME,
      amName: row.VAR_APPLIENTRY_MNAME,
      alName: row.VAR_APPLIENTRY_LNAME,
      mobileNo: row.NUM_APPLIENTRY_MOBNO,
      email: row.VAR_APPLIENTRY_EMAIL,
      aadharNo: row.NUM_APPLIENTRY_ADHARNO,
      propNo: row.VAR_APPLIENTRY_PROPNO,
      resNo: row.VAR_APPLIENTRY_RESNO,
      address: row.ADDRESS,
      zoneId: row.ZONEID,
      
      // Marathi Applicant Details
      afNameMr: row.AFNAMEMR,
      amNameMr: row.AMNAMEMR,
      alNameMr: row.ALNAMEMR,
      addressMr: row.ADDRESSMR,
      
      // Consumer Details
      conFName: row.VAR_APPLIENTRY_CONFNAME,
      conMName: row.VAR_APPLIENTRY_CONMNAME,
      conLName: row.VAR_APPLIENTRY_CONLNAME,
      conMobNo: row.NUM_APPLIENTRY_CONMOBNO,
      conEmail: row.VAR_APPLIENTRY_CONEMAIL,
      conAadharNo: row.NUM_APPLIENTRY_CONADHARNO,
      conPropNo: row.VAR_APPLIENTRY_CONPROPNO,
      conResNo: row.VAR_APPLIENTRY_CONRESNO,
      
      // Co-Owner Details
      cooFlag: row.VAR_APPLIENTRY_COOFLAG,
      cooFName1: row.VAR_APPLIENTRY_COOFNAME1,
      cooMName1: row.VAR_APPLIENTRY_COOMNAME1,
      cooLName1: row.VAR_APPLIENTRY_COOLNAME1,
      cooFName2: row.VAR_APPLIENTRY_COOFNAME2,
      cooMName2: row.VAR_APPLIENTRY_COOMNAME2,
      cooLName2: row.VAR_APPLIENTRY_COOLNAME2,
      
      // Connection Details
      connType: row.NUM_APPLIENTRY_CONTYPEID,
      connSize: row.NUM_APPLIENTRY_CONSIZEID,
      usageType: row.NUM_APPLIENTRY_USAGETYPEID,
      usageSubType: row.NUM_APPLIENTRY_USAGESUBTYPID,
      noOfPerson: row.NUM_APPLIENTRY_NOOFPERSON,
      noOfFamily: row.NUM_APPLIENTRY_NOOFFAMILY,
      noOfConn: row.NUM_APPLIENTRY_NOOFCONN,
      connStatus: row.NUM_APPLIENTRY_CONSTATUSID,
      busiCert: row.NUM_APPLIENTRY_BUSICERTID,
      billingType: row.VAR_APPLIENTRY_BILLTYPE,
      govPropFlag: row.VAR_APPLIENTRY_GOVPROPFLAG,
      
      // Remarks
      remark: row.REMARK,
      reason: row.REASON
    },
  };
}

async function uploadDocumentService(params) {
  const { corpId, serviceId, appNo, docType, documentId, fileBuffer } = params;

  if (!corpId) throw new AppError("Corp ID is required", 400);
  if (!serviceId) throw new AppError("Service ID is required", 400);
  if (!appNo) throw new AppError("Application Number is required", 400);
  if (!docType) throw new AppError("Document Type is required", 400);
  if (!documentId) throw new AppError("Document ID is required", 400);
  if (!fileBuffer || fileBuffer.length === 0) {
    throw new AppError("Document file is required", 400);
  }

  if (fileBuffer.length > 15 * 1024 * 1024) {
    throw new AppError("Document size should be less than 15MB", 400);
  }

  const result = await repo.insertDocument({
    corpId,
    serviceId,
    appNo,
    docType,
    documentId,
    docBuffer: fileBuffer,
  });

  if (!result.success) {
    throw new AppError(result.error || "Document upload failed", 500);
  }

  return { success: true, message: "Document uploaded successfully" };
}

async function submitWaterApplicationService(payload) {
  const {
    ulbId,
    corpId,
    userId,
    zoneId,
    serviceId,
    appSource,
    afName,
    amName,
    alName,
    mobileNo,
    email,
    aadharNo,
    propNo,
    resNo,
    address,
    afNameMr,
    amNameMr,
    alNameMr,
    addressMr,
    conFName,
    conMName,
    conLName,
    conMobNo,
    conEmail,
    conAadharNo,
    conPropNo,
    conResNo,
    conFNameMr,
    conMNameMr,
    conLNameMr,
    cooFlag,
    cooFName1,
    cooMName1,
    cooLName1,
    cooFName2,
    cooMName2,
    cooLName2,
    cooAddress,
    cooAddressMr,
    connType,
    connSize,
    usageType,
    usageSubType,
    noOfPerson,
    noOfFamily,
    noOfConn,
    connStatus,
    busiCert,
    billingType,
    govPropFlag,
    remark,
    reason,
    documents,
  } = payload;

  if (!ulbId) throw new AppError("ULB ID is required", 400);
  if (!userId) throw new AppError("User ID is required", 400);
  if (!zoneId || zoneId === "0") {
    throw new AppError("Select valid Zone from the list", 400);
  }
  if (!serviceId) throw new AppError("Service ID is required", 400);

  if (!afName) throw new AppError("Applicant First Name can not be blank", 400);
  if (!amName) throw new AppError("Applicant Middle Name can not be blank", 400);
  if (!alName) throw new AppError("Applicant Last Name can not be blank", 400);

  if (!afNameMr) throw new AppError("Applicant First Marathi Name can not be blank", 400);
  if (!amNameMr) throw new AppError("Applicant Middle Marathi Name can not be blank", 400);
  if (!alNameMr) throw new AppError("Applicant Last Marathi Name can not be blank", 400);

  if (!mobileNo) throw new AppError("Mobile Number is required", 400);
  if (String(mobileNo).length !== 10) throw new AppError("Invalid Mobile No.", 400);

  if (!email) throw new AppError("Email can not be blank", 400);
  const emailRegex = /^([\w\.\-]+)@([\w\-]+)((\.(\w){2,3})+)$/;
  if (!emailRegex.test(email)) throw new AppError("Invalid Email Address", 400);

  if (aadharNo && String(aadharNo).length !== 12) {
    throw new AppError("Please enter valid Aadhar No.", 400);
  }

  if (!propNo) throw new AppError("Property Number can not be blank", 400);
  if (!resNo) throw new AppError("Residential Number can not be blank", 400);
  if (!address) throw new AppError("Address can not be blank", 400);
  if (!addressMr) throw new AppError("Address Marathi can not be blank", 400);

  if (!conFName) throw new AppError("Consumer First Name can not be blank", 400);
  if (!conMName) throw new AppError("Consumer Middle Name can not be blank", 400);
  if (!conLName) throw new AppError("Consumer Last Name can not be blank", 400);

  if (!conFNameMr) throw new AppError("Consumer First Marathi Name can not be blank", 400);
  if (!conMNameMr) throw new AppError("Consumer Middle Marathi Name can not be blank", 400);
  if (!conLNameMr) throw new AppError("Consumer Last Marathi Name can not be blank", 400);

  if (!conMobNo) throw new AppError("Consumer Mobile Number is required", 400);
  if (String(conMobNo).length !== 10) {
    throw new AppError("Invalid Consumer Mobile No.", 400);
  }

  if (!conEmail) throw new AppError("Consumer Email can not be blank", 400);
  if (!emailRegex.test(conEmail)) {
    throw new AppError("Invalid Consumer Email Address", 400);
  }

  if (conAadharNo && String(conAadharNo).length !== 12) {
    throw new AppError("Invalid Consumer Aadhar No.", 400);
  }

  if (!conPropNo) throw new AppError("Consumer Property Number can not be blank", 400);
  if (!conResNo) throw new AppError("Consumer Residential Number can not be blank", 400);

  if (!remark) throw new AppError("Remark can not be blank", 400);
  if (!reason) throw new AppError("Reason can not be blank", 400);

  if (!connType || connType === "0") throw new AppError("Select Connection Type", 400);
  if (!connSize || connSize === "0") throw new AppError("Select Connection Size", 400);
  if (!usageType || usageType === "0") throw new AppError("Select Usage Type", 400);
  if (!usageSubType || usageSubType === "0") {
    throw new AppError("Select Usage Sub-Type", 400);
  }
  if (!noOfPerson) throw new AppError("Enter Number of Persons", 400);
  if (!noOfFamily) throw new AppError("Enter Number of Families", 400);
  if (!noOfConn) throw new AppError("Enter Number of Connections", 400);
  if (!connStatus || connStatus === "0") throw new AppError("Select Connection Status", 400);
  if (!busiCert || busiCert === "0") throw new AppError("Select Business Certificate", 400);
  if (!billingType) throw new AppError("Enter Billing Type", 400);
  if (!govPropFlag) throw new AppError("Select Is This Government Property?", 400);

  let docString = "";
  if (documents && documents.length > 0) {
    for (const doc of documents) {
      if (doc.checked) {
        docString += `${doc.docId}$${doc.fileExtension || "PDF"}#`;
      }
    }
    if (docString) {
      docString = docString.slice(0, -1);
    }
  }

  if (!docString) {
    throw new AppError("Select Atleast One Document for upload", 400);
  }

  const appResult = await repo.insertWaterApplication({
    userId,
    ulbId,
    zoneId,
    serviceId,
    appSource: appSource || "",
    afName,
    amName,
    alName,
    mobileNo,
    email,
    aadharNo: aadharNo || null,
    propNo,
    resNo,
    address,
    afNameMr,
    amNameMr,
    alNameMr,
    addressMr,
    conFName,
    conMName,
    conLName,
    conMobNo,
    conEmail,
    conAadharNo: conAadharNo || null,
    conPropNo,
    conResNo,
    conFNameMr,
    conMNameMr,
    conLNameMr,
    cooFlag: cooFlag || "N",
    cooFName1: cooFName1 || null,
    cooMName1: cooMName1 || null,
    cooLName1: cooLName1 || null,
    cooFName2: cooFName2 || null,
    cooMName2: cooMName2 || null,
    cooLName2: cooLName2 || null,
    cooAddress: cooAddress || null,
    cooAddressMr: cooAddressMr || null,
    connType,
    connSize,
    usageType,
    usageSubType,
    noOfPerson,
    noOfFamily,
    noOfConn,
    connStatus,
    busiCert,
    billingType,
    govPropFlag,
    remark,
    reason,
    docString,
  });

  if (!appResult.success) {
    throw new AppError(appResult.error || "Application submission failed", 500);
  }

  const outBinds = appResult.outBinds;

  if (Number(outBinds.out_errcode) !== 9999) {
    return {
      success: false,
      errorCode: outBinds.out_errcode,
      message: outBinds.out_errMsg,
    };
  }

  const applicationNo = outBinds.out_applino;

  if (documents && documents.length > 0) {
    for (const doc of documents) {
      if (doc.checked && doc.fileBuffer && doc.fileBuffer.length > 0) {
        try {
          let buffer;
          if (Buffer.isBuffer(doc.fileBuffer)) {
            buffer = doc.fileBuffer;
          } else if (typeof doc.fileBuffer === "string") {
            if (doc.fileBuffer.startsWith("data:")) {
              const base64Data = doc.fileBuffer.split(",")[1];
              buffer = Buffer.from(base64Data, "base64");
            } else {
              buffer = Buffer.from(doc.fileBuffer, "base64");
            }
          } else {
            buffer = Buffer.from(doc.fileBuffer);
          }

          await repo.insertDocument({
            corpId,
            serviceId,
            appNo: applicationNo,
            docType: doc.fileExtension || "PDF",
            documentId: Number(doc.docId),
            docBuffer: buffer,
          });
        } catch (error) {
          throw new AppError(`Failed to upload document: ${doc.docName}`, 500);
        }
      }
    }
  }

  const paymentResult = await repo.getServicePaymentFlag(serviceId);
  let payFlag = "N";
  if (paymentResult.success && paymentResult.rows.length > 0) {
    payFlag = paymentResult.rows[0].VAR_SERVICE_PAYFLAG || "N";
  }

  const message = outBinds.out_errMsg || "Application submitted successfully";

  return {
    success: true,
    errorCode: outBinds.out_errcode,
    message: message,
    applicationNo: applicationNo,
    payFlag: payFlag,
    redirectTo: payFlag === "N" ? "FrmWaterAppliEntry" : "FrmAppliFee",
  };
}

async function checkPaymentService(serviceId, applicationNo) {
  if (!serviceId) {
    throw new AppError("Service ID is required", 400);
  }

  const result = await repo.getServicePaymentFlag(serviceId);

  let payFlag = "N";
  if (result.success && result.rows.length > 0) {
    payFlag = result.rows[0].VAR_SERVICE_PAYFLAG || "N";
  }

  return {
    payFlag,
    applicationNo,
  };
}

module.exports = {
  getZonesService,
  getConnectionTypesService,
  getConnectionSizesService,
  getUsageTypesService,
  getUsageSubTypesService,
  getConnectionStatusesService,
  getBusinessCertificatesService,
  getDocumentDefinitionsService,
  getServicePaymentFlagService,
  getApplicationDetailsService,
  uploadDocumentService,
  submitWaterApplicationService,
  checkPaymentService,
};