const { executeQueryTMC } = require("../../db/queryExecutor");
const { getConnectionTMC } = require("../../config/db");
const oracledb = require("oracledb");
const { decryptString } = require("./encrypt.js");

const lobToBuffer = async (lob) => {
    return new Promise((resolve, reject) => {
        const chunks = [];
        lob.on("data", (chunk) => chunks.push(chunk));
        lob.on("end", () => resolve(Buffer.concat(chunks)));
        lob.on("error", reject);
    });
};

const decryptRequestRepo = async ({ encryptedRequest }) => {
    console.log("Repo: Decrypt Request", { encryptedRequest });

    const DEFAULT_ENCRYPTED_REQUEST = "00FCB9012692E1D96C83CEB51B616291";

    if (encryptedRequest === null || encryptedRequest === undefined || String(encryptedRequest).trim() === "") {
        encryptedRequest = DEFAULT_ENCRYPTED_REQUEST;
        console.log("Using default encrypted request:", encryptedRequest);
    }

    const decryptedRequest = decryptString(encryptedRequest);
    console.log("Decrypted Request:", decryptedRequest);

    const requestParts = decryptedRequest.split("&");

    let corpCode = "";
    requestParts.forEach((part) => {
        const [key, ...values] = part.split("=");

        if (key?.trim().toUpperCase() === "CORPCODE") {
            corpCode = values.join("=").trim();
        }
    }
    );

    if (!corpCode) {
        console.log("CORPCODE not found, returning decrypted request only");

        return {
            encryptedRequest,
            request: decryptedRequest,
            decryptedRequest,
            corpCode: null,
            ulbId: null
        };
    }

    const ulbSql = `
        SELECT
            corporationid
        FROM prop.vw_corporation
        WHERE corporation_code = :corpCode
    `;

    const ulbResult =
        await executeQueryTMC(ulbSql, { corpCode });

    if (!ulbResult.success) {
        throw new Error(ulbResult.error || "Failed to fetch corporation ID");
    }

    const ulbRow = ulbResult.rows?.[0] || null;

    if (!ulbRow) {
        throw new Error(`No corporation found for CORPCODE: ${corpCode}`);
    }

    if (!ulbRow) {
        return {
            encryptedRequest,
            request: decryptedRequest,
            decryptedRequest,
            corpCode,
            ulbId: null
        };
    }

    const ulbId = ulbRow.CORPORATIONID ?? ulbRow.corporationid ?? null;

    if (!ulbId) {
        throw new Error(`Corporation ID not found for CORPCODE: ${corpCode}`);
    }

    return {
        encryptedRequest,
        request: decryptedRequest,
        corpCode,
        ulbId: Number(ulbId),
    };
};

