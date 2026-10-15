const { getConnectionTMC } = require("../../../config/db");
const { executeProcedureTMC } = require("../../../db/procedureExecutor");
const { executeQueryTMC } = require("../../../db/queryExecutor");
const oracledb = require("oracledb");

async function getZones(ulbId) {
  const query = `
    SELECT DISTINCT wardname, wardid 
    FROM prop.vw_ward_mas 
    WHERE ulbid = :ulbId
    ORDER BY wardname
  `;
  return await executeQueryTMC(query, { ulbId: String(ulbId) });
}

async function getPreviousStatus() {
  const query = `
    SELECT var_mstatus_name, num_mstatus_id 
    FROM mrrg.aomm_mstatus_def
  `;
  return await executeQueryTMC(query);
}

async function getReligionList() {
  const query = `
    SELECT var_religion_religion, num_religion_id 
    FROM mrrg.aomm_religion_def
  `;
  return await executeQueryTMC(query);
}

async function getIDDocuments() {
  const query = `
    SELECT var_document_name, num_document_id 
    FROM mrrg.aomm_document_def 
    WHERE var_document_isactive = 'Y' 
      AND var_document_useasidproof = 'Y'
  `;
  return await executeQueryTMC(query);
}

async function getAddressDocuments() {
  const query = `
    SELECT var_document_name, num_document_id 
    FROM mrrg.aomm_document_def 
    WHERE var_document_isactive = 'Y' 
      AND var_document_useasaddress = 'Y'
  `;
  return await executeQueryTMC(query);
}

async function getAgeDocuments() {
  const query = `
    SELECT var_document_name, num_document_id 
    FROM mrrg.aomm_document_def 
    WHERE var_document_isactive = 'Y' 
      AND var_document_useasageproof = 'Y'
  `;
  return await executeQueryTMC(query);
}

async function getRelations() {
  const query = `
    SELECT var_relation_ename, num_relation_id 
    FROM mrrg.aomm_relation_def 
    ORDER BY num_relation_id
  `;
  return await executeQueryTMC(query);
}

async function getDocumentDefinitions(params) {
  const { corpId, serviceId, ulbId } = params;

  const query = `
    SELECT 
      num_doc_id AS num_document_id, 
      var_doc_engname AS var_document_name, 
      var_doc_engdocdesc AS engdocdesc, 
      var_doc_type AS type, 
      NULL AS noc_new, 
      NULL AS noc_renewal, 
      var_doc_active AS active 
    FROM aorts_doc_def 
    INNER JOIN aorts_serv_doc_config 
      ON num_serdoc_servid = num_doc_serviceid 
      AND num_serdoc_docid = num_doc_id 
    INNER JOIN vw_services 
      ON num_service_serviceid = num_doc_serviceid 
    WHERE num_doc_corpid = :corpId 
      AND num_doc_serviceid = :serviceId 
      AND num_serdoc_ulbid = :ulbId
  `;

  return await executeQueryTMC(query, {
    corpId: String(corpId),
    serviceId: String(serviceId),
    ulbId: String(ulbId),
  });
}

async function calculateAge(marriageDate, birthDate) {

  function formatDateForOracle(dateStr) {
    if (!dateStr) return null;
    
    if (/^\d{2}-[A-Za-z]{3}-\d{4}$/.test(dateStr)) {
      return dateStr;
    }
    
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const parts = dateStr.split('-');
      const year = parts[0];
      const month = parts[1];
      const day = parts[2];
      const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
      const monthName = monthNames[parseInt(month) - 1];
      return `${day}-${monthName}-${year}`;
    }
    
    const date = new Date(dateStr);
    if (!isNaN(date)) {
      const day = String(date.getDate()).padStart(2, '0');
      const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
      const monthName = monthNames[date.getMonth()];
      const year = date.getFullYear();
      return `${day}-${monthName}-${year}`;
    }
    
    return dateStr;
  }

  const formattedMarriageDate = formatDateForOracle(marriageDate);
  const formattedBirthDate = formatDateForOracle(birthDate);

  const query = `
    SELECT ROUND(
      (TO_DATE(:marriageDate, 'DD-MON-YYYY') - TO_DATE(:birthDate, 'DD-MON-YYYY')) / 365, 0
    ) AS age 
    FROM DUAL
  `;

  return await executeQueryTMC(query, {
    marriageDate: formattedMarriageDate,
    birthDate: formattedBirthDate,
  });
}

