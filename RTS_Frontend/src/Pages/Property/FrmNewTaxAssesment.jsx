import React, { useState, useEffect, useRef } from "react";
import { Formik, Form } from "formik";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/calendar";
import ShadCNTable from "@/components/ui/table";
import config from "@/utils/config";
import Swal from "sweetalert2";
import { useAuth } from "@/context/AuthContext";
const BASE_URL = import.meta.env.VITE_BASE_URL;

const initialValues = {
  applicantName: "",
  applicantAddress: "",
  constructionPermission: "yes",
  constructionCertificateNo: "",
  usePermission: "yes",
  useCertificateNo: "",
  certificateDate: "",
  propertyType: "Rent",
  prabhagOffice: "",
  sectorNo: "",
  surveyNo: "",
  developmentProposalNo: "",
  landOwnerName: "",
  developerName: "",
  advanceReceiptNo: "",
};

const FrmNewTaxAssesment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token } = useAuth();
  const locationState = location.state || {};

  const [wards, setWards] = useState([]);
  const [documentDefs, setDocumentDefs] = useState([]);
  const [tableData, setTableData] = useState([]);
  const originalDocumentDefs = useRef([]);
  const [loading, setLoading] = useState(false);

  const ulbId = locationState.ulbId || user?.ulbId;
  const userId = locationState.userId || user?.userId;
  const mahaUlbId = locationState.mahaUlbId || user?.mahaUlbId || ulbId;
  const serviceid = locationState.serviceId || user?.serviceId;
  const servicename = locationState.serviceName;

 
  useEffect(() => {
    fetchWards();
    fetchDocumentDefinitions();
  }, [serviceid, ulbId]);

  const fetchWards = async () => {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/FrmNewTaxAssesment/wards`,
        { ulbid: ulbId },
        {
          headers: {
            Authorization: `Bearer ${token || localStorage.getItem("token")}`,
          },
        },
      );
      if (response.data?.data?.wards) {
        setWards(response.data.data.wards);
      }
    } catch (error) {
      console.error("Error fetching wards:", error);
    }
  };

  const fetchDocumentDefinitions = async () => {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/FrmAssessmentCerti/documents`,
        {
          serviceId: String(serviceid),
          ulbId: String(ulbId),
        },
        {
          headers: {
            Authorization: `Bearer ${token || localStorage.getItem("token")}`,
          },
        },
      );

      if (response.data.ok && response.data.data?.rows) {
        const docs = response.data.data.rows;
        setDocumentDefs(docs);
        originalDocumentDefs.current = docs;
        const tableRows = docs.map((doc, index) => ({
          id: doc.DOCID || doc.DocId || index + 1,
          srNo: index + 1,
          documentName:
            doc.DOCNAME || doc.DocName || doc.ENGDOCDESC,
          docId: doc.DOCID || doc.DocId,
          docType: doc.DOCTYPE || doc.DocType || "PDF",
          file: null,
          fileName: "No file chosen",
          fileBuffer: null,
        }));
        setTableData(tableRows);
      }
    } catch (error) {
      console.error("Error fetching document definitions:", error);
    }
  };

  const handleFileChange = (id, event) => {
    const file = event.currentTarget.files?.[0];
    if (file) {
      setTableData((prev) =>
        prev.map((row) =>
          row.id === id ? { ...row, file: file, fileName: file.name } : row,
        ),
      );
    }
  };

  const uploadDocument = async (applicationNo, doc) => {
    const formData = new FormData();
    formData.append("corpId", user.corpId);
    formData.append("serviceId", serviceid);
    formData.append("appNo", applicationNo);
    formData.append("docType", doc.docType);
    formData.append("documentId", String(doc.docId));
    formData.append("document", doc.file);

    try {
      const response = await axios.post(
        `${BASE_URL}/api/FrmAssessmentCerti/upload-document`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token || localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );
      return response.data.ok === true;
    } catch (error) {
      console.error("Error uploading document:", error);
      return false;
    }
  };

  const insertMahaOnline = async (applicationNo) => {
    try {
      const mahaPayload = {
        mahaData: {
          ulbId: Number(ulbId),
          mahaUlbId: Number(mahaUlbId || ulbId),
          trackId: Date.now().toString(),
          districtId: "0",
          requestString: `TrackId:${Date.now()}|AppNo:${applicationNo}|ServiceId:${serviceid}|ULBId:${ulbId}|MahaULBId:${
            mahaUlbId || ulbId
          }|Timestamp:${Date.now()}`,
          responseString: `Success|Application:${applicationNo}|Status:Processed|Timestamp:${Date.now()}`,
          encryptedFinalString: `ENC_${applicationNo}_${Date.now()}`,
        },
        applicationNo: applicationNo,
        serviceId: String(serviceid),
      };

      console.log("Maha Online Request Payload:", mahaPayload);

      const response = await axios.post(
        `${BASE_URL}/api/FrmAssessmentCerti/maha-online-first-step`,
        mahaPayload,
        {
          headers: {
            Authorization: `Bearer ${token || localStorage.getItem("token")}`,
          },
        },
      );

      console.log("Maha Online Response:", response.data);
      return response.data?.success || response.data?.ok;
    } catch (error) {
      console.error("Error in Maha Online integration:", error);
      return false;
    }
  };

  const handleSubmit = async (values) => {
    if (!values.applicantName.trim()) {
      return Swal.fire({text: "Please enter Applicant Name (अर्जदाराचे नाव)"});
    }
    if (!values.applicantAddress.trim()) {
      return Swal.fire({text:"Please enter Applicant Address (अर्जदाराचा पत्ता)"});
    }
    if (
      values.constructionPermission === "yes" &&
      !values.constructionCertificateNo.trim()
    ) {
      return Swal.fire({text:"Please enter Construction Permission Certificate No (मालमत्ता बांधकामास परवानगी)."});
    }
    if (values.usePermission === "yes" && !values.useCertificateNo.trim()) {
      return Swal.fire({text:"Please enter Use Permission Certificate No (मालमत्ता वापर परवानगी)."});
    }
    if (!values.certificateDate) {
      return Swal.fire({text:"Please select Certificate Date (प्रमाणपत्र दिनांक)"});
    }
    if (!values.prabhagOffice) {
      return Swal.fire({text:"Please select Prabhag Office (प्रभाग कार्यालय)"});
    }
    if (!values.sectorNo.trim()) {
      return Swal.fire({text:"Please enter Sector No. (सेक्टर क्रमांक)"});
    }
    if (!values.surveyNo.trim()) {
      return Swal.fire({text:"Please enter Survey No. (टीका व सर्वे)"});
    }
    if (!values.developmentProposalNo.trim()) {
      return Swal.fire({text:  "Please enter Development Proposal No. (विकास प्रस्ताव क्र)"});
    }
    if (!values.landOwnerName.trim()) {
      return Swal.fire({text:"Please enter Land Owner Name (जमीन मालकाचे नाव)"});
    }
    if (!values.developerName.trim()) {
      return Swal.fire({text:"Please enter Developer Name (विकासकाचे नाव)"});
    }
    if (!values.advanceReceiptNo.trim()) {
      return Swal.fire({text: "Please enter Advance Receipt No. (अग्रीम कराची पावती क्र.)"});
    }

    if (serviceid == 43) {
      const missingDocuments = tableData.filter((row) => !row.file);
      if (missingDocuments.length > 0) {
        const missingNames = missingDocuments
          .map((row) => row.documentName)
          .join(", ");
        return Swal.fire({
          text: `Please upload all required documents. Missing: ${missingNames}`,
          confirmButtonColor: "#1e3a8a",
          confirmButtonText: "OK",
          allowOutsideClick: false,
        });
      }

      const allowedExtensions = ["image/jpeg", "image/png", "application/pdf"];
      const maxSizeInBytes = 5 * 1024 * 1024;

      for (const row of tableData) {
        if (row.file) {
          if (!allowedExtensions.includes(row.file.type)) {
            return Swal.fire({
              text: `Invalid file type for "${row.documentName}". Only JPEG, PNG, and PDF are allowed.`,
              confirmButtonColor: "#1e3a8a",
              confirmButtonText: "OK",
              allowOutsideClick: false,
            });
          }

          if (row.file.size > maxSizeInBytes) {
            return Swal.fire({
              text: `File size for "${row.documentName}" exceeds 5 MB limit.`,
              confirmButtonColor: "#1e3a8a",
              confirmButtonText: "OK",
              allowOutsideClick: false,
            });
          }
        }
      }
    }

    setLoading(true);

    const documents = [];
    for (const row of tableData) {
      if (row.file) {
        documents.push({
          docId: row.docId,
          docName: row.documentName,
          docType: row.docType || "PDF",
          file: row.file,
        });
      }
    }

    const payload = {
      userId: userId,
      zoneId: Number(values.prabhagOffice),
      serviceId: Number(serviceid),
      appliName: values.applicantName,
      appliAdd: values.applicantAddress,
      propConstrFlag: values.constructionPermission === "yes" ? "Y" : "N",
      propUsageFlag: values.usePermission === "yes" ? "R" : "N",
      permisCertNo: values.constructionCertificateNo,
      parvanaCertNo: values.useCertificateNo,
      parvanaDate: values.certificateDate
        ? new Date(values.certificateDate).toISOString().split("T")[0]
        : "",
      propTypeFlag: values.propertyType,
      sectorNo: values.sectorNo,
      remarkSurvey: values.surveyNo,
      prabhagKarType: Number(values.prabhagOffice),
      vikasAppealNo: values.developmentProposalNo,
      propOwnName: values.landOwnerName,
      vikasName: values.developerName,
      taxesReceipt: values.advanceReceiptNo,
      appSource: config.source,
      ulbid: ulbId,
      documents: documents,
    };

    try {
      Swal.fire({
        // title: "Processing...",
        text: "Please wait ...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const response = await axios.post(
        `${BASE_URL}/api/FrmNewTaxAssesment/new-tax-asses`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token || localStorage.getItem("token")}`,
          },
        },
      );

      if (response.data?.ok && response.data?.data?.applicationNo) {
        const appNo = response.data.data.applicationNo;

        const message =
          response.data.data.message ||
          `Assessment Details Saved Successfully,Appli no: ${appNo}`;

        for (const doc of documents) {
          const success = await uploadDocument(appNo, doc);
          if (!success) {
            Swal.fire({
              text: `Failed to upload document: ${doc.docName}`,
              confirmButtonColor: "#1e3a8a",
              confirmButtonText: "OK",
              allowOutsideClick: false,
            });
            setLoading(false);
            return;
          }
        }

        // const mahaSuccess = await insertMahaOnline(appNo);
        // if (!mahaSuccess) {
        //   console.warn(
        //     "Maha Online integration failed, but application was saved successfully.",
        //   );
        // }

        Swal.fire({
          text: `${message}`,
          confirmButtonColor: "#1e3a8a",
        }).then(() => {
          navigate("/app/FrmTrackApplication", {
            state: { applicationNo: appNo },
          });

          // if (payFlag === "Y") {
          //   navigate("/app/FrmAppliFee", { state: { applicationNo: applicationNo } });
          // } else {
          //   navigate("/app/FrmNoDuesCerti");
          // }
        });
      } else {
        Swal.fire({
          text: response.data?.message || "Failed to save assessment details.",
        });
      }
    } catch (error) {
      console.error("Error submitting assessment:", error);
      Swal.fire({ text: "An error occurred while processing the request." });
    } finally {
      setLoading(false);
    }
  };

  const headers = ["Sr No.", "Document Name", "Image(jpg,png,pdf)"];
  const keyMapping = {
    "Sr No.": "srNo",
    "Document Name": "documentName",
    "Image(jpg,png,pdf)": "fileUpload",
  };

  const transformedTableData = tableData.map((item) => ({
    ...item,
    fileUpload: (
      <div className="flex items-center justify-center gap-2">
        <Input
          type="file"
          accept=".jpg,.jpeg,.png,.pdf"
          onChange={(e) => handleFileChange(item.id, e)}
          className="h-9 text-sm p-1 w-[50%]"
        />
      </div>
    ),
  }));

  return (
    <Formik initialValues={initialValues} onSubmit={handleSubmit}>
      {({ values, handleChange, setFieldValue }) => (
        <Form className="w-full">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full px-2 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-5 lg:py-6"
          >
            <Card className="w-full border shadow-sm">
              <CardHeader className="border-b px-3 sm:px-5 md:px-6 py-3 sm:py-4">
                <CardTitle className="text-base sm:text-lg md:text-xl">
                  {servicename}
                </CardTitle>
              </CardHeader>

              <CardContent className="p-3 sm:p-5 md:p-6 lg:p-7">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5 lg:gap-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
                    <div className="w-full md:w-40 lg:w-44 shrink-0 flex items-center justify-between">
                      <Label
                        className="text-sm sm:text-base"
                        text="अर्जदाराचे नाव"
                      />
                      <span className="hidden md:block">:</span>
                    </div>
                    <Input
                      name="applicantName"
                      value={values.applicantName}
                      onChange={handleChange}
                      className="w-full h-9 sm:h-10"
                    />
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
                    <div className="w-full md:w-40 lg:w-44 shrink-0 flex items-center justify-between">
                      <Label
                        className="text-sm sm:text-base"
                        text="अर्जदाराचा पत्ता"
                      />
                      <span className="hidden md:block">:</span>
                    </div>
                    <Input
                      name="applicantAddress"
                      value={values.applicantAddress}
                      onChange={handleChange}
                      className="w-full h-9 sm:h-10"
                    />
                  </div>
                </div>

                <div className="border-t mt-6 sm:mt-7 pt-5 sm:pt-6">
                  <h3 className="font-semibold text-base sm:text-lg md:text-xl mb-5">
                    मालमत्तेचा तपशील
                  </h3>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6">
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
                      <div className="w-full md:w-56 lg:w-64 shrink-0 flex items-center justify-between">
                        <Label
                          className="text-sm sm:text-base min-w-fit"
                          text="मालमत्ता बांधकामास परवानगी आहे का?"
                        />
                        <span className="hidden md:block">:</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-5">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <Input
                            type="radio"
                            name="constructionPermission"
                            value="yes"
                            checked={values.constructionPermission === "yes"}
                            onChange={handleChange}
                            className="h-4 w-4"
                          />
                          <span className="text-sm sm:text-base">हो</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">
                          <Input
                            type="radio"
                            name="constructionPermission"
                            value="no"
                            checked={values.constructionPermission === "no"}
                            onChange={handleChange}
                            className="h-4 w-4"
                          />
                          <span className="text-sm sm:text-base">नाही</span>
                        </label>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
                      <div className="w-full md:w-28 shrink-0 flex items-center justify-between">
                        <Label
                          className="text-sm sm:text-base"
                          text="असल्यास"
                        />
                        <span className="hidden md:block">:</span>
                      </div>
                      <Input
                        name="constructionCertificateNo"
                        value={values.constructionCertificateNo}
                        onChange={handleChange}
                        placeholder="परवानगी प्रमाणपत्र क्रमांक"
                        disabled={values.constructionPermission === "no"}
                        className="w-full h-9 sm:h-10"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6 mt-5">
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 lg:col-span-1">
                      <div className="w-full md:w-56 lg:w-64 shrink-0 flex items-center justify-between">
                        <Label
                          className="text-sm sm:text-base whitespace-nowrap"
                          text="मालमत्ता वापर परवानगी आहे का?"
                        />
                        <span className="hidden md:block">:</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-5">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <Input
                            type="radio"
                            name="usePermission"
                            value="yes"
                            checked={values.usePermission === "yes"}
                            onChange={handleChange}
                            className="h-4 w-4"
                          />
                          <span className="text-sm sm:text-base">हो</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">
                          <Input
                            type="radio"
                            name="usePermission"
                            value="no"
                            checked={values.usePermission === "no"}
                            onChange={handleChange}
                            className="h-4 w-4"
                          />
                          <span className="text-sm sm:text-base">नाही</span>
                        </label>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
                      <div className="w-full md:w-24 shrink-0 flex items-center justify-between">
                        <Label
                          className="text-sm sm:text-base"
                          text="असल्यास"
                        />
                        <span className="hidden md:block">:</span>
                      </div>
                      <Input
                        name="useCertificateNo"
                        value={values.useCertificateNo}
                        onChange={handleChange}
                        placeholder="प्रमाणपत्र क्रमांक"
                        disabled={values.usePermission === "no"}
                        className="w-full h-9 sm:h-10"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6 mt-5">
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
                      <div className="w-full md:w-32 shrink-0 flex items-center justify-between">
                        <Label
                          className="text-sm sm:text-base"
                          text="प्रमाणपत्र दिनांक"
                        />
                        <span className="hidden md:block">:</span>
                      </div>
                      <DatePicker
                        value={values.certificateDate}
                        onChange={(date) =>
                          setFieldValue("certificateDate", date)
                        }
                        className="w-full h-9 sm:h-10"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 mt-6">
                    <div className="w-full md:w-40 lg:w-44 shrink-0 flex items-center justify-between">
                      <Label
                        className="text-sm sm:text-base"
                        text="मालमत्तेचा प्रकार"
                      />
                      <span className="hidden md:block">:</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-5 sm:gap-x-7 gap-y-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <Input
                          type="radio"
                          name="propertyType"
                          value="Rent"
                          checked={values.propertyType === "Rent"}
                          onChange={handleChange}
                          className="h-4 w-4"
                        />
                        <span className="text-sm sm:text-base">सदनिका</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <Input
                          type="radio"
                          name="propertyType"
                          value="Shop"
                          checked={values.propertyType === "Shop"}
                          onChange={handleChange}
                          className="h-4 w-4"
                        />
                        <span className="text-sm sm:text-base">गाळा</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <Input
                          type="radio"
                          name="propertyType"
                          value="Ofc"
                          checked={values.propertyType === "Ofc"}
                          onChange={handleChange}
                          className="h-4 w-4"
                        />
                        <span className="text-sm sm:text-base">ऑफिस</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <Input
                          type="radio"
                          name="propertyType"
                          value="Proptax"
                          checked={values.propertyType === "Proptax"}
                          onChange={handleChange}
                          className="h-4 w-4"
                        />
                        <span className="text-sm sm:text-base">
                          जमिनीवरील कर
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6 mt-6">
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
                      <div className="w-full md:w-40 lg:w-44 shrink-0 flex items-center justify-between">
                        <Label
                          className="text-sm sm:text-base"
                          text="प्रभाग कार्यालय"
                        />
                        <span className="hidden md:block">:</span>
                      </div>

                      <Select
                        value={values.prabhagOffice}
                        onValueChange={(value) =>
                          setFieldValue("prabhagOffice", value)
                        }
                      >
                        <SelectTrigger className="w-full h-9 sm:h-10">
                          <SelectValue placeholder="-- Select Option --" />
                        </SelectTrigger>
                        <SelectContent>
                          {wards.map((ward) => (
                            <SelectItem
                              key={ward.wardId}
                              value={String(ward.wardId)}
                            >
                              {ward.wardName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
                      <div className="w-full md:w-40 lg:w-44 shrink-0 flex items-center justify-between">
                        <Label
                          className="text-sm sm:text-base"
                          text="सेक्टर क्रमांक"
                        />
                        <span className="hidden md:block">:</span>
                      </div>
                      <Input
                        name="sectorNo"
                        value={values.sectorNo}
                        onChange={handleChange}
                        className="w-full h-9 sm:h-10"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6 mt-5">
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
                      <div className="w-full md:w-40 lg:w-44 shrink-0 flex items-center justify-between">
                        <Label
                          className="text-sm sm:text-base"
                          text="टीका व सर्वे"
                        />
                        <span className="hidden md:block">:</span>
                      </div>
                      <Input
                        name="surveyNo"
                        value={values.surveyNo}
                        onChange={handleChange}
                        className="w-full h-9 sm:h-10"
                      />
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
                      <div className="w-full md:w-40 lg:w-44 shrink-0 flex items-center justify-between">
                        <Label
                          className="text-sm sm:text-base"
                          text="विकास प्रस्ताव क्र"
                        />
                        <span className="hidden md:block">:</span>
                      </div>
                      <Input
                        name="developmentProposalNo"
                        value={values.developmentProposalNo}
                        onChange={handleChange}
                        className="w-full h-9 sm:h-10"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6 mt-5">
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
                      <div className="w-full md:w-40 lg:w-44 shrink-0 flex items-center justify-between">
                        <Label
                          className="text-sm sm:text-base whitespace-nowrap"
                          text="जमीन मालकाचे नाव"
                        />
                        <span className="hidden md:block">:</span>
                      </div>
                      <Input
                        name="landOwnerName"
                        value={values.landOwnerName}
                        onChange={handleChange}
                        className="w-full h-9 sm:h-10"
                      />
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
                      <div className="w-full md:w-40 lg:w-44 shrink-0 flex items-center justify-between">
                        <Label
                          className="text-sm sm:text-base"
                          text="विकासकाचे नाव"
                        />
                        <span className="hidden md:block">:</span>
                      </div>
                      <Input
                        name="developerName"
                        value={values.developerName}
                        onChange={handleChange}
                        className="w-full h-9 sm:h-10"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6 mt-5">
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
                      <div className="w-full md:w-40 lg:w-44 shrink-0 flex items-center justify-between">
                        <Label
                          className="text-sm sm:text-base whitespace-nowrap"
                          text="अग्रीम कराची पावती क्र."
                        />
                        <span className="hidden md:block">:</span>
                      </div>
                      <Input
                        name="advanceReceiptNo"
                        value={values.advanceReceiptNo}
                        onChange={handleChange}
                        className="w-full h-9 sm:h-10"
                      />
                    </div>
                  </div>
                </div>

                {serviceid == 43 && (
                  <div className="border-t mt-6 sm:mt-7 pt-5 sm:pt-6">
                    <ShadCNTable
                      headers={headers}
                      data={transformedTableData}
                      keyMapping={keyMapping}
                      pagination={false}
                      className="max-md:min-w-340"
                    />
                  </div>
                )}

                <div className="flex flex-col sm:flex-row justify-center items-stretch sm:items-center gap-3 pt-7">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto px-6 h-9 sm:h-10 text-white"
                  >
                    {loading ? "Submitting..." : "Submit"}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full sm:w-auto px-6 h-9 sm:h-10 bg-gray-100 hover:bg-gray-200"
                    onClick={() => navigate("/")}
                  >
                    Back
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </Form>
      )}
    </Formik>
  );
};

export default FrmNewTaxAssesment;
