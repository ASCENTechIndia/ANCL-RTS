const asyncHandler = require("../../../libs/asyncHandler");
const { ok, fail } = require("../../../libs/response");
const service = require("./FrmPropertyAppel.service");
const crypto = require("crypto");

const ENCRYPTION_KEY = "AS23N7E2H4V717DEAS23N7E2H4V717DE";

function encryptString(plainText, keyValue) {
  const keyBuffer = Buffer.from(keyValue, 'utf8');
  const key = Buffer.alloc(32);
  keyBuffer.copy(key);

  const iv = Buffer.alloc(16, 0);

  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return encrypted.toUpperCase();
}

function decryptString(cipherText, keyValue) {
  const key = Buffer.from(keyValue, "utf8").slice(0, 32);
  const iv = Buffer.alloc(16, 0);
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  let decrypted = decipher.update(cipherText, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

const getWards = asyncHandler(async (req, res) => {
  const ulbId = req.query.ulbId || req.user?.ulbId;
  const data = await service.getWardsService(ulbId);
  return ok(res, { success: true, data });
});

const getUsageTypes = asyncHandler(async (req, res) => {
  const data = await service.getUsageTypesService();
  return ok(res, { success: true, data });
});

const getObjections = asyncHandler(async (req, res) => {
  const data = await service.getObjectionsService();
  return ok(res, { success: true, data });
});

const getUsageSubTypes = asyncHandler(async (req, res) => {
  const usageTypeId = req.query.usageTypeId;
  const data = await service.getUsageSubTypesService(usageTypeId);
  return ok(res, { success: true, data });
});

const getServiceUrl = asyncHandler(async (req, res) => {
  const ulbId = req.query.ulbId || req.user?.ulbId;
  const data = await service.getServiceUrlService(ulbId);
  return ok(res, { success: true, data });
});

const createPropAppeal = asyncHandler(async (req, res) => {
  const data = await service.submitPropAppealService(req.body);
  return ok(res, data);
});

const getPropertyDetails = asyncHandler(async (req, res) => {
  const { propNo, userId } = req.body;
  const ulbId = req.body.ulbId || req.user?.ulbId;

  if (!propNo) return fail(res, "Property Number is required");
  if (!userId) return fail(res, "User ID is required");
  if (!ulbId) return fail(res, "ULB ID is required");

  try {
    const urlData = await service.getServiceUrlService(ulbId);

    console.log("urlData: ",urlData)
    const serviceUrl = urlData.clientUrl;

    if (!serviceUrl || serviceUrl === "444") {
      return fail(res, "Service URL not configured for this ULB");
    }

    // 1. Build the EXACT JSON string .NET builds
    // .NET: String JsonReq = "{\"jsonData\":[{" + "\"user_id\" : \"" + userId + "\"," + "\"propno\" : \"" + PropNo + "\", " + "\"flatno\" : \"\" " + "}]}";
    const rawJsonReq = `{"jsonData":[{"user_id" : "${userId}","propno" : "${propNo}", "flatno" : "" }]}`;
    
    // 2. Encrypt
    const encryptedRequest = encryptString(rawJsonReq, ENCRYPTION_KEY);

    // 3. Build the EXACT payload .NET sends (raw string, NO quotes around encr_request)
    const finalPayloadString = `{"jsonData":[{"encr_request" : ${encryptedRequest} }]}`;

    console.log("Calling External API for Property:", propNo);
    console.log("Payload being sent:", finalPayloadString); 

    // 4. Call External API (Sending as text/plain or application/json with raw string)
    const response = await fetch(serviceUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: finalPayloadString, // Send the raw string exactly as built
    });

    const responseText = await response.text();
    console.log("Response Status:", response.status);
    console.log("Raw Response Text:", responseText);

    if (!response.ok) {
      try {
        const errorData = JSON.parse(responseText);
        if (errorData.Response) {
          const decrypted = decryptString(errorData.Response, ENCRYPTION_KEY);
          console.log("Decrypted Error Response:", decrypted);
          return fail(res, `External API Error: ${decrypted}`);
        }
      } catch (e) {}
      return fail(res, `External API error: ${response.status} - ${responseText}`);
    }

    // 5. Handle Success Response
    let data = JSON.parse(responseText);
    let encryptedResponse = data?.jsonData?.[0]?.encr_request || data?.Response;

    if (encryptedResponse) {
      console.log("Encrypted Response received, decrypting...");
      const decryptedResponse = decryptString(encryptedResponse, ENCRYPTION_KEY);
      console.log("Decrypted Response:", decryptedResponse);
      
      const result = JSON.parse(decryptedResponse);
      return ok(res, result, "Property details fetched successfully");
    }

    return fail(res, "Property not found or invalid response format");
  } catch (error) {
    console.error("getPropertyDetails Error:", error);
    return fail(res, "Error fetching property details: " + error.message);
  }
});

const handleDecryptedResponse = (encryptedStr, res) => {
  try {
    console.log("Encrypted Response received, decrypting...");
    const decryptedResponse = decryptString(encryptedStr, ENCRYPTION_KEY);
    console.log("Decrypted Response:", decryptedResponse);
    
    const result = JSON.parse(decryptedResponse);
    return ok(res, result, "Property details fetched successfully");
  } catch (err) {
    console.error("Decryption failed:", err);
    return fail(res, "Failed to decrypt external API response");
  }
};

module.exports = {
  getWards,
  getUsageTypes,
  getObjections,
  getUsageSubTypes,
  getServiceUrl,
  createPropAppeal,
  getPropertyDetails,
};