async function insertMarriageRegistration(params) {
  const {
    userId,
    mrrgdtlid,
    appliFname,
    appliMname,
    appliLname,
    appliMobile,
    appliAddre,
    regDate,
    mrrgDate,
    placeEng,
    placeMar,
    mode,
    str,
    ulbId,
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
    hage,
    hbirthreligion,
    hadopreligion,
    hemail,
    hiddoc,
    haddresdoc,
    hagedoc,
    hMode,
    hbirthdt,
    haadharno,
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
    wage,
    wbirthreligion,
    wadopreligion,
    wemail,
    widdoc,
    waddresdoc,
    wagedoc,
    wMode,
    wbirthdt,
    waadharno,
    w1EFNAME,
    w1EMNAME,
    w1ELNAME,
    w1MFNAME,
    w1MMNAME,
    w1MLNAME,
    w1DOCID,
    w1RELATIONID,
    w1MOBILENO,
    w1AGE,
    w1EADDRE,
    w1MADDRE,
    w1MODE,
    w1WITNESS_NO,
    w1birthdt,
    w2EFNAME,
    w2EMNAME,
    w2ELNAME,
    w2MFNAME,
    w2MMNAME,
    w2MLNAME,
    w2DOCID,
    w2RELATIONID,
    w2MOBILENO,
    w2AGE,
    w2EADDRE,
    w2MADDRE,
    w2MODE,
    w2WITNESS_NO,
    w2birthdt,
    w3EFNAME,
    w3EMNAME,
    w3ELNAME,
    w3MFNAME,
    w3MMNAME,
    w3MLNAME,
    w3DOCID,
    w3RELATIONID,
    w3MOBILENO,
    w3AGE,
    w3EADDRE,
    w3MADDRE,
    w3MODE,
    w3WITNESS_NO,
    w3birthdt,
    pRefname,
    pRemname,
    pRelname,
    pRmfname,
    pRmmname,
    pRmlname,
    pRage,
    pRreligion,
    pReaddress,
    pRmaddress,
    source,
    deliveryflag,
    zoneId,
  } = params;

  const toNumber = (value) => {
    if (value === null || value === undefined || value === '') {
      return null;
    }
    const num = Number(value);
    return isNaN(num) ? null : num;
  };

  const regDateObj = regDate ? new Date(regDate) : null;
  const mrrgDateObj = mrrgDate ? new Date(mrrgDate) : null;
  const hbirthdtObj = hbirthdt ? new Date(hbirthdt) : null;
  const wbirthdtObj = wbirthdt ? new Date(wbirthdt) : null;
  const w1birthdtObj = w1birthdt ? new Date(w1birthdt) : null;
  const w2birthdtObj = w2birthdt ? new Date(w2birthdt) : null;
  const w3birthdtObj = w3birthdt ? new Date(w3birthdt) : null;

  console.log("Insert Marriage Registration - Document IDs:", str);
  console.log("ULB ID:", ulbId, "Zone ID:", zoneId);
  console.log("Mobile:", appliMobile);

  const sql = `
    BEGIN
      aorts_marriagereg_ins(
        :in_UserId,
        :in_mrrgdtlid,
        :in_appliFname,
        :in_appliMname,
        :in_appliLname,
        :in_appliMobile,
        :in_appliAddre,
        :in_REGDATE,
        :in_MRRGDATE,
        :in_PLACEENG,
        :in_PLACEMAR,
        :in_Mode,
        :in_str,
        :in_UlbId,
        :in_Hefname,
        :in_Hemname,
        :in_Helname,
        :in_Hmfname,
        :in_Hmmname,
        :in_Hmlname,
        :in_Headdress,
        :in_Hmaddress,
        :in_HMobile,
        :in_Hmstatus,
        :in_Hphysichall,
        :in_Hage,
        :in_Hbirthreligion,
        :in_Hadopreligion,
        :in_Hemail,
        :in_Hiddoc,
        :in_Haddresdoc,
        :in_Hagedoc,
        :in_HMode,
        :in_Hbirthdt,
        :in_Haadharno,
        :in_Wefname,
        :in_Wemname,
        :in_Welname,
        :in_Wmfname,
        :in_Wmmname,
        :in_Wmlname,
        :in_Weaddress,
        :in_Wmaddress,
        :in_WMobile,
        :in_Wmstatus,
        :in_Wphysichall,
        :in_Wage,
        :in_Wbirthreligion,
        :in_Wadopreligion,
        :in_Wemail,
        :in_Widdoc,
        :in_Waddresdoc,
        :in_Wagedoc,
        :in_WMode,
        :in_Wbirthdt,
        :in_Waadharno,
        :IN_W1EFNAME,
        :IN_W1EMNAME,
        :IN_W1ELNAME,
        :IN_W1MFNAME,
        :IN_W1MMNAME,
        :IN_W1MLNAME,
        :IN_W1DOCID,
        :IN_W1RELATIONID,
        :IN_W1MOBILENO,
        :IN_W1AGE,
        :IN_W1EADDRE,
        :IN_W1MADDRE,
        :IN_W1MODE,
        :IN_W1WITNESS_NO,
        :in_W1birthdt,
        :IN_W2EFNAME,
        :IN_W2EMNAME,
        :IN_W2ELNAME,
        :IN_W2MFNAME,
        :IN_W2MMNAME,
        :IN_W2MLNAME,
        :IN_W2DOCID,
        :IN_W2RELATIONID,
        :IN_W2MOBILENO,
        :IN_W2AGE,
        :IN_W2EADDRE,
        :IN_W2MADDRE,
        :IN_W2MODE,
        :IN_W2WITNESS_NO,
        :in_W2birthdt,
        :IN_W3EFNAME,
        :IN_W3EMNAME,
        :IN_W3ELNAME,
        :IN_W3MFNAME,
        :IN_W3MMNAME,
        :IN_W3MLNAME,
        :IN_W3DOCID,
        :IN_W3RELATIONID,
        :IN_W3MOBILENO,
        :IN_W3AGE,
        :IN_W3EADDRE,
        :IN_W3MADDRE,
        :IN_W3MODE,
        :IN_W3WITNESS_NO,
        :in_W3birthdt,
        :in_PRefname,
        :in_PRemname,
        :in_PRelname,
        :in_PRmfname,
        :in_PRmmname,
        :in_PRmlname,
        :in_PRage,
        :in_PRreligion,
        :in_PReaddress,
        :in_PRmaddress,
        :in_source,
        :in_deliveryflag,
        :in_Zoneid,
        :out_ErrorCode,
        :out_ErrorMsg,
        :out_Mrrgdtlid,
        :out_AppliNo,
        :out_Mrrgid,
        :out_Formid
      );
    END;
  `;

  const binds = {
    // ===== STRING PARAMETERS =====
    in_UserId: userId || "",
    in_appliFname: appliFname || "",
    in_appliMname: appliMname || "",
    in_appliLname: appliLname || "",
    in_appliAddre: appliAddre || "",
    in_PLACEENG: placeEng || "",
    in_PLACEMAR: placeMar || "",
    in_str: str || "",
    in_Hefname: hefname || "",
    in_Hemname: hemname || "",
    in_Helname: helname || "",
    in_Hmfname: hmfname || "",
    in_Hmmname: hmmname || "",
    in_Hmlname: hmlname || "",
    in_Headdress: headdress || "",
    in_Hmaddress: hmaddress || "",
    in_Hemail: hemail || "",
    in_Wefname: wefname || "",
    in_Wemname: wemname || "",
    in_Welname: welname || "",
    in_Wmfname: wmfname || "",
    in_Wmmname: wmmname || "",
    in_Wmlname: wmlname || "",
    in_Weaddress: weaddress || "",
    in_Wmaddress: wmaddress || "",
    in_Wemail: wemail || "",
    in_W1EFNAME: w1EFNAME || "",
    in_W1EMNAME: w1EMNAME || "",
    in_W1ELNAME: w1ELNAME || "",
    in_W1MFNAME: w1MFNAME || "",
    in_W1MMNAME: w1MMNAME || "",
    in_W1MLNAME: w1MLNAME || "",
    in_W1EADDRE: w1EADDRE || "",
    in_W1MADDRE: w1MADDRE || "",
    in_W2EFNAME: w2EFNAME || "",
    in_W2EMNAME: w2EMNAME || "",
    in_W2ELNAME: w2ELNAME || "",
    in_W2MFNAME: w2MFNAME || "",
    in_W2MMNAME: w2MMNAME || "",
    in_W2MLNAME: w2MLNAME || "",
    in_W2EADDRE: w2EADDRE || "",
    in_W2MADDRE: w2MADDRE || "",
    in_W3EFNAME: w3EFNAME || "",
    in_W3EMNAME: w3EMNAME || "",
    in_W3ELNAME: w3ELNAME || "",
    in_W3MFNAME: w3MFNAME || "",
    in_W3MMNAME: w3MMNAME || "",
    in_W3MLNAME: w3MLNAME || "",
    in_W3EADDRE: w3EADDRE || "",
    in_W3MADDRE: w3MADDRE || "",
    in_PRefname: pRefname || "",
    in_PRemname: pRemname || "",
    in_PRelname: pRelname || "",
    in_PRmfname: pRmfname || "",
    in_PRmmname: pRmmname || "",
    in_PRmlname: pRmlname || "",
    in_PReaddress: pReaddress || "",
    in_PRmaddress: pRmaddress || "",
    in_source: source || "WEB",
    in_deliveryflag: deliveryflag || "",

    in_mrrgdtlid: toNumber(mrrgdtlid),
    in_appliMobile: toNumber(appliMobile),
    in_UlbId: toNumber(ulbId),
    in_Zoneid: toNumber(zoneId),
    in_Mode: toNumber(mode) || 1,
    in_HMobile: toNumber(hMobile),
    in_Hmstatus: toNumber(hmstatus),
    in_Hphysichall: toNumber(hphysichall) || 0,
    in_Hage: toNumber(hage),
    in_Hbirthreligion: toNumber(hbirthreligion),
    in_Hadopreligion: toNumber(hadopreligion),
    in_Hiddoc: toNumber(hiddoc),
    in_Haddresdoc: toNumber(haddresdoc),
    in_Hagedoc: toNumber(hagedoc),
    in_HMode: toNumber(hMode) || 1,
    in_Haadharno: toNumber(haadharno),
    in_WMobile: toNumber(wMobile),
    in_Wmstatus: toNumber(wmstatus),
    in_Wphysichall: toNumber(wphysichall) || 0,
    in_Wage: toNumber(wage),
    in_Wbirthreligion: toNumber(wbirthreligion),
    in_Wadopreligion: toNumber(wadopreligion),
    in_Widdoc: toNumber(widdoc),
    in_Waddresdoc: toNumber(waddresdoc),
    in_Wagedoc: toNumber(wagedoc),
    in_WMode: toNumber(wMode) || 0,
    in_Waadharno: toNumber(waadharno),
    IN_W1DOCID: toNumber(w1DOCID),
    IN_W1RELATIONID: toNumber(w1RELATIONID),
    IN_W1MOBILENO: toNumber(w1MOBILENO),
    IN_W1AGE: toNumber(w1AGE),
    IN_W1MODE: toNumber(w1MODE) || 1,
    IN_W1WITNESS_NO: toNumber(w1WITNESS_NO) || 1,
    IN_W2DOCID: toNumber(w2DOCID),
    IN_W2RELATIONID: toNumber(w2RELATIONID),
    IN_W2MOBILENO: toNumber(w2MOBILENO),
    IN_W2AGE: toNumber(w2AGE),
    IN_W2MODE: toNumber(w2MODE) || 1,
    IN_W2WITNESS_NO: toNumber(w2WITNESS_NO) || 2,
    IN_W3DOCID: toNumber(w3DOCID),
    IN_W3RELATIONID: toNumber(w3RELATIONID),
    IN_W3MOBILENO: toNumber(w3MOBILENO),
    IN_W3AGE: toNumber(w3AGE),
    IN_W3MODE: toNumber(w3MODE) || 1,
    IN_W3WITNESS_NO: toNumber(w3WITNESS_NO) || 3,
    in_PRage: toNumber(pRage),
    in_PRreligion: toNumber(pRreligion),

    in_REGDATE: regDateObj,
    in_MRRGDATE: mrrgDateObj,
    in_Hbirthdt: hbirthdtObj,
    in_Wbirthdt: wbirthdtObj,
    in_W1birthdt: w1birthdtObj,
    in_W2birthdt: w2birthdtObj,
    in_W3birthdt: w3birthdtObj,

    out_ErrorCode: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
    out_ErrorMsg: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 500 },
    out_Mrrgdtlid: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 500 },
    out_AppliNo: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 500 },
    out_Mrrgid: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 500 },
    out_Formid: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 500 },
  };

  console.log("Binds Count:", Object.keys(binds).length);
  console.log("Binds - ULB ID:", binds.in_UlbId, "Zone ID:", binds.in_Zoneid);
  console.log("Binds - Mobile:", binds.in_appliMobile);
  console.log("Binds - Mode:", binds.in_Mode);
  console.log("Binds - in_Hmstatus:", binds.in_Hmstatus);
  console.log("Binds - in_Wmstatus:", binds.in_Wmstatus);

  const result = await executeProcedureTMC({ sql, binds });
  console.log("Insert Result: ", result);
  return result;
}

