const oracledb = require("oracledb");
const { getConnectionTMC } = require("../../config/db");
const { encryptPassword } = require("../../libs/encryption");

async function registerUser({ userId, orgId, name, email, mobile, dob, password, confirmPassword, ipAddress, source, propNo }) {
    const conn = await getConnectionTMC();

    try {
        const normalizedIpAddress = typeof ipAddress === "string" && ipAddress.trim() ? ipAddress.trim() : "127.0.0.1";

        const result = await conn.execute(
            `BEGIN
                aorts_onlineregister_ins(
                    :in_UserId,
                    :in_OrgId,
                    :in_Name,
                    :in_Email,
                    :in_Mobile,
                    :in_Dob,
                    :in_password,
                    :in_cpassword,
                    :in_ipaddr,
                    :in_source,
                    :in_propno,
                    :out_ErrorCode,
                    :out_ErrorMsg
                );
            END;`,
            {
                in_UserId: String(userId),
                in_OrgId: Number(orgId),
                in_Name: String(name),
                in_Email: String(email),
                in_Mobile: Number(mobile),
                in_Dob: dob,
                in_password: String(password),
                in_cpassword: String(confirmPassword),
                in_ipaddr: normalizedIpAddress,
                in_source: String(source || "WEB"),
                in_propno: propNo ? String(propNo) : null,
                out_ErrorCode: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER},
                out_ErrorMsg: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 4000}
            },
            {
                autoCommit: true
            }
        );

        console.log({
            errorCode: result.outBinds.out_ErrorCode,
            errorMsg: result.outBinds.out_ErrorMsg
        });

        return {
            errorCode: result.outBinds.out_ErrorCode,
            errorMsg: result.outBinds.out_ErrorMsg
        };
    } finally {
        await conn.close();
    }
}

async function loginByProcedure({ corpId, mobile, password, ulbId, logflag }) {
  const conn = await getConnectionTMC();
  try {
    const emailResult = await conn.execute(
      `SELECT var_onlinereg_email AS email
       FROM aorts_onlineregister_mas
       INNER JOIN aorts_user_def
         ON num_user_uniqueid = num_onlinereg_id
         AND num_user_mobileno = num_onlinereg_mobile
       WHERE num_onlinereg_ulbid = :ulbId
       AND num_onlinereg_mobile = :mobile`,
      {
        ulbId: Number(ulbId),
        mobile: Number(mobile)
      },
      {
        outFormat: oracledb.OUT_FORMAT_OBJECT
      }
    );

    if (!emailResult.rows.length) {
      return {
        errorCode: -100,
        errorMsg: "User Not Found"
      };
    }

    const email = emailResult.rows[0].EMAIL;

    const result = await conn.execute(
      `BEGIN
        aorts_onllogin_ins(
          :in_CorpId,
          :in_username,
          :in_password,
          :in_ulbID,
          :in_logflag,
          :out_ulbid,
          :out_userUniqueId,
          :out_userFullName,
          :out_lastlogin,
          :out_lastlogout,
          :out_errcode,
          :out_errmsg
        );
      END;`,
      {
        in_CorpId: Number(corpId),
        in_username: email,
        in_password: password,
        in_ulbID: Number(ulbId),
        in_logflag: logflag,
        out_ulbid: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        out_userUniqueId: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        out_userFullName: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 4000 },
        out_lastlogin: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 100 },
        out_lastlogout: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 100 },
        out_errcode: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        out_errmsg: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 4000 }
      }
    );

    const out = result.outBinds;

    return {
      errorCode: out.out_errcode,
      errorMsg: out.out_errmsg,
      ulbId: out.out_ulbid,
      userId: out.out_userUniqueId,
      username: out.out_userFullName,
      email,
      lastLogin: out.out_lastlogin,
      lastLogout: out.out_lastlogout
    };
  } finally {
    await conn.close();
  }
}

