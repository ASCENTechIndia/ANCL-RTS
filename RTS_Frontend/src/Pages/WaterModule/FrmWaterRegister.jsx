// import React, { useCallback, useEffect, useState } from "react";
// import axios from "axios";
// import Swal from "sweetalert2";
// import { Formik, Form } from "formik";
// import { useLocation, useNavigate } from "react-router-dom";
// import { useAuth } from "@/context/AuthContext";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import ShadCNTable from "@/components/ui/table";
// import config from "@/utils/config";
// import { DatePicker } from "@/components/ui/calendar";

// const FrmWaterRegister = () => {
//     const location = useLocation();
//     const navigate = useNavigate();
//     const { user, token } = useAuth();
//     const baseUrl = import.meta.env.VITE_BASE_URL;

//     const ulbId = Number(location.state?.ulbId ?? user?.ulbId);
//     const userId = Number(location.state?.userId ?? user?.userId);
//     const serviceId = Number(location.state?.serviceId ?? user?.serviceId);
//     const source = config?.source

//     const [serviceName, setServiceName] = useState("Reconnection");
//     const [wards, setWards] = useState([]);
//     const [services, setServices] = useState([]);
//     const [disconnectionTypes, setDisconnectionTypes] = useState([]);
//     const [usageTypes, setUsageTypes] = useState([]);
//     const [connectionSizes, setConnectionSizes] = useState([]);
//     const [documents, setDocuments] = useState([]);
//     const [consumerSearch, setConsumerSearch] = useState("");
//     const [searching, setSearching] = useState(false);

//     const initialValues = {
//         zoneId: "",
//         serviceId: String(serviceId),
//         consumerNo: "",
//         disConId: "",
//         reason: "",
//         usageTypeId: "",
//         tarifRate: "",
//         connSize: "",
//         remark: "",
//         ownerName: "",
//         usageType: "",
//         detAppliName: "",
//         detMobile: "",
//         detAadhaar: "",
//         detEmail: "",
//         detAddress: "",
//         conAddressSrch: "",
//         ownerNameSrch: "",
//         curConSizeSrch: "",
//         usageTypeNewSrch: "",
//         erlDate: new Date()
//     };

//     const getData = (result) => {
//         if (result.status !== "fulfilled") return [];
//         return result.value?.data?.data?.data || [];
//     };

//     const loadMasters = useCallback(async () => {
//         Swal.fire({
//             text: "Loading...",
//             allowOutsideClick: false,
//             allowEscapeKey: false,
//             showConfirmButton: false,
//             didOpen: () => Swal.showLoading()
//         });

//         const results = await Promise.allSettled([
//             axios.get(`${baseUrl}/api/FrmWaterRegister/ward-dropdown`, {
//                 params: { ulbid: ulbId },
//                 headers: { Authorization: `Bearer ${token}` }
//             }),
//             axios.get(`${baseUrl}/api/FrmWaterRegister/service-dropdown`, {
//                 params: { rptMode: 4 },
//                 headers: { Authorization: `Bearer ${token}` }
//             }),
//             axios.get(`${baseUrl}/api/FrmWaterRegister/disconnection-dropdown`, {
//                 headers: { Authorization: `Bearer ${token}` }
//             }),
//             axios.get(`${baseUrl}/api/FrmWaterRegister/usage-type-dropdown`, {
//                 headers: { Authorization: `Bearer ${token}` }
//             }),
//             axios.get(`${baseUrl}/api/FrmWaterRegister/connection-size-dropdown`, {
//                 headers: { Authorization: `Bearer ${token}` }
//             }),
//             axios.get(`${baseUrl}/api/FrmWaterRegister/service-name`, {
//                 params: { serviceId },
//                 headers: { Authorization: `Bearer ${token}` }
//             }),
//             axios.get(`${baseUrl}/api/FrmWaterRegister/documents`, {
//                 params: { ulbid: ulbId, serviceId },
//                 headers: { Authorization: `Bearer ${token}` }
//             })
//         ]);

//         Swal.close();

//         setWards(getData(results[0]));
//         setServices(getData(results[1]));
//         setDisconnectionTypes(getData(results[2]));
//         setUsageTypes(getData(results[3]));
//         setConnectionSizes(getData(results[4]));

//         const serviceData = getData(results[5]);

//         if (serviceData.length) {
//             setServiceName(serviceData[0]?.VAR_SERVICE_ENG_NAME || "-");
//         }
//         setDocuments(
//             getData(results[6]).map((item) => ({ ...item, file: null }))
//         );
//     }, [baseUrl, serviceId, token, ulbId]);

//     useEffect(() => {
//         if (token) {
//             loadMasters();
//         }
//     }, [loadMasters, token]);

//     const formatOracleDate = (date) => {
//         if (!date) return "";

//         const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

//         if (date instanceof Date && !Number.isNaN(date.getTime())) {
//             const day = String(date.getDate()).padStart(2, "0");
//             const month = months[date.getMonth()];
//             const year = date.getFullYear();

//             return `${day}-${month}-${year}`;
//         }

//         if (typeof date !== "string") return "";
//         if (/^\d{2}-[A-Z]{3}-\d{4}$/i.test(date)) {
//             return date.toUpperCase();
//         }
//         if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
//             const [year, month, day] = date.split("-");
//             return `${day}-${months[Number(month) - 1]}-${year}`;
//         }

//         const parsedDate = new Date(date);
//         if (!Number.isNaN(parsedDate.getTime())) {
//             const day = String(parsedDate.getDate()).padStart(2, "0");
//             const month = months[parsedDate.getMonth()];
//             const year = parsedDate.getFullYear();
//             return `${day}-${month}-${year}`;
//         }
//         return "";
//     };


//     const fetchConnectionDetails = async (setFieldValue, consumerNo) => {
//         const value = consumerNo.trim();

//         if (!value) {
//             Swal.fire({
//                 // icon: "warning",
//                 text: "Please enter Consumer No."
//             });
//             return;
//         }

//         setSearching(true);
//         Swal.fire({
//             text: "Loading...",
//             allowOutsideClick: false,
//             allowEscapeKey: false,
//             showConfirmButton: false,
//             didOpen: () => Swal.showLoading()
//         });


        // try {
        //     const response = await axios.get(`${baseUrl}/api/FrmWaterRegister/connection-details`,
        //         {
        //             params: { consumerNo: value, userId },
        //             headers: { Authorization: `Bearer ${token}` }
        //         }
        //     );

//             const details = response?.data?.data?.connectionOwners;

//             if (!details) {
//                 Swal.fire({
//                     // icon: "warning",
//                     text: response?.data?.data?.errors[0]?.detail
//                 });
//                 return;
//             }

//             const owner = details.owner || "";
//             const address = details.address?.trim() || "";
//             const usage = details.usage_type || "";

//             const usageMatch = usageTypes.find((item) =>
//                 String(item.VAR_USAGETYPE_NAME || "").trim().toLowerCase() === String(usage).trim().toLowerCase()
//             );
//             const sizeMatch = connectionSizes.find((item) =>
//                 Number(item.NUM_CONNSIZE_SIZE) === Number(details.connsize_size)
//             );
//             const zoneMatch = wards.find((item) =>
//                 String(item.WARDNAME || "").trim().toLowerCase() === String(details.zone_name || "").trim().toLowerCase()
//             );

//             setFieldValue("consumerNo", details.connno || value);
//             setConsumerSearch(details.connno || value);
//             // setFieldValue("zoneId", zoneMatch ? String(zoneMatch.WARDID) : "");
//             setFieldValue("ownerName", owner);
//             setFieldValue("ownerNameSrch", owner);
//             setFieldValue("usageType", usage);
//             setFieldValue("usageTypeNewSrch", usage);
//             setFieldValue("tarifRate", details.rate != null ? String(details.rate) : "");
//             setFieldValue("connSize", sizeMatch ? String(sizeMatch.NUM_CONNSIZE_ID) : "");
//             setFieldValue("usageTypeId", usageMatch ? String(usageMatch.NUM_USAGETYPE_ID) : "");
//             setFieldValue("detAppliName", owner);
//             setFieldValue("detAddress", address);
//             setFieldValue("conAddressSrch", address);
//             setFieldValue("curConSizeSrch", details.connsize_size != null ? String(details.connsize_size) : "");
//             Swal.close()
//             Swal.fire({
//                 icon: "success",
//                 text: "Connection details fetched successfully.",
//                 timer: 1200,
//                 showConfirmButton: false
//             });
//         } catch (error) {
//             console.error("Connection Details Error:", error);