async function updateMrgImages(params) {
  const { mrrgdtlidId, flag, imgPhoto, imgThumb } = params;

  let query = `UPDATE aorts_MRRGIMAGES_DEF SET `;
  if (flag === "H") {
    query += `blob_mrrgimage_husbpic = :BLOBPhoto, blob_mrrgimage_husbthumb = :BLOBThumb `;
  } else {
    query += `blob_mrrgimage_wifepic = :BLOBPhoto, blob_mrrgimage_wifethumb = :BLOBThumb `;
  }
  query += `WHERE num_mrrgimage_mrrgdtlid = :mrrgdtlidId`;

  const binds = {
    BLOBPhoto: imgPhoto ? { val: Buffer.from(imgPhoto), type: oracledb.BUFFER, dir: oracledb.BIND_IN } : null,
    BLOBThumb: imgThumb ? { val: Buffer.from(imgThumb), type: oracledb.BUFFER, dir: oracledb.BIND_IN } : null,
    mrrgdtlidId: String(mrrgdtlidId),
  };

  const connection = await getConnectionTMC();
  try {
    const result = await connection.execute(query, binds, { autoCommit: true });
    return { success: true, rowsAffected: result.rowsAffected };
  } finally {
    await connection.close();
  }
}

async function updateMrgModImages(params) {
  const { mrrgdtlidId, flag, imgPhoto, imgThumb } = params;

  let query = `UPDATE mrrg.AOMM_MRRGIMAGES_DEF SET `;
  if (flag === "H") {
    query += `blob_mrrgimage_husbpic = :BLOBPhoto, blob_mrrgimage_husbthumb = :BLOBThumb `;
  } else {
    query += `blob_mrrgimage_wifepic = :BLOBPhoto, blob_mrrgimage_wifethumb = :BLOBThumb `;
  }
  query += `WHERE num_mrrgimage_mrrgdtlid = :mrrgdtlidId`;

  const binds = {
    BLOBPhoto: imgPhoto ? { val: Buffer.from(imgPhoto), type: oracledb.BUFFER, dir: oracledb.BIND_IN } : null,
    BLOBThumb: imgThumb ? { val: Buffer.from(imgThumb), type: oracledb.BUFFER, dir: oracledb.BIND_IN } : null,
    mrrgdtlidId: String(mrrgdtlidId),
  };

  const connection = await getConnectionTMC();
  try {
    const result = await connection.execute(query, binds, { autoCommit: true });
    return { success: true, rowsAffected: result.rowsAffected };
  } finally {
    await connection.close();
  }
}

