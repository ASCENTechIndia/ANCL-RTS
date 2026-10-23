const { executeQueryTMC } = require("../../../db/queryExecutor");

// =====================================================
// Department Wise Dashboard Details
// =====================================================

const getDepartmentDetailsRepo = async ({ fromDate, toDate, ulbId, wardId, ward }) => {
  try {
    let query;
    let binds = {
      fromDate,
      toDate,
    };

    // =================================================
    // WARD-WISE DEPARTMENT
    // Legacy:
    // if (WardId != "" && Ward != "")
    // =================================================

    if (wardId && ward) {
      query = `
                SELECT
                    ULBID,
                    DEPARTMENT,
                    DEPARTMENTNAME,
                    SUM(APPRECEIVED) AS APPRECEIVED,
                    SUM(APPAPPRV) AS APPAPPRV,
                    SUM(APPREJECT) AS APPREJECT,
                    SUM(APPENDING) AS APPENDING,
                    SUM(PAYDONE) AS PAYDONE,
                    SUM(PAYPENDING) AS PAYPENDING,
                    SUM(CERTDONE) AS CERTDONE,
                    ROUND(
                        SUM(CERTDONE) / SUM(APPRECEIVED) * 100,
                        2
                    ) AS PERCENTAGE
                FROM admins.vw_warddept
                WHERE TRUNC(APPLIDATE) >= TO_DATE(:fromDate, 'DD/MM/YYYY')
                  AND TRUNC(APPLIDATE) <= TO_DATE(:toDate, 'DD/MM/YYYY')
                  AND ULBID = :ulbId
                  AND WARDID = :wardId
                GROUP BY
                    DEPARTMENT,
                    DEPARTMENTNAME,
                    ULBID
            `;

      binds.ulbId = Number(ulbId);
      binds.wardId = Number(wardId);
    }

    // =================================================
    // DEPARTMENT WISE
    // Legacy:
    // else
    // =================================================
    else {
      query = `
                SELECT
                    ULBID,
                    DEPARTMENT,
                    DEPARTMENTNAME,
                    SUM(APPRECEIVED) AS APPRECEIVED,
                    SUM(APPAPPRV) AS APPAPPRV,
                    SUM(APPREJECT) AS APPREJECT,
                    SUM(APPENDING) AS APPENDING,
                    SUM(PAYDONE) AS PAYDONE,
                    SUM(PAYPENDING) AS PAYPENDING,
                    SUM(CERTDONE) AS CERTDONE,
                    ROUND(
                        SUM(CERTDONE) / SUM(APPRECEIVED) * 100,
                        2
                    ) AS PERCENTAGE
                FROM admins.vw_deptwise
                WHERE TRUNC(APPLIDATE) >= TO_DATE(:fromDate, 'DD/MM/YYYY')
                  AND TRUNC(APPLIDATE) <= TO_DATE(:toDate, 'DD/MM/YYYY')
                GROUP BY
                    DEPARTMENT,
                    DEPARTMENTNAME,
                    ULBID
            `;
    }
    console.log("Query:", query);
    const result = await executeQueryTMC(query, binds);

    return {
      rows: result.rows || [],
      rowCount: result.rows?.length || 0,
    };
  } catch (error) {
    console.error("Repository Error - Get Department Details:", error);

    throw error;
  }
};

const getServiceDetailsRepo = async ({ deptId, dept, wardId, ward, fromDate, toDate, ulbId }) => {
  try {
    let query;
    let binds;

    // =================================================
    // Ward + Department + Service
    // Legacy: admins.vw_wardserv
    // =================================================
    if (wardId && ward) {
      query = `
        SELECT
          ULBID,
          DEPARTMENT,
          DEPARTMENTNAME,
          SERVICE,
          SERVENGNAME,
          SUM(APPRECEIVED) AS APPRECEIVED,
          SUM(APPAPPRV) AS APPAPPRV,
          SUM(APPREJECT) AS APPREJECT,
          SUM(APPENDING) AS APPENDING,
          SUM(PAYDONE) AS PAYDONE,
          SUM(PAYPENDING) AS PAYPENDING,
          SUM(CERTDONE) AS CERTDONE,
          ROUND(
            SUM(CERTDONE) / SUM(APPRECEIVED) * 100,
            2
          ) AS PERCENTAGE
        FROM admins.vw_wardserv
        WHERE TRUNC(APPLIDATE) >= :fromDate
          AND TRUNC(APPLIDATE) <= :toDate
          AND DEPARTMENT = :deptId
          AND ULBID = :ulbId
          AND WARDID = :wardId
        GROUP BY
          SERVICE,
          SERVENGNAME,
          DEPARTMENT,
          DEPARTMENTNAME,
          ULBID
      `;

      binds = {
        fromDate,
        toDate,
        deptId,
        ulbId,
        wardId,
      };
    }

    // =================================================
    // Department + Service
    // Legacy: admins.vw_servwise
    // =================================================
    else {
      query = `
        SELECT
          ULBID,
          DEPARTMENT,
          DEPARTMENTNAME,
          SERVICE,
          SERVENGNAME,
          SUM(APPRECEIVED) AS APPRECEIVED,
          SUM(APPAPPRV) AS APPAPPRV,
          SUM(APPREJECT) AS APPREJECT,
          SUM(APPENDING) AS APPENDING,
          SUM(PAYDONE) AS PAYDONE,
          SUM(PAYPENDING) AS PAYPENDING,
          SUM(CERTDONE) AS CERTDONE,
          ROUND(
            SUM(CERTDONE) / SUM(APPRECEIVED) * 100,
            2
          ) AS PERCENTAGE
        FROM admins.vw_servwise
        WHERE TRUNC(APPLIDATE) >= :fromDate
          AND TRUNC(APPLIDATE) <= :toDate
          AND DEPARTMENT = :deptId
        GROUP BY
          SERVICE,
          SERVENGNAME,
          DEPARTMENT,
          DEPARTMENTNAME,
          ULBID
      `;

      binds = {
        fromDate,
        toDate,
        deptId,
      };
    }
    console.log("query:", query);
    const result = await executeQueryTMC(query, binds);

    return {
      rows: result.rows || [],
      rowCount: result.rowCount || 0,
    };
  } catch (error) {
    console.error("Get Service Details Repo Error:", error);
    throw error;
  }
};

