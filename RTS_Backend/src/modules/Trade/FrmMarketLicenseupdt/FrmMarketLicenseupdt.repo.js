const { getConnectionTMC } = require("../../../config/db");
const { executeProcedureTMC } = require("../../../db/procedureExecutor");
const { executeQueryTMC } = require("../../../db/queryExecutor");
const oracledb = require("oracledb");

async function getApplicationTypes({ ulbId }) {
  const query = `
    SELECT
      var_applitype_name AS APPLITYPE_NAME,
      num_applitype_id AS APPLITYPE_ID
    FROM market.aomk_applitype_mas
    WHERE num_applitype_ulbid = :ulbId
      AND var_applitype_flag = 'Y'
    ORDER BY num_applitype_id
  `;

  const bindParams = {
    ulbId: Number(ulbId),
  };

  console.log("Application Types Query:", query);
  console.log("Bind Params:", bindParams);

  return await executeQueryTMC(query, bindParams);
}

async function getZones({ ulbId }) {
  const query = `
    SELECT
      zonename AS ZONENAME,
      zoneid AS ZONEID
    FROM prop.vw_zonemas
    WHERE ulbid = :ulbId
    ORDER BY zoneid
  `;

  const bindParams = {
    ulbId: Number(ulbId),
  };

  console.log("Zones Query:", query);
  console.log("Bind Params:", bindParams);

  return await executeQueryTMC(query, bindParams);
}

async function getGenders() {
  const query = `
    SELECT
      var_gender_name AS GENDER_NAME,
      num_gender_id AS GENDER_ID
    FROM  aorts_gender_mas
    ORDER BY num_gender_id
  `;

  console.log("Gender Query:", query);

  return await executeQueryTMC(query, {});
}

async function getJalanshil() {
  const query = `
    SELECT
      var_jalanshil_name AS JALANSHIL_NAME,
      var_jalanshil_code AS JALANSHIL_CODE
    FROM aorts_jalanshil_mas
    ORDER BY var_jalanshil_code
  `;

  console.log("Jalanshil Query:", query);

  return await executeQueryTMC(query, {});
}

async function getRelations() {
  const query = `
    SELECT
      var_relation_name AS RELATION_NAME,
      num_relation_id AS RELATION_ID
    FROM aorts_relation_mas
    ORDER BY num_relation_id
  `;

  console.log("Relation Query:", query);

  return await executeQueryTMC(query, {});
}

async function getDocuments({ serviceId, ulbId }) {
  const query = `
    SELECT
      num_doc_id AS DOCID,
      var_doc_engname AS DOCTYPENAME,
      var_doc_engdocdesc AS ENGDOCDESC,
      var_doc_type AS DOCTYPE,
      NULL AS NOC_NEW,
      NULL AS NOC_RENEWAL,
      var_doc_active AS ACTIVE
    FROM aorts_doc_def
    INNER JOIN aorts_serv_doc_config
      ON num_serdoc_servid = num_doc_serviceid
      AND num_serdoc_docid = num_doc_id
    INNER JOIN vw_services
      ON num_service_serviceid = num_doc_serviceid
    WHERE num_doc_serviceid = :serviceId
      AND num_serdoc_ulbid = :ulbId
      AND var_service_active = 'Y'
  `;

  const bindParams = {
    serviceId: Number(serviceId),
    ulbId: Number(ulbId),
  };

  console.log("Documents Query:", query);
  console.log("Bind Params:", bindParams);

  return await executeQueryTMC(query, bindParams);
}

async function getLicenseTypes() {
  const query = `
    SELECT
      var_licensetype_name AS LICENSETYPE_NAME,
      num_licensetype_id AS LICENSETYPE_ID
    FROM  market.aomk_licensetype_mas 
    ORDER BY num_licensetype_id
  `;

  console.log("License Type Query:", query);

  return await executeQueryTMC(query, {});
}

async function getAdhikrtutta() {
  const query = `
    SELECT
      var_adhikrtutta_name AS ADHIKRTUTTA_NAME,
      num_adhikrtutta_id AS ADHIKRTUTTA_ID
    FROM aorts_adhikrtutta_mas
    ORDER BY num_adhikrtutta_id
  `;

  console.log("Adhikrtutta Query:", query);

  return await executeQueryTMC(query, {});
}

