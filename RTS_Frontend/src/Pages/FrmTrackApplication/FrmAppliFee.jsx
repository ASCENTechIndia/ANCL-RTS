import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Formik, Form } from "formik";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import config from "@/utils/config";

const FrmAppliFee = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, token } = useAuth();
    const baseUrl = import.meta.env.VITE_BASE_URL;
    console.log({ location, user })
    const appNo = location.state?.appNo || "TMCPTXAC2502250002";
    const serviceId = Number(location.state?.serviceId);
    const ulbId = Number(location.state?.ulbId ?? user?.ulbId);
    const corpId = Number(location.state?.corpId);
    const userUniqueId = Number(location.state?.userUniqueId ?? user?.userUniqueId);
    const trackId = location.state?.trackId ?? user?.trackId ?? "12345";
    const userIdMahaOnline = location.state?.userIdMahaOnline ?? user?.mahaOnlineUserId ?? "MAHA123";
    const username = user?.username;
    console.log({ username })
    const userFullName = location.state?.userFullName;
    const serviceName = location.state?.serviceName;

    const [application, setApplication] = useState(null);
    const [property, setProperty] = useState(null);
    const [assessment, setAssessment] = useState(null);
    const [applicant, setApplicant] = useState(null);
    const [applicationSource, setApplicationSource] = useState(null);
    const [userDetails, setUserDetails] = useState(null);
    const [mahaUser, setMahaUser] = useState(null);

    const initialValues = {
        appNo,
        amount: "",
        noOfCopy: "",
        receiptRefNo: "",
        applicantName: "",
        mobileNo: "",
        email: "",
        address: "",
        propertyNo: "",
        propertyType: "",
        usageType: "",
        area: ""
    };

    const formatOracleDate = (value) => {
        if (!value) return null;
        const date = new Date(value);

        if (Number.isNaN(date.getTime())) { return null; }

        const day = String(date.getDate()).padStart(2, "0");
        const month = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"][date.getMonth()];
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    const getData = (result) => {
        if (result.status !== "fulfilled") {
            return [];
        }

        return result.value?.data?.data?.data || [];
    };

    const loadApplicationDetails = useCallback(async () => {
        if (!appNo) {
            await Swal.fire({
                // icon: "warning",
                text: "Application No. is required."
            });
            return;
        }

        Swal.fire({
            text: "Loading...",
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false,
            didOpen: () => Swal.showLoading()
        });

        try {
            const requests = [
                axios.get(`${baseUrl}/api/FrmAppliFee/property-details`,
                    {
                        params: { appNo },
                        headers: { Authorization: `Bearer ${token}` }
                    }
                ),
                axios.get(`${baseUrl}/api/FrmAppliFee/applicant-details`,
                    {
                        params: { appNo },
                        headers: { Authorization: `Bearer ${token}` }
                    }
                ),
                axios.get(`${baseUrl}/api/FrmAppliFee/application-details`,
                    {
                        params: { appNo, serviceId },
                        headers: { Authorization: `Bearer ${token}` }
                    }
                ),
                axios.get(`${baseUrl}/api/FrmAppliFee/application-source`,
                    {
                        params: { appNo, serviceId },
                        headers: { Authorization: `Bearer ${token}` }
                    }
                ),
                axios.get(`${baseUrl}/api/FrmAppliFee/user-details`,
                    {
                        params: { userUniqueId },
                        headers: { Authorization: `Bearer ${token}` }
                    }
                )
            ];

            if (serviceId === 2) {
                requests.push(axios.get(`${baseUrl}/api/FrmAppliFee/property-assessment`,
                    { params: { appNo }, headers: { Authorization: `Bearer ${token}` } }
                )
                );
            }

            if (trackId) {
                requests.push(axios.get(`${baseUrl}/api/FrmAppliFee/maha-user-details`,
                    {
                        params: { trackId },
                        headers: { Authorization: `Bearer ${token}` }
                    }
                )
                );
            }

            const results = await Promise.allSettled(requests);

            const propertyData = getData(results[0])[0] || null;
            const applicantData = getData(results[1])[0] || null;
            const applicationData = getData(results[2])[0] || null;
            const sourceData = getData(results[3])[0] || null;
            const userData = getData(results[4])[0] || null;

            let resultIndex = 5;
            let assessmentData = null;
            let mahaUserData = null;

            if (serviceId === 2) {
                assessmentData = getData(results[resultIndex])[0] || null;
                resultIndex++;
            }

            if (trackId) {
                mahaUserData = getData(results[resultIndex])[0] || null;
            }

            if (!applicationData) {
                throw new Error("Application details not found.");
            }

            setProperty(propertyData);
            setApplicant(applicantData);
            setApplication(applicationData);
            setApplicationSource(sourceData);
            setUserDetails(userData);
            setAssessment(assessmentData);
            setMahaUser(mahaUserData);

            Swal.close();
        } catch (error) {
            Swal.close();

            await Swal.fire({
                icon: "error",
                text: error?.response?.data?.message || error?.message || "Unable to load application details."
            });
        }
    }, [appNo, baseUrl, serviceId, token, trackId, userUniqueId]);

    useEffect(() => {
        if (token) {
            loadApplicationDetails();
        }
    }, [loadApplicationDetails, token]);

    const amount = Number(application?.AMOUNT ?? property?.NUM_APPLICATION_AMOUNT ?? 0);
    const noOfCopy = application?.NOOFCOPY ?? property?.NUM_APPLICATION_NOOFCOPY ?? 0;
    const applicantName = applicant?.APPLICANTNAME || property?.VAR_PROPTRANS_NEWOWNNAME || assessment?.VAR_PROPASSESS_APPLINAME || "-";
    const mobileNo = applicant?.VAR_APPL_MOBNO || property?.NUM_PROPTRANS_APPMOBILE || assessment?.NUM_PROPASSESS_APPLIMOB || userDetails?.MOBILENO || mahaUser?.MOBILENO || "-";
    const email = applicant?.VAR_APPL_EMAIL || property?.VAR_PROPTRANS_APPEMAIL || assessment?.VAR_PROPASSESS_APPLIEMAIL || userDetails?.EMAILID || user?.email || "-";
    const address = applicant?.VAR_APPL_ADDRESS || property?.VAR_PROPTRANS_APPADDRESS || assessment?.VAR_PROPASSESS_ADDRESS || "-";
    const propertyNo = property?.VAR_PROPASSESS_PROPNO || property?.VAR_PROPTRANS_PROPNO || assessment?.VAR_PROPASSESS_PROPNO || "-";
    const propertyType = property?.VAR_PROPTRANS_PROPTYPE || assessment?.VAR_PROPASSESS_STRUCTURE || "-";
    const usageType = assessment?.NUM_PROPASSESS_USAGETYPE || "-";
    const area = property?.VAR_PROPTRANS_AREAOFPROP || assessment?.NUM_PROPASSESS_AREA || "-";
    const isMahaPayment = String(applicationSource?.APPSOURCE || "").toUpperCase() === "MAHA" && String(applicationSource?.MAHAPAY || "").toUpperCase() === "N";

    const createPaymentSession = async () => {
        if (!appNo) {
            await Swal.fire({ text: "Application No. can not be blank." });
            return null;
        }

        if (!userUniqueId) {
            await Swal.fire({ text: "User Unique Id can not be blank." });
            return null;
        }

        if (!username) {
            await Swal.fire({ text: "Username can not be blank." });
            return null;
        }

        if (!userFullName) {
            await Swal.fire({ text: "User Full Name can not be blank." });
            return null;
        }

        if (!trackId) {
            await Swal.fire({ text: "Track Id can not be blank." });
            return null;
        }

        if (!userIdMahaOnline) {
            await Swal.fire({ text: "MahaOnline User Id can not be blank." });
            return null;
        }

        if (!serviceId) {
            await Swal.fire({ text: "Service Id can not be blank." });
            return null;
        }

        if (!serviceName) {
            await Swal.fire({ text: "Service can not be blank." });
            return null;
        }

        Swal.fire({
            text: "Creating Payment Session...",
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false,
            didOpen: () => Swal.showLoading()
        });

        try {
            const payload = {
                ulbId,
                corpId,
                userUniqueId,
                username: user?.email,
                userFullName,
                trackId,
                userIdMahaOnline,
                lastLogin: formatOracleDate(location.state?.lastLogin ?? user?.lastLogin),
                lastLogout: formatOracleDate(location.state?.lastLogout ?? new Date()),
                serviceId,
                service: serviceName,
                marrageregis: location.state?.marrageregis ?? "1~2~",
                step: 2,
                appNo,
                paymentReq: "NA",
                amount
            };

            const response = await axios.post(`${baseUrl}/api/FrmAppliFee/payment-session`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const result = response?.data?.data;

            if (!result?.success || Number(result?.errorCode) !== 9999) {
                throw new Error(
                    result?.message ||
                    response?.data?.message ||
                    "Unable to create payment session."
                );
            }

            Swal.close();

            return result.message;
        } catch (error) {
            Swal.close();

            await Swal.fire({
                icon: "error",
                text: error?.response?.data?.message || error?.message || "Unable to create payment session."
            });

            return null;
        }
    };

    const handlePayment = async () => {
        const transactionId = await createPaymentSession();

        if (!transactionId) {
            return;
        }

        const paymentUrl = import.meta.env.VITE_PAYMENT_POST_URL;
        const companyCode = import.meta.env.VITE_PAYMENT_COMPANY_CODE;
        const frontendUrl = import.meta.env.VITE_FRONTEND_URL;
        console.log({ paymentUrl, companyCode, frontendUrl, transactionId })
        if (!paymentUrl) {
            await Swal.fire({
                icon: "error",
                text: "Payment gateway URL is not configured."
            });
            return;
        }
        if (!frontendUrl) {
            await Swal.fire({
                icon: "error",
                text: "Frontend URL is not configured."
            });
            return;
        }

        if (!companyCode) {
            await Swal.fire({
                icon: "error",
                text: "Payment company code is not configured."
            });
            return;
        }

        // const returnUrl = `${frontendUrl}/app/FrmAfterTransactionTMC`;
        const returnUrl = `${baseUrl}/api/payment-response`;

        const address = "";
        const city = "";
        const state = "";
        const pincode = "";
        const country = "IND";
        const delivery_name = "";
        const AscDept = config?.deptId;
        const delivery_addr = "";
        const delivery_city = "";
        const delivery_state = "";
        const delivery_zip = "";
        const delivery_country = "";
        const delivery_tel = "";
        const merchant_param1 = "";
        const merchant_param2 = "";
        const merchant_param3 = "";
        const merchant_param4 = "";
        const merchant_param5 = "";
        const promo_code = "";

        const paymentEmail = user?.email;

        console.log({paymentEmail})
        const paymentMobile = mobileNo;

        const msg = [ulbId, transactionId, amount, returnUrl, username, address, city, state, pincode, country, paymentMobile, paymentEmail, delivery_name, delivery_addr, delivery_city, delivery_state, delivery_zip, delivery_country, delivery_tel, merchant_param1, merchant_param2, merchant_param3, merchant_param4, merchant_param5, promo_code, AscDept ].join("|");
        // const msg = [companyCode, transactionId, amount, returnUrl, username , address, city, state, pincode, paymentEmail, paymentMobile].join("|");

        console.log("Payment Gateway Request", { paymentUrl, transactionId, returnUrl, msg });

        const confirmed = await Swal.fire({
            // icon: "success",
            // text: `Transaction No. : ${transactionId}`,
            text: `Redirecting for Payment`,
            confirmButtonText: "Continue",
            // timer: 1500,
            allowOutsideClick: false
        });

        if (!confirmed.isConfirmed) {
            return;
        }

        const form = document.createElement("form");

        form.method = "POST";
        form.action = paymentUrl;
        form.style.display = "none";

        const input = document.createElement("input");

        input.type = "hidden";
        input.name = "msg";
        input.value = msg;

        form.appendChild(input);
        document.body.appendChild(form);

        form.submit();
    };

    const handleAaplePayment = async () => {
        if (!appNo) {
            await Swal.fire({
                // icon: "warning",
                text: "Application No. can not be blank."
            });
            return;
        }

        if (!amount || amount <= 0) {
            await Swal.fire({
                // icon: "warning",
                text: "Valid payment amount is not available."
            });
            return;
        }

        if (!userUniqueId) {
            await Swal.fire({
                // icon: "warning",
                text: "User Unique Id can not be blank."
            });
            return;
        }

        if (!username) {
            await Swal.fire({
                // icon: "warning",
                text: "Username can not be blank."
            });
            return;
        }

        if (!userFullName) {
            await Swal.fire({
                // icon: "warning",
                text: "User Full Name can not be blank."
            });
            return;
        }

        if (!trackId) {
            await Swal.fire({
                // icon: "warning",
                text: "Track Id can not be blank."
            });
            return;
        }

        if (!userIdMahaOnline) {
            await Swal.fire({
                // icon: "warning",
                text: "MahaOnline User Id can not be blank."
            });
            return;
        }

        Swal.fire({
            title: "Processing Aaple Sarkar Payment...",
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false,
            didOpen: () => Swal.showLoading()
        });

        try {
            const payload = {
                ulbId,
                corpId,
                userUniqueId,
                username,
                userFullName,
                trackId,
                userIdMahaOnline,
                lastLogin: location.state?.lastLogin ?? user?.lastLogin ?? "",
                lastLogout: location.state?.lastLogout ?? user?.lastLogout ?? "",
                serviceId,
                service: serviceName,
                marrageregis: location.state?.marrageregis ?? "1~2~",
                step: 0,
                appNo,
                paymentReq: "NA",
                amount,
                mobileNo,
                email,
                applicantName,
                appSource: applicationSource?.APPSOURCE || "",
                mahaPay: applicationSource?.MAHAPAY || ""
            };

            const response = await axios.post(
                `${baseUrl}/api/FrmAppliFee/aaple-payment`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const result = response?.data?.data;

            if (!result?.success) {
                throw new Error(result?.message || response?.data?.message || "Unable to process Aaple Sarkar payment.");
            }
            Swal.close();

            if (result.paymentUrl) {
                window.location.href = result.paymentUrl;
                return;
            }

            await Swal.fire({
                icon: "success",
                text: result.message || "Aaple Sarkar payment request created successfully."
            });
        } catch (error) {
            Swal.close();

            await Swal.fire({
                icon: "error",
                text: error?.response?.data?.message || error?.message || "Unable to process Aaple Sarkar payment."
            });
        }
    };

    return (
        <Formik
            initialValues={{ ...initialValues, amount, noOfCopy, receiptRefNo: application?.RECIEPTREFNO || "", applicantName, mobileNo, email, address, propertyNo, propertyType, usageType, area }}
            enableReinitialize
            onSubmit={handlePayment}
        >
            {({ values }) => (
                <Form className="w-full">
                    <Card className="w-full">
                        <CardHeader className="border-b">
                            <CardTitle className="text-lg font-semibold text-[#083c76]">{serviceName}</CardTitle>
                        </CardHeader>

                        <CardContent className="px-5">
                            <div className="grid grid-cols-1 gap-x-12 gap-y-3 md:grid-cols-2">
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                                    <div className="flex shrink-0 items-center sm:w-40 sm:justify-between">
                                        <Label text="Application No./ अर्ज क्रमांक" className="min-w-fit" />
                                        <span>:</span>
                                    </div>
                                    <Input value={values.appNo} readOnly className="w-full bg-gray-50" />
                                </div>

                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                                    <div className="flex shrink-0 items-center sm:w-40 sm:justify-between">
                                        <Label text="Applicant Name/ अर्जदाराचे नाव" className="min-w-fit" />
                                        <span>:</span>
                                    </div>
                                    <Input value={values.applicantName} readOnly className="w-full bg-gray-50" />
                                </div>

                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                                    <div className="flex shrink-0 items-center sm:w-40 sm:justify-between">
                                        <Label text="Mobile No./ मोबाईल क्रमांक" className="min-w-fit" />
                                        <span>:</span>
                                    </div>
                                    <Input value={values.mobileNo} readOnly className="w-full bg-gray-50" />
                                </div>

                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                                    <div className="flex shrink-0 items-center sm:w-40 sm:justify-between">
                                        <Label text="Email/ ई-मेल" className="min-w-fit" />
                                        <span>:</span>
                                    </div>
                                    <Input value={values.email} readOnly className="w-full bg-gray-50" />
                                </div>

                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4 md:col-span-2">
                                    <div className="flex shrink-0 items-center sm:w-40 sm:justify-between">
                                        <Label text="Address/ पत्ता" className="min-w-fit" />
                                        <span>:</span>
                                    </div>
                                    <Input value={values.address} readOnly className="w-full bg-gray-50" />
                                </div>
                            </div>

                            <div className="my-5 border-t border-gray-200" />

                            <div className="grid grid-cols-1 gap-x-12 gap-y-3 md:grid-cols-2">
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                                    <div className="flex shrink-0 items-center sm:w-40 sm:justify-between">
                                        <Label text="No. of Copies/ एकूण प्रती" className="min-w-fit" />
                                        <span>:</span>
                                    </div>
                                    <Input value={values.noOfCopy} readOnly className="w-full bg-gray-50" />
                                </div>

                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                                    <div className="flex shrink-0 items-center sm:w-40 sm:justify-between">
                                        <Label text="Amount/ रक्कम" className="min-w-fit" />
                                        <span>:</span>
                                    </div>
                                    <Input value={values.amount} readOnly className="w-full bg-gray-50" />
                                </div>

                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                                    <div className="flex shrink-0 items-center sm:w-40 sm:justify-between">
                                        <Label text="Receipt Ref. No./ पावती क्रमांक" className="min-w-fit" />
                                        <span>:</span>
                                    </div>
                                    <Input value={values.receiptRefNo} readOnly className="w-full bg-gray-50" />
                                </div>

                                {/* <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                                    <div className="flex shrink-0 items-center sm:w-40 sm:justify-between">
                                        <Label text="Application Source/ अर्ज स्त्रोत" className="min-w-fit" />
                                        <span>:</span>
                                    </div>
                                    <Input value={applicationSource?.APPSOURCE || ""} readOnly className="w-full bg-gray-50" />
                                </div> */}
                            </div>

                            {serviceId === 2 && assessment && (
                                <>
                                    <div className="my-5 border-t border-gray-200" />
                                    <div className="mb-4 text-base font-semibold text-[#083c76]">Property Assessment Details</div>

                                    <div className="grid grid-cols-1 gap-x-12 gap-y-3 md:grid-cols-2">
                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                                            <div className="flex shrink-0 items-center sm:w-40 sm:justify-between">
                                                <Label text="Assessment ID" />
                                                <span>:</span>
                                            </div>
                                            <Input value={assessment.NUM_PROPASSESS_ID ?? ""} readOnly className="w-full bg-gray-50" />
                                        </div>

                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                                            <div className="flex shrink-0 items-center sm:w-40 sm:justify-between">
                                                <Label text="Service ID" />
                                                <span>:</span>
                                            </div>
                                            <Input value={assessment.NUM_PROPASSESS_SERVID ?? ""} readOnly className="w-full bg-gray-50" />
                                        </div>

                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                                            <div className="flex shrink-0 items-center sm:w-40 sm:justify-between">
                                                <Label text="Zone ID" />
                                                <span>:</span>
                                            </div>
                                            <Input value={assessment.NUM_PROPASSESS_ZONEID ?? ""} readOnly className="w-full bg-gray-50" />
                                        </div>

                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                                            <div className="flex shrink-0 items-center sm:w-40 sm:justify-between">
                                                <Label text="Property No." />
                                                <span>:</span>
                                            </div>
                                            <Input value={assessment.VAR_PROPASSESS_PROPNO ?? ""} readOnly className="w-full bg-gray-50" />
                                        </div>

                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                                            <div className="flex shrink-0 items-center sm:w-40 sm:justify-between">
                                                <Label text="Sub Code" />
                                                <span>:</span>
                                            </div>
                                            <Input value={assessment.VAR_PROPASSESS_SUBCODE ?? ""} readOnly className="w-full bg-gray-50" />
                                        </div>

                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                                            <div className="flex shrink-0 items-center sm:w-40 sm:justify-between">
                                                <Label text="Application No." />
                                                <span>:</span>
                                            </div>
                                            <Input value={assessment.VAR_PROPASSESS_APPNO ?? ""} readOnly className="w-full bg-gray-50" />
                                        </div>

                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                                            <div className="flex shrink-0 items-center sm:w-40 sm:justify-between">
                                                <Label text="Land Holder" />
                                                <span>:</span>
                                            </div>
                                            <Input value={assessment.VAR_PROPASSESS_LANDHOLDER ?? ""} readOnly className="w-full bg-gray-50" />
                                        </div>

                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                                            <div className="flex shrink-0 items-center sm:w-40 sm:justify-between">
                                                <Label text="Structure Holder" />
                                                <span>:</span>
                                            </div>
                                            <Input value={assessment.VAR_PROPASSESS_STRUCTHOLDER ?? ""} readOnly className="w-full bg-gray-50" />
                                        </div>

                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                                            <div className="flex shrink-0 items-center sm:w-40 sm:justify-between">
                                                <Label text="Owner Details" />
                                                <span>:</span>
                                            </div>
                                            <Input value={assessment.VAR_PROPASSESS_OWNDTLS ?? ""} readOnly className="w-full bg-gray-50" />
                                        </div>

                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                                            <div className="flex shrink-0 items-center sm:w-40 sm:justify-between">
                                                <Label text="Address" />
                                                <span>:</span>
                                            </div>
                                            <Input value={assessment.VAR_PROPASSESS_ADDRESS ?? ""} readOnly className="w-full bg-gray-50" />
                                        </div>

                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                                            <div className="flex shrink-0 items-center sm:w-40 sm:justify-between">
                                                <Label text="Flat No." />
                                                <span>:</span>
                                            </div>
                                            <Input value={assessment.VAR_PROPASSESS_FLATNO ?? ""} readOnly className="w-full bg-gray-50" />
                                        </div>

                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                                            <div className="flex shrink-0 items-center sm:w-40 sm:justify-between">
                                                <Label text="Structure" />
                                                <span>:</span>
                                            </div>
                                            <Input value={assessment.VAR_PROPASSESS_STRUCTURE ?? ""} readOnly className="w-full bg-gray-50" />
                                        </div>

                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                                            <div className="flex shrink-0 items-center sm:w-40 sm:justify-between">
                                                <Label text="Usage Type" />
                                                <span>:</span>
                                            </div>
                                            <Input value={assessment.NUM_PROPASSESS_USAGETYPE ?? ""} readOnly className="w-full bg-gray-50" />
                                        </div>

                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                                            <div className="flex shrink-0 items-center sm:w-40 sm:justify-between">
                                                <Label text="Construction Type" />
                                                <span>:</span>
                                            </div>
                                            <Input value={assessment.VAR_PROPASSESS_CONSTTYPE ?? ""} readOnly className="w-full bg-gray-50" />
                                        </div>

                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                                            <div className="flex shrink-0 items-center sm:w-40 sm:justify-between">
                                                <Label text="Area" />
                                                <span>:</span>
                                            </div>
                                            <Input value={assessment.NUM_PROPASSESS_AREA ?? ""} readOnly className="w-full bg-gray-50" />
                                        </div>

                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                                            <div className="flex shrink-0 items-center sm:w-40 sm:justify-between">
                                                <Label text="Letting Rate" />
                                                <span>:</span>
                                            </div>
                                            <Input value={assessment.NUM_PROPASSESS_LETTINGRATE ?? ""} readOnly className="w-full bg-gray-50" />
                                        </div>

                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                                            <div className="flex shrink-0 items-center sm:w-40 sm:justify-between">
                                                <Label text="Rate" />
                                                <span>:</span>
                                            </div>
                                            <Input value={assessment.NUM_PROPASSESS_RATE ?? ""} readOnly className="w-full bg-gray-50" />
                                        </div>

                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                                            <div className="flex shrink-0 items-center sm:w-40 sm:justify-between">
                                                <Label text="Year Tax" />
                                                <span>:</span>
                                            </div>
                                            <Input value={assessment.NUM_PROPASSESS_YEARTAX ?? ""} readOnly className="w-full bg-gray-50" />
                                        </div>

                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                                            <div className="flex shrink-0 items-center sm:w-40 sm:justify-between">
                                                <Label text="Assessment Year" />
                                                <span>:</span>
                                            </div>
                                            <Input value={assessment.NUM_PROPASSESS_ASSESSYR ?? ""} readOnly className="w-full bg-gray-50" />
                                        </div>

                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                                            <div className="flex shrink-0 items-center sm:w-40 sm:justify-between">
                                                <Label text="Applicant Name" />
                                                <span>:</span>
                                            </div>
                                            <Input value={assessment.VAR_PROPASSESS_APPLINAME ?? ""} readOnly className="w-full bg-gray-50" />
                                        </div>

                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                                            <div className="flex shrink-0 items-center sm:w-40 sm:justify-between">
                                                <Label text="Applicant Mobile" />
                                                <span>:</span>
                                            </div>
                                            <Input value={assessment.NUM_PROPASSESS_APPLIMOB ?? ""} readOnly className="w-full bg-gray-50" />
                                        </div>

                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                                            <div className="flex shrink-0 items-center sm:w-40 sm:justify-between">
                                                <Label text="Applicant Email" />
                                                <span>:</span>
                                            </div>
                                            <Input value={assessment.VAR_PROPASSESS_APPLIEMAIL ?? ""} readOnly className="w-full bg-gray-50" />
                                        </div>

                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                                            <div className="flex shrink-0 items-center sm:w-40 sm:justify-between">
                                                <Label text="Inserted By" />
                                                <span>:</span>
                                            </div>
                                            <Input value={assessment.VAR_PROPASSESS_INSBY ?? ""} readOnly className="w-full bg-gray-50" />
                                        </div>

                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                                            <div className="flex shrink-0 items-center sm:w-40 sm:justify-between">
                                                <Label text="Insert Date" />
                                                <span>:</span>
                                            </div>
                                            <Input
                                                value={assessment.DAT_PROPASSESS_INSDATE ? new Date(assessment.DAT_PROPASSESS_INSDATE).toLocaleString() : ""}
                                                readOnly
                                                className="w-full bg-gray-50"
                                            />
                                        </div>

                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                                            <div className="flex shrink-0 items-center sm:w-40 sm:justify-between">
                                                <Label text="Updated By" />
                                                <span>:</span>
                                            </div>
                                            <Input value={assessment.VAR_PROPASSESS_UPDTBY ?? ""} readOnly className="w-full bg-gray-50" />
                                        </div>

                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                                            <div className="flex shrink-0 items-center sm:w-40 sm:justify-between">
                                                <Label text="Update Date" />
                                                <span>:</span>
                                            </div>
                                            <Input
                                                value={assessment.DAT_PROPASSESS_UPDTDATE ? new Date(assessment.DAT_PROPASSESS_UPDTDATE).toLocaleString() : ""}
                                                readOnly
                                                className="w-full bg-gray-50"
                                            />
                                        </div>

                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                                            <div className="flex shrink-0 items-center sm:w-40 sm:justify-between">
                                                <Label text="Java KNO" />
                                                <span>:</span>
                                            </div>
                                            <Input value={assessment.VAR_PROPASSESS_JAVAKNO ?? ""} readOnly className="w-full bg-gray-50" />
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className="my-5 border-t border-gray-200" />

                            <div className="grid grid-cols-1 gap-x-12 gap-y-3 md:grid-cols-2">
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                                    <div className="flex shrink-0 items-center sm:w-40 sm:justify-between">
                                        <Label text="Payment Source" className="min-w-fit" />
                                        <span>:</span>
                                    </div>
                                    <Input value={isMahaPayment ? "Aaple Sarkar" : "Online Payment"} readOnly className="w-full bg-gray-50" />
                                </div>

                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                                    <div className="flex shrink-0 items-center sm:w-40 sm:justify-between">
                                        <Label text="MahaPay" className="min-w-fit" />
                                        <span>:</span>
                                    </div>
                                    <Input value={applicationSource?.MAHAPAY || "-"} readOnly className="w-full bg-gray-50" />
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center justify-center gap-3 pt-6">
                                {!isMahaPayment && (<Button type="submit">Payment</Button>)}
                                {isMahaPayment && (<Button type="button" onClick={handleAaplePayment}>Aaple Sarkar Payment</Button>)}
                                <Button type="button" variant="outline" path="/app/FrmTrackApplication">Back</Button>
                            </div>
                        </CardContent>
                    </Card>
                </Form>
            )}
        </Formik>
    );
};

export default FrmAppliFee;