async function addUpdateImage(params) {
  const { mrrgdtlidId, witnessNumber, imagePhoto, imageThumb } = params;

  let columnPrefix = "";
  if (witnessNumber === 1) columnPrefix = "wit1";
  else if (witnessNumber === 2) columnPrefix = "wit2";
  else if (witnessNumber === 3) columnPrefix = "wit3";

  const query = `
    UPDATE aorts_MRRGIMAGES_DEF 
    SET blob_mrrgimage_${columnPrefix}pic = :BLOBPhoto, 
        blob_mrrgimage_${columnPrefix}thumb = :BLOBThumb 
    WHERE num_mrrgimage_mrrgdtlid = :mrrgdtlidId
  `;

  const binds = {
    BLOBPhoto: imagePhoto ? { val: Buffer.from(imagePhoto), type: oracledb.BUFFER, dir: oracledb.BIND_IN } : null,
    BLOBThumb: imageThumb ? { val: Buffer.from(imageThumb), type: oracledb.BUFFER, dir: oracledb.BIND_IN } : null,
    mrrgdtlidId: String(mrrgdtlidId),
  };

  const connection = await getConnectionTMC();
  try {
    const result = await connection.execute(query, binds, { autoCommit: true });
    return { success: true, rowsAffected: result.rowsAffected };
  } finally {
    await connection.close();
  }
}