async function getApplicationStatus() {
  const query = `
    SELECT
      var_applistat_name AS APPLISTAT_NAME,
      num_applistat_id AS APPLISTAT_ID
    FROM aorts_applistat_mas
    ORDER BY num_applistat_id
  `;

  console.log("Application Status Query:", query);

  return await executeQueryTMC(query, {});
}

async function getMarketLicenseDetails({ licenseNo, ulbId }) {
  const query = `
    SELECT
      num_appli_id AS APPLI_ID,
      num_appli_zoneid AS ZONE_ID,
      num_appli_wardid AS WARD_ID,
      var_appli_placeownername AS PLACE_OWNER_NAME,
      dat_mktlice_validfrom AS VALID_FROM,
      dat_mktlice_validtilldt AS VALID_TILL_DATE,
      var_appli_address AS ADDRESS,
      num_rate_tradetypename AS TRADETYPE,
      num_tradecategory_id AS TRADECATEGORY_ID,
      var_tradecategory_name AS TRADECATEGORY,
      num_appli_arreasamt AS ARREARS_AMOUNT,
      CASE
        WHEN var_appli_type = 'N' THEN 'New'
        WHEN var_appli_type = 'R' THEN 'Renewal'
      END AS LICENSE_TYPE,
      var_appli_placeownername AS PLACE_OWNER_NAME,
      var_appli_placeowneraddress AS PLACE_OWNER_ADDRESS,
      var_appli_shopname AS SHOP_NAME
    FROM market.aomk_mktlice_mas
    INNER JOIN market.aomk_appli_mas
      ON num_appli_id = num_mktlice_appliid
      AND num_appli_ulbid = num_mktlice_ulbid
    INNER JOIN market.aomk_applitradetyp_det
      ON num_applitradetype_appliid = num_mktlice_appliid
      AND num_applitradetyp_ulbid = num_mktlice_ulbid
    INNER JOIN market.aomk_rate_mas
      ON num_applitradetype_trdtypid = num_rate_id
    INNER JOIN market.aomk_applitrade_det
      ON num_applitrade_appliid = num_mktlice_appliid
      AND num_applitrade_ulbid = num_mktlice_ulbid
    INNER JOIN market.aomk_TradeCategory_mas
      ON num_tradecategory_id = num_applitrade_tradeid
    WHERE var_mktlice_licenceno = :licenseNo
      AND num_mktlice_ulbid = :ulbId
    ORDER BY dat_appli_insdt DESC
  `;

  const bindParams = {
    licenseNo: String(licenseNo),
    ulbId: Number(ulbId),
  };

  console.log("Market License Details Query:", query);
  console.log("Bind Params:", bindParams);

  return await executeQueryTMC(query, bindParams);
}

async function getDirectorName({ appliType, ulbId }) {
  const query = `
     SELECT
      var_applidirector_name AS DIRCTORNAME
    FROM market.aomk_applidirector_det
    INNER JOIN market.aomk_applitype_mas
      ON num_applitype_id = num_applidirector_applitype
      AND num_applidirector_ulbid = num_applitype_ulbid
    WHERE num_applidirector_applitype = :appliType
      AND num_applidirector_ulbid = :ulbId
  `;

  const bindParams = {
    appliType: Number(appliType),
    ulbId: Number(ulbId),
  };

  console.log("Director Name Query:", query);
  console.log("Bind Params:", bindParams);

  return await executeQueryTMC(query, bindParams);
}

async function getMarketApplicationTypes({ ulbId }) {
  const query = `
    SELECT
      var_applitype_name AS APPLITYPE_NAME,
      num_applitype_id AS APPLITYPE_ID
    FROM market.aomk_applitype_mas
    WHERE num_applitype_ulbid = :ulbId
      AND var_applitype_flag = 'Y'
    ORDER BY num_applitype_id
  `;

  const bindParams = {
    ulbId: Number(ulbId),
  };

  console.log("Market Application Types Query:", query);
  console.log("Bind Params:", bindParams);

  return await executeQueryTMC(query, bindParams);
}

