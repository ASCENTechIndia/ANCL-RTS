const asyncHandler = require("../../../libs/asyncHandler");
const { ok, fail } = require("../../../libs/response");
const service = require("./FrmNoDuesCerti.service");
const crypto = require('crypto');

const ENCRYPTION_KEY = "AS23N7E2H4V717DEAS23N7E2H4V717DE";
const EXTERNAL_API_URL = "http://ptaxtmccollection.thanecity.gov.in/TMC_IGRClient/Service.svc/GetDataDetails_TMC";

function encryptString(plainText, keyValue) {
    const key = Buffer.from(keyValue, 'utf8').slice(0, 32);
    const iv = Buffer.alloc(16, 0);
    
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(plainText, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted.toUpperCase();
}

function decryptString(cipherText, keyValue) {
    const key = Buffer.from(keyValue, 'utf8').slice(0, 32);
    const iv = Buffer.alloc(16, 0);
    
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(cipherText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

exports.getPropertyDetails = asyncHandler(async (req, res) => {
    const { propNo, userId } = req.body;

    if (!propNo) {
        return fail(res, "Property Number is required");
    }

    if (!userId) {
        return fail(res, "User ID is required");
    }

    try {
        const jsonReq = {
            jsonData: [{
                user_id: String(userId),
                propno: String(propNo),
                flatno: ""
            }]
        };

        const jsonReqString = JSON.stringify(jsonReq);
        console.log("Original JSON:", jsonReqString);
        
        const encryptedRequest = encryptString(jsonReqString, ENCRYPTION_KEY);
        console.log("Encrypted Request:", encryptedRequest);

        const postData = {
            jsonData: [{
                encr_request: encryptedRequest
            }]
        };

        console.log("Calling External API for Property:", propNo);

        const response = await fetch(EXTERNAL_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(postData),
        });

        const responseText = await response.text();
        console.log("Response Status:", response.status);

        if (!response.ok) {
            return fail(res, `External API error: ${response.status} - ${responseText}`);
        }

        const data = JSON.parse(responseText);

        if (data?.jsonData?.[0]?.encr_request) {
            console.log("Encrypted Response received, decrypting...");
            const decryptedResponse = decryptString(
                data.jsonData[0].encr_request,
                ENCRYPTION_KEY
            );
            console.log("Decrypted Response:", decryptedResponse);
            const result = JSON.parse(decryptedResponse);
            return ok(res, result, "Property details fetched successfully");
        }

        return fail(res, "Property not found");
    } catch (error) {
        console.error("getPropertyDetails Error:", error);
        return fail(res, "Error fetching property details: " + error.message);
    }
});

exports.submitApplication = asyncHandler(async (req, res) => {
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
  } = req.body;

  // Validation
  if (!userId) {
    return fail(res, "User ID is required");
  }

  if (!zoneId) {
    return fail(res, "Zone ID is required");
  }

  if (!serviceId) {
    return fail(res, "Service ID is required");
  }

  if (!propNo) {
    return fail(res, "Property Number is required");
  }

  if (!appliname) {
    return fail(res, "Applicant Name is required");
  }

  if (!mobile) {
    return fail(res, "Mobile Number is required");
  }

  if (String(mobile).length !== 10) {
    return fail(res, "Mobile Number must be 10 digits");
  }

  if (!email) {
    return fail(res, "Email ID is required");
  }

  const emailRegex = /^([\w\.\-]+)@([\w\-]+)((\.(\w){2,3})+)$/;
  if (!emailRegex.test(email)) {
    return fail(res, "Invalid Email Address");
  }

  if (aadharNo && String(aadharNo).length !== 12) {
    return fail(res, "Aadhar Number must be 12 digits");
  }

  const result = await service.submitNoDuesCertificateApplicationService({
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
    ulbid,
  });

  if (!result.success) {
    return fail(res, result.message || "Application submission failed");
  }

  return ok(res, result, result.message || "Application submitted successfully");
});