//             Swal.fire({
//                 icon: "error",
//                 text: error?.response?.data?.message || error?.response?.data?.error || "Unable to fetch connection details."
//             });
//         } finally {
//             setSearching(false);
//         }
//     };

//     const handleFileChange = (documentId, file) => {
//         if (!file) return;

//         const extension = file.name.split(".").pop()?.toLowerCase();

//         if (!["jpg", "jpeg", "png", "pdf"].includes(extension)) {
//             Swal.fire({
//                 // icon: "warning",
//                 text: "Only JPG, JPEG, PNG and PDF files are allowed."
//             });
//             return;
//         }

//         if (file.size > 5 * 1024 * 1024) {
//             Swal.fire({
//                 // icon: "warning",
//                 text: "File size should not exceed 5 MB."
//             });
//             return;
//         }

//         setDocuments((prev) =>
//             prev.map((item) => String(item.DOCID) === String(documentId) ? { ...item, file } : item)
//         );
//     };

//     const uploadDocument = async (appNo, document) => {
//         const formData = new FormData();

//         formData.append("corpid", String(ulbId));
//         formData.append("serviceid", String(serviceId));
//         formData.append("appno", appNo);
//         formData.append("doctype", document.DOCTYPE || "A");
//         formData.append("documentid", String(document.DOCID));
//         formData.append("file", document.file);

//         return axios.post(`${baseUrl}/api/FrmWaterRegister/upload-document`,
//             formData,
//             { headers: { Authorization: `Bearer ${token}` } }
//         );
//     };

//     const handleSubmit = async (values, { resetForm }) => {
//         if (!values.zoneId) {
//             Swal.fire({
//                 // icon: "warning",
//                 text: "Please select Zone."
//             });
//             return;
//         }

//         if (!values.consumerNo.trim()) {
//             Swal.fire({
//                 // icon: "warning",
//                 text: "Please enter Consumer No."
//             });
//             return;
//         }

//         if (!values.detAppliName.trim()) {
//             Swal.fire({
//                 // icon: "warning",
//                 text: "Please enter Applicant Name."
//             });
//             return;
//         }

//         if (!/^\d{10}$/.test(values.detMobile)) {
//             Swal.fire({
//                 // icon: "warning",
//                 text: "Please enter valid 10 digit Mobile No."
//             });
//             return;
//         }

//         if (!/^\d{12}$/.test(values.detAadhaar)) {
//             Swal.fire({
//                 // icon: "warning",
//                 text: "Please enter valid 12 digit Aadhar No."
//             });
//             return;
//         }

//         if (!values.detEmail.trim()) {
//             Swal.fire({
//                 // icon: "warning",
//                 text: "Please enter Email."
//             });
//             return;
//         }

//         if (!values.detAddress.trim()) {
//             Swal.fire({
//                 // icon: "warning",
//                 text: "Please enter Address."
//             });
//             return;
//         }

//         if (!values.usageTypeId) {
//             Swal.fire({
//                 // icon: "warning",
//                 text: "Please select Usage Type."
//             });
//             return;
//         }

//         if (!values.connSize) {
//             Swal.fire({
//                 // icon: "warning",
//                 text: "Please select Connection Size."
//             });
//             return;
//         }

//         if (Number(serviceId) !== 22 && !values.disConId) {
//             Swal.fire({
//                 // icon: "warning",
//                 text: "Please select Disconnection Type."
//             });
//             return;
//         }

//         if (!values.reason.trim()) {
//             Swal.fire({
//                 // icon: "warning",
//                 text: "Please enter Reason."
//             });
//             return;
//         }

//         if (!values.remark.trim()) {
//             Swal.fire({
//                 // icon: "warning",
//                 text: "Please enter Remark."
//             });
//             return;
//         }

//         if (!values.erlDate) {
//             Swal.fire({
//                 // icon: "warning",
//                 text: "Please select Earlier Connection Close Date."
//             });
//             return;
//         }

//         // if (!documents.length) {
//         //     Swal.fire({
//         //         // icon: "warning",
//         //         text: "Document Required."
//         //     });
//         //     return;
//         // }

//         const missingDocuments = documents.filter((item) => !item.file);
//         if (missingDocuments.length) {
//             Swal.fire({
//                 // icon: "warning",
//                 text: "Please upload all required documents before submission."
//             });
//             return;
//         }

//         const payload = {
//             userId,
//             wtregId: 0,
//             servId: Number(values.serviceId),
//             consNo: values.consumerNo.trim(),
//             disConId: Number(serviceId) == 22 ? null : Number(values.disConId),
//             reason: values.reason.trim(),
//             usageTypeId: Number(values.usageTypeId),
//             tarifRate: Number(values.tarifRate || 0),
//             connSize: Number(values.connSize),
//             remark: values.remark.trim(),
//             ulbid: Number(ulbId),
//             zoneId: Number(values.zoneId),
//             source,
//             ownerName: values.ownerName,
//             usageType: values.usageType,
//             detAppliName: values.detAppliName.trim(),
//             detMobile: Number(values.detMobile),
//             detAadhaar: values.detAadhaar.trim(),
//             detEmail: values.detEmail.trim(),
//             detAddress: values.detAddress.trim(),
//             conAddressSrch: values.conAddressSrch,
//             ownerNameSrch: values.ownerNameSrch,
//             curConSizeSrch: values.curConSizeSrch,
//             usageTypeNewSrch: values.usageTypeNewSrch,
//             erlDate: formatOracleDate(values.erlDate)
//         };

//         try {
//             Swal.fire({
//                 text: "Submitting...",
//                 allowOutsideClick: false,
//                 allowEscapeKey: false,
//                 showConfirmButton: false,
//                 didOpen: () => Swal.showLoading()
//             });

//             const response = await axios.post(`${baseUrl}/api/FrmWaterRegister/save-water-register`,
//                 payload,
//                 { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
//             );

//             Swal.close();
//             const result = response?.data?.data;

//             if (!result?.success || Number(result?.errorCode) !== 9999) {
//                 Swal.fire({
//                     icon: "error",
//                     text: result?.message || "Unable to save water register."
//                 });
//                 return;
//             }

//             const message = result.message || "";
//             const appNo = message.split("Appli no:")[1]?.split("$")[0]?.trim() || "";

//             if (!appNo) {
//                 Swal.fire({
//                     // icon: "warning",
//                     text: "Application saved but Application No. was not returned."
//                 });
//                 return;
//             }

//             Swal.fire({
//                 text: "Uploading Documents...",
//                 allowOutsideClick: false,
//                 allowEscapeKey: false,
//                 showConfirmButton: false,
//                 didOpen: () => Swal.showLoading()
//             });

//             const uploadResults = await Promise.allSettled(
//                 documents.map((document) =>
//                     uploadDocument(appNo, document)
//                 )
//             );

//             Swal.close();

//             const failedUploads = uploadResults.filter((item) => item.status === "rejected");
//             if (failedUploads.length) {
//                 console.error("Document Upload Errors:", failedUploads);

//                 Swal.fire({
//                     icon: "error",
//                     text: `${failedUploads.length} document(s) could not be uploaded. Application No: ${appNo}`
//                 });

//                 return;
//             }
//             await Swal.fire({
//                 icon: "success",
//                 text: message,
//                 confirmButtonText: "OK"
//             });

//             resetForm();
//             setConsumerSearch("");
//             setDocuments((prev) =>
//                 prev.map((item) => ({ ...item, file: null }))
//             );
//             navigate("/app/FrmTrackApplication")
//         } catch (error) {
//             Swal.close();
//             console.error("Water Register Submit Error:", error);
//             Swal.fire({
//                 icon: "error",
//                 text: error?.response?.data?.message || error?.response?.data?.error || "Unable to save water register."
//             });
//         }
//     };

