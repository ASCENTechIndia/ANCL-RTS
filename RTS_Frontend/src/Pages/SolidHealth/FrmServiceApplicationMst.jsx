import React, { useState, useEffect, useRef } from "react";
import { Formik, Form } from "formik";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ShadCNTable from "@/components/ui/table";
import Swal from "sweetalert2";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import config from "@/utils/config";

const initialValues = {
  applicantName: "",
  mobileNo: "",
  emailId: "",
  aadharNo: "",
  address: "",
  serviceId: "",
  zoneId: "",
  sectorId: "",
  villageId: "",
  referenceNo: "",
  locality: "",
  landmark: "",
  pincode: "",
};

const FrmServiceApplicationMst = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token } = useAuth();
  const isFirstRender = useRef(true);

  const locationState = location.state || {}; 
  
  const ulbId = locationState.ulbId || user?.ulbId;
  const userId = locationState.userId || user?.userId;
  const serviceId = locationState.serviceId || sessionStorage.getItem("ServiceId");
  const serviceName = locationState.serviceName || sessionStorage.getItem("ServEngName");

  const [loading, setLoading] = useState(false);
  const [documentDefs, setDocumentDefs] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [pageTitle, setPageTitle] = useState(serviceName);
  const [sectorList, setSectorList] = useState([]);
  const [villageList, setVillageList] = useState([]);
  const [isSectorVisible, setIsSectorVisible] = useState(false);
  const [zoneList, setZoneList] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const headers = ["Sr No.", "Document Name", "Image(jpg,png,pdf)"];
  const keyMapping = {
    "Sr No.": "srNo",
    "Document Name": "documentName",
    "Image(jpg,png,pdf)": "fileUpload",
  };

  useEffect(() => {
    const title = serviceName;
    setPageTitle(title);
    document.title = title;
    
    if (ulbId && serviceId && isFirstRender.current) {
      isFirstRender.current = false;
      fetchAllData();
    }
  }, [serviceId, ulbId, serviceName]);

  const fetchAllData = async () => {
    try {
      const results = await Promise.allSettled([
        fetchZones(),
        fetchDocumentDefinitions(serviceId, ulbId),
        checkSectorVisibility(serviceId),
        fetchSectors(),
      ]);

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          console.log(`API ${index + 1} succeeded:`, result.value);
        } else {
          console.error(`API ${index + 1} failed:`, result.reason);
        }
      });

      const hasCriticalFailure = results.some((result, index) => 
        result.status === 'rejected' && index === 1
      );

      if (hasCriticalFailure) {
        Swal.fire({
          text: "Failed to load document list. Please refresh the page.",
          confirmButtonColor: '#1e3a8a',
        });
      }
    } catch (error) {
      console.error("Error fetching initial data:", error);
    }
  };

  const checkSectorVisibility = (serviceId) => {
    const sectorServices = ["60", "62"];
    const isSector = sectorServices.includes(String(serviceId));
    setIsSectorVisible(isSector);
    
    if (isSector) {
      fetchSectors();
    }
  };

  const fetchZones = async () => {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/FrmServiceApplicationMst/wardlist`,
        {
          ulbId: Number(ulbId),
        },
        {
          headers: { 
            Authorization: `Bearer ${token || localStorage.getItem("token")}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response?.data?.ok && response?.data?.data?.data) {
        const wardData = response.data.data.data;
        if (Array.isArray(wardData)) {
          setZoneList(wardData);
        } else {
          setZoneList([]);
        }
      } else {
        setZoneList([]);
      }
    } catch (error) {
      console.error("Error fetching zones:", error);
      setZoneList([]);
      Swal.fire({
        text: "Failed to load Prabhag list. Please try again.",
        confirmButtonColor: '#1e3a8a',
      });
    }
  };

