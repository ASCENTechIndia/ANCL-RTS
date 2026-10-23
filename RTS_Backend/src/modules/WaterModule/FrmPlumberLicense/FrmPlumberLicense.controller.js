const asyncHandler = require("../../../libs/asyncHandler");
const { fail, ok } = require("../../../libs/response");
const service = require("./FrmPlumberLicense.service");

exports.getEducationDropdownController = asyncHandler(
    async (req, res) => {
        console.log("Education Dropdown Request:", req.query);
        const data = await service.getEducationDropdownService();

        return ok(res, data, data.message || "Education dropdown fetched successfully");
    }
);

exports.savePlumberLicenseController = asyncHandler(
    async (req, res) => {
        console.log("Save Plumber License Request:", req.body);

        const { userId, licenseId, appliFName, appliMName, appliLName, mobNo, email, address, panNo, education, tectQuali, businessName, tradeLicenceNo, ulbid, servid, zoneId, source, detAppliName, detMobile, detAadhaar, detEmail, detAddress } = req.body;

        if (!userId) {
            return fail(res, "User ID is required");
        }
        if (!appliFName) {
            return fail(res, "First name is required");
        }
        if (!appliMName) {
            return fail(res, "Middle name is required");
        }
        if (!appliLName) {
            return fail(res, "Last name is required");
        }
        if (!mobNo) {
            return fail(res, "Mobile number is required");
        }
        if (!email) {
            return fail(res, "Email is required");
        }
        if (!address) {
            return fail(res, "Address is required");
        }
        if (!panNo) {
            return fail(res, "PAN number is required");
        }
        if (!education) {
            return fail(res, "Education is required");
        }
        if (!tectQuali) {
            return fail(res, "Technical qualification is required");
        }
        if (!businessName) {
            return fail(res, "Business name is required");
        }
        if (!ulbid) {
            return fail(res, "ulbid is required");
        }
        if (!servid) {
            return fail(res, "servid is required");
        }
        if (!zoneId) {
            return fail(res, "zoneId is required");
        }
        if (!source) {
            return fail(res, "source is required");
        }
        if (!detAppliName) {
            return fail(res, "Applicant detail name is required");
        }

        if (!detMobile) {
            return fail(res, "Applicant detail mobile is required");
        }

        if (!detAadhaar) {
            return fail(res, "Applicant detail Aadhaar is required");
        }

        if (!detEmail) {
            return fail(res, "Applicant detail email is required");
        }

        if (!detAddress) {
            return fail(res, "Applicant detail address is required");
        }


        const data = await service.savePlumberLicenseService({
            userId,
            licenseId: licenseId ?? 0,
            appliFName,
            appliMName,
            appliLName,
            mobNo,
            email,
            address,
            panNo,
            education,
            tectQuali,
            businessName,
            tradeLicenceNo: tradeLicenceNo,
            ulbid,
            servid,
            zoneId,
            source,
            detAppliName,
            detMobile,
            detAadhaar,
            detEmail,
            detAddress,
        });


        if (!data.success) {
            return fail(res, data.message);
        }

        return ok(res, data, data.message || "Plumber license saved successfully");
    }
);

exports.renewPlumberLicenseController = asyncHandler(
    async (req, res) => {
        console.log("Renew Plumber License Request:", req.body);

        const {
            userId,
            licenseId,
            tradeLicenceNo,
            ulbid,
            servid,
            source,
            renewdt,
            fromdt,
            todt,
            appliFName,
            appliMName,
            appliLName,
            detMobile,
            detEmail,
            detAddress,
            zoneid,
            appliDOB,
            appliScndMobNo,
            appliEducation,
            appliLcnDate,
            appliFNameMar,
            appliMNameMar,
            appliLNameMar,
            detAddressMar,
        } = req.body;

        const textOrDot = (value) => value == null || String(value).trim() === "" ? "." : String(value).trim();

        if (!userId) {
            return fail(res, "User ID is required");
        }

        if (!tradeLicenceNo?.trim()) {
            return fail(res, "Plumber License No is required");
        }

        if (!ulbid) {
            return fail(res, "ulbid is required");
        }

        if (!servid) {
            return fail(res, "servid is required");
        }

        if (!source) {
            return fail(res, "source is required");
        }

        if (!renewdt || !fromdt || !todt) {
            return fail(res, "Renewal date, From date and To date are required");
        }

        if (new Date(fromdt) > new Date(todt)) {
            return fail(res, "From Date cannot be greater than To Date");
        }

        if (!appliFName?.trim()) {
            return fail(res, "First name is required");
        }

        if (!appliMName?.trim()) {
            return fail(res, "Middle name is required");
        }

        if (!appliLName?.trim()) {
            return fail(res, "Last name is required");
        }

        if (!/^\d{10}$/.test(String(detMobile ?? ""))) {
            return fail(res, "Please enter valid Mobile No.");
        }

        if (!detEmail?.trim()) {
            return fail(res, "Applicant detail email is required");
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(detEmail.trim())) {
            return fail(res, "Please enter valid Email Address");
        }

        const payload = {
            userId: String(userId),
            licenseId: licenseId ?? 0,
            tradeLicenceNo: tradeLicenceNo.trim(),
            ulbid: Number(ulbid),
            servid: Number(servid),
            source,
            renewdt,
            fromdt,
            todt,
            appliFName: appliFName.trim(),
            appliMName: appliMName.trim(),
            appliLName: appliLName.trim(),
            detMobile: String(detMobile).trim(),
            detEmail: detEmail.trim(),
            detAddress: detAddress.trim(),
            zoneid: Number(zoneid) || 0,
            appliDOB: appliDOB || null,
            appliScndMobNo: appliScndMobNo ?? 0,
            appliEducation: textOrDot(appliEducation),
            appliLcnDate: appliLcnDate || null,
            appliFNameMar: textOrDot(appliFNameMar),
            appliMNameMar: textOrDot(appliMNameMar),
            appliLNameMar: textOrDot(appliLNameMar),
            detAddressMar: textOrDot(detAddressMar),
        };

        const data = await service.renewPlumberLicenseService(payload);

        if (!data?.success) {
            return fail(res, data?.message || "Plumber license renewal failed");
        }

        if (Number(data?.errorCode) !== 9999) {
            return fail(res, data?.message || "Plumber license renewal failed");
        }

        return ok(res, data, data.message || "Plumber license renewed successfully");
    }
);