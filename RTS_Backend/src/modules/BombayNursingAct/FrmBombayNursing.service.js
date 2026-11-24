const repo = require("./FrmBombayNursing.repo");

const getServiceListService = async ({ ulbID }) => {
  console.log("Service: Fetch Bombay Nursing Service List", { ulbID });

  if (!ulbID) {
    return {
      success: false,
      message: "ULB ID is required",
      data: [],
    };
  }

  const data = await repo.getServiceListRepo({ ulbID });

  if (!data || data.length === 0) {
    return {
      success: false,
      message: "No Bombay Nursing services found",
      data: [],
    };
  }

  return {
    success: true,
    count: data.length,
    data,
  };
};

const getWardListService = async ({ ulbID }) => {
  console.log("Service: Fetch Ward List", { ulbID });

  const data = await repo.getWardListRepo({ ulbID });

  if (!data || data.length === 0) {
    return {
      success: false,
      message: "No Ward records found",
      data: [],
    };
  }

  return {
    success: true,
    count: data.length,
    data,
  };
};

async function insertNursingService(data) {
  console.log("Service: Insert Bombay Nursing Application");

  const requiredFields = [
    ["zoneId", "Please Select valid Zone from the list"],
    ["servId", "Please Select Service Type"],
    ["appliFName", "Please Enter First Name"],
    ["appliMName", "Please Enter Middle Name"],
    ["appliLName", "Please Enter Last Name"],
    ["appliMobNo", "Please Enter Mobile Number"],
    ["appliEmailId", "Please Enter Email Address"],
    ["appliAadNo", "Please Enter Adhar Card Number"],
    ["appliPropNo", "Please Enter Property Number"],
    ["appliResNo", "Please Enter Residential Number"],
    ["hospName", "Please Enter Hospital Name"],
    ["hospMob", "Please Enter Mobile Number"],
    ["hosEmail", "Please Enter Email Address"],
    ["nocDoc", "Please Enter Document Number"],
    ["address", "Please Enter Address"],
    ["ulbID", "INVALID ULB ID"],
  ];

  for (const [field, message] of requiredFields) {
    if (data[field] === undefined || data[field] === null || String(data[field]).trim() === "") {
      return {
        success: false,
        message,
      };
    }
  }

  if (String(data.zoneId) === "0") {
    return {
      success: false,
      message: "Please Select valid Zone from the list",
    };
  }

  if (String(data.servId) === "0") {
    return {
      success: false,
      message: "Please Select Service Type",
    };
  }

  const mobileRegex = /^\d{10}$/;

  if (!mobileRegex.test(String(data.appliMobNo).trim())) {
    return {
      success: false,
      message: "Invalid Mobile No.",
    };
  }

  if (!mobileRegex.test(String(data.hospMob).trim())) {
    return {
      success: false,
      message: "Invalid Mobile No.",
    };
  }

  const emailRegex = /^[\w.-]+@([\w-]+\.)+[\w]{2,}$/;

  if (!emailRegex.test(String(data.appliEmailId).trim())) {
    return {
      success: false,
      message: "Invalid Email Address",
    };
  }

  if (!emailRegex.test(String(data.hosEmail).trim())) {
    return {
      success: false,
      message: "Invalid Email Address",
    };
  }

  const result = await repo.insertNursingRepo(data);

  const outBinds = result.outBinds || {};

  const errorCode = Number(outBinds.out_errcode);

  const errorMessage = outBinds.out_ErrMsg || "Nursing Application submission failed";

  const appNo = outBinds.out_AppliNo;

  if (errorCode !== 9999) {
    return {
      success: false,
      errorCode,
      message: errorMessage,
      appNo,
    };
  }

  return {
    success: true,
    errorCode,
    message: errorMessage,
    appNo,
  };
}

module.exports = {
  getServiceListService,
  getWardListService,
  insertNursingService,
};