const getCorporationDetailsRepo = async ({ corporationId }) => {
    console.log("Repo: Fetch Corporation Details", { corporationId });

    let connection;

    try {
        connection = await getConnectionTMC();
        const binds = { corporationId: Number(corporationId) };

        const corporationSql = `
            select num_corporation_id,var_corporation_name from admins.aoma_corporation_mas
            where num_corporation_id = :corporationId
        `;

        const logoSql = `
             SELECT
                blob_corporation_img
            FROM admins.aoma_corporation_mas
            WHERE num_corporation_id = :corporationId
        `;

        const corporationResult = await connection.execute(
            corporationSql,
            binds,
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        const logoResult = await connection.execute(
            logoSql,
            binds,
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        const corporation = corporationResult.rows?.[0] || null;

        const logoRow = logoResult.rows?.[0] || null;

        let logo = null;

        console.log({ logo: logoResult.rows })

        if (logoRow?.BLOB_CORPORATION_IMG) {
            if (Buffer.isBuffer(logoRow.BLOB_CORPORATION_IMG)) {
                logo = logoRow.BLOB_CORPORATION_IMG.toString("base64");
            } else {
                const logoBuffer = await lobToBuffer(logoRow.BLOB_CORPORATION_IMG);
                logo = logoBuffer.toString("base64");
            }
        }

        return { corporation, logo };

    } catch (err) {
        console.error("❌ Corporation Details Repo Error:", err);
        throw err;
    } finally {
        if (connection) {
            try { await connection.close(); } catch (e) {
                console.error("Error closing connection:", e);
            }
        }
    }
};

const getemployeeDepartmentMenuRepo = async ({ userId }) => {
    console.log("Repo: Fetch Employee Department Menu", { userId });
    const binds = { userId: userId };

    const sql = `
        select 
            num_menumaster_menuid,
            num_menumaster_parentmenuid,
            var_menumaster_pagetitle, 
            var_menumaster_pagepath , 
            'M' Type
        from aorts_menumaster_def where num_menumaster_parentmenuid=0 
        union all 
        select 
            num_menumaster_menuid, 
            num_menumaster_parentmenuid,
            var_menumaster_pagetitle, 
            var_menumaster_pagepath, 
            'T' Type 
        from aorts_menumaster_def a 
        inner join aorts_menuuser_def c on c.num_menuuser_menuid = a.num_menumaster_menuid 
        where var_menuuser_userid = :userId
    `;

    const result = await executeQueryTMC(sql, binds);

    if (!result || !result.success) {
        throw new Error(result?.error || "Failed to fetch Employee department menu");
    }
    return result.rows;
};


const getDepartmentMenuRepo = async ({ ulbid }) => {
    console.log("Repo: Fetch Department Menu", { ulbid });
    const binds = { ulbid: Number(ulbid) };

    const sql = `
        SELECT DISTINCT
            entryid,
            num_serv_ulbid AS ulbid,
            CASE
                WHEN num_deptdspy_type = 'B' THEN accormarname || '/' || accorname
                WHEN num_deptdspy_type = 'M'
                    THEN CASE
                        WHEN num_serv_ulbid = 1850 AND deptid = 18 THEN 'व्यवसाय परवाना विभाग' ELSE accormarname END
                        WHEN num_deptdspy_type = 'E' THEN accorname ELSE accorname END AS accorname,
            seqid,
            deptid,
            deptname,
            var_entry_status,
            var_entry_path
        FROM vw_accordbk
        INNER JOIN aorts_service_def
            ON num_service_deptid = deptid
        INNER JOIN aorts_service_config
            ON num_serv_deptid = deptid
           AND num_serv_servid = num_service_serviceid
        LEFT JOIN aorts_deptdspyconfig_det
            ON num_deptdspy_ulbid = num_serv_ulbid
        WHERE var_entry_status = 'Y'
          AND num_serv_ulbid = :ulbid
        ORDER BY deptid
    `;

    const result = await executeQueryTMC(sql, binds);

    if (!result || !result.success) {
        throw new Error(result?.error || "Failed to fetch department menu");
    }
    return result.rows;
};

const getServicesByDeptIdRepo = async ({ ulbid, deptId }) => {
    console.log("Repo: Fetch Services By Department", { ulbid, deptId });

    const binds = { deptId: Number(deptId) };

    // let sql;

    // if (Number(ulbid) === 2) {
    //     sql = `
    //         SELECT DISTINCT
    //             CASE
    //                 WHEN var_service_displayname IS NULL
    //                     THEN var_service_eng_name
    //                 ELSE var_service_displayname
    //             END AS displayname,
    //             num_service_serviceid,
    //             var_dept_engname,
    //             num_dept_id
    //         FROM aorts.aorts_tmcservice_def
    //         INNER JOIN admins.aoms_dept_mas
    //             ON num_dept_id = num_service_deptid
    //         INNER JOIN aorts_service_config
    //             ON num_serv_servid = num_service_serviceid
    //            AND num_serv_deptid = num_service_deptid
    //         WHERE num_service_deptid = :deptId
    //           AND var_service_active = 'Y'
    //           AND num_serv_ulbid = :ulbid
    //         ORDER BY num_service_serviceid
    //     `;
    // } else {
    //     sql = `
    //         SELECT
    //             CASE
    //                 WHEN var_serv_dispname IS NULL
    //                     THEN var_service_eng_name
    //                 ELSE var_serv_dispname
    //             END AS displayname,
    //             num_service_serviceid,
    //             var_dept_engname,
    //             num_dept_id
    //         FROM aorts.aorts_tmcservice_def
    //         INNER JOIN admins.aoms_dept_mas
    //             ON num_dept_id = num_service_deptid
    //         INNER JOIN aorts_service_config
    //             ON num_serv_servid = num_service_serviceid
    //            AND num_serv_deptid = num_service_deptid
    //         WHERE num_service_deptid = :deptId
    //           AND var_service_active = 'Y'
    //           AND num_serv_ulbid = :ulbid
    //         ORDER BY num_service_serviceid
    //     `;
    // }

    const sql = `
        SELECT 
            var_service_eng_name, 
            num_service_serviceid,
            var_dept_engname,num_dept_id 
        FROM aorts.aorts_service_def
        inner join admins.aoms_dept_mas on num_dept_id = num_service_deptid
        inner join aorts_servmenu_mas on num_servmenu_servid=num_service_serviceid
        WHERE 
            num_service_deptid =:deptId 
            and var_servmenu_pageurl is not null 
            AND var_service_active = 'Y' 
        ORDER BY num_service_serviceid


    
    `;
    const result = await executeQueryTMC(sql, binds);

    if (!result || !result.success) {
        throw new Error(result?.error || "Failed to fetch services by department");
    }

    return result.rows;
};

const getDocumentsForServiceRepo = async ({ serviceId, ulbid }) => {
    console.log("Repo: Fetch Documents For Service", { serviceId, ulbid });

    const binds = { serviceId: Number(serviceId), ulbid: Number(ulbid) };

    const sql = `
        SELECT 
            var_doc_engname, 
            num_serdoc_servid, 
            num_serdoc_ulbid, 
            var_service_eng_name, 
            num_service_serviceid
        FROM aorts.aorts_serv_doc_config
        INNER JOIN aorts.aorts_service_def on num_service_serviceid = num_serdoc_servid
        INNER JOIN aorts.aorts_doc_def ON num_doc_id = num_serdoc_docid and num_doc_serviceid = num_service_serviceid
        WHERE num_serdoc_servid = :serviceId
         AND var_service_active = 'Y' 
         and num_serdoc_ulbid = :ulbid
    `;

    const result = await executeQueryTMC(sql, binds);
    return result.rows;

};

const getInsructionsForServiceRepo = async ({ serviceId }) => {
    console.log("Repo: Fetch Instructions For Service", { serviceId });

    if (Number(serviceId) === 1) {
        return [{
            VAR_INST_MARDOCDESC: `
                सूचना :- सदर अर्जासोबत खालील प्रकारची कागदपत्रे जोडली पाहिजेत. <br/>
                १. वर - वधू यांच्या वयाचा पुरावा - शाळा सोडल्याचा दाखला / जन्माचा दाखला / एस.एस.सी.परिक्षेच्या प्रमाणपत्राची प्रत / पासपोर्ट यापैकी एक. <br/>
                २. वर - वधू यांचा राहण्याचा पुरावा - लाईटबिल / रेशनकार्ड / इलेक्शन कार्ड / पासपोर्ट(स्वत: च्या नावे / आईवडिलांच्या नांवे व वधुचा माहेरचा रहिवासी पुरावा असणे आवश्यक आहे).यापैकी एक(विशेष सुचना - वर - वधु भाडेतत्वावर राहत असेल तर भाडेकरार शासनाकडे नोंदणीकृत असावा.) <br/>
                ३. वर - वधूचे आधार कार्ड तसेच तीन साक्षीदारांचे रहिवासी पुरावे(आधारकार्ड / रेशनिंगकार्ड / इलेक्शन कार्ड / पासपोर्ट) यापैकी एक <br/>
                ४. पक्षकार घटस्फोटीत / विधुर / विधवा असल्याचा न्यायालयाचा हुकुमनामा / नगरपालिका मृत्यु दाखला जोडणे आवश्यक आहे. <br/>
                ५. लग्नपत्रिका, लग्नपत्रिका नसेल तर जॉईट डिक्लेरेशन १०० रुपयांचे स्टॅम्पपेपरवर करणे. <br/>
                ६. सर्व पुराव्यांची स्वंय - साक्षांकित झेरॉक्स प्रत करुन घेणे तसेच ओरिजिनल (मूळप्रती)नोंदणीच्या वेळी विवाह निबंधकास पडताळणीसाठी सादर करणे आवश्यक आहे. (पडताळणीनंतर मुळप्रती परत केल्या जातील) <br/>
                ७. वर वधु, चे प्रत्येकी पाच फोटो व तीन साक्षीदारांचे प्रत्येकी दोन फोटो <br/>
                ८. वर वधु, यांचा लग्न विधीचा फोटो <br/>
                ९. फक्त महाराष्ट्र राज्यात संपन्न झालेल्या विवाहाकरिता हा नमुना विधिग्राहय आहे <br/>
                १०. विवाह संपन्न करणाऱ्या पुरोहित / भटजी / काझी ची सही या अर्जावर अ.क्र. ७ वरील रकान्यात सर्व माहिती भरुन घेणे आवश्यक आहे. <br/>
                ११. वर, वधू व तीन साक्षीदार यांनी विवाह निबंधकासमोर एकाच वेळी व्यक्तिश: उपस्थित राहून सहया करणे कायदयानुसार[कलम ६ (१)(ख)अन्वये आवश्यक आहे.] <br/>
                १२. लग्न दिनांकापासुन ९० दिवसाच्या आत नोंदणी केल्यास रु ५०/ -, ९० दिवस ते १ वर्षांच्या आत नोंदणी केल्यास रु १००/ -आणि १ वर्षानंतर नोदणी केल्यास रु २००/ -इतके विवाह नोंदणी शुल्क भरावे लागेल. <br/>
                १३. मुस्लीम धर्मियांकरीता त्यांच्या निकाहाची निकाहनामा प्रत (इंग्रजीमधील)जोडणे आवश्यक आहे. <br/>
                १४. भिन्न धर्मिय वर - वधू यांच्या विवाहांची महाराष्ट्र विवाह मंडळाचे विनियमन व विवाह नोंदणी अधिनिय, १९९८ अंतर्गत सदरच्या फॉर्मनुसार नोंदणी करता येत नाही.या कायदयाखाली विवाह नोदणी करण्यासाठी वर - वधू दोघेही समानधर्मीय असणे आवश्यक आहे <br/>
                तथापि, विवाह करण्यापूर्वी दोघांपैकी एकाने धर्मातर करुन विवाहातील दुसऱ्या पक्षकाराचा धर्म स्विकारुन ते दोघे समान धर्मीय झाल्यानंतर(हिंदु / मुस्लिम फक्त) त्यांनी केलेल्या विवाहाची नोंदणी या कायदयाखाली करताना त्यांनी खालील आशयाची <br/>
                १) स्वच्छेने धर्मातर केल्याबाबतचे धर्मातरीत व्यक्तीचे प्रतिज्ञापत्र. <br/>
                २) त्याचे / तिचे धर्मातर ज्या व्यक्तीने केले त्याचे प्रतिज्ञापत्र. <br/>
                ३) अशा प्रकारे दोघेही एकधर्मीय झाल्यानंतर दोघांचे संयुक्त प्रतिज्ञापत्र. <br/>
                अशी एकूण ३ प्रतिज्ञापत्रे विवाहाच्या दिनांकापूर्वी पक्षकारांपैकी एकाच्या नावे तसेच धर्मातर करणाऱ्या पंडित / काझी यांच्या नांवे खरेदी केलेल्या रुपये १०० च्या स्टॅम्प पेपरवर करणे आवश्यक आहे. <br/>
            `,
        }];
    }

    const binds = {serviceId: Number(serviceId)};

    const sql = `
        select
            var_doc_mardocdesc
        from aorts.aorts_doc_def
        where num_doc_serviceid = :serviceId
            and var_inst_active = 'Y'
    `;

    const result = await executeQueryTMC(sql, binds);
    return result.rows;
};

const getDownloadDocsRepo = async ({ serviceName, ulbid }) => {
    console.log("Repo: Fetch Download Documents", { serviceName, ulbid });

    const binds = { serviceName: String(serviceName) };

    const sql = `
         select 
            num_serdoc_id DocId, 
            var_doc_engname DocName,
            '' downpath 
        from aorts_serv_doc_config
        INNER JOIN aorts.aorts_doc_def ON num_doc_id = num_serdoc_docid and num_doc_serviceid = num_serdoc_servid
        where num_serdoc_servid=:serviceName
            and var_doc_active='Y'
    `;

    const result = await executeQueryTMC(sql, binds);

    if (!result || !result.success) {
        throw new Error(result?.error || "Failed to fetch download documents");
    }

    return result.rows;
};

async function getServiceDetails({ serviceId }) {
    if (serviceId === null || serviceId === undefined || String(serviceId).trim() === "") {
        throw new Error("serviceId is required");
    }

    let resolvedServiceId = String(serviceId).trim();

    if (!/^\d+$/.test(resolvedServiceId)) {
        const decryptedRequest = decryptString(resolvedServiceId);

        console.log("Encrypted Service ID:", resolvedServiceId);
        console.log("Decrypted Service Request:", decryptedRequest);

        const match = decryptedRequest.match(/SERVICEID\s*=\s*(\d+)/i);

        if (!match) {
            throw new Error("Invalid encrypted service ID");
        }

        resolvedServiceId = match[1];
    }

    const numericServiceId = Number(resolvedServiceId);

    console.log("Resolved Service ID:", numericServiceId);

    const sql = `
         SELECT
            num_service_serviceid AS service_id,
            var_servmenu_pageurl AS service_url,
             var_service_payflag AS service_rate,
            var_service_eng_name AS service_name
        FROM aorts_service_def
       inner join  aorts_servmenu_mas on num_servmenu_servid=num_service_serviceid
      
        WHERE num_service_serviceid =  :serviceId
    `;

    const result = await executeQueryTMC(sql, {
        serviceId: numericServiceId
    });

    if (!result.success) {
        throw new Error(result.error || "Failed to fetch service details");
    }

    const row = result.rows?.[0];

    if (!row) {
        return null;
    }

    return {
        serviceId: numericServiceId,
        serviceUrl: row.SERVICE_URL || "",
        serviceRate: row.SERVICE_RATE ?? null,
        serviceName: row.SERVICE_NAME || ""
    };
}

module.exports = {
    lobToBuffer,
    decryptRequestRepo,
    getCorporationDetailsRepo,
    getemployeeDepartmentMenuRepo,
    getDepartmentMenuRepo,
    getServicesByDeptIdRepo,
    getDocumentsForServiceRepo,
    getDownloadDocsRepo,
    getServiceDetails,
    getInsructionsForServiceRepo
};