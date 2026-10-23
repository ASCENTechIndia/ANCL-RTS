const { executeQueryTMC } = require("../../../db/queryExecutor");

async function fetchDepartments() {
  const sql = `
    SELECT var_dept_engname AS deptname, num_dept_id AS deptid
    FROM admins.aoms_dept_mas
    WHERE num_dept_id IN (1,7,23,25,10,24,841,26,1041,503,1042,725,689,683,3)
    ORDER BY var_dept_engname
  `;
  
  const result = await executeQueryTMC(sql);
  return result.rows || [];
}

async function fetchApplicationsSummary({ fromDate, toDate, deptId }) {
  console.log("depatment id ", deptId)
  console.log(typeof(deptId));
  const binds = {fromDate, toDate};

  let sql = `
    SELECT 
      num_application_serviceid AS serviceid,
      var_service_eng_name AS servicename,
      SUM(num_application_amount) AS amount,
      COUNT(num_application_amount) AS appcount
    FROM aorts_application_det
    INNER JOIN aorts_service_def 
      ON num_service_serviceid = num_application_serviceid
    WHERE 1=1
      AND TRUNC(dat_application_recieptdate) >= TO_DATE(:fromDate, 'dd/MM/yyyy')
      AND TRUNC(dat_application_recieptdate) <= TO_DATE(:toDate, 'dd/MM/yyyy')
      AND var_application_recieptrefno IS NOT NULL
    group by num_application_serviceid,var_service_eng_name
  `;

  if (deptId !== 0) {
    sql += ` AND num_application_deptid = :deptId `;
    binds.deptId = deptId;
  }

  sql += ` GROUP BY num_application_serviceid, var_service_eng_name`;

  console.log("SQL", sql);

  console.log("binds: ", binds);

  const result = await executeQueryTMC( sql, binds );
  console.log("result: ", result);
  return result.rows || [];
}

async function fetchApplicationsDetail({ fromDate, toDate, serviceId, deptId }) {

  const binds = {fromDate, toDate, serviceId};

  let sql = `
    SELECT 
      var_application_appno AS appno,
      var_user_fname AS name,
      num_application_noofcopy AS noofcopy,
      num_application_amount AS amount,
      CASE  
        WHEN var_application_status = 'CP' THEN 'Authorisation Pending'
        WHEN var_application_status = 'CR' THEN 'Authorisation Reject'
        WHEN var_application_status = 'PP' THEN 'Payment Pending'
        WHEN var_application_status = 'NW' THEN 'New Registration'
        WHEN var_application_status = 'IP' THEN 'In Progress'
        WHEN var_application_status = 'AP' THEN 'Approved'
        WHEN var_application_status = 'DN' THEN 'Denied'
        WHEN var_application_status = 'VP' THEN 'Verification Pending'
        WHEN var_application_status = 'DL' THEN 'Delivered'
      END AS status,
      var_appliaction_recieptno AS recno,
      var_application_recieptrefno AS billdesk_refno,
      dat_application_recieptdate AS recdate,
      var_user_emailid AS emailid,
      num_user_mobileno AS mobno
    FROM aorts_application_det
    INNER JOIN aorts_user_def  
      ON var_application_userid = num_user_uniqueid 
    INNER JOIN aorts_tmcservice_def 
      ON num_service_serviceid = num_application_serviceid
    WHERE TRUNC(dat_application_recieptdate) >= TO_DATE(:fromDate, 'dd/MM/yyyy')
      AND TRUNC(dat_application_recieptdate) <= TO_DATE(:toDate, 'dd/MM/yyyy')
      AND num_application_serviceid = :serviceId
  `;

   if (deptId !== 0) {
    sql += ` AND num_application_deptid = :deptId `;
    binds.deptId = deptId;
  }

  sql += ` AND var_application_recieptrefno IS NOT NULL
    ORDER BY dat_application_recieptdate`;

 

  const result = await executeQueryTMC( sql, binds );
  return result;
}

module.exports = { fetchDepartments, fetchApplicationsSummary,fetchApplicationsDetail };
