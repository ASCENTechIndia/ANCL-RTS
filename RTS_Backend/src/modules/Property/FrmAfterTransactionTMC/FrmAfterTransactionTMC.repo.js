const { executeQueryTMC } = require("../../../db/queryExecutor");

// ============================================================
// GET PAYMENT ACKNOWLEDGEMENT DETAILS
// ============================================================
const getPaymentAcknowledgementRepo = async (data) => {
  try {
    const query = `
       SELECT
        var_application_appno appno,
        num_application_noofcopy noofcopy,
        num_application_amount amount,

        var_appliaction_recieptno recieptno,
        var_application_recieptrefno recieptrefno,
        dat_application_recieptdate recieptdate,

        var_service_eng_name || '/' || var_service_mar_name servicename,

        var_appl_firstname || ' ' ||
        var_appl_middlename || ' ' ||
        var_appl_lastname appliname,

        var_appl_mfirstname || ' ' ||
        var_appl_mmiddlename || ' ' ||
        var_appl_mlastname applinamar,

        var_appl_address address,
        var_appl_maddress addressmar

      FROM aorts_application_det

      INNER JOIN aorts_service_def
        ON num_service_serviceid = num_application_serviceid

      INNER JOIN aorts_applicant_infodet
        ON num_appl_corpid = num_application_corpid
        AND num_appl_serviceid = num_application_serviceid
        AND var_appl_appno = var_application_appno

      WHERE num_application_serviceid = :serviceId
        AND var_application_appno = :appNo
        AND var_application_status <> 'PP'
    `;

    const binds = {
      serviceId: Number(data.serviceId),
      appNo: data.appNo,
    };

    const result = await executeQueryTMC(query, binds);

    return {
      success: true,
      rows: result.rows || [],
      rowCount: result.rowCount || 0,
    };
  } catch (err) {
    return {
      success: false,
      error: err.message,
      rows: [],
      rowCount: 0,
    };
  }
};

module.exports = {
  getPaymentAcknowledgementRepo,
};
