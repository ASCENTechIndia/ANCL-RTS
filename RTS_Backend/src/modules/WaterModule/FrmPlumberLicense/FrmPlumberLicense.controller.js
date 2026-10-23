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

        const {userId, licenseId, tradeLicenceNo, ulbid, servid, source, renewdt, fromdt, todt, appliFName, appliMName, appliLName, detMobile, detAadhaar, detEmail, detAddress} = req.body;


        if (!userId) {
            return fail(res, "User ID is required");
        }
        if (!tradeLicenceNo) {
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
        if (!renewdt) {
            return fail(res, "Renewal date is required");
        }
        if (!fromdt) {
            return fail(res, "From date is required");
        }
        if (!todt) {
            return fail(res, "To date is required");
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


        const data =
            await service.renewPlumberLicenseService({
                userId,
                licenseId: licenseId ?? 0,
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
                detAadhaar,
                detEmail,
                detAddress,
            });


        if (!data.success) {
            return fail(res, data.message);
        }

        return ok(res, data, data.message || "Plumber license renewed successfully");
    }
);