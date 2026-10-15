import React, { useEffect, useState } from "react";
import { Formik, Form } from "formik";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Textarea } from "@/components/ui/textarea";
import ShadCNTable from "@/components/ui/table";
import Swal from "sweetalert2";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import config from "@/utils/config";
import { propertySearchValidationSchema } from "@/validations/global.validation";

const initialValues = {
  ptn: "",
  // subcode: "",
  landHolder: "",
  structureHolder: "",
  ownerDetails: "",
  address: "",
  applicantName: "",
  mobileNo: "",
  emailId: "",
  aadharNo: "",
  objectionType: "",
  objectionDescription: "",
  document: null,
};

const FrmPropertyAppel = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token } = useAuth();
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const locationState = location.state || {};
  const ulbId = locationState.ulbId || user?.ulbId;
  const userId = locationState.userId || user?.userId;
  const mahaUlbId = locationState.mahaUlbId || user?.mahaUlbId || ulbId;
  const serviceId = locationState.serviceId || user?.serviceId;

  const [isLoading, setIsLoading] = useState(false);
  const [propertyFound, setPropertyFound] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [objections, setObjections] = useState([]);
  const [documentDefs, setDocumentDefs] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [zones, setZones] = useState([]);
  const [hasSearched, setHasSearched] = useState(false); 

  const headers = ["Sr No.", "Document Name", "Image(jpg,png,pdf)"];

  const keyMapping = {
    "Sr No.": "srNo",
    "Document Name": "documentName",
    "Image(jpg,png,pdf)": "fileUpload",
  };

  const fetchObjections = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/FrmPropertyAppel/objections`,
        {
          headers: {
            Authorization: `Bearer ${token || localStorage.getItem("token")}`,
          },
        },
      );

      console.log("Objections Response:", response.data);

      if (response.data?.ok && response.data?.data?.objections) {
        setObjections(response.data.data.objections);
      } else {
        setObjections([]);
      }
    } catch (error) {
      console.error("Error fetching objections:", error);

      setObjections([]);

      Swal.fire({
        text:
          error?.response?.data?.message || "Error fetching objection list.",
        confirmButtonColor: "#1e3a8a",
      });
    }
  };

  const fetchZones = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/FrmWaterRegister/ward-dropdown`,
        {
          params: {
            ulbid: Number(ulbId),
          },
          headers: {
            Authorization: `Bearer ${token || localStorage.getItem("token")}`,
          },
        },
      );
      if (
        response.data?.ok &&
        response.data?.data?.success &&
        Array.isArray(response.data?.data?.data)
      ) {
        setZones(response.data.data.data);
      } else {
        setZones([]);
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
          serviceId: String(serviceId),
          ulbId: String(ulbId),
        },
        {
          headers: {
            Authorization: `Bearer ${token || localStorage.getItem("token")}`,
          },
        },
      );

      console.log("Document Definition Response:", response.data);

      if (response.data?.ok && response.data?.data?.rows) {
        const docs = response.data.data.rows;

        setDocumentDefs(docs);

        const tableRows = docs.map((doc, index) => ({
          id: doc.DOCID || doc.DocId || index + 1,
          srNo: index + 1,
          documentName: doc.DOCNAME || doc.DocName || doc.ENGDOCDESC,
          docId: doc.DOCID || doc.DocId,
          docType: doc.DOCTYPE || doc.DocType,
          file: null,
          fileName: "No file chosen",
          fileBuffer: null,
        }));

        setTableData(tableRows);
      } else {
        setTableData([]);
      }
    } catch (error) {
      console.error("Error fetching document definitions:", error);

      setTableData([]);

      Swal.fire({
        text:
          error?.response?.data?.message ||
          "Error fetching document definitions.",
        confirmButtonColor: "#1e3a8a",
      });
    }
  };

  useEffect(() => {
    fetchObjections();
    fetchZones();
    fetchDocumentDefinitions();
  }, [serviceId, ulbId]);

  const getPropertyDetails = async (propNo, userId) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/FrmNoDuesCerti/property-details`,
        {
          propNo: propNo,
          userId: userId,
        },
        {
          headers: {
            Authorization: `Bearer ${token || localStorage.getItem("token")}`,
          },
          timeout: 30000,
        },
      );

      console.log("Property Details Response:", response.data);

      if (response.data?.ok && response.data?.data) {
        return response.data.data;
      }

      return null;
    } catch (error) {
      console.error("getPropertyDetails Error:", error);

      throw error;
    }
  };

  const handleSearchProperty = async (
    ptn,
    // subcode,
    setFieldValue,
    resetForm,
  ) => {
    const validationResult = propertySearchValidationSchema.safeParse({
      ptn: ptn,
      // subcode: subcode,
    });

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      Swal.fire({
        text: firstError.message,
        confirmButtonColor: "#1e3a8a",
        confirmButtonText: "OK",
        allowOutsideClick: false,
      });
      return;
    }

    setIsLoading(true);
     setHasSearched(true);
    try {
      setSearchError("");
      setPropertyFound(false);

      let fullPropNo = ptn;
      // if (subcode && subcode.trim() !== "") {
      //   fullPropNo = ptn + "/" + subcode;
      // }

      const result = await getPropertyDetails(fullPropNo, userId);

      if (result && result.propertyOwners) {
        const propData = result.propertyOwners;

        if (propData.payamt && parseFloat(propData.payamt) > 0) {
          Swal.fire({
            text: `Your property tax payment of Rs.${propData.payamt} is due, please make the payment first`,
            confirmButtonColor: "#1e3a8a",
            confirmButtonText: "OK",
            allowOutsideClick: false,
          }).then(() => {
            resetFormAfterSearch(setFieldValue, resetForm);
            setHasSearched(false); 
          });
          setIsLoading(false);
          return;
        }

        setFieldValue("landHolder", propData.land_Holder ?? "");
        setFieldValue("structureHolder", propData.struct_Holder ?? "");
        setFieldValue("ownerDetails", propData.owner_Details ?? "");
        setFieldValue("address", propData.address ?? "");
        setFieldValue("flatNo", propData.flat_No || propData.flatno || "");
        setFieldValue("strType", propData.usagetype_name ?? "");
        setFieldValue("constrType", propData.consttype_name ?? "");
        setFieldValue("area", propData.prop_area ?? "");
        setFieldValue("lettingRate", propData.letting_rate ?? "");
        setFieldValue("rateableValue", propData.retable_value ?? "");
        setFieldValue("yearlyTax", propData.yearly_tax?.toString() || "");
        setFieldValue("assessmentYear", propData.asses_year ?? "");

        setPropertyFound(true);

        Swal.fire({
          text: "Property found successfully!",
          confirmButtonColor: "#1e3a8a",
          timer: 1500,
          allowOutsideClick: false,
        });
      } else {
        Swal.fire({
          text: "Property Not Found For This Prop No",
          confirmButtonColor: "#1e3a8a",
          confirmButtonText: "OK",
          allowOutsideClick: false,
        }).then(() => {
          resetFormAfterSearch(setFieldValue, resetForm);
          setHasSearched(false); 
        });
      }
    } catch (error) {
      console.error("Search Property Error:", error);
      setHasSearched(false); 
      Swal.fire({
        text:
          error?.response?.data?.error ||
          "Error searching property. Please try again.",
        confirmButtonColor: "#1e3a8a",
        confirmButtonText: "OK",
        allowOutsideClick: false,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetFormAfterSearch = (setFieldValue, resetForm) => {
    resetForm();
    setPropertyFound(false);
    setSearchError("");
    setHasSearched(false); 
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
    formData.append("serviceId", serviceId);
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
      const trackId = Date.now().toString();

      const mahaPayload = {
        mahaData: {
          ulbId: ulbId,
          mahaUlbId: mahaUlbId || ulbId,
          trackId: trackId,
          districtId: "0",
          requestString: `TrackId:${trackId}|AppNo:${applicationNo}|ServiceId:${serviceId}|ULBId:${ulbId}|MahaULBId:${mahaUlbId || ulbId}|Timestamp:${Date.now()}`,
          responseString: `Success|Application:${applicationNo}|Status:Processed|Timestamp:${Date.now()}`,
          encryptedFinalString: `ENC_${applicationNo}_${Date.now()}`,
        },

        applicationNo: applicationNo,
        serviceId: String(serviceId),
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

      return response.data?.success || response.data?.ok || false;
    } catch (error) {
      console.error("Error in Maha Online integration:", error);

      return false;
    }
  };

  const checkPaymentFlag = async () => {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/FrmAssessmentCerti/payment-flag`,
        {
          serviceId: String(serviceId),
        },
        {
          headers: {
            Authorization: `Bearer ${token || localStorage.getItem("token")}`,
          },
        },
      );

      console.log("Payment Flag Response:", response.data);

      if (response.data?.success && response.data?.data?.rows) {
        return response.data.data.rows[0]?.VAR_SERVICE_PAYFLAG || "N";
      }

      return "N";
    } catch (error) {
      console.error("Error checking payment flag:", error);

      return "N";
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);

    let loader;

    try {
      if (!values.ptn?.trim()) {
        Swal.fire({
          text: "Please enter PTN.",
          confirmButtonColor: "#1e3a8a",
        });

        setLoading(false);
        return;
      }

      if (!values.applicantName?.trim()) {
        Swal.fire({
          text: "Please enter Applicant Name.",
          confirmButtonColor: "#1e3a8a",
        });

        setLoading(false);
        return;
      }

      if (!values.mobileNo || values.mobileNo.length !== 10) {
        Swal.fire({
          text: "Please enter valid Mobile No.",
          confirmButtonColor: "#1e3a8a",
        });

        setLoading(false);
        return;
      }

      if (!values.emailId?.trim()) {
        Swal.fire({
          text: "Please enter Email ID.",
          confirmButtonColor: "#1e3a8a",
        });
        setLoading(false);
        return;
      }

      const normalizedEmail = values.emailId.trim().toLowerCase();

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(normalizedEmail)) {
        Swal.fire({
          text: "Please enter a valid Email ID.",
          confirmButtonColor: "#1e3a8a",
        });
        setLoading(false);
        return;
      }

      values.emailId = normalizedEmail;

      if (!values.objectionType) {
        Swal.fire({
          text: "Please select objection type.",
          confirmButtonColor: "#1e3a8a",
        });

        setLoading(false);
        return;
      }

      if (!values.objectionDescription?.trim()) {
        Swal.fire({
          text: "Please enter objection description.",
          confirmButtonColor: "#1e3a8a",
        });

        setLoading(false);
        return;
      }

      const missingDocuments = tableData.filter((row) => !row.file);
      if (missingDocuments.length > 0) {
        const missingNames = missingDocuments
          .map((row) => row.documentName)
          .join(", ");
        Swal.fire({
          text: `Please upload all required documents. Missing: ${missingNames}`,
          confirmButtonColor: "#1e3a8a",
          confirmButtonText: "OK",
          allowOutsideClick: false,
        });
        setLoading(false);
        return;
      }

      const allowedExtensions = ["image/jpeg", "image/png", "application/pdf"];
      const maxSizeInBytes = 5 * 1024 * 1024;

      for (const row of tableData) {
        if (row.file) {
          if (!allowedExtensions.includes(row.file.type)) {
            Swal.fire({
              text: `Invalid file type for "${row.documentName}". Only JPEG, PNG, and PDF are allowed.`,
              confirmButtonColor: "#1e3a8a",
              confirmButtonText: "OK",
              allowOutsideClick: false,
            });
            setLoading(false);
            return;
          }

          if (row.file.size > maxSizeInBytes) {
            Swal.fire({
              text: `File size for "${row.documentName}" exceeds 5 MB limit.`,
              confirmButtonColor: "#1e3a8a",
              confirmButtonText: "OK",
              allowOutsideClick: false,
            });
            setLoading(false);
            return;
          }
        }
      }

      const documents = [];

      for (const row of tableData) {
        if (row.file) {
          documents.push({
            docId: row.docId,
            docName: row.documentName,
            docType: row.docType,
            file: row.file,
            fileBuffer: row.fileBuffer,
          });
        }
      }

      const payload = {
        userId: String(userId),
        zoneId: values.zone,
        serviceId: Number(serviceId),
        propNo: values.ptn,
        // subCode: values.subcode,
        landHolder: values.landHolder,
        structHolder: values.structureHolder,
        ownDetails: values.ownerDetails,
        address: values.address,
        appliName: values.applicantName,
        mobile: Number(values.mobileNo),
        email: values.emailId,
        aadhar: Number(values.aadharNo),
        objectType: Number(values.objectionType),
        objectDesc: values.objectionDescription,

        taxDate1: null,
        taxDate2: null,
        oldUsage: 0,
        newUsage: 0,
        oldSubUsage: 0,
        newSubUsage: 0,
        oldArea: 0,
        newArea: 0,
        oldYrKaryogya: 0,
        newYrKaryogya: 0,
        oldKaryogya: 0,
        newKaryogya: 0,
        appSource: config?.source,
      };

      loader = Swal.fire({
        title: "Submitting Application...",
        text: "Please wait ...",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const submitResponse = await axios.post(
        `${BASE_URL}/api/FrmPropertyAppel/prop-appeal`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token || localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!submitResponse.data?.ok) {
        loader.close();

        Swal.fire({
          text:
            submitResponse.data?.message || "Application submission failed.",
          confirmButtonColor: "#1e3a8a",
        });

        setLoading(false);
        return;
      }

      const applicationNo = submitResponse.data?.data?.applicationNo;

      const message =
        submitResponse.data?.data?.message ||
        "Property Appeal submitted successfully.";

      if (!applicationNo) {
        loader.close();

        Swal.fire({
          text: "Application created but application number was not received.",
          confirmButtonColor: "#1e3a8a",
        });

        setLoading(false);
        return;
      }

      for (const doc of documents) {
        const success = await uploadDocument(applicationNo, doc);

        if (!success) {
          loader.close();

          Swal.fire({
            text: `Failed to upload document: ${doc.docName}`,
            confirmButtonColor: "#1e3a8a",
          });

          setLoading(false);
          return;
        }
      }

      // const mahaSuccess = await insertMahaOnline(applicationNo);

      // if (!mahaSuccess) {
      //   console.warn(
      //     "Maha Online integration failed, but application was created.",
      //   );
      // }

      const payFlag = await checkPaymentFlag();
      console.log("Payment Flag:", payFlag);
      loader.close();

      // Swal.fire({
      //   text: message,
      //   confirmButtonColor: "#1e3a8a",
      // }).then(() => {
      //   if (payFlag === "Y") {
      //     navigate("/app/FrmAppliFee", {
      //       state: {
      //         applicationNo: applicationNo,
      //       },
      //     });
      //   } else {
      //     navigate("/app/FrmNewTaxAssesment");
      //   }
      // });

      Swal.fire({
        text: `${message}`,
        confirmButtonColor: "#1e3a8a",
      }).then(() => {
        navigate("/app/FrmTrackApplication", {
          state: { applicationNo: applicationNo },
        });

        // if (payFlag === "Y") {
        //   navigate("/app/FrmAppliFee", { state: { applicationNo: applicationNo } });
        // } else {
        //   navigate("/app/FrmNoDuesCerti");
        // }
      });
    } catch (error) {
      console.error("Error submitting Property Appeal:", error);

      if (loader) {
        loader.close();
      }

      Swal.fire({
        text:
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Error submitting application. Please try again.",
        confirmButtonColor: "#1e3a8a",
      });
    } finally {
      setLoading(false);
    }
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

        {item.fileName && item.fileName !== "No file chosen" && (
          <span className="text-xs text-gray-500 truncate max-w-[120px]">
            {item.fileName}
          </span>
        )}
      </div>
    ),
  }));

  return (
    <Formik initialValues={initialValues} onSubmit={handleSubmit}>
      {({ values, handleChange, setFieldValue, resetForm }) => (
        <Form>
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
          >
            <Card className="border shadow-sm">
              <CardHeader className="border-b">
                <CardTitle className="text-lg font-semibold">
                  Property Appeal
                </CardTitle>
              </CardHeader>

              <CardContent className="p-4 sm:p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="sm:w-24 shrink-0 flex justify-start sm:justify-between items-center">
                      <Label required text="PTN" />
                      <span>:</span>
                    </div>

                    <Input
                      name="ptn"
                      value={values.ptn}
                     // onChange={handleChange}
                     onChange={(e) => {
                      handleChange(e);
                      if (propertyFound || hasSearched) {
                        setPropertyFound(false);
                        setHasSearched(false);
                      }
                    }}
                      className="w-full h-9"
                    />
                  </div>

                  {/* <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="sm:w-24 shrink-0 flex justify-start sm:justify-between items-center">
                      <Label text="Subcode" />
                      <span>:</span>
                    </div>

                    <Input
                      name="subcode"
                      value={values.subcode}
                      onChange={handleChange}
                      className="w-full h-9"
                    />
                  </div> */}

                  <div className="flex items-center">
                    <Button
                      type="button"
                      className="bg-blue-900 hover:bg-blue-800 text-white"
                      onClick={() =>
                        handleSearchProperty(
                          values.ptn,
                          // values.subcode,
                          setFieldValue,
                          resetForm,
                        )
                      }
                      disabled={isSearching}
                    >
                      {isSearching ? "Searching..." : "Search"}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-y border-gray-300 py-3">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                      <Label text="Land Holder" />
                      <span>:</span>
                    </div>

                    <div className="w-full min-h-9 flex items-center px-2">
                      {values.landHolder || ""}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                      <Label text="Structure Holder" />
                      <span>:</span>
                    </div>

                    <div className="w-full min-h-9 flex items-center px-2">
                      {values.structureHolder || ""}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                      <Label text="Owner Details" />
                      <span>:</span>
                    </div>

                    <div className="w-full min-h-9 flex items-center px-2">
                      {values.ownerDetails || ""}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                      <Label text="Address" />
                      <span>:</span>
                    </div>

                    <div className="w-full min-h-9 flex items-center px-2">
                      {values.address || ""}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
                    <div className="sm:w-40 shrink-0 flex justify-start sm:justify-between items-center">
                      <Label className="text-sm sm:text-base" text="झोन" />
                      <span className="hidden md:block">:</span>
                    </div>

                    <Select
                      value={values.zone}
                      onValueChange={(value) => setFieldValue("zone", value)}
                    >
                      <SelectTrigger className="w-full h-9 sm:h-10">
                        <SelectValue placeholder="-- Select Option --" />
                      </SelectTrigger>
                      <SelectContent>
                        {zones.map((ward) => (
                          <SelectItem
                            key={ward.WARDID}
                            value={String(ward.WARDID)}
                          >
                            {ward.WARDNAME}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="sm:w-40 shrink-0 flex justify-start sm:justify-between items-center">
                      <Label required text="Applicant Name" />
                      <span>:</span>
                    </div>

                    <Input
                      name="applicantName"
                      value={values.applicantName}
                      onChange={handleChange}
                      className="w-full h-9"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="sm:w-40 shrink-0 flex justify-start sm:justify-between items-center">
                      <Label required text="Email ID" />
                      <span>:</span>
                    </div>

                    <Input
                      name="emailId"
                      value={values.emailId}
                      onChange={handleChange}
                      className="w-full h-9"
                      type="email"
                      maxLength={30}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="sm:w-40 shrink-0 flex justify-start sm:justify-between items-center">
                      <Label required text="Mobile No." />
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

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="sm:w-40 shrink-0 flex justify-start sm:justify-between items-center">
                      <Label text="Aadhar No." />
                      <span>:</span>
                    </div>

                    <Input
                      name="aadharNo"
                      value={values.aadharNo}
                      onChange={(e) => {
                        const value = e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 12);

                        setFieldValue("aadharNo", value);
                      }}
                      className="w-full h-9"
                      type="text"
                      maxLength={12}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="sm:w-40 shrink-0 flex justify-start sm:justify-between items-center">
                      <Label required text="आक्षेपाचा कशावर" />
                      <span>:</span>
                    </div>

                    <Select
                      value={values.objectionType}
                      onValueChange={(value) =>
                        setFieldValue("objectionType", value)
                      }
                    >
                      <SelectTrigger className="w-full h-9">
                        <SelectValue placeholder="-- Select Option --" />
                      </SelectTrigger>

                      <SelectContent>
                        {objections.map((item) => (
                          <SelectItem
                            key={item.objectionId}
                            value={String(item.objectionId)}
                          >
                            {item.objectionName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                    <div className="sm:w-40 shrink-0 flex justify-start sm:justify-between items-center pt-2">
                      <Label required text="आक्षेपाचे वर्णन" />
                      <span>:</span>
                    </div>

                    <Textarea
                      name="objectionDescription"
                      value={values.objectionDescription}
                      onChange={handleChange}
                      className="w-full min-h-[100px]"
                      placeholder="Enter objection description..."
                    />
                  </div>
                </div>

                <hr />

                {tableData.length > 0 && (
                  <ShadCNTable
                    headers={headers}
                    data={transformedTableData}
                    keyMapping={keyMapping}
                    pagination={false}
                    className="max-md:min-w-380"
                  />
                )}

                <div className="flex justify-center items-center gap-3 pt-4">
                  <Button
                    type="submit"
                    className="bg-blue-900 hover:bg-blue-800 text-white"
                    disabled={loading || !propertyFound}
                  >
                    {loading ? "Submitting..." : "Submit"}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="bg-gray-100 hover:bg-gray-200"
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

export default FrmPropertyAppel;