async function addUpdateMrgImage(params) {
  const { mrrgdtlidId, witnessNumber, imagePhoto, imageThumb } = params;

  let columnPrefix = "";
  if (witnessNumber === 1) columnPrefix = "wit1";
  else if (witnessNumber === 2) columnPrefix = "wit2";
  else if (witnessNumber === 3) columnPrefix = "wit3";

  const query = `
    UPDATE mrrg.AOMM_MRRGIMAGES_DEF 
    SET blob_mrrgimage_${columnPrefix}pic = :BLOBPhoto, 
        blob_mrrgimage_${columnPrefix}thumb = :BLOBThumb 
    WHERE num_mrrgimage_mrrgdtlid = :mrrgdtlidId
  `;

  const binds = {
    BLOBPhoto: imagePhoto ? { val: Buffer.from(imagePhoto), type: oracledb.BUFFER, dir: oracledb.BIND_IN } : null,
    BLOBThumb: imageThumb ? { val: Buffer.from(imageThumb), type: oracledb.BUFFER, dir: oracledb.BIND_IN } : null,
    mrrgdtlidId: String(mrrgdtlidId),
  };

  const connection = await getConnectionTMC();
  try {
    const result = await connection.execute(query, binds, { autoCommit: true });
    return { success: true, rowsAffected: result.rowsAffected };
  } finally {
    await connection.close();
  }
}

