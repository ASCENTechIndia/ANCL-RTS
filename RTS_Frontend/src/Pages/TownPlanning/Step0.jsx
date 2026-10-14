import React, { useState, useEffect } from "react";
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
import Swal from "sweetalert2";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import config from "@/utils/config";
import { step0ValidationSchema } from "@/validations/global.validation";
import ShadCNTable from "@/components/ui/table";

const initialValues = {
  firstName: "",
  firstNameM: "",
  middleName: "",
  middleNameM: "",
  lastName: "",
  lastNameM: "",
  mobileNo: "",
  aadharNo: "",
  email: "",
  address: "",
  addressM: "",
  purpose: "",
  purposeM: "",
  zoneId: "",
  wardNo: "",
  propertyNo: "",
  waterSewerageType: "",
};

const Step0 = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token } = useAuth();

  const locationState = location.state || {};

  const ulbId = locationState.ulbId || user?.ulbId;
  const userId = locationState.userId || user?.userId;
  const corpId = locationState.corpId || user?.corpId;
  const serviceId = locationState.serviceId;
  const serviceName = locationState.serviceName || "Applicant Information";
  const appNo = locationState.appNo;

  console.log("Step0 locationState:", locationState);

  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState(1);
  const [zones, setZones] = useState([]);
  const [waterSewerageTypes, setWaterSewerageTypes] = useState([]);

  const [documentDefs, setDocumentDefs] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState([]);

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const SERVICES_WITH_PROPERTY_NO = [2];
  const SERVICES_WITH_WATER_SEWERAGE = [16]; 
  const showPropertyNo = SERVICES_WITH_PROPERTY_NO.includes(serviceId);
  const showWaterSewerage = SERVICES_WITH_WATER_SEWERAGE.includes(serviceId);

  const headers = ["Sr No.", "Document Name", "Upload Document"];
  const keyMapping = {
    "Sr No.": "srNo",
    "Document Name": "documentName",
    "Upload Document": "fileUpload",
  };

  useEffect(() => {
    fetchZones();
    fetchUserMobile();
    fetchWaterSewerageTypes();
    fetchServiceDocuments(); 
    document.title = serviceName || "Applicant Information / अर्जदाराचे माहिती";
  }, []);

  const fetchZones = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/watermodule/wards`,
        {
          headers: { Authorization: `Bearer ${token || localStorage.getItem("token")}` },
        }
      );

      if (response?.data?.data?.success && response?.data?.data?.data) {
        setZones(response.data.data.data);
      }
    } catch (error) {
      console.error("Error fetching zones:", error);
    }
  };

  const fetchWaterSewerageTypes = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/watermodule/water-sewerage-types`,
        {
          headers: { Authorization: `Bearer ${token || localStorage.getItem("token")}` },
        }
      );

      if (response?.data?.success && response?.data?.data) {
        setWaterSewerageTypes(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching water sewerage types:", error);
    }
  };

  const fetchUserMobile = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/watermodule/user-mobile?userUniqueId=${userId}&ulbid=${ulbId}`,
        {
          headers: { Authorization: `Bearer ${token || localStorage.getItem("token")}` },
        }
      );

      if (response?.data?.data?.success && response?.data?.data?.data) {
        return String(response.data.data.data[0]?.NUM_USER_MOBILENO || "");
      }
      return null;
    } catch (error) {
      console.error("Error fetching user mobile:", error);
      return null;
    }
  };

  const fetchServiceDocuments = async () => {
    try {
        const response = await axios.get(
        `${BASE_URL}/api/watermodule/service-documents?serviceId=${serviceId}&ulbid=${ulbId}`,
        {
            headers: { Authorization: `Bearer ${token || localStorage.getItem("token")}` },
        }
        );

        console.log("Document Response: ", response);

        if (response?.data?.data?.success && response?.data?.data?.data) {
        const docs = response.data.data.data;
        setDocumentDefs(docs);
        
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
        console.error("Error fetching service documents:", error);
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

  const uploadDocument = async (applicationNo, doc) => {
    try {
        const formData = new FormData();
        formData.append("documents", doc.file);

        const response = await axios.post(
        `${BASE_URL}/api/watermodule/upload-app-doc?CorpId=${corpId}&ServiceId=${serviceId}&AppNo=${applicationNo}&DocType=${doc.docType || "PDF"}&DocumentId=${doc.docId}`,
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

  const handleSubmit = async (values, { setSubmitting }) => {
    setLoading(true);

    try {
      const validationResult = step0ValidationSchema.safeParse({
        firstName: values.firstName,
        firstNameM: values.firstNameM,
        middleName: values.middleName,
        middleNameM: values.middleNameM,
        lastName: values.lastName,
        lastNameM: values.lastNameM,
        mobileNo: values.mobileNo,
        email: values.email,
        address: values.address,
        addressM: values.addressM,
        purpose: values.purpose,
        purposeM: values.purposeM,
        zoneId: values.zoneId,
      });

      if (!validationResult.success) {
        const firstError = validationResult.error.issues[0];
        Swal.fire({
          text: firstError.message,
          confirmButtonColor: '#1e3a8a',
          confirmButtonText: "OK",
        });
        setLoading(false);
        setSubmitting(false);
        return;
      }

      const normalizedEmail = validationResult.data.email || "";
      console.log("normalizedEmail step0: ", normalizedEmail);

      if (showPropertyNo && !values.propertyNo) {
        Swal.fire({
          text: "Property No can not be blank",
          confirmButtonColor: '#1e3a8a',
          confirmButtonText: "OK",
        });
        setLoading(false);
        setSubmitting(false);
        return;
      }

      if (showWaterSewerage && !values.waterSewerageType) {
        Swal.fire({
          text: "Please select Water Sewerage Type",
          confirmButtonColor: '#1e3a8a',
          confirmButtonText: "OK",
        });
        setLoading(false);
        setSubmitting(false);
        return;
      }

      if (values.mobileNo && values.mobileNo.length !== 10) {
        Swal.fire({
          text: "Invalid Mobile No. Mobile number must be 10 digits",
          confirmButtonColor: '#1e3a8a',
          confirmButtonText: "OK",
        });
        setLoading(false);
        setSubmitting(false);
        return;
      }

      if (tableData.length > 0) {
        const missingDocs = tableData.filter(doc => doc.file === null || doc.file === undefined || doc.file === "");
        
        if (missingDocs.length > 0) {
            Swal.fire({
            text: "All documents are compulsory. Please upload all required documents.",
            confirmButtonColor: '#1e3a8a',
            confirmButtonText: "OK",
            });
            setLoading(false);
            setSubmitting(false);
            return;
        }
      }

      const loader = Swal.fire({
        title: "Saving Applicant Information...",
        text: "Please wait while we process your application.",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading(),
      });

      const payload = {
        in_ulbid: Number(ulbId),
        in_corpid: Number(corpId),
        in_serviceid: Number(serviceId),
        in_userid: Number(userId),
        in_firstname: values.firstName || null,
        in_firstnameM: values.firstNameM || null,
        in_middlename: values.middleName || null,
        in_middlenameM: values.middleNameM || null,
        in_lastname: values.lastName || null,
        in_lastnameM: values.lastNameM || null,
        in_mobileno: values.mobileNo ? Number(values.mobileNo) : null,
        in_adharno: values.aadharNo || null,
        // in_email: values.email || null,
        in_email: normalizedEmail || null,
        in_address: values.address || null,
        in_addressM: values.addressM || null,
        in_purpose: values.purpose || null,
        in_purposeM: values.purposeM || null,
        in_zoneid: values.zoneId ? Number(values.zoneId) : null,
        in_wardno: values.wardNo ? Number(values.wardNo) : null,
        in_propertyno: values.propertyNo || null,
        in_mode: mode,
        in_PropertyUsage: null,
        in_SellerName: null,
        in_TransferToWhom: null, 
        in_AgreementDate: null,
        in_AppNo: appNo || null,
        in_wtsewrgtypeid: values.waterSewerageType ? Number(values.waterSewerageType) : null,
        in_nocpurposeid: null,
        in_RegiNo: null,
        in_UniqueNo: null,
        in_appsource: config.source,
        in_deliveryflag: null,
        in_consumertypeid: null,
        in_metertypeid: null,
      };

      console.log("Submit Payload:", payload);

      const response = await axios.post(
        `${BASE_URL}/api/watermodule/save`,
        payload,
        {
          headers: { Authorization: `Bearer ${token || localStorage.getItem("token")}` },
        }
      );

      loader.close();

      console.log("response", response);

      if (!response.data.data.success) {
        Swal.fire({
          text: response.data.data.message || "Failed to save applicant information",
          confirmButtonColor: '#1e3a8a',
          confirmButtonText: "OK",
        });
        setLoading(false);
        setSubmitting(false);
        return;
      }

      const applicationNo = response.data?.data?.data?.appNo || appNo || "New Application";

      if (tableData.length > 0) {
        const documentsToUpload = tableData.filter(doc => doc.file !== null);
        
        if (documentsToUpload.length > 0) {
            let allUploaded = true;
            
            for (const doc of documentsToUpload) {
            const success = await uploadDocument(applicationNo, doc);
            if (!success) {
                allUploaded = false;
                Swal.fire({
                text: `Failed to upload document: ${doc.documentName}`,
                confirmButtonColor: '#1e3a8a',
                confirmButtonText: "OK",
                });
                break;
            }
            }
            
            if (!allUploaded) {
            setLoading(false);
            setSubmitting(false);
            return;
            }
        }
      }

      Swal.fire({
        text: `${response.data.data.message || "Applicant information saved successfully!"} Application No: ${applicationNo}`,
        confirmButtonColor: '#1e3a8a',
        confirmButtonText: "OK",
      }).then(() => {
        // navigate("/app/Step1", {
        //   state: {
        //     applicationNo: applicationNo,
        //     serviceId: serviceId,
        //     ulbId: ulbId,
        //     userId: userId,
        //     corpId: corpId,
        //     serviceName: serviceName,
        //   }
        // });
            navigate("/app/FrmTrackApplication", { state: { applicationNo: applicationNo } });
      });

    } catch (error) {
      console.error("Error submitting application:", error);
      Swal.fire({
        text: error?.response?.data?.message || "Error submitting application. Please try again.",
        confirmButtonColor: '#1e3a8a',
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validateOnBlur={true}
      validateOnChange={true}
    >
      {({ values, handleChange, setFieldValue, isSubmitting }) => {

        useEffect(() => {
          const getMobile = async () => {
            const mobile = await fetchUserMobile();
            if (mobile) {
              setFieldValue("mobileNo", String(mobile));
            }
          };
          getMobile();
        }, []);

        return (
          <Form>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card className="border shadow-sm">
                <CardHeader className="border-b">
                    <CardTitle className="text-lg font-semibold">
                    {serviceName || "Applicant Information / अर्जदाराचे माहिती"}
                    </CardTitle>
                </CardHeader>

                <CardContent className="p-4 sm:p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                        <Label required text="Zone" />
                        <span>:</span>
                      </div>
                      <Select
                        value={values.zoneId}
                        onValueChange={(value) => setFieldValue("zoneId", value)}
                      >
                        <SelectTrigger className="w-full h-9">
                          <SelectValue placeholder="-- Select Zone --" />
                        </SelectTrigger>
                        <SelectContent>
                          {zones.map((zone) => (
                            <SelectItem
                              key={zone.WARDID || zone.ZONEID}
                              value={String(zone.WARDID || zone.ZONEID)}
                            >
                              {zone.WARDNAME || zone.ZONENAME}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 hidden">
                      <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                        <Label text="Ward No" />
                        <span>:</span>
                      </div>
                      <Select
                        value={values.wardNo}
                        onValueChange={(value) => setFieldValue("wardNo", value)}
                      >
                        <SelectTrigger className="w-full h-9">
                          <SelectValue placeholder="-- Select Ward --" />
                        </SelectTrigger>
                        <SelectContent>
                        </SelectContent>
                      </Select>
                    </div>

                    {showPropertyNo && (
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                          <Label required text="Property No" />
                          <span>:</span>
                        </div>
                        <Input
                          name="propertyNo"
                          value={values.propertyNo}
                          onChange={handleChange}
                          className="w-full h-9"
                          placeholder="Enter Property No"
                        />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                        <Label required text="First Name" />
                        <span>:</span>
                      </div>
                      <Input
                        name="firstName"
                        value={values.firstName}
                        onChange={handleChange}
                        className="w-full h-9"
                        placeholder="Enter First Name"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                        <Label required text="Middle Name" />
                        <span>:</span>
                      </div>
                      <Input
                        name="middleName"
                        value={values.middleName}
                        onChange={handleChange}
                        className="w-full h-9"
                        placeholder="Enter Middle Name"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                        <Label required text="Last Name" />
                        <span>:</span>
                      </div>
                      <Input
                        name="lastName"
                        value={values.lastName}
                        onChange={handleChange}
                        className="w-full h-9"
                        placeholder="Enter Last Name"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                        <Label required text="प्रथम नाव" />
                        <span>:</span>
                      </div>
                      <Input
                        name="firstNameM"
                        value={values.firstNameM}
                        onChange={handleChange}
                        className="w-full h-9"
                        placeholder="प्रथम नाव (मराठी)"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                        <Label required text="मधले नाव" />
                        <span>:</span>
                      </div>
                      <Input
                        name="middleNameM"
                        value={values.middleNameM}
                        onChange={handleChange}
                        className="w-full h-9"
                        placeholder="मधले नाव (मराठी)"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                        <Label required text="आडनाव" />
                        <span>:</span>
                      </div>
                      <Input
                        name="lastNameM"
                        value={values.lastNameM}
                        onChange={handleChange}
                        className="w-full h-9"
                        placeholder="आडनाव (मराठी)"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                        <Label text="Mobile No" />
                        <span>:</span>
                      </div>
                      <Input
                        name="mobileNo"
                        value={values.mobileNo}
                        onChange={handleChange}
                        className="w-full h-9"
                        placeholder="Enter Mobile No"
                        maxLength={10}
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                        <Label text="Aadhar No" />
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
                        placeholder="Enter Aadhar No"
                        maxLength={12}
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                        <Label text="Email" />
                        <span>:</span>
                      </div>
                      <Input
                        name="email"
                        value={values.email}
                        onChange={handleChange}
                        className="w-full h-9"
                        placeholder="Enter Email"
                        type="email"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                        <Label required text="Address" />
                        <span>:</span>
                      </div>
                      <Input
                        name="address"
                        value={values.address}
                        onChange={handleChange}
                        className="w-full h-9"
                        placeholder="Enter Address"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                        <Label required text="पत्ता" />
                        <span>:</span>
                      </div>
                      <Input
                        name="addressM"
                        value={values.addressM}
                        onChange={handleChange}
                        className="w-full h-9"
                        placeholder="पत्ता (मराठी)"
                      />
                    </div>
                  </div>

                  {showWaterSewerage && (
                    <>
                      <hr />
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                            <Label required text="पृष्ठभागाचा प्रकार" />
                            <span>:</span>
                          </div>
                          <Select
                            value={values.waterSewerageType}
                            onValueChange={(value) => setFieldValue("waterSewerageType", value)}
                          >
                            <SelectTrigger className="w-full h-9">
                              <SelectValue placeholder="-- Select Type --" />
                            </SelectTrigger>
                            <SelectContent>
                              {waterSewerageTypes.map((type) => (
                                <SelectItem
                                  key={type.NUM_WTSEWARAGE_ID}
                                  value={String(type.NUM_WTSEWARAGE_ID)}
                                >
                                  {type.VAR_WTSEWARAGE_NAME}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </>
                  )}


                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                        <Label required text="Purpose" />
                        <span>:</span>
                      </div>
                      <Input
                        name="purpose"
                        value={values.purpose}
                        onChange={handleChange}
                        className="w-full h-9"
                        placeholder="Enter Purpose"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="sm:w-32 shrink-0 flex justify-start sm:justify-between items-center">
                        <Label required text="उद्देश" />
                        <span>:</span>
                      </div>
                      <Input
                        name="purposeM"
                        value={values.purposeM}
                        onChange={handleChange}
                        className="w-full h-9"
                        placeholder="उद्देश (मराठी)"
                      />
                    </div>
                  </div>

                  <hr />

                  {
                    tableData.length > 0 && (
                        <div className="overflow-x-auto">
                            <ShadCNTable
                                headers={headers}
                                data={tableData.map((item) => ({
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
                                }))}
                                keyMapping={keyMapping}
                                pagination={false}
                                className="max-md:min-w-380"
                            />
                        </div>
                    )
                  }

                  <div className="flex justify-center items-center gap-3 pt-4">
                    <Button
                      type="submit"
                      className="bg-blue-900 hover:bg-blue-800 text-white"
                      disabled={loading || isSubmitting}
                    >
                      {loading || isSubmitting ? "Submitting..." : "Submit"}
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
        );
      }}
    </Formik>
  );
};

export default Step0;