async function getDirectorDetails({ appliId, ulbId }) {
  const query = `
    SELECT
      num_applidirector_id AS DIRECTORID,
      num_applidirector_aadhaarno AS ADHARNO,
      var_applidirector_name AS DIRCTORNAME,
      num_applidirector_mobileno AS MOBILENO,
      var_applidirector_emailid AS EMAIL,
      var_applidirector_gender AS GENDER,
      var_applidirector_address AS ADDRESS,
      num_applidirector_applitype AS APPLITYPEID,
      var_applitype_name AS APPLITYPENAME,
      blo_applitype_photo AS IMGDIRECTORIMAGE,
      Var_AppliDirector_VoterId AS VOTERID
    FROM market.aomk_applidirector_det 
    INNER JOIN market.aomk_applitype_mas 
      ON num_applitype_id = num_applidirector_applitype
    WHERE num_applidirector_appliid = :appliId
      AND num_applidirector_ulbid = :ulbId
  `;

  const bindParams = {
    appliId: Number(appliId),
    ulbId: Number(ulbId),
  };

  console.log("Director Details Query:", query);
  console.log("Bind Params:", bindParams);

  return await executeQueryTMC(query, bindParams);
}

async function getMarketApplicationAddress({ licenseNo, ulbId }) {
  const query = `
     SELECT
      num_appli_id AS APPLI_ID,
      var_appli_address AS APPLI_ADDRESS
    FROM market.aomk_mktlice_mas
    INNER JOIN market.aomk_appli_mas
      ON num_appli_id = num_mktlice_appliid
      AND num_appli_ulbid = num_mktlice_ulbid
    WHERE var_mktlice_licenceno = :licenseNo
      AND num_mktlice_ulbid = :ulbId
    ORDER BY num_appli_id DESC
  `;

  const bindParams = {
    licenseNo: String(licenseNo),
    ulbId: Number(ulbId),
  };

  console.log("Market Application Address Query:", query);
  console.log("Bind Params:", bindParams);

  return await executeQueryTMC(query, bindParams);
}

async function getTradeTypeDetails({ appliId, ulbId }) {
  const query = `
    SELECT
      num_applitradetype_id AS APPLITRADETYPE_ID,
      num_applitradetype_appliid AS APPLITRADETYPE_APPLI_ID,
      num_applitradetype_trdtypid AS APPLITRADETYPE_TRDTYP_ID,
      NVL(num_applitrade_traderate, 0) AS RATE,
      num_rate_tradetypename AS TRADETYPE,
      num_rate_id AS TRADETYPEID,
      '' AS TRADECATEGORY_ID,
      '' AS TRADECATEGORY
    FROM market.aomk_applitradetyp_det
    INNER JOIN market.aomk_rate_mas
      ON num_rate_id = num_applitradetype_trdtypid
      AND num_rate_ulbid = num_applitradetyp_ulbid
    WHERE num_applitradetype_appliid = :appliId
      AND num_applitradetyp_ulbid = :ulbId
  `;

  const bindParams = {
    appliId: Number(appliId),
    ulbId: Number(ulbId),
  };

  console.log("Trade Type Details Query:", query);
  console.log("Bind Params:", bindParams);

  return await executeQueryTMC(query, bindParams);
}

async function getTradeDetails({ appliId }) {
  const query = `
    SELECT
      num_applitrade_id AS APPLITRADE_ID,
      num_applitrade_appliid AS APPLITRADE_APPLI_ID,
      num_applitrade_tradeid AS APPLITRADE_TRADE_ID
    FROM market.aomk_applitrade_det
    WHERE num_applitrade_appliid = :appliId
  `;

  const bindParams = {
    appliId: Number(appliId),
  };

  console.log("Trade Details Query:", query);
  console.log("Bind Params:", bindParams);

  return await executeQueryTMC(query, bindParams);
}

async function getTradeDirectorId({ applicationId }) {
  const query = `
     SELECT
      num_tradedirector_id AS DIRECTOR_ID
    FROM market.aomk_tradedirector_det   
    WHERE num_tradedirector_appliid = :applicationId
  `;

  const bindParams = {
    applicationId: Number(applicationId),
  };

  console.log("Trade Director ID Query:", query);
  console.log("Bind Params:", bindParams);

  return await executeQueryTMC(query, bindParams);
}