const fetchSectors = async () => {
  try {
    const response = await axios.post(
      `${BASE_URL}/api/FrmServiceApplicationMst/sectorlist`,
      {
        serviceId: String(serviceId),
      },
      {
        headers: { 
          Authorization: `Bearer ${token || localStorage.getItem("token")}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response?.data?.ok && response?.data?.data.data) {
      const sectorData = response.data.data.data;
      if (Array.isArray(sectorData)) {
        setSectorList(sectorData);
      } else if (sectorData.data && Array.isArray(sectorData.data)) {
        setSectorList(sectorData.data);
      } else if (sectorData && typeof sectorData === 'object' && !Array.isArray(sectorData)) {
        if (sectorData.sectorId || sectorData.SECTORID) {
          setSectorList([sectorData]);
        } else {
          setSectorList([]);
        }
      } else {
        setSectorList([]);
      }
    } else {
      setSectorList([]);
    }
  } catch (error) {
    console.error("Error fetching sectors:", error);
    setSectorList([]);
  }
};

const fetchVillages = async (sectorId) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/api/FrmServiceApplicationMst/villages`,
      {
        sectorId: sectorId,
      },
      {
        headers: { 
          Authorization: `Bearer ${token || localStorage.getItem("token")}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response?.data?.ok && response?.data?.data.data) {
      const villageData = response.data.data.data;
      if (Array.isArray(villageData)) {
        setVillageList(villageData);
      } else if (villageData.data && Array.isArray(villageData.data)) {
        setVillageList(villageData.data);
      } else {
        setVillageList([]);
      }
    } else {
      setVillageList([]);
    }
  } catch (error) {
    console.error("Error fetching villages:", error);
    setVillageList([]);
  }
};

  const fetchDocumentDefinitions = async (serviceId, ulbId) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/FrmServiceApplicationMst/documentlist`,
        {
          serviceId: String(serviceId),
          ulbId: Number(ulbId),
        },
        {
          headers: { 
            Authorization: `Bearer ${token || localStorage.getItem("token")}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.ok && response.data.data.data) {
        const docs = response.data.data.data;
        setDocumentDefs(docs);
        const tableRows = docs.map((doc, index) => ({
          id: doc.DOCID || doc.docId || index + 1,
          srNo: index + 1,
          documentName: doc.DOCNAME || doc.docName || doc.ENGDOCDESC || "Document",
          docId: doc.DOCID || doc.docId,
          docType: doc.DOCTYPE || doc.docType || "PDF",
          file: null,
          fileName: "No file chosen",
          isUploaded: false,
        }));
        setTableData(tableRows);
      } else {
        setTableData([]);
      }
    } catch (error) {
      console.error("Error fetching document definitions:", error);
      setTableData([]);
    }
  };

  const handleFileChange = (id, event) => {
    const file = event.currentTarget.files?.[0];
    if (file) {
      
      const extension = file.name.split('.').pop().toUpperCase();
      const validExtensions = ['JPEG', 'JPG', 'PNG', 'PDF'];
      
      if (!validExtensions.includes(extension)) {
        Swal.fire({
          text: "Document Should Be Acceptable In JPEG/JPG/PNG/PDF Format Only",
          confirmButtonColor: '#1e3a8a',
        });
        event.currentTarget.value = '';
        return;
      }

      const maxSize = import.meta.env.VITE_MAX_FILE_SIZE || 5242880;
      if (file.size > maxSize) {
        Swal.fire({
          text: `Document Size Should Be < ${maxSize / 1048576} MB`,
          confirmButtonColor: '#1e3a8a',
        });
        event.currentTarget.value = '';
        return;
      }

      setTableData((prev) =>
        prev.map((row) =>
          row.id === id
            ? { 
                ...row, 
                file: file, 
                fileName: file.name,
                isUploaded: false 
              }
            : row
        )
      );
    }
  };

  const validateFields = (values) => {
    const requiredFields = ['applicantName', 'address', 'mobileNo', 'emailId'];
    
    for (const field of requiredFields) {
      if (!values[field]?.trim()) {
        Swal.fire({
          text: `Please Enter ${field.replace(/([A-Z])/g, ' $1').trim()}`,
          confirmButtonColor: '#1e3a8a',
        });
        return false;
      }
    }

    if (values.mobileNo.length !== 10 || !/^\d+$/.test(values.mobileNo)) {
      Swal.fire({
        text: "Invalid Mobile No - must be 10 digits",
        confirmButtonColor: '#1e3a8a',
      });
      return false;
    }

    //const emailRegex = /^([\w\.\-]+)@([\w\-]+)((\.(\w){2,3})+)$/;
    //const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    //const emailRegex = /^([\w\.\-\+]+)@([\w\-]+)((\.(\w){2,3})+)$/;
    //const emailRegex = /^[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\.[a-zA-Z]{2,}$/
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!emailRegex.test(values.emailId)) {
      Swal.fire({
        text: "Please Enter Valid Email ID",
        confirmButtonColor: '#1e3a8a',
      });
      return false;
    }

    if (values.aadharNo && values.aadharNo.trim() !== "") {
      if (values.aadharNo.length !== 12 || !/^\d+$/.test(values.aadharNo)) {
        Swal.fire({
          text: "Please Enter Valid Aadhar No.",
          confirmButtonColor: '#1e3a8a',
        });
        return false;
      }
    }

    if (!isSectorVisible) {
      if (!values.zoneId || values.zoneId === "0" || values.zoneId === "") {
        Swal.fire({
          text: "Please Select Prabhag",
          confirmButtonColor: '#1e3a8a',
        });
        return false;
      }
    } else {
      if (!values.sectorId || values.sectorId === "0" || values.sectorId === "") {
        Swal.fire({
          text: "Select valid Sector from the list",
          confirmButtonColor: '#1e3a8a',
        });
        return false;
      }

      if (!values.villageId || values.villageId === "0" || values.villageId === "") {
        Swal.fire({
          text: "Select valid Village from the list",
          confirmButtonColor: '#1e3a8a',
        });
        return false;
      }
    }

    return true;
  };

  const uploadDocuments = async (applicationNo) => {
    try {
      const documentsToUpload = tableData.filter(row => row.file !== null);
      
      if (documentsToUpload.length === 0) {
        console.log("No documents to upload");
        return true;
      }

      const formData = new FormData();
      formData.append("corpid", Number(ulbId));
      formData.append("serviceId", String(serviceId));
      formData.append("appNo", applicationNo);

      const documentIds = [];
      documentsToUpload.forEach((row) => {
        if (row.docId) {
          documentIds.push(row.docId);
        }
      });

      formData.append("documentIds", documentIds.join(","));

      documentsToUpload.forEach((row, index) => {
        if (row.file) {
          formData.append(`document_${index}`, row.file);
        }
      });

      const response = await axios.post(
        `${BASE_URL}/api/FrmServiceApplicationMst/upload-document`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token || localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const isSuccess = response.data.ok === true || 
                       response.data.success === true || 
                       response.data.status === "success";

      if (!isSuccess) {
        console.error("Upload failed with response:", response.data);
        throw new Error(response.data.message || "Document upload failed");
      }

      setTableData((prev) =>
        prev.map((row) => {
          if (row.file !== null) {
            return { ...row, isUploaded: true };
          }
          return row;
        })
      );

      return true;
    } catch (error) {
      console.error("Error uploading documents:", error);
      
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
      } else if (error.request) {
        console.error("No response received:", error.request);
      }
      
      throw error;
    }
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    setLoading(true);
    setUploadProgress(0);
    
    try {
      if (!validateFields(values)) {
        setLoading(false);
        setSubmitting(false);
        return;
      }

      const totalDocuments = tableData.length;
      const uploadedDocuments = tableData.filter(row => row.file !== null);
      const missingDocuments = tableData.filter(row => row.file === null);
      
      if (totalDocuments > 0 && missingDocuments.length > 0) {
        const missingNames = missingDocuments.map(row => row.documentName).join(", ");
        Swal.fire({
          text: `Please upload all the required documents`,
          confirmButtonColor: '#1e3a8a',
        });
        setLoading(false);
        setSubmitting(false);
        return;
      }

      if (totalDocuments > 0 && uploadedDocuments.length === 0) {
        Swal.fire({
          text: "Please upload all required documents",
          confirmButtonColor: '#1e3a8a',
        });
        setLoading(false);
        setSubmitting(false);
        return;
      }

      const loader = Swal.fire({
        title: "",
        text: "Submitting Application...",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading(),
      });

      const savePayload = {
        ulbId: Number(ulbId),
        userId: String(userId),
        serviceId: String(serviceId),
        applicationName: values.applicantName?.trim() || "",
        address: values.address?.trim() || "",
        mobile: values.mobileNo?.trim() || "",
        email: values.emailId?.trim() || "",
        aadharNo: values.aadharNo?.trim() || "0",
        refNo: values.referenceNo?.trim() || "",
        locality: values.locality?.trim() || "",
        landmark: values.landmark?.trim() || "",
        pincode: values.pincode ? Number(values.pincode) : 0,
        source: config.source,
      };

    if (isSectorVisible) {
      savePayload.sectorId = values.sectorId ? Number(values.sectorId) : null;
      savePayload.villageId = values.villageId ? Number(values.villageId) : null;
    } else {
      savePayload.zoneId = values.zoneId ? Number(values.zoneId) : null;
    }

      const saveResponse = await axios.post(
        `${BASE_URL}/api/FrmServiceApplicationMst/save`,
        savePayload,
        {
          headers: { 
            Authorization: `Bearer ${token || localStorage.getItem("token")}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!saveResponse.data.success) {
        loader.close();
        Swal.fire({
          text: saveResponse.data.message || "Application submission failed",
          confirmButtonColor: '#1e3a8a',
        });
        setLoading(false);
        setSubmitting(false);
        return;
      }

      const applicationNo = saveResponse.data.applicationNo;
      const message = saveResponse.data.message || "Application submitted successfully";

      sessionStorage.setItem("Appno", applicationNo);
      sessionStorage.setItem("Service", pageTitle);

      if (uploadedDocuments.length > 0) {
        loader.update({
          text: `Uploading Documents...`,
        });

        try {
          await uploadDocuments(applicationNo);
          loader.update({
            text: "Documents uploaded successfully!",
          });
        } catch (uploadError) {
          console.error("Document upload failed:", uploadError);
          
          loader.close();
          
          const result = await Swal.fire({
            title: "Document Upload Failed",
            text: `Your application was saved but documents could not be uploaded. Error: ${uploadError.message || "Unknown error"}`,
            confirmButtonColor: '#1e3a8a',
            confirmButtonText: "Continue without documents",
            showCancelButton: true,
            cancelButtonText: "Retry Upload",
            cancelButtonColor: '#d33',
          });
          
          if (result.isConfirmed) {
            Swal.fire({
              text: "Application submitted successfully but without documents",
              confirmButtonColor: '#1e3a8a',
            }).then(() => {
              window.location.reload();
            });
            setLoading(false);
            setSubmitting(false);
            return;
          } else {
            Swal.fire({
              text: "You can try submitting again to upload documents",
              confirmButtonColor: '#1e3a8a',
            });
            setLoading(false);
            setSubmitting(false);
            return;
          }
        }
      }

      loader.close();

      const parts = message.split('$');
      const displayMessage = parts[0] || message;
      const payFlag = parts[1] || "N";

      Swal.fire({
        text: displayMessage,
        confirmButtonColor: '#1e3a8a',
      }).then(() => {
        if (payFlag === "N" || payFlag === "N") {
          navigate("/app/FrmTrackApplication", { 
            state: { 
              applicationNo: applicationNo,
              serviceName: pageTitle,
              ulbId: ulbId
            } 
          });
  } else {
    navigate("/app/FrmAppliFee", { state: { applicationNo } });
  }
});

    } catch (error) {
      console.error("Error submitting application:", error);
      
      let errorMessage = "Error submitting application. Please try again.";
      
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        errorMessage = error.response.data?.message || 
                       error.response.data?.error || 
                       errorMessage;
      } else if (error.request) {
        errorMessage = "No response from server. Please check your connection.";
      } else {
        errorMessage = error.message;
      }
      
      Swal.fire({
        text: errorMessage,
        confirmButtonColor: '#1e3a8a',
      });
    } finally {
      setLoading(false);
      setSubmitting(false);
      setUploadProgress(0);
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
          className="h-9 text-sm p-1 w-[60%]"
        />
        {item.fileName && item.fileName !== "No file chosen" && (
          <span className="text-xs text-gray-500 truncate max-w-20">
            {item.fileName}
            {item.isUploaded && " "}
          </span>
        )}
      </div>
    ),
  }));

  const getTableDisplayData = () => {
    if (transformedTableData.length > 0) {
      return transformedTableData;
    }
    return [];
  };

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={handleSubmit}
    >
      {({ values, handleChange, setFieldValue, isSubmitting }) => (
        <Form>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="border shadow-sm">
              <CardHeader className="border-b">
                <CardTitle className="text-lg font-semibold">
                  {pageTitle}
                </CardTitle>
              </CardHeader>

              <CardContent className="p-4 sm:p-6 space-y-6">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center whitespace-nowrap">
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
                    <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center whitespace-nowrap">
                      <Label required text="Applicant Address" />
                      <span>:</span>
                    </div>
                    <Input
                      name="address"
                      value={values.address}
                      onChange={handleChange}
                      className="w-full h-9"
                    />
                  </div>


                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                      <Label required text="Mobile No." />
                      <span>:</span>
                    </div>
                    <Input
                      name="mobileNo"
                      value={values.mobileNo}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                        setFieldValue("mobileNo", value);
                      }}
                      className="w-full h-9"
                      type="text"
                      maxLength={10}
                    />
                  </div>


                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
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
                    <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                      <Label required text="Aadhar No." />
                      <span>:</span>
                    </div>
                    <Input
                      name="aadharNo"
                      value={values.aadharNo}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "").slice(0, 12);
                        setFieldValue("aadharNo", value);
                      }}
                      className="w-full h-9"
                      type="text"
                      maxLength={12}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                      <Label text="Reference No." />
                      <span>:</span>
                    </div>
                    <Input
                      name="referenceNo"
                      value={values.referenceNo}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFieldValue("referenceNo", value);
                      }}
                      className="w-full h-9"
                      type="text"
                    />
                  </div>


                  {isSectorVisible ? (
                    <>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                          <Label required text="Sector" />
                          <span>:</span>
                        </div>
                        <Select
                          value={values.sectorId}
                          onValueChange={(value) => {
                            setFieldValue("sectorId", value);
                            setFieldValue("villageId", "");
                            setVillageList([]);
                            if (value && value !== "0") {
                              fetchVillages(value);
                            }
                          }}
                        >
                          <SelectTrigger className="w-full h-9">
                            <SelectValue placeholder="-- Select Sector --" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.isArray(sectorList) && sectorList.length > 0 ? (
                              sectorList.map((sector) => (
                                <SelectItem 
                                  key={sector.sectorId || sector.SECTORID || Math.random()} 
                                  value={String(sector.sectorId || sector.SECTORID)}
                                >
                                  {sector.sectorName || sector.SECTORNAME || "Unknown Sector"}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="0">No sectors available</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                          <Label required text="Village" />
                          <span>:</span>
                        </div>
                        <Select
                          value={values.villageId}
                          onValueChange={(value) => setFieldValue("villageId", value)}
                          disabled={!values.sectorId || values.sectorId === "0"}
                        >
                          <SelectTrigger className="w-full h-9">
                            <SelectValue placeholder="-- Select Village --" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.isArray(villageList) && villageList.length > 0 ? (
                              villageList.map((village) => (
                                <SelectItem 
                                  key={village.villageId || village.VILLAGEID || Math.random()} 
                                  value={String(village.villageId || village.VILLAGEID)}
                                >
                                  {village.villageName || village.VILLAGENAME || "Unknown Village"}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="0">No villages available</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                    </>
                  ) : (

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
                        <Label required text="Prabhag" />
                        <span>:</span>
                      </div>
                      <Select
                        value={values.zoneId}
                        onValueChange={(value) => setFieldValue("zoneId", value)}
                      >
                        <SelectTrigger className="w-full h-9">
                          <SelectValue placeholder="-- Select Prabhag --" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.isArray(zoneList) && zoneList.map((zone) => (
                            <SelectItem 
                              key={zone.wardid || zone.WARDID} 
                              value={String(zone.wardid || zone.WARDID)}
                            >
                              {zone.wardname || zone.WARDNAME}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>


                <div className="overflow-x-auto">
                  <ShadCNTable
                    headers={headers}
                    data={getTableDisplayData()}
                    keyMapping={keyMapping}
                    pagination={false}
                    className="max-md:min-w-380"
                  />
                </div>
                

                <div className="flex justify-center items-center gap-3 pt-4">
                  <Button
                    type="submit"
                    className="bg-blue-900 hover:bg-blue-800 text-white"
                    disabled={loading || isSubmitting}
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

export default FrmServiceApplicationMst;