import React, { useState, useEffect } from "react";
import { Formik, Form } from "formik";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ShadCNTable from "@/components/ui/table";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Swal from "sweetalert2";
import config from "@/utils/config";

const initialValues = {
  zoneId: "",
  firstName: "",
  middleName: "",
  lastName: "",
  firstNameMr: "",
  middleNameMr: "",
  lastNameMr: "",
  mobileNo: "",
  email: "",
  aadharNo: "",
  propNo: "",
  resNo: "",
  connectionNo: "",

  oFirstName: "",
  oMiddleName: "",
  oLastName: "",
  oFirstNameMr: "",
  oMiddleNameMr: "",
  oLastNameMr: "",

  coFirstName: "",
  coMiddleName: "",
  coLastName: "",
  coFirstNameMr: "",
  coMiddleNameMr: "",
  coLastNameMr: "",

  noFirstName: "",
  noMiddleName: "",
  noLastName: "",
  noFirstNameMr: "",
  noMiddleNameMr: "",
  noLastNameMr: "",

  ncoFirstName: "",
  ncoMiddleName: "",
  ncoLastName: "",
  ncoFirstNameMr: "",
  ncoMiddleNameMr: "",
  ncoLastNameMr: "",

  applicationNo: "",
};

const FrmWaterAppliDetails = () => {
  const location = useLocation();
  const { user, token } = useAuth();

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const mode = location.state?.mode;
  const serviceId = location.state?.serviceId;
  const ulbId = user?.ulbId;
  const userId = user?.userId;
  const corpId = user?.corpId;

  const applicationNo = location.state?.applicationNo || user?.appliNo || "";

  const [loading, setLoading] = useState(false);

  const [zones, setZones] = useState([]);
  const [documents, setDocuments] = useState([]);

  const [selectedDocs, setSelectedDocs] = useState([]);
  const [applicationId, setApplicationId] = useState(null);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [uploadingDocId, setUploadingDocId] = useState(null);
  const [consumerSearch, setConsumerSearch] = useState("");
  const [searching, setSearching] = useState(false);

  const tableHeaders = ["Select", "Document Name","Upload"];

  const tableKeyMapping = {
    Select: "checked",
    "Document Name": "DocName",
    // Preview: "imageUrl",
    Upload: "upload",
  };

  const fetchZones = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/FrmWaterAppliDetails/wardlist`,
        {
          params: {
            ulbid: ulbId,
          },
          headers: {
            Authorization: `Bearer ${token || localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      const wardData = response.data?.data?.data || [];

      setZones(wardData);
    } catch (error) {
      console.error("Error fetching ward list:", error);

      setZones([]);
    }
  };

  const fetchDocumentList = async () => {
    try {
      setDocumentsLoading(true);

      const response = await axios.get(
        `${BASE_URL}/api/FrmWaterAppliDetails/documentlist`,
        {
          params: {
            ulbid: ulbId,
            serviceId: serviceId,
            corpId: corpId,
          },
          headers: {
            Authorization: `Bearer ${token || localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      console.log("Document List Response:", response.data);

      const docData = response.data?.data?.data || [];

      const formattedDocuments = docData.map((doc) => ({
        DocId: doc.DOCID,
        DocName: doc.DOCNAME,
        DocType: doc.DOCTYPE,
        checked: false,
        imageUrl: "",
        upload: null,
        uploadedFile: null,
        uploaded: false,
      }));

      setDocuments(formattedDocuments);
    } catch (error) {
      console.error("Error fetching document list:", error);

      setDocuments([]);
    } finally {
      setDocumentsLoading(false);
    }
  };

  const fetchApplicationDetails = async (setFieldValue) => {
    if (mode !== 4) {
      return;
    }

    if (!applicationNo) {
      console.warn("Application number not found for mode 4");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.get(
        `${BASE_URL}/api/FrmWaterAppliDetails/application-details`,
        {
          params: {
            applicationNo: applicationNo,
          },
          headers: {
            Authorization: `Bearer ${token || localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      console.log("Application Details Response:", response.data);

      const appData = response.data?.data?.data?.[0];

      if (!appData) {
        console.warn("Application details not found");
        return;
      }

      const appId = appData.NUM_WTAPPLIDETAIL_ID;

      setFieldValue("connectionNo", appData.VAR_WTAPPLIDETAIL_CONNNO || "");
      setFieldValue("firstName", appData.VAR_WTAPPLIDETAIL_APPLIFNAME || "");
      setFieldValue("middleName", appData.VAR_WTAPPLIDETAIL_APPLIMNAME || "");
      setFieldValue("lastName", appData.VAR_WTAPPLIDETAIL_APPLILNAME || "");
      setFieldValue("mobileNo", appData.VAR_WTAPPLIDETAIL_MOBILENO || "");
      setFieldValue("email", appData.VAR_WTAPPLIDETAIL_EMAIL || "");
      setFieldValue("aadharNo", appData.VAR_WTAPPLIDETAIL_ADHARNO || "");
      setFieldValue("propNo", appData.VAR_WTAPPLIDETAIL_PROPNO || "");
      setFieldValue("resNo", appData.VAR_WTAPPLIDETAIL_RESINO || "");
      setFieldValue("oFirstName", appData.VAR_WTAPPLIDETAIL_CURROFNAME || "");
      setFieldValue("oMiddleName", appData.VAR_WTAPPLIDETAIL_CURROMNAME || "");
      setFieldValue("oLastName", appData.VAR_WTAPPLIDETAIL_CURROLNAME || "");
      setFieldValue("coFirstName", appData.VAR_WTAPPLIDETAIL_CURRCOFNAME || "");
      setFieldValue(
        "coMiddleName",
        appData.VAR_WTAPPLIDETAIL_CURRCOMNAME || "",
      );
      setFieldValue("coLastName", appData.VAR_WTAPPLIDETAIL_CURRCOLNAME || "");
      setFieldValue("noFirstName", appData.VAR_WTAPPLIDETAIL_NEWOFNAME || "");
      setFieldValue("noMiddleName", appData.VAR_WTAPPLIDETAIL_NEWOMNAME || "");
      setFieldValue("noLastName", appData.VAR_WTAPPLIDETAIL_NEWOLNAME || "");
      setFieldValue("ncoFirstName", appData.VAR_WTAPPLIDETAIL_NEWCOFNAME || "");
      setFieldValue(
        "ncoMiddleName",
        appData.VAR_WTAPPLIDETAIL_NEWCOMNAME || "",
      );
      setFieldValue("ncoLastName", appData.VAR_WTAPPLIDETAIL_NEWCOLNAME || "");
      setApplicationId(appId);

      await fetchApplicationDocuments(appId);
    } catch (error) {
      console.error("Error fetching application details:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplicationDocuments = async (appId) => {
    if (!appId) {
      return;
    }

    try {
      const response = await axios.get(
        `${BASE_URL}/api/FrmWaterAppliDetails/application-documents`,
        {
          params: {
            applicationId: appId,
          },
          headers: {
            Authorization: `Bearer ${token || localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      console.log("Application Documents Response:", response.data);

      const existingDocuments = response.data?.data?.data || [];

      setDocuments((previousDocuments) =>
        previousDocuments.map((doc) => {
          const existingDoc = existingDocuments.find(
            (item) => Number(item.DOCID) === Number(doc.DocId),
          );

          if (!existingDoc) {
            return doc;
          }

          let imageUrl = "";

          if (existingDoc.FILEBYTS) {
            const extension = (
              existingDoc.FILEEXTENSION || ".PDF"
            ).toUpperCase();

            let mimeType = "application/pdf";

            if (extension === ".JPG" || extension === ".JPEG") {
              mimeType = "image/jpeg";
            } else if (extension === ".PNG") {
              mimeType = "image/png";
            } else if (extension === ".PDF") {
              mimeType = "application/pdf";
            }

            imageUrl = `data:${mimeType};base64,${existingDoc.FILEBYTS}`;
          }

          return {
            ...doc,
            imageUrl,
            uploaded: true,
            existingDocumentId: existingDoc.NUM_WTAPPLIDOC_ID,
          };
        }),
      );
    } catch (error) {
      console.error("Error fetching application documents:", error);
    }
  };

  const fetchConnectionDetails = async (setFieldValue, consumerNo) => {
    const value = consumerNo.trim();

    if (!value) {
      Swal.fire({
        text: "Please enter Consumer No.",
      });
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
      const response = await axios.get(
        `${BASE_URL}/api/FrmWaterRegister/connection-details`,
        {
          params: { consumerNo: value, userId },
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const details = response?.data?.data?.connectionOwners;

      if (!details) {
        Swal.fire({
          text: response?.data?.data?.errors[0]?.detail,
        });
        return;
      }

      const owner = details.owner?.trim() || "";
      const address = details.address?.trim() || "";
      const usage = details.usage_type || "";

      const ownerParts = owner.split(/\s+/).filter(Boolean);

      let ownerFirstName = "";
      let ownerMiddleName = "";
      let ownerLastName = "";

      if (ownerParts.length === 1) {
        ownerFirstName = ownerParts[0];
      } else if (ownerParts.length === 2) {
        ownerFirstName = ownerParts[0];
        ownerLastName = ownerParts[1];
      } else if (ownerParts.length >= 3) {
        ownerFirstName = ownerParts[0];
        ownerLastName = ownerParts[ownerParts.length - 1];

        ownerMiddleName = ownerParts.slice(1, -1).join(" ");
      }

      setFieldValue("consumerNo", details.connno || value);
      setConsumerSearch(details.connno || value);

      setFieldValue("oFirstName", ownerFirstName);
      setFieldValue("oMiddleName", ownerMiddleName);
      setFieldValue("oLastName", ownerLastName);
      setFieldValue("oFirstNameMr", ownerFirstName);
      setFieldValue("oMiddleNameMr", ownerMiddleName);
      setFieldValue("oLastNameMr", ownerLastName);

      //   setFieldValue("resNo", address);
      setFieldValue("usageType", usage);

      Swal.close();
      Swal.fire({
        text: "Connection details fetched successfully.",
        timer: 1200,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Connection Details Error:", error);
      Swal.fire({
        text:
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Unable to fetch connection details.",
      });
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    if (!ulbId || !serviceId || !corpId) {
      return;
    }
    fetchZones();
    fetchDocumentList();
  }, [ulbId, serviceId, corpId]);

  const buildDocumentString = () => {
    const selectedDocuments = documents.filter((doc) =>
      selectedDocs.includes(doc.DocId),
    );

    if (selectedDocuments.length === 0) {
      return "";
    }

    const documentString = selectedDocuments
      .map((doc) => {
        let extension = doc.DocType || "";

        if (doc.uploadedFile) {
          extension =
            doc.uploadedFile.name.split(".").pop()?.toUpperCase() || "";
        }

        return `${doc.DocId}$${extension}`;
      })
      .join("#");

    return documentString;
  };

  const handleSubmit = async (values, { resetForm }) => {
    try {
      if (!values.zoneId?.trim()) {
        await Swal.fire({
          text: "Please select zone.",
          confirmButtonText: "OK",
        });
        return;
      }
      if (!values.firstName?.trim()) {
        await Swal.fire({
          text: "Please enter Applicant First Name.",
          confirmButtonText: "OK",
        });
        return;
      }

      if (!values.middleName?.trim()) {
        await Swal.fire({
          text: "Please enter Applicant Middle Name.",
          confirmButtonText: "OK",
        });
        return;
      }

      if (!values.lastName?.trim()) {
        await Swal.fire({
          text: "Please enter Applicant Last Name.",
          confirmButtonText: "OK",
        });
        return;
      }

      if (!values.mobileNo?.trim()) {
        await Swal.fire({
          text: "Please enter Mobile Number.",
          confirmButtonText: "OK",
        });
        return;
      }

      if (!/^[6-9]\d{9}$/.test(values.mobileNo.trim())) {
        await Swal.fire({
          text: "Please enter a valid 10-digit mobile number.",
          confirmButtonText: "OK",
        });
        return;
      }

      if (!values.aadharNo?.trim()) {
        await Swal.fire({
          text: "Please enter Aadhaar Number.",
          confirmButtonText: "OK",
        });
        return;
      }
      // Email validation and normalization
      if (!values.email?.trim()) {
        await Swal.fire({
          text: "Please enter Email.",
          confirmButtonText: "OK",
        });
        return;
      }
      const normalizedEmail = values.email.trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(normalizedEmail)) {
        Swal.fire({
          text: "Please enter a valid Email ID.",
          confirmButtonColor: "#1e3a8a",
        });
        setLoading(false);
        return;
      }

      values.email = normalizedEmail;

      if (!/^\d{12}$/.test(values.aadharNo.trim())) {
        await Swal.fire({
          text: "Please enter a valid 12-digit Aadhaar number.",
          confirmButtonText: "OK",
        });
        return;
      }

      if (!values.propNo?.trim()) {
        await Swal.fire({
          text: "Please enter Property Number.",
          confirmButtonText: "OK",
        });
        return;
      }

      if (!values.resNo?.trim()) {
        await Swal.fire({
          text: "Please enter Residence Number / Address.",
          confirmButtonText: "OK",
        });
        return;
      }

      if (!values.noFirstName?.trim()) {
        await Swal.fire({
          text: "Please enter New Owner First Name.",
          confirmButtonText: "OK",
        });
        return;
      }

      if (!values.noMiddleName?.trim()) {
        await Swal.fire({
          text: "Please enter New Owner Middle Name.",
          confirmButtonText: "OK",
        });
        return;
      }

      if (!values.noLastName?.trim()) {
        await Swal.fire({
          text: "Please enter New Owner Last Name.",
          confirmButtonText: "OK",
        });
        return;
      }
      if (!values.ncoFirstName?.trim()) {
        await Swal.fire({
          text: "Please enter New co Owner First Name.",
          confirmButtonText: "OK",
        });
        return;
      }

      if (!values.ncoMiddleName?.trim()) {
        await Swal.fire({
          text: "Please enter New co Owner Middle Name.",
          confirmButtonText: "OK",
        });
        return;
      }

      if (!values.ncoLastName?.trim()) {
        await Swal.fire({
          text: "Please enter New co Owner Last Name.",
          confirmButtonText: "OK",
        });
        return;
      }

      setLoading(true);

      const documentString = buildDocumentString();

      if (!documentString) {
        Swal.fire({ text: "Select Atleast One Document for upload" });
        return;
      }

      const payload = {
        userId: Number(user?.userId),
        appDetId: Number(applicationId),
        ulbid: Number(ulbId),

        connectionNo: consumerSearch,

        appliFName: values.firstName,
        appliMName: values.middleName,
        appliLName: values.lastName,

        mobileNo: values.mobileNo,
        email: values.email,
        aadharNo: values.aadharNo,

        propertyNo: values.propNo,
        residenceNo: values.resNo,

        currOFName: values.oFirstName,
        currOMName: values.oMiddleName,
        currOLName: values.oLastName,

        currCOFName: values.coFirstName,
        currCOMName: values.coMiddleName,
        currCOLName: values.coLastName,

        newOFName: values.noFirstName,
        newOMName: values.noMiddleName,
        newOLName: values.noLastName,

        newCOFName: values.ncoFirstName,
        newCOMName: values.ncoMiddleName,
        newCOLName: values.ncoLastName,

        docString: documentString,

        serviceId: Number(serviceId),
        zoneId: Number(values.zoneId),

        source: config.source,

        ownerName: `${values.noFirstName} ${
          values.noMiddleName
        } ${values.noLastName}`.trim(),

        usageType: "RESIDENTIAL",

        detAppliName: `${values.firstName} ${
          values.middleName
        } ${values.lastName}`.trim(),

        detMobile: values.mobileNo,
        detAadhaar: values.aadharNo,
        detEmail: values.email,
        detAddress: values.resNo,
      };

      const response = await axios.post(
        `${BASE_URL}/api/FrmWaterAppliDetails/save-application`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token || localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        },
      );

      console.log("Save Application Response:", response.data);

      if (!response.data?.ok) {
        Swal.fire({
          text:
            response.data?.message || "Application details could not be saved",
        });
        return;
      }

      const savedApplicationNo = response.data?.data?.applicationNo;

      if (!savedApplicationNo) {
        Swal.fire({
          text: "Application saved but Application Number was not received.",
        });
        return;
      }

      setApplicationId(
        response.data?.data?.appDetId ||
          response.data?.data?.applicationId ||
          applicationId,
      );

      const selectedDocuments = documents.filter((doc) =>
        selectedDocs.includes(doc.DocId),
      );

      for (const doc of selectedDocuments) {
        if (!doc.uploadedFile) {
          console.warn(`No file selected for document ${doc.DocId}`);
          continue;
        }

        await uploadApplicationDocument(
          doc,
          doc.uploadedFile,
          savedApplicationNo,
        );
      }

      await Swal.fire({
        text: response.data?.message,
        confirmButtonText: "OK",
      });

      resetForm();

      setConsumerSearch("");

      setSelectedDocs([]);

      setApplicationId(null);

      setDocuments((previousDocuments) =>
        previousDocuments.map((doc) => ({
          ...doc,
          checked: false,
          uploadedFile: null,
          uploaded: false,
          imageUrl: "",
          existingDocumentId: undefined,
        })),
      );
    } catch (error) {
      console.error("Save Application Error:", error);
      console.error("Server Response:", error.response?.data);

      Swal.fire({ text: error.response?.data?.error });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (docId, file) => {
    if (!file) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "application/pdf",
    ];

    if (!allowedTypes.includes(file.type)) {
      Swal.fire({ text: "Only JPG, JPEG, PNG and PDF files are allowed." });
      return;
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      Swal.fire({ text: "File size should not exceed 5 MB." });
      return;
    }

    setDocuments((previousDocuments) =>
      previousDocuments.map((doc) =>
        Number(doc.DocId) === Number(docId)
          ? {
              ...doc,
              uploadedFile: file,
              uploaded: false,
              imageUrl: file.type.startsWith("image/")
                ? URL.createObjectURL(file)
                : "",
            }
          : doc,
      ),
    );
  };

  const uploadApplicationDocument = async (doc, file, savedApplicationNo) => {
    if (!file) {
      return {
        success: false,
        message: "File not selected",
      };
    }

    try {
      const formData = new FormData();

      formData.append("corpId", String(corpId));
      formData.append("serviceId", String(serviceId));
      formData.append("applicationNo", String(savedApplicationNo));
      const extension = file.name.split(".").pop()?.toUpperCase() || "PDF";
      formData.append("documentType", extension);
      formData.append("documentId", String(doc.DocId));
      formData.append("file", file);

      const response = await axios.post(
        `${BASE_URL}/api/FrmWaterAppliDetails/upload-application-document`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token || localStorage.getItem("token")}`,
          },
        },
      );

      console.log("Upload Document Response:", response.data);

      if (response.data?.ok) {
        setDocuments((previousDocuments) =>
          previousDocuments.map((item) =>
            Number(item.DocId) === Number(doc.DocId)
              ? {
                  ...item,
                  uploaded: true,
                }
              : item,
          ),
        );

        return {
          success: true,
          message: response.data?.message || "Document uploaded successfully",
        };
      }

      return {
        success: false,
        message: response.data?.message || "Document upload failed",
      };
    } catch (error) {
      console.error("Document upload error:", error);

      console.error("Server response:", error.response?.data);

      return {
        success: false,
        message: error.response?.data?.message || "Document upload failed",
      };
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedDocs(documents.map((doc) => doc.DocId));
    } else {
      setSelectedDocs([]);
    }
  };

  const handleSelectRow = (docId, checked) => {
    setSelectedDocs((previous) => {
      if (checked) {
        if (previous.includes(docId)) {
          return previous;
        }

        return [...previous, docId];
      }

      return previous.filter((id) => id !== docId);
    });
  };

  const tableData = documents.map((doc) => ({
    ...doc,

    checked: selectedDocs.includes(doc.DocId),
    DocName: doc.DocName,
    imageUrl: doc.imageUrl,
    upload: (
      <div className="flex items-center gap-2">
        <Input
          type="file"
          accept=".jpg,.jpeg,.png,.pdf"
          className="w-full h-9"
          disabled={uploadingDocId === doc.DocId}
          onChange={(e) => {
            const file = e.target.files?.[0];

            if (file) {
              handleFileUpload(doc.DocId, file);
            }

            e.target.value = "";
          }}
        />

        {doc.uploadedFile && !doc.uploaded && (
          <span className="text-sm text-orange-600 whitespace-nowrap">
            {doc.uploadedFile.name}
          </span>
        )}

        {uploadingDocId === doc.DocId && (
          <span className="text-sm text-blue-600 whitespace-nowrap">
            Uploading...
          </span>
        )}

        {doc.uploaded && (
          <span className="text-sm text-green-600 whitespace-nowrap">
            Uploaded
          </span>
        )}
      </div>
    ),
  }));

  return (
    <Formik initialValues={initialValues} onSubmit={handleSubmit}>
      {({ values, handleChange, setFieldValue, resetForm }) => {
        useEffect(() => {
          if (mode === 4 && applicationNo) {
            fetchApplicationDetails(setFieldValue);
          }
        }, [mode, applicationNo]);

        return (
          <Form>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card className="border shadow-sm">
                <CardHeader className="border-b">
                  <CardTitle className="text-lg font-semibold">
                    Applicant Details
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-4 sm:p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="sm:w-48 shrink-0 flex justify-start sm:justify-between items-center">
                        <Label
                          required
                          text="Zone ID"
                          className="text-nowrap"
                        />
                        <span>:</span>
                      </div>
                      <Select
                        value={values.zoneId}
                        onValueChange={(value) =>
                          setFieldValue("zoneId", value)
                        }
                      >
                        <SelectTrigger className="w-full h-9">
                          <SelectValue placeholder="-- Select --" />
                        </SelectTrigger>
                        <SelectContent>
                          {zones.map((zone) => (
                            <SelectItem
                              key={zone.WARDID}
                              value={String(zone.WARDID)}
                            >
                              {zone.WARDNAME}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="sm:w-48 shrink-0 flex justify-start sm:justify-between items-center">
                        <Label
                          required
                          text="Applicant Name"
                          className="text-nowrap"
                        />
                        <span>:</span>
                      </div>
                      <Input
                        name="firstName"
                        value={values.firstName}
                        onChange={handleChange}
                        placeholder="First Name"
                        className="w-full h-9"
                        maxLength={100}
                      />
                    </div>
                    <div>
                      <Input
                        name="middleName"
                        value={values.middleName}
                        onChange={handleChange}
                        placeholder="Middle Name"
                        className="w-full h-9"
                        maxLength={100}
                      />
                    </div>
                    <div>
                      <Input
                        name="lastName"
                        value={values.lastName}
                        onChange={handleChange}
                        placeholder="Last Name"
                        className="w-full h-9"
                        maxLength={100}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="sm:w-48 shrink-0 flex justify-start sm:justify-between items-center">
                        <Label
                          required
                          text="अर्जदाराचे नाव मराठी"
                          className="text-nowrap"
                        />
                        <span>:</span>
                      </div>
                      <Input
                        name="firstNameMr"
                        value={values.firstNameMr}
                        onChange={handleChange}
                        placeholder="First Name"
                        className="w-full h-9"
                        maxLength={100}
                      />
                    </div>
                    <div>
                      <Input
                        name="middleNameMr"
                        value={values.middleNameMr}
                        onChange={handleChange}
                        placeholder="Middle Name"
                        className="w-full h-9"
                        maxLength={100}
                      />
                    </div>
                    <div>
                      <Input
                        name="lastNameMr"
                        value={values.lastNameMr}
                        onChange={handleChange}
                        placeholder="Last Name"
                        className="w-full h-9"
                        maxLength={100}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="sm:w-48 shrink-0 flex justify-start sm:justify-between items-center">
                        <Label
                          required
                          text="Mobile Number"
                          className="text-nowrap"
                        />
                        <span>:</span>
                      </div>
                      <Input
                        name="mobileNo"
                        value={values.mobileNo}
                        onChange={(e) => {
                          const value = e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 10);
                          setFieldValue("mobileNo", value);
                        }}
                        className="w-full h-9"
                        type="text"
                        maxLength={10}
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 md:col-span-1">
                      <div className="sm:w-48 shrink-0 flex justify-start sm:justify-between items-center">
                        <Label required text="Email" className="text-nowrap" />
                        <span>:</span>
                      </div>
                      <Input
                        name="email"
                        value={values.email}
                        onChange={handleChange}
                        className="w-full h-9"
                        type="email"
                        maxLength={30}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="sm:w-48 shrink-0 flex justify-start sm:justify-between items-center">
                        <Label
                          required
                          text="Aadhar Card No"
                          className="text-nowrap"
                        />
                        <span>:</span>
                      </div>
                      <Input
                        name="aadharNo"
                        value={values.aadharNo}
                        onChange={(e) => {
                          const value = e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 16);
                          setFieldValue("aadharNo", value);
                        }}
                        className="w-full h-9"
                        type="text"
                        maxLength={12}
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="sm:w-48 shrink-0 flex justify-start sm:justify-between items-center">
                        <Label text="Property Number" />
                        <span>:</span>
                      </div>
                      <Input
                        name="propNo"
                        value={values.propNo}
                        onChange={handleChange}
                        className="w-full h-9"
                        maxLength={30}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="sm:w-48 shrink-0 flex justify-start sm:justify-between items-center">
                        <Label
                          required
                          text="Residential Number"
                          className="text-nowrap"
                        />
                        <span>:</span>
                      </div>
                      <Textarea
                        name="resNo"
                        value={values.resNo}
                        onChange={handleChange}
                        className="w-full min-h-[70px]"
                        maxLength={300}
                        placeholder="Enter residential address"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="sm:w-48 shrink-0 flex justify-start sm:justify-between items-center">
                        <Label
                          text="Connection Number"
                          className="text-nowrap md:ml-40"
                        />
                        <span className="md:ml-20 ">:</span>
                      </div>
                      <Input
                        name="connectionNo"
                        value={consumerSearch}
                        onChange={(e) => setConsumerSearch(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            fetchConnectionDetails(
                              setFieldValue,
                              consumerSearch,
                            );
                          }
                        }}
                        className="w-full md:ml-40"
                      />
                    </div>
                    <div className="flex items-center">
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

                  <div className="row h-[45px]  my-5 py-1 text-center bg-[#184aa6] text-white rounded">
                    <h5 className="font-bold mt-2">Existing Details</h5>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="sm:w-48 shrink-0 flex justify-start sm:justify-between items-center">
                        <Label
                          required
                          text="Current Owner Name"
                          className="text-nowrap"
                        />
                        <span>:</span>
                      </div>
                      <Input
                        name="oFirstName"
                        value={values.oFirstName}
                        onChange={handleChange}
                        placeholder="First Name"
                        className="w-full h-9"
                        maxLength={100}
                      />
                    </div>
                    <div>
                      <Input
                        name="oMiddleName"
                        value={values.oMiddleName}
                        onChange={handleChange}
                        placeholder="Middle Name"
                        className="w-full h-9"
                        maxLength={100}
                      />
                    </div>
                    <div>
                      <Input
                        name="oLastName"
                        value={values.oLastName}
                        onChange={handleChange}
                        placeholder="Last Name"
                        className="w-full h-9"
                        maxLength={100}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="sm:w-48 shrink-0 flex justify-start sm:justify-between items-center">
                        <Label
                          required
                          text="सध्याचे मालकाचे नाव मराठी"
                          className="text-nowrap"
                        />
                        <span>:</span>
                      </div>
                      <Input
                        name="oFirstNameMr"
                        value={values.oFirstNameMr}
                        onChange={handleChange}
                        placeholder="First Name"
                        className="w-full h-9"
                        maxLength={100}
                      />
                    </div>
                    <div>
                      <Input
                        name="oMiddleNameMr"
                        value={values.oMiddleNameMr}
                        onChange={handleChange}
                        placeholder="Middle Name"
                        className="w-full h-9"
                        maxLength={100}
                      />
                    </div>
                    <div>
                      <Input
                        name="oLastNameMr"
                        value={values.oLastNameMr}
                        onChange={handleChange}
                        placeholder="Last Name"
                        className="w-full h-9"
                        maxLength={100}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="sm:w-48 shrink-0 flex justify-start sm:justify-between items-center">
                        <Label
                          required
                          text="Current Co-Owner Name"
                          className="text-nowrap"
                        />
                        <span>:</span>
                      </div>
                      <Input
                        name="coFirstName"
                        value={values.coFirstName}
                        onChange={handleChange}
                        placeholder="First Name"
                        className="w-full h-9"
                        maxLength={100}
                      />
                    </div>
                    <div>
                      <Input
                        name="coMiddleName"
                        value={values.coMiddleName}
                        onChange={handleChange}
                        placeholder="Middle Name"
                        className="w-full h-9"
                        maxLength={100}
                      />
                    </div>
                    <div>
                      <Input
                        name="coLastName"
                        value={values.coLastName}
                        onChange={handleChange}
                        placeholder="Last Name"
                        className="w-full h-9"
                        maxLength={100}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="sm:w-48 shrink-0 flex justify-start sm:justify-between items-center">
                        <Label
                          required
                          text="सध्याचे सह-मालक नाव मराठी"
                          className="text-nowrap"
                        />
                        <span>:</span>
                      </div>
                      <Input
                        name="coFirstNameMr"
                        value={values.coFirstNameMr}
                        onChange={handleChange}
                        placeholder="First Name"
                        className="w-full h-9"
                        maxLength={100}
                      />
                    </div>
                    <div>
                      <Input
                        name="coMiddleNameMr"
                        value={values.coMiddleNameMr}
                        onChange={handleChange}
                        placeholder="Middle Name"
                        className="w-full h-9"
                        maxLength={100}
                      />
                    </div>
                    <div>
                      <Input
                        name="coLastNameMr"
                        value={values.coLastNameMr}
                        onChange={handleChange}
                        placeholder="Last Name"
                        className="w-full h-9"
                        maxLength={100}
                      />
                    </div>
                  </div>

                  <div className="row h-[45px] my-2 py-1 text-center bg-[#184aa6] text-white rounded">
                    <h5 className="font-bold mt-2">New Details</h5>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="sm:w-48 shrink-0 flex justify-start sm:justify-between items-center">
                        <Label
                          required
                          text="New Owner Name"
                          className="text-nowrap"
                        />
                        <span>:</span>
                      </div>
                      <Input
                        name="noFirstName"
                        value={values.noFirstName}
                        onChange={handleChange}
                        placeholder="First Name"
                        className="w-full h-9"
                        maxLength={100}
                      />
                    </div>
                    <div>
                      <Input
                        name="noMiddleName"
                        value={values.noMiddleName}
                        onChange={handleChange}
                        placeholder="Middle Name"
                        className="w-full h-9"
                        maxLength={100}
                      />
                    </div>
                    <div>
                      <Input
                        name="noLastName"
                        value={values.noLastName}
                        onChange={handleChange}
                        placeholder="Last Name"
                        className="w-full h-9"
                        maxLength={100}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="sm:w-48 shrink-0 flex justify-start sm:justify-between items-center">
                        <Label
                          required
                          text="नवीन मालकाचे नाव मराठी"
                          className="text-nowrap"
                        />
                        <span>:</span>
                      </div>
                      <Input
                        name="noFirstNameMr"
                        value={values.noFirstNameMr}
                        onChange={handleChange}
                        placeholder="First Name"
                        className="w-full h-9"
                        maxLength={100}
                      />
                    </div>
                    <div>
                      <Input
                        name="noMiddleNameMr"
                        value={values.noMiddleNameMr}
                        onChange={handleChange}
                        placeholder="Middle Name"
                        className="w-full h-9"
                        maxLength={100}
                      />
                    </div>
                    <div>
                      <Input
                        name="noLastNameMr"
                        value={values.noLastNameMr}
                        onChange={handleChange}
                        placeholder="Last Name"
                        className="w-full h-9"
                        maxLength={100}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="sm:w-48 shrink-0 flex justify-start sm:justify-between items-center">
                        <Label
                          required
                          text="New Co-Owner Name"
                          className="text-nowrap"
                        />
                        <span>:</span>
                      </div>
                      <Input
                        name="ncoFirstName"
                        value={values.ncoFirstName}
                        onChange={handleChange}
                        placeholder="First Name"
                        className="w-full h-9"
                        maxLength={100}
                      />
                    </div>
                    <div>
                      <Input
                        name="ncoMiddleName"
                        value={values.ncoMiddleName}
                        onChange={handleChange}
                        placeholder="Middle Name"
                        className="w-full h-9"
                        maxLength={100}
                      />
                    </div>
                    <div>
                      <Input
                        name="ncoLastName"
                        value={values.ncoLastName}
                        onChange={handleChange}
                        placeholder="Last Name"
                        className="w-full h-9"
                        maxLength={100}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="sm:w-48 shrink-0 flex justify-start sm:justify-between items-center">
                        <Label
                          required
                          text="नवीन सह-मालकाचे नाव मराठी"
                          className="text-nowrap"
                        />
                        <span>:</span>
                      </div>
                      <Input
                        name="ncoFirstNameMr"
                        value={values.ncoFirstNameMr}
                        onChange={handleChange}
                        placeholder="First Name"
                        className="w-full h-9"
                        maxLength={100}
                      />
                    </div>
                    <div>
                      <Input
                        name="ncoMiddleNameMr"
                        value={values.ncoMiddleNameMr}
                        onChange={handleChange}
                        placeholder="Middle Name"
                        className="w-full h-9"
                        maxLength={100}
                      />
                    </div>
                    <div>
                      <Input
                        name="ncoLastNameMr"
                        value={values.ncoLastNameMr}
                        onChange={handleChange}
                        placeholder="Last Name"
                        className="w-full h-9"
                        maxLength={100}
                      />
                    </div>
                  </div>

                  {tableData.length > 0 && (
                    <div className="overflow-x-auto">
                      <ShadCNTable
                        headers={tableHeaders}
                        data={tableData}
                        keyMapping={tableKeyMapping}
                        pagination={false}
                        className="max-md:min-w-380 max-h-96"
                        onSelectAllChange={handleSelectAll}
                        onRowCheckChange={(row, checked) => {
                          handleSelectRow(row.DocId, checked);
                        }}
                      />
                    </div>
                  )}

                  <div className="flex justify-center items-center gap-3 pt-4 border-t">
                    <Button
                      type="submit"
                      className="text-white"
                      disabled={loading}
                    >
                      {loading ? "Submitting..." : "Submit"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="bg-gray-100 hover:bg-gray-200"
                      onClick={() => {
                        resetForm();
                        setSelectedDocs([]);
                      }}
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

export default FrmWaterAppliDetails;
