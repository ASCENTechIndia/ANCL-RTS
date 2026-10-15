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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ShadCNTable from "@/components/ui/table";
import Swal from "sweetalert2";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { 
  propertySearchValidationSchema,
  propertyRebateValidationSchema,
  documentValidationSchema
} from "@/validations/global.validation";
import config from "@/utils/config";

const initialValues = {
  ptn: "",
  subcode: "",
  landHolder: "",
  structureHolder: "",
  ownerDetails: "",
  address: "",
  applicantName: "",
  mobileNo: "",
  emailId: "",
  aadharNo: "",
  pincode: "",
  rebateType: "",
  remark: "",
  zoneId: "",
};

const FrmRebateTax = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token } = useAuth();

  const locationState = location.state || {};

  const ulbId = locationState.ulbId || user?.ulbId;
  const userId = locationState.userId || user?.userId;
  const zoneId = locationState.zoneId || user?.zoneId || "12";
  const mahaUlbId = locationState.mahaUlbId || user?.mahaUlbId;
  const serviceId = locationState.serviceId;

  const [loading, setLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [rebateTypes, setRebateTypes] = useState([]);
  const [taxNames, setTaxNames] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [documentDefs, setDocumentDefs] = useState([]);
  const [showTaxGrid, setShowTaxGrid] = useState(false);
  const [selectedTaxes, setSelectedTaxes] = useState([]);
  const [prabhag, setPrabhag] = useState("");
  const [zoneid, setZoneid] = useState("");
  const [ward, setWard] = useState("");
  const [prabhagname, setPrabhagname] = useState("");
  const [zone, setZone] = useState("");
  const [wardno, setWardno] = useState("");
  const [zoneList, setZoneList] = useState([]);
  const [propertyFound, setPropertyFound] = useState(false);  
  const [hasSearched, setHasSearched] = useState(false); 

  const originalDocumentDefs = useRef([]);

  console.log('serviceId', serviceId);

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const headers = ["Sr No.", "Document Name", "Image(jpg,png,pdf)"];
  const keyMapping = {
    "Sr No.": "srNo",
    "Document Name": "documentName",
    "Image(jpg,png,pdf)": "fileUpload",
  };

  useEffect(() => {
    fetchZones();
    fetchRebateTypes();
    fetchTaxNames();
    fetchDocumentDefinitions(serviceId, ulbId);
    document.title = serviceId == "287" ? "Rebate on Tax" : "Rebate to Vacant Properties";
  }, [serviceId, ulbId]);

  const fetchZones = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/FrmWaterRegister/ward-dropdown?ulbid=${ulbId}`,
        {
          headers: { Authorization: `Bearer ${token || localStorage.getItem("token")}` },
        }
      );

      if (response?.data?.ok && response?.data?.data?.data) {
        setZoneList(response.data.data.data);
      }
    } catch (error) {
      console.error("Error fetching zones:", error);
    }
  };

  const fetchRebateTypes = async () => {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/FrmRebateTax/rebate-types`,
        {},
        {
          headers: { Authorization: `Bearer ${token || localStorage.getItem("token")}` },
        }
      );

      if (response.data.ok && response.data.data?.rows) {
        setRebateTypes(response.data.data.rows);
      }
    } catch (error) {
      console.error("Error fetching rebate types:", error);
    }
  };

  const fetchTaxNames = async () => {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/FrmRebateTax/tax-names`,
        {},
        {
          headers: { Authorization: `Bearer ${token || localStorage.getItem("token")}` },
        }
      );

      if (response.data.ok && response.data.data?.rows) {
        setTaxNames(response.data.data.rows);
      }
    } catch (error) {
      console.error("Error fetching tax names:", error);
    }
  };

  const fetchDocumentDefinitions = async (serviceId, ulbId) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/FrmAssessmentCerti/documents`,
        {
          serviceId,
          ulbId,
        },
        {
          headers: { Authorization: `Bearer ${token || localStorage.getItem("token")}` },
        }
      );

      if (response.data.ok && response.data.data?.rows) {
        const docs = response.data.data.rows;
        setDocumentDefs(docs);
        originalDocumentDefs.current = docs;
        const tableRows = docs.map((doc, index) => ({
          id: doc.DOCID || index + 1,
          srNo: index + 1,
          documentName: doc.DOCNAME || doc.ENGDOCDESC || "Document",
          docId: doc.DOCID,
          docType: doc.DOCTYPE || "PDF",
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

  const getPropertyDetails = async (propNo, userId) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/FrmNoDuesCerti/property-details`,
        {
          propNo: propNo,
          userId: userId,
        },
        {
          headers: { Authorization: `Bearer ${token || localStorage.getItem("token")}` },
        }
      );

      if (response.data.ok && response.data.data) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error("getPropertyDetails Error:", error);
      throw error;
    }
  };

  // const handleSearchProperty = async (values, setFieldValue) => {
  //   const validationResult = propertySearchValidationSchema.safeParse({
  //     ptn: values.ptn,
  //     subcode: values.subcode,
  //   });

  //   if (!validationResult.success) {
  //     const firstError = validationResult.error.issues[0];
  //     Swal.fire({
  //       text: firstError.message,
  //       confirmButtonColor: '#1e3a8a',
  //     });
  //     return;
  //   }

  //   setIsSearching(true);
  //   try {
  //     let fullPropNo = values.ptn;
  //     if (values.subcode && values.subcode.trim() !== "") {
  //       fullPropNo = values.ptn + "/" + values.subcode;
  //     }

  //     const result = await getPropertyDetails(fullPropNo, userId);

  //     if (result && result.propertyOwners) {
  //       const propData = result.propertyOwners;

  //       if (propData.payamt && parseFloat(propData.payamt) > 0) {
  //         const payNowUrl = `https://propertytax.thanecity.gov.in/PropSearch.aspx?PTN=${values.ptn}`;
  //         Swal.fire({
  //           text: `Property tax payment of Rs.${propData.payamt} is due, please make the payment first`,
  //           confirmButtonColor: '#1e3a8a',
  //           showCancelButton: true,
  //           cancelButtonText: "Pay Now",
  //           cancelButtonColor: "#d33",
  //         }).then((result) => {
  //           if (result.isConfirmed) {
  //             window.open(payNowUrl, '_blank');
  //           }
  //         });
  //         setIsSearching(false);
  //         return;
  //       }

  //       setFieldValue("landHolder", propData.land_Holder || "");
  //       setFieldValue("structureHolder", propData.struct_Holder || "");
  //       setFieldValue("ownerDetails", propData.owner_Details || "");
  //       setFieldValue("address", propData.address || "");

  //       setPrabhag(propData.prabhag || "");
  //       setZoneid(propData.zoneid || "");
  //       setWard(propData.wardno || "");
  //       setPrabhagname(propData.prabhagname || "");
  //       setZone(propData.zonename || "");
  //       setWardno(propData.wardname || "");

  //       Swal.fire({
  //         text: "Property details fetched successfully!",
  //         confirmButtonColor: '#1e3a8a',
  //         timer: 1500,
  //       });
  //     } else {
  //       Swal.fire({
  //         text: "Property Not Found For This Prop No",
  //         confirmButtonColor: '#1e3a8a',
  //       });
  //     }
  //   } catch (error) {
  //     console.error("Error fetching property details:", error);
  //     Swal.fire({
  //       text: error?.response?.data?.error || "Error fetching property details. Please try again.",
  //       confirmButtonColor: '#1e3a8a',
  //     });
  //   } finally {
  //     setIsSearching(false);
  //   }
  // };

  const handleSearchProperty = async (values, setFieldValue, resetForm) => {
    const validationResult = propertySearchValidationSchema.safeParse({
      ptn: values.ptn,
      subcode: values.subcode,
    });

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      Swal.fire({
        text: firstError.message,
        confirmButtonColor: '#1e3a8a',
        confirmButtonText: "OK",
        allowOutsideClick: false,
      });
      return;
    }

    setIsSearching(true);
     setHasSearched(true);

    try {
      let fullPropNo = values.ptn;
      if (values.subcode && values.subcode.trim() !== "") {
        fullPropNo = values.ptn + "/" + values.subcode;
      }

      const result = await getPropertyDetails(fullPropNo, userId);

      if (result && result.propertyOwners) {
        const propData = result.propertyOwners;

        if (propData.payamt && parseFloat(propData.payamt) > 0) {
          Swal.fire({
            text: `Your property tax payment of Rs.${propData.payamt} is due, please make the payment first`,
            confirmButtonColor: '#1e3a8a',
            confirmButtonText: "OK",
            allowOutsideClick: false,
          }).then(() => {
            resetFormAfterSearch(setFieldValue, resetForm);
            setHasSearched(false); 
            setPropertyFound(false);   
          });
          setIsSearching(false);
          return;
        }

        setFieldValue("landHolder", propData.land_Holder || "");
        setFieldValue("structureHolder", propData.struct_Holder || "");
        setFieldValue("ownerDetails", propData.owner_Details || "");
        setFieldValue("address", propData.address || "");

        setPrabhag(propData.prabhag || "");
        setZoneid(propData.zoneid || "");
        setWard(propData.wardno || "");
        setPrabhagname(propData.prabhagname || "");
        setZone(propData.zonename || "");
        setWardno(propData.wardname || "");

        setPropertyFound(true);   

        Swal.fire({
          text: "Property details fetched successfully!",
          confirmButtonColor: '#1e3a8a',
          timer: 1500,
          allowOutsideClick: false,
        });
      } else {
        Swal.fire({
          text: "Property Not Found For This Prop No",
          confirmButtonColor: '#1e3a8a',
          confirmButtonText: "OK",
          allowOutsideClick: false,
        }).then(() => {
          resetFormAfterSearch(setFieldValue, resetForm);
          setHasSearched(false); 
            setPropertyFound(false);   
        });
      }
    } catch (error) {
      console.error("Error fetching property details:", error);
      setHasSearched(false); 
      setPropertyFound(false);   
      Swal.fire({
        text: error?.response?.data?.error || "Error fetching property details. Please try again.",
        confirmButtonColor: '#1e3a8a',
        confirmButtonText: "OK",
        allowOutsideClick: false,
      });
    } finally {
      setIsSearching(false);
    }
  };
  
  const resetFormAfterSearch = (setFieldValue, resetForm) => {
    resetForm();
    setHasSearched(false); 
    setPropertyFound(false);   
    
    setFieldValue("ptn", "");
    setFieldValue("subcode", "");
    setFieldValue("landHolder", "");
    setFieldValue("structureHolder", "");
    setFieldValue("ownerDetails", "");
    setFieldValue("address", "");
    setFieldValue("applicantName", "");
    setFieldValue("mobileNo", "");
    setFieldValue("emailId", "");
    setFieldValue("aadharNo", "");
    setFieldValue("pincode", "");
    setFieldValue("rebateType", "");
    setFieldValue("remark", "");
    setFieldValue("zoneId", "");
    
    setShowTaxGrid(false);
    setSelectedTaxes([]);
    setPrabhag("");
    setZoneid("");
    setWard("");
    setPrabhagname("");
    setZone("");
    setWardno("");
    
    setTableData((prevTableData) => {
      if (originalDocumentDefs.current && originalDocumentDefs.current.length > 0) {
        return originalDocumentDefs.current.map((doc, index) => ({
          id: doc.DOCID || index + 1,
          srNo: index + 1,
          documentName: doc.DOCNAME || doc.ENGDOCDESC || "Document",
          docId: doc.DOCID,
          docType: doc.DOCTYPE || "PDF",
          file: null,
          fileName: "No file chosen",
          fileBuffer: null,
        }));
      }
      return prevTableData.map((row) => ({
        ...row,
        file: null,
        fileName: "No file chosen",
        fileBuffer: null,
      }));
    });
  };

  const uploadDocument = async (applicationNo, doc) => {
    const formData = new FormData();
    formData.append("corpId", user.corpId); 
    formData.append("serviceId", serviceId);
    formData.append("appNo", applicationNo);
    formData.append("docType", doc.docType || "PDF");
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
        }
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
          districtId: Number(0),
          requestString: `TrackId:${Date.now()}|AppNo:${applicationNo}|ServiceId:${serviceId}|ULBId:${ulbId}|MahaULBId:${mahaUlbId || ulbId}|Timestamp:${Date.now()}`,
          responseString: `Success|Application:${applicationNo}|Status:Processed|Timestamp:${Date.now()}`,
          encryptedFinalString: `ENC_${applicationNo}_${Date.now()}`
        },
        applicationNo: applicationNo,
        serviceId: String(serviceId),
      };

      console.log("Maha Online Request Payload:", mahaPayload);

      const response = await axios.post(
        `${BASE_URL}/api/FrmAssessmentCerti/maha-online-first-step`,
        mahaPayload,
        {
          headers: { Authorization: `Bearer ${token || localStorage.getItem("token")}` },
        }
      );

      console.log("Maha Online Response:", response.data);
      return response.data.data.success;
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
          serviceId: serviceId,
        },
        {
          headers: { Authorization: `Bearer ${token || localStorage.getItem("token")}` },
        }
      );
      if (response.data.data.success && response.data.data?.rows) {
        return response.data.data.rows[0]?.VAR_SERVICE_PAYFLAG || "N";
      }
      return "N";
    } catch (error) {
      console.error("Error checking payment flag:", error);
      return "N";
    }
  };

  const handleFileChange = (id, event) => {
    const file = event.currentTarget.files?.[0];
    if (file) {
      setTableData((prev) =>
        prev.map((row) =>
          row.id === id
            ? { ...row, file: file, fileName: file.name }
            : row
        )
      );
    }
  };

  const handleSubmit = async (values, { resetForm }) => {
    setLoading(true);
    try {
      const propertyValidation = propertySearchValidationSchema.safeParse({
        ptn: values.ptn,
        subcode: values.subcode,
      });

      if (!propertyValidation.success) {
        const firstError = propertyValidation.error.issues[0];
        Swal.fire({ text: firstError.message, confirmButtonColor: '#1e3a8a' });
        setLoading(false);
        return;
      }

      const applicantValidation = propertyRebateValidationSchema.safeParse({
        applicantName: values.applicantName,
        mobileNo: values.mobileNo,
        emailId: values.emailId,
        aadharNo: values.aadharNo,
        pincode: values.pincode,
        rebateType: values.rebateType,
        remark: values.remark,
        landHolder: values.landHolder,
        structureHolder: values.structureHolder,
        ownerDetails: values.ownerDetails,
        address: values.address,
        zoneId: values.zoneId,
      });

      if (!applicantValidation.success) {
        const firstError = applicantValidation.error.issues[0];
        Swal.fire({ text: firstError.message, confirmButtonColor: '#1e3a8a' });
        setLoading(false);
        return;
      }

      const normalizedEmail = applicantValidation.data.emailId;

      if (serviceId == "287") {
        if (!values.rebateType || values.rebateType === "0") {
          Swal.fire({ 
            text: "Please Select Rebate Type", 
            confirmButtonColor: '#1e3a8a' 
          });
          setLoading(false);
          return;
        }
      }

      let taxStr = "";
      if (serviceId == "287") {
        if (values.rebateType === "1") {
          taxStr = taxNames.map(tax => String(tax.ID)).join("#");
        } else if (values.rebateType === "2") {
          if (selectedTaxes.length === 0) {
            Swal.fire({ 
              text: "Please select at least one tax", 
              confirmButtonColor: '#1e3a8a' 
            });
            setLoading(false);
            return;
          }
          taxStr = selectedTaxes.join("#");
        }
      }

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

      console.log("Documents to upload:", documents);

      const documentValidation = documentValidationSchema.safeParse(tableData);
      
      if (!documentValidation.success) {
        const firstError = documentValidation.error.issues[0];
        Swal.fire({
          text: firstError.message,
          confirmButtonColor: '#1e3a8a',
          confirmButtonText: "OK",
          allowOutsideClick: false,
        });
        setLoading(false);
        return;
      }

      const loader = Swal.fire({
        title: "Submitting Application...",
        text: "Please wait while we process your application.",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading(),
      });

      const buildRequestString = (appNo) => {
        return `TrackId:${Date.now()}|AppNo:${appNo}|ServiceId:${serviceId}|ULBId:${ulbId}|MahaULBId:${mahaUlbId || ulbId}|Timestamp:${Date.now()}`;
      };

      const buildResponseString = (appNo) => {
        return `Success|Application:${appNo}|Status:Processed|Timestamp:${Date.now()}`;
      };

      const buildEncryptedString = (appNo) => {
        return `ENC_${appNo}_${Date.now()}`;
      };

      const payload = {
        userId: userId,
        zoneId: values.zoneId,
        serviceId: serviceId,
        propNo: values.ptn,
        subCode: values.subcode || "",
        landHolder: values.landHolder || "",
        structHolder: values.structureHolder || "",
        ownName: values.ownerDetails || "",
        address: values.address || "",
        appliname: values.applicantName,
        mobile: values.mobileNo,
        // email: values.emailId,
        email: normalizedEmail,
        aadhar: values.aadharNo || 0,
        pincode: values.pincode,
        exempType: values.rebateType || 0,
        remark: values.remark,
        taxStr: taxStr,
        appSource: config.source,
        documents: documents,
        // mahaData: {
        //   ulbId: Number(ulbId),
        //   mahaUlbId: Number(mahaUlbId || ulbId),
        //   districtId: Number(0),
        //   trackId: Date.now().toString(),
        //   requestString: buildRequestString(""),
        //   responseString: buildResponseString(""),
        //   encryptedFinalString: buildEncryptedString("")
        // }
      };

      console.log("Submit Payload:", payload);

      const submitResponse = await axios.post(
        `${BASE_URL}/api/FrmRebateTax/submit`,
        payload,
        {
          headers: { Authorization: `Bearer ${token || localStorage.getItem("token")}` },
        }
      );

      if (!submitResponse.data.ok) {
        Swal.fire({
          text: submitResponse.data.message || "Application submission failed",
          confirmButtonColor: '#1e3a8a',
        });
        setLoading(false);
        return;
      }

      const applicationNo = submitResponse.data.data.applicationNo;
      const message = submitResponse.data.data.message || "Application submitted successfully";

      for (const doc of documents) {
        const success = await uploadDocument(applicationNo, doc);
        if (!success) {
          Swal.fire({
            text: `Failed to upload document: ${doc.docName}`,
            confirmButtonColor: '#1e3a8a',
          });
          setLoading(false);
          return;
        }
      }

      // const mahaSuccess = await insertMahaOnline(applicationNo);
      // if (!mahaSuccess) {
      //   console.warn("Maha Online integration failed, but application was created");
      // }

      const payFlag = await checkPaymentFlag();

      loader.close();

      Swal.fire({
        text: `${message}${payFlag === "Y" ? " Please proceed to payment." : ""}`,
        confirmButtonColor: '#1e3a8a',
      }).then(() => {
        navigate("/app/FrmTrackApplication", { state: { applicationNo: applicationNo } });
        // if (payFlag === "Y") {
        //   navigate("/app/FrmAppliFee", { state: { applicationNo: applicationNo } });
        // } else {
        //   navigate("/app/FrmRebateTax");
        // }
      });

    } catch (error) {
      console.error("Error submitting application:", error);
      Swal.fire({
        text: error?.response?.data?.error || "Error submitting application. Please try again.",
        confirmButtonColor: '#1e3a8a',
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
        {/* {item.fileName && item.fileName !== "No file chosen" && (
          <span className="text-xs text-gray-500 truncate max-w-[80px]">{item.fileName}</span>
        )} */}
      </div>
    ),
  }));

  return (
    <Formik
      initialValues={initialValues}
       onSubmit={(values, { resetForm }) => handleSubmit(values, { resetForm })}
    >
      {({ values, handleChange, setFieldValue, resetForm }) => (
        <Form>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="border shadow-sm">
              <CardHeader className="border-b">
                <CardTitle className="text-lg font-semibold">
                  {serviceId == "287" ? "Rebate on Tax" : "Rebate to Vacant Properties"}
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
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      className="bg-blue-900 hover:bg-blue-800 text-white"
                      onClick={() => handleSearchProperty(values, setFieldValue, resetForm)}
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

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                          {zoneList.map((zone) => (
                            <SelectItem key={zone.WARDID} value={String(zone.WARDID)}>
                              {zone.WARDNAME}
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
                        <Label text="Aadhar No." />
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
                      <div className="sm:w-40 shrink-0 flex justify-start sm:justify-between items-center">
                        <Label required text="Pincode" />
                        <span>:</span>
                      </div>
                      <Input
                        name="pincode"
                        value={values.pincode}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                          setFieldValue("pincode", value);
                        }}
                        className="w-full h-9"
                        type="text"
                        maxLength={6}
                      />
                    </div>

                    {serviceId == "287" && (
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <div className="sm:w-40 shrink-0 flex justify-start sm:justify-between items-center">
                          <Label required text="Rebate Type" />
                          <span>:</span>
                        </div>
                        <Select
                          value={values.rebateType}
                          onValueChange={(value) => {
                            setFieldValue("rebateType", value);
                            setShowTaxGrid(value === "2");
                            setSelectedTaxes([]);
                          }}
                        >
                          <SelectTrigger className="w-full h-9">
                            <SelectValue placeholder="-- Select Option --" />
                          </SelectTrigger>
                          <SelectContent>
                            {rebateTypes.map((type) => (
                              <SelectItem
                                key={type.NUM_REBATETYPE_ID}
                                value={String(type.NUM_REBATETYPE_ID)}
                              >
                                {type.VAR_REBATETYPE_NAME}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="sm:w-40 shrink-0 flex justify-start sm:justify-between items-center">
                        <Label required text="Remark" />
                        <span>:</span>
                      </div>
                      <Input
                        name="remark"
                        value={values.remark}
                        onChange={handleChange}
                        className="w-full h-9"
                      />
                    </div>
                  </div>
                </div>

                {showTaxGrid && (
                  <>
                    <hr />
                      <div className="overflow-x-auto">
                        <ShadCNTable
                          headers={["Select", "Tax Id", "Tax Name"]}
                          data={taxNames.map((tax) => ({
                            id: tax.ID,
                            taxId: tax.ID,
                            taxName: tax.NAME || tax.VAR_TAXNAME_NAME || "",
                            select: (
                              <input
                                type="checkbox"
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  if (checked) {
                                    setSelectedTaxes([...selectedTaxes, tax.ID]);
                                  } else {
                                    setSelectedTaxes(selectedTaxes.filter(id => id !== tax.ID));
                                  }
                                }}
                                checked={selectedTaxes.includes(tax.ID)}
                              />
                            ),
                          }))}
                          keyMapping={{
                            "Select": "select",
                            "Tax Id": "taxId",
                            "Tax Name": "taxName",
                          }}
                          pagination={false}
                          className="max-md:min-w-380"
                        />
                      </div>
                  </>
                )}

                <hr />
                <div className="overflow-x-auto">
                  <ShadCNTable
                    headers={headers}
                    data={transformedTableData}
                    keyMapping={keyMapping}
                    pagination={false}
                    className="max-md:min-w-380"
                  />
                </div>

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

export default FrmRebateTax;