const asyncHandler = require("../../../libs/asyncHandler");
const { fail, ok } = require("../../../libs/response");
const service = require("./FrmWaterRegister.service");

exports.getWardDropdownController = asyncHandler(
    async (req, res) => {
        console.log("Ward Dropdown Request:", req.query);
        const { ulbid } = req.query;

        if (!ulbid) {
            return fail(res, "ulbid is required");
        }

        const data = await service.getWardDropdownService({ulbid});
        return ok( res, data, data.message || "Ward dropdown fetched successfully" );
    }
);

exports.getServiceDropdownController = asyncHandler(
    async (req, res) => {
        console.log("Service Dropdown Request:", req.query);
        const { rptMode } = req.query;

        if (rptMode === undefined || rptMode === null ) { return fail(res, "rptMode is required");}

        const data = await service.getServiceDropdownService({ rptMode});
        return ok( res, data, data.message || "Service dropdown fetched successfully");
    }
);

exports.getDisconnectionDropdownController = asyncHandler(
    async (req, res) => {
        console.log("Disconnection Dropdown Request");

        const data = await service.getDisconnectionDropdownService();

        return ok(res, data, data.message || "Disconnection dropdown fetched successfully");
    }
);

exports.getUsageTypeDropdownController = asyncHandler(
    async (req, res) => {
        console.log("Usage Type Dropdown Request");
        const data = await service.getUsageTypeDropdownService();
        return ok( res, data, data.message || "Usage type dropdown fetched successfully");
    }
);

exports.getConnectionSizeDropdownController = asyncHandler(
    async (req, res) => {
        console.log("Connection Size Dropdown Request");
        const data = await service.getConnectionSizeDropdownService();
        return ok( res, data, data.message || "Connection size dropdown fetched successfully");
    }
);

exports.getWaterServiceNameController = asyncHandler(
    async (req, res) => {
        console.log("Water Service Name Request", req.query);
        const { serviceId } = req.query;
        if (!serviceId) { return fail(res, "serviceId is required"); }
        const data = await service.getWaterServiceNameService({serviceId});
        return ok(res, data, data.message || "Water service name fetched successfully");
    }
);

exports.getWaterDocumentsController = asyncHandler(
    async (req, res) => {
        console.log("Water Documents Request:", req.query);
        const { ulbid, serviceId } = req.query;

        if (!ulbid) { return fail(res, "ulbid is required"); }
        if (!serviceId) { return fail(res, "serviceId is required"); }

        const data = await service.getWaterDocumentsService({ ulbid, serviceId });
        return ok( res, data, data.message || "Water documents fetched successfully" );
    }
);

exports.getWaterRegisterDetailsController = asyncHandler(
    async (req, res) => {
        console.log( "Water Register Details Request:", req.query );
        const { rtsno } = req.query;

        if (!rtsno) { return fail(res, "rtsno is required"); }

        const data = await service.getWaterRegisterDetailsService({ rtsno });
        return ok( res, data, data.message || "Water register details fetched successfully" );
    }
);

exports.getServicePayFlagController = asyncHandler(
    async (req, res) => {
        console.log("Service Pay Flag Request", req.query);
        const { serviceId } = req.query;
        if (!serviceId) { return fail(res, "serviceId is required"); }

        const data = await service.getServicePayFlagService({serviceId});
        return ok(res, data, data.message || "Service pay flag fetched successfully");
    }
);

exports.saveWaterRegisterController = asyncHandler(
    async (req, res) => {
        console.log("Save Water Register Request:", req.body);

        const {userId, wtregId, servId, consNo, disConId, reason, usageTypeId, tarifRate, connSize, remark, ulbid, zoneId, source, ownerName, usageType, detAppliName, detMobile, detAadhaar, detEmail, detAddress, conAddressSrch, ownerNameSrch, curConSizeSrch, usageTypeNewSrch, erlDate} = req.body;


        if (!userId) {
            return fail(res, "userId is required");
        }
        if (!servId) {
            return fail(res, "servId is required");
        }
        if (!consNo) {
            return fail(res, "consNo is required");
        }
        if (!ulbid) {
            return fail(res, "ulbid is required");
        }
        if (!zoneId) {
            return fail(res, "zoneId is required");
        }
        if (!detAppliName) {
            return fail(res, "detAppliName is required");
        }
        if (!detMobile) {
            return fail(res, "detMobile is required");
        }
        if (!detAadhaar) {
            return fail(res, "detAadhaar is required");
        }
        if (!detAddress) {
            return fail(res, "detAddress is required");
        }


      const data = await service.saveWaterRegisterService({
            userId,
            wtregId: wtregId ?? 0,
            servId,
            consNo,
            disConId,
            reason,
            usageTypeId,
            tarifRate,
            connSize,
            remark,
            ulbid,
            zoneId,
            source,
            ownerName,
            usageType,
            detAppliName,
            detAddress,
            inStr: null,
        });


        if (!data.success) {
            return fail(res, data.message || "Unable to save water register");
        }

        return ok(res, data, data.message || "Water register saved successfully");
    }
);

exports.uploadWaterDocumentController = asyncHandler(
    async (req, res) => {
        console.log("Upload Water Document Request:", req.body);
        const {corpid, serviceid, appno, doctype, documentid} = req.body;


        if (!corpid) {
            return fail(res, "corpid is required");
        }
        if (!serviceid) {
            return fail(res, "serviceid is required");
        }
        if (!appno) {
            return fail(res, "appno is required");
        }
        if (!doctype) {
            return fail(res, "doctype is required");
        }
        if (!documentid) {
            return fail(res, "documentid is required");
        }
        if (!req.file) {
            return fail(res, "Document file is required");
        }


        const data = await service.uploadWaterDocumentService({corpid, serviceid, appno, doctype, documentid, fileBuffer: req.file.buffer});


        if (!data.success) {
            return fail(res, data.message || "Failed to upload document");
        }


        return ok(res, data, data.message || "Document uploaded successfully");
    }
);

exports.getConnectionDetailsController = asyncHandler(
    async (req, res) => {
        const {consumerNo, userId} = req.query;

        if (!consumerNo) {
            throw new AppError("Consumer No is required", 400);
        }
        if (!userId) {
            throw new AppError("User ID is required", 400);
        }

        const result = await service.getConnectionDetailsService({userId, consumerNo});
        return res.status(200).json({ok: true, message: "Connection details fetched successfully", data: result});
    }
);