//     return (
//         <Formik initialValues={initialValues} onSubmit={handleSubmit}>
//             {({ values, setFieldValue, resetForm }) => (
//                 <Form className="w-full">
//                     <Card className="w-full">
//                         <CardHeader className="border-b">
//                             <CardTitle className="text-lg font-semibold text-[#083c76]">{serviceName}</CardTitle>
//                         </CardHeader>

//                         <CardContent className="p-5">
//                             <div className="grid grid-cols-1 gap-x-12 gap-y-3 md:grid-cols-2">
//                                 <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
//                                     <div className="flex shrink-0 items-center sm:w-40 sm:justify-between">
//                                         <Label text="Applicant Name" required className="min-w-fit" />
//                                         <span>:</span>
//                                     </div>
//                                     <Input
//                                         value={values.detAppliName}
//                                         onChange={(e) => setFieldValue("detAppliName", e.target.value)}
//                                         className="w-full"
//                                     />
//                                 </div>

//                                 <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
//                                     <div className="flex shrink-0 items-center sm:w-40 sm:justify-between">
//                                         <Label text="Mobile No" required className="min-w-fit" />
//                                         <span>:</span>
//                                     </div>
//                                     <Input
//                                         value={values.detMobile}
//                                         maxLength={10}
//                                         inputMode="numeric"
//                                         onChange={(e) =>
//                                             setFieldValue("detMobile", e.target.value.replace(/\D/g, ""))
//                                         }
//                                         className="w-full"
//                                     />
//                                 </div>

//                                 <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
//                                     <div className="flex shrink-0 items-center sm:w-40 sm:justify-between">
//                                         <Label text="Aadhar No" required className="min-w-fit" />
//                                         <span>:</span>
//                                     </div>
//                                     <Input
//                                         value={values.detAadhaar}
//                                         maxLength={12}
//                                         inputMode="numeric"
//                                         onChange={(e) =>
//                                             setFieldValue("detAadhaar", e.target.value.replace(/\D/g, ""))
//                                         }
//                                         className="w-full"
//                                     />
//                                 </div>

//                                 <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
//                                     <div className="flex shrink-0 items-center sm:w-40 sm:justify-between">
//                                         <Label text="Email" required className="min-w-fit" />
//                                         <span>:</span>
//                                     </div>
//                                     <Input
//                                         type="email"
//                                         value={values.detEmail}
//                                         onChange={(e) => setFieldValue("detEmail", e.target.value)}
//                                         className="w-full"
//                                         maxLength={30}
//                                     />
//                                 </div>

//                                 <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-4 md:col-span-2">
//                                     <div className="flex shrink-0 items-center sm:w-40 sm:justify-between">
//                                         <Label text="Address" required className="min-w-fit" />
//                                         <span>:</span>
//                                     </div>
//                                     <Textarea
//                                         value={values.detAddress}
//                                         onChange={(e) => setFieldValue("detAddress", e.target.value)}
//                                         className="min-h-16 w-full"
//                                     />
//                                 </div>

//                                 <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
//                                     <div className="flex shrink-0 items-center sm:w-40 sm:justify-between">
//                                         <Label text="Zone" required className="min-w-fit" />
//                                         <span>:</span>
//                                     </div>
//                                     <Select
//                                         value={values.zoneId}
//                                         onValueChange={(value) => setFieldValue("zoneId", value)}
//                                     >
//                                         <SelectTrigger className="w-full">
//                                             <SelectValue placeholder="-- Select Option --" />
//                                         </SelectTrigger>
//                                         <SelectContent>
//                                             {wards.map((item) => (
//                                                 <SelectItem
//                                                     key={item.WARDID}
//                                                     value={String(item.WARDID)}
//                                                 >
//                                                     {item.WARDNAME}
//                                                 </SelectItem>
//                                             ))}
//                                         </SelectContent>
//                                     </Select>
//                                 </div>

//                                 <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
//                                     <div className="flex shrink-0 items-center sm:w-40 sm:justify-between">
//                                         <Label text="Service Type" required className="min-w-fit" />
//                                         <span>:</span>
//                                     </div>
//                                     <Select value={values.serviceId} disabled>
//                                         <SelectTrigger className="w-full">
//                                             <SelectValue placeholder="Reconnection" />
//                                         </SelectTrigger>
//                                         <SelectContent>
//                                             {services.map((item) => (
//                                                 <SelectItem
//                                                     key={item.NUM_SERVICE_SERVICEID}
//                                                     value={String(item.NUM_SERVICE_SERVICEID)}
//                                                 >
//                                                     {item.VAR_SERVICE_ENG_NAME}
//                                                 </SelectItem>
//                                             ))}
//                                         </SelectContent>
//                                     </Select>
//                                 </div>

//                                 {Number(serviceId) !== 22 && (
//                                     <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
//                                         <div className="flex shrink-0 items-center sm:w-40 sm:justify-between">
//                                             <Label text="Disconnection Type" required className="min-w-fit" />
//                                             <span>:</span>
//                                         </div>
//                                         <Select
//                                             value={values.disConId}
//                                             onValueChange={(value) => setFieldValue("disConId", value)}
//                                         >
//                                             <SelectTrigger className="w-full">
//                                                 <SelectValue placeholder="-- Select Option --" />
//                                             </SelectTrigger>
//                                             <SelectContent>
//                                                 {disconnectionTypes.map((item) => (
//                                                     <SelectItem
//                                                         key={item.NUM_DISCONN_ID}
//                                                         value={String(item.NUM_DISCONN_ID)}
//                                                     >
//                                                         {item.VAR_DISCONN_NAME}
//                                                     </SelectItem>
//                                                 ))}
//                                             </SelectContent>
//                                         </Select>
//                                     </div>
//                                 )}

//                                 <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4 ">
//                                     <div className="flex shrink-0 items-center sm:w-40 sm:justify-between">
//                                         <Label text="Consumer No" required className="min-w-fit" />
//                                         <span>:</span>
//                                     </div>
//                                     <div className="flex w-full gap-2">
//                                         <Input
//                                             value={consumerSearch}
//                                             onChange={(e) => setConsumerSearch(e.target.value)}
//                                             onKeyDown={(e) => {
//                                                 if (e.key === "Enter") {
//                                                     e.preventDefault();
//                                                     fetchConnectionDetails(setFieldValue, consumerSearch);
//                                                 }
//                                             }}
//                                             className="w-full"
//                                         />
//                                         <Button
//                                             type="button"
//                                             onClick={() =>
//                                                 fetchConnectionDetails(setFieldValue, consumerSearch)
//                                             }
//                                             disabled={searching}
//                                             className="shrink-0"
//                                         >
//                                             {searching ? "Searching" : "Search"}
//                                         </Button>
//                                     </div>
//                                 </div>
//                             </div>

//                             <div className="my-5 border-t border-gray-200" />

//                             <div className="grid grid-cols-1 gap-x-12 gap-y-3 md:grid-cols-2">
//                                 <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4 md:col-span-2">
//                                     <div className="flex shrink-0 items-center sm:w-40 sm:justify-between">
//                                         <Label text="Consumer Address" className="min-w-fit" />
//                                         <span>:</span>
//                                     </div>
//                                     <Input
//                                         value={values.conAddressSrch}
//                                         onChange={(e) =>
//                                             setFieldValue("conAddressSrch", e.target.value)
//                                         }
//                                         className="w-full"
//                                     />
//                                 </div>

//                                 <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
//                                     <div className="flex shrink-0 items-center sm:w-40 sm:justify-between">
//                                         <Label text="Owner Name" className="min-w-fit" />
//                                         <span>:</span>
//                                     </div>
//                                     <Input
//                                         value={values.ownerName}
//                                         onChange={(e) =>
//                                             setFieldValue("ownerName", e.target.value)
//                                         }
//                                         className="w-full"
//                                     />
//                                 </div>

//                                 <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
//                                     <div className="flex shrink-0 items-center sm:w-40 sm:justify-between">
//                                         <Label text="Current Conn. Size" className="min-w-fit" />
//                                         <span>:</span>
//                                     </div>
//                                     <Input
//                                         maxLength={5}
//                                         value={values.curConSizeSrch}
//                                         onChange={(e) =>
//                                             setFieldValue("curConSizeSrch", e.target.value.replace(/\D/g, ""))
//                                         }
//                                         className="w-full"
//                                     />
//                                 </div>