async function sendLoginOtp({ userId, ulbId, mobileNumber }) {
  const conn = await getConnectionTMC();

  try {
    const result = await conn.execute(
      `BEGIN
        aorts_onlloginwithotp_ins(
          :in_Userid,
          :in_ulbID,
          :in_mobnumber,
          :in_OTP,
          :in_Mode,
          :out_errcode,
          :out_ErrMsg
        );
      END;`,
      {
        in_Userid: userId,
        in_ulbID: Number(ulbId),
        in_mobnumber: String(mobileNumber),
        in_OTP: 0,
        in_Mode: 1,
        out_errcode: {
          dir: oracledb.BIND_OUT,
          type: oracledb.NUMBER
        },
        out_ErrMsg: {
          dir: oracledb.BIND_OUT,
          type: oracledb.STRING,
          maxSize: 4000
        }
      },
      {
        autoCommit: true
      }
    );

    return {
      errorCode: result.outBinds.out_errcode,
      errorMsg: result.outBinds.out_ErrMsg
    };
  } finally {
    await conn.close();
  }
}

async function loginWithOtpProcedure({ userId, ulbId, mobileNumber, otp }) {
  const conn = await getConnectionTMC();

  try {
    const userResult = await conn.execute(
      `SELECT
         var_onlinereg_email AS email,
         var_onlinereg_pass AS password
       FROM aorts_onlineregister_mas
       INNER JOIN aorts_user_def
         ON num_user_uniqueid = num_onlinereg_id
        AND num_user_mobileno = num_onlinereg_mobile
       WHERE num_onlinereg_ulbid = :ulbId
         AND num_onlinereg_mobile = :mobile`,
      {
        ulbId: Number(ulbId),
        mobile: Number(mobileNumber)
      },
      {
        outFormat: oracledb.OUT_FORMAT_OBJECT
      }
    );

    if (!userResult.rows.length) {
      return {
        errorCode: -100,
        errorMsg: "User Not Found"
      };
    }

    const email = userResult.rows[0].EMAIL;
    const password = userResult.rows[0].PASSWORD;

    const otpResult = await conn.execute(
      `BEGIN
        aorts_onlloginwithotp_ins(
          :in_Userid,
          :in_ulbID,
          :in_mobnumber,
          :in_OTP,
          :in_Mode,
          :out_errcode,
          :out_ErrMsg
        );
      END;`,
      {
        in_Userid: userId,
        in_ulbID: Number(ulbId),
        in_mobnumber: String(mobileNumber),
        in_OTP: Number(otp),
        in_Mode: 2,
        out_errcode: {
          dir: oracledb.BIND_OUT,
          type: oracledb.NUMBER
        },
        out_ErrMsg: {
          dir: oracledb.BIND_OUT,
          type: oracledb.STRING,
          maxSize: 4000
        }
      }
    );

    const otpOut = otpResult.outBinds;

    if (Number(otpOut.out_errcode) !== 9999) {
      return {
        errorCode: otpOut.out_errcode,
        errorMsg: otpOut.out_ErrMsg
      };
    }

    const loginResult = await conn.execute(
      `BEGIN
        aorts_onllogin_ins(
          :in_CorpId,
          :in_username,
          :in_password,
          :in_ulbID,
          :in_logflag,
          :out_ulbid,
          :out_userUniqueId,
          :out_userFullName,
          :out_lastlogin,
          :out_lastlogout,
          :out_errcode,
          :out_errmsg
        );
      END;`,
      {
        in_CorpId: 10001,
        in_username: email,
        in_password: password,
        in_ulbID: Number(ulbId),
        in_logflag: "LO",
        out_ulbid: {
          dir: oracledb.BIND_OUT,
          type: oracledb.NUMBER
        },
        out_userUniqueId: {
          dir: oracledb.BIND_OUT,
          type: oracledb.NUMBER
        },
        out_userFullName: {
          dir: oracledb.BIND_OUT,
          type: oracledb.STRING,
          maxSize: 4000
        },
        out_lastlogin: {
          dir: oracledb.BIND_OUT,
          type: oracledb.STRING,
          maxSize: 100
        },
        out_lastlogout: {
          dir: oracledb.BIND_OUT,
          type: oracledb.STRING,
          maxSize: 100
        },
        out_errcode: {
          dir: oracledb.BIND_OUT,
          type: oracledb.NUMBER
        },
        out_errmsg: {
          dir: oracledb.BIND_OUT,
          type: oracledb.STRING,
          maxSize: 4000
        }
      }
    );

    const loginOut = loginResult.outBinds;

    return {
      errorCode: loginOut.out_errcode,
      errorMsg: loginOut.out_errmsg,
      ulbId: loginOut.out_ulbid,
      userId: loginOut.out_userUniqueId,
      username: loginOut.out_userFullName,
      email,
      lastLogin: loginOut.out_lastlogin,
      lastLogout: loginOut.out_lastlogout
    };
  } finally {
    await conn.close();
  }
}

