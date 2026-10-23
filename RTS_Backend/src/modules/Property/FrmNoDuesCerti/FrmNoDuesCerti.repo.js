const { executeProcedureTMC } = require("../../../db/procedureExecutor");
const oracledb = require("oracledb");

async function insertNoDuesCertificateApplication(params) {
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
    ulbid,
  } = params;

  console.log("Insert No Dues Application:", {
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

  const sql = `
    BEGIN
      aorts_noduescerti_ins(
        :in_USERID,
        :in_Zoneid,
        :in_Serviceid,
        :in_PropNo,
        :in_Subcode,
        :in_LandHolder,
        :in_StructHolder,
        :in_OwnDetails,
        :in_Address,
        :in_Appliname,
        :in_Mobile,
        :in_Emailid,
        :in_Taxamount,
        :in_AadharNo,
        :in_source,
        :in_ulbid,
        :out_errcode,
        :out_ErrMsg,
        :out_applino
      );
    END;
  `;

  const binds = {
    in_USERID: userId,
    in_Zoneid: zoneId,
    in_Serviceid: serviceId,
    in_PropNo: propNo,
    in_Subcode: subCode || null,
    in_LandHolder: landHolder || null,
    in_StructHolder: structHolder || null,
    in_OwnDetails: ownDetails || null,
    in_Address: address || null,
    in_Appliname: appliname || null,
    in_Mobile: mobile,
    in_Emailid: email || null,
    in_Taxamount: taxAmount || 0,
    in_AadharNo: aadharNo || 0,  
    in_source: appSource || "",
    in_ulbid: ulbid,
    out_errcode: {
      dir: oracledb.BIND_OUT,
      type: oracledb.NUMBER,
    },
    out_ErrMsg: {
      dir: oracledb.BIND_OUT,
      type: oracledb.STRING,
      maxSize: 500,
    },
    out_applino: {
      dir: oracledb.BIND_OUT,
      type: oracledb.STRING,
      maxSize: 500,
    },
  };

  const result = await executeProcedureTMC({ sql, binds });

  if (!result.success) {
    throw new Error(result.error);
  }

  console.log("Property Transfer Application Insert Result:", result.outBinds);

  return result.outBinds;
}

module.exports = {
  insertNoDuesCertificateApplication,
};