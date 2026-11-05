const repo = require("./FrmWaterRegister.repo");

const getWardDropdownService = async (payload) => {
    console.log("Service: Fetch Ward Dropdown", payload);
    const data = await repo.getWardDropdownRepo(payload);

    if (!data || data.length === 0) {
        return { success: false, message: "No data Found", data: [] };
    }
    return { success: true, count: data.length, data };
};

const getServiceDropdownService = async (payload) => {
    console.log("Service: Fetch Service Dropdown", payload);
    const data = await repo.getServiceDropdownRepo(payload);

    if (!data || data.length === 0) {
        return { success: false, message: "No data Found", data: [] };
    }
    return { success: true, count: data.length, data };
};

const getDisconnectionDropdownService = async () => {
    console.log("Service: Fetch Disconnection Dropdown");
    const data = await repo.getDisconnectionDropdownRepo();

    if (!data || data.length === 0) {
        return { success: false, message: "No data Found", data: [] };
    }
    return { success: true, count: data.length, data };
};

const getUsageTypeDropdownService = async () => {
    console.log("Service: Fetch Usage Type Dropdown");
    const data = await repo.getUsageTypeDropdownRepo();

    if (!data || data.length === 0) {
        return { success: false, message: "No data Found", data: [] };
    }
    return { success: true, count: data.length, data };
};

const getConnectionSizeDropdownService = async () => {
    console.log("Service: Fetch Connection Size Dropdown");
    const data = await repo.getConnectionSizeDropdownRepo();

    if (!data || data.length === 0) {
        return { success: false, message: "No data Found", data: [] };
    }
    return { success: true, count: data.length, data };
};

const getWaterServiceNameService = async (payload) => {
    console.log("Service: Fetch Water Service Name");
    const data = await repo.getWaterServiceNameRepo(payload);

    if (!data || data.length === 0) {
        return { success: false, message: "No data Found", data: [] };
    }
    return { success: true, count: data.length, data };
};

const getWaterDocumentsService = async (payload) => {
    console.log("Service: Fetch Water Documents", payload);
    const data = await repo.getWaterDocumentsRepo(payload);

    if (!data || data.length === 0) {
        return { success: false, message: "No data Found", data: [] };
    }
    return { success: true, count: data.length, data };
};

const getWaterRegisterDetailsService = async (payload) => {
    console.log("Service: Fetch Water Register Details", payload);
    const data = await repo.getWaterRegisterDetailsRepo(payload);

    if (!data || data.length === 0) {
        return { success: false, message: "No data Found", data: [] };
    }
    return { success: true, count: data.length, data };
};

const getServicePayFlagService = async (payload) => {
    console.log("Service: Fetch Service Pay Flag");
    const data = await repo.getServicePayFlagRepo(payload);

    if (!data || data.length === 0) {
        return { success: false, message: "No data Found", data: [] };
    }
    return { success: true, count: data.length, data };
};

const saveWaterRegisterService = async (payload) => {
    console.log("Service: Save Water Register", payload);
    const result = await repo.saveWaterRegisterRepo(payload);
    console.log("Water Register Procedure Result:", result);
    const errorCode = Number(result?.Out_ErrorCode);

    if (errorCode !== 9999) {
        return {
            success: false,
            errorCode: result?.Out_ErrorCode,
            message: result?.Out_ErrorMsg || "Unable to save water register"
        };
    }

    return {
        success: true,
        errorCode: result.Out_ErrorCode,
        message: result.Out_ErrorMsg || "Water register saved successfully"
    };
};

const uploadWaterDocumentService = async (payload) => {
    console.log("Service: Upload Water Document",{corpid: payload.corpid, serviceid: payload.serviceid, appno: payload.appno, doctype: payload.doctype, documentid: payload.documentid});
    const result = await repo.uploadWaterDocumentRepo(payload);

    if (!result || !result.success) {
        return {success: false, message: result?.error || "Failed to upload document"};
    }
    return {success: true, message: "Document uploaded successfully", rowsAffected: result.rowCount || 0};
};

const getConnectionDetailsService = async ({userId, consumerNo, ulbId}) => {
    console.log("Service: Fetch Connection Details", {userId, consumerNo, ulbId});
    const result = await repo.getConnectionDetailsRepo({userId, consumerNo, ulbId});
    return result;
};

module.exports = {
    getWardDropdownService,
    getServiceDropdownService,
    getDisconnectionDropdownService,
    getUsageTypeDropdownService,
    getConnectionSizeDropdownService,
    getWaterServiceNameService,
    getWaterDocumentsService,
    getWaterRegisterDetailsService,
    getServicePayFlagService,
    saveWaterRegisterService,
    uploadWaterDocumentService,
    getConnectionDetailsService
};