async function getForgotPasswordDetails({ mobile }) {
    const conn = await getConnectionTMC();

    try {
        const result = await conn.execute(
            `SELECT
                var_onlinereg_email AS email,
                var_onlinereg_pass AS pass
             FROM aorts_onlineregister_mas
             WHERE num_onlinereg_mobile = :mobile`,
            {
                mobile: Number(mobile)
            },
            {
                outFormat: oracledb.OUT_FORMAT_OBJECT
            }
        );

        return result.rows?.[0] || null;
    } finally {
        await conn.close();
    }
}

async function changePassword({ corpId, oldPassword, newPassword, userId, mode }) {
    const conn = await getConnectionTMC();

    try {
        const result = await conn.execute(
            `BEGIN
                aorts_onlchangepassword_ins(
                    :in_Corpid,
                    :in_OldPassword,
                    :in_NewPassword,
                    :in_UserId,
                    :in_Mode,
                    :out_ErrorCode,
                    :out_ErrorMsg
                );
            END;`,
            {
                in_Corpid: Number(corpId),
                in_OldPassword: oldPassword,
                in_NewPassword: newPassword,
                in_UserId: userId,
                in_Mode: Number(mode),
                out_ErrorCode: {
                    dir: oracledb.BIND_OUT,
                    type: oracledb.NUMBER
                },
                out_ErrorMsg: {
                    dir: oracledb.BIND_OUT,
                    type: oracledb.STRING,
                    maxSize: 4000
                }
            },
            {
                autoCommit: true
            }
        );

        return {
            errorCode: result.outBinds.out_ErrorCode,
            errorMsg: result.outBinds.out_ErrorMsg
        };
    } finally {
        await conn.close();
    }
}

async function getCitizenDetailsByMobile({ mobile }) {
  const conn = await getConnectionTMC();
  try {
    const result = await conn.execute(
      `SELECT
         var_user_fname,
         num_user_mobileno,
         var_onlinereg_email AS email,
         var_onlinereg_pass AS password
       FROM aorts_onlineregister_mas
       INNER JOIN aorts_user_def
         ON num_user_uniqueid = num_onlinereg_id
         AND num_user_mobileno = num_onlinereg_mobile
       WHERE num_onlinereg_mobile = :mobile`,
      {
        mobile: Number(mobile)
      },
      {
        outFormat: oracledb.OUT_FORMAT_OBJECT
      }
    );

    return result.rows[0] || null;
  } finally {
    await conn.close();
  }
}

async function employeeLoginRepo({ corpId = 10001, userId, password }) {
  let connection;

  const encrytptPassword = encryptPassword(password)
  console.log({encrytptPassword})
  try {
    connection = await getConnectionTMC();
    const result = await connection.execute(
      `
        BEGIN
          aorts_emp_login(
            :In_CorpId,
            :in_UserID,
            :in_password,
            :out_errcode,
            :out_errmsg,
            :out_StrInfo
          );
        END;
      `,
      {
        In_CorpId: { dir: oracledb.BIND_IN, val: Number(corpId), type: oracledb.NUMBER },
        in_UserID: { dir: oracledb.BIND_IN, val: String(userId).trim(), type: oracledb.STRING },
        in_password: { dir: oracledb.BIND_IN, val: String(encrytptPassword), type: oracledb.STRING },
        out_errcode: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        out_errmsg: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 1000 },
        out_StrInfo: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 4000 },
      },
      {
        autoCommit: true,
      }
    );

    return {
      success: true,
      errCode: result.outBinds.out_errcode,
      errMsg: result.outBinds.out_errmsg,
      strInfo: result.outBinds.out_StrInfo,
    };
  } catch (error) {
    console.error("Employee Login Repo Error:", error);
    return {
      success: false,
      error: error.message,
    };
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (error) {
        console.error("Oracle connection close error:", error);
      }
    }
  }
}

module.exports = {
  registerUser,
  loginByProcedure,
  sendLoginOtp,
  getForgotPasswordDetails,
  loginWithOtpProcedure,
  changePassword,
  getCitizenDetailsByMobile,
  employeeLoginRepo,
};