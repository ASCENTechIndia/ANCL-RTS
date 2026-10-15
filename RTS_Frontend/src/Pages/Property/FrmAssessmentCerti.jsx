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
  propertySearchValidationSchema, 
  applicantDetailsValidationSchema,
  documentValidationSchema 
} from "@/validations/global.validation";
import config from "@/utils/config";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const initialValues = {
  ptn: "",
  subcode: "",
  landHolder: "",
  structureHolder: "",
  ownerDetails: "",
  address: "",
  flatNo: "",
  strType: "",
  constrType: "",
  area: "",
  lettingRate: "",
  rateableValue: "",
  yearlyTax: "",
  assessmentYear: "",
  applicantName: "",
  mobileNo: "",
  emailId: "",
  zoneId: "",
};

const FrmAssessmentCerti = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token } = useAuth();

  console.log("User, Token: ", user, token);

  const locationState = location.state || {};
  
  const ulbId = locationState.ulbId || user?.ulbId;
  const userId = locationState.userId || user?.userId;
  const serviceId = locationState.serviceId;
  const serviceName = locationState.serviceName;
  const serviceRate = locationState.serviceRate;

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [documentDefs, setDocumentDefs] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [propertyFound, setPropertyFound] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [zoneList, setZoneList] = useState([]);
  const [hasSearched, setHasSearched] = useState(false); 

  const originalDocumentDefs = useRef([]);

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const headers = ["Sr No.", "Document Name", "Image(jpg,png,pdf)"];
  const keyMapping = {
    "Sr No.": "srNo",
    "Document Name": "documentName",
    "Image(jpg,png,pdf)": "fileUpload",
  };

  useEffect(() => {
    if (ulbId && serviceId) {
      fetchDocumentDefinitions();
      fetchZones();
    }
  }, [ulbId, serviceId]);

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

  const fetchDocumentDefinitions = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post(`${BASE_URL}/api/FrmAssessmentCerti/documents`, {
        serviceId: serviceId,
        ulbId: ulbId,
      },
      {
        headers: { Authorization: `Bearer ${token || localStorage.getItem("token")}` },
      }
    );

      if (response?.data?.ok && response?.data?.data?.rows) {
        const docs = response.data.data.rows;
        setDocumentDefs(docs);
        originalDocumentDefs.current = docs;
        const tableRows = docs.map((doc, index) => ({
          id: doc.DOCID || index + 1,
          srNo: index + 1,
          documentName: doc.DOCNAME || doc.ENGDOCDESC || "",
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
      Swal.fire({
        text: error?.response?.data?.error || "Failed to load document definitions",
        confirmButtonColor: '#1e3a8a',
      });
    } finally {
      setIsLoading(false);
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
        {/* {item.fileName && (
          <span className="text-xs text-gray-500">{item.fileName}</span>
        )} */}
      </div>
    ),
  }));

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
          timeout: 30000
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

  // const handleSearchProperty = async (ptn, subcode, setFieldValue) => {
  //    const validationResult = propertySearchValidationSchema.safeParse({
  //     ptn: ptn,
  //     subcode: subcode,
  //   });

  //   if (!validationResult.success) {
  //     const firstError = validationResult.error.issues[0];
  //     Swal.fire({
  //       text: firstError.message,
  //       confirmButtonColor: '#1e3a8a',
  //     });
  //     return;
  //   }


  //   try {
  //     setIsLoading(true);
  //     setSearchError("");
  //     setPropertyFound(false);

  //     let fullPropNo = ptn;
  //     if (subcode && subcode.trim() !== "") {
  //       fullPropNo = ptn + "/" + subcode;
  //     }

  //     const result = await getPropertyDetails(fullPropNo, userId);

  //     if (result && result.propertyOwners) {
  //       const propData = result.propertyOwners;

  //       if (propData.payamt && parseFloat(propData.payamt) > 0) {
  //         const payNowUrl = `https://propertytax.thanecity.gov.in/PropSearch.aspx?PTN=${ptn}`;
  //         Swal.fire({
  //           text: `Your property tax payment of Rs.${propData.payamt} is due, please make the payment first`,
  //           confirmButtonColor: '#1e3a8a',
  //           showCancelButton: true,
  //           cancelButtonText: 'Cancel',
  //           confirmButtonText: 'Pay Now',
  //         }).then((result) => {
  //           if (result.isConfirmed) {
  //             window.open(payNowUrl, '_blank');
  //           }
  //         });
  //         setPropertyFound(false);
  //         setIsLoading(false);
  //         return;
  //       }

  //       setFieldValue("landHolder", propData.land_Holder ?? "");
  //       setFieldValue("structureHolder", propData.struct_Holder ?? "");
  //       setFieldValue("ownerDetails", propData.owner_Details ?? "");
  //       setFieldValue("address", propData.address ?? "");
  //       setFieldValue("flatNo", propData.flat_No || propData.flatno || "");
  //       setFieldValue("strType", propData.usagetype_name ?? "");
  //       setFieldValue("constrType", propData.consttype_name ?? "");
  //       setFieldValue("area", propData.prop_area ?? "");
  //       setFieldValue("lettingRate", propData.letting_rate ?? "");
  //       setFieldValue("rateableValue", propData.retable_value ?? "");
  //       setFieldValue("yearlyTax", propData.yearly_tax?.toString() || "");
  //       setFieldValue("assessmentYear", propData.asses_year ?? "");

  //       setPropertyFound(true);

  //       Swal.fire({
  //         text: "Property found successfully!",
  //         confirmButtonColor: '#1e3a8a',
  //         timer: 1500,
  //       });
  //     } else {
  //       setSearchError("Property not found");
  //       Swal.fire({
  //         text: "Property not found. Please check the Property Number.",
  //         confirmButtonColor: '#1e3a8a',
  //       });
  //     }
  //   } catch (error) {
  //     console.error("Search Property Error:", error);
  //     let errorMessage = "Error searching property. Please try again.";
  //     setSearchError(errorMessage);
  //     Swal.fire({
  //       text: error?.response?.data?.error || errorMessage,
  //       confirmButtonColor: '#1e3a8a',
  //     });
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleSearchProperty = async (ptn, subcode, setFieldValue, resetForm) => {
    const validationResult = propertySearchValidationSchema.safeParse({
      ptn: ptn,
      subcode: subcode,
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

    setIsLoading(true);
     setHasSearched(true);
    try {
      setSearchError("");
      setPropertyFound(false);

      let fullPropNo = ptn;
      if (subcode && subcode.trim() !== "") {
        fullPropNo = ptn + "/" + subcode;
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
        });
      }
    } catch (error) {
      console.error("Search Property Error:", error);
      setHasSearched(false); 
      Swal.fire({
        text: error?.response?.data?.error || "Error searching property. Please try again.",
        confirmButtonColor: '#1e3a8a',
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

    setFieldValue("zoneId", "");
    
    if (originalDocumentDefs.current && originalDocumentDefs.current.length > 0) {
      const resetTableData = originalDocumentDefs.current.map((doc, index) => ({
        id: doc.DocId,
        srNo: index + 1,
        documentName: doc.DocName || doc.engdocdesc || "",
        docId: doc.DocId,
        docType: doc.DocType || "",
        file: null,
        fileName: "No file chosen",
        fileBuffer: null,
      }));
      setTableData(resetTableData);
    }
  };

  const handleSubmit = async (values) => {

    const propertyValidation = propertySearchValidationSchema.safeParse({
      ptn: values.ptn,
      subcode: values.subcode,
    });

    if (!propertyValidation.success) {
      const firstError = propertyValidation.error.issues[0];
      Swal.fire({ 
        text: firstError.message, 
        confirmButtonColor: '#1e3a8a' 
      });
      return;
    }

    const applicantValidation = applicantDetailsValidationSchema.safeParse({
      applicantName: values.applicantName,
      mobileNo: values.mobileNo,
      emailId: values.emailId,
      zoneId: values.zoneId,
    });

    if (!applicantValidation.success) {
      const firstError = applicantValidation.error.issues[0];
      Swal.fire({ 
        text: firstError.message, 
        confirmButtonColor: '#1e3a8a' 
      });
      return;
    }

    const normalizedEmail = applicantValidation.data.emailId;

    console.log("normalizedEmail", normalizedEmail);

    const documents = [];
    for (const row of tableData) {
      if (row.fileBuffer) {
        documents.push({
          docId: row.docId,
          docName: row.documentName,
          docType: row.docType,
          fileBuffer: row.fileBuffer,
        });
      }
    }

    const documentValidation = documentValidationSchema.safeParse(tableData);
    
    if (tableData.length > 0 && !documentValidation.success) {
      const firstError = documentValidation.error.issues[0];
      Swal.fire({
        text: firstError.message,
        confirmButtonColor: '#1e3a8a',
        confirmButtonText: "OK",
        allowOutsideClick: false,
      });
      setIsLoading(false);
      return;
    }

    const loader = Swal.fire({
      title: "Submitting Application...",
      text: "Please wait while we process your application.",
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => Swal.showLoading(),
    });

    const submitData = {
      ulbId: ulbId,
      corpId: user.corpId,
      userId: userId,
      zoneId: values.zoneId,
      serviceId: serviceId,
      ulbId: ulbId,
      propNo: values.ptn,
      subCode: values.subcode || "",
      landHolder: values.landHolder || "",
      structHolder: values.structureHolder || "",
      ownDetails: values.ownerDetails || "",
      address: values.address || "",
      flatNo: values.flatNo || "",
      structure: values.strType || "",
      usageType: values.strType || "",
      constType: values.constrType || "",
      area: parseFloat(values.area) || 0,
      lettingRate: parseFloat(values.lettingRate) || 0,
      rate: parseFloat(values.rateableValue) || 0,
      yearTax: parseFloat(values.yearlyTax) || 0,
      assessmentYear: values.assessmentYear || "",
      applicantName: values.applicantName,
      mobile: values.mobileNo,
      // email: values.emailId,
      email: normalizedEmail,
      appSource: config.source,
      documents: documents,
      // mahaData: {
      //   ulbId: ulbId,
      //   mahaUlbId: user?.mahaUlbId || ulbId,
      //   districtId: user?.districtId || 0,
      //   trackId: Date.now().toString(),
      // },
    };

    console.log("Submit Data:", submitData);

    try {
      setIsSubmitting(true);
      const response = await axios.post(`${BASE_URL}/api/FrmAssessmentCerti/submit`, 
        submitData, 
        {
          headers: { Authorization: `Bearer ${token || localStorage.getItem("token")}` },
        }
      );

      loader.close();
      
      if (response?.data?.ok && response?.data?.data?.success) {
        const data = response.data.data;

        Swal.fire({
          text: data.message || "Application submitted successfully!",
          confirmButtonColor: '#1e3a8a',
        }).then(() => {
          navigate("/app/FrmTrackApplication", { state: { applicationNo: data.applicationNo } });
          // if (data.payFlag === "N") {
          //   navigate("/app/FrmAssessmentCerti");
          // } else {
          //   navigate("/app/FrmAppliFee", {
          //     state: {
          //       applicationNo: data.applicationNo,
          //       serviceId: serviceId,
          //       propNo: values.ptn,
          //     },
          //   });
          // }
        });
      } else {
        Swal.fire({
          text: response?.data?.message || "Application submission failed",
          confirmButtonColor: '#1e3a8a',
        });
      }
    } catch (error) {
      console.error("Submit Error:", error);
      Swal.fire({
        text: error?.response?.data?.error || "Error submitting application",
        confirmButtonColor: '#1e3a8a',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Formik initialValues={initialValues} onSubmit={handleSubmit}>
      {({ values, handleChange, setFieldValue, resetForm }) => (
        <Form>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="border shadow-sm">
              <CardHeader className="border-b">
                <CardTitle className="text-lg font-semibold">
                  Assessment Certificate
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
                        if (propertyFound) {
                          setPropertyFound(false);
                          setHasSearched(false);
                        }
                      }}
                      className="w-full h-9"
                      placeholder="Enter Property Number"
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
                      placeholder="Enter Subcode"
                    />
                  </div> */}
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      className="bg-blue-900 hover:bg-blue-800 text-white"
                      onClick={() => handleSearchProperty(values.ptn, values.subcode, setFieldValue, resetForm)}
                      disabled={isLoading}
                    >
                      {isLoading ? "Searching..." : "Search"}
                    </Button>
                  </div>
                </div>

                <hr />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                      <Label text="Flat/Shop/Unit No." />
                      <span>:</span>
                    </div>
                    <div className="w-full min-h-9 flex items-center px-2">
                      {values.flatNo || ""}
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                      <Label text="Structure Type / Usage Type" />
                      <span>:</span>
                    </div>
                    <div className="w-full min-h-9 flex items-center px-2">
                      {values.strType || ""}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                      <Label text="Construction Type" />
                      <span>:</span>
                    </div>
                    <div className="w-full min-h-9 flex items-center px-2">
                      {values.constrType || ""}
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                      <Label text="Area" />
                      <span>:</span>
                    </div>
                    <div className="w-full min-h-9 flex items-center px-2">
                      {values.area || ""}
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                      <Label text="Letting Rate" />
                      <span>:</span>
                    </div>
                    <div className="w-full min-h-9 flex items-center px-2">
                      {values.lettingRate || ""}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                      <Label text="Rateable Value" />
                      <span>:</span>
                    </div>
                    <div className="w-full min-h-9 flex items-center px-2">
                      {values.rateableValue || ""}
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                      <Label text="Yearly Tax" />
                      <span>:</span>
                    </div>
                    <div className="w-full min-h-9 flex items-center px-2">
                      {values.yearlyTax || ""}
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                      <Label text="Assessment Year" />
                      <span>:</span>
                    </div>
                    <div className="w-full min-h-9 flex items-center px-2">
                      {values.assessmentYear || ""}
                    </div>
                  </div>
                </div>

                <hr />

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
                      placeholder="Enter Applicant Name"
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
                      placeholder="Enter 10-digit Mobile Number"
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
                      placeholder="Enter Email ID"
                      maxLength={30}
                    />
                  </div>
                </div>

                <hr />

                {tableData.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-medium">
                      Document Upload <span className="text-red-500">*</span>
                    </h4>
                    {isLoading ? (
                      <div className="text-center py-4">Loading documents...</div>
                    ) : (
                      <div className="overflow-x-auto">
                        <ShadCNTable
                          headers={headers}
                          data={transformedTableData}
                          keyMapping={keyMapping}
                          pagination={false}
                          className="max-md:min-w-380"
                        />
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-center items-center gap-3 pt-4">
                  {/* <Button
                    type="submit"
                    className="bg-blue-900 hover:bg-blue-800 text-white"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Submit"}
                  </Button> */}

                  <Button
                    type="submit"
                    className="bg-blue-900 hover:bg-blue-800 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSubmitting || !propertyFound}
                  >
                    {isSubmitting ? "Submitting..." : "Submit"}
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

export default FrmAssessmentCerti;