//                                 <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
//                                     <div className="flex shrink-0 items-center sm:w-40 sm:justify-between">
//                                         <Label text="Usage Type" className="min-w-fit" />
//                                         <span>:</span>
//                                     </div>
//                                     <Input
//                                         value={values.usageType}
//                                         onChange={(e) =>
//                                             setFieldValue("usageType", e.target.value)
//                                         }
//                                         className="w-full"
//                                     />
//                                 </div>

//                                 <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
//                                     <div className="flex shrink-0 items-center sm:w-40 sm:justify-between">
//                                         <Label text="Earlier Conn. Close Date" required className="min-w-fit" />
//                                         <span>:</span>
//                                     </div>


//                                     <DatePicker
//                                         value={values.erlDate}
//                                         onChange={(date) =>
//                                             setFieldValue("erlDate", date)
//                                         }
//                                     />
//                                 </div>

//                                 <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
//                                     <div className="flex shrink-0 items-center sm:w-40 sm:justify-between">
//                                         <Label text="Change Usage Type" className="min-w-fit" />
//                                         <span>:</span>
//                                     </div>
//                                     <Select
//                                         value={values.usageTypeId}
//                                         onValueChange={(value) => {
//                                             const selected = usageTypes.find((item) =>
//                                                 String(item.NUM_USAGETYPE_ID) === String(value)
//                                             );
//                                             setFieldValue("usageTypeId", value);
//                                             // setFieldValue("usageType", selected?.VAR_USAGETYPE_NAME || "");
//                                             setFieldValue("usageTypeNewSrch", selected?.VAR_USAGETYPE_NAME || "");
//                                         }}
//                                     >
//                                         <SelectTrigger className="w-full">
//                                             <SelectValue placeholder="-- Select Option --" />
//                                         </SelectTrigger>
//                                         <SelectContent>
//                                             {usageTypes.map((item) => (
//                                                 <SelectItem
//                                                     key={item.NUM_USAGETYPE_ID}
//                                                     value={String(item.NUM_USAGETYPE_ID)}
//                                                 >
//                                                     {item.VAR_USAGETYPE_NAME}
//                                                 </SelectItem>
//                                             ))}
//                                         </SelectContent>
//                                     </Select>
//                                 </div>

//                                 <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
//                                     <div className="flex shrink-0 items-center sm:w-40 sm:justify-between">
//                                         <Label text="New Conn Size" className="min-w-fit" />
//                                         <span>:</span>
//                                     </div>
//                                     <Select
//                                         value={values.connSize}
//                                         onValueChange={(value) =>
//                                             setFieldValue("connSize", value)
//                                         }
//                                     >
//                                         <SelectTrigger className="w-full">
//                                             <SelectValue placeholder="-- Select Option --" />
//                                         </SelectTrigger>
//                                         <SelectContent>
//                                             {connectionSizes.map((item) => (
//                                                 <SelectItem
//                                                     key={item.NUM_CONNSIZE_ID}
//                                                     value={String(item.NUM_CONNSIZE_ID)}
//                                                 >
//                                                     {item.VAR_CONNSIZE_NAME}
//                                                 </SelectItem>
//                                             ))}
//                                         </SelectContent>
//                                     </Select>
//                                 </div>
//                             </div>

//                             <div className="my-5 border-t border-gray-200" />
//                             <div className="grid grid-cols-1 gap-x-12 gap-y-3 md:grid-cols-2">
//                                 <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-4">
//                                     <div className="flex shrink-0 items-center sm:w-40 sm:justify-between">
//                                         <Label text="Reason" required className="min-w-fit" />
//                                         <span>:</span>
//                                     </div>
//                                     <Textarea
//                                         value={values.reason}
//                                         onChange={(e) => setFieldValue("reason", e.target.value)}
//                                         className="min-h-16 w-full"
//                                         placeholder="Enter Reason"
//                                     />
//                                 </div>

//                                 <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-4">
//                                     <div className="flex shrink-0 items-center sm:w-40 sm:justify-between">
//                                         <Label text="Remark" required className="min-w-fit" />
//                                         <span>:</span>
//                                     </div>
//                                     <Textarea
//                                         value={values.remark}
//                                         onChange={(e) =>
//                                             setFieldValue("remark", e.target.value)
//                                         }
//                                         className="min-h-16 w-full"
//                                     />
//                                 </div>
//                             </div>

//                             {documents.length > 0 && (
//                                 <div className="mt-6 border-t border-gray-200 pt-5">
//                                     <div className="mx-auto w-full max-w-6xl overflow-x-auto">
//                                         <ShadCNTable
//                                             headers={["Sr. No.", "Document Name", "Image(jpg,png,pdf)"]}
//                                             data={documents.map((item, index) => ({
//                                                 srNo: index + 1,
//                                                 documentName: item.DOCNAME,
//                                                 image: (
//                                                     <Input
//                                                         type="file"
//                                                         accept=".jpg,.jpeg,.png,.pdf"
//                                                         className="h-9 min-w-55 cursor-pointer"
//                                                         onChange={(e) =>
//                                                             handleFileChange(item.DOCID, e.target.files?.[0])
//                                                         }
//                                                     />
//                                                 )
//                                             }))}
//                                             keyMapping={{
//                                                 "Sr. No.": "srNo",
//                                                 "Document Name": "documentName",
//                                                 "Image(jpg,png,pdf)": "image"
//                                             }}
//                                             pagination={false}
//                                         />
//                                     </div>
//                                 </div>
//                             )}

//                             <div className="flex flex-wrap items-center justify-center gap-3 pt-6">
//                                 <Button type="submit">Submit</Button>
//                                 <Button
//                                     type="button"
//                                     variant="outline"
//                                     onClick={() => {
//                                         resetForm();
//                                         setConsumerSearch("");
//                                         setDocuments((prev) => prev.map((item) => ({ ...item, file: null })));
//                                     }}
//                                 >
//                                     Reset
//                                 </Button>
//                             </div>
//                         </CardContent>
//                     </Card>
//                 </Form>
//             )}
//         </Formik>
//     );
// };

// export default FrmWaterRegister;


// FrmWaterRegister.jsx
import React, { useState, useEffect, useRef, useMemo } from "react";
import { Formik, Form } from "formik";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import Swal from "sweetalert2";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import config from "@/utils/config";

const initialValues = {
  zoneId: "",
  serviceType: "",
  consumerNo: "",
  disconType: "",
  reason: "",
  usageType: "",
  tariffRate: "",
  newConSize: "",
  remark: "",
  consumerAddr: "",
  ownName: "",
  propNo: "",
  tarriff: "",
  currConnsize: "",
  existUsage: "",
  lblWard: "",
  lblZone: "",
  lblBlock: "",
  lblPTN: "",
  lblConAddress: "",
  lblOwnerName: "",
  lblUsageType: "",
  lblExisttraRate: "",
  lblCurConsize: "",
  firstName: "",
  middleName: "",
  lastName: "",
  address: "",
  firstNameMr: "",
  middleNameMr: "",
  lastNameMr: "",
  addressMr: "",
  reasonMar: "",
  remarkMar: "",
};

const SERVICE_FIELD_MAP = {
  "19":  { disconType: false, reason: false, reasonMar: false, usageType: true, tariffRate: true, newConSize: true,  remark: true, remarkMar: true },
  "21":  { disconType: false, reason: false, reasonMar: false, usageType: true, tariffRate: true, newConSize: true,  remark: true, remarkMar: true },
  "22":  { disconType: false, reason: false, reasonMar: false, usageType: true, tariffRate: true, newConSize: true,  remark: true, remarkMar: true },
  "196": { disconType: true,  reason: true,  reasonMar: true,  usageType: false, tariffRate: false, newConSize: false, remark: true, remarkMar: true },
};

const DEFAULT_FIELD_VISIBILITY = {
  disconType: true,
  reason: true,
  reasonMar: true,
  usageType: true,
  tariffRate: true,
  newConSize: true,
  remark: true,
  remarkMar: true,
};

