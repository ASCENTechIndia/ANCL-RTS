import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Formik, Form } from "formik";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ShadCNTable from "@/components/ui/table";
import config from "@/utils/config";
import { DatePicker } from "@/components/ui/calendar";

const FrmPlumberLicense = () => {
    const location = useLocation();
    const { user, token } = useAuth();
    const navigate = useNavigate();

    const baseUrl = import.meta.env.VITE_BASE_URL;
    const ulbId = Number(location.state?.ulbId ?? user?.ulbId);
    const userId = location.state?.userId ?? user?.userId;
    const serviceId = Number(location.state?.serviceId ?? user?.serviceId);
    const source = config?.source;
    console.log({ location })
    const [mode, setMode] = useState(serviceId === 24 ? "N" : "R");
    const [serviceName, setServiceName] = useState("Plumber License");
    const [zones, setZones] = useState([]);
    const [educationList, setEducationList] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [loadingMasters, setLoadingMasters] = useState(false);

    const initialValues = {
        zoneId: "12",
        aadhaar: "",
        firstName: "",
        middleName: "",
        lastName: "",
        mobileNo: "",
        email: "",
        address: "",
        panNo: "",
        education: "",
        technicalQualification: "",
        businessName: "",
        tradeLicenceNo: "",
        renewalLicenseNo: "",
        renewalDate: new Date(),
        fromDate: new Date(),
        toDate: new Date(),
        renewalAadhaar: "",
        renewalFirstName: "",
        renewalMiddleName: "",
        renewalLastName: "",
        renewalMobile: "",
        renewalEmail: "",
        renewalAddress: "",
    };

    useEffect(() => {
        if (!token) return;

        const loadMasters = async () => {
            setLoadingMasters(true);

            Swal.fire({
                text: "Loading...",
                allowOutsideClick: false,
                allowEscapeKey: false,
                showConfirmButton: false,
                didOpen: () => Swal.showLoading(),
            });

            try {
                const results = await Promise.allSettled([
                    axios.get(`${baseUrl}/api/FrmWaterRegister/ward-dropdown`, {
                        params: { ulbid: ulbId },
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    axios.get(`${baseUrl}/api/FrmWaterRegister/service-name`, {
                        params: { serviceId },
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    axios.get(`${baseUrl}/api/FrmPlumberLicense/education-dropdown`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    axios.get(`${baseUrl}/api/FrmWaterRegister/documents`, {
                        params: { ulbid: ulbId, serviceId },
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ]);

                const zoneResult = results[0];
                const serviceResult = results[1];
                const educationResult = results[2];
                const documentResult = results[3];

                const zoneData = zoneResult.status === "fulfilled" ? zoneResult.value?.data?.data?.data || [] : [];
                const serviceData = serviceResult.status === "fulfilled" ? serviceResult.value?.data?.data?.data || [] : [];
                const educationData = educationResult.status === "fulfilled" ? educationResult.value?.data?.data?.data || [] : [];
                const documentData = documentResult.status === "fulfilled" ? documentResult.value?.data?.data?.data || [] : [];

                console.log("zoneData: ", zoneData);
                setZones(zoneData);
                setEducationList(educationData);

                if (serviceData.length > 0) {
                    setServiceName(serviceData[0]?.VAR_SERVICE_ENG_NAME || "Plumber License");
                }

                setDocuments(documentData.map((item) => ({ ...item, file: null, })));
            } catch (error) {
                console.error("Plumber License Masters Error:", error);

                Swal.fire({
                    icon: "error",
                    text: error?.response?.data?.message || error?.response?.data?.error || "Unable to load Plumber License details.",
                });
            } finally {
                setLoadingMasters(false);
                Swal.close();
            }
        };

        loadMasters();
    }, [baseUrl, serviceId, token, ulbId]);

    useEffect(() => {
        setMode(serviceId === 24 ? "N" : "R");
    }, [serviceId]);

    const handleFileChange = (documentId, file) => {
        if (!file) return;
        const extension = file.name.split(".").pop()?.toLowerCase();
        if (!["jpg", "jpeg", "png", "pdf"].includes(extension)) {
            Swal.fire({
                // icon: "warning",
                text: "Document should be acceptable in JPEG/JPG/PNG/PDF format only.",
            });
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            Swal.fire({
                // icon: "warning",
                text: "Document size should be less than 5 MB.",
            });
            return;
        }

        setDocuments((previous) => previous.map((item) => String(item.DOCID) === String(documentId) ? { ...item, file } : item));
    };

    const formatOracleDate = (date) => {
        if (!date) return "";

        const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

        if (date instanceof Date && !Number.isNaN(date.getTime())) {
            const day = String(date.getDate()).padStart(2, "0");
            const month = months[date.getMonth()];
            const year = date.getFullYear();

            return `${day}-${month}-${year}`;
        }

        if (typeof date !== "string") return "";
        if (/^\d{2}-[A-Z]{3}-\d{4}$/i.test(date)) {
            return date.toUpperCase();
        }
        if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            const [year, month, day] = date.split("-");
            return `${day}-${months[Number(month) - 1]}-${year}`;
        }

        const parsedDate = new Date(date);
        if (!Number.isNaN(parsedDate.getTime())) {
            const day = String(parsedDate.getDate()).padStart(2, "0");
            const month = months[parsedDate.getMonth()];
            const year = parsedDate.getFullYear();
            return `${day}-${month}-${year}`;
        }
        return "";
    };

    const handleSubmit = async (values, { resetForm }) => {
        if (!values.zoneId) {
            Swal.fire({
                // icon: "warning",
                text: "Select valid Zone from the list.",
            });
            return;
        }

        if (mode === "N") {
            if (!/^\d{12}$/.test(values.aadhaar)) {
                Swal.fire({
                    // icon: "warning",
                    text: "Please Enter 12 Digit Aadhaar Number.",
                });
                return;
            }
            if (!values.firstName.trim()) {
                Swal.fire({
                    // icon: "warning",
                    text: "First Name can not be blank.",
                });
                return;
            }
            if (!values.middleName.trim()) {
                Swal.fire({
                    // icon: "warning",
                    text: "Middle Name can not be blank.",
                });
                return;
            }
            if (!values.lastName.trim()) {
                Swal.fire({
                    // icon: "warning",
                    text: "Last Name can not be blank.",
                });
                return;
            }
            if (values.mobileNo && !/^\d{10}$/.test(values.mobileNo)) {
                Swal.fire({
                    // icon: "warning",
                    text: "Please enter valid Mobile No.",
                });
                return;
            }
            if (!values.email.trim()) {
                Swal.fire({
                    // icon: "warning",
                    text: "Email can not be blank.",
                });
                return;
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
                Swal.fire({
                    // icon: "warning",
                    text: "Please enter valid Email Address.",
                });
                return;
            }
            if (!values.address.trim()) {
                Swal.fire({
                    // icon: "warning",
                    text: "Address can not be blank.",
                });
                return;
            }
            if (!values.panNo.trim()) {
                Swal.fire({
                    // icon: "warning",
                    text: "PanNo can not be blank.",
                });
                return;
            }
            const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
            if (!panRegex.test(values.panNo.trim().toUpperCase())) {
                Swal.fire({
                    text: "Please enter a valid PAN Card Number.",
                });
                return;
            }
            if (!values.education) {
                Swal.fire({
                    // icon: "warning",
                    text: "Select education.",
                });
                return;
            }
            if (!values.technicalQualification.trim()) {
                Swal.fire({
                    // icon: "warning",
                    text: "Technical Qualification can not be blank.",
                });
                return;
            }
            if (!values.businessName.trim()) {
                Swal.fire({
                    // icon: "warning",
                    text: "Business Name can not be blank.",
                });
                return;
            }
        }

        if (mode === "R") {
            if (!values.renewalLicenseNo.trim()) {
                Swal.fire({
                    // icon: "warning",
                    text: "Plumber License No can not be blank.",
                });
                return;
            }
            if (!values.renewalDate) {
                Swal.fire({
                    text: "Renewal Date can not be blank.",
                });
                return;
            }

            if (!values.fromDate) {
                Swal.fire({
                    text: "From Date can not be blank.",
                });
                return;
            }

            if (!values.toDate) {
                Swal.fire({
                    text: "To Date can not be blank.",
                });
                return;
            }

            if (new Date(values.fromDate) > new Date(values.toDate)) {
                Swal.fire({
                    text: "From Date cannot be greater than To Date.",
                });
                return;
            }

            if (!/^\d{12}$/.test(values.renewalAadhaar)) {
                Swal.fire({
                    // icon: "warning",
                    text: "Please enter valid Aadhar No.",
                });
                return;
            }
            if (!values.renewalFirstName.trim()) {
                Swal.fire({
                    // icon: "warning",
                    text: "First Name can not be blank.",
                });
                return;
            }
            if (!values.renewalMiddleName.trim()) {
                Swal.fire({
                    // icon: "warning",
                    text: "Middle Name can not be blank.",
                });
                return;
            }
            if (!values.renewalLastName.trim()) {
                Swal.fire({
                    // icon: "warning",
                    text: "Last Name can not be blank.",
                });
                return;
            }
            if (!values.renewalMobile) {
                Swal.fire({
                    // icon: "warning",
                    text: "Please enter Mobile No.",
                });
                return;
            }
            if (values.renewalMobile && !/^\d{10}$/.test(values.renewalMobile)) {
                Swal.fire({
                    // icon: "warning",
                    text: "Please enter valid Mobile No.",
                });
                return;
            }
            if (!values.renewalEmail.trim()) {
                Swal.fire({
                    // icon: "warning",
                    text: "Email can not be blank.",
                });
                return;
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.renewalEmail)) {
                Swal.fire({
                    // icon: "warning",
                    text: "Please enter valid Email Address.",
                });
                return;
            }
        }
        if (!documents.length) {
            Swal.fire({
                // icon: "warning",
                text: "Document Required.",
            });
            return;
        }

        const missingDocuments = documents.filter((item) => !item.file);

        if (missingDocuments.length > 0) {
            Swal.fire({
                // icon: "warning",
                text: "Please Upload All the Documents.",
            });
            return;
        }

        try {
            let response;
            if (mode === "N") {
                const payload = {
                    userId: String(userId),
                    licenseId: 0,
                    appliFName: values.firstName.trim(),
                    appliMName: values.middleName.trim(),
                    appliLName: values.lastName.trim(),
                    mobNo: values.mobileNo ? Number(values.mobileNo) : null,
                    email: values.email.trim(),
                    address: values.address.trim(),
                    panNo: values.panNo.trim(),
                    education: String(values.education),
                    tectQuali: values.technicalQualification.trim(),
                    businessName: values.businessName.trim(),
                    tradeLicenceNo: values.tradeLicenceNo.trim() || 0,
                    ulbid: Number(ulbId),
                    servid: Number(serviceId),
                    zoneId: Number(values.zoneId),
                    source,
                    detAppliName: values.firstName.trim(),
                    detMobile: values.mobileNo.trim(),
                    detAadhaar: values.aadhaar.trim(),
                    detEmail: values.email.trim(),
                    detAddress: values.address.trim(),
                };

                Swal.fire({
                    text: "Submitting...",
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    showConfirmButton: false,
                    didOpen: () => Swal.showLoading(),
                });

                response = await axios.post(`${baseUrl}/api/FrmPlumberLicense/save-plumber-license`,
                    payload,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    }
                );
            } else {
                const textOrDot = (value) => value == null || String(value).trim() === "" ? "." : String(value).trim();

                const renewalPayload = {
                    userId: String(userId),
                    licenseId: 0,
                    tradeLicenceNo: values.renewalLicenseNo.trim(),
                    ulbid: Number(ulbId),
                    servid: Number(serviceId),
                    source,
                    zoneid: Number(values.zoneId),
                    renewdt: formatOracleDate(values.renewalDate),
                    fromdt: formatOracleDate(values.fromDate),
                    todt: formatOracleDate(values.toDate),
                    appliFName: values.renewalFirstName.trim(),
                    appliMName: values.renewalMiddleName.trim(),
                    appliLName: values.renewalLastName.trim(),
                    detMobile: String(values.renewalMobile).trim(),
                    detEmail: values.renewalEmail.trim(),
                    detAddress: values.renewalAddress.trim(),
                    appliDOB: values.renewalDOB ? formatOracleDate(values.renewalDOB) : null,
                    appliScndMobNo: values.renewalSecondMobile ? Number(values.renewalSecondMobile) : 0,
                    appliEducation: textOrDot(values.renewalEducation),
                    appliLcnDate: values.renewalOldLicenseDate ? formatOracleDate(values.renewalOldLicenseDate) : null,
                    appliFNameMar: textOrDot(values.renewalFirstNameMar),
                    appliMNameMar: textOrDot(values.renewalMiddleNameMar),
                    appliLNameMar: textOrDot(values.renewalLastNameMar),
                    detAddressMar: textOrDot(values.renewalAddressMar),
                };

                Swal.fire({
                    text: "Saving...",
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    showConfirmButton: false,
                    didOpen: () => Swal.showLoading(),
                });

                response = await axios.post(`${baseUrl}/api/FrmPlumberLicense/renew-plumber-license`,
                    renewalPayload,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    }
                );
            }

            const result = response?.data?.data;

            if (!result?.success || Number(result?.errorCode) !== 9999) {
                Swal.close();
                Swal.fire({
                    icon: "error",
                    text: result?.message || "Unable to save Plumber License.",
                });

                return;
            }

            const appNo = result?.appNo;
            if (!appNo) {
                Swal.close();

                Swal.fire({
                    icon: "error",
                    text: "Application saved but Application No. was not returned.",
                });

                return;
            }

            Swal.fire({
                text: "Uploading Documents...",
                // text: `Application No: ${appNo}`,
                allowOutsideClick: false,
                allowEscapeKey: false,
                showConfirmButton: false,
                didOpen: () => Swal.showLoading(),
            });

            const uploadResults = await Promise.allSettled(documents.map(async (document) => {
                const formData = new FormData();

                formData.append("corpid", String(ulbId));
                formData.append("serviceid", String(serviceId));
                formData.append("appno", String(appNo));
                formData.append("doctype", document.DOCTYPE || "A");
                formData.append("documentid", String(document.DOCID));
                formData.append("file", document.file);

                return axios.post(`${baseUrl}/api/FrmWaterRegister/upload-document`,
                    formData,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
            })
            );

            const failedUploads = uploadResults.filter((item) => item.status === "rejected");

            if (failedUploads.length > 0) {
                Swal.close();
                console.error("Document Upload Errors:", failedUploads);
                Swal.fire({
                    icon: "error",
                    title: "Document Upload Failed",
                    text: `${failedUploads.length} document(s) could not be uploaded. Application No: ${appNo}`,
                });

                return;
            }

            Swal.close();

            await Swal.fire({
                // icon: "success",
                // title: "Success",
                text: `${result?.message} Application No: ${appNo}` || "Plumber License Details Saved Successfully.",
                // footer: `Application No: ${appNo}`,
                confirmButtonText: "OK",
            });

            resetForm({
                values: { ...initialValues, zoneId: "12" },
            });

            setDocuments((previous) => previous.map((item) => ({ ...item, file: null })));
            navigate("/app/FrmTrackApplication")
        } catch (error) {
            Swal.close();
            console.error("Plumber License Submit Error:", error);

            Swal.fire({
                icon: "error",
                text: error?.response?.data?.message || error?.response?.data?.error || "Unable to submit Plumber License.",
            });
        }
    };

    return (
        <Formik initialValues={initialValues} onSubmit={handleSubmit}>
            {({ values, setFieldValue, resetForm }) => (
                <Form className="w-full">
                    <Card className="w-full">
                        <CardHeader className="border-b">
                            <CardTitle className="text-lg font-semibold text-[#083c76]">
                                {serviceName}
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="p-5">
                            <div className="flex justify-center">
                                <div className="flex items-center gap-2">

                                    <Input
                                        type="radio"
                                        name="licenseType"
                                        checked={mode === "N"}
                                        disabled={serviceId !== 24}
                                        onChange={() =>
                                            setMode("N")
                                        }
                                    />
                                    <Label text="New" className="flex cursor-pointer items-center gap-2 text-sm" />



                                    <Input
                                        type="radio"
                                        name="licenseType"
                                        checked={mode === "R"}
                                        disabled={serviceId === 24}
                                        onChange={() =>
                                            setMode("R")
                                        }
                                    />
                                    <Label text="Renewal" className="flex cursor-pointer items-center gap-2 text-sm" />
                                </div>
                            </div>

                            <div className="my-6 border-t border-gray-200" />

                            {mode === "N" && (
                                <div className="grid grid-cols-1 gap-x-12 gap-y-4 md:grid-cols-2">
                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                                        <div className="flex shrink-0 items-center sm:w-48 sm:justify-between">
                                            <Label text="Aadhar No." required />
                                            <span>:</span>
                                        </div>

                                        <Input
                                            value={values.aadhaar}
                                            maxLength={12}
                                            inputMode="numeric"
                                            onChange={(e) =>
                                                setFieldValue("aadhaar", e.target.value.replace(/\D/g, ""))
                                            }
                                        />
                                    </div>

                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                        <div className="sm:w-40 shrink-0 flex justify-start sm:justify-between items-center">
                                            <Label required text="Zone" />
                                            <span>:</span>
                                        </div>
                                        <Select
                                            value={values.zoneId}
                                            onValueChange={(value) => {
                                                setFieldValue("zoneId", value);
                                            }}
                                        >
                                            <SelectTrigger className="w-full h-9">
                                                <SelectValue placeholder="-- Select Zone --" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {zones.map((zone) => (
                                                    <SelectItem key={zone.WARDID} value={String(zone.WARDID)}>
                                                        {zone.WARDNAME}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex flex-col gap-2 sm:col-span-2 sm:flex-row sm:items-center sm:gap-4">
                                        <div className="flex shrink-0 items-center sm:w-48 sm:justify-between">
                                            <Label text="Applicant Name" required />
                                            <span>:</span>
                                        </div>

                                        <div className="grid w-full grid-cols-1 gap-3 md:grid-cols-3">
                                            <Input
                                                placeholder="First Name"
                                                maxLength={100}
                                                value={values.firstName}
                                                onChange={(e) =>
                                                    setFieldValue("firstName", e.target.value)
                                                }
                                            />
                                            <Input
                                                placeholder="Middle Name"
                                                maxLength={100}
                                                value={values.middleName}
                                                onChange={(e) =>
                                                    setFieldValue("middleName", e.target.value)
                                                }
                                            />
                                            <Input
                                                placeholder="Last Name"
                                                maxLength={100}
                                                value={values.lastName}
                                                onChange={(e) =>
                                                    setFieldValue("lastName", e.target.value)
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                                        <div className="flex shrink-0 items-center sm:w-48 sm:justify-between">
                                            <Label text="Mobile No" required />
                                            <span>:</span>
                                        </div>

                                        <Input
                                            value={values.mobileNo}
                                            maxLength={10}
                                            inputMode="numeric"
                                            onChange={(e) =>
                                                setFieldValue("mobileNo", e.target.value.replace(/\D/g, ""))
                                            }
                                        />
                                    </div>

                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                                        <div className="flex shrink-0 items-center sm:w-48 sm:justify-between">
                                            <Label text="Email" required />
                                            <span>:</span>
                                        </div>

                                        <Input
                                            type="email"
                                            maxLength={40}
                                            value={values.email}
                                            onChange={(e) =>
                                                setFieldValue("email", e.target.value)
                                            }
                                        />
                                    </div>

                                    <div className="flex flex-col gap-2 sm:col-span-2 sm:flex-row sm:items-start sm:gap-4">
                                        <div className="flex shrink-0 items-center sm:w-48 sm:justify-between">
                                            <Label text="Address" required />
                                            <span>:</span>
                                        </div>

                                        <Textarea
                                            value={values.address}
                                            maxLength={1000}
                                            onChange={(e) =>
                                                setFieldValue("address", e.target.value)
                                            }
                                            className="min-h-16 w-full"
                                        />
                                    </div>

                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                                        <div className="flex shrink-0 items-center sm:w-48 sm:justify-between">
                                            <Label text="Pan No." required />
                                            <span>:</span>
                                        </div>

                                        <Input
                                            maxLength={10}
                                            value={values.panNo}
                                            onChange={(e) =>
                                                setFieldValue("panNo", e.target.value.toUpperCase())
                                            }
                                        />
                                    </div>

                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                                        <div className="flex shrink-0 items-center sm:w-48 sm:justify-between">
                                            <Label text="Education" required />
                                            <span>:</span>
                                        </div>

                                        <div className="w-full">
                                            <Select
                                                value={values.education}
                                                onValueChange={(value) =>
                                                    setFieldValue("education", value)
                                                }
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="-- Select Option --" />
                                                </SelectTrigger>

                                                <SelectContent>
                                                    {educationList.map((item) => (
                                                        <SelectItem
                                                            key={item.EDUCATIONID}
                                                            value={String(item.EDUCATIONID)}
                                                        >
                                                            {item.EDUCATIONNAME}
                                                        </SelectItem>
                                                    )
                                                    )}
                                                </SelectContent>
                                            </Select>

                                            {String(values.education) === "1" && (
                                                <p className="mt-2 text-xs text-red-600"> Applicants need to give corporation examination</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                                        <div className="flex shrink-0 items-center sm:w-48 sm:justify-between">
                                            <Label text="Technical Qualification" required />
                                            <span>:</span>
                                        </div>

                                        <Input
                                            maxLength={250}
                                            value={values.technicalQualification}
                                            onChange={(e) =>
                                                setFieldValue("technicalQualification", e.target.value)
                                            }
                                        />
                                    </div>

                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                                        <div className="flex shrink-0 items-center sm:w-48 sm:justify-between">
                                            <Label text="Business Name" required />
                                            <span>:</span>
                                        </div>

                                        <Input
                                            maxLength={250}
                                            value={values.businessName}
                                            onChange={(e) =>
                                                setFieldValue("businessName", e.target.value)
                                            }
                                        />
                                    </div>
                                </div>
                            )}

                            {mode === "R" && (
                                <div className="grid grid-cols-1 gap-x-12 gap-y-4 md:grid-cols-2">
                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                                        <div className="flex shrink-0 items-center sm:w-48 sm:justify-between">
                                            <Label text="License No." required />
                                            <span>:</span>
                                        </div>

                                        <Input
                                            maxLength={16}
                                            value={values.renewalLicenseNo}
                                            onChange={(e) =>
                                                setFieldValue("renewalLicenseNo", e.target.value)
                                            }
                                        />
                                    </div>

                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                                        <div className="flex shrink-0 items-center sm:w-48 sm:justify-between">
                                            <Label text="Renewal Date" required />
                                            <span>:</span>
                                        </div>

                                        <DatePicker
                                            value={values.renewalDate}
                                            onChange={(date) =>
                                                setFieldValue("renewalDate", date)
                                            }
                                        />
                                    </div>

                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                                        <div className="flex shrink-0 items-center sm:w-48 sm:justify-between">
                                            <Label text="From Date" required />
                                            <span>:</span>
                                        </div>

                                        <DatePicker
                                            value={values.fromDate}
                                            onChange={(date) =>
                                                setFieldValue("fromDate", date)
                                            }
                                        />
                                    </div>

                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                                        <div className="flex shrink-0 items-center sm:w-48 sm:justify-between">
                                            <Label text="To Date" required />
                                            <span>:</span>
                                        </div>

                                        <DatePicker
                                            value={values.toDate}
                                            onChange={(date) =>
                                                setFieldValue("toDate", date)
                                            }
                                        />
                                    </div>

                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                                        <div className="flex shrink-0 items-center sm:w-48 sm:justify-between">
                                            <Label text="Aadhar" required />
                                            <span>:</span>
                                        </div>

                                        <Input
                                            value={values.renewalAadhaar}
                                            maxLength={12}
                                            inputMode="numeric"
                                            onChange={(e) =>
                                                setFieldValue("renewalAadhaar", e.target.value.replace(/\D/g, ""))
                                            }
                                        />
                                    </div>

                                    <div className="flex flex-col gap-2 sm:col-span-2 sm:flex-row sm:items-center sm:gap-4">
                                        <div className="flex shrink-0 items-center sm:w-48 sm:justify-between">
                                            <Label text="Applicant Name" required />
                                            <span>:</span>
                                        </div>

                                        <div className="grid w-full grid-cols-1 gap-3 md:grid-cols-3">
                                            <Input
                                                placeholder="First Name"
                                                maxLength={100}
                                                value={values.renewalFirstName}
                                                onChange={(e) =>
                                                    setFieldValue("renewalFirstName", e.target.value)
                                                }
                                            />

                                            <Input
                                                placeholder="Middle Name"
                                                maxLength={100}
                                                value={values.renewalMiddleName}
                                                onChange={(e) =>
                                                    setFieldValue("renewalMiddleName", e.target.value)
                                                }
                                            />

                                            <Input
                                                placeholder="Last Name"
                                                maxLength={100}
                                                value={values.renewalLastName}
                                                onChange={(e) =>
                                                    setFieldValue("renewalLastName", e.target.value)
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                                        <div className="flex shrink-0 items-center sm:w-48 sm:justify-between">
                                            <Label text="Mobile No" required />
                                            <span>:</span>
                                        </div>

                                        <Input
                                            value={values.renewalMobile}
                                            maxLength={10}
                                            inputMode="numeric"
                                            onChange={(e) =>
                                                setFieldValue("renewalMobile", e.target.value.replace(/\D/g, ""))
                                            }
                                        />
                                    </div>

                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                                        <div className="flex shrink-0 items-center sm:w-48 sm:justify-between">
                                            <Label text="Email" required />
                                            <span>:</span>
                                        </div>

                                        <Input
                                            type="email"
                                            maxLength={50}
                                            value={values.renewalEmail}
                                            onChange={(e) =>
                                                setFieldValue("renewalEmail", e.target.value)
                                            }
                                        />
                                    </div>

                                    <div className="flex flex-col gap-2 sm:col-span-2 sm:flex-row sm:items-start sm:gap-4">
                                        <div className="flex shrink-0 items-center sm:w-48 sm:justify-between">
                                            <Label text="Address" required />
                                            <span>:</span>
                                        </div>

                                        <Textarea
                                            value={values.renewalAddress}
                                            maxLength={1000}
                                            onChange={(e) =>
                                                setFieldValue("renewalAddress", e.target.value)
                                            }
                                            className="min-h-16 w-full"
                                        />
                                    </div>
                                </div>
                            )}

                            {documents.length > 0 && (
                                <div className="mt-6 border-t border-gray-200 pt-5">
                                    <div className="mx-auto w-full max-w-6xl overflow-x-auto">
                                        <ShadCNTable
                                            headers={[
                                                "Sr. No.",
                                                "Document Name",
                                                "Image(jpg,png,pdf)",
                                            ]}
                                            data={documents.map((item, index) => ({
                                                srNo: index + 1,
                                                documentName: item.DOCNAME,
                                                image: (
                                                    <div className="flex items-center gap-2">
                                                        <Input
                                                            type="file"
                                                            accept=".jpg,.jpeg,.png,.pdf"
                                                            className="h-9 min-w-70cursor-pointer"
                                                            onChange={(e) =>
                                                                handleFileChange(item.DOCID, e.target.files?.[0])
                                                            }
                                                        />

                                                        {item.file && (
                                                            <span className="max-w-37 truncate text-xs text-green-600">
                                                                {item.file.name}
                                                            </span>
                                                        )}
                                                    </div>
                                                ),
                                            })
                                            )}
                                            keyMapping={{
                                                "Sr. No.": "srNo",
                                                "Document Name": "documentName",
                                                "Image(jpg,png,pdf)": "image",
                                            }}
                                            pagination={false}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-wrap items-center justify-center gap-3 pt-7">
                                <Button type="submit" disabled={loadingMasters}>{mode === "N" ? "Submit" : "Submit"}</Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        resetForm({ values: { ...initialValues, zoneId: "12" } });
                                        setDocuments((previous) => previous.map((item) => ({ ...item, file: null })));
                                    }}
                                >
                                    Reset
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </Form>
            )}
        </Formik>
    );
};

export default FrmPlumberLicense;