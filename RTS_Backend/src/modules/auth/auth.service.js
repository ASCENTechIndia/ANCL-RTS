const jwt = require("jsonwebtoken");
const { AppError } = require("../../libs/errors");
const repo = require("./auth.repo");
const { JWT_SECRET, JWT_REFRESH_SECRET } = require("../../config/env");

const ACCESS_TOKEN_EXPIRES_IN = "30m";
const REFRESH_TOKEN_EXPIRES_IN = "7d";

function signRefreshToken(payload) {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  });
}

function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET);
  } catch (error) {
    throw new AppError("Invalid or expired refresh token", 401);
  }
}

async function refreshAccessToken(refreshToken) {
  if (!refreshToken) {
    throw new AppError("Refresh token is required", 401);
  }

  const decoded = verifyRefreshToken(refreshToken);

  const payload = {
    sub: decoded.sub,
    name: decoded.name,
    ulbId: decoded.ulbId,
    corpId: decoded.corpId,
  };

  return {
    token: signAccessToken(payload),
  };
}

function encodePassword(password) {
  if (!password || typeof password !== "string") {
    throw new AppError("Password is required", 422);
  }

  return Buffer.from(password, "utf8").toString("base64");
}

function encodePasswordValue(password) {
  if (!password || typeof password !== "string") {
    throw new AppError("Password is required", 422);
  }

  return encodePassword(password);
}

function signAccessToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES_IN });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new AppError("Invalid or expired token", 401);
  }
}

async function registerUser({ userId, orgId, name, email, mobile, dob, password, confirmPassword, ipAddress, source, propNo }) {
  if (!userId) {
    throw new AppError("User ID is required", 422);
  }
  if (!orgId) {
    throw new AppError("Organization ID is required", 422);
  }
  if (!name) {
    throw new AppError("Name is required", 422);
  }
  if (!email) {
    throw new AppError("Email is required", 422);
  }
  if (!mobile) {
    throw new AppError("Mobile number is required", 422);
  }
  if (!dob) {
    throw new AppError("Date of birth is required", 422);
  }
  if (!password) {
    throw new AppError("Password is required", 422);
  }
  if (!confirmPassword) {
    throw new AppError("Confirm password is required", 422);
  }
  if (password !== confirmPassword) {
    throw new AppError("Password and confirm password do not match", 422);
  }

  const encodedPassword = encodePasswordValue(password);
  const encodedConfirmPassword = encodePasswordValue(confirmPassword);

  const result = await repo.registerUser({
    userId,
    orgId: Number(orgId),
    name,
    email,
    mobile: Number(mobile),
    dob,
    password: encodedPassword,
    confirmPassword: encodedConfirmPassword,
    ipAddress: ipAddress,
    source: source,
    propNo: propNo,
  });

  const errorCode = Number(result?.errorCode ?? 0);
  const errorMsg = result?.errorMsg;

  if (errorCode !== 9999) {
    throw new AppError(errorMsg, 422);
  }

  return { errorCode, errorMsg };
}

async function loginProc({ corpId, mobile, password, ulbId, logflag }) {
  if (!corpId) throw new AppError("corpId is required", 422);
  if (!mobile) throw new AppError("mobile is required", 422);
  if (!password) throw new AppError("password is required", 422);
  if (!ulbId) throw new AppError("ulbId is required", 422);

  const encodedPassword = encodePassword(password);

  const out = await repo.loginByProcedure({
    corpId: Number(corpId),
    mobile: Number(mobile),
    password: encodedPassword,
    ulbId: Number(ulbId),
    logflag: logflag || "L"
  });

  if (!out) {
    throw new AppError("Procedure did not return output", 500);
  }

  const errorCode = Number(out.errorCode ?? 0);
  const errorMsg = out.errorMsg ?? "Login failed";

  if (errorCode !== 9999) {
    throw new AppError(errorMsg, 401);
  }

  const tokenPayload = {
    sub: out.userId,
    name: out.username,
    ulbId: out.ulbId,
    corpId: Number(corpId),
  };

  return {
    token: signAccessToken(tokenPayload),
    refreshToken: signRefreshToken(tokenPayload),
    user: {
      userId: out.userId,
      username: out.username,
      // fullName: out.username,
      ulbId: out.ulbId,
      corpId: Number(corpId),
      email: out.email,
      lastLogin: out.lastLogin,
      lastLogout: out.lastLogout
    },
    errorCode,
    errorMsg
  };
}

async function sendLoginOtp({ userId, ulbId, mobileNumber }) {
  if (!mobileNumber) {
    throw new AppError("Mobile number is required", 422);
  }

  if (!ulbId) {
    throw new AppError("ULB ID is required", 422);
  }

  const result = await repo.sendLoginOtp({
    userId,
    ulbId,
    mobileNumber
  });

  if (!result) {
    throw new AppError("OTP procedure did not return output", 500);
  }

  const errorCode = Number(result.errorCode ?? 0);

  if (errorCode !== 9999) {
    throw new AppError(
      result.errorMsg || "Unable to send OTP",
      401
    );
  }

  return {
    errorCode,
    errorMsg: result.errorMsg
  };
}