async function updateTradeDirectorImage({
  directorId,
  applicationId,
  fileBuffer,
}) {
  let connection;

  try {
    connection = await getConnectionTMC();

    const buffer = Buffer.from(fileBuffer);

    const query = `
      UPDATE market.aomk_tradedirector_det
      SET blo_applitype_photo = :blobDirectorImg
      WHERE num_tradedirector_id = :directorId
        AND num_tradedirector_appliid = :applicationId
    `;

    const bindParams = {
      blobDirectorImg: {
        val: buffer,
        type: oracledb.BUFFER,
        dir: oracledb.BIND_IN,
        maxSize: buffer.length,
      },
      directorId: Number(directorId),
      applicationId: Number(applicationId),
    };

    console.log("Update Trade Director Image Query:", query);
    console.log("Director ID:", directorId);
    console.log("Application ID:", applicationId);
    console.log("Image Size:", buffer.length);

    const result = await connection.execute(
      query,
      bindParams,
      {
        autoCommit: true,
      }
    );

    console.log(
      "Trade Director Image Update Result:",
      result
    );

    return {
      success: true,
      rowsAffected: result.rowsAffected,
    };
  } catch (error) {
    console.error(
      "updateTradeDirectorImage Error:",
      error
    );

    return {
      success: false,
      error: error.message,
    };
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(
          "Error closing connection:",
          err
        );
      }
    }
  }
}

async function getTradeTypesByCategory({ categoryId, categoryType}) {
  const conditions = [
    `var_tradetype_flag = 'Y'`,
    `num_categorytype_catgryid = :categoryId`,
    `var_categorytype_type = :categoryType`,
  ];

  const bindParams = {categoryId: Number(categoryId), categoryType};

  // if ( jwalanshilstat !== undefined && jwalanshilstat !== null && String(jwalanshilstat).trim() !== "") {
  //   conditions.push(`var_categorytype_jwalanshilstat = :jwalanshilstat`);
  //   bindParams.jwalanshilstat = String(jwalanshilstat).trim();
  // }

  const query = `     
    SELECT
      var_tradetype_name AS TRADETYPE_NAME,
      num_tradetype_id AS CATEGORYTYPE_CATGTYPID
    FROM market.aomk_tradecatconfig_mas 
    INNER JOIN market.aomk_tradecategory_mas
      ON num_tradecategory_id = num_tradecatconf_tradecatid
    INNER JOIN market.aomk_tradetype_mas
      ON num_tradecategory_id = aomk_tradetype_tradecategoryid
      AND aomk_tradetype_tradecategoryid = num_tradecatconf_tradecatid
    WHERE ${conditions.join("\n AND ")}
  `;

  return await executeQueryTMC(query, bindParams);
}


async function getServiceInstructions({ serviceId }) {
  const query = `
    SELECT
      var_inst_mardocdesc AS INST_MARDOCDESC
    FROM aorts_serviceInstr_def
    WHERE num_inst_serviceid = :serviceId
      AND var_inst_active = 'Y'
  `;

  const bindParams = {
    serviceId: Number(serviceId),
  };

  console.log("Service Instructions Query:", query);
  console.log("Bind Params:", bindParams);

  return await executeQueryTMC(query, bindParams);
}

async function getTradeCategories({ categoryType }) {
  const query = `
    SELECT
      var_tradecategory_name AS TRADECATEGORY_NAME,
      num_tradecategory_id AS CATEGORY_CATGRYID
    FROM market.aomk_tradecatconfig_mas
    INNER JOIN market.aomk_tradecategory_mas
      ON num_tradecategory_id = num_tradecatconf_tradecatid
    WHERE var_tradecategory_flag = 'Y'
      AND num_tradecategory_id = :categoryType
  `;

  const bindParams = {
    categoryType: categoryType
  };

  console.log("Trade Categories Query:", query);
  console.log("Bind Params:", bindParams);

  return await executeQueryTMC(query, bindParams);
}


async function getSelfDeclaration({ serviceId }) {
  const query = `
    SELECT
      num_selfdeclare_id AS ID,
      var_selfdeclare_desc AS MESSAGE
    FROM aorts_selfdeclare_mas
    WHERE num_selfdeclare_servid = :serviceId
  `;

  const bindParams = {
    serviceId: Number(serviceId),
  };

  console.log("Self Declaration Query:", query);
  console.log("Bind Params:", bindParams);

  return await executeQueryTMC(query, bindParams);
}