async function uploadDoc(params) {
  const { mrrgdtlid, mrrgdocid, mrrgdoc, flag, user, ulbid, mrrgdocflag } = params;

  const query = `
    INSERT INTO aorts_beforemarriage_det (
      num_marriage_mrrgdtlid,
      num_marriage_mrrgdocid,
      blob_marriage_mrrgdoc,
      var_marriage_flag,
      var_marriage_insby,
      dat_marriage_insdate,
      num_marriage_ulbid,
      var_marriage_docflag
    ) VALUES (
      :mrrgdtlid,
      :mrrgdocid,
      :BLOBDOCIMAGE,
      :flag,
      :p_user, 
      SYSDATE,
      :ulbid,
      :mrrgdocflag
    )
  `;

  const binds = {
    mrrgdtlid: String(mrrgdtlid),
    mrrgdocid: Number(mrrgdocid),
    BLOBDOCIMAGE: { val: Buffer.from(mrrgdoc), type: oracledb.BUFFER, dir: oracledb.BIND_IN },
    flag: flag,
    p_user: user,
    ulbid: String(ulbid),
    mrrgdocflag: mrrgdocflag,
  };

  const connection = await getConnectionTMC();
  try {
    const result = await connection.execute(query, binds, { autoCommit: true });
    console.log("Upload Docs: ", result);
    return { success: true, rowsAffected: result.rowsAffected };
  } finally {
    await connection.close();
  }
}