async function loginWithOtp({ userId, ulbId, mobileNumber, otp }) {
  if (!mobileNumber) {
    throw new AppError("Mobile number is required", 422);
  }
  if (!otp) {
    throw new AppError("OTP is required", 422);
  }

  const result = await repo.loginWithOtpProcedure({ userId, ulbId, mobileNumber, otp });
  if (!result) {
    throw new AppError("OTP login failed", 500);
  }

  const errorCode = Number(result.errorCode ?? 0);
  if (errorCode !== 9999) {
    throw new AppError(result.errorMsg || "OTP verification failed", 401);
  }

  const corpId = 10001;

  const tokenPayload = {
    sub: result.userId,
    name: result.username,
    ulbId: result.ulbId,
    corpId: corpId,
  };

  return {
    token: signAccessToken(tokenPayload),
    refreshToken: signRefreshToken(tokenPayload),
    user: {
      userId: result.userId,
      username: result.username,
      fullName: result.username,
      ulbId: result.ulbId,
      corpId,
      email: result.email,
      lastLogin: result.lastLogin,
      lastLogout: result.lastLogout
    },
    errorCode,
    errorMsg: result.errorMsg
  };
}

async function getForgotPasswordDetails({ mobile }) {
  if (!mobile) {
    throw new AppError("Mobile number is required", 422);
  }

  if (!/^\d{10}$/.test(String(mobile))) {
    throw new AppError("Invalid mobile number", 422);
  }

  const result = await repo.getForgotPasswordDetails({ mobile: Number(mobile) });

  if (!result) {
    throw new AppError("Mobile number is not registered", 404);
  }
  if (!result.EMAIL) {
    throw new AppError("Email not found for this mobile number", 404);
  }

  return {
    email: result.EMAIL,
    password: result.PASS || ""
  };
}

async function changePassword({ corpId, oldPassword, newPassword, userId, mode }) {
  if (!corpId) {
    throw new AppError("Corporation ID is required", 422);
  }

  if (!userId) {
    throw new AppError("User ID is required", 422);
  }

  if (!newPassword) {
    throw new AppError("New password is required", 422);
  }

  if (mode === undefined || mode === null) {
    throw new AppError("Mode is required", 422);
  }

  const numericMode = Number(mode);

  if (numericMode === 1 && !oldPassword) {
    throw new AppError("Old password is required", 422);
  }

  if (numericMode === 2 && !oldPassword) {
    throw new AppError("Stored password is required", 422);
  }

  const encodedOldPassword = numericMode === 2 ? oldPassword : encodePassword(oldPassword);

  const encodedNewPassword = encodePassword(newPassword);

  const result = await repo.changePassword({
    corpId: Number(corpId),
    oldPassword: encodedOldPassword,
    newPassword: encodedNewPassword,
    userId,
    mode: numericMode
  });

  const errorCode = Number(result?.errorCode ?? 0);
  const errorMsg = result?.errorMsg || "Password change failed";

  if (errorCode !== 9999) {
    throw new AppError(errorMsg, 422);
  }

  return {
    errorCode,
    message: errorMsg
  };
}

async function getCitizenDetailsByMobile({ mobile }) {
  if (!mobile) {
    throw new AppError("mobile is required", 422);
  }

  const data = await repo.getCitizenDetailsByMobile({
    mobile: Number(mobile)
  });

  if (!data) {
    throw new AppError("Citizen details not found", 404);
  }

  let email = data.EMAIL || "";

  if (/^\d{10}$/.test(email)) {
    email = "noemail@gmail.com";
  }

  return {
    name: data.VAR_USER_FNAME || String(mobile),
    mobile: String(data.NUM_USER_MOBILENO || mobile),
    email,
    password: data.PASSWORD || ""
  };
}

async function employeeLoginService({ corpId = 10001, userId, password }) {

  if (!userId?.trim()) {
    throw new AppError("User ID is required.", 422);
  }
  if (!password) {
    throw new AppError("Password is required.", 422);
  }

  const employeeCorpId = Number(corpId);

  const result = await repo.employeeLoginRepo({ corpId: employeeCorpId, userId: userId.trim(), password });
  if (!result?.success) {
    throw new AppError(result?.error || "Unable to process employee login.", 500);
  }

  const errCode = Number(result?.errCode ?? 0);
  if (errCode !== 9999) {
    throw new AppError(result?.errMsg || "Invalid Username or Password.", 401);
  }

  const strInfo = String(result?.strInfo || "");
  const values = strInfo.split("$");
  console.log({values})
  // if (values.length < 9) {
  //   throw new AppError("Invalid employee information received from login procedure.", 500);
  // }

  const [procedureCorpId, username, lastLogin, lastLogout, empType, zoneId, ulbId, otpValidate, mobileNo] = values.map((value) => String(value ?? "").trim());

  if (!username) {
    throw new AppError("Employee username was not returned from login procedure.", 500);
  }
  if (!ulbId) {
    throw new AppError("ULB ID was not returned from login procedure.", 500);
  }

  const finalCorpId = Number(procedureCorpId || employeeCorpId);

  const employeeUser = {
    userId: userId.trim(),
    username,
    corpId: finalCorpId,
    ulbId: Number(ulbId),
    lastLogin: lastLogin,
    lastLogout: lastLogout,
    empType: empType,
    zoneId: zoneId,
    otpValidate: otpValidate,
    mobileNo: mobileNo,
  };

  const tokenPayload = {
    sub: employeeUser.userId,
    name: employeeUser.username,
    ulbId: employeeUser.ulbId,
    corpId: employeeUser.corpId,
    empType: employeeUser.empType,
    zoneId: employeeUser.zoneId,
  };

  const token = signAccessToken(tokenPayload);
  const refreshToken = signRefreshToken(tokenPayload);

  return {
    success: true,
    errCode: 9999,
    resultString: result.strInfo,
    message: "Login successful.",
    token,
    refreshToken,
    user: employeeUser,
  };
}


module.exports = {
  registerUser,
  loginProc,
  sendLoginOtp,
  loginWithOtp,
  getForgotPasswordDetails,
  changePassword,
  verifyToken,
  getCitizenDetailsByMobile,
  employeeLoginService,
  signRefreshToken,
  verifyRefreshToken,
  refreshAccessToken,
};