async function insertTradeApplication(params) {
  const {
    userid,

    licenseno,
    appfname,
    appmname,
    applname,
    mobile,
    email,
    aadhar,
    propno,
    address,
    remark,

    newbusiname,
    newownfname,
    newownmname,
    newownlname,

    newcofname,
    newcomname,
    newcolname,

    ulbid,
    servicename,

    businesstr,
    partnerstr,
    corrpartnerstr,

    appid,
    tradeaddrstr,
    tradechkstr,
    directorstr,

    rate,
    wardid,
    zoneid,
    // Servid,
    Source,
    // amount,

    // Gender,
    // Jwalan,
    // Relation,
    // Adhikrutta,
    // LicencType,
    // TradeType,

    // CloseDt,
    // LicOwner,
    // LicType,
    // LicFrmDt,
    // LicToDt,

    // BusiName,
    // BusiSwarup,
    // BusiAddr,
    // type,
  } = params;

  const sql = `
    BEGIN

      market.aomk_applitrade_ins(
        :in_userid,
        :in_licenseno,
        :in_appfname,
        :in_appmname,
        :in_applname,
        :in_mobile,
        :in_email,
        :in_aadhar,
        :in_propno,
        :in_address,
        :in_remark,
        :in_newbusiname,
        :in_newownfname,
        :in_newownmname,
        :in_newownlname,
        :in_newcofname,
        :in_newcomname,
        :in_newcolname,
        :in_ulbid,
        :in_servicename,
        :in_businesstr,
        :in_partnerstr,
        :in_corrpartnerstr,
        :in_appid,
        :in_tradeaddrstr,
        :in_tradechkstr,
        :in_directorstr,
        :in_rate,
        :in_wardid,
        :in_zoneid,
        // :in_Servid,
        :In_Source,
        // :in_amount,
        // :In_Gender,
        // :in_Jwalan,
        // :in_Relation,
        // :in_Adhikrutta,
        // :in_LicencType,
        // :in_TradeType,
        // :in_CloseDt,
        // :In_LicOwner,
        // :In_LicType,
        // :In_LicFrmDt,
        // :In_LicToDt,
        // :In_BusiName,
        // :In_BusiSwarup,
        // :In_BusiAddr,
        // :In_type,
        :out_ErrCode,
        :out_ErrMsg,
        :out_AppliID,
        :out_AppliNo
      );

    END;
  `;

  const binds = {
    in_userid: userid || null,

    in_licenseno: licenseno || null,

    in_appfname: appfname || null,

    in_appmname: appmname || null,

    in_applname: applname || null,

    in_mobile: mobile
      ? Number(mobile)
      : null,

    in_email: email || null,

    in_aadhar: aadhar
      ? Number(aadhar)
      : null,

    in_propno: propno || null,

    in_address: address || null,

    in_remark: remark || null,

    in_newbusiname: newbusiname || null,

    in_newownfname: newownfname || null,

    in_newownmname: newownmname || null,

    in_newownlname: newownlname || null,

    in_newcofname: newcofname || null,

    in_newcomname: newcomname || null,

    in_newcolname: newcolname || null,

    in_ulbid: ulbid
      ? Number(ulbid)
      : null,

    in_servicename: servicename || null,

    in_businesstr: businesstr || null,

    in_partnerstr: partnerstr || null,

    in_corrpartnerstr: corrpartnerstr || null,

    in_appid: appid
      ? Number(appid)
      : null,

    in_tradeaddrstr: tradeaddrstr || null,

    in_tradechkstr: tradechkstr || null,

    in_directorstr: directorstr || null,

    in_rate: rate
      ? Number(rate)
      : null,

    in_wardid: wardid
      ? Number(wardid)
      : null,

    in_zoneid: zoneid
      ? Number(zoneid)
      : null,

    // in_Servid: Servid
    //   ? Number(Servid)
    //   : null,

    In_Source: Source || null,

    // in_amount: amount
    //   ? Number(amount)
    //   : null,

    // In_Gender: Gender || null,

    // in_Jwalan: Jwalan || null,

    // in_Relation: Relation
    //   ? Number(Relation)
    //   : null,

    // in_Adhikrutta: Adhikrutta
    //   ? Number(Adhikrutta)
    //   : null,

    // in_LicencType: LicencType
    //   ? Number(LicencType)
    //   : null,

    // in_TradeType: TradeType
    //   ? Number(TradeType)
    //   : null,

    // in_CloseDt: CloseDt
    //   ? new Date(CloseDt)
    //   : null,

    // In_LicOwner: LicOwner || null,

    // In_LicType: LicType || null,


    // In_LicFrmDt: LicFrmDt
    //   ? new Date(LicFrmDt)
    //   : null,

    // In_LicToDt: LicToDt
    //   ? new Date(LicToDt)
    //   : null,


    // In_BusiName: BusiName || null,


    // In_BusiSwarup: BusiSwarup || null,


    // In_BusiAddr: BusiAddr || null,

    // In_type: type || null,

    out_ErrCode: {
      dir: oracledb.BIND_OUT,
      type: oracledb.NUMBER,
    },

    out_ErrMsg: {
      dir: oracledb.BIND_OUT,
      type: oracledb.STRING,
      maxSize: 4000,
    },

    out_AppliID: {
      dir: oracledb.BIND_OUT,
      type: oracledb.NUMBER,
    },

    out_AppliNo: {
      dir: oracledb.BIND_OUT,
      type: oracledb.STRING,
      maxSize: 500,
    },
  };

  console.log(
    "Calling Procedure: aorts_applitrade_ins"
  );

  const result = await executeProcedureTMC({
    sql,
    binds,
  });

  if (!result.success) {
    throw new Error(
      result.error ||
      "aorts_applitrade_ins procedure execution failed"
    );
  }

  console.log(
    "aorts_applitrade_ins Result:",
    result.outBinds
  );

  return result.outBinds;
}