async function getMarriageData(appliNo) {
  const query = `
    SELECT 
      mdef.num_marriage_mrrgdtlid AS mrrgdtlid,
      mdef.var_marriage_applfname AS applfname,
      mdef.var_marriage_applmname AS applmname,
      mdef.var_marriage_appllname AS appllname,
      mdef.num_marriage_applmobno AS applmobno,
      mdef.var_marriage_appladdress AS appladdress,
      mdef.dat_marriage_regdate AS regdate,
      mdef.dat_marriage_mrrgdate AS mrrgdate,
      mdef.var_marriage_mrrgplaceeng AS mrrgplaceeng,
      mdef.var_marriage_mrrgplacemar AS mrrgplacemar,
      mdef.var_marriage_rtsappno AS rtsappno,
      mdef.num_marriage_ulbid AS marriage_ulbid,
      md.num_marriage_mrrgdocid AS mrrgdocid,
      md.blob_marriage_mrrgdoc AS mrrgdoc,
      msdef.BLOB_MRRGIMAGE_HUSBPIC AS HUSBPIC,
      msdef.BLOB_MRRGIMAGE_HUSBTHUMB AS HUSBTHUMB,
      msdef.BLOB_MRRGIMAGE_WIFEPIC AS WIFEPIC,
      msdef.BLOB_MRRGIMAGE_WIFETHUMB AS WIFETHUMB,
      msdef.BLOB_MRRGIMAGE_WIT1PIC AS WIT1PIC,
      msdef.BLOB_MRRGIMAGE_WIT1THUMB AS WIT1THUMB,
      msdef.BLOB_MRRGIMAGE_WIT2PIC AS WIT2PIC,
      msdef.BLOB_MRRGIMAGE_WIT2THUMB AS WIT2THUMB,
      msdef.BLOB_MRRGIMAGE_WIT3PIC AS WIT3PIC,
      msdef.BLOB_MRRGIMAGE_WIT3THUMB AS WIT3THUMB,
      mhdef.VAR_MRRGHUSB_EFNAME AS HUSB_EFNAME,
      mhdef.VAR_MRRGHUSB_EMNAME AS HUSB_EMNAME,
      mhdef.VAR_MRRGHUSB_ELNAME AS HUSB_ELNAME,
      mhdef.VAR_MRRGHUSB_MFNAME AS HUSB_MFNAME,
      mhdef.VAR_MRRGHUSB_MMNAME AS HUSB_MMNAME,
      mhdef.VAR_MRRGHUSB_MLNAME AS HUSB_MLNAME,
      mhdef.VAR_MRRGHUSB_EADDRE AS HUSB_EADDRE,
      mhdef.VAR_MRRGHUSB_MADDRE AS HUSB_MADDRE,
      mhdef.NUM_MRRGHUSB_MOBILENO AS HUSB_MOBILENO,
      mhdef.NUM_MRRGHUSB_MSTATUS AS HUSB_MSTATUS,
      mhdef.NUM_MRRGHUSB_PHYSICHALL AS HUSB_PHYSICHALL,
      mhdef.NUM_MRRGHUSB_AGE AS HUSB_AGE,
      mhdef.NUM_MRRGHUSB_BIRTHRELIGION AS HUSB_BIRTHRELIGION,
      mhdef.NUM_MRRGHUSB_ADOPRELIGION AS HUSB_ADOPRELIGION,
      mhdef.VAR_MRRGHUSB_EMAIL AS HUSB_EMAIL,
      mhdef.NUM_MRRGHUSB_IDDOC AS HUSB_IDDOC,
      mhdef.NUM_MRRGHUSB_ADDRESDOC AS HUSB_ADDRESDOC,
      mhdef.NUM_MRRGHUSB_AGEDOC AS HUSB_AGEDOC,
      mhdef.dat_mrrghusb_birthdt AS husb_birthdt,
      mhdef.num_mrrghusb_aadharno AS husb_aadharno,
      mwdef.var_mrrgwife_efname AS wife_efname,
      mwdef.var_mrrgwife_emname AS wife_emname,
      mwdef.var_mrrgwife_elname AS wife_elname,
      mwdef.var_mrrgwife_mfname AS wife_mfname,
      mwdef.var_mrrgwife_mmname AS wife_mmname,
      mwdef.var_mrrgwife_mlname AS wife_mlname,
      mwdef.var_mrrgwife_eaddre AS wife_eaddre,
      mwdef.var_mrrgwife_maddre AS wife_maddre,
      mwdef.num_mrrgwife_mobileno AS wife_mobileno,
      mwdef.num_mrrgwife_mstatus AS wife_mstatus,
      mwdef.num_mrrgwife_physichall AS wife_physichall,
      mwdef.num_mrrgwife_age AS wife_age,
      mwdef.num_mrrgwife_birthreligion AS wife_birthreligion,
      mwdef.num_mrrgwife_adopreligion AS wife_adopreligion,
      mwdef.var_mrrgwife_email AS wife_email,
      mwdef.num_mrrgwife_iddoc AS wife_iddoc,
      mwdef.num_mrrgwife_addresdoc AS wife_addresdoc,
      mwdef.num_mrrgwife_agedoc AS wife_agedoc,
      mwdef.dat_mrrgwife_birthdt AS wife_birthdt,
      mwdef.num_mrrgwife_aadharno AS wife_aadharno,
      wt1.var_witn1_efname AS witn1_efname,
      wt1.var_witn1_emname AS witn1_emname,
      wt1.var_witn1_mfname AS witn1_mfname,
      wt1.var_witn1_mmname AS witn1_mmname,
      wt1.var_witn1_mlname AS witn1_mlname,
      wt1.num_witn1_docid AS witn1_docid,
      wt1.num_witn1_relationid AS witn1_relationid,
      wt1.num_witn1_mobileno AS witn1_mobileno,
      wt1.num_witn1_age AS witn1_age,
      wt1.var_witn1_eaddre AS witn1_eaddre,
      wt1.var_witn1_maddre AS witn1_maddre,
      wt1.dat_witn1_birthdate AS witn1_birthdate,
      wt2.var_witn2_efname AS witn2_efname,
      wt2.var_witn2_emname AS witn2_emname,
      wt2.var_witn2_elname AS witn2_elname,
      wt2.var_witn2_mfname AS witn2_mfname,
      wt2.var_witn2_mmname AS witn2_mmname,
      wt2.var_witn2_mlname AS witn2_mlname,
      wt2.num_witn2_docid AS witn2_docid,
      wt2.num_witn2_relationid AS witn2_relationid,
      wt2.num_witn2_mobileno AS witn2_mobileno,
      wt2.num_witn2_age AS witn2_age,
      wt2.var_witn2_eaddre AS witn2_eaddre,
      wt2.var_witn2_maddre AS witn2_maddre,
      wt2.dat_witn2_birthdate AS witn2_birthdate,
      wt3.var_witn3_efname AS witn3_efname,
      wt3.var_witn3_emname AS witn3_emname,
      wt3.var_witn3_elname AS witn3_elname,
      wt3.var_witn3_mfname AS witn3_mfname,
      wt3.var_witn3_mmname AS witn3_mmname,
      wt3.var_witn3_mlname AS witn3_mlname,
      wt3.num_witn3_docid AS witn3_docid,
      wt3.num_witn3_relationid AS witn3_relationid,
      wt3.num_witn3_mobileno AS witn3_mobileno,
      wt3.num_witn3_age AS witn3_age,
      wt3.var_witn3_eaddre AS witn3_eaddre,
      wt3.dat_witn3_birthdate AS witn3_birthdate,
      pdef.VAR_PRIEST_EFNAME AS PRIEST_EFNAME,
      pdef.VAR_PRIEST_EMNAME AS PRIEST_EMNAME,
      pdef.VAR_PRIEST_ELNAME AS PRIEST_ELNAME,
      pdef.VAR_PRIEST_MFNAME AS PRIEST_MFNAME,
      pdef.VAR_PRIEST_MMNAME AS PRIEST_MMNAME,
      pdef.VAR_PRIEST_MLNAME AS PRIEST_MLNAME,
      pdef.NUM_PRIEST_AGE AS PRIEST_AGE,
      pdef.NUM_PRIEST_RELIGIONID AS PRIEST_RELIGIONID,
      pdef.VAR_PRIEST_EADDRE AS PRIEST_EADDRE,
      pdef.VAR_PRIEST_MADDRE AS PRIEST_MADDRE
    FROM AORTS_MARRIAGE_DEF mdef
    INNER JOIN AOrts_MARRIAGE_DET md ON md.num_marriage_mrrgdtlid = mdef.num_marriage_mrrgdtlid
    INNER JOIN aorts_mrrgimages_def msdef ON msdef.num_mrrgimage_mrrgdtlid = mdef.num_marriage_mrrgdtlid 
      AND msdef.num_mrrgimage_ulbid = mdef.num_marriage_ulbid
    INNER JOIN aorts_mrrgreghusband_def mhdef ON mhdef.num_mrrghusb_mrrgdtlid = mdef.num_marriage_mrrgdtlid
    INNER JOIN aorts_mrrgregwife_def mwdef ON mwdef.num_mrrgwife_mrrgdtlid = mdef.num_marriage_mrrgdtlid
    INNER JOIN AOrts_MRRGREGWITN1_DEF wt1 ON wt1.num_witn1_mrrgdtlid = mdef.num_marriage_mrrgdtlid
    INNER JOIN AOrts_MRRGREGWITN2_DEF wt2 ON wt2.num_witn2_mrrgdtlid = mdef.num_marriage_mrrgdtlid
    INNER JOIN AOrts_MRRGREGWITN3_DEF wt3 ON wt3.num_witn3_mrrgdtlid = mdef.num_marriage_mrrgdtlid
    INNER JOIN aorts_mrrgpriest_def pdef ON pdef.num_priest_mrrgdtlid = mdef.num_marriage_mrrgdtlid
    WHERE var_marriage_rtsappno = :appliNo
  `;

  return await executeQueryTMC(query, { appliNo: String(appliNo) });
}

