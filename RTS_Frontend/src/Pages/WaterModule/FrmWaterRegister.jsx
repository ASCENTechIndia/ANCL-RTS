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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ShadCNTable from "@/components/ui/table";
import config from "@/utils/config";
import { DatePicker } from "@/components/ui/calendar";

const FrmWaterRegister = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, token } = useAuth();
    const baseUrl = import.meta.env.VITE_BASE_URL;

    const ulbId = Number(location.state?.ulbId ?? user?.ulbId);
    const userId = Number(location.state?.userId ?? user?.userId);
    const serviceId = Number(location.state?.serviceId ?? user?.serviceId);
    const source = config?.source

    const [serviceName, setServiceName] = useState("Reconnection");
    const [wards, setWards] = useState([]);
    const [services, setServices] = useState([]);
    const [disconnectionTypes, setDisconnectionTypes] = useState([]);
    const [usageTypes, setUsageTypes] = useState([]);
    const [connectionSizes, setConnectionSizes] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [consumerSearch, setConsumerSearch] = useState("");
    const [searching, setSearching] = useState(false);

    const initialValues = {
        zoneId: "",
        serviceId: String(serviceId),
        consumerNo: "",
        disConId: "",
        reason: "",
        usageTypeId: "",
        tarifRate: "",
        connSize: "",
        remark: "",
        ownerName: "",
        usageType: "",
        detAppliName: "",
        detMobile: "",
        detAadhaar: "",
        detEmail: "",
        detAddress: "",
        conAddressSrch: "",
        ownerNameSrch: "",
        curConSizeSrch: "",
        usageTypeNewSrch: "",
        erlDate: new Date()
    };

    const getData = (result) => {
        if (result.status !== "fulfilled") return [];
        return result.value?.data?.data?.data || [];
    };

    const loadMasters = useCallback(async () => {
        Swal.fire({
            text: "Loading...",
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false,
            didOpen: () => Swal.showLoading()
        });

        const results = await Promise.allSettled([
            axios.get(`${baseUrl}/api/FrmWaterRegister/ward-dropdown`, {
                params: { ulbid: ulbId },
                headers: { Authorization: `Bearer ${token}` }
            }),
            axios.get(`${baseUrl}/api/FrmWaterRegister/service-dropdown`, {
                params: { rptMode: 4 },
                headers: { Authorization: `Bearer ${token}` }
            }),
            axios.get(`${baseUrl}/api/FrmWaterRegister/disconnection-dropdown`, {
                headers: { Authorization: `Bearer ${token}` }
            }),
            axios.get(`${baseUrl}/api/FrmWaterRegister/usage-type-dropdown`, {
                headers: { Authorization: `Bearer ${token}` }
            }),
            axios.get(`${baseUrl}/api/FrmWaterRegister/connection-size-dropdown`, {
                headers: { Authorization: `Bearer ${token}` }
            }),
            axios.get(`${baseUrl}/api/FrmWaterRegister/service-name`, {
                params: { serviceId },
                headers: { Authorization: `Bearer ${token}` }
            }),
            axios.get(`${baseUrl}/api/FrmWaterRegister/documents`, {
                params: { ulbid: ulbId, serviceId },
                headers: { Authorization: `Bearer ${token}` }
            })
        ]);

        Swal.close();

        setWards(getData(results[0]));
        setServices(getData(results[1]));
        setDisconnectionTypes(getData(results[2]));
        setUsageTypes(getData(results[3]));
        setConnectionSizes(getData(results[4]));

        const serviceData = getData(results[5]);

        if (serviceData.length) {
            setServiceName(serviceData[0]?.VAR_SERVICE_ENG_NAME || "-");
        }
        setDocuments(
            getData(results[6]).map((item) => ({ ...item, file: null }))
        );
    }, [baseUrl, serviceId, token, ulbId]);

    useEffect(() => {
        if (token) {
            loadMasters();
        }
    }, [loadMasters, token]);

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


    const fetchConnectionDetails = async (setFieldValue, consumerNo) => {
        const value = consumerNo.trim();

        if (!value) {
            Swal.fire({
                // icon: "warning",
                text: "Please enter Consumer No."
            });
            return;
        }

        setSearching(true);
        Swal.fire({
            text: "Loading...",
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false,
            didOpen: () => Swal.showLoading()
        });


        try {
            const response = await axios.get(`${baseUrl}/api/FrmWaterRegister/connection-details`,
                {
                    params: { consumerNo: value, userId },
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            const details = response?.data?.data?.connectionOwners;

            if (!details) {
                Swal.fire({
                    // icon: "warning",
                    text: response?.data?.data?.errors[0]?.detail
                });
                return;
            }

            const owner = details.owner || "";
            const address = details.address?.trim() || "";
            const usage = details.usage_type || "";

            const usageMatch = usageTypes.find((item) =>
                String(item.VAR_USAGETYPE_NAME || "").trim().toLowerCase() === String(usage).trim().toLowerCase()
            );
            const sizeMatch = connectionSizes.find((item) =>
                Number(item.NUM_CONNSIZE_SIZE) === Number(details.connsize_size)
            );
            const zoneMatch = wards.find((item) =>
                String(item.WARDNAME || "").trim().toLowerCase() === String(details.zone_name || "").trim().toLowerCase()
            );

            setFieldValue("consumerNo", details.connno || value);
            setConsumerSearch(details.connno || value);
            // setFieldValue("zoneId", zoneMatch ? String(zoneMatch.WARDID) : "");
            setFieldValue("ownerName", owner);
            setFieldValue("ownerNameSrch", owner);
            setFieldValue("usageType", usage);
            setFieldValue("usageTypeNewSrch", usage);
            setFieldValue("tarifRate", details.rate != null ? String(details.rate) : "");
            setFieldValue("connSize", sizeMatch ? String(sizeMatch.NUM_CONNSIZE_ID) : "");
            setFieldValue("usageTypeId", usageMatch ? String(usageMatch.NUM_USAGETYPE_ID) : "");
            setFieldValue("detAppliName", owner);
            setFieldValue("detAddress", address);
            setFieldValue("conAddressSrch", address);
            setFieldValue("curConSizeSrch", details.connsize_size != null ? String(details.connsize_size) : "");
            Swal.close()
            Swal.fire({
                icon: "success",
                text: "Connection details fetched successfully.",
                timer: 1200,
                showConfirmButton: false
            });
        } catch (error) {
            console.error("Connection Details Error:", error);

            Swal.fire({
                icon: "error",
                text: error?.response?.data?.message || error?.response?.data?.error || "Unable to fetch connection details."
            });
        } finally {
            setSearching(false);
        }
    };

    const handleFileChange = (documentId, file) => {
        if (!file) return;

        const extension = file.name.split(".").pop()?.toLowerCase();

        if (!["jpg", "jpeg", "png", "pdf"].includes(extension)) {
            Swal.fire({
                // icon: "warning",
                text: "Only JPG, JPEG, PNG and PDF files are allowed."
            });
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            Swal.fire({
                // icon: "warning",
                text: "File size should not exceed 5 MB."
            });
            return;
        }

        setDocuments((prev) =>
            prev.map((item) => String(item.DOCID) === String(documentId) ? { ...item, file } : item)
        );
    };

    const uploadDocument = async (appNo, document) => {
        const formData = new FormData();

        formData.append("corpid", String(ulbId));
        formData.append("serviceid", String(serviceId));
        formData.append("appno", appNo);
        formData.append("doctype", document.DOCTYPE || "A");
        formData.append("documentid", String(document.DOCID));
        formData.append("file", document.file);

        return axios.post(`${baseUrl}/api/FrmWaterRegister/upload-document`,
            formData,
            { headers: { Authorization: `Bearer ${token}` } }
        );
    };

    const handleSubmit = async (values, { resetForm }) => {
        if (!values.zoneId) {
            Swal.fire({
                // icon: "warning",
                text: "Please select Zone."
            });
            return;
        }

        if (!values.consumerNo.trim()) {
            Swal.fire({
                // icon: "warning",
                text: "Please enter Consumer No."
            });
            return;
        }

        if (!values.detAppliName.trim()) {
            Swal.fire({
                // icon: "warning",
                text: "Please enter Applicant Name."
            });
            return;
        }

        if (!/^\d{10}$/.test(values.detMobile)) {
            Swal.fire({
                // icon: "warning",
                text: "Please enter valid 10 digit Mobile No."
            });
            return;
        }

        if (!/^\d{12}$/.test(values.detAadhaar)) {
            Swal.fire({
                // icon: "warning",
                text: "Please enter valid 12 digit Aadhar No."
            });
            return;
        }

        if (!values.detEmail.trim()) {
            Swal.fire({
                // icon: "warning",
                text: "Please enter Email."
            });
            return;
        }

        if (!values.detAddress.trim()) {
            Swal.fire({
                // icon: "warning",
                text: "Please enter Address."
            });
            return;
        }

        if (!values.usageTypeId) {
            Swal.fire({
                // icon: "warning",
                text: "Please select Usage Type."
            });
            return;
        }

        if (!values.connSize) {
            Swal.fire({
                // icon: "warning",
                text: "Please select Connection Size."
            });
            return;
        }

        if (Number(serviceId) !== 22 && !values.disConId) {
            Swal.fire({
                // icon: "warning",
                text: "Please select Disconnection Type."
            });
            return;
        }

        if (!values.reason.trim()) {
            Swal.fire({
                // icon: "warning",
                text: "Please enter Reason."
            });
            return;
        }

        if (!values.remark.trim()) {
            Swal.fire({
                // icon: "warning",
                text: "Please enter Remark."
            });
            return;
        }

        if (!values.erlDate) {
            Swal.fire({
                // icon: "warning",
                text: "Please select Earlier Connection Close Date."
            });
            return;
        }

        // if (!documents.length) {
        //     Swal.fire({
        //         // icon: "warning",
        //         text: "Document Required."
        //     });
        //     return;
        // }

        const missingDocuments = documents.filter((item) => !item.file);
        if (missingDocuments.length) {
            Swal.fire({
                // icon: "warning",
                text: "Please upload all required documents before submission."
            });
            return;
        }

        const payload = {
            userId,
            wtregId: 0,
            servId: Number(values.serviceId),
            consNo: values.consumerNo.trim(),
            disConId: Number(serviceId) == 22 ? null : Number(values.disConId),
            reason: values.reason.trim(),
            usageTypeId: Number(values.usageTypeId),
            tarifRate: Number(values.tarifRate || 0),
            connSize: Number(values.connSize),
            remark: values.remark.trim(),
            ulbid: Number(ulbId),
            zoneId: Number(values.zoneId),
            source,
            ownerName: values.ownerName,
            usageType: values.usageType,
            detAppliName: values.detAppliName.trim(),
            detMobile: Number(values.detMobile),
            detAadhaar: values.detAadhaar.trim(),
            detEmail: values.detEmail.trim(),
            detAddress: values.detAddress.trim(),
            conAddressSrch: values.conAddressSrch,
            ownerNameSrch: values.ownerNameSrch,
            curConSizeSrch: values.curConSizeSrch,
            usageTypeNewSrch: values.usageTypeNewSrch,
            erlDate: formatOracleDate(values.erlDate)
        };

        try {
            Swal.fire({
                text: "Submitting...",
                allowOutsideClick: false,
                allowEscapeKey: false,
                showConfirmButton: false,
                didOpen: () => Swal.showLoading()
            });

            const response = await axios.post(`${baseUrl}/api/FrmWaterRegister/save-water-register`,
                payload,
                { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
            );

            Swal.close();
            const result = response?.data?.data;

            if (!result?.success || Number(result?.errorCode) !== 9999) {
                Swal.fire({
                    icon: "error",
                    text: result?.message || "Unable to save water register."
                });
                return;
            }

            const message = result.message || "";
            const appNo = message.split("Appli no:")[1]?.split("$")[0]?.trim() || "";

            if (!appNo) {
                Swal.fire({
                    // icon: "warning",
                    text: "Application saved but Application No. was not returned."
                });
                return;
            }

            Swal.fire({
                text: "Uploading Documents...",
                allowOutsideClick: false,
                allowEscapeKey: false,
                showConfirmButton: false,
                didOpen: () => Swal.showLoading()
            });

            const uploadResults = await Promise.allSettled(
                documents.map((document) =>
                    uploadDocument(appNo, document)
                )
            );

            Swal.close();

            const failedUploads = uploadResults.filter((item) => item.status === "rejected");
            if (failedUploads.length) {
                console.error("Document Upload Errors:", failedUploads);

                Swal.fire({
                    icon: "error",
                    text: `${failedUploads.length} document(s) could not be uploaded. Application No: ${appNo}`
                });

                return;
            }
            await Swal.fire({
                icon: "success",
                text: message,
                confirmButtonText: "OK"
            });

            resetForm();
            setConsumerSearch("");
            setDocuments((prev) =>
                prev.map((item) => ({ ...item, file: null }))
            );
            navigate("/app/FrmTrackApplication")
        } catch (error) {
            Swal.close();
            console.error("Water Register Submit Error:", error);
            Swal.fire({
                icon: "error",
                text: error?.response?.data?.message || error?.response?.data?.error || "Unable to save water register."
            });
        }
    };

    return (
        <Formik initialValues={initialValues} onSubmit={handleSubmit}>
            {({ values, setFieldValue, resetForm }) => (
                <Form className="w-full">
                    <Card className="w-full">
                        <CardHeader className="border-b">
                            <CardTitle className="text-lg font-semibold text-[#083c76]">{serviceName}</CardTitle>
                        </CardHeader>

                        <CardContent className="p-5">
                            <div className="grid grid-cols-1 gap-x-12 gap-y-3 md:grid-cols-2">
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                                    <div className="flex shrink-0 items-center sm:w-40 sm:justify-between">
                                        <Label text="Applicant Name" required className="min-w-fit" />
                                        <span>:</span>
                                    </div>
                                    <Input
                                        value={values.detAppliName}
                                        onChange={(e) => setFieldValue("detAppliName", e.target.value)}
                                        className="w-full"
                                    />
                                </div>

                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                                    <div className="flex shrink-0 items-center sm:w-40 sm:justify-between">
                                        <Label text="Mobile No" required className="min-w-fit" />
                                        <span>:</span>
                                    </div>
                                    <Input
                                        value={values.detMobile}
                                        maxLength={10}
                                        inputMode="numeric"
                                        onChange={(e) =>
                                            setFieldValue("detMobile", e.target.value.replace(/\D/g, ""))
                                        }
                                        className="w-full"
                                    />
                                </div>

                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                                    <div className="flex shrink-0 items-center sm:w-40 sm:justify-between">
                                        <Label text="Aadhar No" required className="min-w-fit" />
                                        <span>:</span>
                                    </div>
                                    <Input
                                        value={values.detAadhaar}
                                        maxLength={12}
                                        inputMode="numeric"
                                        onChange={(e) =>
                                            setFieldValue("detAadhaar", e.target.value.replace(/\D/g, ""))
                                        }
                                        className="w-full"
                                    />
                                </div>

                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                                    <div className="flex shrink-0 items-center sm:w-40 sm:justify-between">
                                        <Label text="Email" required className="min-w-fit" />
                                        <span>:</span>
                                    </div>
                                    <Input
                                        type="email"
                                        value={values.detEmail}
                                        onChange={(e) => setFieldValue("detEmail", e.target.value)}
                                        className="w-full"
                                        maxLength={30}
                                    />
                                </div>

                                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-4 md:col-span-2">
                                    <div className="flex shrink-0 items-center sm:w-40 sm:justify-between">
                                        <Label text="Address" required className="min-w-fit" />
                                        <span>:</span>
                                    </div>
                                    <Textarea
                                        value={values.detAddress}
                                        onChange={(e) => setFieldValue("detAddress", e.target.value)}
                                        className="min-h-16 w-full"
                                    />
                                </div>

                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                                    <div className="flex shrink-0 items-center sm:w-40 sm:justify-between">
                                        <Label text="Zone" required className="min-w-fit" />
                                        <span>:</span>
                                    </div>
                                    <Select
                                        value={values.zoneId}
                                        onValueChange={(value) => setFieldValue("zoneId", value)}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="-- Select Option --" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {wards.map((item) => (
                                                <SelectItem
                                                    key={item.WARDID}
                                                    value={String(item.WARDID)}
                                                >
                                                    {item.WARDNAME}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                                    <div className="flex shrink-0 items-center sm:w-40 sm:justify-between">
                                        <Label text="Service Type" required className="min-w-fit" />
                                        <span>:</span>
                                    </div>
                                    <Select value={values.serviceId} disabled>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Reconnection" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {services.map((item) => (
                                                <SelectItem
                                                    key={item.NUM_SERVICE_SERVICEID}
                                                    value={String(item.NUM_SERVICE_SERVICEID)}
                                                >
                                                    {item.VAR_SERVICE_ENG_NAME}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {Number(serviceId) !== 22 && (
                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                                        <div className="flex shrink-0 items-center sm:w-40 sm:justify-between">
                                            <Label text="Disconnection Type" required className="min-w-fit" />
                                            <span>:</span>
                                        </div>
                                        <Select
                                            value={values.disConId}
                                            onValueChange={(value) => setFieldValue("disConId", value)}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="-- Select Option --" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {disconnectionTypes.map((item) => (
                                                    <SelectItem
                                                        key={item.NUM_DISCONN_ID}
                                                        value={String(item.NUM_DISCONN_ID)}
                                                    >
                                                        {item.VAR_DISCONN_NAME}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4 ">
                                    <div className="flex shrink-0 items-center sm:w-40 sm:justify-between">
                                        <Label text="Consumer No" required className="min-w-fit" />
                                        <span>:</span>
                                    </div>
                                    <div className="flex w-full gap-2">
                                        <Input
                                            value={consumerSearch}
                                            onChange={(e) => setConsumerSearch(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault();
                                                    fetchConnectionDetails(setFieldValue, consumerSearch);
                                                }
                                            }}
                                            className="w-full"
                                        />
                                        <Button
                                            type="button"
                                            onClick={() =>
                                                fetchConnectionDetails(setFieldValue, consumerSearch)
                                            }
                                            disabled={searching}
                                            className="shrink-0"
                                        >
                                            {searching ? "Searching" : "Search"}
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="my-5 border-t border-gray-200" />

                            <div className="grid grid-cols-1 gap-x-12 gap-y-3 md:grid-cols-2">
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4 md:col-span-2">
                                    <div className="flex shrink-0 items-center sm:w-40 sm:justify-between">
                                        <Label text="Consumer Address" className="min-w-fit" />
                                        <span>:</span>
                                    </div>
                                    <Input
                                        value={values.conAddressSrch}
                                        onChange={(e) =>
                                            setFieldValue("conAddressSrch", e.target.value)
                                        }
                                        className="w-full"
                                    />
                                </div>

                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                                    <div className="flex shrink-0 items-center sm:w-40 sm:justify-between">
                                        <Label text="Owner Name" className="min-w-fit" />
                                        <span>:</span>
                                    </div>
                                    <Input
                                        value={values.ownerName}
                                        onChange={(e) =>
                                            setFieldValue("ownerName", e.target.value)
                                        }
                                        className="w-full"
                                    />
                                </div>

                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                                    <div className="flex shrink-0 items-center sm:w-40 sm:justify-between">
                                        <Label text="Current Conn. Size" className="min-w-fit" />
                                        <span>:</span>
                                    </div>
                                    <Input
                                        maxLength={5}
                                        value={values.curConSizeSrch}
                                        onChange={(e) =>
                                            setFieldValue("curConSizeSrch", e.target.value.replace(/\D/g, ""))
                                        }
                                        className="w-full"
                                    />
                                </div>

                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                                    <div className="flex shrink-0 items-center sm:w-40 sm:justify-between">
                                        <Label text="Usage Type" className="min-w-fit" />
                                        <span>:</span>
                                    </div>
                                    <Input
                                        value={values.usageType}
                                        onChange={(e) =>
                                            setFieldValue("usageType", e.target.value)
                                        }
                                        className="w-full"
                                    />
                                </div>

                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                                    <div className="flex shrink-0 items-center sm:w-40 sm:justify-between">
                                        <Label text="Earlier Conn. Close Date" required className="min-w-fit" />
                                        <span>:</span>
                                    </div>


                                    <DatePicker
                                        value={values.erlDate}
                                        onChange={(date) =>
                                            setFieldValue("erlDate", date)
                                        }
                                    />
                                </div>

                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                                    <div className="flex shrink-0 items-center sm:w-40 sm:justify-between">
                                        <Label text="Change Usage Type" className="min-w-fit" />
                                        <span>:</span>
                                    </div>
                                    <Select
                                        value={values.usageTypeId}
                                        onValueChange={(value) => {
                                            const selected = usageTypes.find((item) =>
                                                String(item.NUM_USAGETYPE_ID) === String(value)
                                            );
                                            setFieldValue("usageTypeId", value);
                                            // setFieldValue("usageType", selected?.VAR_USAGETYPE_NAME || "");
                                            setFieldValue("usageTypeNewSrch", selected?.VAR_USAGETYPE_NAME || "");
                                        }}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="-- Select Option --" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {usageTypes.map((item) => (
                                                <SelectItem
                                                    key={item.NUM_USAGETYPE_ID}
                                                    value={String(item.NUM_USAGETYPE_ID)}
                                                >
                                                    {item.VAR_USAGETYPE_NAME}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                                    <div className="flex shrink-0 items-center sm:w-40 sm:justify-between">
                                        <Label text="New Conn Size" className="min-w-fit" />
                                        <span>:</span>
                                    </div>
                                    <Select
                                        value={values.connSize}
                                        onValueChange={(value) =>
                                            setFieldValue("connSize", value)
                                        }
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="-- Select Option --" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {connectionSizes.map((item) => (
                                                <SelectItem
                                                    key={item.NUM_CONNSIZE_ID}
                                                    value={String(item.NUM_CONNSIZE_ID)}
                                                >
                                                    {item.VAR_CONNSIZE_NAME}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="my-5 border-t border-gray-200" />
                            <div className="grid grid-cols-1 gap-x-12 gap-y-3 md:grid-cols-2">
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-4">
                                    <div className="flex shrink-0 items-center sm:w-40 sm:justify-between">
                                        <Label text="Reason" required className="min-w-fit" />
                                        <span>:</span>
                                    </div>
                                    <Textarea
                                        value={values.reason}
                                        onChange={(e) => setFieldValue("reason", e.target.value)}
                                        className="min-h-16 w-full"
                                        placeholder="Enter Reason"
                                    />
                                </div>

                                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-4">
                                    <div className="flex shrink-0 items-center sm:w-40 sm:justify-between">
                                        <Label text="Remark" required className="min-w-fit" />
                                        <span>:</span>
                                    </div>
                                    <Textarea
                                        value={values.remark}
                                        onChange={(e) =>
                                            setFieldValue("remark", e.target.value)
                                        }
                                        className="min-h-16 w-full"
                                    />
                                </div>
                            </div>

                            {documents.length > 0 && (
                                <div className="mt-6 border-t border-gray-200 pt-5">
                                    <div className="mx-auto w-full max-w-6xl overflow-x-auto">
                                        <ShadCNTable
                                            headers={["Sr. No.", "Document Name", "Image(jpg,png,pdf)"]}
                                            data={documents.map((item, index) => ({
                                                srNo: index + 1,
                                                documentName: item.DOCNAME,
                                                image: (
                                                    <Input
                                                        type="file"
                                                        accept=".jpg,.jpeg,.png,.pdf"
                                                        className="h-9 min-w-55 cursor-pointer"
                                                        onChange={(e) =>
                                                            handleFileChange(item.DOCID, e.target.files?.[0])
                                                        }
                                                    />
                                                )
                                            }))}
                                            keyMapping={{
                                                "Sr. No.": "srNo",
                                                "Document Name": "documentName",
                                                "Image(jpg,png,pdf)": "image"
                                            }}
                                            pagination={false}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-wrap items-center justify-center gap-3 pt-6">
                                <Button type="submit">Submit</Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        resetForm();
                                        setConsumerSearch("");
                                        setDocuments((prev) => prev.map((item) => ({ ...item, file: null })));
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

export default FrmWaterRegister;