async function insertTradeTypeLog(params) {
  const {
    orgId,
    id,
    appId,
    tradeType,
    tradeCat,
    rate,
    directorId,
    aadharNo,
    directorName,
    mobileNo,
    email,
    gender,
    address,
    appliType,
    servicee,
  } = params;

  const sql = `
    BEGIN

      market.aomk_tradetypelog_ins(
        :In_OrgId,
        :In_Id,
        :In_Appid,
        :In_TradeType,
        :In_TradeCat,
        :In_Rate,
        :In_Directorid,
        :In_Aadharno,
        :In_Directorname,
        :In_Mobileno,
        :In_Email,
        :In_Gender,
        :In_Addres,
        :In_Applitype,
        :In_Service,
        :Out_Errorcode,
        :Out_Errormsg
      );

    END;
  `;

  const binds = {

    In_OrgId: orgId
      ? Number(orgId)
      : null,

    In_Id: id
      ? Number(id)
      : null,

    In_Appid: appId
      ? Number(appId)
      : null,

    In_TradeType: tradeType
      ? Number(tradeType)
      : null,

    In_TradeCat: tradeCat
      ? Number(tradeCat)
      : null,

    In_Rate: rate
      ? Number(rate)
      : null,

    In_Directorid: directorId
      ? Number(directorId)
      : null,

    In_Aadharno: aadharNo
      ? Number(aadharNo)
      : null,

    In_Directorname: directorName || null,

    In_Mobileno: mobileNo
      ? Number(mobileNo)
      : null,

    In_Email: email || null,

    In_Gender: gender || null,

    In_Addres: address || null,

    In_Applitype: appliType
      ? Number(appliType)
      : null,

    In_Service: servicee || null,

    Out_Errorcode: {
      dir: oracledb.BIND_OUT,
      type: oracledb.NUMBER,
    },

    Out_Errormsg: {
      dir: oracledb.BIND_OUT,
      type: oracledb.STRING,
      maxSize: 500,
    },
  };

  console.log(
    "Calling Procedure: aorts_tradetypelog_ins"
  );

  console.log("Trade Type Log Params:", {
    orgId,
    id,
    appId,
    tradeType,
    tradeCat,
    rate,
    directorId,
    aadharNo,
    directorName,
    mobileNo,
    email,
    gender,
    address,
    appliType,
    servicee,
  });

  const result = await executeProcedureTMC({
    sql,
    binds,
  });

  if (!result.success) {
    throw new Error(
      result.error ||
      "aorts_tradetypelog_ins procedure execution failed"
    );
  }

  console.log(
    "Trade Type Log Result:",
    result.outBinds
  );

  return result.outBinds;
}


module.exports = {
  getApplicationTypes,
  getZones,
  getGenders,
  getJalanshil,
  getRelations,
  getDocuments,
  getLicenseTypes,
  getAdhikrtutta,
  getApplicationStatus,
  getMarketLicenseDetails,
  getDirectorName,
  getMarketApplicationTypes,
  getDirectorDetails,
  getMarketApplicationAddress,
  getTradeTypeDetails,
  getTradeDetails,

  getTradeDirectorId,
  updateTradeDirectorImage,
  getTradeTypesByCategory,
  getServiceInstructions,
  getTradeCategories,
  getSelfDeclaration,
  insertTradeApplication,
  insertTradeTypeLog
};