const col = (row, upper, lower) => row?.[upper] ?? row?.[lower] ?? "";

const FrmWaterRegister = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token } = useAuth();
  const isFirstRender = useRef(true);

  const locationState = location.state || {};

  const ulbId       = locationState.ulbId       ?? user?.ulbId       ?? sessionStorage.getItem("ulbID");
  const userId      = locationState.userId      ?? user?.userId      ?? sessionStorage.getItem("UserUniqueId");
  const deptId      = locationState.deptId      ?? sessionStorage.getItem("DepartmentId");
  const serviceId   = locationState.serviceId   ?? sessionStorage.getItem("ServiceId");
  const serviceName = locationState.serviceName ?? sessionStorage.getItem("ServEngName");
  const appNo       = locationState.appNo       ?? sessionStorage.getItem("AppNo");
  const mode        = locationState.mode        ?? Number(sessionStorage.getItem("Mode") || 0);
  const corpId      = locationState.corpId  ?? user?.corpId  ?? sessionStorage.getItem("CorpId");

  const isViewMode = mode === 4;

  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const API = `${BASE_URL}/api/FrmWaterRegister`;
  const isManualEntryUlb =
    Array.isArray(config.connSearchUlbs) &&
    config.connSearchUlbs.map(Number).includes(Number(ulbId));

  const showSearchButton = !isManualEntryUlb;

  const authHeaders = useMemo(() => ({
    Authorization: `Bearer ${token || localStorage.getItem("token")}`,
    "Content-Type": "application/json",
  }), [token]);

  const post = (path, body)   => axios.post(`${API}${path}`, body, { headers: authHeaders });
  const get  = (path, params) => axios.get(`${API}${path}`, { params, headers: authHeaders });
  const unwrap = (res) => res?.data?.data?.data ?? res?.data?.data ?? [];

  const [loading, setLoading]     = useState(false);
  const [searching, setSearching] = useState(false);
  const [pageTitle, setPageTitle] = useState(serviceName || "Water Registration");
  const [servCode, setServCode]   = useState("");

  const [zoneIdList, setZoneIdList]           = useState([]);
  const [serviceTypeList, setServiceTypeList] = useState([]);
  const [disconTypeList, setDisconTypeList]   = useState([]);
  const [usageTypeList, setUsageTypeList]     = useState([]);
  const [existUsageList, setExistUsageList]   = useState([]);
  const [newConSizeList, setNewConSizeList]   = useState([]);
  const [currConSizeList, setCurrConSizeList] = useState([]);

  useEffect(() => {
    if (!ulbId || !isFirstRender.current) return;
    isFirstRender.current = false;
    fetchAllData();
  }, [ulbId]);

  const fetchAllData = async () => {
    try {
      const [zonesRes, servicesRes, disconRes, usageRes, sizesRes] = await Promise.all([
        post("/get-ward-list", { ulbID: Number(ulbId) }),
        post("/get-service-list", {
          ulbID: Number(ulbId),
          ...(Number(mode) !== 4 && deptId ? { departmentId: Number(deptId) } : {}),
          mode: Number(mode),
        }),
        post("/get-disconnection-types", {}),
        post("/get-usage-types", { ulbID: Number(ulbId) }),
        post("/get-connection-sizes", { ulbID: Number(ulbId) }),
      ]);

      const zones  = unwrap(zonesRes);
      const svc    = unwrap(servicesRes);
      const discon = unwrap(disconRes);
      const usage  = unwrap(usageRes);
      const sizes  = unwrap(sizesRes);

      setZoneIdList(zones);
      setServiceTypeList(svc);
      setDisconTypeList(discon);
      setUsageTypeList(usage);
      setExistUsageList(usage);
      setNewConSizeList(sizes);
      setCurrConSizeList(sizes);

      if (serviceId) resolveServCode(svc, serviceId);
      if (isViewMode && appNo) prefill(appNo);
    } catch (err) {
      console.error("Error loading dropdowns:", err);
      Swal.fire({
        text: err.response?.data?.message || "Failed to load dropdown data",
        confirmButtonColor: "#1e3a8a",
      });
    }
  };

  const resolveServCode = (list, svcId) => {
    const match = list.find(
      (s) => String(col(s, "NUM_SERVICE_SERVICEID", "num_service_serviceid")) === String(svcId)
    );
    setServCode(match?.SERVCODE || match?.servCode || "");
  };

  const showDisconPanel = !servCode ? true : servCode !== "CDC";

  const prefill = async (applicationNo) => {
    try {
      const res = await post("/get-water-register-prefill", { appliNo: applicationNo });
      const d = res?.data?.data?.data;
      if (d) window.__prefillData = d;
    } catch (e) {
      console.error("Prefill failed", e);
    }
  };

  const fetchConnectionDetails = async (setFieldValue, consumerNo) => {
    const value = consumerNo?.trim();

    if (!value) {
      Swal.fire({ text: "Please enter Consumer No.", confirmButtonColor: "#1e3a8a" });
      return;
    }

    setSearching(true);
    Swal.fire({
      text: "Loading...",
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const response = await get("/connection-details", {
        consumerNo: value,
        userId,
        ulbId: Number(ulbId),
      });

      const payload = response?.data?.data;
      const details = payload?.connectionOwners;
      const errors  = payload?.errors;

      if (!details) {
        Swal.fire({
          text:
            errors?.[0]?.detail ||
            response?.data?.message ||
            `Connection not found for ${value}`,
          confirmButtonColor: "#1e3a8a",
        });
        return;
      }

      const owner   = details.owner      || "";
      const address = (details.address   || "").trim();
      const usage   = details.usage_type || "";

      const usageMatch = usageTypeList.find(
        (item) =>
          String(col(item, "VAR_USAGETYPE_NAME", "var_usagetype_name"))
            .trim().toLowerCase() === String(usage).trim().toLowerCase()
      );

      const sizeMatch = currConSizeList.find(
        (item) =>
          String(col(item, "VAR_CONNSIZE_NAME", "var_connsize_name"))
            .trim().toLowerCase() === String(details.connsize_size ?? "").trim().toLowerCase()
      );

      const zoneMatch = zoneIdList.find(
        (item) =>
          String(col(item, "WARDNAME", "wardname"))
            .trim().toLowerCase() === String(details.zone_name || "").trim().toLowerCase()
      );

      setFieldValue("consumerNo",      details.connno || value);
      setFieldValue("lblWard",         details.ward_name     || "");
      setFieldValue("lblZone",         details.zone_name     || "");
      setFieldValue("lblBlock",        details.block_name    || "");
      setFieldValue("lblPTN",          details.conn_ptnno    || "");
      setFieldValue("lblConAddress",   address);
      setFieldValue("lblOwnerName",    owner);
      setFieldValue("lblUsageType",    usage);
      setFieldValue("lblExisttraRate", details.rate != null ? String(details.rate) : "");
      setFieldValue("lblCurConsize",   details.connsize_size != null ? String(details.connsize_size) : "");

      setFieldValue("consumerAddr", address);
      setFieldValue("ownName",      owner);
      setFieldValue("tarriff",      details.rate != null ? String(details.rate) : "");
      setFieldValue(
        "existUsage",
        usageMatch ? String(col(usageMatch, "NUM_USAGETYPE_ID", "num_usagetype_id")) : ""
      );
      setFieldValue(
        "currConnsize",
        sizeMatch ? String(col(sizeMatch, "NUM_CONNSIZE_ID", "num_connsize_id")) : ""
      );

      if (zoneMatch) {
        setFieldValue("zoneId", String(col(zoneMatch, "WARDID", "wardid")));
      }

      Swal.close();
      Swal.fire({
        icon: "success",
        text: "Connection details fetched successfully.",
        timer: 1200,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Connection Details Error:", error);
      Swal.fire({
        icon: "error",
        text:
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Unable to fetch connection details.",
      });
    } finally {
      setSearching(false);
    }
  };

  const validateFields = (values) => {
    const show = (msg) => { Swal.fire({ text: msg, confirmButtonColor: "#1e3a8a" }); return false; };

    if (!values.zoneId || values.zoneId === "0") return show("Select valid Zone from the list");
    if (!values.serviceType)                     return show("Select valid Service from the list");

    if (isManualEntryUlb) {
      if (!values.consumerAddr?.trim()) return show("Please Enter Consumer Address");
      if (!values.ownName?.trim())      return show("Please Enter Owner Name");
      if (!values.propNo?.trim())       return show("Please Enter Property No");
      if (!values.tarriff?.trim())      return show("Please Enter Tarriff Rate");
      if (!values.currConnsize || values.currConnsize === "0") return show("Select valid Connection Size");
      if (!values.existUsage  || values.existUsage  === "0")   return show("Select valid Usage Type");
    } else {
      if (!values.consumerNo?.trim()) return show("Please Enter Consumer No");
    }

    if (!values.firstName?.trim())    return show("First Name can not be blank");
    if (!values.middleName?.trim())   return show("Middle Name can not be blank");
    if (!values.lastName?.trim())     return show("Last Name can not be blank");
    if (!values.firstNameMr?.trim())  return show("First Name Marathi can not be blank");
    if (!values.middleNameMr?.trim()) return show("Middle Name Marathi can not be blank");
    if (!values.lastNameMr?.trim())   return show("Last Name Marathi can not be blank");
    if (!values.address?.trim())      return show("Address can not be blank");
    if (!values.addressMr?.trim())    return show("Address Marathi can not be blank");
    if (!values.remark?.trim())       return show("Please Enter Remark");

    return true;
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    debugger;
    if (!validateFields(values)) return;
    setLoading(true);

    Swal.fire({
      title: "",
      text: "Submitting Application...",
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const inStr = isManualEntryUlb
        ? [
            values.ward ?? "", values.zone ?? "", values.block ?? "",
            values.consumerAddr, values.ownName, values.propNo,
            values.tarriff, values.currConnsize, values.existUsage,
          ].join("$")
        : "";

      const savePayload = {
        userId,
        wtregId: 0,
        servId: values.serviceType,
        consNo: values.consumerNo?.trim() || "",
        disConId: values.disconType ? Number(values.disconType) : null,
        reason: values.reason?.trim() || "",
        usageTypeId: values.usageType ? Number(values.usageType) : null,
        tarifRate: values.tariffRate ? Number(values.tariffRate) : null,
        connSize: values.newConSize ? Number(values.newConSize) : null,
        remark: values.remark?.trim() || "",
        ulbid: Number(ulbId),
        zoneId: Number(values.zoneId),
        source: config.source,
        ownerName: isManualEntryUlb ? values.ownName?.trim() : values.lblOwnerName,
        usageType: isManualEntryUlb ? "" : values.lblUsageType,
        inStr,
        firstName:  values.firstName?.trim(),
        middleName: values.middleName?.trim(),
        lastName:   values.lastName?.trim(),
        appAddress: values.address?.trim(),
        firstNameMr:  values.firstNameMr?.trim(),
        middleNameMr: values.middleNameMr?.trim(),
        lastNameMr:   values.lastNameMr?.trim(),
        addressMr:    values.addressMr?.trim(),
        remarkMar:    values.remarkMar?.trim() || "",
        reasonMar:    values.reasonMar?.trim() || "",
      };

      const saveRes = await post("/save-water-register", savePayload);
      const saveData = saveRes?.data?.data;

      if (!saveData?.success || Number(saveData?.errorCode) !== 9999) {
        Swal.close();
        Swal.fire({
          title: "Error",
          text: saveData?.message || "Submission failed",
          confirmButtonColor: "#1e3a8a",
        });
        return;
      }

      const applicationNo = extractAppNo(saveData?.message);

      const KARJAT_ULBS       = ["1890", "1150"];
      const KARJAT_SERVICEIDS =  ["19", "21", "22", "91", "196"];
      const isKarjat =
        KARJAT_ULBS.map(String).includes(String(ulbId)) &&
        KARJAT_SERVICEIDS.map(String).includes(String(values.serviceType)) &&
        applicationNo;

      let karjatOk = null;
      if (isKarjat) {
        try {
          const karjatRes = await post("/insert-karjat-water-register", {
            ulbID: String(ulbId),
            corpId: corpId || sessionStorage.getItem("CorpId") || "",
            serviceId: String(values.serviceType),
            appNo: applicationNo,
            userId,
            firstName:  values.firstName?.trim(),
            firstNameMr:  values.firstNameMr?.trim(),
            middleName: values.middleName?.trim(),
            middleNameMr: values.middleNameMr?.trim(),
            lastName:   values.lastName?.trim(),
            lastNameMr:   values.lastNameMr?.trim(),
            appAddress: values.address?.trim(),
            addressMr:  values.addressMr?.trim(),
            zoneId: Number(values.zoneId),
            consumerNo: values.consumerNo?.trim() || "",
            appSource: config.source,
            disConId: values.disconType ? Number(values.disconType) : null,
            reason: values.reason?.trim() || "",
            usageTypeId: values.usageType ? Number(values.usageType) : null,
            tarifRate: values.tariffRate ? Number(values.tariffRate) : null,
            connSize: values.newConSize ? Number(values.newConSize) : null,
            remark: values.remark?.trim() || "",
            ownerName: isManualEntryUlb ? values.ownName?.trim() : values.lblOwnerName,
            address:   isManualEntryUlb ? values.consumerAddr     : values.lblConAddress,
            remarkMar: values.remarkMar?.trim() || "",
            reasonMar: values.reasonMar?.trim() || "",
          });
          karjatOk = karjatRes?.data?.data?.success === true;
        } catch (e) {
          karjatOk = false;
        }
      }

      Swal.close();
      Swal.fire({
        icon: karjatOk === false ? "warning" : "success",
        text: karjatOk === false
          ? `Application saved but Karjat module insert failed. App No: ${applicationNo}.`
          : `Application submitted successfully. Your Application No is ${applicationNo}`,
        confirmButtonText: "OK",
        confirmButtonColor: "#1e3a8a",
      }).then((r) => {
        if (r.isConfirmed && karjatOk !== false) {
          navigate("/app/FrmTrackApplication", {
            state: { applicationNo, serviceName: pageTitle, ulbId },
          });
        }
      });
    } catch (err) {
      Swal.close();
      Swal.fire({
        text: err.response?.data?.message || "Error submitting application",
        confirmButtonColor: "#1e3a8a",
      });
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  const extractAppNo = (msg) => {
    if (!msg) return "";
    const s = String(msg);
    if (s.includes(":")) {
      const parts = s.split(":");
      const candidate = parts[parts.length - 1].trim();
      if (candidate) return candidate;
    }
    return s;
  };

  const handleReset = (resetForm) => {
    Swal.fire({
      text: "Want to Reset?",
      showCancelButton: true,
      confirmButtonColor: "#1e3a8a",
      confirmButtonText: "Yes",
      cancelButtonText: "Cancel",
    }).then((r) => r.isConfirmed && resetForm());
  };

  const initialServiceValue = useMemo(() => {
    if (!serviceId) return "";
    const inList = serviceTypeList.some(
      (s) => String(col(s, "NUM_SERVICE_SERVICEID", "num_service_serviceid")) === String(serviceId)
    );
    return inList || serviceTypeList.length === 0 ? String(serviceId) : "";
  }, [serviceId, serviceTypeList]);

  const computedInitialValues = useMemo(
    () => ({ ...initialValues, serviceType: initialServiceValue }),
    [initialServiceValue]
  );

  return (
    <Formik
      initialValues={computedInitialValues}
      enableReinitialize
      onSubmit={handleSubmit}
    >
      {({ values, handleChange, setFieldValue, isSubmitting, resetForm }) => {
        if (isViewMode && window.__prefillData) {
          const d = window.__prefillData;
          window.__prefillData = null;
          setFieldValue("serviceType", String(d.serviceId ?? serviceId ?? ""));
          setFieldValue("consumerNo",  d.consumerNo ?? "");
          setFieldValue("disconType",  String(d.disconnectionId ?? ""));
          setFieldValue("reason",      d.reason ?? "");
          setFieldValue("usageType",   String(d.usageId ?? ""));
          setFieldValue("tariffRate",  d.tariffRate ?? "");
          setFieldValue("newConSize",  String(d.connectionSizeId ?? ""));
          setFieldValue("remark",      d.remark ?? "");
        }

        const ro = isViewMode;

        const fieldVisibility =
          SERVICE_FIELD_MAP[String(values.serviceType)] ?? DEFAULT_FIELD_VISIBILITY;

        return (
          <Form>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card className="border shadow-sm">
                <CardHeader className="border-b">
                  <CardTitle className="text-lg font-semibold">{pageTitle}</CardTitle>
                </CardHeader>

                <CardContent className="p-4 sm:p-6 space-y-4">

                  {/* Zone + Service */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="sm:w-36 w-full shrink-0 whitespace-nowrap"><Label required text="Zone Id" /></div>
                      <Select
                        value={values.zoneId}
                        onValueChange={(v) => setFieldValue("zoneId", v)}
                        disabled={ro}
                      >
                        <SelectTrigger className="w-full h-9"><SelectValue placeholder="-- Select Zone --" /></SelectTrigger>
                        <SelectContent>
                          {zoneIdList.length > 0
                            ? zoneIdList.map((z) => {
                                const id = z.WARDID ?? z.wardid ?? z.wardId;
                                const nm = z.WARDNAME ?? z.wardname ?? z.wardName;
                                return <SelectItem key={id} value={String(id)}>{nm}</SelectItem>;
                              })
                            : <SelectItem value="0">No Zone available</SelectItem>}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="sm:w-36 w-full shrink-0 whitespace-nowrap"><Label required text="Service Type" /></div>
                      <Select
                        value={values.serviceType}
                        onValueChange={(v) => {
                          setFieldValue("serviceType", v);
                          resolveServCode(serviceTypeList, v);
                        }}
                        disabled={ro || !!serviceId}
                      >
                        <SelectTrigger className="w-full h-9"><SelectValue placeholder="-- Select Service --" /></SelectTrigger>
                        <SelectContent>
                          {serviceTypeList.length > 0
                            ? serviceTypeList.map((s) => {
                                const id = col(s, "NUM_SERVICE_SERVICEID", "num_service_serviceid");
                                const nm = col(s, "DISPLAYNAME", "displayname");
                                return <SelectItem key={id} value={String(id)}>{nm}</SelectItem>;
                              })
                            : <SelectItem value="0">No services available</SelectItem>}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Consumer No + Search */}
                  {showSearchButton && (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="sm:w-36 w-full shrink-0 whitespace-nowrap">
                        <Label required text="Consumer No" />
                      </div>
                      <Input
                        name="consumerNo"
                        value={values.consumerNo}
                        onChange={handleChange}
                        disabled={ro}
                        className="w-full h-9"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            fetchConnectionDetails(setFieldValue, values.consumerNo);
                          }
                        }}
                      />
                      <Button
                        type="button"
                        className="bg-blue-900 hover:bg-blue-800 text-white"
                        onClick={() => fetchConnectionDetails(setFieldValue, values.consumerNo)}
                        disabled={ro || searching}
                      >
                        {searching ? "Searching..." : "Search"}
                      </Button>
                    </div>
                  )}

                  {/* Applicant name */}
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-14 md:col-span-2">
                      <Label required text="Name" />
                      <Input name="firstName" placeholder="First Name" value={values.firstName} onChange={handleChange} disabled={ro} className="w-full h-9" />
                    </div>
                    <div className="md:col-span-2">
                      <Input name="middleName" placeholder="Middle Name" value={values.middleName} onChange={handleChange} disabled={ro} className="w-full h-9" />
                    </div>
                    <div className="md:col-span-2">
                      <Input name="lastName" placeholder="Last Name" value={values.lastName} onChange={handleChange} disabled={ro} className="w-full h-9" />
                    </div>
                  </div>

                  {/* Marathi name */}
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 md:col-span-2 whitespace-nowrap">
                      <Label required text="Name (Marathi)" />
                      <Input name="firstNameMr" placeholder="First Name (Marathi)" value={values.firstNameMr} onChange={handleChange} disabled={ro} className="h-9" />
                    </div>
                    <div className="md:col-span-2">
                      <Input name="middleNameMr" placeholder="Middle Name (Marathi)" value={values.middleNameMr} onChange={handleChange} disabled={ro} className="h-9" />
                    </div>
                    <div className="md:col-span-2">
                      <Input name="lastNameMr" placeholder="Last Name (Marathi)" value={values.lastNameMr} onChange={handleChange} disabled={ro} className="h-9" />
                    </div>
                  </div>

                  {/* Address */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-17 md:col-span-2">
                      <Label required text="Address" />
                      <Input name="address" value={values.address} onChange={handleChange} disabled={ro} className="h-9" />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-10 md:col-span-2 whitespace-nowrap">
                      <Label required text="Address (Marathi)" />
                      <Input name="addressMr" value={values.addressMr} onChange={handleChange} disabled={ro} className="h-9" />
                    </div>
                  </div>

                  {/* Read-only connection details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      ["Ward",             "lblWard"],
                      ["Zone",             "lblZone"],
                      ["Block",            "lblBlock"],
                      ["PTN",              "lblPTN"],
                      ["Consumer Address", "lblConAddress"],
                      ["Owner Name",       "lblOwnerName"],
                      ["Existing Tariff Rate", "lblExisttraRate"],
                      ["Current Conn Size","lblCurConsize"],
                      ["Usage Type",       "lblUsageType"],
                    ].map(([label, key]) => (
                      <div key={key} className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <div className="sm:w-36 w-full shrink-0 whitespace-nowrap"><Label text={label} /></div>
                        <Input value={values[key]} readOnly className="w-full h-9 bg-gray-50" />
                      </div>
                    ))}
                  </div>

                  {/* Manual-entry ULBs only (not 1890) */}
                  {isManualEntryUlb && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 md:col-span-2">
                        <div className="sm:w-36 w-full shrink-0"><Label required text="Consumer Address" /></div>
                        <Input name="consumerAddr" value={values.consumerAddr} onChange={handleChange} disabled={ro} className="w-full h-9" />
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <div className="sm:w-36 w-full shrink-0"><Label required text="Owner Name" /></div>
                        <Input name="ownName" value={values.ownName} onChange={handleChange} disabled={ro} className="w-full h-9" />
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <div className="sm:w-36 w-full shrink-0"><Label required text="Property No" /></div>
                        <Input name="propNo" value={values.propNo} onChange={handleChange} disabled={ro} className="w-full h-9" />
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <div className="sm:w-36 w-full shrink-0"><Label required text="Tariff Rate" /></div>
                        <Input name="tarriff" value={values.tarriff} onChange={handleChange} disabled={ro} className="w-full h-9" />
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <div className="sm:w-36 w-full shrink-0"><Label required text="Current Conn Size" /></div>
                        <Select value={values.currConnsize} onValueChange={(v) => setFieldValue("currConnsize", v)} disabled={ro}>
                          <SelectTrigger className="w-full h-9"><SelectValue placeholder="-- Select --" /></SelectTrigger>
                          <SelectContent>
                            {currConSizeList.map((c) => {
                              const id = col(c, "NUM_CONNSIZE_ID", "num_connsize_id");
                              const nm = col(c, "VAR_CONNSIZE_NAME", "var_connsize_name");
                              return <SelectItem key={id} value={String(id)}>{nm}</SelectItem>;
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <div className="sm:w-36 w-full shrink-0"><Label required text="Usage Type" /></div>
                        <Select value={values.existUsage} onValueChange={(v) => setFieldValue("existUsage", v)} disabled={ro}>
                          <SelectTrigger className="w-full h-9"><SelectValue placeholder="-- Select --" /></SelectTrigger>
                          <SelectContent>
                            {existUsageList.map((u) => {
                              const id = col(u, "NUM_USAGETYPE_ID", "num_usagetype_id");
                              const nm = col(u, "VAR_USAGETYPE_NAME", "var_usagetype_name");
                              return <SelectItem key={id} value={String(id)}>{nm}</SelectItem>;
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {/* Disconnection panel */}
                  {/*{showDisconPanel && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <div className="sm:w-36 w-full shrink-0 whitespace-nowrap"><Label text="Disconnection Type" /></div>
                        <Select value={values.disconType} onValueChange={(v) => setFieldValue("disconType", v)} disabled={ro}>
                          <SelectTrigger className="w-full h-9"><SelectValue placeholder="-- Select --" /></SelectTrigger>
                          <SelectContent>
                            {disconTypeList.map((d) => {
                              const id = col(d, "NUM_DISCONN_ID", "num_disconn_id");
                              const nm = col(d, "VAR_DISCONN_NAME", "var_disconn_name");
                              return <SelectItem key={id} value={String(id)}>{nm}</SelectItem>;
                            })}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <div className="sm:w-36 w-full shrink-0 whitespace-nowrap"><Label text="Changes Usage Type" /></div>
                        <Select value={values.usageType} onValueChange={(v) => setFieldValue("usageType", v)} disabled={ro}>
                          <SelectTrigger className="w-full h-9"><SelectValue placeholder="-- Select --" /></SelectTrigger>
                          <SelectContent>
                            {usageTypeList.map((u) => {
                              const id = col(u, "NUM_USAGETYPE_ID", "num_usagetype_id");
                              const nm = col(u, "VAR_USAGETYPE_NAME", "var_usagetype_name");
                              return <SelectItem key={id} value={String(id)}>{nm}</SelectItem>;
                            })}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <div className="sm:w-36 w-full shrink-0 whitespace-nowrap"><Label text="Applicable Tariff Rate" /></div>
                        <Input name="tariffRate" value={values.tariffRate} onChange={handleChange} disabled={ro} className="w-full h-9" type="number" />
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <div className="sm:w-36 w-full shrink-0 whitespace-nowrap"><Label text="New Conn. Size" /></div>
                        <Select value={values.newConSize} onValueChange={(v) => setFieldValue("newConSize", v)} disabled={ro}>
                          <SelectTrigger className="w-full h-9"><SelectValue placeholder="-- Select --" /></SelectTrigger>
                          <SelectContent>
                            {newConSizeList.map((c) => {
                              const id = col(c, "NUM_CONNSIZE_ID", "num_connsize_id");
                              const nm = col(c, "VAR_CONNSIZE_NAME", "var_connsize_name");
                              return <SelectItem key={id} value={String(id)}>{nm}</SelectItem>;
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}*/}

                  {/* Disconnection / change-type fields — each controlled by fieldVisibility */}
                  {showDisconPanel && (fieldVisibility.disconType || fieldVisibility.usageType || fieldVisibility.tariffRate || fieldVisibility.newConSize) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {fieldVisibility.disconType && (
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <div className="sm:w-36 w-full shrink-0 whitespace-nowrap"><Label text="Disconnection Type" /></div>
                          <Select value={values.disconType} onValueChange={(v) => setFieldValue("disconType", v)} disabled={ro}>
                            <SelectTrigger className="w-full h-9"><SelectValue placeholder="-- Select --" /></SelectTrigger>
                            <SelectContent>
                              {disconTypeList.map((d) => {
                                const id = col(d, "NUM_DISCONN_ID", "num_disconn_id");
                                const nm = col(d, "VAR_DISCONN_NAME", "var_disconn_name");
                                return <SelectItem key={id} value={String(id)}>{nm}</SelectItem>;
                              })}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {fieldVisibility.usageType && (
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <div className="sm:w-36 w-full shrink-0 whitespace-nowrap"><Label text="Changes Usage Type" /></div>
                          <Select value={values.usageType} onValueChange={(v) => setFieldValue("usageType", v)} disabled={ro}>
                            <SelectTrigger className="w-full h-9"><SelectValue placeholder="-- Select --" /></SelectTrigger>
                            <SelectContent>
                              {usageTypeList.map((u) => {
                                const id = col(u, "NUM_USAGETYPE_ID", "num_usagetype_id");
                                const nm = col(u, "VAR_USAGETYPE_NAME", "var_usagetype_name");
                                return <SelectItem key={id} value={String(id)}>{nm}</SelectItem>;
                              })}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {fieldVisibility.tariffRate && (
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <div className="sm:w-36 w-full shrink-0 whitespace-nowrap"><Label text="Applicable Tariff Rate" /></div>
                          <Input name="tariffRate" value={values.tariffRate} onChange={handleChange} disabled={ro} className="w-full h-9" type="number" />
                        </div>
                      )}

                      {fieldVisibility.newConSize && (
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <div className="sm:w-36 w-full shrink-0 whitespace-nowrap"><Label text="New Conn. Size" /></div>
                          <Select value={values.newConSize} onValueChange={(v) => setFieldValue("newConSize", v)} disabled={ro}>
                            <SelectTrigger className="w-full h-9"><SelectValue placeholder="-- Select --" /></SelectTrigger>
                            <SelectContent>
                              {newConSizeList.map((c) => {
                                const id = col(c, "NUM_CONNSIZE_ID", "num_connsize_id");
                                const nm = col(c, "VAR_CONNSIZE_NAME", "var_connsize_name");
                                return <SelectItem key={id} value={String(id)}>{nm}</SelectItem>;
                              })}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Remark / Reason */}
                  {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="sm:w-36 w-full shrink-0 whitespace-nowrap"><Label required text="Remark" /></div>
                      <Input name="remark" value={values.remark} onChange={handleChange} disabled={ro} className="w-full h-9" />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="sm:w-36 w-full shrink-0 whitespace-nowrap"><Label text="Reason" /></div>
                      <Input name="reason" value={values.reason} onChange={handleChange} disabled={ro} className="w-full h-9" />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="sm:w-36 w-full shrink-0 whitespace-nowrap"><Label text="Reason (Marathi)" /></div>
                      <Input name="reasonMar" value={values.reasonMar} onChange={handleChange} disabled={ro} className="w-full h-9" />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="sm:w-36 w-full shrink-0 whitespace-nowrap"><Label text="Remark (Marathi)" /></div>
                      <Input name="remarkMar" value={values.remarkMar} onChange={handleChange} disabled={ro} className="w-full h-9" />
                    </div>
                  </div> */}

                  {/* Remark / Reason — each field controlled by fieldVisibility */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {fieldVisibility.remark && (
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <div className="sm:w-36 w-full shrink-0 whitespace-nowrap"><Label required text="Remark" /></div>
                        <Input name="remark" value={values.remark} onChange={handleChange} disabled={ro} className="w-full h-9" />
                      </div>
                    )}
                    {fieldVisibility.reason && (
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <div className="sm:w-36 w-full shrink-0 whitespace-nowrap"><Label text="Reason" /></div>
                        <Input name="reason" value={values.reason} onChange={handleChange} disabled={ro} className="w-full h-9" />
                      </div>
                    )}
                    {fieldVisibility.reasonMar && (
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <div className="sm:w-36 w-full shrink-0 whitespace-nowrap"><Label text="Reason (Marathi)" /></div>
                        <Input name="reasonMar" value={values.reasonMar} onChange={handleChange} disabled={ro} className="w-full h-9" />
                      </div>
                    )}
                    {fieldVisibility.remarkMar && (
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <div className="sm:w-36 w-full shrink-0 whitespace-nowrap"><Label text="Remark (Marathi)" /></div>
                        <Input name="remarkMar" value={values.remarkMar} onChange={handleChange} disabled={ro} className="w-full h-9" />
                      </div>
                    )}
                  </div>

                  {/* Buttons */}
                  <div className="flex justify-center items-center gap-3 pt-4 border-t mt-4">
                    <Button
                      type="submit"
                      className="bg-blue-900 hover:bg-blue-800 text-white"
                      disabled={loading || isSubmitting || isViewMode}
                    >
                      {loading ? "Submitting..." : "Submit"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="bg-gray-100 hover:bg-gray-200"
                      onClick={() => handleReset(resetForm)}
                      disabled={isViewMode}
                    >
                      Reset
                    </Button>
                  </div>

                </CardContent>
              </Card>
            </motion.div>
          </Form>
        );
      }}
    </Formik>
  );
};

export default FrmWaterRegister;