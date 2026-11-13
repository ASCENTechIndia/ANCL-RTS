const asyncHandler = require("../../libs/asyncHandler");
const { fail, ok } = require("../../libs/response");
const service = require("./Dashboard.service");

exports.decryptRequestController = asyncHandler(async (req, res) => {
        console.log("Decrypt Request:", req.query);
        const { request } = req.query;

        const data = await service.decryptRequestService({ encryptedRequest: request });

        if (!data.success) {
            return fail(res, data.message);
        }
        return ok(res, data, "Request decrypted successfully");
    }
    );

exports.getCorporationDetailsController = asyncHandler(
    async (req, res) => {
        console.log("Corporation Details Request:", req.query);
        const { corporationId } = req.query;

        if (!corporationId) {
            return fail(res, "corporationId is required");
        }

        const data = await service.getCorporationDetailsService({ corporationId, });

        if (!data.success) {
            return fail(res, data.message);
        }

        return ok(res, data, data.message || "Corporation details fetched successfully");
    }
);

exports.getEmployeeDepartmentMenuController = asyncHandler(
    async (req, res) => {
        console.log("Employee Department Menu Request:", req.query);
        const { userId, ulbId, deptId } = req.query;

        if (!userId) {
            return fail(res, "userId is required");
        }

        const data = await service.getEmployeeDepartmentMenuService({ userId, ulbId, deptId });

        if (!data.success) {
            return fail(res, data.message);
        }
        return ok(res, data, data.message || "Employee Department menu fetched successfully");
    }
);

exports.getDepartmentMenuController = asyncHandler(
    async (req, res) => {
        console.log("Department Menu Request:", req.query);
        const { ulbid } = req.query;

        if (!ulbid) {
            return fail(res, "ulbid is required");
        }

        const data = await service.getDepartmentMenuService({ ulbid });

        if (!data.success) {
            return fail(res, data.message);
        }

        return ok(res, data, data.message || "Department menu fetched successfully");
    }
);

exports.getServicesByDeptIdController = asyncHandler(
    async (req, res) => {
        console.log("Services By Department Request:", req.query);
        const { ulbid, deptId, } = req.query;

        if (!ulbid) {
            return fail(res, "ulbid is required");
        }

        if (!deptId) {
            return fail(res, "deptId is required");
        }

        const data = await service.getServicesByDeptIdService({ ulbid, deptId, });

        if (!data.success) {
            return fail(res, data.message);
        }

        return ok(res, data, data.message || "Services fetched successfully");
    }
);

exports.getDocumentsForServiceController = asyncHandler(
    async (req, res) => {
        console.log("Documents For Service Request:", req.query);
        const { serviceId, ulbid, } = req.query;

        if (!serviceId) {
            return fail(res, "serviceId is required");
        }

        if (!ulbid) {
            return fail(res, "ulbid is required");
        }

        const data = await service.getDocumentsForServiceService({ serviceId, ulbid });

        if (!data.success) {
            return fail(res, data.message);
        }

        return ok(res, data, data.message || "Service documents fetched successfully");
    }
);

exports.getInstructionsForServiceController = asyncHandler(
    async (req, res) => {
        console.log("Documents For Service Request:", req.query);
        const { serviceId } = req.query;

        if (!serviceId) {
            return fail(res, "serviceId is required");
        }

        const data = await service.getInstructionsForServiceService({ serviceId });

        if (!data.success) {
            return fail(res, data.message);
        }

        return ok(res, data, data.message || "Service documents fetched successfully");
    }
);

exports.getDownloadDocsController = asyncHandler(
    async (req, res) => {
        console.log("Download Documents Request:", req.query);
        const { serviceName, ulbid, } = req.query;

        if (!serviceName) {
            return fail(res, "serviceName is required");
        }

        if (!ulbid) {
            return fail(res, "ulbid is required");
        }

        const data = await service.getDownloadDocsService({ serviceName, ulbid });

        if (!data.success) {
            return fail(res, data.message);
        }
        return ok(res, data, data.message || "Download documents fetched successfully");
    }
);

exports.getServiceDetails = asyncHandler(async (req, res) => {

    if (!req.query.serviceId) {
        return fail(res, "serviceId is required");
    }
    const data = await service.getServiceDetails({serviceId: req.query.serviceId});

    return ok(res, data, "Service details fetched successfully");
});