async function getMarriageDocuments(mrrgdtlid) {
  const query = `
    SELECT 
      num_marriage_mrrgdocid, 
      blob_marriage_mrrgdoc 
    FROM AOrts_MARRIAGE_DET 
    WHERE num_marriage_mrrgdtlid = :mrrgdtlid
  `;
  return await executeQueryTMC(query, { mrrgdtlid: String(mrrgdtlid) });
}

async function getServicePaymentFlag(serviceId) {
  const query = `
    SELECT var_service_payflag 
    FROM aorts_tmcservice_def 
    WHERE num_service_serviceid = :serviceId
  `;
  return await executeQueryTMC(query, { serviceId: String(serviceId) });
}

async function insertAppDoc(params) {
  const { corpId, serviceId, appNo, docType, documentId, docBuffer } = params;

  const query = `
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
      :DOCBUFFER
    )
  `;

  const connection = await getConnectionTMC();
  try {
    const result = await connection.execute(
      query,
      {
        corpId: Number(corpId),
        serviceId: Number(serviceId),
        appNo: String(appNo),
        docType: String(docType),
        documentId: Number(documentId),
        DOCBUFFER: { val: Buffer.from(docBuffer), type: oracledb.BUFFER, dir: oracledb.BIND_IN },
      },
      { autoCommit: true }
    );
    return { success: true, rowsAffected: result.rowsAffected };
  } catch (error) {
    console.error("insertAppDoc Error:", error);
    return { success: false, error: error.message };
  } finally {
    await connection.close();
  }
}

module.exports = {
  getZones,
  getPreviousStatus,
  getReligionList,
  getIDDocuments,
  getAddressDocuments,
  getAgeDocuments,
  getRelations,
  getDocumentDefinitions,
  calculateAge,
  insertMarriageRegistration,
  updateMrgImages,
  updateMrgModImages,
  addUpdateImage,
  addUpdateMrgImage,
  uploadDoc,
  getMarriageData,
  getMarriageDocuments,
  getServicePaymentFlag,
  insertAppDoc
};