// =====================================================
// Get Ward Wise Details
// =====================================================
const getWardWiseDetailsRepo = async ({ fromDate, toDate, ulbId }) => {
  try {
    const query = `
      SELECT
        ULBID,
        WARDID,
        WARDNAME,
        SUM(APPRECEIVED) AS APPRECEIVED,
        SUM(APPAPPRV) AS APPAPPRV,
        SUM(APPREJECT) AS APPREJECT,
        SUM(APPENDING) AS APPENDING,
        SUM(PAYDONE) AS PAYDONE,
        SUM(PAYPENDING) AS PAYPENDING,
        SUM(CERTDONE) AS CERTDONE,
        ROUND(
          SUM(CERTDONE) / SUM(APPRECEIVED) * 100,
          2
        ) AS PERCENTAGE
      FROM admins.vw_wardwise
      WHERE TRUNC(APPLIDATE) >= :fromDate
        AND TRUNC(APPLIDATE) <= :toDate
        AND ULBID = :ulbId
      GROUP BY
        WARDID,
        WARDNAME,
        ULBID
    `;

    const binds = {
      fromDate,
      toDate,
      ulbId,
    };

    const result = await executeQueryTMC(query, binds);

    return {
      rows: result.rows || [],
      rowCount: result.rowCount || 0,
    };
  } catch (error) {
    console.error("Get Ward Wise Details Repo Error:", error);
    throw error;
  }
};

const getApplicationDetailsRepo = async ({ deptId, servId, wardId, fromDate, toDate, ulbId }) => {
  try {
    let query = `
      SELECT
        det.TRACKID,
        det.ULBID,
        det.WARDID,
        det.WARDNAME,
        det.DEPARTMENT,
        det.DEPARTMENTNAME,
        det.SERVICE,
        det.SERVENGNAME,
        det.APPID,
        det.APPLINO,
        det.APPLINAME,
        det.APPLIEMAIL,
        det.APPLIMOBILE,
        det.APPLIDATE,

        (
          SELECT
            t.STEP || '-' || t.STATUS
          FROM admins.vw_track_new t
          WHERE t.APPLINO = det.APPLINO
            AND t.ULBID = det.ULBID
            AND t.STAGEID = (
              SELECT MAX(t2.STAGEID)
              FROM admins.vw_track_new t2
              WHERE t2.APPLINO = det.APPLINO
                AND t2.ULBID = det.ULBID
            )
        ) AS STATUS

      FROM admins.vw_applidet det

      WHERE TRUNC(det.APPLIDATE) >= :fromDate
        AND TRUNC(det.APPLIDATE) <= :toDate
        AND det.ULBID = :ulbId
    `;

    const binds = {
      fromDate,
      toDate,
      ulbId,
    };

    // =================================================
    // Ward-wise Application Details
    // =================================================
    if (wardId) {
      query += `
        AND det.DEPARTMENT = :deptId
        AND det.SERVICE = :servId
        AND det.WARDID = :wardId
      `;

      binds.deptId = deptId;
      binds.servId = servId;
      binds.wardId = wardId;
    }

    // =================================================
    // Department-wise Application Details
    // =================================================
    else {
      query += `
        AND det.SERVICE = :servId
      `;

      binds.servId = servId;
    }

    const result = await executeQueryTMC(query, binds);

    return {
      rows: result.rows || [],
      rowCount: result.rowCount || 0,
    };
  } catch (error) {
    console.error("Get Application Details Repo Error:", error);
    throw error;
  }
};

const getStepsRepo = async ({ appNo, ulbId }) => {
  try {
    let query = `
      SELECT ULBID, APPLINO, STEP, DESCRIPTION, DATETIME, STATUS
      from admins.vw_track
      where APPLINO = :appNo
      AND ULBID = :ulbId
    `;

    const binds = {
      appNo,
      ulbId,
    };

    const result = await executeQueryTMC(query, binds);
    console.log("result", result);

    return {
      rows: result.rows || [],
      rowCount: result.rowCount || 0,
    };
  } catch (error) {
    console.error("Get Steps Repo Error:", error);
    throw error;
  }
};

module.exports = {
  getDepartmentDetailsRepo,
  getServiceDetailsRepo,
  getWardWiseDetailsRepo,
  getApplicationDetailsRepo,
  getStepsRepo
};
